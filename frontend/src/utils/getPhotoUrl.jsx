const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";

// Utility for consistent profile/avatar image URLs
export function getPhotoUrl(photo) {
  if (!photo) return "/default-avatar.png";
  if (photo.startsWith("http")) return photo;
  // Remove leading slash if present
  const normalizedPhoto = photo.startsWith("/") ? photo.slice(1) : photo;
  return `${backendUrl}/storage/${normalizedPhoto}`;
}