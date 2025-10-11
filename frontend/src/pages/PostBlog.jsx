import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function PostBlog() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || !user.isAdmin) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger mt-4">
          Access Denied. Only admins can post blogs/books.
        </div>
      </div>
    );
  }

  const [type, setType] = useState("blog");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookUrl, setBookUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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

      // Assumes you have auth token in localStorage or context
      const res = await fetch("/api/blogs", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${user.token}`, // Adjust per your auth system
        },
      });

      if (!res.ok) throw new Error("Failed to post blog/book");
      setLoading(false);
      navigate("/blog");
    } catch (err) {
      setLoading(false);
      setError(err.message || "Failed to post blog/book. Try again.");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4" style={{ color: "#228B22" }}>Post a Blog/Book</h2>
      <form className="blog-post-form" onSubmit={handleSubmit} encType="multipart/form-data">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label className="form-label">Type</label>
          <select className="form-control" value={type} onChange={e => setType(e.target.value)}>
            <option value="blog">Blog</option>
            <option value="book">Book</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            placeholder={type === "blog" ? "Blog Title" : "Book Title"}
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            maxLength={120}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Excerpt (Short Intro)</label>
          <textarea
            className="form-control"
            placeholder="Short summary or intro"
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            rows={2}
            required
            maxLength={200}
          />
        </div>
        {type === "blog" && (
          <div className="mb-3">
            <label className="form-label">Content</label>
            <textarea
              className="form-control"
              placeholder="Blog content"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={8}
              required
            />
          </div>
        )}
        {type === "book" && (
          <>
            <div className="mb-3">
              <label className="form-label">Book Author</label>
              <input
                type="text"
                className="form-control"
                placeholder="Author"
                value={bookAuthor}
                onChange={e => setBookAuthor(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Book Link (URL)</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://example.com/book"
                value={bookUrl}
                onChange={e => setBookUrl(e.target.value)}
                required
              />
            </div>
          </>
        )}
        <div className="mb-3">
          <label className="form-label">Image (cover or blog image)</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={e => setImageFile(e.target.files[0])}
          />
        </div>
        <button
          className="btn btn-green"
          disabled={loading}
          type="submit"
        >
          {loading ? "Posting..." : `Post ${type === "blog" ? "Blog" : "Book"}`}
        </button>
      </form>
    </div>
  );
}