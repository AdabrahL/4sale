import { useState, useEffect } from 'react';

const STORAGE_KEY = 'recentlyViewedProperties';
const MAX_RECENT = 10;

export function useRecentlyViewed() {
  const [recentProperties, setRecentProperties] = useState([]);

  // Load recently viewed from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentProperties(parsed);
      } catch (e) {
        console.error('Error parsing recently viewed:', e);
        setRecentProperties([]);
      }
    }
  }, []);

  // Add a property to recently viewed
  const addToRecentlyViewed = (property) => {
    if (!property || !property.id) return;

    const newRecent = [
      {
        id: property.id,
        title: property.title,
        price: property.price,
        location: property.location || property.city,
        images: property.images,
        listing_type: property.listing_type,
        property_type: property.property_type,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        viewedAt: new Date().toISOString(),
      },
      ...recentProperties.filter((p) => p.id !== property.id),
    ].slice(0, MAX_RECENT);

    setRecentProperties(newRecent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecent));
  };

  // Clear all recently viewed
  const clearRecentlyViewed = () => {
    setRecentProperties([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Remove single property from recently viewed
  const removeFromRecentlyViewed = (propertyId) => {
    const filtered = recentProperties.filter((p) => p.id !== propertyId);
    setRecentProperties(filtered);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  };

  return {
    recentProperties,
    addToRecentlyViewed,
    clearRecentlyViewed,
    removeFromRecentlyViewed,
  };
}
