import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PropertyMessageSidebar from "../components/PropertyMessageSidebar";
import { useAuth } from "../contexts/AuthContext"; // <-- import useAuth

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

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth(); // <-- get user from context
  const currentUserId = user?.id; // <-- use real logged-in user id

  const [property, setProperty] = useState(null);
  const [mainImgIndex, setMainImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [related, setRelated] = useState([]);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await API.get(`/properties/${id}`);
        setProperty(data.data);
        setMainImgIndex(0);
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

  useEffect(() => {
    if (property?.category_id) {
      API.get(`/properties/related/${property.id}`)
        .then(({ data }) => {
          setRelated(data.data || []);
        });
    }
  }, [property, id]);

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

  // Carousel controls
  function prevImg() {
    setMainImgIndex((prev) =>
      prev === 0 ? (property.images.length - 1) : prev - 1
    );
  }
  function nextImg() {
    setMainImgIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  }

  if (loading)
    return (
      <div className="marketplace-details-loading">
        <span className="animate-spin mr-3">🔄</span> Loading property...
      </div>
    );
  if (!property)
    return (
      <div className="marketplace-details-error">
        Property not found.
      </div>
    );

  const images =
    property.images && property.images.length > 0
      ? property.images
      : ["/img/default.jpg"];

  return (
    <div className="marketplace-details-layout">
      {/* LEFT: Main gallery and info */}
      <div className="marketplace-details-main">
        {/* Carousel */}
        <div className="marketplace-details-gallery">
          <div className="marketplace-carousel-wrap">
            <img
              src={images[mainImgIndex]}
              alt="Property"
              className="marketplace-details-mainimg"
            />
            {images.length > 1 && (
              <>
                <button
                  className="marketplace-carousel-arrow left"
                  onClick={prevImg}
                  aria-label="Previous photo"
                >
                  <i className="fa fa-chevron-left"></i>
                </button>
                <button
                  className="marketplace-carousel-arrow right"
                  onClick={nextImg}
                  aria-label="Next photo"
                >
                  <i className="fa fa-chevron-right"></i>
                </button>
              </>
            )}
            <button
              className={`marketplace-fav-btn ${bookmarked ? "active" : ""}`}
              title={bookmarked ? "Bookmarked" : "Bookmark"}
              onClick={handleBookmark}
            >
              <i className="fa fa-bookmark"></i>
            </button>
          </div>
          {images.length > 1 && (
            <div className="marketplace-details-thumbs-list">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  onClick={() => setMainImgIndex(i)}
                  className={`marketplace-details-thumb ${
                    i === mainImgIndex ? "marketplace-thumb-active" : ""
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        {/* Main Info */}
        <div className="marketplace-details-title-row">
          <h1 className="marketplace-details-title">{property.title}</h1>
          <div className="marketplace-details-price">
            {formatPrice(property.price)}
          </div>
        </div>
        <div className="marketplace-details-badges-row">
          {property.category_name && (
            <span className="marketplace-details-badge marketplace-details-badge-green">
              {property.category_name}
            </span>
          )}
          <span className="marketplace-details-badge marketplace-details-badge-green">
            {property.property_type}
          </span>
          <span className="marketplace-details-badge marketplace-details-badge-gray">
            {property.status}
          </span>
        </div>
        <div className="marketplace-details-location">
          <i className="fa fa-map-marker mr-1"></i>
          {property.location}
        </div>
        <div className="marketplace-details-features">
          <div>
            <i className="fa fa-bed"></i>
            {property.bedrooms ?? "—"} <span>Bedrooms</span>
          </div>
          <div>
            <i className="fa fa-bath"></i>
            {property.bathrooms ?? "—"} <span>Bathrooms</span>
          </div>
          <div>
            <i className="fa fa-expand"></i>
            {property.size ? `${property.size} sqm` : "—"} <span>Area</span>
          </div>
          <div>
            <i className="fa fa-calendar"></i>
            {property.created_at
              ? new Date(property.created_at).toLocaleDateString()
              : "—"}
            <span>Listed</span>
          </div>
        </div>
        <div className="marketplace-details-desc-section">
          <h2 className="marketplace-details-sectitle">Description</h2>
          <div className="marketplace-details-desc">
            {property.description}
          </div>
        </div>
        <div className="marketplace-details-share-row">
          <span className="marketplace-details-share-label">Share:</span>
          <a
            className="marketplace-details-sharebtn"
            href={`https://www.facebook.com/sharer.php?u=${window.location.href}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on Facebook"
          >
            <i className="fa fa-facebook"></i>
          </a>
          <a
            className="marketplace-details-sharebtn"
            href={`https://wa.me/?text=${window.location.href}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on WhatsApp"
          >
            <i className="fa fa-whatsapp"></i>
          </a>
          <a
            className="marketplace-details-sharebtn"
            href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on Twitter"
          >
            <i className="fa fa-twitter"></i>
          </a>
        </div>
        {coords && (
          <div className="marketplace-details-map-section">
            <h2 className="marketplace-details-sectitle">Location on Map</h2>
            <MapContainer
              center={coords}
              zoom={15}
              scrollWheelZoom={false}
              style={{ width: "100%", height: "260px", borderRadius: "12px" }}
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
        <div className="marketplace-details-related-section">
          <h2 className="marketplace-details-sectitle">Similar Properties</h2>
          <div className="marketplace-details-related-grid">
            {related.length === 0 ? (
              <div className="marketplace-details-noimages">
                No related properties found.
              </div>
            ) : (
              related.map((p) => (
                <a
                  href={`/properties/${p.id}`}
                  key={p.id}
                  className="marketplace-details-related-card"
                >
                  <img
                    src={p.images?.[0] || "/img/default.jpg"}
                    alt={p.title}
                    className="marketplace-details-related-img"
                  />
                  <div className="marketplace-details-related-title">
                    {p.title}
                  </div>
                  <div className="marketplace-details-related-price">
                    {formatPrice(p.price)}
                  </div>
                  <div className="marketplace-details-related-location">
                    <i className="fa fa-map-marker"></i> {p.location}
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </div>
      {/* SIDEBAR: Message/chat */}
      <PropertyMessageSidebar
  propertyId={property.id}
  seller={property.user || { id: property.user_id }} // pass user or fallback to id
  userId={currentUserId}
  isOwner={currentUserId === property.user_id}
/>
    </div>
  );
};

export default PropertyDetails;