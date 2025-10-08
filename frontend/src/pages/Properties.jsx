import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../contexts/AuthContext";


const Properties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
 const categories = {
  Residential: ["House", "Apartment", "Townhouse"],
  Commercial: ["Office", "Shop", "Warehouse"],
  Land: ["Plot", "Farm", "Mixed Use"],
  Others: ["Industrial", "Short Let", "Estate"]
};

const [filters, setFilters] = useState({
  category: "",
  type: "",
  location: "",
  minPrice: "",
  maxPrice: "",
});
  const [loading, setLoading] = useState(false);

  // Fetch properties
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await API.get("/properties", {
        params: {
          location: filters.location,
          property_type: filters.type,
          min_price: filters.minPrice,
          max_price: filters.maxPrice,
        },
      });
      setProperties(response.data.data || []);
    } catch (error) {
      console.error("Error fetching properties:", error.response?.data || error);
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
    <div>
      {/* Hero Section */}
      <section
        className="hero set-bg"
        style={{ backgroundImage: "url('/img/hero/estate-hero.jpg')" }}
      >
        <div className="container">
          <div className="hero__text">
            <h2 className="text-green">Find Your Dream Property Today</h2>
            <p className="text-yellow">
              Buy • Sell • Invest in Lands, Houses & Commercial Properties
            </p>
            {user && (
              <div className="mb-3">
                <Link to="/properties/create" className="btn btn-green">
                  + Post a Property
                </Link>
              </div>
            )}
            {/* Search Form */}
            <form
  onSubmit={(e) => {
    e.preventDefault();
    fetchProperties();
  }}
  className="hero__search"
>
  <input
    type="text"
    name="location"
    value={filters.location}
    onChange={handleFilterChange}
    placeholder="Search by location..."
  />
  <select
    name="category"
    value={filters.category}
    onChange={handleFilterChange}
  >
    <option value="">All Categories</option>
    {Object.keys(categories).map((cat) => (
      <option key={cat} value={cat}>{cat}</option>
    ))}
  </select>
  <select
    name="type"
    value={filters.type}
    onChange={handleFilterChange}
    disabled={!filters.category}
  >
    <option value="">All Types</option>
    {filters.category &&
      categories[filters.category].map((type) => (
        <option key={type} value={type}>{type}</option>
      ))}
  </select>
  <input
    type="number"
    name="minPrice"
    placeholder="Min Price"
    value={filters.minPrice}
    onChange={handleFilterChange}
  />
  <input
    type="number"
    name="maxPrice"
    placeholder="Max Price"
    value={filters.maxPrice}
    onChange={handleFilterChange}
  />
  <button type="submit" className="btn btn-yellow">
    Search
  </button>
</form>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="featured spad">
        <div className="container">
          <div className="section-title">
            <h2 className="text-green">
              <i className="fa fa-star text-yellow"></i> Featured Properties
            </h2>
          </div>
          <div className="row">
            {loading ? (
              <p className="text-center">Loading properties...</p>
            ) : properties.length === 0 ? (
              <p className="text-center">No properties found.</p>
            ) : (
              properties.map((property, index) => (
                <div
                  key={property.id}
                  className="col-lg-4 col-md-6 animate__animated animate__fadeInUp"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="featured__item card shadow-sm property-card">
                    <div
                      className="featured__item__pic set-bg card-img-top"
                      style={{
                        backgroundImage: `url(${
                          property.images && property.images.length > 0
                            ? property.images[0]
                            : "/img/default.jpg"
                        })`,
                        height: "220px",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="featured__item__pic__hover">
                        <Link to="/saved" title="Save">
                          <i className="fa fa-bookmark"></i>
                        </Link>
                        <Link to="/favorites" title="Favorite">
                          <i className="fa fa-heart"></i>
                        </Link>
                        <Link to={`/properties/${property.id}`} title="View">
                          <i className="fa fa-eye"></i>
                        </Link>
                      </div>
                    </div>
                    <div className="featured__item__text card-body">
                      <h6 className="card-title text-green">
                        <Link to={`/properties/${property.id}`}>
                          {property.title}
                        </Link>
                      </h6>
                      <h5 className="card-subtitle mb-2 text-yellow">
                        ${Number(property.price).toLocaleString()}
                      </h5>
                      <p className="card-text text-muted">
                        <i className="fa fa-map-marker text-green"></i> {property.location}
                      </p>
                      {property.is_featured && (
                        <span className="badge badge-yellow">Featured</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Property Categories */}
      <section className="categories">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-6">
              <div
                className="categories__item set-bg"
                style={{ backgroundImage: "url('/img/categories/lands.jpg')" }}
              >
                <h5>
                  <Link to="/lands" className="text-green">Lands</Link>
                </h5>
              </div>
            </div>
            <div className="col-lg-4 col-md-4 col-sm-6">
              <div
                className="categories__item set-bg"
                style={{ backgroundImage: "url('/img/categories/houses.jpg')" }}
              >
                <h5>
                  <Link to="/houses" className="text-green">Houses</Link>
                </h5>
              </div>
            </div>
            <div className="col-lg-4 col-md-4 col-sm-6">
              <div
                className="categories__item set-bg"
                style={{ backgroundImage: "url('/img/categories/mixed.jpg')" }}
              >
                <h5>
                  <Link to="/mixed" className="text-green">Mixed Use</Link>
                </h5>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="benefits spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-6">
              <div className="benefits__item">
                <i className="fa fa-check-circle text-green"></i>
                <h6>Trusted Agents</h6>
                <p>
                  We connect you with verified property owners and real estate
                  professionals.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-4 col-sm-6">
              <div className="benefits__item">
                <i className="fa fa-home text-yellow"></i>
                <h6>Wide Range of Properties</h6>
                <p>
                  From affordable plots to luxury homes, find what fits your
                  budget.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-4 col-sm-6">
              <div className="benefits__item">
                <i className="fa fa-dollar text-green"></i>
                <h6>Best Market Prices</h6>
                <p>
                  We negotiate and list properties at fair and transparent
                  prices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section
        className="callto spad set-bg"
        style={{ backgroundImage: "url('/img/cta-bg.jpg')" }}
      >
        <div className="container text-center">
          <h2 className="text-green">Looking to Buy or Sell?</h2>
          <p className="text-yellow">Join thousands of investors and property owners today</p>
          <Link to="/contact" className="btn btn-green">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Properties;