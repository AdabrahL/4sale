import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../api/axios";
import MyProperties from "../components/MyProperties";


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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [editMode, setEditMode] = useState(false);
  const fileRef = useRef();

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
    fetchStats();
    // eslint-disable-next-line
  }, [user]);

  async function fetchStats() {
    try {
      // fetch my-properties (paginated) to get total
      const res = await API.get("/my-properties", { params: { page: 1, per_page: 1 } });
      const payload = res.data?.data || res.data;
      const total = payload?.total ?? (Array.isArray(payload) ? payload.length : 0);
      // favorites
      let favCount = 0;
      try {
        const favRes = await API.get("/favorites");
        const favPayload = favRes.data?.data || favRes.data;
        favCount = Array.isArray(favPayload) ? favPayload.length : (favPayload?.total ?? 0);
      } catch {
        favCount = 0;
      }
      setStats({ listings: Number(total || 0), favorites: Number(favCount || 0) });
    } catch {
      setStats({ listings: 0, favorites: 0 });
    }
  }

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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      setErrorMsg("Only JPG, PNG or WEBP images are allowed.");
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMsg("");
  };

  const handleRemovePhoto = async () => {
    // optional: call API to remove photo, here we just clear preview and mark for save
    setImageFile(null);
    setPreviewUrl("/default-avatar.png");
    // you can also set form.photo = "" and submit to backend to remove stored photo
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("bio", form.bio);
      formData.append("socials", JSON.stringify(form.socials || {}));
      if (imageFile) formData.append("photo", imageFile);

      const { data } = await API.post("/profile/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // update auth context user
      if (data?.user) {
        setUser(data.user);
        setLocalUser(data.user);
      }
      setSuccessMsg("Your profile was updated successfully.");
      setEditMode(false);
      setImageFile(null);
      setPreviewUrl(getPhotoUrl(data?.user?.photo ?? localUser?.photo));
      // Refresh stats if needed
      fetchStats();
    } catch (err) {
      console.error("Profile save error:", err.response?.data || err.message);
      setErrorMsg(err.response?.data?.message || "Failed to save profile. Try again.");
    } finally {
      setSaving(false);
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
    setErrorMsg("");
    setSuccessMsg("");
    setEditMode(false);
  };

  return (
    <div className="profile-wrap">
      <div className="profile-hero">
        <div className="profile-hero-bg" />
        <div className="profile-hero-inner container">
          <div className="profile-avatar-col">
            <div className="avatar-stack">
              <img src={previewUrl} alt="avatar" className="profile-avatar-large" />
              <div className="avatar-actions">
                <label className="avatar-upload">
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} hidden />
                  <i className="fa fa-camera"></i>
                </label>
                <button className="avatar-remove" onClick={handleRemovePhoto} title="Remove photo">
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            </div>
            <div className="profile-basic">
              <h2 className="profile-name">{localUser?.name}</h2>
              <div className="profile-role">
                {localUser?.is_admin ? <span className="role-badge admin">Admin</span> : <span className="role-badge user">User</span>}
                {localUser?.agency && <span className="role-tag">{localUser.agency}</span>}
              </div>
            </div>
          </div>

          <div className="profile-summary-col">
            <div className="profile-actions-top">
              <div className="profile-stats">
                <div className="stat">
                  <div className="stat-num">{stats.listings}</div>
                  <div className="stat-label">Listings</div>
                </div>
                <div className="stat">
                  <div className="stat-num">{stats.favorites}</div>
                  <div className="stat-label">Favorites</div>
                </div>
                <div className="stat">
                  <div className="stat-num">{localUser?.reviews_count ?? "—"}</div>
                  <div className="stat-label">Reviews</div>
                </div>
              </div>

              <div className="profile-controls">
                <button className="profile-btn profile-btn-green" onClick={() => setEditMode(true)}>Edit Profile</button>
                <a className="profile-btn profile-btn-outline" href="/properties/create">Post Listing</a>
              </div>
            </div>

            <div className="profile-about">
              <p className="profile-bio-hero">{localUser?.bio || "Tell people about yourself. Add a short bio so potential clients know who you are."}</p>

              <div className="profile-contact-row">
                <div><strong>Email:</strong> <a href={`mailto:${localUser?.email}`}>{localUser?.email}</a></div>
                <div><strong>Phone:</strong> <a href={`tel:${localUser?.phone}`}>{localUser?.phone || "—"}</a></div>
              </div>

              <div className="profile-socials">
                {localUser?.socials?.facebook && (
                  <a href={localUser.socials.facebook} target="_blank" rel="noreferrer" className="social-pill">
                    <i className="fab fa-facebook"></i> Facebook
                  </a>
                )}
                {localUser?.socials?.whatsapp && (
                  <a href={`https://wa.me/${localUser.socials.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="social-pill">
                    <i className="fab fa-whatsapp"></i> WhatsApp
                  </a>
                )}
                {localUser?.socials?.linkedin && (
                  <a href={localUser.socials.linkedin} target="_blank" rel="noreferrer" className="social-pill">
                    <i className="fab fa-linkedin"></i> LinkedIn
                  </a>
                )}
                {localUser?.socials?.instagram && (
                  <a href={localUser.socials.instagram} target="_blank" rel="noreferrer" className="social-pill">
                    <i className="fab fa-instagram"></i> Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {successMsg && <div className="profile-toast success">{successMsg}</div>}
      {errorMsg && <div className="profile-toast error">{errorMsg}</div>}

      {/* Edit area: appears below hero */}
      {editMode && (
        <div className="profile-edit-panel container">
          <form className="profile-edit-grid" onSubmit={handleSave} encType="multipart/form-data">
            <div className="profile-edit-left">
              <label className="field">
                <div className="field-label">Full name</div>
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>

              <label className="field">
                <div className="field-label">Email</div>
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </label>

              <label className="field">
                <div className="field-label">Phone</div>
                <input name="phone" value={form.phone} onChange={handleChange} />
              </label>

              <label className="field">
                <div className="field-label">Short bio</div>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows="4" />
              </label>

              <div className="field group">
                <div className="field-label">Social links</div>
                <input name="facebook" placeholder="Facebook URL" value={form.socials.facebook || ""} onChange={handleChange} />
                <input name="whatsapp" placeholder="WhatsApp (number)" value={form.socials.whatsapp || ""} onChange={handleChange} />
                <input name="linkedin" placeholder="LinkedIn URL" value={form.socials.linkedin || ""} onChange={handleChange} />
                <input name="instagram" placeholder="Instagram URL" value={form.socials.instagram || ""} onChange={handleChange} />
              </div>

              <div className="edit-actions">
                <button type="submit" className="profile-btn profile-btn-green" disabled={saving}>
                  {saving ? "Saving..." : "Save profile"}
                </button>
                <button type="button" className="profile-btn profile-btn-gray" onClick={handleCancel} disabled={saving}>
                  Cancel
                </button>
              </div>
            </div>

            <aside className="profile-edit-right">
              <div className="preview-card">
                <div className="preview-title">Profile preview</div>
                <div className="preview-avatar">
                  <img src={previewUrl} alt="preview" />
                </div>
                <div className="preview-name">{form.name || localUser?.name}</div>
                <div className="preview-role">{localUser?.is_admin ? "Administrator" : "Agent / User"}</div>
                <div className="preview-actions">
                  <label className="upload-btn">
                    <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                    <i className="fa fa-upload" /> Upload photo
                  </label>
                  <button type="button" className="profile-btn profile-btn-outline" onClick={() => { setImageFile(null); setPreviewUrl(getPhotoUrl(localUser?.photo)); fileRef.current && (fileRef.current.value = null); }}>
                    Reset
                  </button>
                </div>
                <div className="preview-stats">
                  <div><strong>{stats.listings}</strong><span>Listings</span></div>
                  <div><strong>{stats.favorites}</strong><span>Favorites</span></div>
                </div>
              </div>

              <div className="hint-box">
                <strong>Tip</strong>
                <p>Use a square photo, 400x400 or higher for best results. Social links should be full URLs (https://...)</p>
              </div>
            </aside>
          </form>
        </div>
      )}
      <MyProperties/>
    </div>
  );
}