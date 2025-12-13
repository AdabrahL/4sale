import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/quick-view-modal.css';

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

export default function QuickViewModal({ property, isOpen, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    // Reset image index when property changes
    setCurrentImageIndex(0);
  }, [property]);

  if (!property) return null;

  const images = parseImages(property.images);
  const currentImage = images[currentImageIndex]?.image_url || images[0]?.image_url;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="quick-view-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="quick-view-modal"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Close Button */}
            <button className="quick-view-close" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>

            <div className="quick-view-content">
              {/* Image Gallery Section */}
              <div className="quick-view-gallery">
                <div className="quick-view-main-image">
                  <img
                    src={getImageUrl(currentImage)}
                    alt={property.title}
                    onError={(e) => {
                      e.target.src = '/img/default.jpg';
                    }}
                  />

                  {images.length > 1 && (
                    <>
                      <button className="gallery-nav prev" onClick={prevImage}>
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <button className="gallery-nav next" onClick={nextImage}>
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </>
                  )}

                  <div className="image-counter">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="quick-view-thumbnails">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img
                          src={getImageUrl(img.image_url)}
                          alt={`${property.title} ${index + 1}`}
                          onError={(e) => {
                            e.target.src = '/img/default.jpg';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="quick-view-details">
                {/* Status Badge */}
                <div className="quick-view-badges">
                  <span className={`status-badge ${property.listing_type || 'for_sale'}`}>
                    {property.listing_type === 'for_rent' ? 'For Rent' : 'For Sale'}
                  </span>
                  {property.is_verified && (
                    <span className="verified-badge">
                      <i className="fas fa-check-circle"></i> Verified
                    </span>
                  )}
                </div>

                {/* Title & Price */}
                <h2 className="quick-view-title">{property.title}</h2>
                <div className="quick-view-price">
                  ₵{property.price?.toLocaleString()}
                  {property.listing_type === 'for_rent' && <span className="price-period">/month</span>}
                </div>

                {/* Location */}
                <div className="quick-view-location">
                  <i className="fas fa-map-marker-alt"></i>
                  {property.location || property.city}
                </div>

                {/* Features */}
                <div className="quick-view-features">
                  {property.bedrooms && (
                    <div className="feature-item">
                      <i className="fas fa-bed"></i>
                      <span>{property.bedrooms} Beds</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="feature-item">
                      <i className="fas fa-bath"></i>
                      <span>{property.bathrooms} Baths</span>
                    </div>
                  )}
                  {property.square_feet && (
                    <div className="feature-item">
                      <i className="fas fa-expand-arrows-alt"></i>
                      <span>{property.square_feet} sqft</span>
                    </div>
                  )}
                  {property.property_type && (
                    <div className="feature-item">
                      <i className="fas fa-home"></i>
                      <span className="capitalize">{property.property_type}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {property.description && (
                  <div className="quick-view-description">
                    <h4>Description</h4>
                    <p>{property.description.substring(0, 200)}...</p>
                  </div>
                )}

                {/* Agent Info */}
                {property.user && (
                  <div className="quick-view-agent">
                    <img
                      src={getImageUrl(property.user.photo)}
                      alt={property.user.name}
                      className="agent-avatar"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <div className="agent-info">
                      <div className="agent-name">{property.user.name}</div>
                      <div className="agent-title">Property Agent</div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="quick-view-actions">
                  <Link
                    to={`/properties/${property.id}`}
                    className="btn-full-details"
                  >
                    <i className="fas fa-info-circle"></i>
                    View Full Details
                  </Link>
                  <button className="btn-contact">
                    <i className="fas fa-phone"></i>
                    Contact Agent
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
