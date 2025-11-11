import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";

function parseImages(images) {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try {
    return JSON.parse(images);
  } catch {
    return [];
  }
}

export default function HomeSidebar({ stats = {}, featuredAgent = null, trending = [] }) {
  const sidebarRef = useRef(null);

  useEffect(() => {
    const onResize = () => {
      if (!sidebarRef.current) return;
      sidebarRef.current.style.willChange = "transform";
      setTimeout(() => { sidebarRef.current && (sidebarRef.current.style.willChange = ""); }, 250);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <aside className="home-sidebar sticky" ref={sidebarRef} aria-label="Sidebar">
      <div className="sidebar-block">
        <h5>Quick Links</h5>
        <ul className="sidebar-links">
          <li><Link to="/properties">Browse Properties</Link></li>
          <li><Link to="/saved">Saved Properties</Link></li>
          <li><Link to="/agents">Find an Agent</Link></li>
          <li><Link to="/properties/create">Post a Property</Link></li>
          <li><Link to="/blog">Read Blog</Link></li>
          <li><Link to="/blog?tab=books">Free Real Estate Books</Link></li>
        </ul>
      </div>

      <div className="sidebar-block tip">
        <div className="tip-label">Tip of the Day</div>
        <div className="tip-body">Always verify land titles and use a local surveyor before making payments.</div>
      </div>

      <div className="sidebar-block">
        <h5>Market Summary</h5>
        <div className="market-grid">
          <div>
            <div className="stat">{stats.today ?? 0}</div>
            <div className="stat-label">Listings today</div>
          </div>
          <div>
            <div className="stat">{stats.popular ?? "N/A"}</div>
            <div className="stat-label">Popular area</div>
          </div>
          <div>
            <div className="stat">₵{stats.avgPrice ?? "N/A"}</div>
            <div className="stat-label">Avg. price</div>
          </div>
        </div>
      </div>

      {featuredAgent && (
        <div className="sidebar-block agent">
          <h5>Featured Agent</h5>
          <div className="agent-mini">
            <img src={featuredAgent.photo ? (featuredAgent.photo.startsWith("http") ? featuredAgent.photo : `${backendUrl}/storage/${featuredAgent.photo}`) : "/img/agent-default.jpg"} alt={featuredAgent.name} />
            <div>
              <div className="agent-mini-name">{featuredAgent.name}</div>
              <div className="agent-mini-role">{featuredAgent.agency || "Agent"}</div>
              <Link to={`/agents/${featuredAgent.id}`} className="agent-mini-link">View profile</Link>
            </div>
          </div>
        </div>
      )}

      {trending?.length > 0 && (
        <div className="sidebar-block">
          <h5>Trending Properties</h5>
          <ul className="sidebar-trending-list">
            {trending.slice(0, 3).map((p) => {
              const images = parseImages(p.images);
              const image = images[0] || null;
              return (
                <li key={p.id}>
                  <Link to={`/properties/${p.id}`} className="trend-link" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={image ? (image.startsWith("http") ? image : `${backendUrl}/storage/${image}`) : "/img/default.jpg"} alt={p.title} style={{ width: 64, height: 46, objectFit: "cover", borderRadius: 8 }} />
                    <div className="trend-meta" style={{ fontSize: 13 }}>
                      <div className="trend-title" style={{ fontWeight: 700 }}>{p.title}</div>
                      <div className="trend-sub">₵{Number(p.price || 0).toLocaleString()}</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
}