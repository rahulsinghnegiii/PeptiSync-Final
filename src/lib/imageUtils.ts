/**
 * Generate a tiny blur placeholder data URL for an image
 * This is a simplified version - in production, you'd generate these server-side
 */
export const generateBlurDataURL = (color: string = "#1a1a2e"): string => {
  // Create a 10x10 SVG with the specified color
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
      <rect width="10" height="10" fill="${color}"/>
    </svg>
  `;
  
  // Convert to base64
  const base64 = btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
};

/**
 * Get optimized image URL with format and size parameters
 * Adjust this based on your CDN/storage provider capabilities
 */
export const getOptimizedImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    format?: "webp" | "jpeg" | "png";
    quality?: number;
  } = {}
): string => {
  // If it's a placeholder or doesn't need optimization, return as-is
  if (!url || url.includes("placeholder.svg")) {
    return url;
  }

  // For Supabase storage, you might add transformation parameters
  // This is a placeholder - adjust based on your actual storage setup
  const { width, height, format = "webp", quality = 80 } = options;
  
  // If using a CDN like Cloudinary, Imgix, or similar:
  // return `${url}?w=${width}&h=${height}&fm=${format}&q=${quality}`;
  
  // For now, return the original URL
  // In production, implement actual image transformation
  return url;
};

/**
 * Generate responsive srcset for different screen sizes
 */
export const generateSrcSet = (
  url: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920]
): string => {
  if (!url || url.includes("placeholder.svg")) {
    return "";
  }

  return widths
    .map((width) => {
      const optimizedUrl = getOptimizedImageUrl(url, { width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(", ");
};

/**
 * Get image dimensions from URL or return defaults
 */
export const getImageDimensions = (
  url: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Preload critical images
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Check if WebP is supported
 */
export const isWebPSupported = (): boolean => {
  if (typeof window === "undefined") return false;
  
  const canvas = document.createElement("canvas");
  if (canvas.getContext && canvas.getContext("2d")) {
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  }
  return false;
};
