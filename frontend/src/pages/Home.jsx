import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectCoverflow } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

import API from "../api/axios";
import SearchFilter from "../components/SearchFilter";
import TextType from "../components/TextType";
import { PropertyCardSkeleton, BlogCardSkeleton, AgentCardSkeleton } from "../components/Skeletons";
import { AnimatedSection, StaggerGrid, StaggerItem } from "../components/AnimatedComponents";

// Import custom carousel styles
import "../styles/trending-carousel.css";
import "../styles/featured-properties.css";
import "../styles/home-blog-section.css";

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

  const [showTipBanner, setShowTipBanner] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Real estate tips array
  const realEstateTips = [
    {
      icon: "💡",
      title: "Tip of the Day",
      text: "Always verify land titles and use a local surveyor before making payments."
    },
    {
      icon: "🔍",
      title: "Property Inspection",
      text: "Never buy property without visiting the location first. Photos can be misleading."
    },
    {
      icon: "📋",
      title: "Legal Advice",
      text: "Have a lawyer review all contracts and agreements before signing any documents."
    },
    {
      icon: "👥",
      title: "Work with Professionals",
      text: "Use verified and licensed real estate agents for secure transactions."
    },
    {
      icon: "💰",
      title: "Market Research",
      text: "Compare prices in the area to ensure you're getting fair market value."
    },
    {
      icon: "🏘️",
      title: "Neighborhood Check",
      text: "Research the neighborhood's amenities, schools, and future development plans."
    },
    {
      icon: "📊",
      title: "Investment Strategy",
      text: "Consider rental yield and capital appreciation potential before investing."
    },
    {
      icon: "🔐",
      title: "Secure Transactions",
      text: "Never make full payment upfront. Use escrow services for large transactions."
    },
    {
      icon: "🏗️",
      title: "Building Inspection",
      text: "Hire a professional to inspect the property structure before purchase."
    },
    {
      icon: "📱",
      title: "Stay Updated",
      text: "Follow market trends and property news to make informed decisions."
    }
  ];

  // Rotate tips every 10 seconds
  useEffect(() => {
    if (!showTipBanner) return;

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % realEstateTips.length);
    }, 10000); // Change tip every 10 seconds

    return () => clearInterval(interval);
  }, [showTipBanner, realEstateTips.length]);

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
        const res = await API.get("/properties/featured");
        const payload = res.data?.data ?? res.data ?? [];
        const dataArr = Array.isArray(payload) ? payload : payload.data ?? [];
        if (!mounted) return;
        setFeatured(dataArr);
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

  // Stats calculation
  const stats = useMemo(() => {
    const avgPrice = trending.length
      ? Math.round(trending.reduce((sum, p) => sum + Number(p.price || 0), 0) / trending.length)
      : 0;
    
    return {
      totalListings: trending.length + featured.length,
      activeAgents: agents.length,
      avgPrice: avgPrice,
      popularLocation: trending[0]?.location || featured[0]?.location || "N/A",
    };
  }, [trending, featured, agents]);

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
      {/* Tip Banner */}
      <AnimatePresence>
        {showTipBanner && (
          <motion.div
            key={currentTipIndex}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="tip-banner"
          >
            <div className="tip-banner-content">
              <motion.div 
                className="tip-icon"
                key={`icon-${currentTipIndex}`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                {realEstateTips[currentTipIndex].icon}
              </motion.div>
              <motion.div 
                className="tip-text"
                key={`text-${currentTipIndex}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <strong>{realEstateTips[currentTipIndex].title}:</strong> {realEstateTips[currentTipIndex].text}
              </motion.div>
              <button 
                onClick={() => setShowTipBanner(false)} 
                className="tip-close"
                aria-label="Close tip"
              >
                ✕
              </button>
            </div>
            
            {/* Tip indicators */}
            <div className="tip-indicators">
              {realEstateTips.map((_, index) => (
                <button
                  key={index}
                  className={`tip-dot ${index === currentTipIndex ? 'active' : ''}`}
                  onClick={() => setCurrentTipIndex(index)}
                  aria-label={`Go to tip ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero with animated overlay */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hero-section gradient-overlay"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')",
        }}
      >
        <div className="hero-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="hero-text"
          >
            <TextType
              text={["Find Your Dream Property Today","Find Your Dream Property Today"]}
              typingSpeed={100}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter=""
              className="hero-title"
              element="h1"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Buy, sell or invest — browse trusted listings and find a local agent to help.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="hero-action"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/properties" className="hero-btn ripple">
                  Browse Properties
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/blog" className="hero-btn hero-btn--outline ripple">
                  Read Blog
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="home-search-filter glass-green"
              style={{ marginTop: 22, padding: '20px', borderRadius: '16px' }}
            >
              <SearchFilter filters={filters} onChange={handleFilterChange} onSearch={handleSearch} showStatus />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Bar */}
      <AnimatedSection delay={0.1}>
        <motion.section 
          className="stats-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="container">
            <div className="stats-grid">
              <motion.div 
                className="stat-card"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="stat-icon">🏘️</div>
                <div className="stat-value">{stats.totalListings}</div>
                <div className="stat-label">Active Listings</div>
              </motion.div>
              
              <motion.div 
                className="stat-card"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="stat-icon">👥</div>
                <div className="stat-value">{stats.activeAgents}</div>
                <div className="stat-label">Expert Agents</div>
              </motion.div>
              
              <motion.div 
                className="stat-card"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="stat-icon">💰</div>
                <div className="stat-value">₵{stats.avgPrice > 0 ? stats.avgPrice.toLocaleString() : "N/A"}</div>
                <div className="stat-label">Average Price</div>
              </motion.div>
              
              <motion.div 
                className="stat-card"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="stat-icon">📍</div>
                <div className="stat-value" style={{ fontSize: "1.25rem" }}>{stats.popularLocation}</div>
                <div className="stat-label">Popular Area</div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </AnimatedSection>

      {/* Main Content - Full Width */}
      <div className="container home-content-wrapper" ref={pageContainerRef}>
          {/* Trending */}
          <AnimatedSection delay={0.2}>
            <section className="section trending-carousel-section">
              <div className="section-header">
                <h2>🔥 Trending Properties</h2>
                <Link to="/properties" className="small-link">View all</Link>
              </div>

              {loadingTrending ? (
                <StaggerGrid className="cards-row">
                  {[1,2,3].map(i => (
                    <StaggerItem key={i}>
                      <PropertyCardSkeleton />
                    </StaggerItem>
                  ))}
                </StaggerGrid>
              ) : trending.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="empty"
                >
                  No trending properties found.
                </motion.div>
              ) : (
                <div className="trending-carousel-wrapper">
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
                    effect="coverflow"
                    grabCursor={true}
                    centeredSlides={true}
                    slidesPerView="auto"
                    coverflowEffect={{
                      rotate: 0,
                      stretch: 0,
                      depth: 100,
                      modifier: 2.5,
                      slideShadows: false,
                    }}
                    navigation={{
                      nextEl: '.swiper-button-next-custom',
                      prevEl: '.swiper-button-prev-custom',
                    }}
                    pagination={{
                      el: '.swiper-pagination-custom',
                      clickable: true,
                      dynamicBullets: true,
                    }}
                    autoplay={{
                      delay: 4000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }}
                    loop={trending.length > 3}
                    speed={600}
                    breakpoints={{
                      320: {
                        slidesPerView: 1,
                        spaceBetween: 20,
                      },
                      768: {
                        slidesPerView: 2,
                        spaceBetween: 30,
                      },
                      1024: {
                        slidesPerView: 3,
                        spaceBetween: 30,
                      },
                    }}
                    className="trending-swiper"
                  >
                    {trending.map((property, index) => {
                      const images = parseImages(property.images);
                      return (
                        <SwiperSlide key={property.id}>
                          <motion.article
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className="card property-card hover-lift floating-card trending-card"
                          >
                            <Link to={`/properties/${property.id}`} className="card-media">
                              <motion.img
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                                src={images[0] ? getImageUrl(images[0]) : "/img/default.jpg"}
                                alt={property.title}
                                loading="lazy"
                              />
                              <div className="trending-badge">
                                <i className="fa fa-fire"></i> Trending
                              </div>
                            </Link>
                            <div className="card-body">
                              <Link to={`/properties/${property.id}`} className="card-title">{property.title}</Link>
                              <div className="card-price text-gradient">₵{Number(property.price).toLocaleString()}</div>
                              <div className="card-meta">
                                <span className="meta-location"><i className="fa fa-map-marker"></i> {property.location}</span>
                                <div className="meta-stats">
                                  {property.bedrooms && <span><i className="fa fa-bed"></i> {property.bedrooms}</span>}
                                  {property.bathrooms && <span><i className="fa fa-bath"></i> {property.bathrooms}</span>}
                                  {property.size && <span><i className="fa fa-expand"></i> {property.size} sqft</span>}
                                </div>
                              </div>

                              {property.user && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.3 }}
                                  className="property-agent-inline"
                                  style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}
                                >
                                  <img 
                                    src={property.user.photo ? (property.user.photo.startsWith("http") ? property.user.photo : `${backendUrl}/storage/${property.user.photo}`) : "/img/agent-default.jpg"} 
                                    alt={property.user.name} 
                                    style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} 
                                  />
                                  <div style={{ fontSize: 14 }}>
                                    <div style={{ fontWeight: 700 }}>{property.user.name}</div>
                                    <Link to={`/agents/${property.user.id}`} className="small-link">Contact agent</Link>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </motion.article>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>

                  {/* Custom Navigation Buttons */}
                  <div className="swiper-button-prev-custom">
                    <i className="fa fa-chevron-left"></i>
                  </div>
                  <div className="swiper-button-next-custom">
                    <i className="fa fa-chevron-right"></i>
                  </div>

                  {/* Custom Pagination */}
                  <div className="swiper-pagination-custom"></div>
                </div>
              )}
            </section>
          </AnimatedSection>

          {/* Featured */}
          <AnimatedSection delay={0.3}>
            <section className="section featured-section">
              <div className="section-header">
                <div>
                  <h2>🌟 Featured Properties</h2>
                  <p className="section-subtitle">Handpicked premium listings for you</p>
                </div>
                <Link to="/properties?featured=1" className="small-link">
                  See all featured <i className="fa fa-arrow-right"></i>
                </Link>
              </div>

              {loadingFeatured ? (
                <StaggerGrid className="featured-grid">
                  {[1,2,3,4,5,6].map(i => (
                    <StaggerItem key={i}>
                      <PropertyCardSkeleton />
                    </StaggerItem>
                  ))}
                </StaggerGrid>
              ) : featured.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="empty-featured"
                >
                  <div className="empty-icon">🏠</div>
                  <h3>No featured properties yet</h3>
                  <p>Check back soon for our curated selection</p>
                </motion.div>
              ) : (
                <StaggerGrid className="featured-grid">
                  {featured.map((property, index) => {
                    const images = parseImages(property.images);
                    return (
                      <StaggerItem key={property.id}>
                        <motion.article
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08, duration: 0.5 }}
                          whileHover={{ y: -12, transition: { duration: 0.3 } }}
                          className="featured-card card property-card hover-lift"
                        >
                          {/* Featured Badge */}
                          <div className="featured-star-badge">
                            <i className="fa fa-star"></i>
                          </div>

                          {/* Image with overlay gradient */}
                          <Link to={`/properties/${property.id}`} className="featured-card-media">
                            <motion.div 
                              className="featured-image-wrapper"
                              whileHover={{ scale: 1.08 }}
                              transition={{ duration: 0.5 }}
                            >
                              <img 
                                src={images[0] ? getImageUrl(images[0]) : "/img/default.jpg"} 
                                alt={property.title} 
                                loading="lazy"
                                className="featured-image"
                              />
                              <div className="featured-overlay"></div>
                            </motion.div>

                            {/* Quick view button */}
                            <motion.div 
                              className="quick-view-btn"
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileHover={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <i className="fa fa-search-plus"></i> Quick View
                            </motion.div>
                          </Link>

                          {/* Card content */}
                          <div className="featured-card-body">
                            {/* Property type badge */}
                            {property.category && (
                              <span className="property-type-badge">
                                {property.category}
                              </span>
                            )}

                            <Link to={`/properties/${property.id}`} className="featured-title">
                              {property.title}
                            </Link>

                            {/* Price with gradient */}
                            <div className="featured-price-row">
                              <div className="featured-price text-gradient">
                                ₵{Number(property.price).toLocaleString()}
                              </div>
                              {property.type && (
                                <span className="featured-type-pill">{property.type}</span>
                              )}
                            </div>

                            {/* Location with icon */}
                            <div className="featured-location">
                              <i className="fa fa-map-marker-alt"></i>
                              <span>{property.location}</span>
                            </div>

                            {/* Property stats grid */}
                            <div className="featured-stats-grid">
                              {property.bedrooms && (
                                <div className="featured-stat">
                                  <i className="fa fa-bed"></i>
                                  <span>{property.bedrooms} Beds</span>
                                </div>
                              )}
                              {property.bathrooms && (
                                <div className="featured-stat">
                                  <i className="fa fa-bath"></i>
                                  <span>{property.bathrooms} Baths</span>
                                </div>
                              )}
                              {property.size && (
                                <div className="featured-stat">
                                  <i className="fa fa-expand-arrows-alt"></i>
                                  <span>{property.size} sqft</span>
                                </div>
                              )}
                            </div>

                            {/* Divider */}
                            <div className="featured-divider"></div>

                            {/* Agent info with enhanced styling */}
                            {property.user ? (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="featured-agent"
                              >
                                <div className="featured-agent-info">
                                  <img 
                                    src={property.user.photo ? (property.user.photo.startsWith("http") ? property.user.photo : `${backendUrl}/storage/${property.user.photo}`) : "/img/agent-default.jpg"} 
                                    alt={property.user.name}
                                    className="featured-agent-photo"
                                  />
                                  <div className="featured-agent-details">
                                    <div className="featured-agent-name">{property.user.name}</div>
                                    <div className="featured-agent-label">Listing Agent</div>
                                  </div>
                                </div>
                                <Link 
                                  to={`/agents/${property.user.id}`} 
                                  className="featured-contact-btn"
                                >
                                  <i className="fa fa-phone"></i>
                                </Link>
                              </motion.div>
                            ) : (
                              <div className="featured-no-agent">
                                <i className="fa fa-user-plus"></i>
                                <Link to="/agents" className="small-link">Find an agent</Link>
                              </div>
                            )}
                          </div>
                        </motion.article>
                      </StaggerItem>
                    );
                  })}
                </StaggerGrid>
              )}
            </section>
          </AnimatedSection>

        {/* Available Agents */}
        <AnimatedSection delay={0.4}>
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
        </AnimatedSection>

        {/* Latest Blogs */}
        <AnimatedSection delay={0.5}>
          <section className="section blog-section">
            <div className="section-header">
              <div>
                <h2>📰 Latest Blog Posts</h2>
                <p className="section-subtitle">Expert insights, market trends, and helpful guides</p>
              </div>
              <Link to="/blog" className="small-link">
                Explore all articles <i className="fa fa-arrow-right"></i>
              </Link>
            </div>

            {loadingBlogs ? (
              <StaggerGrid className="blog-grid">
                {[1,2,3,4,5,6].map(i => (
                  <StaggerItem key={i}>
                    <BlogCardSkeleton />
                  </StaggerItem>
                ))}
              </StaggerGrid>
            ) : blogs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="empty-blog"
              >
                <div className="empty-icon">📝</div>
                <h3>No blog posts yet</h3>
                <p>Check back soon for our latest insights</p>
              </motion.div>
            ) : (
              <>
                {/* Featured/Top Read Blog */}
                {topReadBlogs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="featured-blog-wrapper"
                  >
                    <Link to={`/blog/${topReadBlogs[0].id}`} className="featured-blog-card">
                      <div className="featured-blog-badge">
                        <i className="fa fa-fire"></i> Top Read
                      </div>
                      
                      <div className="featured-blog-image-wrapper">
                        <motion.img
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.5 }}
                          src={topReadBlogs[0].image ? getImageUrl(topReadBlogs[0].image) : "/img/blog-default.jpg"}
                          alt={topReadBlogs[0].title}
                          loading="lazy"
                          className="featured-blog-image"
                        />
                        <div className="featured-blog-overlay"></div>
                        <div className="featured-blog-content-overlay">
                          <h3 className="featured-blog-title">{topReadBlogs[0].title}</h3>
                          <p className="featured-blog-excerpt">
                            {(topReadBlogs[0].excerpt || topReadBlogs[0].description || "").slice(0, 150)}
                            {(topReadBlogs[0].excerpt || topReadBlogs[0].description || "").length > 150 ? "..." : ""}
                          </p>
                          <div className="featured-blog-meta">
                            <span><i className="fa fa-calendar"></i> {topReadBlogs[0].created_at?.slice(0,10)}</span>
                            <span><i className="fa fa-eye"></i> {topReadBlogs[0].views || 0} views</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )}

                {/* Blog Grid */}
                <StaggerGrid className="blog-grid">
                  {blogs.slice(0, 6).map((blog, index) => (
                    <StaggerItem key={blog.id}>
                      <motion.article
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06, duration: 0.5 }}
                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                        className="blog-card-enhanced"
                      >
                        {/* New Badge for recent posts */}
                        {(() => {
                          const postDate = new Date(blog.created_at);
                          const daysDiff = Math.floor((new Date() - postDate) / (1000 * 60 * 60 * 24));
                          return daysDiff <= 7 ? (
                            <div className="new-post-badge">
                              <i className="fa fa-sparkles"></i> New
                            </div>
                          ) : null;
                        })()}

                        <Link to={`/blog/${blog.id}`} className="blog-card-image-wrapper">
                          <motion.div 
                            className="blog-image-container"
                            whileHover={{ scale: 1.08 }}
                            transition={{ duration: 0.4 }}
                          >
                            <img
                              src={blog.image ? getImageUrl(blog.image) : "/img/blog-default.jpg"}
                              alt={blog.title}
                              loading="lazy"
                              className="blog-card-image"
                            />
                            <div className="blog-card-overlay"></div>
                          </motion.div>

                          {/* Read More Overlay */}
                          <motion.div 
                            className="blog-read-more-btn"
                            initial={{ opacity: 0, y: 10 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <i className="fa fa-book-open"></i> Read Article
                          </motion.div>
                        </Link>

                        <div className="blog-card-content">
                          {/* Category Badge */}
                          {blog.type && (
                            <span className="blog-category-badge">
                              {blog.type}
                            </span>
                          )}

                          <Link to={`/blog/${blog.id}`} className="blog-card-title-link">
                            <h4 className="blog-card-title">{blog.title}</h4>
                          </Link>

                          <p className="blog-card-excerpt">
                            {(blog.excerpt || blog.description || "").slice(0, 100)}
                            {(blog.excerpt || blog.description || "").length > 100 ? "..." : ""}
                          </p>

                          <div className="blog-card-footer">
                            <div className="blog-card-meta">
                              <span className="blog-date">
                                <i className="fa fa-calendar-alt"></i>
                                {blog.created_at?.slice(0, 10)}
                              </span>
                              {blog.views !== undefined && (
                                <span className="blog-views">
                                  <i className="fa fa-eye"></i>
                                  {blog.views} views
                                </span>
                              )}
                            </div>
                            <Link to={`/blog/${blog.id}`} className="blog-read-link">
                              Read more <i className="fa fa-arrow-right"></i>
                            </Link>
                          </div>

                          {/* Author info if available */}
                          {blog.user && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="blog-author"
                            >
                              <img
                                src={blog.user.photo ? (blog.user.photo.startsWith("http") ? blog.user.photo : `${backendUrl}/storage/${blog.user.photo}`) : "/img/agent-default.jpg"}
                                alt={blog.user.name}
                                className="blog-author-photo"
                              />
                              <span className="blog-author-name">{blog.user.name}</span>
                            </motion.div>
                          )}
                        </div>
                      </motion.article>
                    </StaggerItem>
                  ))}
                </StaggerGrid>
              </>
            )}
          </section>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection delay={0.6}>
          <section className="cta">
            <h3>Ready to list your property?</h3>
            <Link to="/properties/create" className="hero-btn cta-btn">Post Your Listing</Link>
          </section>
        </AnimatedSection>
      </div>
    </div>
  );
}