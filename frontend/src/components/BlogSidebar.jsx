import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";


const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";
function getBlogImage(image) {
  if (!image) return "/img/default-small.jpg";
  return image.startsWith("http") ? image : `${backendUrl}/storage/${image}`;
}

export default function BlogSidebar() {
  const [trending, setTrending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [categories, setCategories] = useState([]);
  const [email, setEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchAll() {
      try {
        const res = await API.get("/blogs", { params: { per_page: 50 } });
        const payload = res.data?.data ?? res.data ?? [];
        const all = Array.isArray(payload) ? payload : (payload.data ?? []);
        const blogs = (all || []).filter(b => b.type !== "book");
        if (!mounted) return;
        setTrending([...blogs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5));
        setRecent([...blogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch sidebar posts", err);
      }
    }

    async function fetchCategories() {
      try {
        const res = await API.get("/categories");
        const cats = res.data?.data ?? res.data ?? [];
        if (!mounted) return;
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        // ignore if categories endpoint not present
      }
    }

    fetchAll();
    fetchCategories();

    return () => { mounted = false; };
  }, []);

  const subscribe = async (e) => {
    e.preventDefault();
    try {
      // adapt endpoint if your backend differs
      await API.post("/newsletter/subscribe", { email });
      setNewsletterMsg("Subscribed! Check your inbox.");
      setEmail("");
    } catch (err) {
      console.error(err);
      setNewsletterMsg("Failed to subscribe. Try again later.");
    }
  };

  return (
    <aside className="blog-sidebar">
      <div className="blog-sidebar-section">
        <h4 className="blog-sidebar-title">Trending</h4>
        {trending.length === 0 ? (
          <div className="blog-sidebar-empty">No trending posts</div>
        ) : (
          <ul className="blog-sidebar-trending-list">
            {trending.map(b => (
              <li key={b.id} className="blog-sidebar-trending-item">
                <Link to={`/blog/${b.id}`} className="blog-sidebar-trending-link">
                  <img src={getBlogImage(b.image)} alt={b.title} className="blog-sidebar-trending-img" />
                  <div>
                    <div className="blog-sidebar-trending-title">{b.title}</div>
                    <div className="blog-sidebar-trending-meta">
                      <img src={b.user?.photo ? `${backendUrl}/storage/${b.user.photo}` : "/default-avatar.png"} alt={b.user?.name} className="blog-sidebar-trending-avatar" />
                      <span>{b.user?.name ?? b.author}</span>
                      <span> • {b.created_at?.slice(0,10)}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="blog-sidebar-section">
        <h4 className="blog-sidebar-title">Recent</h4>
        {recent.length === 0 ? (
          <div className="blog-sidebar-empty">No recent posts</div>
        ) : (
          <ul className="blog-sidebar-recent-list">
            {recent.map(b => (
              <li key={b.id} className="blog-sidebar-recent-item">
                <Link to={`/blog/${b.id}`} className="blog-sidebar-recent-link">{b.title}</Link>
                <div className="blog-sidebar-recent-date">{b.created_at?.slice(0,10)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="blog-sidebar-section">
        <h4 className="blog-sidebar-title">Categories</h4>
        {categories.length === 0 ? (
          <div className="blog-sidebar-empty">No categories</div>
        ) : (
          <ul className="blog-sidebar-category-list">
            {categories.map(c => (
              <li key={c.id}>
                <Link to={`/blog?category=${c.id}`} className="blog-sidebar-cat-link">
                  {c.name} <small className="text-muted">({c.count ?? "-"})</small>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="blog-sidebar-section">
        <h4 className="blog-sidebar-title">Newsletter</h4>
        <form onSubmit={subscribe} className="newsletter-form">
          <input type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required />
          <button className="btn btn-green" type="submit">Subscribe</button>
          {newsletterMsg && <div className="blog-sidebar-empty" style={{ marginTop: 8 }}>{newsletterMsg}</div>}
        </form>
      </div>

      <div className="blog-sidebar-section blog-sidebar-socials">
        <h4 className="blog-sidebar-title">Follow</h4>
        <div className="blog-sidebar-social-icons">
          <a href="#" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
          <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
          <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
          <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
        </div>
      </div>
    </aside>
  );
}