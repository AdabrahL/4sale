import { useEffect, useState, useRef } from "react";
import API from "../api/axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";
function getImageUrl(img) {
  if (!img) return "/img/default.jpg";
  return img.startsWith("http") ? img : `${backendUrl}/storage/${img}`;
}

const DEFAULT_FORM = {
  title: "",
  location: "",
  price: "",
  property_type: "",
  bedrooms: "",
  bathrooms: "",
  size: "",
  description: "",
  images: [],
  newImages: []
};

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await API.get("/my-properties");
      setProperties(response.data.data.data || response.data.data || []);
    } catch (error) {
      console.error("Error fetching my properties:", error);
      if (error.response && error.response.status === 401) {
        alert("Your session has expired or you are not logged in. Please log in again.");
      }
    }
  };

  const openModal = (property, edit = false) => {
    setSelectedProperty(property);
    setShowModal(true);
    setEditMode(edit);

    let images = [];
    if (property.images) {
      try {
        images = Array.isArray(property.images)
          ? property.images
          : JSON.parse(property.images);
      } catch {
        images = [];
      }
    }

    setForm(edit ? {
      title: property.title || "",
      location: property.location || "",
      price: property.price || "",
      property_type: property.property_type || "",
      bedrooms: property.bedrooms || "",
      bathrooms: property.bathrooms || "",
      size: property.size || "",
      description: property.description || "",
      images: images,
      newImages: []
    } : DEFAULT_FORM);
  };

  const closeModal = () => {
    setSelectedProperty(null);
    setShowModal(false);
    setEditMode(false);
    setForm(DEFAULT_FORM);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setForm(prev => ({
      ...prev,
      newImages: [...prev.newImages, ...files]
    }));
  };

  const handleRemoveImage = (img, type = "existing") => {
    if (type === "existing") {
      setForm(prev => ({
        ...prev,
        images: prev.images.filter(i => i !== img)
      }));
    } else {
      setForm(prev => ({
        ...prev,
        newImages: prev.newImages.filter(f => f.name !== img.name)
      }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("location", form.location);
      formData.append("price", form.price);
      formData.append("property_type", form.property_type);
      formData.append("bedrooms", form.bedrooms);
      formData.append("bathrooms", form.bathrooms);
      formData.append("size", form.size);
      formData.append("description", form.description);
      formData.append("images", JSON.stringify(form.images));
      form.newImages.forEach((file, idx) => {
        formData.append(`new_images[${idx}]`, file);
      });

      await API.post(
        `/properties/${selectedProperty.id}/update-with-images`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          },
          withCredentials: true,
        }
      );
      await fetchProperties();
      closeModal();
    } catch (error) {
      alert("Failed to update property.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await API.delete(
        `/properties/${selectedProperty.id}`,
        {
          withCredentials: true,
        }
      );
      await fetchProperties();
      closeModal();
    } catch (error) {
      alert("Failed to delete property.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-properties-container">
      <h1 className="mp-title">My Properties</h1>
      {properties.length === 0 ? (
        <p className="mp-empty">You haven’t created any properties yet.</p>
      ) : (
        <div className="mp-grid">
          {properties.map((property) => {
            let images = [];
            if (property.images) {
              try {
                images = Array.isArray(property.images)
                  ? property.images
                  : JSON.parse(property.images);
              } catch { images = []; }
            }
            return (
              <div key={property.id} className="mp-card">
                <div className="mp-image">
                  {images.length > 0 ? (
                    <img
                      src={getImageUrl(images[0])}
                      alt="Property"
                      className="mp-img-preview"
                    />
                  ) : (
                    <span className="mp-no-image">No Image</span>
                  )}
                </div>
                <div className="mp-content">
                  <h2 className="mp-card-title">{property.title}</h2>
                  <p className="mp-location">{property.location}</p>
                  <div className="mp-row">
                    <span className="mp-price">₵{property.price}</span>
                    <span className="mp-type">{property.property_type}</span>
                  </div>
                  <div className="mp-details">
                    {property.bedrooms && (
                      <span>{property.bedrooms} Beds • </span>
                    )}
                    {property.bathrooms && (
                      <span>{property.bathrooms} Baths • </span>
                    )}
                    <span>{property.size} sqm</span>
                  </div>
                  <div className="mp-actions">
                    <button className="mp-btn mp-edit" onClick={() => openModal(property, true)}>
                      Edit
                    </button>
                    <button className="mp-btn mp-delete" onClick={() => openModal(property)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Popup Modal */}
      {showModal && selectedProperty && (
        <div className="mp-modal-overlay" onClick={closeModal}>
          <div className="mp-modal mp-modal-scroll" onClick={e => e.stopPropagation()}>
            {editMode ? (
              <>
                <h3 className="mp-modal-title">Edit Property</h3>
                <form className="mp-edit-form" onSubmit={handleEditSubmit} encType="multipart/form-data">
                  <div>
                    <label>Current Images:</label>
                    <div className="mp-edit-images">
                      {form.images.length === 0 && <span className="mp-no-image">No Image</span>}
                      {form.images.map((img, idx) => (
                        <div key={img} className="mp-img-wrap">
                          <img
                            src={getImageUrl(img)}
                            alt={`property-img-${idx}`}
                            className="mp-img-preview"
                          />
                          <button
                            type="button"
                            className="mp-btn mp-delete mp-img-remove"
                            onClick={() => handleRemoveImage(img, "existing")}
                          >Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label>Add Images:</label>
                    <input
                      type="file"
                      multiple
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <div className="mp-edit-images">
                      {form.newImages.map((file, idx) => (
                        <div key={file.name} className="mp-img-wrap">
                          <img src={URL.createObjectURL(file)} alt={`new-img-${idx}`} className="mp-img-preview" />
                          <button type="button" className="mp-btn mp-delete mp-img-remove" onClick={() => handleRemoveImage(file, "new")}>Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <label>
                    Title
                    <input type="text" name="title" value={form.title} onChange={handleChange} required />
                  </label>
                  <label>
                    Location
                    <input type="text" name="location" value={form.location} onChange={handleChange} required />
                  </label>
                  <label>
                    Price
                    <input type="number" name="price" value={form.price} onChange={handleChange} required />
                  </label>
                  <label>
                    Property Type
                    <input type="text" name="property_type" value={form.property_type} onChange={handleChange} required />
                  </label>
                  <label>
                    Bedrooms
                    <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} />
                  </label>
                  <label>
                    Bathrooms
                    <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} />
                  </label>
                  <label>
                    Size (sqm)
                    <input type="number" name="size" value={form.size} onChange={handleChange} />
                  </label>
                  <label>
                    Description
                    <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
                  </label>
                  <div className="mp-modal-btns">
                    <button className="mp-btn mp-edit" type="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button className="mp-btn" type="button" onClick={closeModal}>Cancel</button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 className="mp-modal-title">Delete Property?</h3>
                <p>Are you sure you want to delete <strong>{selectedProperty.title}</strong>?</p>
                <div className="mp-modal-btns">
                  <button className="mp-btn mp-delete" onClick={handleDelete} disabled={loading}>
                    {loading ? "Deleting..." : "Delete"}
                  </button>
                  <button className="mp-btn" onClick={closeModal}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProperties;