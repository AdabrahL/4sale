import { useState } from 'react';
import '../styles/interactive-map.css';

const GHANA_LOCATIONS = [
  { id: 1, name: 'East Legon', x: 55, y: 45, avgPrice: 580000, growth: 25, listings: 45, temp: 'hot' },
  { id: 2, name: 'Airport Residential', x: 50, y: 50, avgPrice: 520000, growth: 18, listings: 32, temp: 'hot' },
  { id: 3, name: 'Cantonments', x: 48, y: 48, avgPrice: 480000, growth: 15, listings: 28, temp: 'warm' },
  { id: 4, name: 'Osu', x: 45, y: 52, avgPrice: 420000, growth: 12, listings: 38, temp: 'warm' },
  { id: 5, name: 'Labone', x: 46, y: 49, avgPrice: 390000, growth: 10, listings: 25, temp: 'warm' },
  { id: 6, name: 'Tema', x: 65, y: 55, avgPrice: 280000, growth: 8, listings: 42, temp: 'cool' },
  { id: 7, name: 'Spintex', x: 58, y: 52, avgPrice: 320000, growth: 14, listings: 35, temp: 'warm' },
  { id: 8, name: 'Madina', x: 52, y: 42, avgPrice: 250000, growth: 6, listings: 30, temp: 'cool' },
  { id: 9, name: 'Achimota', x: 40, y: 45, avgPrice: 300000, growth: 9, listings: 22, temp: 'cool' },
  { id: 10, name: 'Haatso', x: 48, y: 40, avgPrice: 270000, growth: 7, listings: 18, temp: 'cool' },
];

export default function InteractiveMapInsight({ onLocationClick }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    if (onLocationClick) onLocationClick(location);
  };

  const getTempColor = (temp) => {
    switch(temp) {
      case 'hot': return '#ef4444';
      case 'warm': return '#f59e0b';
      case 'cool': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getTempSize = (temp) => {
    switch(temp) {
      case 'hot': return 24;
      case 'warm': return 20;
      case 'cool': return 16;
      default: return 16;
    }
  };

  return (
    <div className="interactive-map-container">
      <div className="interactive-map-header">
        <h3>
          <i className="fa fa-map-marked-alt"></i>
          Explore Market by Location
        </h3>
        <p>Click any area to see detailed market insights</p>
      </div>

      <div className="interactive-map-canvas">
        <svg viewBox="0 0 100 100" className="map-svg">
          {/* Background gradient */}
          <defs>
            <radialGradient id="mapGradient">
              <stop offset="0%" stopColor="#f0fdf4" />
              <stop offset="100%" stopColor="#dcfce7" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <rect width="100" height="100" fill="url(#mapGradient)" />
          
          {/* Grid lines */}
          {[0, 20, 40, 60, 80, 100].map(val => (
            <g key={`grid-${val}`}>
              <line x1={val} y1="0" x2={val} y2="100" stroke="#e5e7eb" strokeWidth="0.2" opacity="0.5" />
              <line x1="0" y1={val} x2="100" y2={val} stroke="#e5e7eb" strokeWidth="0.2" opacity="0.5" />
            </g>
          ))}

          {/* Location markers */}
          {GHANA_LOCATIONS.map(location => {
            const isSelected = selectedLocation?.id === location.id;
            const isHovered = hoveredLocation?.id === location.id;
            const size = getTempSize(location.temp);
            const pulseSize = size + (isHovered ? 8 : 4);

            return (
              <g
                key={location.id}
                className={`map-location ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredLocation(location)}
                onMouseLeave={() => setHoveredLocation(null)}
                onClick={() => handleLocationClick(location)}
              >
                {/* Pulse ring */}
                <circle
                  cx={location.x}
                  cy={location.y}
                  r={pulseSize / 2}
                  fill={getTempColor(location.temp)}
                  opacity="0.2"
                  className="pulse-ring"
                />
                
                {/* Main marker */}
                <circle
                  cx={location.x}
                  cy={location.y}
                  r={size / 2}
                  fill={getTempColor(location.temp)}
                  stroke="white"
                  strokeWidth="2"
                  filter={isHovered || isSelected ? 'url(#glow)' : ''}
                  className="location-marker"
                />
                
                {/* Label */}
                {(isHovered || isSelected) && (
                  <text
                    x={location.x}
                    y={location.y - size / 2 - 3}
                    textAnchor="middle"
                    className="location-label"
                    fill="#1e293b"
                    fontSize="3"
                    fontWeight="600"
                  >
                    {location.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredLocation && (
          <div 
            className="map-tooltip"
            style={{
              left: `${hoveredLocation.x}%`,
              top: `${hoveredLocation.y}%`,
            }}
          >
            <div className="tooltip-header">
              <strong>{hoveredLocation.name}</strong>
              <span className={`tooltip-temp ${hoveredLocation.temp}`}>
                {hoveredLocation.temp === 'hot' ? '🔥' : hoveredLocation.temp === 'warm' ? '☀️' : '❄️'}
                {hoveredLocation.temp.toUpperCase()}
              </span>
            </div>
            <div className="tooltip-stats">
              <div className="tooltip-stat">
                <span>Avg Price:</span>
                <strong>₵{(hoveredLocation.avgPrice / 1000).toFixed(0)}K</strong>
              </div>
              <div className="tooltip-stat">
                <span>Growth:</span>
                <strong className="positive">+{hoveredLocation.growth}%</strong>
              </div>
              <div className="tooltip-stat">
                <span>Listings:</span>
                <strong>{hoveredLocation.listings}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-marker hot"></div>
          <span>Hot Market (15%+ growth)</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker warm"></div>
          <span>Warm Market (8-15% growth)</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker cool"></div>
          <span>Cool Market (&lt;8% growth)</span>
        </div>
      </div>

      {/* Selected location details */}
      {selectedLocation && (
        <div className="selected-location-card">
          <div className="selected-header">
            <h4>{selectedLocation.name}</h4>
            <button onClick={() => setSelectedLocation(null)} className="close-btn">
              <i className="fa fa-times"></i>
            </button>
          </div>
          <div className="selected-stats-grid">
            <div className="selected-stat">
              <i className="fa fa-dollar-sign"></i>
              <div>
                <span>Average Price</span>
                <strong>₵{selectedLocation.avgPrice.toLocaleString()}</strong>
              </div>
            </div>
            <div className="selected-stat">
              <i className="fa fa-chart-line"></i>
              <div>
                <span>YoY Growth</span>
                <strong className="positive">+{selectedLocation.growth}%</strong>
              </div>
            </div>
            <div className="selected-stat">
              <i className="fa fa-home"></i>
              <div>
                <span>Active Listings</span>
                <strong>{selectedLocation.listings}</strong>
              </div>
            </div>
            <div className="selected-stat">
              <i className="fa fa-temperature-high"></i>
              <div>
                <span>Market Status</span>
                <strong className={selectedLocation.temp}>{selectedLocation.temp.toUpperCase()}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
