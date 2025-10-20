import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";
function getImageUrl(img) {
  if (!img) return "/img/default.jpg";
  return img.startsWith("http") ? img : `${backendUrl}/storage/${img}`;
}

const categories = {
  Residential: ["House", "Apartment", "Townhouse"],
  Commercial: ["Office", "Shop", "Warehouse"],
  Land: ["Plot", "Farm", "Mixed Use"],
  Others: ["Industrial", "Short Let", "Estate"]
};

function SearchFilter({
  filters,
  onChange,
  onSearch,
  showStatus = true
}) {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSearch();
      }}
      className="props-filter-form"
    >
      <div className="props-filter-grid">
        <div className="props-filter-field">
          <i className="fa fa-map-marker map-icon-green"></i>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={onChange}
            placeholder="Location"
          />
        </div>
        <div className="props-filter-field">
          <i className="fa fa-list-alt meta-icon-gray"></i>
          <select
            name="category"
            value={filters.category}
            onChange={onChange}
          >
            <option value="">Category</option>
            {Object.keys(categories).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="props-filter-field">
          <i className="fa fa-building meta-icon-gray"></i>
          <select
            name="type"
            value={filters.type}
            onChange={onChange}
            disabled={!filters.category}
          >
            <option value="">Type</option>
            {filters.category &&
              categories[filters.category].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
          </select>
        </div>
        {showStatus && (
          <div className="props-filter-field">
            <i className="fa fa-info-circle meta-icon-gray"></i>
            <select
              name="status"
              value={filters.status}
              onChange={onChange}
            >
              <option value="">Status</option>
              <option value="for_sale">For Sale</option>
              <option value="for_rent">For Rent</option>
              <option value="lease">Lease</option>
            </select>
          </div>
        )}
        <div className="props-filter-field">
          <i className="fa fa-money meta-icon-gray"></i>
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={onChange}
          />
        </div>
        <div className="props-filter-field">
          <i className="fa fa-money meta-icon-gray"></i>
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={onChange}
          />
        </div>
      </div>
      <button type="submit" className="props-filter-btn">
        <i className="fa fa-search"></i> Search
      </button>
    </form>
  );
}

const Properties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    type: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await API.get("/properties", {
        params: {
          location: filters.location,
          property_type: filters.type,
          min_price: filters.minPrice,
          max_price: filters.maxPrice,
          status: filters.status,
          category: filters.category,
        },
      });
      setProperties(response.data.data || []);
    } catch (error) {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="props-layout">
      <aside className="props-sidebar">
        <div className="props-sidebar-inner">
          <h2 className="props-sidebar-title">Filter &amp; Search</h2>
          {/* Filter placed in sidebar */}
          <SearchFilter
            filters={filters}
            onChange={handleFilterChange}
            onSearch={fetchProperties}
          />
          {user && (
            <div className="props-sidebar-action">
              <Link to="/properties/create" className="btn btn-green w-100">
                + Post a Property
              </Link>
            </div>
          )}
        </div>
      </aside>
      <main className="props-main">
        <div className="props-header">
          <h1 className="props-title">
            Properties for Sale in Ghana
          </h1>
          <p className="props-subtitle">
            Browse the latest houses, lands, apartments, and commercial spaces for sale across Ghana.
          </p>
        </div>
        <div className="props-list">
          {loading ? (
            <div className="props-loading">Loading properties...</div>
          ) : properties.length === 0 ? (
            <div className="props-empty">No properties found.</div>
          ) : (
            <div className="props-grid">
              {properties.map((property) => (
                <div key={property.id} className="props-card">
                  <div
                    className="props-card-img"
                    style={{
                      backgroundImage: `url(${
                        property.images && property.images.length > 0
                          ? getImageUrl(property.images[0])
                          : "/img/default.jpg"
                      })`,
                    }}
                  >
                    <Link to="/saved" className="props-card-bookmark" title="Save">
                      <i className="fa fa-bookmark"></i>
                    </Link>
                  </div>
                  <div className="props-card-body">
                    <h2 className="props-card-title">
                      <Link to={`/properties/${property.id}`}>{property.title}</Link>
                    </h2>
                    <div className="props-card-price">
                      ₵{Number(property.price).toLocaleString()}
                    </div>
                    <div className="props-card-detail">
                      <span>
                        <i className="fa fa-map-marker map-icon-green"></i> {property.location}
                      </span>
                    </div>
                    <div className="props-card-meta">
                      {property.bedrooms && (
                        <span title="Bedrooms">
                          <i className="fa fa-bed meta-icon-gray"></i> {property.bedrooms}
                        </span>
                      )}
                      {property.bathrooms && (
                        <span title="Bathrooms">
                          <i className="fa fa-bath meta-icon-gray"></i> {property.bathrooms}
                        </span>
                      )}
                      {property.size && (
                        <span title="Size">
                          <i className="fa fa-expand meta-icon-gray"></i> {property.size} sqft
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Properties;