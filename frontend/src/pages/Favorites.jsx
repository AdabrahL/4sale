import { useEffect, useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";
import "../styles/favorites.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";
function getImageUrl(img) {
  if (!img) return "/img/default.jpg";
  return img.startsWith("http") ? img : `${backendUrl}/storage/${img}`;
}

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/favorites")
      .then(res => setFavorites(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="favorites-container container py-5">
      <div className="favorites-header">
        <h2 className="favorites-title">
          <i className="fa fa-bookmark"></i> My Saved Properties
        </h2>
        <p className="favorites-subtitle">All your favorite homes, lands, and spaces — saved for easy reference.</p>
      </div>
      {loading ? (
        <div className="favorites-loading">Loading your saved properties...</div>
      ) : favorites.length === 0 ? (
        <div className="favorites-empty">
          <i className="fa fa-bookmark-o" style={{fontSize: "2.5em", color: "#c7e4c7"}}></i>
          <div>You have no saved properties yet.</div>
          <Link to="/properties" className="favorites-back-btn">
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="favorites-grid props-grid">
          {favorites.map(property => (
            <div key={property.id} className="favorites-card props-card">
              <Link to={`/properties/${property.id}`}>
                <div
                  className="favorites-card-img props-card-img"
                  style={{
                    backgroundImage: `url(${
                      property.images && property.images.length > 0
                        ? getImageUrl(
                            typeof property.images === "string"
                              ? JSON.parse(property.images)[0]
                              : property.images[0]
                          )
                        : "/img/default.jpg"
                    })`,
                  }}
                >
                  <span className="favorites-card-bookmark">
                    <i className="fa fa-bookmark"></i>
                  </span>
                </div>
              </Link>
              <div className="favorites-card-body props-card-body">
                <h3 className="favorites-card-title props-card-title">
                  <Link to={`/properties/${property.id}`}>{property.title}</Link>
                </h3>
                <div className="favorites-card-price props-card-price">
                  ₵{Number(property.price).toLocaleString()}
                </div>
                <div className="favorites-card-detail props-card-detail">
                  <span>
                    <i className="fa fa-map-marker map-icon-green"></i> {property.location}
                  </span>
                </div>
                <div className="favorites-card-meta props-card-meta">
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
                <div className="favorites-card-views props-card-views">
                  <i className="fa fa-eye"></i> {property.views || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}