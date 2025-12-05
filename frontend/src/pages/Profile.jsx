import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import API from "../api/axios";
import MyProperties from "../components/MyProperties";
import MyBlogs from "../components/MyBlogs";
import "../styles/profile-dashboard.css";


// Helper: get backend url from .env (VITE_BACKEND_URL), fallback to http://backend.test
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";
function getPhotoUrl(photo) {
  if (!photo) return "/default-avatar.png";
  return photo.startsWith("http") ? photo : `${backendUrl}/storage/${photo}`;
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const [localUser, setLocalUser] = useState(user || null);
  const [stats, setStats] = useState({ listings: 0, favorites: 0 });
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    socials: user?.socials || { facebook: "", whatsapp: "", linkedin: "", instagram: "" },
  });

  const [previewUrl, setPreviewUrl] = useState(getPhotoUrl(user?.photo));
  const [imageFile, setImageFile] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false); // if user wants to remove existing photo
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, properties, blogs, boost, admin
  const [pendingCount, setPendingCount] = useState(0);
  const [myProperties, setMyProperties] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [boosting, setBoosting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const fileRef = useRef(null); // single shared ref used by all file inputs

  useEffect(() => {
    setLocalUser(user);
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      socials: user?.socials || { facebook: "", whatsapp: "", linkedin: "", instagram: "" },
    });
    setPreviewUrl(getPhotoUrl(user?.photo));
    setImageFile(null);
    setRemovePhoto(false);
    fetchStats();
    // eslint-disable-next-line
  }, [user, activeTab]);

  async function fetchStats() {
    try {
      const res = await API.get("/my-properties", { params: { page: 1, per_page: 1 } });
      const payload = res.data?.data || res.data;
      const total = payload?.total ?? (Array.isArray(payload) ? payload.length : 0);
      let favCount = 0;
      try {
        const favRes = await API.get("/favorites");
        const favPayload = favRes.data?.data || favRes.data;
        favCount = Array.isArray(favPayload) ? favPayload.length : (favPayload?.total ?? 0);
      } catch {
        favCount = 0;
      }
      
      // Fetch pending count if admin
      if (user?.is_admin) {
        try {
          const pendingRes = await API.get("/admin/properties/pending");
          const pendingData = pendingRes.data?.data || pendingRes.data || [];
          setPendingCount(Array.isArray(pendingData) ? pendingData.length : 0);
        } catch {
          setPendingCount(0);
        }
      }
      
      setStats({ listings: Number(total || 0), favorites: Number(favCount || 0) });
    } catch {
      setStats({ listings: 0, favorites: 0 });
    }
  }

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;
    
    try {
      setBoosting(true);
      setErrorMsg(''); // Clear any previous errors
      
      console.log('Sending boost request:', {
        plan: selectedPlan.duration,
        price: selectedPlan.price,
        payment_method: paymentMethod
      });
      
      // Boost all user properties with the selected plan
      const response = await API.post('/boost-all-properties', {
        plan: selectedPlan.duration,
        price: selectedPlan.price,
        payment_method: paymentMethod
      });
      
      console.log('Boost response:', response.data);
      
      const message = response.data.message || `All your properties have been boosted for ${selectedPlan.duration} days!`;
      
      // Close modal first
      setShowPaymentModal(false);
      setSelectedPlan(null);
      setPaymentMethod('mobile_money');
      
      // Show success message
      setSuccessMsg(message);
      
      // Refresh stats
      fetchStats();
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      console.error("Error boosting properties:", error);
      console.error("Error response:", error.response?.data);
      
      const errorMessage = error.response?.data?.message || "Failed to process payment. Please try again.";
      setErrorMsg(errorMessage);
      
      // Don't close modal on error so user can see the message
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setBoosting(false);
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    setPaymentMethod('mobile_money');
  };

  if (!user) {
    return (
      <div className="profile-wrap">
        <div className="profile-empty-card">
          <h3>Please sign in</h3>
          <p>You need to be signed in to view and edit your profile.</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["facebook", "whatsapp", "linkedin", "instagram"].includes(name)) {
      setForm((p) => ({ ...p, socials: { ...p.socials, [name]: value } }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
    setSuccessMsg("");
    setErrorMsg("");
  };

  // SINGLE handler used by every file input in the UI
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      setErrorMsg("Only JPG, PNG or WEBP images are allowed.");
      return;
    }
    // optional size limit (e.g., 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMsg("Image too large. Maximum 5MB allowed.");
      return;
    }
    setImageFile(file);
    setRemovePhoto(false); // if selecting a file, we aren't removing
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMsg("");
  };

  const handleRemovePhoto = async () => {
    // Clear file input UI and set a flag to remove existing photo on save
    setImageFile(null);
    setPreviewUrl("/default-avatar.png");
    setRemovePhoto(true);
    if (fileRef.current) fileRef.current.value = null;
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("bio", form.bio);
      formData.append("socials", JSON.stringify(form.socials || {}));

      // If removing the current photo, tell the server
      if (removePhoto) {
        formData.append("remove_photo", "1");
      }

      if (imageFile) {
        formData.append("photo", imageFile);
      }

      // If your backend expects PUT/PATCH uncomment and adapt (some setups require _method)
      // formData.append('_method','PUT');

      const res = await API.post("/profile/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      const data = res.data;
      if (data?.user) {
        // Update auth context
        setUser(data.user);
        setLocalUser(data.user);

        // Cache-bust the image url so the new image loads immediately
        const newPhotoUrl = data.user.photo ? `${getPhotoUrl(data.user.photo)}?t=${Date.now()}` : "/default-avatar.png";
        setPreviewUrl(newPhotoUrl);
      }

      setSuccessMsg("Your profile was updated successfully.");
      setEditMode(false);
      setImageFile(null);
      setRemovePhoto(false);
      // Refresh stats
      fetchStats();
    } catch (err) {
      console.error("Profile save error:", err.response?.data || err.message);
      setErrorMsg(err.response?.data?.message || "Failed to save profile. Try again.");
    } finally {
      setSaving(false);
      setUploadProgress(0);
      if (fileRef.current) fileRef.current.value = null;
    }
  };

  const handleCancel = () => {
    setForm({
      name: localUser?.name || "",
      email: localUser?.email || "",
      phone: localUser?.phone || "",
      bio: localUser?.bio || "",
      socials: localUser?.socials || { facebook: "", whatsapp: "", linkedin: "", instagram: "" },
    });
    setPreviewUrl(getPhotoUrl(localUser?.photo));
    setImageFile(null);
    setRemovePhoto(false);
    setErrorMsg("");
    setSuccessMsg("");
    setEditMode(false);
    if (fileRef.current) fileRef.current.value = null;
  };

  return (
    <div className="dashboard-wrap">
      {/* Dashboard Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="brand-icon">
            <img src={previewUrl} alt="avatar" className="sidebar-avatar" />
          </div>
          <div className="brand-info">
            <h3>{localUser?.name}</h3>
            <p>{localUser?.is_admin ? "Administrator" : "Agent"}</p>
          </div>
        </div>

        <nav className="dashboard-nav">
          <button 
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <i className="fa fa-home"></i>
            <span>Overview</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === "properties" ? "active" : ""}`}
            onClick={() => setActiveTab("properties")}
          >
            <i className="fa fa-building"></i>
            <span>My Properties</span>
          </button>

          <button 
            className={`nav-item ${activeTab === "blogs" ? "active" : ""}`}
            onClick={() => setActiveTab("blogs")}
          >
            <i className="fa fa-newspaper"></i>
            <span>My Blogs</span>
          </button>

          <button 
            className={`nav-item ${activeTab === "boost" ? "active" : ""}`}
            onClick={() => setActiveTab("boost")}
          >
            <i className="fa fa-rocket"></i>
            <span>Boost Listings</span>
          </button>

          <Link to="/saved" className="nav-item">
            <i className="fa fa-bookmark"></i>
            <span>Saved</span>
          </Link>

          <Link to="/messenger" className="nav-item">
            <i className="fa fa-envelope"></i>
            <span>Messages</span>
          </Link>

          {localUser?.is_admin && (
            <>
              <div className="nav-divider">Admin Controls</div>
              
              <button 
                className={`nav-item ${activeTab === "admin" ? "active" : ""}`}
                onClick={() => setActiveTab("admin")}
              >
                <i className="fa fa-shield-alt"></i>
                <span>Dashboard</span>
              </button>

              <Link to="/admin/pending" className="nav-item">
                <i className="fa fa-gavel"></i>
                <span>Pending Approvals</span>
                {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
              </Link>

              <Link to="/blog/post" className="nav-item">
                <i className="fa fa-edit"></i>
                <span>Post Blog</span>
              </Link>

              <Link to="/admin/users" className="nav-item">
                <i className="fa fa-users"></i>
                <span>Manage Users</span>
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Dashboard Content */}
      <main className="dashboard-content">
        {successMsg && <div className="dashboard-toast success">{successMsg}</div>}
        {errorMsg && <div className="dashboard-toast error">{errorMsg}</div>}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="dashboard-section">
            <div className="section-header">
              <h1>Dashboard Overview</h1>
              <button className="btn-primary" onClick={() => setEditMode(!editMode)}>
                <i className="fa fa-edit"></i> Edit Profile
              </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue">
                  <i className="fa fa-building"></i>
                </div>
                <div className="stat-info">
                  <h3>{stats.listings}</h3>
                  <p>Total Listings</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">
                  <i className="fa fa-bookmark"></i>
                </div>
                <div className="stat-info">
                  <h3>{stats.favorites}</h3>
                  <p>Saved Properties</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  <i className="fa fa-eye"></i>
                </div>
                <div className="stat-info">
                  <h3>1,234</h3>
                  <p>Total Views</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">
                  <i className="fa fa-star"></i>
                </div>
                <div className="stat-info">
                  <h3>{localUser?.reviews_count ?? 0}</h3>
                  <p>Reviews</p>
                </div>
              </div>
            </div>

            {/* Edit Profile Form */}
            {editMode && (
              <div className="profile-edit-card">
                <h2>Edit Profile Information</h2>
                <form onSubmit={handleSave} encType="multipart/form-data">
                  <div className="form-grid">
                    <div className="form-col">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input name="name" value={form.name} onChange={handleChange} required />
                      </div>

                      <div className="form-group">
                        <label>Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} required />
                      </div>

                      <div className="form-group">
                        <label>Phone</label>
                        <input name="phone" value={form.phone} onChange={handleChange} />
                      </div>

                      <div className="form-group">
                        <label>Bio</label>
                        <textarea name="bio" value={form.bio} onChange={handleChange} rows="4" />
                      </div>
                    </div>

                    <div className="form-col">
                      <div className="form-group">
                        <label>Profile Photo</label>
                        <div className="photo-upload">
                          <img src={previewUrl} alt="preview" className="photo-preview" />
                          <div className="photo-actions">
                            <label className="btn-upload">
                              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} hidden />
                              <i className="fa fa-upload"></i> Upload Photo
                            </label>
                            <button type="button" className="btn-remove" onClick={handleRemovePhoto}>
                              <i className="fa fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Social Links</label>
                        <input name="facebook" placeholder="Facebook URL" value={form.socials.facebook || ""} onChange={handleChange} />
                        <input name="whatsapp" placeholder="WhatsApp Number" value={form.socials.whatsapp || ""} onChange={handleChange} />
                        <input name="linkedin" placeholder="LinkedIn URL" value={form.socials.linkedin || ""} onChange={handleChange} />
                        <input name="instagram" placeholder="Instagram URL" value={form.socials.instagram || ""} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? `Saving... ${uploadProgress}%` : "Save Changes"}
                    </button>
                    <button type="button" className="btn-secondary" onClick={handleCancel} disabled={saving}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Quick Actions */}
            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="actions-grid">
                <Link to="/properties/create" className="action-card green">
                  <i className="fa fa-plus-circle"></i>
                  <span>Add New Property</span>
                </Link>
                <button className="action-card blue" onClick={() => setActiveTab("boost")}>
                  <i className="fa fa-rocket"></i>
                  <span>Boost Visibility</span>
                </button>
                <Link to="/messenger" className="action-card purple">
                  <i className="fa fa-envelope"></i>
                  <span>View Messages</span>
                </Link>
                <Link to="/saved" className="action-card orange">
                  <i className="fa fa-bookmark"></i>
                  <span>Saved Properties</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <div className="dashboard-section">
            <div className="section-header">
              <h1>My Properties</h1>
              <Link to="/properties/create" className="btn-primary">
                <i className="fa fa-plus"></i> Add Property
              </Link>
            </div>
            <MyProperties />
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === "blogs" && (
          <div className="dashboard-section">
            <div className="section-header">
              <h1>My Blogs & Books</h1>
              <Link to="/blog/post" className="btn-primary">
                <i className="fa fa-plus"></i> Create Post
              </Link>
            </div>
            <MyBlogs />
          </div>
        )}

        {/* Boost Tab */}
        {activeTab === "boost" && (
          <div className="dashboard-section">
            <div className="section-header">
              <h1>Boost Your Listings</h1>
              <p className="section-subtitle">Choose a boost plan to increase your property visibility</p>
            </div>

            <div className="boost-plans-grid">
                  <div className="boost-plan-card basic">
                    <div className="boost-plan-header">
                      <i className="fa fa-rocket"></i>
                      <h3>7-Day Boost</h3>
                    </div>
                    <div className="boost-plan-price">
                      <span className="currency">₵</span>
                      <span className="amount">50</span>
                    </div>
                    <ul className="boost-plan-features">
                      <li><i className="fa fa-check"></i> 7 days visibility</li>
                      <li><i className="fa fa-check"></i> Top listing placement</li>
                      <li><i className="fa fa-check"></i> 3x more views</li>
                      <li><i className="fa fa-check"></i> Featured badge</li>
                    </ul>
                    <button 
                      className="boost-plan-select-btn"
                      onClick={() => handleSelectPlan({ duration: 7, price: 50, name: '7-Day Boost' })}
                    >
                      Select Plan
                    </button>
                  </div>

                  <div className="boost-plan-card popular">
                    <div className="boost-plan-badge">Most Popular</div>
                    <div className="boost-plan-header">
                      <i className="fa fa-star"></i>
                      <h3>14-Day Boost</h3>
                    </div>
                    <div className="boost-plan-price">
                      <span className="currency">₵</span>
                      <span className="amount">90</span>
                    </div>
                    <ul className="boost-plan-features">
                      <li><i className="fa fa-check"></i> 14 days visibility</li>
                      <li><i className="fa fa-check"></i> Top listing placement</li>
                      <li><i className="fa fa-check"></i> 5x more views</li>
                      <li><i className="fa fa-check"></i> Featured badge</li>
                      <li><i className="fa fa-check"></i> Priority support</li>
                    </ul>
                    <button 
                      className="boost-plan-select-btn"
                      onClick={() => handleSelectPlan({ duration: 14, price: 90, name: '14-Day Boost' })}
                    >
                      Select Plan
                    </button>
                  </div>

                  <div className="boost-plan-card premium">
                    <div className="boost-plan-header">
                      <i className="fa fa-crown"></i>
                      <h3>30-Day Boost</h3>
                    </div>
                    <div className="boost-plan-price">
                      <span className="currency">₵</span>
                      <span className="amount">150</span>
                    </div>
                    <ul className="boost-plan-features">
                      <li><i className="fa fa-check"></i> 30 days visibility</li>
                      <li><i className="fa fa-check"></i> Top listing placement</li>
                      <li><i className="fa fa-check"></i> 10x more views</li>
                      <li><i className="fa fa-check"></i> Featured badge</li>
                      <li><i className="fa fa-check"></i> Priority support</li>
                      <li><i className="fa fa-check"></i> Social media promotion</li>
                    </ul>
                    <button 
                      className="boost-plan-select-btn"
                      onClick={() => handleSelectPlan({ duration: 30, price: 150, name: '30-Day Boost' })}
                    >
                      Select Plan
                    </button>
                  </div>
                </div>

                <div className="boost-info">
                  <h4><i className="fa fa-info-circle"></i> How Boosting Works</h4>
                  <div className="boost-info-grid">
                    <div className="boost-info-item">
                      <i className="fa fa-chart-line"></i>
                      <h5>Increased Visibility</h5>
                      <p>Your property appears at the top of search results</p>
                    </div>
                    <div className="boost-info-item">
                      <i className="fa fa-eye"></i>
                      <h5>More Views</h5>
                      <p>Get significantly more views from potential buyers</p>
                    </div>
                    <div className="boost-info-item">
                      <i className="fa fa-bolt"></i>
                      <h5>Instant Activation</h5>
                      <p>Boost starts immediately after confirmation</p>
                    </div>
                  </div>
                </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="modal-overlay" onClick={closePaymentModal}>
            <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closePaymentModal}>
                <i className="fa fa-times"></i>
              </button>
              
              <div className="modal-header">
                <i className="fa fa-credit-card modal-icon"></i>
                <h2>Complete Payment</h2>
              </div>

              <div className="modal-body">
                {errorMsg && (
                  <div style={{ 
                    padding: '12px', 
                    background: '#fee2e2', 
                    border: '1px solid #ef4444', 
                    borderRadius: '8px', 
                    color: '#dc2626', 
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <i className="fa fa-exclamation-circle"></i>
                    <span>{errorMsg}</span>
                  </div>
                )}
                
                <div className="payment-summary">
                  <div className="payment-plan-info">
                    <h4>Selected Plan</h4>
                    <p className="plan-name">{selectedPlan?.name}</p>
                    <p className="plan-duration">{selectedPlan?.duration} days of boosted visibility</p>
                  </div>
                  <div className="payment-total">
                    <h4>Total Amount</h4>
                    <p className="price">₵{selectedPlan?.price}</p>
                  </div>
                </div>

                <div className="payment-details">
                  <h4><i className="fa fa-info-circle"></i> What's Included:</h4>
                  <ul className="payment-features">
                    <li><i className="fa fa-check"></i> All your properties will be boosted</li>
                    <li><i className="fa fa-check"></i> Top placement in search results</li>
                    <li><i className="fa fa-check"></i> Featured badge on all listings</li>
                    <li><i className="fa fa-check"></i> {selectedPlan?.duration >= 14 ? '5-10x' : '3x'} more visibility</li>
                    {selectedPlan?.duration >= 14 && (
                      <li><i className="fa fa-check"></i> Priority support</li>
                    )}
                    {selectedPlan?.duration >= 30 && (
                      <li><i className="fa fa-check"></i> Social media promotion</li>
                    )}
                  </ul>
                </div>

                <div className="payment-method-section">
                  <h4><i className="fa fa-wallet"></i> Select Payment Method</h4>
                  <div className="payment-methods">
                    <label className={`payment-method-option ${paymentMethod === 'mobile_money' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="payment" 
                        value="mobile_money"
                        checked={paymentMethod === 'mobile_money'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-option-content">
                        <i className="fa fa-mobile-alt"></i>
                        <span>Mobile Money</span>
                      </div>
                    </label>

                    <label className={`payment-method-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="payment" 
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-option-content">
                        <i className="fa fa-credit-card"></i>
                        <span>Credit/Debit Card</span>
                      </div>
                    </label>

                    <label className={`payment-method-option ${paymentMethod === 'bank_transfer' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="payment" 
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-option-content">
                        <i className="fa fa-university"></i>
                        <span>Bank Transfer</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={closePaymentModal} disabled={boosting}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handlePayment} disabled={boosting}>
                  {boosting ? (
                    <>
                      <i className="fa fa-spinner fa-spin"></i> Processing...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-lock"></i> Pay ₵{selectedPlan?.price}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Tab */}
        {activeTab === "admin" && localUser?.is_admin && (
          <div className="dashboard-section">
            <div className="section-header">
              <h1>Admin Dashboard</h1>
              <p className="section-subtitle">Manage your platform</p>
            </div>

            <div className="admin-stats-grid">
              <div className="admin-stat">
                <i className="fa fa-users"></i>
                <div>
                  <h3>Total Users</h3>
                  <p className="stat-number">1,234</p>
                </div>
              </div>
              <div className="admin-stat">
                <i className="fa fa-building"></i>
                <div>
                  <h3>Total Properties</h3>
                  <p className="stat-number">456</p>
                </div>
              </div>
              <div className="admin-stat pending">
                <i className="fa fa-clock"></i>
                <div>
                  <h3>Pending Approvals</h3>
                  <p className="stat-number">{pendingCount}</p>
                </div>
              </div>
              <div className="admin-stat">
                <i className="fa fa-eye"></i>
                <div>
                  <h3>Total Views</h3>
                  <p className="stat-number">45,678</p>
                </div>
              </div>
            </div>

            <div className="admin-actions-grid">
              <Link to="/admin/pending" className="admin-action-card">
                <i className="fa fa-gavel"></i>
                <h3>Pending Approvals</h3>
                <p>Review and approve property listings</p>
                {pendingCount > 0 && <span className="action-badge">{pendingCount} pending</span>}
              </Link>

              <Link to="/blog/post" className="admin-action-card">
                <i className="fa fa-pencil-alt"></i>
                <h3>Create Blog Post</h3>
                <p>Share insights and property news</p>
              </Link>

              <Link to="/admin/users" className="admin-action-card">
                <i className="fa fa-users-cog"></i>
                <h3>Manage Users</h3>
                <p>View and manage user accounts</p>
              </Link>

              <Link to="/blog" className="admin-action-card">
                <i className="fa fa-newspaper"></i>
                <h3>Manage Content</h3>
                <p>Edit blogs and manage platform content</p>
              </Link>

              <button className="admin-action-card">
                <i className="fa fa-chart-bar"></i>
                <h3>Analytics</h3>
                <p>View platform statistics and insights</p>
              </button>

              <button className="admin-action-card">
                <i className="fa fa-cog"></i>
                <h3>Settings</h3>
                <p>Configure platform settings</p>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}