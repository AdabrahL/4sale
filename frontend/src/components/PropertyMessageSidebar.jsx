import React, { useState, useEffect } from "react";
import API from "../api/axios";
import { getPhotoUrl } from "../utils/getPhotoUrl";

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

export default function PropertyMessageSidebar({
  propertyId,
  seller,        // can be undefined or only {id}
  userId,
  isOwner
}) {
  const [message, setMessage] = useState("");
  const [messageStatus, setMessageStatus] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [sellerProfile, setSellerProfile] = useState(seller);

  // Fetch seller's full profile if not fully provided
  useEffect(() => {
    if (seller && seller.id && (!seller.photo || !seller.name || !seller.phone)) {
      API.get(`/users/${seller.id}`)
        .then(({ data }) => setSellerProfile(data.user || data.data || data))
        .catch(() => setSellerProfile(seller));
    } else if (seller) {
      setSellerProfile(seller);
    }
  }, [seller]);

  // Fetch message thread between current user and seller for this property
  useEffect(() => {
    if (!propertyId || !userId || isOwner) return;
    setLoading(true);
    API.get(`/properties/${propertyId}/messages/${userId}`)
      .then(({ data }) => setMessages(data.data || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [propertyId, userId, isOwner]);

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    setMessageStatus("");
    if (!message) return;
    try {
      await API.post(`/properties/${propertyId}/contact`, { message });
      setMessageStatus("Message sent!");
      setMessage("");
      const { data } = await API.get(`/properties/${propertyId}/messages/${userId}`);
      setMessages(data.data || []);
    } catch (err) {
      setMessageStatus("Failed to send. Try again.");
    }
  };

  // --- Agent Info Card (ALWAYS SHOW) ---
  const agentInfo = (
    <div className="marketplace-details-agentinfo" style={{marginBottom: 16, textAlign: "center"}}>
      {sellerProfile?.photo ? (
        <img
          src={getPhotoUrl(sellerProfile.photo)}
          alt={sellerProfile.name}
          className="marketplace-details-agentavatar"
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid #0c5904",
            background: "#fff"
          }}
        />
      ) : (
        <div className="marketplace-details-agentavatar-fallback"
          style={{
            width: 56, height: 56, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center",
            background: "#e2efe4", color: "#0c5904", borderRadius: "50%", border: "2px solid #0c5904"
          }}>
          {getInitials(sellerProfile?.name)}
        </div>
      )}
      <div className="marketplace-details-agentname" style={{marginTop: 8, fontWeight: 600, color: "#0c5904", fontSize: "1.13em"}}>
        {sellerProfile?.name || "Agent"}
      </div>
      {/* Show contact button */}
      {sellerProfile?.phone && (
        <div style={{marginTop: 10}}>
          {!showContact ? (
            <button
              className="btn btn-green btn-sm"
              style={{margin: "0 auto", display: "block"}}
              onClick={() => setShowContact(true)}
              type="button"
            >
              <i className="fa fa-phone"></i> Show contact
            </button>
          ) : (
            <div
              className="marketplace-details-agent-contact"
              style={{
                marginTop: 5,
                color: "#0c5904",
                fontWeight: "bold",
                fontSize: "1.05em",
                background: "#e2efe4",
                padding: "6px 18px",
                borderRadius: "8px",
                display: "inline-block"
              }}
            >
              <i className="fa fa-phone" style={{marginRight: 6}}></i>
              {sellerProfile.phone}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // --- Owner notice ---
  if (isOwner) {
    return (
      <div className="marketplace-details-agent">
        <div className="marketplace-details-agentwrap">
          {agentInfo}
          <div className="marketplace-details-owner-msg" style={{marginTop: 14}}>
            <i className="fa fa-info-circle" style={{ color: "#0c5904", marginRight: 6 }}></i>
            <span>
              This is your property listing. You cannot send messages to yourself.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- Regular user view: message form and chat history ---
  return (
    <div className="marketplace-details-agent">
      <div className="marketplace-details-agentwrap">
        {agentInfo}
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