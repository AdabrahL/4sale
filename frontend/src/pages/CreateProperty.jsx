// src/pages/CreateProperty.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

export default function CreateProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    property_type: "",
    status: "available",
    location: "",
    bedrooms: "",
    bathrooms: "",
    size: "",
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images" && files) {
      const newFiles = Array.from(files);
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
      }));

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "images" && value.length > 0) {
          value.forEach((file) => {
            formData.append("images[]", file);
          });
        } else {
          formData.append(key, value);
        }
      });

      await API.post("/properties", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/properties");
    } catch (err) {
      setError("Failed to create property. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return (
      <p className="text-center text-red-600 font-semibold">
        You must be logged in to create a property.
      </p>
    );

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg rounded-xl mt-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-green-700">
        Create New Property
      </h1>

      {error && (
        <p className="text-red-500 text-center mb-4 bg-red-100 p-2 rounded">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <input
          type="text"
          name="title"
          placeholder="Property Title"
          value={form.title}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-600"
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price (USD)"
          value={form.price}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-yellow-500"
          required
        />

        <select
          name="property_type"
          value={form.property_type}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-600"
          required
        >
          <option value="">Select Property Type</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="land">Land</option>
          <option value="commercial">Commercial</option>
        </select>

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-yellow-500"
        >
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="rented">Rented</option>
        </select>

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-600 col-span-2"
          required
        />

        <input
          type="number"
          name="bedrooms"
          placeholder="Bedrooms"
          value={form.bedrooms}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-yellow-500"
        />

        <input
          type="number"
          name="bathrooms"
          placeholder="Bathrooms"
          value={form.bathrooms}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-600"
        />

        <input
          type="text"
          name="size"
          placeholder="Size (sqft)"
          value={form.size}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-yellow-500"
        />

        <textarea
          name="description"
          placeholder="Property Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-600 col-span-2"
          rows="4"
          required
        />

        <div className="col-span-2">
          <input
            type="file"
            name="images"
            multiple
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-yellow-500"
          />

          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {imagePreviews.map((src, index) => (
                <div
                  key={index}
                  className="relative w-full h-32 rounded-lg overflow-hidden shadow group"
                >
                  <img
                    src={src}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-80 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="col-span-2 bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition"
        >
          {loading ? "Saving..." : "Create Property"}
        </button>
      </form>
    </div>
  );
}
