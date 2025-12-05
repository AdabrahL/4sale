import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/propertydetails.css";
import { useAuth } from "../contexts/AuthContext";

// Fix Leaflet marker icon bug in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const defaultCenter = [5.6037, -0.1870]; // Accra fallback

function formatPrice(price) {
  return price
    ? `₵${Number(price).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    : "N/A";
}

function getImageUrl(path) {
  if (!path) return "/default-avatar.png";
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return path;
  return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/${path}`;
}

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const currentUserId = user?.id;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [coords, setCoords] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await API.get(`/properties/${id}`);
        setProperty(data.data);
        setBookmarked(data.data.is_bookmarked || false);
        if (data.data.location) {
          const geo = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              data.data.location
            )}`
          ).then((r) => r.json());
          if (geo[0]) setCoords([parseFloat(geo[0].lat), parseFloat(geo[0].lon)]);
          else setCoords(defaultCenter);
        } else {
          setCoords(defaultCenter);
        }
      } catch (err) {
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleBookmark = async () => {
    try {
      if (!bookmarked) {
        await API.post(`/properties/${id}/favorite`);
        setBookmarked(true);
      } else {
        await API.delete(`/properties/${id}/favorite`);
        setBookmarked(false);
      }
    } catch (err) {
      alert("Could not update bookmark. Try again.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    try {
      // Send to backend
      const response = await API.post(`/properties/${id}/contact`, { 
        message: message.trim() 
      });
      
      // Add message to local state
      const newMessage = {
        id: response.data.data?.id || Date.now(),
        text: message.trim(),
        sender: 'You',
        timestamp: new Date().toISOString()
      };
      setMessages([...messages, newMessage]);
      setMessage("");
      
      alert("Message sent successfully!");
    } catch (err) {
      console.error('Send message error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Could not send message. Try again.");
      }
    }
  };

  if (loading)
    return (
      <div className="container py-5">
        <span className="animate-spin mr-3">🔄</span> Loading property...
      </div>
    );
  if (!property)
    return (
      <div className="container py-5">
        Property not found.
      </div>
    );

  const images =
    property.images && property.images.length > 0
      ? property.images
      : ["/img/default.jpg"];

  const description = property.description || "";
  const shortDescription = description.length > 300 ? description.substring(0, 300) + "..." : description;

  const openGalleryModal = (index = 0) => {
    setCurrentImageIndex(index);
    setShowGalleryModal(true);
  };

  const closeGalleryModal = () => {
    setShowGalleryModal(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="zillow-property-details">
      {/* Image Gallery Modal */}
      {showGalleryModal && (
        <div className="gallery-modal-overlay" onClick={closeGalleryModal}>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-modal-close" onClick={closeGalleryModal}>
              <i className="fa fa-times"></i>
            </button>
            <button className="gallery-modal-prev" onClick={prevImage}>
              <i className="fa fa-chevron-left"></i>
            </button>
            <img 
              src={images[currentImageIndex]} 
              alt={`Property ${currentImageIndex + 1}`}
              className="gallery-modal-image"
            />
            <button className="gallery-modal-next" onClick={nextImage}>
              <i className="fa fa-chevron-right"></i>
            </button>
            <div className="gallery-modal-counter">
              {currentImageIndex + 1} / {images.length}
            </div>
            <div className="gallery-modal-thumbnails">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className={`gallery-modal-thumb ${i === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(i)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery */}
      <div className="property-hero">
        <div className="property-gallery-container">
          <div className="property-gallery-main" onClick={() => openGalleryModal(0)}>
            <img src={images[0]} alt="Main property" />
            <div className="gallery-overlay">
              <i className="fa fa-search-plus"></i>
              <span>View full gallery</span>
            </div>
          </div>
          <div className="property-gallery-grid-right">
            {images.slice(1, 5).map((img, i) => (
              <div 
                key={i} 
                className="property-gallery-item"
                onClick={() => openGalleryModal(i + 1)}
              >
                <img src={img} alt={`Property ${i + 2}`} />
                <div className="gallery-overlay">
                  <i className="fa fa-search-plus"></i>
                </div>
              </div>
            ))}
            {images.length > 5 && (
              <div className="property-gallery-item gallery-more" onClick={() => openGalleryModal(5)}>
                <img src={images[4]} alt="More photos" />
                <div className="gallery-overlay gallery-overlay-more">
                  <i className="fa fa-th"></i>
                  <span>+{images.length - 5} more</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <button className="gallery-view-all-floating" onClick={() => openGalleryModal(0)}>
          <i className="fa fa-camera"></i> View all {images.length} photos
        </button>
      </div>

      {/* Main Content */}
      <div className="property-content-wrapper">
        <div className="property-main-content">
          {/* Header Section */}
          <div className="property-header">
            <div className="property-price">{formatPrice(property.price)}</div>
            <div className="property-address">{property.title}</div>
            <div className="property-key-stats">
              <div>
                <strong>{property.bedrooms || 0}</strong> beds
              </div>
              <div>
                <strong>{property.bathrooms || 0}</strong> baths
              </div>
              <div>
                <strong>{property.size || "—"}</strong> sqm
              </div>
              <div>
                {property.property_type || "Single Family"}
              </div>
            </div>
            <div className="property-meta-info">
              <span>{property.status}</span>
              <span>•</span>
              <span>{property.category_name}</span>
              <span>•</span>
              <span>
                <i className="fa fa-map-marker"></i> {property.location}
              </span>
            </div>
            <div className="property-action-btns">
              <button
                className={`property-action-btn property-action-btn-save ${bookmarked ? "saved" : ""}`}
                onClick={handleBookmark}
              >
                <i className="fa fa-heart"></i>
                {bookmarked ? "Saved" : "Save"}
              </button>
              <button className="property-action-btn property-action-btn-share">
                <i className="fa fa-share-alt"></i> Share
              </button>
            </div>
          </div>

          {/* What's Special */}
          <div className="property-section">
            <h2 className="property-section-title">What's special</h2>
            <div className="property-description">
              {showFullDescription ? description : shortDescription}
            </div>
            {description.length > 300 && (
              <button
                className="property-read-more"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? "Read less" : "Read more"}
              </button>
            )}
          </div>

          {/* Facts & Features */}
          <div className="property-section">
            <h2 className="property-section-title">Facts & features</h2>
            <div className="facts-features-grid">
              {/* Interior */}
              <div className="fact-category">
                <h3 className="fact-category-title">Interior</h3>
                
                <div className="fact-subsection">
                  <h4 className="fact-subsection-title">Bedrooms & bathrooms</h4>
                  <div className="fact-items">
                    <div className="fact-item">Bedrooms: {property.bedrooms || 0}</div>
                    <div className="fact-item">Bathrooms: {property.bathrooms || 0}</div>
                  </div>
                </div>

                {property.amenities && (
                  <div className="fact-subsection">
                    <h4 className="fact-subsection-title">Features</h4>
                    <div className="fact-items">
                      {property.amenities.split(',').map((amenity, i) => (
                        <div key={i} className="fact-item">{amenity.trim()}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="fact-subsection">
                  <h4 className="fact-subsection-title">Interior area</h4>
                  <div className="fact-items">
                    <div className="fact-item">Total interior livable area: {property.size || "—"} sqm</div>
                  </div>
                </div>
              </div>

              {/* Property */}
              <div className="fact-category">
                <h3 className="fact-category-title">Property</h3>
                
                <div className="fact-subsection">
                  <h4 className="fact-subsection-title">Parking</h4>
                  <div className="fact-items">
                    <div className="fact-item">Parking spaces: {property.parking_spaces || "Not specified"}</div>
                  </div>
                </div>

                <div className="fact-subsection">
                  <h4 className="fact-subsection-title">Features</h4>
                  <div className="fact-items">
                    <div className="fact-item">Property type: {property.property_type}</div>
                    <div className="fact-item">Status: {property.status}</div>
                  </div>
                </div>
              </div>

              {/* Construction */}
              <div className="fact-category">
                <h3 className="fact-category-title">Construction</h3>
                
                <div className="fact-subsection">
                  <h4 className="fact-subsection-title">Type & style</h4>
                  <div className="fact-items">
                    <div className="fact-item">Home type: {property.property_type}</div>
                  </div>
                </div>

                {property.year_built && (
                  <div className="fact-subsection">
                    <h4 className="fact-subsection-title">Condition</h4>
                    <div className="fact-items">
                      <div className="fact-item">Year built: {property.year_built}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price History */}
          <div className="property-section">
            <h2 className="property-section-title">Price history</h2>
            <table className="price-history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Event</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{new Date(property.created_at).toLocaleDateString()}</td>
                  <td>Listed for sale</td>
                  <td>{formatPrice(property.price)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Location Map */}
          {coords && (
            <div className="property-section">
              <h2 className="property-section-title">Location</h2>
              <div className="property-map-container" style={{ height: '400px', width: '100%' }}>
                <MapContainer
                  center={coords}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ width: "100%", height: "100%" }}
                  key={`map-${property.id}`}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={coords}>
                    <Popup>{property.location}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="property-sidebar">
          {/* Contact Agent */}
          <div className="sidebar-contact-card">
            {property.user && (
              <div className="sidebar-agent-info-center">
                <img
                  src={getImageUrl(property.user.photo)}
                  alt={property.user.name}
                  className="sidebar-agent-photo-center"
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                />
                <h3 className="sidebar-agent-name-center">{property.user.name}</h3>
                {property.user.agency && (
                  <p className="sidebar-agent-agency">{property.user.agency}</p>
                )}
                <button 
                  className="sidebar-show-contact-btn"
                  onClick={() => setShowContact(!showContact)}
                >
                  <i className="fa fa-phone"></i> {showContact ? 'Hide contact' : 'Show contact'}
                </button>
                
                {showContact && (
                  <div className="sidebar-contact-info">
                    {property.user.phone && (
                      <a href={`tel:${property.user.phone}`} className="sidebar-contact-item">
                        <i className="fa fa-phone"></i> {property.user.phone}
                      </a>
                    )}
                    {property.user.email && (
                      <a href={`mailto:${property.user.email}`} className="sidebar-contact-item">
                        <i className="fa fa-envelope"></i> {property.user.email}
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="sidebar-message-section">
              <h3 className="sidebar-message-title">Send message to the seller</h3>
              <form className="sidebar-message-form" onSubmit={handleSendMessage}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message to the seller..."
                  className="sidebar-message-textarea"
                  rows="3"
                  required
                ></textarea>
                <button 
                  type="submit" 
                  className="sidebar-message-btn"
                  disabled={!message.trim()}
                >
                  <i className="fa fa-paper-plane"></i> Send
                </button>
              </form>

              <div className="sidebar-messages-section">
                <div className="sidebar-messages-header">
                  <i className="fa fa-comments"></i> Messages
                </div>
                {messages.length === 0 ? (
                  <div className="sidebar-messages-empty">
                    <i className="fa fa-inbox"></i>
                    <p>No messages yet.</p>
                  </div>
                ) : (
                  <div className="sidebar-messages-list">
                    {messages.map((msg) => (
                      <div key={msg.id} className="sidebar-message-item">
                        <div className="sidebar-message-sender">{msg.sender}</div>
                        <div className="sidebar-message-text">{msg.text}</div>
                        <div className="sidebar-message-time">
                          {new Date(msg.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Calculator */}
          <div className="sidebar-calculator-card">
            <h3 className="calculator-title">Est. monthly payment</h3>
            <div className="calculator-payment">
              {formatPrice(Math.round(property.price * 0.004))}<span style={{fontSize: '1rem', color: '#71717a'}}>/mo</span>
            </div>
            <p className="calculator-subtitle">Based on 20% down payment</p>
            <div className="calculator-breakdown">
              <div className="calculator-row">
                <span className="calculator-row-label">Principal & interest</span>
                <span className="calculator-row-value">{formatPrice(Math.round(property.price * 0.003))}</span>
              </div>
              <div className="calculator-row">
                <span className="calculator-row-label">Property taxes</span>
                <span className="calculator-row-value">{formatPrice(Math.round(property.price * 0.0008))}</span>
              </div>
              <div className="calculator-row">
                <span className="calculator-row-label">Home insurance</span>
                <span className="calculator-row-value">{formatPrice(Math.round(property.price * 0.0002))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;