import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export default function AgentProfile() {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); // Filter text for properties

  useEffect(() => {
    fetch(`http://backend.test/api/agents/${id}`)
      .then(res => res.json())
      .then(data => {
        setAgent(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container py-5">Loading agent profile...</div>;
  if (!agent || agent.error) return <div className="container py-5">Agent not found.</div>;

  // Helper for photo url
  const getPhotoUrl = (photo) => {
    if (!photo) return '/default-avatar.png';
    return photo.startsWith('http') ? photo : `/storage/${photo}`;
  };

  // Filter properties by title, location, type
  const filteredProperties = agent.properties?.filter(property => 
    property.title?.toLowerCase().includes(search.toLowerCase()) ||
    property.location?.toLowerCase().includes(search.toLowerCase()) ||
    property.property_type?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="container py-5">
      <div className="row">
        {/* Agent Info */}
        <div className="col-md-4">
          <img
            src={getPhotoUrl(agent.photo)}
            alt={agent.name}
            className="img-fluid rounded-circle mb-3"
            style={{ width: "180px", height: "180px", objectFit: "cover" }}
          />
          <h4>{agent.name}</h4>
          <p>{agent.bio}</p>
          <ul className="list-unstyled">
            <li><strong>Phone:</strong> {agent.phone}</li>
            <li><strong>Email:</strong> {agent.email}</li>
            {agent.socials && Object.entries(agent.socials).map(([key, value]) => (
              value ? (
                <li key={key}>
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
                  {key === "whatsapp"
                    ? value
                    : <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
                  }
                </li>
              ) : null
            ))}
          </ul>
        </div>
        {/* Properties */}
        <div className="col-md-8">
          <h5>Properties Listed</h5>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search properties by title, location, or type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="row">
            {filteredProperties.length === 0 ? (
              <div className="col-12"><p>No properties found.</p></div>
            ) : filteredProperties.map(property => (
              <div key={property.id} className="col-lg-6 mb-4">
                <div className="card shadow-sm property-card">
                  {/* Show first property image if available */}
                  {property.images && JSON.parse(property.images)[0] && (
                    <img
                      src={`/storage/${JSON.parse(property.images)[0]}`}
                      alt={property.title}
                      className="card-img-top"
                      style={{ height: "120px", objectFit: "cover" }}
                    />
                  )}
                  <div className="card-body">
                    <h6 className="card-title">{property.title}</h6>
                    <p className="card-text">{property.description}</p>
                    <div className="text-muted small"><strong>Location:</strong> {property.location}</div>
                    <div className="text-muted small"><strong>Type:</strong> {property.property_type}</div>
                    <div className="text-muted small"><strong>Status:</strong> {property.status}</div>
                    <div className="text-muted small"><strong>Price:</strong> {property.price}</div>
                    <div className="text-muted small"><strong>Date Posted:</strong> {property.created_at ? property.created_at.slice(0,10) : ''}</div>
                    <Link to={`/properties/${property.id}`} className="btn btn-outline-success btn-sm mt-2">
                      View Property
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}