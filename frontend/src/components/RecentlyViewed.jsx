import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRecentlyViewed } from '../Hooks/useRecentlyViewed';
import '../styles/recently-viewed.css';

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

export default function RecentlyViewed() {
  const { recentProperties, clearRecentlyViewed, removeFromRecentlyViewed } = useRecentlyViewed();

  if (recentProperties.length === 0) {
    return null;
  }

  return (
    <section className="recently-viewed-section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <i className="fas fa-history"></i>
              Recently Viewed
            </h2>
            <p className="section-subtitle">
              Pick up where you left off
            </p>
          </div>
          <button 
            className="clear-recent-btn"
            onClick={clearRecentlyViewed}
          >
            <i className="fas fa-trash-alt"></i>
            Clear History
          </button>
        </div>

        <div className="recently-viewed-grid">
          {recentProperties.map((property, index) => {
            const images = parseImages(property.images);
            const mainImage = images[0]?.image_url || images[0];

            return (
              <motion.div
                key={property.id}
                className="recent-property-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  className="remove-recent-btn"
                  onClick={() => removeFromRecentlyViewed(property.id)}
                  title="Remove from recent"
                >
                  <i className="fas fa-times"></i>
                </button>

                <Link to={`/properties/${property.id}`} className="recent-property-link">
                  <div className="recent-property-image">
                    <img
                      src={getImageUrl(mainImage)}
                      alt={property.title}
                      onError={(e) => {
                        e.target.src = '/img/default.jpg';
                      }}
                    />
                    <span className={`recent-badge ${property.listing_type}`}>
                      {property.listing_type === 'for_rent' ? 'Rent' : 'Sale'}
                    </span>
                  </div>

                  <div className="recent-property-info">
                    <div className="recent-property-price">
                      ₵{property.price?.toLocaleString()}
                    </div>
                    <h4 className="recent-property-title">{property.title}</h4>
                    <p className="recent-property-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {property.location}
                    </p>
                    {(property.bedrooms || property.bathrooms) && (
                      <div className="recent-property-features">
                        {property.bedrooms && (
                          <span>
                            <i className="fas fa-bed"></i> {property.bedrooms}
                          </span>
                        )}
                        {property.bathrooms && (
                          <span>
                            <i className="fas fa-bath"></i> {property.bathrooms}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
