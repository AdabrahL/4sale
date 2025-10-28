import { useEffect, useState, useRef, useMemo } from "react";
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
  const [statusFilter, setStatusFilter] = useState("all"); // all, approved, pending, rejected
  const [sortBy, setSortBy] = useState("newest"); // newest, price_asc, price_desc
  const fileInputRef = useRef();

  // Debounce search input
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
      // support both paginated formats
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
      // Optimistic remove
      setProperties(prev => prev.filter(p => p.id !== selectedProperty.id));
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to delete property.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Helper: readable status
  const statusInfo = (p) => {
    if (p.is_approved) return { label: "Approved", color: "approved" };
    if (p.rejection_reason) return { label: "Rejected", color: "rejected" };
    return { label: "Pending", color: "pending" };
  };

  // Pagination actions
  const goToPage = (p) => {
    const page = Math.max(1, Math.min(meta.last_page || 1, p));
    setMeta(prev => ({ ...prev, current_page: page }));
    fetchProperties(page);
  };

  const skeletons = useMemo(() => new Array(6).fill(0), []);

  return (
    <div className="my-properties-container advanced">
      <div className="mp-header">
        <h1>My Properties</h1>
        <div className="mp-controls">
          <input
            className="mp-search"
            placeholder="Search by title or location..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="mp-filter">
            <option value="all">All statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="mp-filter">
            <option value="newest">Newest</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mp-grid">
          {skeletons.map((_, idx) => (
            <div key={idx} className="mp-card mp-skeleton">
              <div className="mp-image" />
              <div className="mp-content">
                <div className="s-line s-title" />
                <div className="s-line s-sub" />
                <div className="s-line s-row" />
                <div className="s-line s-row short" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="mp-empty">You haven’t created any properties yet. <button className="mp-btn" onClick={() => window.location.href = "/properties/create"}>Create Listing</button></div>
      ) : (
        <>
          <div className="mp-grid">
            {properties.map(property => {
              let images = [];
              try {
                images = property.images ? (Array.isArray(property.images) ? property.images : JSON.parse(property.images)) : [];
              } catch { images = []; }
              const stat = statusInfo(property);
              return (
                <article key={property.id} className="mp-card">
                  <div className="mp-image">
                    {images.length > 0 ? (
                      <img src={getImageUrl(images[0])} alt={property.title} className="mp-img-main" />
                    ) : (
                      <div className="mp-no-image">No Image</div>
                    )}
                    <span className={`mp-badge ${stat.color}`}>{stat.label}</span>
                  </div>

                  <div className="mp-content">
                    <div className="mp-toprow">
                      <h2 className="mp-card-title">{property.title}</h2>
                      <div className="mp-meta">
                        <div className="mp-price">₵{Number(property.price).toLocaleString()}</div>
                        <div className="mp-type">{property.property_type}</div>
                      </div>
                    </div>

                    <p className="mp-location">{property.location}</p>

                    <div className="mp-details">
                      <div>{property.bedrooms ? `${property.bedrooms} Beds` : "-"}</div>
                      <div>{property.bathrooms ? `${property.bathrooms} Baths` : "-"}</div>
                      <div>{property.size ? `${property.size} sqm` : "-"}</div>
                    </div>

                    <div className="mp-actions">
                      <button className="mp-btn mp-view" onClick={() => window.location.href = `/properties/${property.id}`}>View</button>

                      <button className="mp-btn mp-edit" onClick={() => openModal(property, true)}>Edit</button>

                      <button className="mp-btn mp-delete" onClick={() => openModal(property, false)}>Delete</button>

                      {/* If rejected, show reason / resubmit */}
                      {property.rejection_reason && (
                        <button className="mp-btn mp-reason" onClick={() => alert(`Rejection reason:\n\n${property.rejection_reason}`)}>
                          View Reason
                        </button>
                      )}

                      {/* If pending, allow "Resubmit" to re-open edit */}
                      {!property.is_approved && !property.rejection_reason && (
                        <button className="mp-btn mp-resubmit" onClick={() => openModal(property, true)}>Resubmit</button>
                      )}
                    </div>

                    <div className="mp-footer">
                      <small className="mp-updated">Updated: {new Date(property.updated_at).toLocaleString()}</small>
                      <small className="mp-views">{property.views || 0} views</small>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="mp-pagination">
            <button className="mp-page" onClick={() => goToPage(meta.current_page - 1)} disabled={meta.current_page <= 1}>Prev</button>
            <div className="mp-page-info">Page {meta.current_page} of {meta.last_page} • {meta.total} listings</div>
            <button className="mp-page" onClick={() => goToPage(meta.current_page + 1)} disabled={meta.current_page >= meta.last_page}>Next</button>
          </div>
        </>
      )}

      {/* Popup Modal */}
      {showModal && selectedProperty && (
        <div className="mp-modal-overlay" onClick={closeModal}>
          <div className="mp-modal mp-modal-scroll" onClick={e => e.stopPropagation()}>
            {editMode ? (
              <>
                <h3 className="mp-modal-title">Edit Property</h3>
                <form className="mp-edit-form" onSubmit={handleEditSubmit} encType="multipart/form-data">
                  <label>Current Images</label>
                  <div className="mp-edit-images">
                    {form.images.length === 0 && <div className="mp-no-image">No Image</div>}
                    {form.images.map((img, idx) => (
                      <div key={img + idx} className="mp-img-wrap">
                        <img src={getImageUrl(img)} alt={`property-img-${idx}`} className="mp-img-preview" />
                        <button type="button" className="mp-btn mp-delete mp-img-remove" onClick={() => handleRemoveImage(img, "existing")}>✕</button>
                      </div>
                    ))}
                  </div>

                  <label>Add Images</label>
                  <input type="file" multiple ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
                  <div className="mp-edit-images">
                    {form.newImages.map((file, idx) => (
                      <div key={file.name + idx} className="mp-img-wrap">
                        <img src={URL.createObjectURL(file)} alt={`new-img-${idx}`} className="mp-img-preview" />
                        <button type="button" className="mp-btn mp-delete mp-img-remove" onClick={() => handleRemoveImage(file, "new")}>✕</button>
                      </div>
                    ))}
                  </div>

                  <label>Title<input type="text" name="title" value={form.title} onChange={handleChange} required /></label>
                  <label>Location<input type="text" name="location" value={form.location} onChange={handleChange} required /></label>

                  <div className="mp-grid-2">
                    <label>Price<input type="number" name="price" value={form.price} onChange={handleChange} required /></label>
                    <label>Type<input type="text" name="property_type" value={form.property_type} onChange={handleChange} required /></label>
                  </div>

                  <div className="mp-grid-2">
                    <label>Bedrooms<input type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} /></label>
                    <label>Bathrooms<input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} /></label>
                  </div>

                  <label>Size (sqm)<input type="number" name="size" value={form.size} onChange={handleChange} /></label>
                  <label>Description<textarea name="description" value={form.description} onChange={handleChange} rows={4} /></label>

                  <div className="mp-modal-btns">
                    <button className="mp-btn mp-edit" type="submit" disabled={loadingAction}>{loadingAction ? "Saving..." : "Save changes"}</button>
                    <button className="mp-btn" type="button" onClick={closeModal}>Cancel</button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 className="mp-modal-title">Delete Property</h3>
                <p>Are you sure you want to delete <strong>{selectedProperty.title}</strong>?</p>
                <div className="mp-modal-btns">
                  <button className="mp-btn mp-delete" onClick={handleDelete} disabled={loadingAction}>{loadingAction ? "Deleting..." : "Yes, delete"}</button>
                  <button className="mp-btn" onClick={closeModal}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}