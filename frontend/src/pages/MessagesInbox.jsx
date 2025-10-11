import { useEffect, useState } from "react";
import API from "../api/axios";

const MessagesInbox = () => {
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [reply, setReply] = useState("");
  const [replyStatus, setReplyStatus] = useState("");

  useEffect(() => {
    API.get("/messages/inbox")
      .then(({ data }) => {
        setInbox(data.data || []);
        setLoading(false);
      });
  }, []);

  const openReply = (msg) => {
    setSelectedMsg(msg);
    setReply("");
    setReplyStatus("");
  };

  const handleReply = async () => {
    try {
      await API.post(`/messages/${selectedMsg.id}/reply`, { message: reply });
      setReplyStatus("Reply sent!");
      setReply("");
      // Optionally refresh inbox or message thread here
    } catch (err) {
      setReplyStatus("Failed to send reply.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Messages Inbox</h2>
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>From</th>
            <th>Message</th>
            <th>Date</th>
            <th>Reply</th>
          </tr>
        </thead>
        <tbody>
          {inbox.map(msg => (
            <tr key={msg.id}>
              <td>{msg.property.title}</td>
              <td>{msg.sender.name}</td>
              <td>{msg.message}</td>
              <td>{msg.created_at}</td>
              <td>
                <button onClick={() => openReply(msg)}>Reply</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedMsg && (
        <div className="reply-modal">
          <h3>Reply to: {selectedMsg.sender.name}</h3>
          <div>
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              rows={3}
              placeholder="Type your reply..."
            />
          </div>
          <button onClick={handleReply} disabled={!reply}>Send Reply</button>
          <button onClick={() => setSelectedMsg(null)}>Cancel</button>
          {replyStatus && <div>{replyStatus}</div>}
        </div>
      )}
    </div>
  );
};

export default MessagesInbox;