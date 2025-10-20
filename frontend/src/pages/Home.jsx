import { useState } from "react";
import { Link } from "react-router-dom";
import SearchFilter from "../components/SearchFilter"; // <-- import your filter component

export default function Home() {
  // Local state for filters (if you want to do search/filter on home page)
  const [filters, setFilters] = useState({
    category: "",
    type: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    status: "",
  });

  // Dummy search handler (redirect or fetch as needed)
  const handleSearch = () => {
    // You might want to redirect to /properties with filters as query params,
    // or trigger property fetching here.
    // Example: navigate(`/properties?${new URLSearchParams(filters)}`)
    // For now, leave as a stub.
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
            {/* --- Add the SearchFilter component here --- */}
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

      {/* Featured Properties (Placeholder) */}
      <section className="featured-section">
        <div className="container">
          <h2 className="section-title">Featured Properties</h2>
          <div className="featured-list">
            {/* Add actual featured property cards later */}
            <div className="featured-placeholder">
              <p>Featured properties will be displayed here.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}