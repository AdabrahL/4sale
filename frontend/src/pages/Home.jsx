import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchFilter from "../components/SearchFilter";
import HomeSidebar from "../components/HomeSidebar";


const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";
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

  // Sidebar stats and agent (mock for demo, replace with real API)
  const stats = {
    today: trending.length,
    popular: trending[0]?.location || "N/A",
    avgPrice: trending.length
      ? Math.round(
          trending.reduce((sum, p) => sum + Number(p.price || 0), 0) /
            trending.length
        )
      : "N/A",
  };
  const featuredAgent = agents[0] || null;

  useEffect(() => {
    fetch(`${backendUrl}/api/properties/trending`)
      .then(res => res.json())
      .then(data => setTrending(data.data || []))
      .finally(() => setLoadingTrending(false));

    fetch(`${backendUrl}/api/properties`)
      .then(res => res.json())
      .then(data => setFeatured((data.data || []).slice(0, 4)))
      .finally(() => setLoadingFeatured(false));

    fetch(`${backendUrl}/api/agents`)
      .then(res => res.json())
      .then(data => setAgents((data.data || []).slice(0, 4)))
      .finally(() => setLoadingAgents(false));

    fetch(`${backendUrl}/api/blogs`)
      .then(res => res.json())
      .then(data => setBlogs((data.data || []).slice(0, 3)))
      .finally(() => setLoadingBlogs(false));
  }, []);

  const handleSearch = () => {
    // Redirect to /properties with filters as query params, or trigger property fetching here
    // Example: navigate(`/properties?${new URLSearchParams(filters)}`)
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="home-page" style={{minHeight:"100vh", background:"#f7fff5"}}>
      {/* Hero Section */}
      <section
        className="hero-section set-bg"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')",
        }}
      >
        <div className="hero-container">
          <div className="hero-text">
            <h1>Find Your Dream Property Today</h1>
            <p>
              Buy, Sell, or Invest in Lands, Houses &amp; Commercial Properties — All with Trusted Agents.
            </p>
            <div className="hero-action">
              <Link to="/properties" className="hero-btn">
                Browse Properties
              </Link>
              <Link to="/blog" className="hero-btn hero-btn--outline ms-3">
                Read Blog
              </Link>
            </div>
            <div className="home-search-filter mt-4">
              <SearchFilter
                filters={filters}
                onChange={handleFilterChange}
                onSearch={handleSearch}
                showStatus={true}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{display:"flex", gap:"3.5em", alignItems:"flex-start", marginTop:"-45px", paddingBottom:"2em"}}>
        <div style={{flex:1}}>
          {/* Trending Properties Section */}
          <section className="trending-section py-5">
            <h2 className="section-title">🔥 Trending Properties</h2>
            {loadingTrending ? (
              <div className="trending-loading">Loading trending properties...</div>
            ) : trending.length === 0 ? (
              <div className="trending-empty">No trending properties found.</div>
            ) : (
              <div className="trending-list" style={{display: "flex", gap: "2em", flexWrap: "wrap", justifyContent:"flex-start"}}>
                {trending.map(property => (
                  <div key={property.id} className="trending-card" style={{
                    background: "#fff",
                    borderRadius: "14px",
                    boxShadow: "0 4px 16px #228b2220",
                    width: "320px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative"
                  }}>
                    <Link to={`/properties/${property.id}`}>
                      <img
                        src={
                          property.images && property.images.length > 0
                            ? getImageUrl(
                                typeof property.images === "string"
                                  ? JSON.parse(property.images)[0]
                                  : property.images[0]
                              )
                            : "/img/default.jpg"
                        }
                        alt={property.title}
                        style={{
                          width: "100%",
                          height: "170px",
                          objectFit: "cover",
                          borderTopLeftRadius: "14px",
                          borderTopRightRadius: "14px",
                        }}
                      />
                    </Link>
                    <div style={{padding: "1.1em 1em 1.3em 1em", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
                      <h3 style={{fontSize: "1.13em", fontWeight: 700, marginBottom: "0.4em"}}>
                        <Link to={`/properties/${property.id}`} style={{color: "#228B22", textDecoration: "none"}}>
                          {property.title}
                        </Link>
                      </h3>
                      <div style={{fontWeight: 600, color: "#228B22", marginBottom: "0.3em"}}>
                        ₵{Number(property.price).toLocaleString()}
                      </div>
                      <div style={{color: "#477144", fontSize: "1.04em", marginBottom: "0.5em"}}>
                        <i className="fa fa-map-marker map-icon-green"></i> {property.location}
                      </div>
                      <div style={{display: "flex", gap: "1em", color: "#888", fontSize: "1em", marginTop: "auto"}}>
                        {property.bedrooms && (
                          <span><i className="fa fa-bed meta-icon-gray"></i> {property.bedrooms}</span>
                        )}
                        {property.bathrooms && (
                          <span><i className="fa fa-bath meta-icon-gray"></i> {property.bathrooms}</span>
                        )}
                        {property.size && (
                          <span><i className="fa fa-expand meta-icon-gray"></i> {property.size} sqft</span>
                        )}
                      </div>
                      <div style={{position:"absolute", bottom: "16px", right: "18px", background: "#e9f7ef", color: "#228B22", borderRadius: "22px", padding: "0.23em 0.8em", fontWeight: 600, fontSize: "0.98em", display: "flex", alignItems: "center", gap: "0.3em"}}>
                        <i className="fa fa-eye"></i> {property.views || 0}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Featured Properties Section */}
          <section className="featured-section" style={{marginTop:"2em"}}>
            <h2 className="section-title">🌟 Featured Properties</h2>
            {loadingFeatured ? (
              <div className="featured-loading">Loading featured properties...</div>
            ) : featured.length === 0 ? (
              <div className="featured-empty">No featured properties found.</div>
            ) : (
              <div className="featured-list" style={{display: "flex", gap: "2em", flexWrap: "wrap", justifyContent:"flex-start"}}>
                {featured.map(property => (
                  <div key={property.id} className="featured-card" style={{
                    background: "#fff",
                    borderRadius: "14px",
                    boxShadow: "0 4px 16px #228b2220",
                    width: "320px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative"
                  }}>
                    <Link to={`/properties/${property.id}`}>
                      <img
                        src={
                          property.images && property.images.length > 0
                            ? getImageUrl(
                                typeof property.images === "string"
                                  ? JSON.parse(property.images)[0]
                                  : property.images[0]
                              )
                            : "/img/default.jpg"
                        }
                        alt={property.title}
                        style={{
                          width: "100%",
                          height: "170px",
                          objectFit: "cover",
                          borderTopLeftRadius: "14px",
                          borderTopRightRadius: "14px",
                        }}
                      />
                    </Link>
                    <div style={{padding: "1.1em 1em 1.3em 1em"}}>
                      <h3 style={{fontSize: "1.13em", fontWeight: 700, marginBottom: "0.4em"}}>
                        <Link to={`/properties/${property.id}`} style={{color: "#228B22", textDecoration: "none"}}>
                          {property.title}
                        </Link>
                      </h3>
                      <div style={{fontWeight: 600, color: "#228B22", marginBottom: "0.3em"}}>
                        ₵{Number(property.price).toLocaleString()}
                      </div>
                      <div style={{color: "#477144", fontSize: "1.04em", marginBottom: "0.5em"}}>
                        <i className="fa fa-map-marker map-icon-green"></i> {property.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Top Agents Section */}
          <section className="agents-section py-4" style={{marginTop:"2em"}}>
            <h2 className="section-title">🏆 Top Agents</h2>
            {loadingAgents ? (
              <div className="agents-loading">Loading agents...</div>
            ) : agents.length === 0 ? (
              <div className="agents-empty">No agents found.</div>
            ) : (
              <div className="agents-list" style={{display: "flex", gap: "2em", flexWrap: "wrap", justifyContent:"flex-start"}}>
                {agents.map(agent => (
                  <div key={agent.id} className="agent-card" style={{
                    background: "#fff",
                    borderRadius: "14px",
                    boxShadow: "0 4px 16px #228b2220",
                    width: "260px",
                    padding: "1.2em 0.7em 1em 0.7em",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                  }}>
                    <img
                      src={
                        agent.photo
                          ? getImageUrl(agent.photo)
                          : "/img/agent-default.jpg"
                      }
                      alt={agent.name}
                      style={{
                        width: "62px",
                        height: "62px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2.5px solid #228B22",
                        marginBottom: "0.8em"
                      }}
                    />
                    <div style={{fontWeight: 700, fontSize: "1.07em", color: "#228B22", marginBottom: "0.2em"}}>{agent.name}</div>
                    <div style={{color: "#3c463f", fontSize: "1.01em", marginBottom: "0.8em"}}>{agent.agency || agent.role || "Agent"}</div>
                    <Link to={`/agents/${agent.id}`} className="agent-card-link" style={{
                      background: "#228B22",
                      color: "#fff",
                      padding: "0.5em 1.2em",
                      borderRadius: "7px",
                      fontWeight: 500,
                      textDecoration: "none",
                      fontSize: "0.98em"
                    }}>View Profile</Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Latest Blog Posts */}
          <section className="blog-section py-4" style={{marginTop:"2em"}}>
            <h2 className="section-title">📰 Latest Blog Posts</h2>
            {loadingBlogs ? (
              <div className="blog-loading">Loading blog posts...</div>
            ) : blogs.length === 0 ? (
              <div className="blog-empty">No blog posts found.</div>
            ) : (
              <div className="blog-list" style={{display: "flex", gap: "2em", flexWrap: "wrap", justifyContent:"flex-start"}}>
                {blogs.map(blog => (
                  <div key={blog.id} className="blog-card" style={{
                    background: "#fff",
                    borderRadius: "14px",
                    boxShadow: "0 4px 16px #228b2220",
                    width: "320px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative"
                  }}>
                    <Link to={`/blog/${blog.id}`}>
                      <img
                        src={
                          blog.image
                            ? getImageUrl(blog.image)
                            : "/img/blog-default.jpg"
                        }
                        alt={blog.title}
                        style={{
                          width: "100%",
                          height: "120px",
                          objectFit: "cover",
                          borderTopLeftRadius: "14px",
                          borderTopRightRadius: "14px",
                        }}
                      />
                    </Link>
                    <div style={{padding: "1em 1em 1.2em 1em", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
                      <h3 style={{fontSize: "1.06em", fontWeight: 700, marginBottom: "0.4em"}}>
                        <Link to={`/blog/${blog.id}`} style={{color: "#228B22", textDecoration: "none"}}>
                          {blog.title}
                        </Link>
                      </h3>
                      <div style={{color: "#3c463f", fontSize: "0.99em", marginBottom: "0.5em"}}>
                        {blog.excerpt?.slice(0, 100)}{blog.excerpt?.length > 100 && "..."}
                      </div>
                      <div style={{color: "#859387", fontSize: "0.95em"}}>
                        {blog.created_at?.slice(0,10)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Call to Action */}
          <section className="cta-section py-5" style={{marginTop:"2em"}}>
            <div style={{textAlign:"center"}}>
              <h2 style={{color:"#228B22", fontWeight:700, fontSize:"2rem", marginBottom:"1.1em"}}>Ready to List Your Property?</h2>
              <Link to="/properties/create" className="hero-btn" style={{fontSize:"1.15em", padding:"0.8em 3em", borderRadius:"100px"}}>
                Post Your Listing
              </Link>
            </div>
          </section>
        </div>
        {/* Sidebar */}
        <HomeSidebar stats={stats} featuredAgent={featuredAgent} trending={trending} />
      </div>
    </div>
  );
}