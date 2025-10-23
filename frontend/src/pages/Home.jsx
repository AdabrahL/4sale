import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchFilter from "../components/SearchFilter";

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

  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    fetch(`${backendUrl}/api/properties/trending`)
      .then(res => res.json())
      .then(data => setTrending(data.data || []))
      .finally(() => setLoadingTrending(false));
  }, []);

  const handleSearch = () => {
    // You might want to redirect to /properties with filters as query params,
    // or trigger property fetching here.
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="home-page">
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

      {/* Trending Properties Section */}
      <section className="trending-section py-5">
        <div className="container">
          <h2 className="section-title">Trending Properties</h2>
          {loadingTrending ? (
            <div className="trending-loading">Loading trending properties...</div>
          ) : trending.length === 0 ? (
            <div className="trending-empty">No trending properties found.</div>
          ) : (
            <div className="trending-list" style={{display: "flex", gap: "2em", flexWrap: "wrap"}}>
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
                    <h3 style={{fontSize: "1.11em", fontWeight: 700, marginBottom: "0.4em"}}>
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
        </div>
      </section>

      {/* Featured Properties (Placeholder) */}
      <section className="featured-section">
        <div className="container">
          <h2 className="section-title">Featured Properties</h2>
          <div className="featured-list">
            <div className="featured-placeholder">
              <p>Featured properties will be displayed here.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}