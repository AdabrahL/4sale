import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios"; // use axios instance so baseURL and auth are consistent
import "../styles/post-blog.css";


export default function PostBlog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const [type, setType] = useState("blog");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookUrl, setBookUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  // Admin guard (hooks must be defined before returns)
  if (!user || !user.is_admin) {
    return (
      <div className="post-blog-container">
        <div className="post-blog-access-denied">
          <h3>🔒 Access Denied</h3>
          <p>Only admins can post blogs/books. Please contact an administrator for access.</p>
        </div>
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

  const handlePdfChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Only PDF files are allowed for books.");
      return;
    }
    setPdfFile(f);
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
        if (bookUrl) formData.append("book_url", bookUrl);
        if (pdfFile) formData.append("pdf_file", pdfFile);
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
    <div className="post-blog-container">
      <div className="post-blog-wrapper">
        {/* Left: Form */}
        <div className="post-blog-form-section">
          <h2 className="post-blog-title">Post Content</h2>
          <p className="post-blog-subtitle">Share your insights or recommend a great book to the community</p>

          {error && <div className="post-blog-error">{error}</div>}

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Type Toggle */}
            <div className="post-blog-form-group">
              <label className="post-blog-label">Content Type <span className="required">*</span></label>
              <div className="post-blog-type-toggle">
                <button
                  type="button"
                  className={`post-blog-type-btn ${type === "blog" ? "active" : ""}`}
                  onClick={() => setType("blog")}
                >
                  📝 Blog Post
                </button>
                <button
                  type="button"
                  className={`post-blog-type-btn ${type === "book" ? "active" : ""}`}
                  onClick={() => setType("book")}
                >
                  📚 Book
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="post-blog-form-group">
              <label className="post-blog-label">Title <span className="required">*</span></label>
              <input
                type="text"
                className="post-blog-input"
                placeholder={type === "blog" ? "Enter your blog title..." : "Enter book title..."}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={120}
              />
            </div>

            {/* Excerpt */}
            <div className="post-blog-form-group">
              <label className="post-blog-label">Excerpt <span className="required">*</span></label>
              <textarea
                className="post-blog-textarea"
                placeholder="Write a compelling short summary or introduction..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                required
                maxLength={200}
              />
              <small className="post-blog-helper">{excerpt.length}/200 characters</small>
            </div>

            {/* Blog Content */}
            {type === "blog" && (
              <div className="post-blog-form-group">
                <label className="post-blog-label">Content <span className="required">*</span></label>
                <textarea
                  className="post-blog-textarea tall"
                  placeholder="Share your thoughts, insights, and knowledge..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  required
                />
              </div>
            )}

            {/* Book Fields */}
            {type === "book" && (
              <>
                <div className="post-blog-form-group">
                  <label className="post-blog-label">Book Author <span className="required">*</span></label>
                  <input
                    type="text"
                    className="post-blog-input"
                    placeholder="Enter author name..."
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    required
                  />
                </div>

                <div className="post-blog-form-group">
                  <label className="post-blog-label">Upload PDF File</label>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    className="post-blog-file-input"
                    accept="application/pdf"
                    onChange={handlePdfChange}
                  />
                  {pdfFile && (
                    <div className="post-blog-file-selected">
                      <i className="fa fa-file-pdf"></i>
                      <span>{pdfFile.name}</span>
                    </div>
                  )}
                  <small className="post-blog-helper">Upload a PDF version of the book for online reading</small>
                </div>

                <div className="post-blog-form-group">
                  <label className="post-blog-label">Book Link (URL) - Optional</label>
                  <input
                    type="url"
                    className="post-blog-input"
                    placeholder="https://example.com/book"
                    value={bookUrl}
                    onChange={(e) => setBookUrl(e.target.value)}
                  />
                  <small className="post-blog-helper">External link if PDF is not uploaded</small>
                </div>
              </>
            )}

            {/* Cover Image */}
            <div className="post-blog-form-group">
              <label className="post-blog-label">Cover Image</label>
              <input
                ref={fileInputRef}
                type="file"
                className="post-blog-file-input"
                accept="image/*"
                onChange={handleImageChange}
              />
              {previewUrl && (
                <img src={previewUrl} alt="preview" className="post-blog-image-preview" />
              )}
              <small className="post-blog-helper">Recommended: 1200x600px, JPG or PNG format</small>
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className="post-blog-progress">
                <span className="post-blog-progress-label">Uploading: {uploadProgress}%</span>
                <div className="post-blog-progress-bar">
                  <div className="post-blog-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button className="post-blog-submit" disabled={loading} type="submit">
              {loading ? (
                <>
                  <i className="fa fa-spinner fa-spin"></i>
                  {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : "Posting..."}
                </>
              ) : (
                <>
                  <i className="fa fa-paper-plane"></i>
                  Post {type === "blog" ? "Blog" : "Book"}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Preview */}
        <div className="post-blog-preview">
          <div className="post-blog-preview-header">
            <div className="post-blog-preview-title">
              <i className="fa fa-eye"></i>
              Live Preview
            </div>
            <span className="post-blog-preview-label">{type === "blog" ? "Blog Post" : "Book"}</span>
          </div>

          <div className="post-blog-preview-content">
            {/* Image */}
            {previewUrl ? (
              <div className="post-blog-preview-image">
                <img src={previewUrl} alt="Cover preview" />
              </div>
            ) : (
              <div className="post-blog-preview-image"></div>
            )}

            {/* Title & Excerpt */}
            <div className="post-blog-preview-text">
              <h4>{title || "Your title will appear here"}</h4>
              <p>{excerpt || "Your excerpt will appear here..."}</p>
            </div>

            {/* Content (for blogs) */}
            {type === "blog" && (
              <div className={`post-blog-preview-text ${!content ? "empty" : ""}`}>
                <h4>Content</h4>
                <p>{content || "Your blog content will appear here..."}</p>
              </div>
            )}

            {/* Book info */}
            {type === "book" && (
              <>
                <div className="post-blog-preview-text">
                  <h4>Author</h4>
                  <p>{bookAuthor || "Author name will appear here"}</p>
                </div>
                {pdfFile && (
                  <div className="post-blog-preview-text">
                    <h4>PDF Available</h4>
                    <p>✓ Readers can view this book online</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}