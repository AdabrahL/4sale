import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await API.get(`/properties/${id}`);
        setProperty(data.data);
      } catch (err) {
        console.error("Error fetching property:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!property) return <p className="p-6">Property not found.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-4">{property.title}</h1>

      {/* Images */}
      {property.images && property.images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {property.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Property ${index + 1}`}
              className="w-full h-56 object-cover rounded"
            />
          ))}
        </div>
      ) : (
        <p className="italic text-gray-500 mb-4">No images available</p>
      )}

      {/* Description */}
      <p className="mb-4 text-gray-700">{property.description}</p>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <p><strong>💰 Price:</strong> {property.price}</p>
        <p><strong>📍 Location:</strong> {property.location}</p>
        <p><strong>🏠 Type:</strong> {property.property_type}</p>
        <p><strong>📏 Size:</strong> {property.size} sqm</p>
        <p><strong>🛏 Bedrooms:</strong> {property.bedrooms ?? "N/A"}</p>
        <p><strong>🛁 Bathrooms:</strong> {property.bathrooms ?? "N/A"}</p>
      </div>

      {/* Ratings & Reviews */}
      <div className="p-4 border rounded mb-6 bg-gray-50">
        <h3 className="font-semibold mb-2">⭐ Reviews & Ratings</h3>
        <p className="text-yellow-500 text-lg">
          {property.average_rating} / 5
        </p>
        <p className="text-gray-600">{property.review_count} total reviews</p>
      </div>

      {/* Seller Info */}
      {property.user && (
        <div className="p-4 border rounded bg-white">
          <h3 className="font-semibold mb-2">Seller Info</h3>
          <p>👤 {property.user.name}</p>
          <p>📧 {property.user.email}</p>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
