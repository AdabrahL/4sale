import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";
import "../styles/my-properties.css";

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

export default function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const fileInputRef = useRef();

  useEffect(() => {
    const t = setTimeout(() => fetchProperties(1), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [query, statusFilter, sortBy]);

  useEffect(() => {
    fetchProperties(meta.current_page);
    // eslint-disable-next-line
  }, []);

  async function fetchProperties(page = 1) {
    setLoading(true);
    try {
      const params = {
        page,
        q: query || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        sort: sortBy
      };
      const res = await API.get("/my-properties", { params });
      const payload = res.data?.data || res.data;
      if (payload && payload.data && Array.isArray(payload.data)) {
        setProperties(payload.data);
        setMeta({
          current_page: payload.current_page || page,
          last_page: payload.last_page || 1,
          per_page: payload.per_page || 10,
          total: payload.total || payload.data.length
        });
      } else if (Array.isArray(payload)) {
        setProperties(payload);
        setMeta({ current_page: 1, last_page: 1, per_page: payload.length, total: payload.length });
      } else {
        setProperties([]);
      }
    } catch (err) {
      console.error("Failed to fetch properties:", err.response?.data || err.message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }

  const openModal = (property, edit = false) => {
    setSelectedProperty(property);
    setShowModal(true);
    setEditMode(edit);

    let images = [];
    if (property.images) {
      try {
        images = Array.isArray(property.images) ? property.images : JSON.parse(property.images);
      } catch {
        images = [];
      }
    }

    setForm(edit
      ? {
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
        }
      : DEFAULT_FORM
    );
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
    setForm(prev => ({ ...prev, newImages: [...prev.newImages, ...files] }));
  };

  const handleRemoveImage = (img, type = "existing") => {
    if (type === "existing") {
      setForm(prev => ({ ...prev, images: prev.images.filter(i => i !== img) }));
    } else {
      setForm(prev => ({ ...prev, newImages: prev.newImages.filter(f => f.name !== img.name) }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProperty) return;
    setLoadingAction(true);
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
      formData.append("images", JSON.stringify(form.images || []));
      form.newImages.forEach((file) => formData.append("new_images[]", file));

      await API.post(`/properties/${selectedProperty.id}/update-with-images`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      await fetchProperties(meta.current_page);
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to update property. Check console for details.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProperty) return;
    if (!confirm(`Delete "${selectedProperty.title}"? This action is irreversible.`)) return;
    setLoadingAction(true);
    try {
      await API.delete(`/properties/${selectedProperty.id}`);
      setProperties(prev => prev.filter(p => p.id !== selectedProperty.id));
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to delete property.");
    } finally {
      setLoadingAction(false);
    }
  };

  const statusInfo = (p) => {
    if (p.is_approved) return { label: "Approved", color: "approved" };
    if (p.rejection_reason) return { label: "Rejected", color: "rejected" };
    return { label: "Pending", color: "pending" };
  };

  const goToPage = (p) => {
    const page = Math.max(1, Math.min(meta.last_page || 1, p));
    setMeta(prev => ({ ...prev, current_page: page }));
    fetchProperties(page);
  };

  const skeletons = useMemo(() => new Array(6).fill(0), []);

  const stats = useMemo(() => {
    return {
      total: properties.length,
      approved: properties.filter(p => p.is_approved).length,
      pending: properties.filter(p => !p.is_approved && !p.rejection_reason).length,
      rejected: properties.filter(p => p.rejection_reason).length,
    };
  }, [properties]);

  return (
    <div className="my-properties-page">
      {/* Header Section */}
      <motion.div 
        className="mp-header-section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mp-header-content">
          <div className="mp-header-left">
            <h1 className="mp-page-title">
              <i className="fa fa-building"></i> My Properties
            </h1>
            <p className="mp-page-subtitle">Manage and track your property listings</p>
          </div>
          <motion.button 
            className="mp-create-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = "/properties/create"}
          >
            <i className="fa fa-plus-circle"></i> Create New Listing
          </motion.button>
        </div>

        {/* Stats Cards */}
        {!loading && properties.length > 0 && (
          <motion.div 
            className="mp-stats-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div 
              className="mp-stat-card total"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="mp-stat-icon">
                <i className="fa fa-home"></i>
              </div>
              <div className="mp-stat-info">
                <div className="mp-stat-value">{stats.total}</div>
                <div className="mp-stat-label">Total Listings</div>
              </div>
            </motion.div>

            <motion.div 
              className="mp-stat-card approved"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="mp-stat-icon">
                <i className="fa fa-check-circle"></i>
              </div>
              <div className="mp-stat-info">
                <div className="mp-stat-value">{stats.approved}</div>
                <div className="mp-stat-label">Approved</div>
              </div>
            </motion.div>

            <motion.div 
              className="mp-stat-card pending"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="mp-stat-icon">
                <i className="fa fa-clock"></i>
              </div>
              <div className="mp-stat-info">
                <div className="mp-stat-value">{stats.pending}</div>
                <div className="mp-stat-label">Pending</div>
              </div>
            </motion.div>

            <motion.div 
              className="mp-stat-card rejected"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="mp-stat-icon">
                <i className="fa fa-times-circle"></i>
              </div>
              <div className="mp-stat-info">
                <div className="mp-stat-value">{stats.rejected}</div>
                <div className="mp-stat-label">Rejected</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Filters & Controls */}
      <motion.div 
        className="mp-controls-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="mp-search-wrapper">
          <i className="fa fa-search mp-search-icon"></i>
          <input
            className="mp-search-input"
            placeholder="Search by title or location..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="mp-filters-wrapper">
          <div className="mp-filter-group">
            <i className="fa fa-filter"></i>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="mp-select">
              <option value="all">All Statuses</option>
              <option value="approved">✓ Approved</option>
              <option value="pending">⏱ Pending</option>
              <option value="rejected">✕ Rejected</option>
            </select>
          </div>

          <div className="mp-filter-group">
            <i className="fa fa-sort-amount-down"></i>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="mp-select">
              <option value="newest">Newest First</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Properties Grid */}
      {loading ? (
        <div className="mp-properties-grid">
          {skeletons.map((_, idx) => (
            <motion.div 
              key={idx} 
              className="mp-property-card skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="mp-card-image skeleton-shimmer" />
              <div className="mp-card-content">
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line skeleton-price" />
                <div className="skeleton-line skeleton-location" />
                <div className="skeleton-stats">
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <motion.div 
          className="mp-empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mp-empty-icon">
            <i className="fa fa-home"></i>
          </div>
          <h2 className="mp-empty-title">No Properties Yet</h2>
          <p className="mp-empty-text">Start building your property portfolio by creating your first listing</p>
          <motion.button 
            className="mp-empty-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = "/properties/create"}
          >
            <i className="fa fa-plus-circle"></i> Create Your First Listing
          </motion.button>
        </motion.div>
      ) : (
        <>
          <motion.div 
            className="mp-properties-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {properties.map((property, index) => {
              let images = [];
              try {
                images = property.images ? (Array.isArray(property.images) ? property.images : JSON.parse(property.images)) : [];
              } catch { images = []; }
              const stat = statusInfo(property);
              
              return (
                <motion.article 
                  key={property.id} 
                  className="mp-property-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  {/* Image Section */}
                  <div className="mp-card-image">
                    {images.length > 0 ? (
                      <img src={getImageUrl(images[0])} alt={property.title} />
                    ) : (
                      <div className="mp-no-image">
                        <i className="fa fa-image"></i>
                        <span>No Image</span>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={`mp-status-badge ${stat.color}`}>
                      <i className={`fa fa-${stat.color === 'approved' ? 'check-circle' : stat.color === 'pending' ? 'clock' : 'times-circle'}`}></i>
                      {stat.label}
                    </div>

                    {/* Views Badge */}
                    <div className="mp-views-badge">
                      <i className="fa fa-eye"></i> {property.views || 0}
                    </div>

                    {/* Image Count Badge */}
                    {images.length > 1 && (
                      <div className="mp-image-count-badge">
                        <i className="fa fa-images"></i> {images.length}
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="mp-card-content">
                    <div className="mp-card-header">
                      <h3 className="mp-card-title">{property.title}</h3>
                    </div>

                    <div className="mp-card-location">
                      <i className="fa fa-map-marker-alt"></i>
                      <span>{property.location}</span>
                    </div>

                    <div className="mp-card-type-price">
                      <div className="mp-card-type">
                        <span>{property.property_type}</span>
                      </div>
                      <div className="mp-card-price">₵{Number(property.price).toLocaleString()}</div>
                    </div>

                    {/* Property Stats */}
                    <div className="mp-card-stats">
                      <div className="mp-stat-item">
                        <i className="fa fa-bed"></i>
                        <span>{property.bedrooms || "-"} Beds</span>
                      </div>
                      <div className="mp-stat-item">
                        <i className="fa fa-bath"></i>
                        <span>{property.bathrooms || "-"} Baths</span>
                      </div>
                      <div className="mp-stat-item">
                        <i className="fa fa-expand-arrows-alt"></i>
                        <span>{property.size || "-"} sqm</span>
                      </div>
                    </div>

                    {/* Rejection Reason Alert */}
                    {property.rejection_reason && (
                      <motion.div 
                        className="mp-rejection-alert"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                      >
                        <i className="fa fa-exclamation-triangle"></i>
                        <span>Rejected - Click "View Reason" for details</span>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="mp-card-actions">
                      <motion.button 
                        className="mp-action-btn view"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.href = `/properties/${property.id}`}
                      >
                        <i className="fa fa-eye"></i> View
                      </motion.button>

                      <motion.button 
                        className="mp-action-btn edit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal(property, true)}
                      >
                        <i className="fa fa-edit"></i> Edit
                      </motion.button>

                      <motion.button 
                        className="mp-action-btn delete"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal(property, false)}
                      >
                        <i className="fa fa-trash-alt"></i> Delete
                      </motion.button>

                      {property.rejection_reason && (
                        <motion.button 
                          className="mp-action-btn reason"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => alert(`Rejection reason:\n\n${property.rejection_reason}`)}
                        >
                          <i className="fa fa-info-circle"></i> View Reason
                        </motion.button>
                      )}
                    </div>

                    {/* Footer Info */}
                    <div className="mp-card-footer">
                      <span className="mp-updated">
                        <i className="fa fa-calendar-alt"></i>
                        Updated {new Date(property.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>

          {/* Pagination */}
          <motion.div 
            className="mp-pagination"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button 
              className="mp-page-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => goToPage(meta.current_page - 1)} 
              disabled={meta.current_page <= 1}
            >
              <i className="fa fa-chevron-left"></i> Previous
            </motion.button>
            
            <div className="mp-page-info">
              <span className="mp-page-current">Page {meta.current_page} of {meta.last_page}</span>
              <span className="mp-page-total">• {meta.total} listings</span>
            </div>
            
            <motion.button 
              className="mp-page-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => goToPage(meta.current_page + 1)} 
              disabled={meta.current_page >= meta.last_page}
            >
              Next <i className="fa fa-chevron-right"></i>
            </motion.button>
          </motion.div>
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedProperty && (
          <motion.div 
            className="mp-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div 
              className="mp-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              {editMode ? (
                <>
                  <div className="mp-modal-header">
                    <h3><i className="fa fa-edit"></i> Edit Property</h3>
                    <button className="mp-modal-close" onClick={closeModal}>
                      <i className="fa fa-times"></i>
                    </button>
                  </div>
                  
                  <form className="mp-edit-form" onSubmit={handleEditSubmit}>
                    <div className="mp-form-section">
                      <label className="mp-form-label">Current Images</label>
                      <div className="mp-images-grid">
                        {form.images.length === 0 && <div className="mp-no-images">No images uploaded</div>}
                        {form.images.map((img, idx) => (
                          <div key={img + idx} className="mp-image-item">
                            <img src={getImageUrl(img)} alt={`property-${idx}`} />
                            <button 
                              type="button" 
                              className="mp-image-remove" 
                              onClick={() => handleRemoveImage(img, "existing")}
                            >
                              <i className="fa fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mp-form-section">
                      <label className="mp-form-label">Add New Images</label>
                      <input 
                        type="file" 
                        multiple 
                        ref={fileInputRef} 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="mp-file-input"
                      />
                      <div className="mp-images-grid">
                        {form.newImages.map((file, idx) => (
                          <div key={file.name + idx} className="mp-image-item">
                            <img src={URL.createObjectURL(file)} alt={`new-${idx}`} />
                            <button 
                              type="button" 
                              className="mp-image-remove" 
                              onClick={() => handleRemoveImage(file, "new")}
                            >
                              <i className="fa fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mp-form-row">
                      <div className="mp-form-group">
                        <label className="mp-form-label">Title *</label>
                        <input 
                          type="text" 
                          name="title" 
                          value={form.title} 
                          onChange={handleChange} 
                          required 
                          className="mp-form-input"
                        />
                      </div>
                    </div>

                    <div className="mp-form-row">
                      <div className="mp-form-group">
                        <label className="mp-form-label">Location *</label>
                        <input 
                          type="text" 
                          name="location" 
                          value={form.location} 
                          onChange={handleChange} 
                          required 
                          className="mp-form-input"
                        />
                      </div>
                    </div>

                    <div className="mp-form-row mp-form-row-2">
                      <div className="mp-form-group">
                        <label className="mp-form-label">Price (₵) *</label>
                        <input 
                          type="number" 
                          name="price" 
                          value={form.price} 
                          onChange={handleChange} 
                          required 
                          className="mp-form-input"
                        />
                      </div>
                      <div className="mp-form-group">
                        <label className="mp-form-label">Property Type *</label>
                        <input 
                          type="text" 
                          name="property_type" 
                          value={form.property_type} 
                          onChange={handleChange} 
                          required 
                          className="mp-form-input"
                        />
                      </div>
                    </div>

                    <div className="mp-form-row mp-form-row-3">
                      <div className="mp-form-group">
                        <label className="mp-form-label">Bedrooms</label>
                        <input 
                          type="number" 
                          name="bedrooms" 
                          value={form.bedrooms} 
                          onChange={handleChange} 
                          className="mp-form-input"
                        />
                      </div>
                      <div className="mp-form-group">
                        <label className="mp-form-label">Bathrooms</label>
                        <input 
                          type="number" 
                          name="bathrooms" 
                          value={form.bathrooms} 
                          onChange={handleChange} 
                          className="mp-form-input"
                        />
                      </div>
                      <div className="mp-form-group">
                        <label className="mp-form-label">Size (sqm)</label>
                        <input 
                          type="number" 
                          name="size" 
                          value={form.size} 
                          onChange={handleChange} 
                          className="mp-form-input"
                        />
                      </div>
                    </div>

                    <div className="mp-form-row">
                      <div className="mp-form-group">
                        <label className="mp-form-label">Description</label>
                        <textarea 
                          name="description" 
                          value={form.description} 
                          onChange={handleChange} 
                          rows={4}
                          className="mp-form-textarea"
                        />
                      </div>
                    </div>

                    <div className="mp-modal-footer">
                      <motion.button 
                        className="mp-modal-btn save"
                        type="submit" 
                        disabled={loadingAction}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <i className="fa fa-save"></i> {loadingAction ? "Saving..." : "Save Changes"}
                      </motion.button>
                      <motion.button 
                        className="mp-modal-btn cancel"
                        type="button" 
                        onClick={closeModal}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <i className="fa fa-times"></i> Cancel
                      </motion.button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="mp-modal-header">
                    <h3><i className="fa fa-trash-alt"></i> Delete Property</h3>
                    <button className="mp-modal-close" onClick={closeModal}>
                      <i className="fa fa-times"></i>
                    </button>
                  </div>
                  
                  <div className="mp-delete-content">
                    <div className="mp-delete-icon">
                      <i className="fa fa-exclamation-triangle"></i>
                    </div>
                    <p className="mp-delete-text">
                      Are you sure you want to delete <strong>"{selectedProperty.title}"</strong>?
                    </p>
                    <p className="mp-delete-warning">
                      This action cannot be undone. All data associated with this property will be permanently removed.
                    </p>
                  </div>

                  <div className="mp-modal-footer">
                    <motion.button 
                      className="mp-modal-btn delete"
                      onClick={handleDelete} 
                      disabled={loadingAction}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="fa fa-trash-alt"></i> {loadingAction ? "Deleting..." : "Yes, Delete"}
                    </motion.button>
                    <motion.button 
                      className="mp-modal-btn cancel"
                      onClick={closeModal}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="fa fa-times"></i> Cancel
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
