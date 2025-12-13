import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import { PropertyCardSkeleton } from "../components/Skeletons";
import LeafletPropertyMap from "../components/LeafletPropertyMap";
import { GHANA_CITIES, getCityData, GHANA_LOCATIONS_ORGANIZED } from "../data/ghanaLocations";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";
function getImageUrl(img) {
  if (!img) return "/img/default.jpg";
  return img.startsWith("http") ? img : `${backendUrl}/storage/${img}`;
}

function parseImages(images) {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try {
    return JSON.parse(images);
  } catch {
    return [];
  }
}

const Properties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    property_type: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    status: "for_sale",
    bedrooms: "",
  });
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showMap, setShowMap] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [regionCounts, setRegionCounts] = useState({});
  const [activeFilters, setActiveFilters] = useState([]);
  const navigate = useNavigate();

  // Fetch all favorite property IDs for the current user (for fast checking)
  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const response = await API.get("/favorites");
      // Extract favorite IDs
      const favIDs = (response.data.data || []).map(p => p.id);
      setFavorites(favIDs);
    } catch (error) {
      setFavorites([]);
    }
  };

  // Fetch properties using filters
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await API.get("/properties", {
        params: {
          location: filters.location,
          property_type: filters.property_type,
          min_price: filters.minPrice,
          max_price: filters.maxPrice,
          status: filters.status,
          bedrooms: filters.bedrooms,
        },
      });
      const data = response.data.data || [];
      setProperties(data);
      setFilteredProperties(data);
      
      // Calculate region counts
      const counts = {};
      data.forEach(prop => {
        const region = prop.region || prop.state || '';
        if (region) {
          counts[region] = (counts[region] || 0) + 1;
        }
      });
      setRegionCounts(counts);
    } catch (error) {
      setProperties([]);
      setRegionCounts({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line
  }, [filters]);

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line
  }, [user]);

  // Filter properties by selected region
  useEffect(() => {
    if (selectedRegion) {
      const filtered = properties.filter(p => {
        // Get property location (this is the only field that exists)
        const propertyLocation = (p.location || '').toLowerCase().trim();
        
        if (!propertyLocation) return false;
        
        // Check if property's location matches any city in the selected region
        if (GHANA_LOCATIONS_ORGANIZED[selectedRegion]) {
          const regionCities = GHANA_LOCATIONS_ORGANIZED[selectedRegion].cities || [];
          return regionCities.some(city => {
            const cityLower = city.toLowerCase();
            // Check both ways: location contains city name OR city name contains location
            return propertyLocation.includes(cityLower) || cityLower.includes(propertyLocation);
          });
        }
        
        return false;
      });
      
      setFilteredProperties(filtered);
    } else {
      setFilteredProperties(properties);
    }
  }, [selectedRegion, properties]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear region selection when user types in location filter
    if (name === 'location') {
      setSelectedRegion(null);
    }
  };

  const handleRegionClick = (regionId, regionName, cities) => {
    setSelectedRegion(regionId);
    // Set location to region name, user can then click specific city
    setFilters(prev => ({
      ...prev,
      location: regionName,
    }));
  };

  const handleRegionSelect = (regionName) => {
    setSelectedRegion(regionName);
  };

  const removeFilter = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: "",
    }));
    if (filterName === "location") {
      setSelectedRegion(null);
    }
  };

  const clearAllFilters = () => {
    setFilters({
      property_type: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      status: "for_sale",
      bedrooms: "",
    });
    setSelectedRegion(null);
  };

  useEffect(() => {
    // Build active filters array for chips
    const active = [];
    if (filters.location) active.push({ label: filters.location, key: "location" });
    if (filters.property_type) active.push({ label: filters.property_type, key: "property_type" });
    if (filters.status && filters.status !== "for_sale") active.push({ label: filters.status.replace("_", " "), key: "status" });
    if (filters.bedrooms) active.push({ label: `${filters.bedrooms} Beds`, key: "bedrooms" });
    if (filters.minPrice) active.push({ label: `Min: ₵${Number(filters.minPrice).toLocaleString()}`, key: "minPrice" });
    if (filters.maxPrice) active.push({ label: `Max: ₵${Number(filters.maxPrice).toLocaleString()}`, key: "maxPrice" });
    setActiveFilters(active);
  }, [filters]);

  const handleToggleFavorite = async (propertyId, isFavorite) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      if (isFavorite) {
        await API.delete(`/favorites/${propertyId}`);
        setFavorites(favorites.filter(id => id !== propertyId));
      } else {
        await API.post(`/favorites/${propertyId}`);
        setFavorites([...favorites, propertyId]);
      }
    } catch (error) {
      // Optionally show error feedback
    }
  };

  return (
    <div className="zillow-properties-page">
      {/* Top Search Bar - Zillow Style */}
      <div className="zillow-search-bar">
        <div className="search-bar-container">
          <div className="search-bar-main">
            {/* Status Tabs */}
            <div className="status-tabs">
              <button
                className={`status-tab ${filters.status === "for_sale" ? "active" : ""}`}
                onClick={() => handleFilterChange("status", "for_sale")}
              >
                For Sale
              </button>
              <button
                className={`status-tab ${filters.status === "for_rent" ? "active" : ""}`}
                onClick={() => handleFilterChange("status", "for_rent")}
              >
                For Rent
              </button>
              <button
                className={`status-tab ${filters.status === "short_lease" ? "active" : ""}`}
                onClick={() => handleFilterChange("status", "short_lease")}
              >
                Short Lease
              </button>
            </div>

            {/* Search Input */}
            <div className="search-input-wrapper">
              <i className="fa fa-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Enter an address, neighborhood, city, or region"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
              />
            </div>

            {/* Filter Buttons */}
            <div className="filter-buttons">
              <div className="filter-dropdown">
                <button className="filter-btn">
                  <i className="fa fa-sliders"></i> Price
                </button>
                <div className="filter-dropdown-menu">
                  <div className="price-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                    />
                    <span>—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="filter-dropdown">
                <button className="filter-btn">
                  <i className="fa fa-bed"></i> Beds
                </button>
                <div className="filter-dropdown-menu">
                  <div className="beds-options">
                    {["Any", "1+", "2+", "3+", "4+", "5+"].map(bed => (
                      <button
                        key={bed}
                        className={`bed-option ${filters.bedrooms === (bed === "Any" ? "" : bed.replace("+", "")) ? "active" : ""}`}
                        onClick={() => handleFilterChange("bedrooms", bed === "Any" ? "" : bed.replace("+", ""))}
                      >
                        {bed}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="filter-dropdown">
                <button className="filter-btn">
                  <i className="fa fa-home"></i> Type
                </button>
                <div className="filter-dropdown-menu">
                  <div className="type-options">
                    {["House", "Apartment", "Land", "Commercial"].map(type => (
                      <label key={type} className="type-option">
                        <input
                          type="radio"
                          name="property_type"
                          checked={filters.property_type === type.toLowerCase()}
                          onChange={() => handleFilterChange("property_type", type.toLowerCase())}
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button className="map-toggle-btn" onClick={() => setShowMap(!showMap)}>
                <i className={`fa ${showMap ? "fa-list" : "fa-map"}`}></i>
                {showMap ? "List" : "Map"}
              </button>
            </div>
          </div>

          {/* Active Filters Chips */}
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="active-filters"
            >
              {activeFilters.map((filter, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="filter-chip"
                >
                  {filter.label}
                  <button onClick={() => removeFilter(filter.key)} className="chip-remove">
                    <i className="fa fa-times"></i>
                  </button>
                </motion.div>
              ))}
              <button className="clear-all-btn" onClick={clearAllFilters}>
                Clear all
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="zillow-content">
        {/* Map Section */}
        <AnimatePresence>
          {showMap && (
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="map-section"
            >
              <LeafletPropertyMap
                properties={filteredProperties}
                selectedProperty={null}
                onPropertyClick={(property) => navigate(`/properties/${property.id}`)}
                onRegionSelect={handleRegionSelect}
                showRegionBoundaries={true}
                showControls={true}
                height="calc(100vh - 200px)"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Listings Section */}
        <div className={`listings-section ${!showMap ? "full-width" : ""}`}>
          <div className="listings-header">
            <h1 className="listings-title">
              🏘️ {filteredProperties.length} {filteredProperties.length === 1 ? "Property" : "Properties"} 
              {selectedRegion && ` in ${selectedRegion}`}
              {!selectedRegion && filters.location && ` in ${filters.location}`}
            </h1>
            <div className="listings-controls">
              <select className="sort-select">
                <option>Newest</option>
                <option>Price (Low to High)</option>
                <option>Price (High to Low)</option>
                <option>Most Viewed</option>
              </select>
            </div>
          </div>

          <div className="listings-grid">
            {loading ? (
              <>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </>
            ) : filteredProperties.length === 0 ? (
              <div className="no-results">
                <i className="fa fa-search" style={{ fontSize: "3rem", color: "#cbd5e0", marginBottom: "1rem" }}></i>
                <h3>No properties found</h3>
                <p>Try adjusting your filters or selecting a different region</p>
                {selectedRegion && (
                  <button 
                    className="btn btn-primary mt-3"
                    onClick={() => setSelectedRegion(null)}
                    style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', borderRadius: '8px' }}
                  >
                    View All Properties
                  </button>
                )}
              </div>
            ) : (
              filteredProperties.map((property) => {
                const isFavorite = favorites.includes(property.id);
                const images = parseImages(property.images);
                
                return (
                  <motion.article
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="card property-card hover-lift floating-card"
                  >
                    <Link to={`/properties/${property.id}`} className="card-media">
                      <motion.img
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        whileHover={{ scale: 1.05 }}
                        src={images[0] ? getImageUrl(images[0]) : "/img/default.jpg"}
                        alt={property.title}
                        loading="lazy"
                      />
                      <button
                        className={`favorite-btn-overlay ${isFavorite ? "active" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleFavorite(property.id, isFavorite);
                        }}
                      >
                        <i className={`fa ${isFavorite ? "fa-bookmark" : "fa-bookmark-o"}`}></i>
                      </button>
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
                            src={property.user.photo ? getImageUrl(property.user.photo) : "/img/agent-default.jpg"} 
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
                );
              })
            )}
          </div>

          {!loading && properties.length > 0 && (
            <div className="listings-footer">
              <p>📊 Showing {properties.length} of {properties.length} properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Properties;