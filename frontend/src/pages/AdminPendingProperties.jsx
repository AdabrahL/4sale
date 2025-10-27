import { useEffect, useState } from "react";
import API from "../api/axios"; // your axios instance configured with baseURL and auth headers


export default function AdminPendingProperties() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);

 // (only the modified fetchPending part shown)
const fetchPending = async () => {
  setLoading(true);
  try {
    const res = await API.get("/admin/properties/pending");
    setPending(res.data.data || res.data || []);
  } catch (err) {
    console.error("Pending fetch error:", err.response?.status, err.response?.data || err.message || err);
    setError("Failed to load pending properties");
    setPending([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchPending();
    // eslint-disable-next-line
  }, []);

  const handleApprove = async (propertyId) => {
    setProcessingId(propertyId);
    try {
      await API.post(`/admin/properties/${propertyId}/approve`);
      // remove from list
      setPending(pending.filter(p => p.id !== propertyId));
    } catch (err) {
      setError("Failed to approve property");
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (property) => {
    setSelected(property);
    setRejectReason("");
  };

  const handleReject = async () => {
    if (!selected) return;
    setProcessingId(selected.id);
    try {
      await API.post(`/admin/properties/${selected.id}/reject`, { reason: rejectReason });
      setPending(pending.filter(p => p.id !== selected.id));
      setSelected(null);
    } catch (err) {
      setError("Failed to reject property");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="admin-pending-page container">
      <div className="admin-header">
        <h2>Pending Property Approvals</h2>
        <p className="muted">Approve or reject submitted property listings.</p>
      </div>

      {loading ? (
        <div className="admin-loading">Loading pending properties...</div>
      ) : pending.length === 0 ? (
        <div className="admin-empty">No pending properties.</div>
      ) : (
        <div className="pending-grid">
          {pending.map((p) => (
            <div key={p.id} className="pending-card">
              <div className="pending-img" style={{
                backgroundImage: `url(${(p.images && p.images[0]) || "/img/default.jpg"})`
              }} />
              <div className="pending-body">
                <h3 className="pending-title">{p.title}</h3>
                <div className="pending-meta">
                  <span className="price">₵{Number(p.price).toLocaleString()}</span>
                  <span className="location">{p.location}</span>
                </div>
                <p className="pending-desc">{p.description?.slice(0, 140)}</p>
                <div className="pending-actions">
                  <button
                    className="btn btn-approve"
                    onClick={() => handleApprove(p.id)}
                    disabled={processingId === p.id}
                  >
                    {processingId === p.id ? "Approving..." : "Approve"}
                  </button>
                  <button
                    className="btn btn-reject"
                    onClick={() => openRejectModal(p)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>Reject Property: {selected.title}</h4>
            <textarea
              placeholder="Provide a reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn btn-reject" onClick={handleReject} disabled={processingId === selected.id}>
                {processingId === selected.id ? "Rejecting..." : "Reject Listing"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="admin-error">{error}</div>}
    </div>
  );
}