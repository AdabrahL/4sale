import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios"; // use axios instance so baseURL and auth are consistent


export default function PostBlog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [type, setType] = useState("blog");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookUrl, setBookUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  // Admin guard (hooks must be defined before returns)
  if (!user || !user.is_admin) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger mt-4">Access Denied. Only admins can post blogs/books.</div>
      </div>
    );
  }

  const handleImageChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowed.includes(f.type)) {
      setError("Only JPG, PNG or WEBP images are allowed.");
      return;
    }
    setImageFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("type", type);
      formData.append("excerpt", excerpt);
      formData.append("content", content);
      if (type === "book") {
        formData.append("book_author", bookAuthor);
        formData.append("book_url", bookUrl);
      }
      if (imageFile) formData.append("image", imageFile);

      // Use your axios instance so baseURL and Authorization header are consistent
      await API.post("/blogs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (ev) => {
          if (ev.total) {
            setUploadProgress(Math.round((ev.loaded * 100) / ev.total));
          }
        },
      });

      setLoading(false);
      navigate("/blog");
    } catch (err) {
      console.error("Post blog error:", err);
      // try to show helpful message
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to post blog/book. Check console or backend logs.";
      setError(msg);
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4" style={{ color: "#228B22" }}>Post a Blog/Book</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form className="blog-post-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Type</label>
          <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="blog">Blog</option>
            <option value="book">Book</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Title</label>
          <input type="text" className="form-control" placeholder={type === "blog" ? "Blog Title" : "Book Title"}
            value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
        </div>

        <div className="mb-3">
          <label className="form-label">Excerpt (Short Intro)</label>
          <textarea className="form-control" placeholder="Short summary or intro" value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)} rows={2} required maxLength={200} />
        </div>

        {type === "blog" && (
          <div className="mb-3">
            <label className="form-label">Content</label>
            <textarea className="form-control" placeholder="Blog content" value={content}
              onChange={(e) => setContent(e.target.value)} rows={8} required />
          </div>
        )}

        {type === "book" && (
          <>
            <div className="mb-3">
              <label className="form-label">Book Author</label>
              <input type="text" className="form-control" placeholder="Author"
                value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Book Link (URL)</label>
              <input type="url" className="form-control" placeholder="https://example.com/book"
                value={bookUrl} onChange={(e) => setBookUrl(e.target.value)} required />
            </div>
          </>
        )}

        <div className="mb-3">
          <label className="form-label">Image (cover or blog image)</label>
          <input ref={fileInputRef} type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
          {previewUrl && <img src={previewUrl} alt="preview" style={{ marginTop: 8, maxWidth: 220, borderRadius: 6 }} />}
          {uploadProgress > 0 && <div style={{ marginTop: 8 }}>Uploading: {uploadProgress}%</div>}
        </div>

        <button className="btn btn-green" disabled={loading} type="submit">
          {loading ? `Posting...${uploadProgress ? ` (${uploadProgress}%)` : ""}` : `Post ${type === "blog" ? "Blog" : "Book"}`}
        </button>
      </form>
    </div>
  );
}