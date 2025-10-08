import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


const PROPER_GREEN = "#228B22";
const defaultCenter = [5.6037, -0.1870]; // Accra fallback

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

function formatPrice(price) {
  return price
    ? `$${Number(price).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    : "N/A";
}

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [mainImg, setMainImg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [message, setMessage] = useState("");
  const [messageStatus, setMessageStatus] = useState("");
  const [related, setRelated] = useState([]);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await API.get(`/properties/${id}`);
        setProperty(data.data);
        setMainImg(data.data.images?.[0]);
        setBookmarked(data.data.is_bookmarked || false);
        // Geocode for map (simple approach, backend could store coords)
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
        console.error("Error fetching property:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  // Fetch related properties
  useEffect(() => {
    if (property?.category_id) {
      API.get(`/properties/related/${property.id}`)
        .then(({ data }) => setRelated(data.data || []));
    }
  }, [property, id]);

  // Bookmark handler
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

  // Contact seller/agent
  const handleMessageSend = async (e) => {
    e.preventDefault();
    setMessageStatus("");
    try {
      await API.post(`/properties/${id}/contact`, { message });
      setMessageStatus("Message sent!");
      setMessage("");
    } catch (err) {
      setMessageStatus("Failed to send. Try again.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <span className="animate-spin mr-3">🔄</span> Loading property...
      </div>
    );
  if (!property)
    return (
      <div className="p-6 text-center text-red-600 font-bold">
        Property not found.
      </div>
    );

  return (
    <div className="property-details-container">
      {/* Main Section */}
      <div className="property-main-section">
        {/* Image Gallery */}
        <div className="property-image-gallery">
          {property.images && property.images.length > 0 ? (
            <>
              <div className="property-main-image">
                <img
                  src={mainImg}
                  alt="Main property"
                  className="property-main-img"
                />
                <button
                  className={`property-fav-btn ${bookmarked ? "active" : ""}`}
                  title={bookmarked ? "Bookmarked" : "Bookmark"}
                  onClick={handleBookmark}
                >
                  <i className="fa fa-bookmark"></i>
                </button>
              </div>
              {property.images.length > 1 && (
                <div className="property-thumbnails">
                  {property.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      onClick={() => setMainImg(img)}
                      className={`property-thumb-img ${
                        img === mainImg
                          ? "property-thumb-active"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="property-no-images">
              No images available
            </div>
          )}
        </div>

        {/* Title, Price, Badges */}
        <div className="property-title-row">
          <h1 className="property-title">{property.title}</h1>
          <div className="property-price">{formatPrice(property.price)}</div>
        </div>
        <div className="property-badges">
          {property.category_name && (
            <span className="property-badge property-badge-green">
              {property.category_name}
            </span>
          )}
          <span className="property-badge property-badge-green">
            {property.property_type}
          </span>
          <span className="property-badge property-badge-gray">
            {property.status}
          </span>
          {property.is_featured && (
            <span className="property-badge property-badge-featured">
              Featured
            </span>
          )}
        </div>

        {/* Location */}
        <div className="property-location">
          <i className="fa fa-map-marker mr-1"></i>
          {property.location}
        </div>

        {/* Features grid */}
        <div className="property-features-grid">
          <div className="property-feature">
            <div className="property-feature-value">
              {property.bedrooms ?? "N/A"}
            </div>
            <div className="property-feature-label">Bedrooms</div>
          </div>
          <div className="property-feature">
            <div className="property-feature-value">
              {property.bathrooms ?? "N/A"}
            </div>
            <div className="property-feature-label">Bathrooms</div>
          </div>
          <div className="property-feature">
            <div className="property-feature-value">
              {property.size ? `${property.size} sqm` : "N/A"}
            </div>
            <div className="property-feature-label">Size</div>
          </div>
          <div className="property-feature">
            <div className="property-feature-value">
              {property.created_at
                ? new Date(property.created_at).toLocaleDateString()
                : "N/A"}
            </div>
            <div className="property-feature-label">Listed On</div>
          </div>
        </div>

        {/* Description */}
        <div className="property-description-section">
          <h2 className="property-section-title">Description</h2>
          <div className="property-description">
            {property.description}
          </div>
        </div>

        {/* Share buttons */}
        <div className="property-share-row">
          <span className="property-share-label">Share this property:</span>
          <a
            className="property-share-btn"
            href={`https://www.facebook.com/sharer.php?u=${window.location.href}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on Facebook"
          >
            <i className="fa fa-facebook"></i>
          </a>
          <a
            className="property-share-btn"
            href={`https://wa.me/?text=${window.location.href}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on WhatsApp"
          >
            <i className="fa fa-whatsapp"></i>
          </a>
          <a
            className="property-share-btn"
            href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on Twitter"
          >
            <i className="fa fa-twitter"></i>
          </a>
        </div>

        {/* Dynamic Map */}
        {coords && (
          <div className="property-map-section">
            <h2 className="property-section-title">Location on Map</h2>
            <MapContainer
              center={coords}
              zoom={15}
              scrollWheelZoom={false}
              style={{ width: "100%", height: "300px", borderRadius: "12px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={coords}>
                <Popup>{property.location}</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        {/* Related Properties UI */}
        <div className="property-related-section">
          <h2 className="property-section-title">Similar Properties</h2>
          <div className="property-related-grid">
            {related.length === 0 ? (
              <div className="property-no-images">No related properties found.</div>
            ) : (
              related.map((p) => (
                <a
                  href={`/properties/${p.id}`}
                  key={p.id}
                  className="property-related-card"
                >
                  <img
                    src={p.images?.[0] || "/img/default.jpg"}
                    alt={p.title}
                    className="property-related-img"
                  />
                  <div className="property-related-title">{p.title}</div>
                  <div className="property-related-price">
                    {formatPrice(p.price)}
                  </div>
                  <div className="property-related-location">
                    <i className="fa fa-map-marker"></i> {p.location}
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Contact/Agent UI */}
      {property.user && (
        <aside className="property-agent-card">
          <div className="agent-card-inner">
            <h3 className="agent-card-title">Contact Agent/Seller</h3>
            <div className="agent-card-row">
              <div className="agent-avatar">
                {property.user.name?.[0] || "?"}
              </div>
              <div>
                <div className="agent-name">{property.user.name}</div>
                <div className="agent-email">{property.user.email}</div>
              </div>
            </div>
            <form className="agent-contact-form" onSubmit={handleMessageSend}>
              <textarea
                placeholder="Write a message to the seller/agent"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={3}
              />
              <button
                type="submit"
                className="agent-contact-btn"
                disabled={!message}
              >
                Send Message
              </button>
              {messageStatus && (
                <div className="agent-contact-status">{messageStatus}</div>
              )}
            </form>
          </div>
        </aside>
      )}
    </div>
  );
};

export default PropertyDetails;