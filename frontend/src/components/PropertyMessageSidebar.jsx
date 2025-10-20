import React, { useState, useEffect } from "react";
import API from "../api/axios";

// Helper for user initials/avatar fallback
function getInitials(name) {
  return name
    ? name
        .split(" ")
        .map(w => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AG";
}

export default function PropertyMessageSidebar({ propertyId, seller, userId }) {
  const [message, setMessage] = useState("");
  const [messageStatus, setMessageStatus] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch message thread between current user and seller for this property
  useEffect(() => {
    setLoading(true);
    API.get(`/properties/${propertyId}/messages/${userId}`)
      .then(({ data }) => setMessages(data.data || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [propertyId, userId]);

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    setMessageStatus("");
    if (!message) return;
    try {
      await API.post(`/properties/${propertyId}/contact`, { message });
      setMessageStatus("Message sent!");
      setMessage("");
      // Refresh message thread
      const { data } = await API.get(`/properties/${propertyId}/messages/${userId}`);
      setMessages(data.data || []);
    } catch (err) {
      setMessageStatus("Failed to send. Try again.");
    }
  };

  return (
    <div className="marketplace-details-agent">
      <div className="marketplace-details-agentwrap">
        <div className="marketplace-details-agentinfo">
          {seller?.photo ? (
            <img
              src={seller.photo}
              alt={seller.name}
              className="marketplace-details-agentavatar"
            />
          ) : (
            <div className="marketplace-details-agentavatar-fallback">
              {getInitials(seller?.name)}
            </div>
          )}
          <div className="marketplace-details-agentname">
            {seller?.name || "Agent"}
          </div>
        </div>
        <h3 className="marketplace-details-agenttitle">Send message to the seller</h3>
        <form className="marketplace-details-agentform" onSubmit={handleSend}>
          <textarea
            placeholder="Write a message to the seller..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={3}
          />
          <button
            type="submit"
            className="marketplace-details-agentbtn"
            disabled={!message}
          >
            Send
          </button>
          {messageStatus && (
            <div className="marketplace-details-agentstatus">{messageStatus}</div>
          )}
        </form>
        <div className="marketplace-details-messages">
          <div className="marketplace-details-messages-title">Messages</div>
          {loading ? (
            <div className="marketplace-details-messages-loading">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="marketplace-details-messages-empty">No messages yet.</div>
          ) : (
            <div className="marketplace-details-messages-list">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`marketplace-details-message-bubble ${
                    msg.sender_id === userId ? "mine" : "seller"
                  }`}
                >
                  {msg.message}
                  <span className="marketplace-details-message-date">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}