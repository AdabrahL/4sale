import { useState } from "react";
import { motion } from "framer-motion";

// Ghana Regions with Major Cities/Towns
const GHANA_LOCATIONS = {
  "Greater Accra": [
    "Accra", "Tema", "Madina", "Adenta", "Kasoa", "Dome", "Achimota", 
    "Teshie", "Nungua", "La", "Osu", "Cantonments", "East Legon", 
    "Airport Residential", "Dansoman", "Spintex", "Sakumono", "Ashaiman"
  ],
  "Ashanti": [
    "Kumasi", "Obuasi", "Mampong", "Konongo", "Ejisu", "Bekwai", 
    "Tafo", "Asokwa", "Bantama", "Nhyiaeso", "Adum", "Ayeduase", "Kotei"
  ],
  "Western": [
    "Sekondi-Takoradi", "Tarkwa", "Prestea", "Axim", "Elubo", 
    "Bogoso", "Shama", "Effia", "Kojokrom", "Takoradi"
  ],
  "Western North": [
    "Sefwi Wiawso", "Bibiani", "Juaboso", "Bodi", "Aowin"
  ],
  "Eastern": [
    "Koforidua", "Akosombo", "Akim Oda", "Mpraeso", "Nsawam", 
    "Akropong", "Somanya", "Aburi", "Suhum", "Begoro"
  ],
  "Central": [
    "Cape Coast", "Winneba", "Swedru", "Kasoa", "Mumford", 
    "Saltpond", "Agona Swedru", "Apam", "Mankessim"
  ],
  "Volta": [
    "Ho", "Hohoe", "Keta", "Aflao", "Sogakope", "Kpando", 
    "Akatsi", "Anloga", "Dzodze", "Denu"
  ],
  "Oti": [
    "Dambai", "Kete Krachi", "Nkwanta", "Jasikan", "Kadjebi"
  ],
  "Northern": [
    "Tamale", "Yendi", "Savelugu", "Tolon", "Gushegu", 
    "Karaga", "Kumbungu", "Sagnarigu"
  ],
  "Savannah": [
    "Damongo", "Salaga", "Bole", "Sawla", "Yapei"
  ],
  "North East": [
    "Nalerigu", "Walewale", "Gambaga", "Bunkpurugu"
  ],
  "Upper East": [
    "Bolgatanga", "Bawku", "Navrongo", "Paga", "Zebilla", 
    "Garu", "Tempane", "Bongo"
  ],
  "Upper West": [
    "Wa", "Tumu", "Lawra", "Jirapa", "Funsi", "Nadowli"
  ],
  "Bono": [
    "Sunyani", "Berekum", "Wenchi", "Techiman", "Dormaa Ahenkro", 
    "Kintampo", "Nsawkaw", "Duayaw Nkwanta"
  ],
  "Bono East": [
    "Techiman", "Atebubu", "Kintampo", "Nkoranza", "Yeji", "Prang"
  ],
  "Ahafo": [
    "Goaso", "Bechem", "Hwidiem", "Kukuom", "Mim", "Sankore"
  ]
};

export default function GhanaMap({ selectedRegion, onRegionClick, regionCounts = {} }) {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [selectedRegionName, setSelectedRegionName] = useState(null);
  const regions = Object.keys(GHANA_LOCATIONS);

  const handleRegionClick = (regionName) => {
    setSelectedRegionName(regionName);
    const cities = GHANA_LOCATIONS[regionName];
    onRegionClick(regionName.toLowerCase().replace(/\s+/g, '-'), regionName, cities);
  };

  const handleCityClick = (city, region) => {
    onRegionClick(city.toLowerCase().replace(/\s+/g, '-'), city, [city]);
  };

  return (
    <div className="ghana-map-container">
      <div className="map-header">
        <h3>📍 Select Location</h3>
        <p className="map-subtitle">Choose a region to see cities, or click a specific city</p>
      </div>
      
      {/* Regions Grid */}
      <div className="regions-grid">
        {regions.map((region) => {
          const count = regionCounts[region] || 0;
          const isSelected = selectedRegionName === region;
          const isHovered = hoveredRegion === region;
          
          return (
            <motion.div
              key={region}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`region-card ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
              onClick={() => handleRegionClick(region)}
              onMouseEnter={() => setHoveredRegion(region)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <div className="region-icon">
                <i className="fa fa-map-marker"></i>
              </div>
              <div className="region-info">
                <h4 className="region-name">{region}</h4>
                {count > 0 && (
                  <span className="region-count">
                    {count} {count === 1 ? 'property' : 'properties'}
                  </span>
                )}
              </div>
              <div className="region-arrow">
                <i className="fa fa-chevron-right"></i>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Cities/Towns List - Shows when a region is selected */}
      {selectedRegionName && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="cities-section"
        >
          <div className="cities-header">
            <h4>
              <i className="fa fa-building"></i> Cities & Towns in {selectedRegionName}
            </h4>
            <button 
              className="clear-region-btn"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRegionName(null);
              }}
            >
              <i className="fa fa-times"></i> Clear
            </button>
          </div>
          
          <div className="cities-grid">
            {GHANA_LOCATIONS[selectedRegionName].map((city) => {
              const cityCount = regionCounts[city] || 0;
              
              return (
                <motion.button
                  key={city}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="city-chip"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCityClick(city, selectedRegionName);
                  }}
                >
                  <span className="city-name">{city}</span>
                  {cityCount > 0 && (
                    <span className="city-count-badge">{cityCount}</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="map-stats">
        <div className="stat-box">
          <div className="stat-number">{regions.length}</div>
          <div className="stat-label">Regions</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">
            {Object.values(GHANA_LOCATIONS).reduce((sum, cities) => sum + cities.length, 0)}
          </div>
          <div className="stat-label">Cities & Towns</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">
            {Object.values(regionCounts).reduce((sum, count) => sum + count, 0)}
          </div>
          <div className="stat-label">Total Properties</div>
        </div>
      </div>
    </div>
  );
}

// Export locations for use in CreateProperty
export { GHANA_LOCATIONS };
