import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getPhotoUrl } from "../utils/getPhotoUrl";
import BlogSidebar from "../components/BlogSidebar ";


const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";
function getBlogImage(image) {
  if (!image) return "/img/default.jpg";
  return image.startsWith("http") ? image : `${backendUrl}/storage/${image}`;
}

export default function Blog() {
  const { user } = useAuth();
  const [tab, setTab] = useState("blogs");
  const [blogs, setBlogs] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user && user.is_admin;

  useEffect(() => {
    fetch(`${backendUrl}/api/blogs`)
      .then(res => res.json())
      .then(data => {
        const blogsArr = Array.isArray(data) ? data : data.data;
        setBlogs((blogsArr || []).filter(b => b.type === "blog"));
        setBooks((blogsArr || []).filter(b => b.type === "book"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="blog-main-page container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="blog-main-title">Blog</h2>
        {isAdmin && (
          <Link to="/blog/post" className="btn btn-green">
            + Post Blog/Book
          </Link>
        )}
      </div>
      <div className="blog-main-tabs mb-4">
        <button
          className={`blog-main-tab-btn ${tab === "blogs" ? "active" : ""}`}
          onClick={() => setTab("blogs")}
        >
          Blogs
        </button>
        <button
          className={`blog-main-tab-btn ${tab === "books" ? "active" : ""}`}
          onClick={() => setTab("books")}
        >
          Books
        </button>
      </div>
      <div className="row blog-main-row gx-5">
        <div className="col-lg-8 col-12 blog-main-stack-col">
          {loading ? (
            <div>Loading...</div>
          ) : tab === "blogs" ? (
            blogs.length === 0 ? (
              <p>No blogs yet.</p>
            ) : (
              <div className="blog-main-stack">
                {blogs.map((blog) => (
                  <div key={blog.id} className="blog-main-card">
                    <Link to={`/blog/${blog.id}`}>
                      <img
                        src={getBlogImage(blog.image)}
                        alt={blog.title}
                        className="blog-main-card-img"
                      />
                    </Link>
                    <div className="blog-main-card-content">
                      <Link to={`/blog/${blog.id}`} className="blog-main-card-title">
                        {blog.title}
                      </Link>
                      <p className="blog-main-card-excerpt">
                        {blog.excerpt?.slice(0, 180)}{blog.excerpt && blog.excerpt.length > 180 && " ..."}
                      </p>
                      <div className="blog-main-card-meta">
                        <div className="blog-main-card-author">
                          <img
                            src={getPhotoUrl(blog.user?.photo)}
                            alt={blog.user?.name}
                            className="blog-main-card-author-avatar"
                          />
                          <span>{blog.user?.name || blog.author || "Author"}</span>
                        </div>
                        <div className="blog-main-card-date">
                          {blog.created_at?.slice(0, 10)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="blog-main-books-row row">
              {books.length === 0 ? (
                <div className="col-12"><p>No books yet.</p></div>
              ) : books.map((book) => (
                <div key={book.id} className="col-lg-3 col-md-4 mb-4">
                  <div className="blog-main-book-card card shadow-sm">
                    {book.image && (
                      <img
                        src={getBlogImage(book.image)}
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
        <div className="col-lg-4 col-12 blog-main-sidebar">
          <BlogSidebar />
        </div>
      </div>
    </div>
  );
}