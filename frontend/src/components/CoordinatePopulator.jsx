import { useState } from 'react';
import API from '../api/axios';
import { GHANA_CITIES } from '../data/ghanaLocations';

/**
 * Admin utility component to populate coordinates for existing properties
 * This should be added temporarily to an admin page to backfill coordinates
 */
export default function CoordinatePopulator() {
  const [status, setStatus] = useState('');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState({ updated: 0, failed: 0, total: 0 });

  const populateCoordinates = async () => {
    setProcessing(true);
    setStatus('Fetching properties...');
    
    try {
      // Fetch all properties
      const response = await API.get('/properties');
      const properties = response.data.data || [];
      
      setResults(prev => ({ ...prev, total: properties.length }));
      setStatus(`Found ${properties.length} properties. Updating coordinates...`);

      let updated = 0;
      let failed = 0;

      // Update each property with coordinates based on its location
      for (const property of properties) {
        // Skip if already has coordinates
        if (property.latitude && property.longitude) {
          continue;
        }

        const location = property.location || property.city;
        if (!location) {
          failed++;
          continue;
        }

        // Try to find matching city
        const cityData = GHANA_CITIES[location];
        if (cityData && cityData.coordinates) {
          try {
            await API.put(`/properties/${property.id}`, {
              ...property,
              latitude: cityData.coordinates[0],
              longitude: cityData.coordinates[1],
              city: cityData.name,
              region: cityData.region,
            });
            updated++;
            setResults({ updated, failed, total: properties.length });
            setStatus(`Updated ${updated}/${properties.length} properties...`);
          } catch (error) {
            console.error(`Failed to update property ${property.id}:`, error);
            failed++;
          }
        } else {
          // Try fuzzy matching
          const matchedCity = Object.keys(GHANA_CITIES).find(key => 
            key.toLowerCase().includes(location.toLowerCase()) ||
            location.toLowerCase().includes(key.toLowerCase())
          );

          if (matchedCity) {
            const cityData = GHANA_CITIES[matchedCity];
            try {
              await API.put(`/properties/${property.id}`, {
                ...property,
                latitude: cityData.coordinates[0],
                longitude: cityData.coordinates[1],
                city: cityData.name,
                region: cityData.region,
              });
              updated++;
              setResults({ updated, failed, total: properties.length });
              setStatus(`Updated ${updated}/${properties.length} properties...`);
            } catch (error) {
              console.error(`Failed to update property ${property.id}:`, error);
              failed++;
            }
          } else {
            failed++;
          }
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setResults({ updated, failed, total: properties.length });
      setStatus(`Complete! Updated: ${updated}, Failed: ${failed}, Total: ${properties.length}`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{
      padding: '2rem',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      maxWidth: '600px',
      margin: '2rem auto'
    }}>
      <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>
        🗺️ Coordinate Populator
      </h3>
      <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
        This utility will automatically populate latitude and longitude for properties based on their location.
      </p>

      {!processing ? (
        <button
          onClick={populateCoordinates}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Start Populating Coordinates
        </button>
      ) : (
        <div style={{
          background: '#f1f5f9',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>
            Processing...
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {status}
          </div>
        </div>
      )}

      {results.total > 0 && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <h4 style={{ margin: '0 0 0.75rem 0', color: '#166534' }}>Results</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                {results.total}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Updated</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                {results.updated}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Failed</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
                {results.failed}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
