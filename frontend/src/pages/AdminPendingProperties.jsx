import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios"; // your axios instance configured with baseURL and auth headers
import "../styles/admin-pending.css";


export default function AdminPendingProperties() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0
  });

 // (only the modified fetchPending part shown)
const fetchPending = async () => {
  setLoading(true);
  try {
    const res = await API.get("/admin/properties/pending");
    const data = res.data.data || res.data || [];
    setPending(data);
    
    // Calculate stats
    const now = new Date();
    const today = data.filter(p => {
      const created = new Date(p.created_at);
      return created.toDateString() === now.toDateString();
    }).length;
    
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = data.filter(p => {
      const created = new Date(p.created_at);
      return created >= weekAgo;
    }).length;
    
    setStats({
      total: data.length,
      today,
      thisWeek
    });
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
    <div className="admin-dashboard-wrap">
      {/* Dashboard Header */}
      <div className="admin-dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Pending Approvals Dashboard</h1>
            <p className="header-subtitle">Review and manage property submissions</p>
          </div>
          <div className="header-actions">
            <Link to="/profile" className="btn-header-action">
              <i className="fa fa-arrow-left"></i> Back to Dashboard
            </Link>
            <Link to="/properties" className="btn-header-primary">
              <i className="fa fa-building"></i> View All Properties
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-row">
        <div className="admin-stat-card total">
          <div className="stat-icon">
            <i className="fa fa-clock"></i>
          </div>
          <div className="stat-details">
            <h3>{stats.total}</h3>
            <p>Total Pending</p>
          </div>
        </div>

        <div className="admin-stat-card today">
          <div className="stat-icon">
            <i className="fa fa-calendar-day"></i>
          </div>
          <div className="stat-details">
            <h3>{stats.today}</h3>
            <p>Submitted Today</p>
          </div>
        </div>

        <div className="admin-stat-card week">
          <div className="stat-icon">
            <i className="fa fa-calendar-week"></i>
          </div>
          <div className="stat-details">
            <h3>{stats.thisWeek}</h3>
            <p>This Week</p>
          </div>
        </div>

        <div className="admin-stat-card action">
          <div className="stat-icon">
            <i className="fa fa-check-circle"></i>
          </div>
          <div className="stat-details">
            <h3>Quick</h3>
            <p>Action Required</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main-content">
        {error && (
          <div className="admin-alert error">
            <i className="fa fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {loading ? (
          <div className="admin-loading-state">
            <div className="loading-spinner"></div>
            <p>Loading pending properties...</p>
          </div>
        ) : pending.length === 0 ? (
          <div className="admin-empty-state">
            <div className="empty-icon">
              <i className="fa fa-check-double"></i>
            </div>
            <h3>All Caught Up! 🎉</h3>
            <p>No pending properties to review at the moment.</p>
            <Link to="/properties" className="btn-empty-action">
              <i className="fa fa-building"></i> View All Properties
            </Link>
          </div>
        ) : (
          <>
            <div className="content-header">
              <h2>Pending Properties ({pending.length})</h2>
              <div className="filter-actions">
                <button className="filter-btn active">
                  <i className="fa fa-list"></i> All
                </button>
                <button className="filter-btn">
                  <i className="fa fa-home"></i> Residential
                </button>
                <button className="filter-btn">
                  <i className="fa fa-building"></i> Commercial
                </button>
              </div>
            </div>

            <div className="pending-grid">
              {pending.map((p) => (
                <div key={p.id} className="pending-card">
                  <div className="card-badge">PENDING</div>
                  <div className="pending-img" style={{
                    backgroundImage: `url(${(p.images && p.images[0]) || "/img/default.jpg"})`
                  }}>
                    <div className="img-overlay">
                      <span className="property-type">{p.type || "Property"}</span>
                    </div>
                  </div>
                  <div className="pending-body">
                    <h3 className="pending-title">{p.title}</h3>
                    <div className="pending-meta">
                      <div className="meta-item price">
                        <i className="fa fa-tag"></i>
                        <span>₵{Number(p.price).toLocaleString()}</span>
                      </div>
                      <div className="meta-item location">
                        <i className="fa fa-map-marker-alt"></i>
                        <span>{p.location}</span>
                      </div>
                    </div>
                    <p className="pending-desc">{p.description?.slice(0, 120)}...</p>
                    
                    <div className="property-details">
                      <div className="detail-item">
                        <i className="fa fa-user"></i>
                        <span>Agent ID: {p.user_id}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fa fa-calendar"></i>
                        <span>{new Date(p.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="pending-actions">
                      <button
                        className="btn btn-approve"
                        onClick={() => handleApprove(p.id)}
                        disabled={processingId === p.id}
                      >
                        {processingId === p.id ? (
                          <>
                            <i className="fa fa-spinner fa-spin"></i> Approving...
                          </>
                        ) : (
                          <>
                            <i className="fa fa-check"></i> Approve
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-reject"
                        onClick={() => openRejectModal(p)}
                        disabled={processingId === p.id}
                      >
                        <i className="fa fa-times"></i> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Reject modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Reject Property</h4>
              <button className="modal-close" onClick={() => setSelected(null)}>
                <i className="fa fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="property-preview">
                <strong>{selected.title}</strong>
                <span className="preview-location">{selected.location}</span>
              </div>
              <label className="modal-label">Rejection Reason (Optional)</label>
              <textarea
                className="modal-textarea"
                placeholder="Explain why this property is being rejected. This will help the agent improve their submission."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="5"
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>
                Cancel
              </button>
              <button 
                className="btn btn-reject-confirm" 
                onClick={handleReject} 
                disabled={processingId === selected.id}
              >
                {processingId === selected.id ? (
                  <>
                    <i className="fa fa-spinner fa-spin"></i> Rejecting...
                  </>
                ) : (
                  <>
                    <i className="fa fa-times-circle"></i> Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}