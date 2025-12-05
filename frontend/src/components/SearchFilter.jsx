import React, { useState } from "react";

export default function SearchFilter({
  filters,
  onChange,
  onSearch,
  showStatus = true
}) {
  const [activeTab, setActiveTab] = useState(filters.status || "for_rent");

  const handleTabChange = (status) => {
    setActiveTab(status);
    onChange({ target: { name: "status", value: status } });
  };

  return (
    <div className="search-form-wrapper">
      {/* Tabs */}
      <ul className="search-tabs">
        <li className={activeTab === "for_rent" ? "active" : ""}>
          <button type="button" onClick={() => handleTabChange("for_rent")}>
            For Rent
          </button>
        </li>
        <li className={activeTab === "for_sale" ? "active" : ""}>
          <button type="button" onClick={() => handleTabChange("for_sale")}>
            For Sale
          </button>
        </li>
        <li className={activeTab === "short_lease" ? "active" : ""}>
          <button type="button" onClick={() => handleTabChange("short_lease")}>
            Short Lease
          </button>
        </li>
        <li className={activeTab === "land" ? "active" : ""}>
          <button type="button" onClick={() => handleTabChange("land")}>
            Land
          </button>
        </li>
      </ul>

      {/* Search Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          if (onSearch) onSearch();
        }}
        className="search-form-content"
      >
        <div className="search-form-fields">
          <div className="search-field search-field-type">
            <select
              name="property_type"
              value={filters.property_type || ""}
              onChange={onChange}
              className="search-select"
            >
              <option value="">Property Type</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          <div className="search-field search-field-location">
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={onChange}
              placeholder="Location"
              className="search-input"
            />
          </div>

          <div className="search-field search-field-price">
            <div className="price-input-group">
              <span className="price-currency">₵</span>
              <input
                type="number"
                name="minPrice"
                placeholder="Min. Price"
                value={filters.minPrice}
                onChange={onChange}
                className="search-input-price"
              />
            </div>
          </div>

          <div className="search-field search-field-price">
            <div className="price-input-group">
              <span className="price-currency">₵</span>
              <input
                type="number"
                name="maxPrice"
                placeholder="Max. Price"
                value={filters.maxPrice}
                onChange={onChange}
                className="search-input-price"
              />
            </div>
          </div>

          <div className="search-field search-field-btn">
            <button type="submit" className="search-submit-btn" title="Search">
              <i className="fa fa-search"></i>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}