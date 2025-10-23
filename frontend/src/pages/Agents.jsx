import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AgentSidebar from "../components/AgentSidebar";


// Add the backend URL for images (from .env or fallback)
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";

// Utility function to get full photo URL
function getPhotoUrl(photo) {
  if (!photo) return "/default-avatar.png";
  return photo.startsWith("http") ? photo : `${backendUrl}/storage/${photo}`;
}

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); // Search/filter text

  useEffect(() => {
    fetch(`${backendUrl}/api/agents`)
      .then(res => res.json())
      .then(data => {
        setAgents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter agents by name, bio, location
  const filteredAgents = agents.filter(agent =>
    (agent.name?.toLowerCase().includes(search.toLowerCase()) ||
      agent.bio?.toLowerCase().includes(search.toLowerCase()) ||
      agent.properties.some(p => p.location?.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="agents-meqasa-bg">
      <div className="agents-meqasa-container">
        <div className="agents-meqasa-header">
          <h1 className="agents-meqasa-title">Find Real Estate Agents in Ghana</h1>
          <p className="agents-meqasa-desc">
            Browse Ghana’s leading property agents. View their profiles and contact them directly.
          </p>
          <div className="agents-meqasa-searchbar">
            <input
              type="text"
              placeholder="Search agents by name, bio, or area..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="agents-meqasa-searchinput"
            />
            <button className="agents-meqasa-searchbtn">
              <i className="fa fa-search"></i>
            </button>
          </div>
        </div>
        <div className="row gx-5">
          <div className="col-lg-8 col-12">
            <div className="agents-meqasa-list">
              {loading ? (
                <div className="agents-meqasa-loading">Loading agents...</div>
              ) : filteredAgents.length === 0 ? (
                <div className="agents-meqasa-empty">No agents found.</div>
              ) : (
                <div className="agents-meqasa-grid">
                  {filteredAgents.map(agent => (
                    <div key={agent.id} className="agents-meqasa-card">
                      <div className="agents-meqasa-avatarwrap">
                        <img
                          src={getPhotoUrl(agent.photo)}
                          alt={agent.name}
                          className="agents-meqasa-avatar"
                        />
                      </div>
                      <div className="agents-meqasa-card-body">
                        <h2 className="agents-meqasa-card-name">
                          <Link to={`/agents/${agent.id}`}>{agent.name}</Link>
                        </h2>
                        <div className="agents-meqasa-card-bio">{agent.bio}</div>
                        <div className="agents-meqasa-card-info">
                          <span><i className="fa fa-phone"></i> {agent.phone || "N/A"}</span>
                          <span><i className="fa fa-envelope"></i> {agent.email || "N/A"}</span>
                        </div>
                        <div className="agents-meqasa-card-properties">
                          <span>
                            <i className="fa fa-home"></i> Properties: {agent.properties_count}
                          </span>
                          <span>
                            <i className="fa fa-map-marker"></i>{" "}
                            {[...new Set(agent.properties.map(p => p.location))]
                              .filter(Boolean)
                              .join(', ') || "—"}
                          </span>
                        </div>
                        <Link to={`/agents/${agent.id}`} className="agents-meqasa-profilebtn">
                          View Agent Profile
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="col-lg-4 col-12">
            <AgentSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}