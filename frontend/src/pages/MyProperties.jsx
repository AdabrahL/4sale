import { useEffect, useState } from "react";
import axios from "axios";

const MyProperties = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const response = await axios.get("http://backend.test/api/my-properties", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          withCredentials: true,
        });

        console.log("📦 Full API response:", response.data);

        // ✅ properties are nested inside response.data.data.data
        setProperties(response.data.data.data || []);
      } catch (error) {
        console.error("Error fetching my properties:", error);
      }
    };

    fetchMyProperties();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Properties</h1>

      {properties.length === 0 ? (
        <p className="text-gray-600">You haven’t created any properties yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200"
            >
              <div className="h-40 bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600">No Image</span>
              </div>

              <div className="p-4">
                <h2 className="text-lg font-semibold">{property.title}</h2>
                <p className="text-gray-600 text-sm">{property.location}</p>

                <div className="mt-2 flex justify-between items-center">
                  <span className="text-green-600 font-bold">
                    ${property.price}
                  </span>
                  <span className="text-sm text-gray-500">
                    {property.property_type}
                  </span>
                </div>

                <div className="mt-2 text-sm text-gray-700">
                  {property.bedrooms && (
                    <span>{property.bedrooms} Beds • </span>
                  )}
                  {property.bathrooms && (
                    <span>{property.bathrooms} Baths • </span>
                  )}
                  <span>{property.size} sqm</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProperties;
