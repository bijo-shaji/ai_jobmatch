export const getBackendUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "https://ai-jobmatch-aval.onrender.com";
  }
  return "http://127.0.0.1:8000";
};

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Blob or Data URLs (local file selection preview)
  if (imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  const backendUrl = getBackendUrl();

  // If already absolute HTTP / HTTPS URL
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    // If backend returned localhost/127.0.0.1 URL but app is deployed on Render:
    if (
      typeof window !== "undefined" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1" &&
      (imageUrl.includes("127.0.0.1") || imageUrl.includes("localhost"))
    ) {
      const path = imageUrl.replace(/^https?:\/\/[^\/]+/, "");
      return `${backendUrl.replace(/\/$/, "")}${path}`;
    }

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
  const cleanBackendUrl = backendUrl.replace(/\/$/, "");
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
