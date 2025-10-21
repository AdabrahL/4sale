import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import { getPhotoUrl } from "../utils/getPhotoUrl"; // <-- Add this import

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
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
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef();

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
    let interval;
    async function fetchMessages() {
      if (!selectedThread) return;
      setLoadingMessages(true);
      try {
        const resp = await API.get(
          `/properties/${selectedThread.property_id}/messages/${selectedThread.otherId}`
        );
        setMessages(resp.data.data || []);
      } catch {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    }
    fetchMessages();
    interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
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
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedThread) return;
    setSending(true);
    try {
      if (user.id === selectedThread.property.user_id) {
        const lastMsgFromOther = messages
          .filter(m => m.sender_id === selectedThread.otherId)
          .slice(-1)[0];
        if (!lastMsgFromOther) {
          alert("No message to reply to. Wait for a message from the client first.");
        } else {
          await API.post(`/messages/${lastMsgFromOther.id}/reply`, { message });
        }
      } else {
        await API.post(
          `/properties/${selectedThread.property_id}/contact`,
          { message }
        );
      }
      setMessage("");
      const resp = await API.get(
        `/properties/${selectedThread.property_id}/messages/${selectedThread.otherId}`
      );
      setMessages(resp.data.data || []);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        alert(err.response.data.error || "Forbidden");
      } else {
        alert("Failed to send message.");
      }
    } finally {
      setSending(false);
    }
  };

  if (!user || !user.id) {
    return <div className="messenger-loading">Loading user...</div>;
  }

  return (
    <div className="messenger-layout">
      <aside className="messenger-sidebar">
        <div className="messenger-sidebar-header">Chats</div>
        {loadingThreads ? (
          <div className="messenger-loading">Loading threads...</div>
        ) : threads.length === 0 ? (
          <div className="messenger-empty">No messages yet.</div>
        ) : (
          <ul className="messenger-thread-list">
            {threads.map((thread) => {
              const isActive =
                selectedThread &&
                selectedThread.property_id === thread.property_id &&
                selectedThread.otherId === thread.otherId;
              return (
                <li
                  key={`${thread.property_id}-${thread.otherId}`}
                  className={`messenger-thread-item ${isActive ? "active" : ""}`}
                  onClick={() => handleSelectThread(thread)}
                >
                  <div className="messenger-avatar">
                    {thread.sender_id === user.id
                      ? (thread.receiver?.photo
                          ? <img src={getPhotoUrl(thread.receiver.photo)} alt={thread.receiver.name} />
                          : <span className="avatar-fallback">{getInitials(thread.receiver?.name)}</span>)
                      : (thread.sender?.photo
                          ? <img src={getPhotoUrl(thread.sender.photo)} alt={thread.sender.name} />
                          : <span className="avatar-fallback">{getInitials(thread.sender?.name)}</span>)
                    }
                  </div>
                  <div className="messenger-thread-meta">
                    <div className="messenger-thread-name">
                      {thread.sender_id === user.id ? thread.receiver?.name : thread.sender?.name}
                    </div>
                    <div className="messenger-thread-title">
                      {thread.property?.title || "Property"}
                    </div>
                    <div className="messenger-thread-preview">
                      {thread.message.length > 45 ? thread.message.slice(0, 45) + "..." : thread.message}
                    </div>
                  </div>
                  {!thread.is_read && <span className="messenger-unread-dot"></span>}
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      <main className="messenger-main">
        {!selectedThread ? (
          <div className="messenger-placeholder">
            <h3>Select a chat to view messages</h3>
          </div>
        ) : (
          <div className="messenger-convo">
            <div className="messenger-convo-header">
              <div className="messenger-avatar-lg">
                {selectedThread.user?.photo ? (
                  <img src={getPhotoUrl(selectedThread.user.photo)} alt={selectedThread.user.name} />
                ) : (
                  <span className="avatar-fallback-lg">{getInitials(selectedThread.user?.name)}</span>
                )}
              </div>
              <div>
                <div className="messenger-convo-name">{selectedThread.user?.name}</div>
                <div className="messenger-convo-title">{selectedThread.property?.title}</div>
              </div>
            </div>
            <div className="messenger-convo-body">
              {loadingMessages ? (
                <div className="messenger-loading">Loading messages...</div>
              ) : (
                <div className="messenger-messages">
                  {messages.length === 0 ? (
                    <div className="messenger-empty">No messages yet.</div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`messenger-bubble ${msg.sender_id === user.id ? "mine" : "other"}`}
                      >
                        <div className="messenger-bubble-content">
                          <div className="messenger-bubble-text">{msg.message}</div>
                          <div className="messenger-bubble-date">
                            {formatTime(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef}></div>
                </div>
              )}
            </div>
            <form className="messenger-form" onSubmit={handleSend}>
              <textarea
                placeholder="Type your message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={2}
                required
              />
              <button type="submit" disabled={!message.trim() || sending}>
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}