import { Link } from "react-router-dom";

export default function HomeSidebar({ stats, featuredAgent, trending }) {
  return (
    <aside className="home-sidebar">
      {/* Quick Links */}
      <div className="sidebar-section">
        <h5>Quick Links</h5>
        <ul>
          <li><Link to="/properties">Browse Properties</Link></li>
          <li><Link to="/saved">Saved Properties</Link></li>
          <li><Link to="/agents">Find an Agent</Link></li>
          <li><Link to="/properties/create">Post a Property</Link></li>
          <li><Link to="/blog">Read Blog</Link></li>
          <li><Link to="/blog?tab=books">Free Real Estate Books</Link></li>
        </ul>
      </div>

      {/* Tip of the Day */}
      <div className="sidebar-section sidebar-tip">
        <strong>Tip:</strong> Always verify land titles before making payments.
      </div>

      {/* Mini Market Stats */}
      <div className="sidebar-section">
        <h5>Market Summary</h5>
        <div className="sidebar-stats">
          <div><b>Listings today:</b> {stats?.today || 0}</div>
          <div><b>Popular area:</b> {stats?.popular || "N/A"}</div>
          <div><b>Avg. price:</b> ₵{stats?.avgPrice || "N/A"}</div>
        </div>
      </div>

      {/* Featured Agent */}
      {featuredAgent && (
        <div className="sidebar-section sidebar-agent">
          <h5>Featured Agent</h5>
          <div>
            <img src={featuredAgent.photo} alt={featuredAgent.name} className="sidebar-agent-img" />
            <div>{featuredAgent.name}</div>
            <Link to={`/agents/${featuredAgent.id}`}>Profile</Link>
          </div>
        </div>
      )}

      {/* Trending Properties Mini */}
      {trending?.length > 0 && (
        <div className="sidebar-section">
          <h5>Trending Properties</h5>
          <ul className="sidebar-trending-list">
            {trending.slice(0, 2).map((p) => (
              <li key={p.id} style={{display:"flex", alignItems:"center", marginBottom:"1em"}}>
                <Link to={`/properties/${p.id}`} style={{display:"flex", alignItems:"center", gap:"0.7em", textDecoration:"none"}}>
                  <img src={
                    p.images && p.images.length > 0
                      ? (typeof p.images === "string" ? JSON.parse(p.images)[0] : p.images[0])
                      : "/img/default.jpg"
                  } alt={p.title} className="sidebar-trending-img" />
                  <div style={{color:"#228B22", fontWeight:"600"}}>
                    {p.title}
                    <div style={{fontSize:"0.97em", color:"#196f1a"}}>₵{Number(p.price).toLocaleString()}</div>
                    <div style={{fontSize:"0.96em", color:"#3c463f"}}>{p.location}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}