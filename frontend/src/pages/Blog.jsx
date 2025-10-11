import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const blogs = [
  {
    id: 1,
    title: "The Future of Real Estate",
    excerpt: "Discover trends shaping the property market in 2025 and beyond...",
    author: "Jane Admin",
    date: "2025-09-20",
    image: "/img/blog1.jpg",
  },
  // ...more blogs
];

const books = [
  {
    id: 1,
    title: "Real Estate Investing 101",
    author: "John Doe",
    cover: "/img/book1.jpg",
    link: "https://amazon.com/example-book",
  },
  // ...more books
];

export default function Blog() {
  const { user } = useAuth();
  const [tab, setTab] = useState("blogs");

  // Replace user.isAdmin with your actual admin check
  const isAdmin = user && user.isAdmin;

  return (
    <div className="blog-page container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="blog-title">Resources</h2>
        {isAdmin && (
          <Link to="/blog/post" className="btn btn-green">
            + Post Blog
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
        {tab === "blogs" ? (
          <div className="blog-list row">
            {blogs.map((blog) => (
              <div key={blog.id} className="col-lg-4 col-md-6 mb-4">
                <div className="blog-card card shadow-sm">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="card-img-top"
                    style={{ height: "180px", objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{blog.title}</h5>
                    <p className="card-text">{blog.excerpt}</p>
                    <div className="text-muted small">
                      {blog.author} &mdash; {blog.date}
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
            {books.map((book) => (
              <div key={book.id} className="col-lg-3 col-md-4 mb-4">
                <div className="book-card card shadow-sm">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="card-img-top"
                    style={{ height: "160px", objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h6 className="card-title">{book.title}</h6>
                    <p className="card-text">{book.author}</p>
                    <a
                      href={book.link}
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