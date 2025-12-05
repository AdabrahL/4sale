import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import { GHANA_LOCATIONS } from "../components/GhanaMap";
import "../styles/create-property.css";


export default function CreateProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    property_type: "",
    category_id: "",
    status: "for_sale",
    location: "",
    region: "",
    bedrooms: "",
    bathrooms: "",
    size: "",
    land_size: "",
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [availableCities, setAvailableCities] = useState([]);
  const locationDropdownRef = useRef(null);

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
        ]);
      }
    }
    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Drag & drop logic
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Add images by input, drop, or paste
  const addImages = (newFiles) => {
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles],
    }));
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setCarouselIdx(0);
  };

  const handleImageInputChange = (e) => {
    const files = Array.from(e.target.files);
    addImages(files);
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setCarouselIdx((oldIdx) =>
      imagePreviews.length <= 1
        ? 0
        : oldIdx === index
        ? 0
        : oldIdx > index
        ? oldIdx - 1
        : oldIdx
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // When region changes, update available cities
    if (name === "region") {
      setAvailableCities(GHANA_LOCATIONS[value] || []);
      setForm((prev) => ({
        ...prev,
        region: value,
        location: "", // Reset location when region changes
      }));
    }
  };

  const handleLocationSelect = (city) => {
    setForm((prev) => ({
      ...prev,
      location: city,
    }));
    setLocationSearch(city);
    setShowLocationDropdown(false);
  };

  const filteredCities = availableCities.filter(city =>
    city.toLowerCase().includes(locationSearch.toLowerCase())
  );

  // Get all cities from all regions for search
  const allCities = Object.values(GHANA_LOCATIONS).flat();

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
      <p className="cp-notlogged text-center text-red-600 font-semibold mt-12">
        You must be logged in to create a property.
      </p>
    );

  // Dynamic field logic
  const showBedroomsBaths =
    form.property_type === "house" || form.property_type === "apartment";
  const showLandSize = form.property_type === "land";

  // Preview helpers
  const statusLabel = {
    for_sale: "For Sale",
    for_rent: "For Rent",
    lease: "Lease",
  };

  const category = categories.find((cat) => String(cat.id) === String(form.category_id));

  // Carousel navigation
  const nextImage = () => setCarouselIdx((idx) => (imagePreviews.length ? (idx + 1) % imagePreviews.length : 0));
  const prevImage = () => setCarouselIdx((idx) => (imagePreviews.length ? (idx - 1 + imagePreviews.length) % imagePreviews.length : 0));

  return (
    <div className="cp-two-col">
      {/* Left: Form */}
      <div className="cp-left">
        <form
          className="cp-form"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <h2 className="cp-title">Create Property Listing</h2>
          {error && <div className="cp-error">{error}</div>}

          {/* Image upload area */}
          <div
            className="cp-image-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              name="images"
              multiple
              ref={fileInputRef}
              className="cp-image-input"
              onChange={handleImageInputChange}
              style={{ display: "none" }}
              accept="image/*"
            />
            {imagePreviews.length === 0 ? (
              <div className="cp-image-placeholder">
                <span>Click or Drag Images Here</span>
              </div>
            ) : (
              <div className="cp-image-previews">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="cp-image-preview-wrap">
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="cp-image-preview"
                    />
                    <button
                      type="button"
                      className="cp-remove-image"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Group 1: Basic Info */}
          <div className="cp-section">
            <label className="cp-label">Title</label>
            <input
              type="text"
              name="title"
              placeholder="Property Title"
              value={form.title}
              onChange={handleChange}
              className="cp-input"
              required
            />

            <label className="cp-label">Description</label>
            <textarea
              name="description"
              placeholder="Property Description"
              value={form.description}
              onChange={handleChange}
              className="cp-input"
              rows="3"
              required
            />
          </div>

          {/* Group 2: Category & Type */}
          <div className="cp-section cp-flex">
            <div className="cp-flex-item">
              <label className="cp-label">Category</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="cp-input"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="cp-flex-item">
              <label className="cp-label">Property Type</label>
              <select
                name="property_type"
                value={form.property_type}
                onChange={handleChange}
                className="cp-input"
                required
              >
                <option value="">Select Type</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>

          {/* Group 3: Location & Status */}
          <div className="cp-section cp-flex">
            <div className="cp-flex-item">
              <label className="cp-label">Region</label>
              <select
                name="region"
                value={form.region}
                onChange={handleChange}
                className="cp-input"
                required
              >
                <option value="">Select Region</option>
                {Object.keys(GHANA_LOCATIONS).map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
            <div className="cp-flex-item">
              <label className="cp-label">City/Town</label>
              <div style={{ position: "relative" }} ref={locationDropdownRef}>
                <input
                  type="text"
                  name="location"
                  placeholder={form.region ? "Select city/town" : "Select region first"}
                  value={locationSearch || form.location}
                  onChange={(e) => {
                    setLocationSearch(e.target.value);
                    setShowLocationDropdown(true);
                  }}
                  onFocus={() => setShowLocationDropdown(true)}
                  className="cp-input"
                  required
                  disabled={!form.region}
                />
                {showLocationDropdown && form.region && (
                  <div className="location-dropdown">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <div
                          key={city}
                          className="location-option"
                          onClick={() => handleLocationSelect(city)}
                        >
                          <i className="fa fa-map-marker"></i> {city}
                        </div>
                      ))
                    ) : (
                      <div className="location-option disabled">
                        No cities found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="cp-section cp-flex">
            <div className="cp-flex-item">
              <label className="cp-label">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="cp-input"
                required
              >
                <option value="for_sale">For Sale</option>
                <option value="for_rent">For Rent</option>
                <option value="lease">Lease</option>
              </select>
            </div>
          </div>

          {/* Group 4: Pricing */}
          <div className="cp-section">
            <label className="cp-label">Price (Ghana Cedis)</label>
            <div className="cp-currency-input">
              <span className="cp-currency-symbol">₵</span>
              <input
                type="number"
                name="price"
                min={0}
                placeholder="e.g. 120000"
                value={form.price}
                onChange={handleChange}
                className="cp-input cp-input-no-border"
                required
              />
            </div>
          </div>

          {/* Group 5: Dynamic fields */}
          {showBedroomsBaths && (
            <div className="cp-section cp-flex">
              <div className="cp-flex-item">
                <label className="cp-label">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  min={0}
                  placeholder="Bedrooms"
                  value={form.bedrooms}
                  onChange={handleChange}
                  className="cp-input"
                  required
                />
              </div>
              <div className="cp-flex-item">
                <label className="cp-label">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  min={0}
                  placeholder="Bathrooms"
                  value={form.bathrooms}
                  onChange={handleChange}
                  className="cp-input"
                  required
                />
              </div>
            </div>
          )}

          {showLandSize && (
            <div className="cp-section">
              <label className="cp-label">Land Size</label>
              <input
                type="text"
                name="land_size"
                placeholder="e.g. 70 x 100 feet"
                value={form.land_size}
                onChange={handleChange}
                className="cp-input"
                required
              />
            </div>
          )}

          <div className="cp-section">
            <label className="cp-label">Size (sqft)</label>
            <input
              type="text"
              name="size"
              placeholder="e.g. 1350"
              value={form.size}
              onChange={handleChange}
              className="cp-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cp-btn"
          >
            {loading ? "Saving..." : "Create Property"}
          </button>
        </form>
      </div>

      {/* Right: Live Preview with Carousel */}
      <div className="cp-right">
        <div className="cp-preview-card">
          {/* Images carousel */}
          <div className="cp-preview-imagebox">
            {imagePreviews.length > 0 ? (
              <>
                <img
                  src={imagePreviews[carouselIdx]}
                  alt="Property Preview"
                  className="cp-preview-image"
                />
                {/* Carousel navigation */}
                {imagePreviews.length > 1 && (
                  <>
                    <button className="cp-carousel-arrow cp-carousel-arrow-left" onClick={prevImage} tabIndex={-1}>&lt;</button>
                    <button className="cp-carousel-arrow cp-carousel-arrow-right" onClick={nextImage} tabIndex={-1}>&gt;</button>
                  </>
                )}
                {/* Carousel dots */}
                <div className="cp-carousel-dots">
                  {imagePreviews.map((_, i) => (
                    <button
                      key={i}
                      className={`cp-carousel-dot${carouselIdx === i ? " active" : ""}`}
                      onClick={() => setCarouselIdx(i)}
                      tabIndex={-1}
                    ></button>
                  ))}
                </div>
              </>
            ) : (
              <div className="cp-preview-image-placeholder">
                No Image
              </div>
            )}
            {form.status && (
              <span className={`cp-preview-status cp-preview-status-${form.status}`}>
                {statusLabel[form.status]}
              </span>
            )}
          </div>
          <div className="cp-preview-content">
            <h3 className="cp-preview-title">{form.title || "Property Title"}</h3>
            <div className="cp-preview-price">
              {form.price ? (
                <>₵{parseInt(form.price).toLocaleString()}</>
              ) : (
                "Price not set"
              )}
            </div>
            <div className="cp-preview-location">
              {form.location || "Location"}
            </div>
            <div className="cp-preview-type">
              {category?.name || "Category"}, {form.property_type || "Type"}
            </div>
            {showBedroomsBaths && (
              <div className="cp-preview-details">
                <span>{form.bedrooms || 0} Beds</span>
                <span>{form.bathrooms || 0} Baths</span>
                {form.size && <span>{form.size} sqft</span>}
              </div>
            )}
            {showLandSize && (
              <div className="cp-preview-details">
                <span>{form.land_size || "Land Size"}</span>
                {form.size && <span>{form.size} sqft</span>}
              </div>
            )}
            <div className="cp-preview-desc">
              {form.description || "Description will appear here."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}