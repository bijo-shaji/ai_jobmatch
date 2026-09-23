const BACKEND_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Blob or Data URLs (local file selection preview)
  if (imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  // If already absolute HTTP / HTTPS URL
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      imageUrl.startsWith("http://")
    ) {
      return imageUrl.replace("http://", "https://");
    }
    return imageUrl;
  }

  // Relative path, prepend backend base URL
  const cleanBackendUrl = BACKEND_URL.replace(/\/$/, "");
  const cleanImagePath = imageUrl.startsWith("/")
    ? imageUrl
    : `/${imageUrl}`;

  let fullUrl = `${cleanBackendUrl}${cleanImagePath}`;

  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    fullUrl.startsWith("http://")
  ) {
    fullUrl = fullUrl.replace("http://", "https://");
  }

  return fullUrl;
};
