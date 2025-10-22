import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPhotoUrl } from "../utils/getPhotoUrl";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";
function getBlogImage(image) {
  if (!image) return "/img/default.jpg";
  return image.startsWith("http") ? image : `${backendUrl}/storage/${image}`;
}

export default function BlogSidebar() {
  const [trending, setTrending] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/blogs`)
      .then(res => res.json())
      .then(data => {
        const blogsArr = Array.isArray(data) ? data : data.data;
        const allBlogs = (blogsArr || []).filter(b => b.type === "blog");
        setTrending([...allBlogs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5));
        setRecent([...allBlogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5));
      });
  }, []);

  return (
    <aside className="blog-sidebar">
      <section className="sidebar-section">
        <h5 className="sidebar-section-title">Trending Blogs</h5>
        {trending.length === 0 ? (
          <div className="sidebar-empty">No trending blogs.</div>
        ) : (
          <ul className="sidebar-trending-list">
            {trending.map(b => (
              <li key={b.id} className="sidebar-trending-item">
                <Link to={`/blog/${b.id}`}>
                  <img src={getBlogImage(b.image)} alt={b.title} className="sidebar-trending-thumb" />
                  <div>
                    <div className="sidebar-trending-title">{b.title}</div>
                    <div className="sidebar-trending-meta">
                      By {b.user?.name || b.author} • {b.created_at?.slice(0,10)}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="sidebar-section">
        <h5 className="sidebar-section-title">Recent Blogs</h5>
        {recent.length === 0 ? (
          <div className="sidebar-empty">No recent blogs.</div>
        ) : (
          <ul className="sidebar-recent-list">
            {recent.map(b => (
              <li key={b.id} className="sidebar-recent-item">
                <Link to={`/blog/${b.id}`}>{b.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      {/* Add more sections: categories, newsletter, social, etc. */}
    </aside>
  );
}