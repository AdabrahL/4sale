import { useEffect, useState } from "react";
import API from "../api/axios";

const MessageThread = ({ propertyId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");

  useEffect(() => {
    API.get(`/properties/${propertyId}/messages/${userId}`)
      .then(({ data }) => {
        setMessages(data.data || []);
        setLoading(false);
      });
  }, [propertyId, userId]);

  const handleReply = async () => {
    await API.post(`/messages/${messages[messages.length-1].id}/reply`, { message: reply });
    setReply("");
    // Refresh thread
    API.get(`/properties/${propertyId}/messages/${userId}`)
      .then(({ data }) => {
        setMessages(data.data || []);
      });
  };

  if (loading) return <div>Loading thread...</div>;

  return (
    <div className="message-thread">
      <h3>Conversation</h3>
      {messages.map(msg => (
        <div key={msg.id} className={msg.sender.id === userId ? "msg-out" : "msg-in"}>
          <strong>{msg.sender.name}:</strong> {msg.message}
          <div className="msg-date">{msg.created_at}</div>
        </div>
      ))}
      <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." />
      <button onClick={handleReply} disabled={!reply}>Send Reply</button>
    </div>
  );
};

export default MessageThread;