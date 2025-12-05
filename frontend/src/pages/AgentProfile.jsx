import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import API from "../api/axios";
import "../styles/agentprofile.css";


const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

function getImageUrl(path) {
  if (!path) return "/default-avatar.png";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) path = path.slice(1);
  return `${backendUrl.replace(/\/$/, "")}/storage/${path.replace(/^storage\//, "")}`;
}

export default function AgentProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("for_sale"); // for_sale, sold, reviews

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
  
  // Separate properties by status
  const forSaleProperties = rawProperties.filter(p => p.status === 'for_sale' || p.status === 'for_rent' || !p.status);
  const soldProperties = rawProperties.filter(p => p.status === 'sold');
  
  const displayedProperties = activeTab === "sold" ? soldProperties : forSaleProperties;
  
  // Calculate stats
  const totalSales = soldProperties.length;
  const salesLast12Months = soldProperties.filter(p => {
    if (!p.sold_date && !p.updated_at) return false;
    const soldDate = new Date(p.sold_date || p.updated_at);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return soldDate >= oneYearAgo;
  }).length;
  
  const prices = rawProperties.map(p => Number(p.price || 0)).filter(p => p > 0);
  const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

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

  return (
    <div className="zillow-agent-profile">
      {/* Hero Section */}
      <div className="agent-profile-hero">
        <div className="agent-hero-container">
          <div className="agent-hero-left">
            <img src={getImageUrl(agent.photo)} alt={agent.name} className="agent-hero-photo" />
          </div>
          <div className="agent-hero-right">
            <h1 className="agent-hero-name">{agent.name}</h1>
            <div className="agent-hero-rating">
              <span className="rating-number">{agent.rating || "5.0"}</span>
              <div className="stars-hero">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fa fa-star"></i>
                ))}
              </div>
              <span className="review-count-hero">{agent.reviews_count || 0} reviews</span>
            </div>
            <div className="agent-hero-company">{agent.agency || "Real Estate Agent"}</div>
            
            {/* Key Stats */}
            <div className="agent-hero-stats">
              <div className="hero-stat">
                <strong>{salesLast12Months}</strong>
                <span>sales last 12 months</span>
              </div>
              <div className="hero-stat">
                <strong>{totalSales}</strong>
                <span>total sales</span>
              </div>
              <div className="hero-stat">
                <strong>₵{minPrice > 0 ? minPrice.toLocaleString() : '0'}-₵{maxPrice.toLocaleString()}</strong>
                <span>price range</span>
              </div>
              <div className="hero-stat">
                <strong>₵{avgPrice.toLocaleString()}</strong>
                <span>average price</span>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="agent-hero-actions">
              {agent.phone && (
                <a href={`tel:${agent.phone}`} className="hero-btn hero-btn-primary">
                  <i className="fa fa-phone"></i> {agent.phone}
                </a>
              )}
              {agent.email && (
                <a href={`mailto:${agent.email}`} className="hero-btn hero-btn-secondary">
                  <i className="fa fa-envelope"></i> Email
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sales Carousel - Only show if there are sold properties */}
      {soldProperties.length > 0 && (
        <div className="recent-sales-section">
          <div className="agent-hero-container">
            <h2 className="section-title">Recent Sales</h2>
            <div className="sales-carousel">
              {soldProperties.slice(0, 5).map((property) => {
                const images = parseImages(property);
                return (
                  <div key={property.id} className="sale-card">
                    <Link to={`/properties/${property.id}`}>
                      {images[0] ? (
                        <img src={getImageUrl(images[0])} alt={property.title} className="sale-img" />
                      ) : (
                        <div className="sale-img-placeholder">No Image</div>
                      )}
                      <div className="sale-info">
                        <div className="sale-specs">
                          {property.bedrooms && `${property.bedrooms}bd`}
                          {property.bathrooms && ` | ${property.bathrooms}ba`}
                          {property.square_feet && ` | ${property.square_feet}sqft`}
                        </div>
                        <div className="sale-location">{property.location}</div>
                        <div className="sale-date">Sold {property.sold_date ? new Date(property.sold_date).toLocaleDateString() : 'recently'}</div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* About Section */}
      {(agent.bio || agent.agency) && (
        <div className="agent-about-section">
          <div className="agent-hero-container">
            <h2 className="section-title">
            {agent.name.split(' ')[0]}'s listings & sales ({rawProperties.length})
          </h2>
            <p className="agent-bio-text">{agent.bio || `${agent.name} is a dedicated real estate professional ready to help you with your property needs.`}</p>
          </div>
        </div>
      )}



      {/* Listings & Sales Tabs */}
      <div className="agent-listings-section">
        
        <div className="agent-hero-container">
          
         
          <div className="listings-section-wrapper">
            {/* Main Content - Tabs and Properties */}
            <div className="listings-main-content">
              {/* Tabs */}
              <div className="listings-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'for_sale' ? 'active' : ''}`}
                  onClick={() => setActiveTab('for_sale')}
                >
                  For Sale ({forSaleProperties.length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'sold' ? 'active' : ''}`}
                  onClick={() => setActiveTab('sold')}
                >
                  Sold ({soldProperties.length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews ({agent.reviews_count || 0})
                </button>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'reviews' ? (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="reviews-section"
                  >
                    <p className="text-muted">No reviews yet. Be the first to review!</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="properties-grid-zillow"
                  >
                    {displayedProperties.length === 0 ? (
                      <div className="no-properties">
                        <i className="fa fa-home"></i>
                        <p>No {activeTab === 'sold' ? 'sold' : 'active'} properties found.</p>
                      </div>
                    ) : (
                      displayedProperties.map((property) => {
                        const images = parseImages(property);
                        return (
                          <div key={property.id} className="property-card-zillow">
                            <Link to={`/properties/${property.id}`} className="property-image-wrapper">
                              {images[0] ? (
                                <img src={getImageUrl(images[0])} alt={property.title} loading="lazy" />
                              ) : (
                                <div className="property-placeholder">No Image</div>
                              )}
                              <div className="property-price-badge">
                                ₵{Number(property.price || 0).toLocaleString()}
                              </div>
                              {activeTab === 'sold' && (
                                <div className="sold-badge">SOLD</div>
                              )}
                            </Link>

                            <div className="property-details-zillow">
                              <Link to={`/properties/${property.id}`} className="property-title-zillow">
                                {property.title}
                              </Link>
                              <div className="property-location-zillow">
                                <i className="fa fa-map-marker"></i> {property.location}
                              </div>
                              <div className="property-specs-zillow">
                                {property.bedrooms && <span>{property.bedrooms} bed</span>}
                                {property.bathrooms && <span>{property.bathrooms} bath</span>}
                                {property.square_feet && <span>{property.square_feet} sqft</span>}
                              </div>

                              {activeTab === 'sold' && (
                                <div className="sold-date">
                                  Sold: {property.sold_date ? new Date(property.sold_date).toLocaleDateString() : 'Recently'}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar - Contact Form */}
            <aside className="contact-sidebar">
              <div className="contact-sidebar-card">
                <h3>Contact {agent.name}</h3>
                <form className="contact-sidebar-form">
                  <input 
                    type="text" 
                    placeholder="Name" 
                    className="contact-sidebar-input" 
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone" 
                    className="contact-sidebar-input" 
                  />
                  <input 
                    type="email" 
                    placeholder="Email" 
                    className="contact-sidebar-input" 
                  />
                  <textarea 
                    placeholder="Message (optional)" 
                    className="contact-sidebar-textarea"
                    rows="4"
                  ></textarea>
                  <button type="submit" className="contact-sidebar-btn">
                    Contact the {agent.agency ? 'team' : 'agent'}
                  </button>
                  <p className="contact-disclaimer-small">
                    By submitting your information, you agree that the real estate professional identified above may call/text you about your inquiry.
                  </p>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="agent-contact-section">
        <div className="agent-hero-container">
          <h2 className="section-title">Get in touch</h2>
          <p style={{ color: '#71717a', marginBottom: '24px' }}>
            Have questions about buying or selling? {agent.name} is here to help.
          </p>
        </div>
      </div>
    </div>
  );
}
