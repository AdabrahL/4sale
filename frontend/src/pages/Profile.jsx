import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../api/axios";

// Helper: get backend url from .env (VITE_BACKEND_URL), fallback to http://backend.test
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";

// Helper to generate the full profile image URL
function getPhotoUrl(photo) {
  if (!photo) return "/default-avatar.png";
  return photo.startsWith("http") ? photo : `${backendUrl}/storage/${photo}`;
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    socials: user?.socials || {
      facebook: "",
      whatsapp: "",
      linkedin: "",
      instagram: "",
    },
    photo: user?.photo || "",
  });
  const [imageFile, setImageFile] = useState(null);
  // Use getPhotoUrl for initial preview
  const [previewUrl, setPreviewUrl] = useState(getPhotoUrl(user?.photo));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-alert profile-alert-warning">
          Please login to view your profile.
        </div>
      </div>
    );
  }

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["facebook", "whatsapp", "linkedin", "instagram"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        socials: { ...prev.socials, [name]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      setError("Only JPG, JPEG, PNG, and WEBP images are allowed.");
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  // Submit profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("bio", form.bio);
      formData.append("socials", JSON.stringify(form.socials));
      if (imageFile) formData.append("photo", imageFile);

      const { data } = await API.post("/profile/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUser(data.user);
      setSuccess("Profile updated successfully!");
      setEditMode(false);
      setImageFile(null);
      setPreviewUrl(getPhotoUrl(data.user.photo));
      setForm({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        bio: data.user.bio,
        socials: data.user.socials || {},
        photo: data.user.photo,
      });
    } catch (err) {
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // VIEW MODE
  if (!editMode) {
    return (
      <div className="profile-container">
        <h2 className="profile-title">My Profile</h2>
        <div className="profile-card">
          <div className="profile-avatar-box">
            <img
              src={previewUrl}
              alt="Profile"
              className="profile-avatar"
            />
          </div>
          <div className="profile-main-data">
            <h4>{user.name}</h4>
            <p className="profile-bio">{user.bio}</p>
            <ul className="profile-list">
              <li><span>Email:</span> {user.email}</li>
              <li><span>Phone:</span> {user.phone}</li>
              {user.socials && Object.entries(user.socials).map(([key, value]) => (
                value ? (
                  <li key={key}>
                    <span>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>{" "}
                    {key === "whatsapp"
                      ? value
                      : <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
                    }
                  </li>
                ) : null
              ))}
            </ul>
            <button className="profile-btn profile-btn-green mt-3" onClick={() => setEditMode(true)}>
              Edit Profile
            </button>
            {success && <div className="profile-alert profile-alert-success">{success}</div>}
          </div>
        </div>
      </div>
    );
  }

  // EDIT MODE (Form)
  return (
    <div className="profile-container">
      <h2 className="profile-title">Edit Profile</h2>
      <form className="profile-form" onSubmit={handleSubmit} encType="multipart/form-data">
        {error && <div className="profile-alert profile-alert-danger">{error}</div>}
        <div className="profile-avatar-edit">
          <img
            src={previewUrl}
            alt="Profile"
            className="profile-avatar profile-avatar-edit-img"
          />
          <input
            type="file"
            className="profile-file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={handleImageChange}
          />
        </div>
        <div className="profile-group">
          <label>Name</label>
          <input
            type="text"
            className="profile-input"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="profile-group">
          <label>Email</label>
          <input
            type="email"
            className="profile-input"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="profile-group">
          <label>Phone</label>
          <input
            type="text"
            className="profile-input"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <div className="profile-group">
          <label>Bio</label>
          <textarea
            className="profile-input"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
          ></textarea>
        </div>
        <div className="profile-group">
          <label>Social Links</label>
          <input
            type="url"
            className="profile-input mb-2"
            name="facebook"
            placeholder="Facebook"
            value={form.socials.facebook || ""}
            onChange={handleChange}
          />
          <input
            type="text"
            className="profile-input mb-2"
            name="whatsapp"
            placeholder="WhatsApp"
            value={form.socials.whatsapp || ""}
            onChange={handleChange}
          />
          <input
            type="url"
            className="profile-input mb-2"
            name="linkedin"
            placeholder="LinkedIn"
            value={form.socials.linkedin || ""}
            onChange={handleChange}
          />
          <input
            type="url"
            className="profile-input mb-2"
            name="instagram"
            placeholder="Instagram"
            value={form.socials.instagram || ""}
            onChange={handleChange}
          />
        </div>
        <div className="profile-btn-group">
          <button
            className="profile-btn profile-btn-green"
            disabled={loading}
            type="submit"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="profile-btn profile-btn-gray"
            onClick={() => setEditMode(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}