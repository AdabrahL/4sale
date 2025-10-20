const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";

export function getPhotoUrl(photo) {
  if (!photo) return "/default-avatar.png";
  return photo.startsWith("http") ? photo : `${backendUrl}/storage/${photo}`;
}