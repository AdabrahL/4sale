import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import SearchFilter from "../components/SearchFilter";
import HomeSidebar from "../components/HomeSidebar";
import TextType from "../components/TextType";

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

function getImageUrl(img) {
  if (!img) return "/img/default.jpg";
  return img.startsWith("http") ? img : `${backendUrl}/storage/${img}`;
}

export default function Home() {
  const [filters, setFilters] = useState({
    category: "",
    type: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    status: "",
  });

  // Trending Properties
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  // Featured Properties
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Top Agents
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  // Latest Blogs
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  const pageContainerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    // Trending properties (keep fetch approach but normalize)
    (async () => {
      try {
        const res = await API.get("/properties/trending");
        const payload = res.data?.data ?? res.data ?? [];
        const dataArr = Array.isArray(payload) ? payload : payload.data ?? [];
        if (!mounted) return;
        setTrending(dataArr);
      } catch (err) {
        console.error("Failed to load trending properties:", err?.response?.data ?? err.message);
        setTrending([]);
      } finally {
        if (mounted) setLoadingTrending(false);
      }
    })();

    // Featured properties
    (async () => {
      try {
        const res = await API.get("/properties", { params: { per_page: 6 } });
        const payload = res.data?.data ?? res.data ?? [];
        const dataArr = Array.isArray(payload) ? payload : payload.data ?? [];
        if (!mounted) return;
        setFeatured(dataArr.slice(0, 6));
      } catch (err) {
        console.error("Failed to load featured properties:", err?.response?.data ?? err.message);
        setFeatured([]);
      } finally {
        if (mounted) setLoadingFeatured(false);
      }
    })();

    // Agents
    (async () => {
      try {
        const res = await API.get("/agents", { params: { per_page: 12 } });
        const payload = res.data?.data ?? res.data ?? [];
        const dataArr = Array.isArray(payload) ? payload : payload.data ?? [];
        if (!mounted) return;
        setAgents(dataArr.slice(0, 12));
      } catch (err) {
        console.error("Failed to load agents:", err?.response?.data ?? err.message);
        setAgents([]);
      } finally {
        if (mounted) setLoadingAgents(false);
      }
    })();

    // Blogs — use same normalization as Blog.jsx
    (async () => {
      try {
        const res = await API.get("/blogs", { params: { per_page: 10 } });
        const payload = res.data?.data ?? res.data ?? [];
        const dataArr = Array.isArray(payload) ? payload : payload.data ?? [];
        if (!mounted) return;
        // keep up to 10 latest blogs
        setBlogs(dataArr.slice(0, 10));
        console.debug("Home: loaded blogs payload:", { payload, dataArr });
      } catch (err) {
        console.error("Failed to load blogs for Home:", err?.response?.data ?? err.message);
        setBlogs([]);
      } finally {
        if (mounted) setLoadingBlogs(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const handleSearch = () => {
    // navigate to /properties with filters as query params or trigger search
    // e.g. navigate(`/properties?${new URLSearchParams(filters)}`)
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Sidebar stats (derived)
  const stats = {
    today: trending.length,
    popular: trending[0]?.location || "N/A",
    avgPrice: trending.length
      ? Math.round(trending.reduce((sum, p) => sum + Number(p.price || 0), 0) / trending.length)
      : "N/A",
  };
  const featuredAgent = agents[0] || null;

  // Top read blogs (or random fallback)
  const topReadBlogs = useMemo(() => {
    if (!blogs || blogs.length === 0) return [];
    const sorted = [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0));
    const anyViews = sorted.some((b) => (b.views || 0) > 0);
    if (anyViews) return sorted.slice(0, 3);
    // fallback to random picks
    const shuffled = [...blogs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [blogs]);

  return (
    <div className="home-page" style={{ background: "#f7fff5" }}>
      {/* Hero */}
      <section
        className="hero-section"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')",
        }}
      >
        <div className="hero-container">
          <div className="hero-text">
            <TextType
              text={["Find Your Dream Property Today", "Find Your Dream Property Today"]}
              typingSpeed={100}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter=""
              className="hero-title"
              element="h1"
            />
            <p>
              Buy, sell or invest — browse trusted listings and find a local agent to help.
            </p>

            <div className="hero-action">
              <Link to="/properties" className="hero-btn">
                Browse Properties
              </Link>
              <Link to="/blog" className="hero-btn hero-btn--outline">
                Read Blog
              </Link>
            </div>

            <div className="home-search-filter" style={{ marginTop: 22 }}>
              <SearchFilter filters={filters} onChange={handleFilterChange} onSearch={handleSearch} showStatus />
            </div>
          </div>
        </div>
      </section>

      {/* Main layout: left content + sticky sidebar (sidebar is sticky via CSS) */}
      <div className="container home-row-wrapper" ref={pageContainerRef}>
        <div className="home-main-col">
          {/* Trending */}
          <section className="section">
            <div className="section-header">
              <h2>🔥 Trending Properties</h2>
              <Link to="/properties" className="small-link">View all</Link>
            </div>

            {loadingTrending ? (
              <div className="cards-row">
                {[1,2,3].map(i => <div className="card-skeleton" key={i} />)}
              </div>
            ) : trending.length === 0 ? (
              <div className="empty">No trending properties found.</div>
            ) : (
              <div className="cards-row">
                {trending.map((property) => {
                  const images = parseImages(property.images);
                  return (
                    <article key={property.id} className="card property-card">
                      <Link to={`/properties/${property.id}`} className="card-media">
                        <img src={ images[0] ? getImageUrl(images[0]) : "/img/default.jpg" } alt={property.title} loading="lazy" />
                      </Link>
                      <div className="card-body">
                        <Link to={`/properties/${property.id}`} className="card-title">{property.title}</Link>
                        <div className="card-price">₵{Number(property.price).toLocaleString()}</div>
                        <div className="card-meta">
                          <span className="meta-location"><i className="fa fa-map-marker"></i> {property.location}</span>
                          <div className="meta-stats">
                            {property.bedrooms && <span><i className="fa fa-bed"></i> {property.bedrooms}</span>}
                            {property.bathrooms && <span><i className="fa fa-bath"></i> {property.bathrooms}</span>}
                            {property.size && <span><i className="fa fa-expand"></i> {property.size} sqft</span>}
                          </div>
                        </div>

                        {/* Inline agent (if property has user/agent) */}
                        {property.user && (
                          <div className="property-agent-inline" style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                            <img src={property.user.photo ? (property.user.photo.startsWith("http") ? property.user.photo : `${backendUrl}/storage/${property.user.photo}`) : "/img/agent-default.jpg"} alt={property.user.name} style={{ width:40, height:40, borderRadius: "50%", objectFit: "cover" }} />
                            <div style={{ fontSize: 14 }}>
                              <div style={{ fontWeight: 700 }}>{property.user.name}</div>
                              <Link to={`/agents/${property.user.id}`} className="small-link">Contact agent</Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Featured */}
          <section className="section">
            <div className="section-header">
              <h2>🌟 Featured Properties</h2>
              <Link to="/properties?featured=1" className="small-link">See featured</Link>
            </div>

            {loadingFeatured ? (
              <div className="cards-row">
                {[1,2,3].map(i => <div className="card-skeleton" key={i} />)}
              </div>
            ) : featured.length === 0 ? (
              <div className="featured-placeholder">No featured properties yet.</div>
            ) : (
              <div className="cards-row">
                {featured.map((property) => {
                  const images = parseImages(property.images);
                  return (
                    <article key={property.id} className="card property-card small">
                      <Link to={`/properties/${property.id}`} className="card-media">
                        <img src={ images[0] ? getImageUrl(images[0]) : "/img/default.jpg" } alt={property.title} loading="lazy" />
                      </Link>
                      <div className="card-body">
                        <Link to={`/properties/${property.id}`} className="card-title">{property.title}</Link>
                        <div className="card-price">₵{Number(property.price).toLocaleString()}</div>
                        <div className="card-meta small">{property.location}</div>

                        {property.user ? (
                          <div className="property-agent-inline" style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                            <img src={property.user.photo ? (property.user.photo.startsWith("http") ? property.user.photo : `${backendUrl}/storage/${property.user.photo}`) : "/img/agent-default.jpg"} alt={property.user.name} style={{ width:36, height:36, borderRadius: "50%", objectFit: "cover" }} />
                            <div style={{ fontSize: 13 }}>
                              <div style={{ fontWeight: 700 }}>{property.user.name}</div>
                              <Link to={`/agents/${property.user.id}`} className="small-link">View profile</Link>
                            </div>
                          </div>
                        ) : (
                          <div style={{ marginTop: 10 }}>
                            <Link to="/agents" className="small-link">Find agents for this listing</Link>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Available Agents */}
          <section className="section">
            <div className="section-header">
              <h2>🧑‍💼 Available Agents</h2>
              <Link to="/agents" className="small-link">Browse all agents</Link>
            </div>

            {loadingAgents ? (
              <div className="agents-row">
                {[1,2,3,4].map(i => <div key={i} className="agent-skeleton" />)}
              </div>
            ) : agents.length === 0 ? (
              <div className="empty">No agents found.</div>
            ) : (
              <div className="agents-row">
                {agents.slice(0,6).map((agent) => (
                  <div key={agent.id} className="agent-card">
                    <img src={agent.photo ? getImageUrl(agent.photo) : "/img/agent-default.jpg"} alt={agent.name} />
                    <div className="agent-info">
                      <div className="agent-name">{agent.name}</div>
                      <div className="agent-role">{agent.agency || agent.role || "Agent"}</div>
                    </div>
                    <Link to={`/agents/${agent.id}`} className="agent-btn">View</Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Latest Blogs */}
          <section className="section">
            <div className="section-header">
              <h2>📰 Latest Blog Posts</h2>
              <Link to="/blog" className="small-link">Explore blog</Link>
            </div>

            {/* Top Reads mini-row */}
            {loadingBlogs ? null : topReadBlogs.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <h4 style={{ margin: "6px 0 8px", color: "#15521a" }}>Top reads</h4>
                <div className="cards-row" style={{ gap: 12 }}>
                  {topReadBlogs.map((b) => (
                    <article key={`top-${b.id}`} className="card blog-card" style={{ width: 260 }}>
                      <Link to={`/blog/${b.id}`} className="card-media">
                        <img src={b.image ? getImageUrl(b.image) : "/img/blog-default.jpg"} alt={b.title} loading="lazy" />
                      </Link>
                      <div className="card-body">
                        <Link to={`/blog/${b.id}`} className="card-title">{b.title}</Link>
                        <div className="card-meta small">{b.created_at?.slice(0,10)} • <span style={{ fontWeight:700 }}>{b.views || 0} views</span></div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {loadingBlogs ? (
              <div className="cards-row">
                {[1,2,3].map(i => <div className="card-skeleton" key={i} />)}
              </div>
            ) : blogs.length === 0 ? (
              <div className="empty">No blog posts found.</div>
            ) : (
              <div className="cards-row">
                {blogs.map(blog => (
                  <article key={blog.id} className="card blog-card">
                    <Link to={`/blog/${blog.id}`} className="card-media">
                      <img src={blog.image ? getImageUrl(blog.image) : "/img/blog-default.jpg"} alt={blog.title} loading="lazy" />
                    </Link>
                    <div className="card-body">
                      <Link to={`/blog/${blog.id}`} className="card-title">{blog.title}</Link>
                      <div className="card-excerpt">{(blog.excerpt || blog.description || "").slice(0, 100)}{(blog.excerpt || blog.description || "").length > 100 ? "..." : ""}</div>
                      <div className="card-meta small">{blog.created_at?.slice(0,10)}</div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* CTA */}
          <section className="cta">
            <h3>Ready to list your property?</h3>
            <Link to="/properties/create" className="hero-btn cta-btn">Post Your Listing</Link>
          </section>
        </div>

        {/* Sidebar */}
        <HomeSidebar stats={stats} featuredAgent={featuredAgent} trending={trending} />
      </div>
    </div>
  );
}