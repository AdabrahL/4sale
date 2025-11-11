import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";


const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";

function getImageUrl(path) {
  if (!path) return "/default-avatar.png";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) path = path.slice(1);
  return `${backendUrl.replace(/\/$/, "")}/storage/${path.replace(/^storage\//, "")}`;
}

export default function AgentProfile() {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`${backendUrl}/api/agents/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`${res.status} ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        const agentObj = data?.data ?? data;
        setAgent(agentObj);
      })
      .catch((err) => {
        console.error("Failed to load agent:", err);
        setError("Failed to load agent profile.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container py-5">Loading agent profile...</div>;
  if (error) return <div className="container py-5 text-danger">{error}</div>;
  if (!agent) return <div className="container py-5">Agent not found.</div>;

  const rawProperties = agent.properties ?? agent.listings ?? [];

  function parseImages(prop) {
    if (!prop) return [];
    const img = prop.images ?? prop.photos ?? prop.gallery;
    if (!img) return [];
    if (Array.isArray(img)) return img;
    if (typeof img === "string") {
      try {
        const parsed = JSON.parse(img);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        if (img.includes(",")) return img.split(",").map((s) => s.trim());
        return [img];
      }
    }
    return [];
  }

  const filteredProperties = rawProperties.filter((property) => {
    if (!property) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const title = (property.title || "").toLowerCase();
    const location = (property.location || "").toLowerCase();
    const type = (property.property_type || property.type || "").toLowerCase();
    return title.includes(q) || location.includes(q) || type.includes(q);
  });

  return (
    <div className="agent-profile container py-5">
      {/* Agent header — spans full width */}
      <div className="agent-header card shadow-sm mb-4">
        <div className="agent-header-inner">
          <div className="agent-photo-col">
            <img
              src={getImageUrl(agent.photo)}
              alt={agent.name}
              className="agent-photo"
              loading="lazy"
            />
          </div>

          <div className="agent-meta-col">
            <div className="agent-meta-top">
              <h2 className="agent-name">{agent.name}</h2>
              <div className="agent-sub">{agent.agency ?? agent.role ?? "Real Estate Agent"}</div>
              <div className="agent-bio">{agent.bio || agent.description || "No bio provided yet."}</div>

              <div className="agent-socials">
                {agent.socials &&
                  Object.entries(agent.socials).map(([k, v]) =>
                    v ? (
                      <a
                        key={k}
                        href={k === "whatsapp" ? `https://wa.me/${v.replace(/[^0-9]/g, "")}` : v}
                        target="_blank"
                        rel="noreferrer"
                        className="social-pill"
                      >
                        <i className={`fab fa-${k === "whatsapp" ? "whatsapp" : k}`}></i> {k}
                      </a>
                    ) : null
                  )}
              </div>
            </div>

            <div className="agent-stats">
              <div>
                <div className="stat-num">{rawProperties.length}</div>
                <div className="stat-label">Listings</div>
              </div>
              <div>
                <div className="stat-num">{agent.reviews_count ?? "—"}</div>
                <div className="stat-label">Reviews</div>
              </div>
              <div>
                <div className="stat-num">{agent.rating ?? "—"}</div>
                <div className="stat-label">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New layout: properties (3fr) on the left, sticky agent card (1fr) on the right */}
      <div className="agent-content-grid">
        {/* Left: Properties list (3 parts) */}
        <main className="agent-properties">
          <div className="properties-top mb-3">
            <div>
              <h5 className="mb-0">Properties Listed</h5>
              <small className="text-muted">{filteredProperties.length} results</small>
            </div>

            <div style={{ minWidth: 280 }}>
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search properties by title, location, or type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="agent-profile-grid">
            {filteredProperties.length === 0 ? (
              <div className="no-results">No properties found.</div>
            ) : (
              filteredProperties.map((property) => {
                const images = parseImages(property);
                const firstImage = images.length ? images[0] : null;
                return (
                  <article key={property.id} className="property-card">
                    <Link to={`/properties/${property.id}`} className="property-media">
                      {firstImage ? (
                        <img src={getImageUrl(firstImage)} alt={property.title} loading="lazy" />
                      ) : (
                        <div className="property-media-placeholder">No Image</div>
                      )}
                      <div className="price-badge">₵{Number(property.price || 0).toLocaleString()}</div>
                    </Link>

                    <div className="property-body">
                      <h6 className="property-title">
                        <Link to={`/properties/${property.id}`}>{property.title}</Link>
                      </h6>
                      <div className="property-meta">
                        <span className="muted">
                          <i className="fa fa-map-marker"></i> {property.location}
                        </span>
                        <span className="muted">
                          <i className="fa fa-tag"></i> {property.property_type}
                        </span>
                      </div>
                      <p className="property-desc">
                        {(property.description || "").slice(0, 120)}
                        {(property.description || "").length > 120 ? "…" : ""}
                      </p>

                      <div className="property-footer">
                        <small className="muted">Posted: {property.created_at ? property.created_at.slice(0, 10) : "—"}</small>
                        <div className="actions">
                          <Link to={`/properties/${property.id}`} className="btn btn-sm btn-outline-success">
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </main>

        {/* Right: compact sticky agent card (1 part) */}
        <aside className="agent-sidebar" aria-label="Agent summary">
          <div className="agent-sidebar-card">
            <img src={getImageUrl(agent.photo)} alt={agent.name} className="agent-sidebar-photo" />
            <h4 className="agent-sidebar-name">{agent.name}</h4>
            <div className="agent-sidebar-role">{agent.agency ?? agent.role ?? "Agent"}</div>

            <div className="agent-sidebar-contact mt-3">
              {agent.phone && (
                <a className="btn btn-success btn-sm w-100 mb-2" href={`tel:${agent.phone}`}>
                  <i className="fa fa-phone"></i> Call
                </a>
              )}
              {agent.email && (
                <a className="btn btn-outline-secondary btn-sm w-100" href={`mailto:${agent.email}`}>
                  <i className="fa fa-envelope"></i> Email
                </a>
              )}
            </div>

            <div className="agent-sidebar-stats mt-3">
              <div>
                <div className="stat-num">{rawProperties.length}</div>
                <div className="stat-label">Listings</div>
              </div>
              <div>
                <div className="stat-num">{agent.reviews_count ?? "—"}</div>
                <div className="stat-label">Reviews</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}