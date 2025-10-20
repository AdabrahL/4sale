import React from "react";

// Pass these as props for reusability!
const categories = {
  Residential: ["House", "Apartment", "Townhouse"],
  Commercial: ["Office", "Shop", "Warehouse"],
  Land: ["Plot", "Farm", "Mixed Use"],
  Others: ["Industrial", "Short Let", "Estate"]
};

export default function SearchFilter({
  filters,
  onChange,
  onSearch,
  showStatus = true
}) {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSearch();
      }}
      className="hero-search hero-search--inline"
    >
      <div className="form-field">
        <i className="fa fa-map-marker"></i>
        <input
          type="text"
          name="location"
          value={filters.location}
          onChange={onChange}
          placeholder="Location"
        />
      </div>
      <div className="form-field">
        <i className="fa fa-list-alt"></i>
        <select
          name="category"
          value={filters.category}
          onChange={onChange}
        >
          <option value="">Category</option>
          {Object.keys(categories).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <i className="fa fa-building"></i>
        <select
          name="type"
          value={filters.type}
          onChange={onChange}
          disabled={!filters.category}
        >
          <option value="">Type</option>
          {filters.category &&
            categories[filters.category].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
        </select>
      </div>
      {showStatus && (
        <div className="form-field">
          <i className="fa fa-info-circle"></i>
          <select
            name="status"
            value={filters.status}
            onChange={onChange}
          >
            <option value="">Status</option>
            <option value="for_sale">For Sale</option>
            <option value="for_rent">For Rent</option>
            <option value="lease">Lease</option>
          </select>
        </div>
      )}
      <div className="form-field">
        <i className="fa fa-money"></i>
        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={onChange}
        />
      </div>
      <div className="form-field">
        <i className="fa fa-money"></i>
        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={onChange}
        />
      </div>
      <button type="submit" className="hero-btn hero-btn--search">
        <i className="fa fa-search"></i> Search
      </button>
    </form>
  );
}