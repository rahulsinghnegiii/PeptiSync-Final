import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  getOptimizedImageUrl,
  generateSrcSet as generateResponsiveSrcSet,
  generateBlurDataURL,
  isWebPSupported,
} from "@/lib/imageUtils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  blurDataURL?: string;
  sizes?: string;
}

export const OptimizedImage = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  blurDataURL,
  sizes = "100vw",
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [supportsWebP, setSupportsWebP] = useState(true);
  const imgRef = useRef<HTMLDivElement>(null);

  // Check WebP support
  useEffect(() => {
    setSupportsWebP(isWebPSupported());
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "100px", // Start loading 100px before entering viewport
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // Generate optimized URLs
  const webpUrl = supportsWebP
    ? getOptimizedImageUrl(src, { format: "webp", width, height })
    : src;
  const fallbackUrl = getOptimizedImageUrl(src, {
    format: "jpeg",
    width,
    height,
  });

  // Generate responsive srcsets
  const webpSrcSet = supportsWebP ? generateResponsiveSrcSet(src) : undefined;
  const fallbackSrcSet = generateResponsiveSrcSet(src);

  // Generate blur placeholder if not provided
  const blurPlaceholder = blurDataURL || generateBlurDataURL();

  return (
    <div
      ref={imgRef}
      className={cn("relative overflow-hidden bg-muted/10", className)}
      style={width && height ? { width, height } : undefined}
    >
      {/* Blur placeholder - always show until loaded */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-muted/20 animate-pulse"
          style={{
            backgroundImage: `url(${blurPlaceholder})`,
            backgroundSize: "cover",
            filter: "blur(20px)",
            transform: "scale(1.1)",
          }}
        />
      )}

      {/* Main image with WebP support and responsive srcset */}
      {isInView && (
        <picture>
          {supportsWebP && webpSrcSet && (
            <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
          )}
          {fallbackSrcSet && (
            <source type="image/jpeg" srcSet={fallbackSrcSet} sizes={sizes} />
          )}
          <img
            src={fallbackUrl}
            alt={alt}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-500 ease-in-out",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            onLoad={() => setIsLoaded(true)}
            onError={() => setIsLoaded(true)} // Show even if error occurs
            width={width}
            height={height}
          />
        </picture>
      )}
    </div>
  );
};
