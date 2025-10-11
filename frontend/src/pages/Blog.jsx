import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Blog() {
  const { user } = useAuth();
  const [tab, setTab] = useState("blogs");
  const [blogs, setBlogs] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user && user.isAdmin;

  useEffect(() => {
    fetch("/api/blogs")
      .then(res => res.json())
      .then(data => {
        setBlogs(data.filter(b => b.type === "blog"));
        setBooks(data.filter(b => b.type === "book"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="blog-page container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="blog-title">Resources</h2>
        {isAdmin && (
          <Link to="/blog/post" className="btn btn-green">
            + Post Blog/Book
          </Link>
        )}
      </div>
      <div className="blog-tabs mb-4">
        <button
          className={`blog-tab-btn ${tab === "blogs" ? "active" : ""}`}
          onClick={() => setTab("blogs")}
        >
          Blogs
        </button>
        <button
          className={`blog-tab-btn ${tab === "books" ? "active" : ""}`}
          onClick={() => setTab("books")}
        >
          Books
        </button>
      </div>
      <div className="blog-content">
        {loading ? (
          <div>Loading...</div>
        ) : tab === "blogs" ? (
          <div className="blog-list row">
            {blogs.length === 0 ? (
              <div className="col-12"><p>No blogs yet.</p></div>
            ) : blogs.map((blog) => (
              <div key={blog.id} className="col-lg-4 col-md-6 mb-4">
                <div className="blog-card card shadow-sm">
                  {blog.image && (
                    <img
                      src={blog.image.startsWith('http') ? blog.image : `/storage/${blog.image}`}
                      alt={blog.title}
                      className="card-img-top"
                      style={{ height: "180px", objectFit: "cover" }}
                    />
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{blog.title}</h5>
                    <p className="card-text">{blog.excerpt}</p>
                    <div className="text-muted small">
                      {blog.user?.name || blog.author} &mdash; {blog.created_at?.slice(0,10)}
                    </div>
                    <Link to={`/blog/${blog.id}`} className="btn btn-green btn-sm mt-2">
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="book-list row">
            {books.length === 0 ? (
              <div className="col-12"><p>No books yet.</p></div>
            ) : books.map((book) => (
              <div key={book.id} className="col-lg-3 col-md-4 mb-4">
                <div className="book-card card shadow-sm">
                  {book.image && (
                    <img
                      src={book.image.startsWith('http') ? book.image : `/storage/${book.image}`}
                      alt={book.title}
                      className="card-img-top"
                      style={{ height: "160px", objectFit: "cover" }}
                    />
                  )}
                  <div className="card-body">
                    <h6 className="card-title">{book.title}</h6>
                    <p className="card-text">{book.book_author}</p>
                    <a
                      href={book.book_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-green btn-sm mt-2"
                    >
                      View Book
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}