import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, GeoJSON, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/leaflet-property-map.css';
import { ghanaRegionsGeoJSON, ghanaBoundary } from '../data/ghanaRegionsGeoJSON';

// Fix Leaflet default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom property marker icon
const createPropertyIcon = (price, type = 'sale') => {
  const priceLabel = price ? `₵${(price / 1000).toFixed(0)}K` : '';
  return L.divIcon({
    className: 'custom-property-marker',
    html: `
      <div class="marker-container ${type}">
        <div class="marker-pin"></div>
        <div class="marker-price">${priceLabel}</div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -50],
  });
};

// Component to handle map updates
function MapController({ center, zoom, properties }) {
  const map = useMap();

  useEffect(() => {
    if (properties && properties.length > 0) {
      // Filter properties with valid coordinates
      const validProperties = properties.filter(
        p => p.latitude != null && p.longitude != null && 
             !isNaN(p.latitude) && !isNaN(p.longitude)
      );
      
      if (validProperties.length > 0) {
        // Fit bounds to show all valid properties
        const bounds = L.latLngBounds(validProperties.map(p => [p.latitude, p.longitude]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      } else if (center) {
        // No valid properties, center on default
        map.setView(center, zoom || 7);
      }
    } else if (center) {
      map.setView(center, zoom || 7);
    }
  }, [map, center, zoom, properties]);

  return null;
}

export default function LeafletPropertyMap({ 
  properties = [], 
  center = [7.9465, -1.0232], // Ghana center coordinates
  zoom = 7,
  onPropertyClick,
  selectedProperty,
  showControls = true,
  height = '600px',
  className = '',
  onRegionSelect, // Callback when a region is selected
  showRegionBoundaries = true, // Toggle for showing region boundaries
}) {
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [activeProperty, setActiveProperty] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [mapType, setMapType] = useState('streets'); // 'streets' or 'satellite'

  // Ghana region centers for quick navigation
  const ghanaRegions = {
    'Greater Accra': [5.6037, -0.1870],
    'Ashanti': [6.6885, -1.6244],
    'Western': [5.1035, -1.9545],
    'Eastern': [6.0769, -0.5766],
    'Central': [5.1954, -0.9624],
    'Volta': [6.5778, 0.4484],
    'Northern': [9.4034, -0.8424],
    'Upper East': [10.7085, -0.9821],
    'Upper West': [10.3097, -2.3109],
    'Bono': [7.5691, -2.4877],
    'Bono East': [7.7524, -1.0560],
    'Ahafo': [7.1667, -2.5333],
    'Savannah': [8.8500, -1.2000],
    'North East': [10.4834, -0.3778],
    'Western North': [6.2000, -2.7500],
    'Oti': [7.3667, 0.0500],
  };

  const handleMarkerClick = (property) => {
    setActiveProperty(property);
    if (onPropertyClick) {
      onPropertyClick(property);
    }
  };

  const navigateToRegion = (region) => {
    const coords = ghanaRegions[region];
    if (coords) {
      setMapCenter(coords);
      setMapZoom(10);
    }
  };

  const handleRegionClick = (regionName) => {
    setSelectedRegion(regionName);
    const coords = ghanaRegions[regionName];
    if (coords) {
      setMapCenter(coords);
      setMapZoom(10);
    }
    if (onRegionSelect) {
      onRegionSelect(regionName);
    }
  };

  // Style function for region boundaries
  const regionStyle = (feature) => {
    const isSelected = selectedRegion === feature.properties.name;
    return {
      fillColor: isSelected ? '#10b981' : '#3b82f6',
      fillOpacity: isSelected ? 0.3 : 0.1,
      color: '#1e40af',
      weight: isSelected ? 3 : 2,
      opacity: 0.8,
    };
  };

  // Hover style for regions
  const onEachRegion = (feature, layer) => {
    const regionName = feature.properties.name;
    
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          fillOpacity: 0.5,
          weight: 3,
          color: '#10b981',
        });
        
        // Show tooltip with region name
        layer.bindTooltip(regionName, {
          permanent: false,
          direction: 'center',
          className: 'region-tooltip'
        }).openTooltip();
      },
      mouseout: (e) => {
        const layer = e.target;
        const isSelected = selectedRegion === regionName;
        layer.setStyle({
          fillOpacity: isSelected ? 0.3 : 0.1,
          weight: isSelected ? 3 : 2,
          color: '#1e40af',
        });
        layer.closeTooltip();
      },
      click: () => {
        handleRegionClick(regionName);
      }
    });
  };

  // Style for Ghana boundary
  const boundaryStyle = {
    fillColor: 'transparent',
    color: '#1e293b',
    weight: 3,
    opacity: 1,
    fillOpacity: 0,
  };

  return (
    <div className={`leaflet-map-wrapper ${className}`}>
      {/* Map Type Toggle - Google Maps Style */}
      <div className="map-type-control">
        <button
          className={`map-type-btn ${mapType === 'streets' ? 'active' : ''}`}
          onClick={() => setMapType('streets')}
        >
          <i className="fa fa-map"></i>
          <span>Map</span>
        </button>
        <button
          className={`map-type-btn ${mapType === 'satellite' ? 'active' : ''}`}
          onClick={() => setMapType('satellite')}
        >
          <i className="fa fa-satellite"></i>
          <span>Satellite</span>
        </button>
      </div>

      {/* Quick Region Navigation */}
      {showControls && (
        <div className="map-controls">
          <div className="region-quick-nav">
            <button 
              className="region-nav-btn reset"
              onClick={() => {
                setMapCenter(center);
                setMapZoom(zoom);
              }}
            >
              <i className="fa fa-globe"></i> All Ghana
            </button>
            <select 
              className="region-selector"
              onChange={(e) => navigateToRegion(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Jump to Region...</option>
              {Object.keys(ghanaRegions).map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* Map Legend */}
          <div className="map-legend">
            <div className="legend-item">
              <div className="legend-marker sale"></div>
              <span>For Sale</span>
            </div>
            <div className="legend-item">
              <div className="legend-marker rent"></div>
              <span>For Rent</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height, width: '100%', borderRadius: '12px', zIndex: 1 }}
        scrollWheelZoom={true}
        className="property-map-container"
        zoomControl={false}
      >
        {/* Dynamic Tile Layer based on map type */}
        {mapType === 'streets' ? (
          // CartoDB Voyager - Google Maps-like, clean and professional
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />
        ) : (
          // Esri World Imagery - Satellite view
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={20}
          />
        )}
        
        {/* Add street labels overlay on satellite view */}
        {mapType === 'satellite' && (
          <TileLayer
            attribution=''
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />
        )}
        
        <MapController 
          center={mapCenter} 
          zoom={mapZoom} 
          properties={properties}
        />

        {/* Custom Zoom Control - Google Maps style */}
        <ZoomControl position="bottomright" />

        {/* Ghana Boundary */}
        {showRegionBoundaries && (
          <>
            <GeoJSON 
              data={ghanaBoundary} 
              style={boundaryStyle}
            />
            
            {/* Regional Boundaries */}
            <GeoJSON 
              data={ghanaRegionsGeoJSON}
              style={regionStyle}
              onEachFeature={onEachRegion}
            />
          </>
        )}

        {/* Property Markers */}
        {properties.map((property) => {
          if (!property.latitude || !property.longitude) return null;
          
          const isSelected = selectedProperty?.id === property.id;
          
          return (
            <Marker
              key={property.id}
              position={[property.latitude, property.longitude]}
              icon={createPropertyIcon(property.price, property.listing_type)}
              eventHandlers={{
                click: () => handleMarkerClick(property),
              }}
            >
              <Popup className="property-popup" minWidth={280}>
                <div className="popup-content">
                  {property.images && property.images.length > 0 && (
                    <div className="popup-image">
                      <img 
                        src={property.images[0].image_url} 
                        alt={property.title}
                        onError={(e) => {
                          e.target.src = '/img/placeholder.jpg';
                        }}
                      />
                      {property.listing_type && (
                        <span className={`listing-badge ${property.listing_type}`}>
                          {property.listing_type}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="popup-details">
                    <h4 className="popup-title">{property.title}</h4>
                    <p className="popup-location">
                      <i className="fa fa-map-marker-alt"></i>
                      {property.location || property.city}
                    </p>
                    
                    <div className="popup-price">
                      ₵{property.price?.toLocaleString()}
                    </div>
                    
                    <div className="popup-features">
                      {property.bedrooms && (
                        <span>
                          <i className="fa fa-bed"></i> {property.bedrooms}
                        </span>
                      )}
                      {property.bathrooms && (
                        <span>
                          <i className="fa fa-bath"></i> {property.bathrooms}
                        </span>
                      )}
                      {property.square_feet && (
                        <span>
                          <i className="fa fa-expand-arrows-alt"></i> {property.square_feet} sqft
                        </span>
                      )}
                    </div>

                    <button 
                      className="popup-view-btn"
                      onClick={() => {
                        if (property.id) {
                          window.location.href = `/properties/${property.id}`;
                        }
                      }}
                    >
                      View Details
                      <i className="fa fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Show circle around selected property */}
        {selectedProperty && selectedProperty.latitude && selectedProperty.longitude && (
          <Circle
            center={[selectedProperty.latitude, selectedProperty.longitude]}
            radius={500}
            pathOptions={{
              color: '#10b981',
              fillColor: '#10b981',
              fillOpacity: 0.1,
              weight: 2,
            }}
          />
        )}
      </MapContainer>

      {/* Selected Region Indicator */}
      {selectedRegion && (
        <div className="map-selected-region-label">
          <i className="fa fa-map-marked-alt region-icon"></i>
          <span>{selectedRegion} Region</span>
          <button 
            className="clear-selection"
            onClick={() => {
              setSelectedRegion(null);
              setMapCenter(center);
              setMapZoom(zoom);
              if (onRegionSelect) {
                onRegionSelect(null);
              }
            }}
            title="Clear selection"
          >
            ×
          </button>
        </div>
      )}

      {/* Property Count Badge */}
      {properties.length > 0 && (
        <div className="map-stats-badge">
          <i className="fa fa-home"></i>
          <strong>{properties.length}</strong> {properties.length === 1 ? 'Property' : 'Properties'}
        </div>
      )}
    </div>
  );
}
