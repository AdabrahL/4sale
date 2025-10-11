import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

const PROPER_GREEN = "#228B22"; // Forest Green

export default function CreateProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // You can fetch categories from backend or hardcode them
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    property_type: "",
    category_id: "",
    status: "for_sale",
    location: "",
    bedrooms: "",
    bathrooms: "",
    size: "",
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categories from backend (recommended)
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await API.get("/categories");
        setCategories(res.data.data || []);
      } catch (e) {
        setCategories([
          { id: 1, name: "Residential" },
          { id: 2, name: "Commercial" },
          { id: 3, name: "Land" },
          { id: 4, name: "Others" },
        ]); // fallback
      }
    }
    fetchCategories();
  }, []);

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
      setError(
        err.response?.data?.message ||
          "Failed to create property. Please check your inputs and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return (
      <p className="text-center text-red-600 font-semibold mt-12">
        You must be logged in to create a property.
      </p>
    );

  return (
    <div
      className="max-w-3xl mx-auto bg-white p-8 shadow-xl rounded-2xl mt-8"
      style={{ border: `2px solid ${PROPER_GREEN}` }}
    >
      <h1
        className="text-3xl font-bold mb-7 text-center"
        style={{ color: PROPER_GREEN }}
      >
        Create New Property
      </h1>

      {error && (
        <div className="mb-5 p-3 bg-red-100 text-red-700 rounded text-center font-semibold">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-7"
        autoComplete="off"
      >
        <input
          type="text"
          name="title"
          placeholder="Property Title"
          value={form.title}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2"
          style={{ borderColor: PROPER_GREEN }}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price (USD)"
          value={form.price}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2"
          style={{ borderColor: "#FFD700" }}
          required
        />

        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2"
          style={{ borderColor: PROPER_GREEN }}
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          name="property_type"
          value={form.property_type}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2"
          style={{ borderColor: "#FFD700" }}
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
  className="w-full border p-3 rounded-lg focus:ring-2"
  style={{ borderColor: PROPER_GREEN }}
>
  <option value="for_sale">For Sale</option>
  <option value="for_rent">For Rent</option>
  <option value="lease">Lease</option>
  
</select>

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2 col-span-2"
          style={{ borderColor: "#FFD700" }}
          required
        />

        <input
          type="number"
          name="bedrooms"
          placeholder="Bedrooms"
          value={form.bedrooms}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2"
          style={{ borderColor: PROPER_GREEN }}
        />

        <input
          type="number"
          name="bathrooms"
          placeholder="Bathrooms"
          value={form.bathrooms}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2"
          style={{ borderColor: "#FFD700" }}
        />

        <input
          type="text"
          name="size"
          placeholder="Size (sqft)"
          value={form.size}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2"
          style={{ borderColor: PROPER_GREEN }}
        />

        <textarea
          name="description"
          placeholder="Property Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2 col-span-2"
          style={{ borderColor: "#FFD700" }}
          rows="4"
          required
        />

        <div className="col-span-2">
          <input
            type="file"
            name="images"
            multiple
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:ring-2"
            style={{ borderColor: PROPER_GREEN }}
          />

          {imagePreviews.length > 0 && (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                    className="absolute top-2 right-2 bg-red-700 text-white text-xs px-2 py-1 rounded opacity-80 group-hover:opacity-100"
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
          className="col-span-2 py-3 rounded-lg font-bold transition"
          style={{
            background: PROPER_GREEN,
            color: "#fff",
            fontSize: "1.1rem",
            marginTop: "10px",
            boxShadow: loading
              ? `0 0 0 2px #228B22`
              : "0 2px 12px rgba(34,139,34,0.08)",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Saving..." : "Create Property"}
        </button>
      </form>
    </div>
  );
}