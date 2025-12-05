import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { getPhotoUrl } from "../utils/getPhotoUrl";
import CallModal from "../components/CallModal";
import "../styles/messenger.css";

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatMessageTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name) {
  return name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AG";
}

function groupThreads(messages, myId) {
  if (!myId) return [];
  const threads = {};
  messages.forEach(msg => {
    const otherId = (msg.sender_id === myId) ? msg.receiver_id : msg.sender_id;
    const threadKey = `${msg.property_id}-${otherId}`;
    if (!threads[threadKey] || new Date(msg.created_at) > new Date(threads[threadKey].created_at)) {
      threads[threadKey] = { ...msg, otherId };
    }
  });
  return Object.values(threads).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export default function Messenger() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState('video');
  const [incomingCall, setIncomingCall] = useState(null);
  const messagesEndRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    async function fetchThreads() {
      setLoadingThreads(true);
      try {
        const inbox = await API.get("/messages/inbox");
        const sent = await API.get("/messages/sent");
        const all = [...(inbox.data.data || []), ...(sent.data.data || [])];
        setThreads(groupThreads(all, user?.id));
      } catch {
        setThreads([]);
      } finally {
        setLoadingThreads(false);
      }
    }
    if (user && user.id) fetchThreads();
  }, [user]);

  useEffect(() => {
    async function fetchMessages() {
      if (!selectedThread) return;
      setLoadingMessages(true);
      try {
        const resp = await API.get(
          `/properties/${selectedThread.property_id}/messages/${selectedThread.otherId}`
        );
        setMessages(resp.data.data || []);
        
        // Refresh unread count after viewing thread (messages are marked as read by backend)
        window.dispatchEvent(new Event('refreshUnreadCount'));
      } catch {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    }
    fetchMessages();
  }, [selectedThread]);

  useEffect(() => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectThread = (thread) => {
    setSelectedThread({
      property_id: thread.property_id,
      otherId: thread.otherId,
      property: thread.property,
      user: thread.sender_id === user.id ? thread.receiver : thread.sender
    });
    setMessages([]);
    setMessage("");
    setAttachedFile(null);
    setPreviewUrl(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      // Check file type
      const allowedTypes = ['image/', 'video/'];
      const isAllowed = allowedTypes.some(type => file.type.startsWith(type));
      
      if (!isAllowed) {
        alert('Only images and videos are allowed');
        return;
      }

      setAttachedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !attachedFile) || !selectedThread) return;
    setSending(true);
    
    // Optimistically add message to UI immediately
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      message: message.trim() || (attachedFile ? `[${attachedFile.type.startsWith('image/') ? 'Image' : 'Video'}]` : ''),
      sender_id: user.id,
      receiver_id: selectedThread.otherId,
      property_id: selectedThread.property_id,
      created_at: new Date().toISOString(),
      is_read: false,
      attachment: attachedFile ? previewUrl : null,
      attachment_type: attachedFile?.type
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    const messageText = message.trim();
    const fileToSend = attachedFile;
    setMessage("");
    removeAttachment();
    
    try {
      // Check if there's an existing message to reply to
      const lastMsgFromOther = messages
        .filter(m => m.sender_id === selectedThread.otherId)
        .slice(-1)[0];
      
      let response;
      
      // Prepare form data if there's a file
      if (fileToSend) {
        const formData = new FormData();
        if (messageText) formData.append('message', messageText);
        formData.append('attachment', fileToSend);
        
        if (lastMsgFromOther) {
          response = await API.post(`/messages/${lastMsgFromOther.id}/reply`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          response = await API.post(`/properties/${selectedThread.property_id}/contact`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      } else {
        // Text-only message
        if (lastMsgFromOther) {
          response = await API.post(`/messages/${lastMsgFromOther.id}/reply`, { message: messageText });
        } else {
          response = await API.post(`/properties/${selectedThread.property_id}/contact`, { message: messageText });
        }
      }
      
      // Replace optimistic message with real one from server
      if (response.data && response.data.data) {
        setMessages(prev => prev.map(msg => 
          msg.id === optimisticMessage.id ? response.data.data : msg
        ));
        
        // Emit socket event to notify receiver
        if (socket) {
          socket.emit('sendMessage', {
            to: selectedThread.otherId,
            message: response.data.data,
            sender: {
              id: user.id,
              name: user.name
            }
          });
        }
      }
    } catch (err) {
      console.error('Send message error:', err);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      setMessage(messageText); // Restore message text
      if (fileToSend) {
        setAttachedFile(fileToSend);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(fileToSend);
      }
      
      if (err.response && err.response.status === 403) {
        alert(err.response.data.error || "Forbidden");
      } else if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to send message. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  const handlePhoneCall = () => {
    if (!selectedThread || !selectedThread.user || !socket) return;
    
    setCallType('audio');
    setShowCallModal(true);
  };

  const handleVideoCall = () => {
    if (!selectedThread || !selectedThread.user || !socket) return;
    
    setCallType('video');
    setShowCallModal(true);
  };

  // Listen for incoming calls
  useEffect(() => {
    if (!socket) return;

    socket.on('incomingCall', ({ from, callType, signal }) => {
      setIncomingCall({ from, callType, signal });
    });

    return () => {
      socket.off('incomingCall');
    };
  }, [socket]);

  const acceptCall = () => {
    setCallType(incomingCall.callType);
    setShowCallModal(true);
    setIncomingCall(null);
  };

  const declineCall = () => {
    if (socket && incomingCall) {
      socket.emit('declineCall', { to: incomingCall.from.id });
    }
    setIncomingCall(null);
  };

  const filteredThreads = threads.filter(thread => {
    const otherUser = thread.sender_id === user.id ? thread.receiver : thread.sender;
    const userName = otherUser?.name?.toLowerCase() || '';
    const propertyTitle = thread.property?.title?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return userName.includes(query) || propertyTitle.includes(query);
  });

  if (!user || !user.id) {
    return (
      <div className="messenger-container">
        <div className="messenger-loading">
          <i className="fa fa-spin fa-spinner"></i>
          <p>Loading user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messenger-container">
      {/* Incoming Call Notification */}
      {incomingCall && (
        <div className="incoming-call-notification">
          <div className="incoming-call-content">
            <img 
              src={incomingCall.from.photo ? getPhotoUrl(incomingCall.from.photo) : '/default-avatar.png'} 
              alt={incomingCall.from.name}
              className="incoming-call-avatar"
            />
            <div className="incoming-call-info">
              <h4>{incomingCall.from.name}</h4>
              <p>Incoming {incomingCall.callType} call...</p>
            </div>
            <div className="incoming-call-actions">
              <button className="accept-call-btn" onClick={acceptCall}>
                <i className="fa fa-phone"></i> Accept
              </button>
              <button className="decline-call-btn" onClick={declineCall}>
                <i className="fa fa-phone"></i> Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Modal */}
      {showCallModal && selectedThread && socket && (
        <CallModal
          isOpen={showCallModal}
          onClose={() => setShowCallModal(false)}
          callType={callType}
          otherUser={selectedThread.user}
          socket={socket}
          isInitiator={!incomingCall}
          signal={incomingCall?.signal}
        />
      )}

      <div className="messenger-layout">
        {/* Sidebar */}
        <aside className="messenger-sidebar">
          <div className="messenger-sidebar-header">
            <h2>Messages</h2>
            <div className="messenger-header-actions">
              <button className="messenger-icon-btn" title="New message">
                <i className="fa fa-edit"></i>
              </button>
            </div>
          </div>
          
          <div className="messenger-search">
            <i className="fa fa-search"></i>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loadingThreads ? (
            <div className="messenger-loading">
              <i className="fa fa-spin fa-spinner"></i>
              <p>Loading conversations...</p>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="messenger-empty">
              <i className="fa fa-comments"></i>
              <p>{searchQuery ? 'No conversations found' : 'No messages yet'}</p>
            </div>
          ) : (
            <ul className="messenger-thread-list">
              {filteredThreads.map((thread) => {
                const isActive =
                  selectedThread &&
                  selectedThread.property_id === thread.property_id &&
                  selectedThread.otherId === thread.otherId;
                const otherUser = thread.sender_id === user.id ? thread.receiver : thread.sender;
                
                return (
                  <li
                    key={`${thread.property_id}-${thread.otherId}`}
                    className={`messenger-thread-item ${isActive ? "active" : ""} ${!thread.is_read ? "unread" : ""}`}
                    onClick={() => handleSelectThread(thread)}
                  >
                    <div className="messenger-avatar">
                      {otherUser?.photo ? (
                        <img src={getPhotoUrl(otherUser.photo)} alt={otherUser.name} />
                      ) : (
                        <span className="avatar-fallback">{getInitials(otherUser?.name)}</span>
                      )}
                      <span className="messenger-online-indicator"></span>
                    </div>
                    <div className="messenger-thread-content">
                      <div className="messenger-thread-top">
                        <div className="messenger-thread-name">{otherUser?.name}</div>
                        <div className="messenger-thread-time">{formatTime(thread.created_at)}</div>
                      </div>
                      <div className="messenger-thread-property">
                        <i className="fa fa-home"></i>
                        {thread.property?.title || "Property"}
                      </div>
                      <div className="messenger-thread-preview">
                        {thread.message.length > 50 ? thread.message.slice(0, 50) + "..." : thread.message}
                      </div>
                    </div>
                    {!thread.is_read && <span className="messenger-unread-badge">•</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Main Chat Area */}
        <main className="messenger-main">
          {!selectedThread ? (
            <div className="messenger-placeholder">
              <div className="messenger-placeholder-icon">
                <i className="fa fa-comments"></i>
              </div>
              <h3>Your Messages</h3>
              <p>Select a conversation to start messaging</p>
            </div>
          ) : (
            <div className="messenger-conversation">
              {/* Conversation Header */}
              <div className="messenger-conversation-header">
                <div className="messenger-conversation-user">
                  <div className="messenger-avatar-lg">
                    {selectedThread.user?.photo ? (
                      <img src={getPhotoUrl(selectedThread.user.photo)} alt={selectedThread.user.name} />
                    ) : (
                      <span className="avatar-fallback-lg">{getInitials(selectedThread.user?.name)}</span>
                    )}
                    <span className="messenger-online-indicator-lg"></span>
                  </div>
                  <div className="messenger-conversation-info">
                    <div className="messenger-conversation-name">{selectedThread.user?.name}</div>
                    <div className="messenger-conversation-property">
                      <i className="fa fa-home"></i>
                      {selectedThread.property?.title || "Property"}
                    </div>
                  </div>
                </div>
                <div className="messenger-conversation-actions">
                  <button 
                    className="messenger-icon-btn" 
                    title="Call"
                    onClick={handlePhoneCall}
                  >
                    <i className="fa fa-phone"></i>
                  </button>
                  <button 
                    className="messenger-icon-btn" 
                    title="Video call"
                    onClick={handleVideoCall}
                  >
                    <i className="fa fa-video-camera"></i>
                  </button>
                  <button className="messenger-icon-btn" title="More options">
                    <i className="fa fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="messenger-conversation-body">
                {loadingMessages ? (
                  <div className="messenger-loading">
                    <i className="fa fa-spin fa-spinner"></i>
                    <p>Loading messages...</p>
                  </div>
                ) : (
                  <div className="messenger-messages">
                    {messages.length === 0 ? (
                      <div className="messenger-empty">
                        <i className="fa fa-inbox"></i>
                        <p>No messages in this conversation yet</p>
                        <span>Send a message to start the conversation</span>
                      </div>
                    ) : (
                      messages.map((msg, index) => {
                        const isMine = msg.sender_id === user.id;
                        const showAvatar = index === messages.length - 1 || 
                          messages[index + 1].sender_id !== msg.sender_id;
                        
                        return (
                          <div
                            key={msg.id}
                            className={`messenger-message ${isMine ? "mine" : "theirs"}`}
                          >
                            {!isMine && showAvatar && (
                              <div className="messenger-message-avatar">
                                {selectedThread.user?.photo ? (
                                  <img src={getPhotoUrl(selectedThread.user.photo)} alt={selectedThread.user.name} />
                                ) : (
                                  <span className="avatar-fallback-sm">{getInitials(selectedThread.user?.name)}</span>
                                )}
                              </div>
                            )}
                            {!isMine && !showAvatar && <div className="messenger-message-avatar-spacer"></div>}
                            
                            <div className="messenger-message-content">
                              <div className="messenger-bubble">
                                {msg.message && <div className="messenger-bubble-text">{msg.message}</div>}
                                {msg.attachment && (
                                  <div className="messenger-attachment">
                                    {msg.attachment_type?.startsWith('image/') ? (
                                      <img 
                                        src={msg.attachment.startsWith('blob:') || msg.attachment.startsWith('data:') ? msg.attachment : getPhotoUrl(msg.attachment)} 
                                        alt="attachment" 
                                        className="messenger-image"
                                        onClick={(e) => {
                                          // Open image in new tab
                                          window.open(e.target.src, '_blank');
                                        }}
                                        style={{ cursor: 'pointer' }}
                                      />
                                    ) : msg.attachment_type?.startsWith('video/') ? (
                                      <video 
                                        src={msg.attachment.startsWith('blob:') || msg.attachment.startsWith('data:') ? msg.attachment : getPhotoUrl(msg.attachment)} 
                                        controls 
                                        className="messenger-video"
                                        style={{ maxWidth: '100%', borderRadius: '8px' }}
                                      />
                                    ) : (
                                      <a href={msg.attachment} download className="messenger-file">
                                        <i className="fa fa-file"></i>
                                        <span>Download attachment</span>
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="messenger-message-time">{formatMessageTime(msg.created_at)}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef}></div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form className="messenger-input-area" onSubmit={handleSend}>
                <div className="messenger-input-container">
                  <div className="messenger-input-wrapper">
                    <button
                      type="button"
                      className="messenger-attach-btn"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach image or video"
                    >
                      <i className="fa fa-paperclip"></i>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*,video/*"
                      style={{ display: 'none' }}
                    />
                  
                    <div className="messenger-input-with-preview">
                      {attachedFile && (
                        <div className="messenger-attachment-preview-whatsapp">
                          <div className="messenger-preview-thumbnail">
                            {attachedFile.type.startsWith('image/') ? (
                              <img src={previewUrl} alt="preview" />
                            ) : attachedFile.type.startsWith('video/') ? (
                              <video src={previewUrl} />
                            ) : (
                              <div className="file-icon">
                                <i className="fa fa-file"></i>
                              </div>
                            )}
                            <button 
                              type="button" 
                              className="messenger-remove-preview" 
                              onClick={removeAttachment}
                              title="Remove"
                            >
                              <i className="fa fa-times"></i>
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <textarea
                        placeholder={attachedFile ? "Add a caption..." : "Type a message..."}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend(e);
                          }
                        }}
                        rows={1}
                        className="messenger-input"
                      />
                    </div>
                    
                    <button
                      type="button"
                      className="messenger-emoji-btn"
                      title="Add emoji"
                    >
                      <i className="fa fa-smile-o"></i>
                    </button>
                    
                    <button
                      type="submit"
                      className="messenger-send-btn"
                      disabled={(!message.trim() && !attachedFile) || sending}
                    >
                      {sending ? (
                        <i className="fa fa-spin fa-spinner"></i>
                      ) : (
                        <i className="fa fa-paper-plane"></i>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}