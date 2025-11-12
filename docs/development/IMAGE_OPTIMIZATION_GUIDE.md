# Image Optimization Implementation Guide

## Overview

This document describes the image optimization implementation for the PeptiSync e-commerce platform, covering lazy loading, WebP format support, responsive images, blur-up loading, and CDN caching.

## Features Implemented

### 1. Lazy Loading

**Implementation**: `OptimizedImage` component uses Intersection Observer API

- Images load only when they're about to enter the viewport (100px margin)
- Priority images (above-the-fold) load immediately
- Reduces initial page load time and bandwidth usage

**Usage**:
```tsx
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Product image"
  priority={false} // Set to true for above-the-fold images
/>
```

### 2. WebP Format with JPEG Fallback

**Implementation**: Uses `<picture>` element with multiple sources

- Automatically detects WebP support in the browser
- Serves WebP to supported browsers (smaller file size, better quality)
- Falls back to JPEG for older browsers
- Reduces bandwidth by 25-35% on average

**Browser Support**:
- WebP: Chrome, Firefox, Edge, Safari 14+
- Fallback: All browsers

### 3. Responsive Image Srcsets

**Implementation**: Generates srcset with multiple image sizes

- Provides different image sizes for different screen widths
- Browser automatically selects the most appropriate size
- Reduces bandwidth on mobile devices

**Sizes Generated**:
- 640w (mobile portrait)
- 750w (mobile landscape)
- 828w (tablet portrait)
- 1080w (tablet landscape)
- 1200w (desktop)
- 1920w (large desktop)

**Usage**:
```tsx
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Product image"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

### 4. Blur-Up Loading Technique

**Implementation**: Shows blurred placeholder while image loads

- Displays a low-quality placeholder immediately
- Smooth fade-in transition when full image loads
- Improves perceived performance
- Reduces layout shift (CLS)

**Features**:
- Automatic blur placeholder generation
- Custom blur data URL support
- Smooth opacity transition

### 5. CDN Caching Headers

**Implementation**: Configured in `netlify.toml` and `public/_headers`

**Cache Durations**:
- Static assets (CSS, JS, images): 1 year (immutable)
- HTML files: No cache (always fresh)
- Fonts: 1 year (immutable)
- Favicon/robots.txt: 1 week

**Benefits**:
- Reduces server load
- Faster subsequent page loads
- Lower bandwidth costs
- Better user experience

## Component Usage

### OptimizedImage Component

The main component for all image rendering:

```tsx
import { OptimizedImage } from "@/components/OptimizedImage";

// Basic usage
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Description"
/>

// With all options
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={true}
  className="rounded-lg"
  sizes="(max-width: 768px) 100vw, 50vw"
  blurDataURL="data:image/svg+xml;base64,..."
/>
```

### Props

- `src` (required): Image URL
- `alt` (required): Alt text for accessibility
- `width` (optional): Image width in pixels
- `height` (optional): Image height in pixels
- `priority` (optional): Load immediately without lazy loading
- `className` (optional): CSS classes
- `sizes` (optional): Responsive sizes attribute
- `blurDataURL` (optional): Custom blur placeholder

## Image Utilities

### Available Functions

Located in `src/lib/imageUtils.ts`:

1. **generateBlurDataURL(color)**: Creates a blur placeholder
2. **getOptimizedImageUrl(url, options)**: Gets optimized image URL
3. **generateSrcSet(url, widths)**: Generates responsive srcset
4. **getImageDimensions(url)**: Gets image dimensions
5. **preloadImage(url)**: Preloads critical images
6. **isWebPSupported()**: Checks WebP support

### Example Usage

```typescript
import {
  generateBlurDataURL,
  getOptimizedImageUrl,
  preloadImage,
} from "@/lib/imageUtils";

// Generate blur placeholder
const blurUrl = generateBlurDataURL("#1a1a2e");

// Get optimized image URL
const optimizedUrl = getOptimizedImageUrl("/image.jpg", {
  width: 800,
  format: "webp",
  quality: 80,
});

// Preload critical image
await preloadImage("/hero-image.jpg");
```

## Performance Metrics

### Expected Improvements

- **Initial Load Time**: 30-40% faster
- **Bandwidth Usage**: 25-35% reduction
- **Lighthouse Performance Score**: +10-15 points
- **Largest Contentful Paint (LCP)**: Improved by 20-30%
- **Cumulative Layout Shift (CLS)**: Near zero with proper sizing

### Monitoring

Use these tools to measure performance:

1. **Lighthouse**: Run audits in Chrome DevTools
2. **WebPageTest**: Test from different locations
3. **Chrome DevTools Network Tab**: Monitor image loading
4. **Core Web Vitals**: Track LCP, FID, CLS

## CDN Configuration

### Netlify

Configuration is in `netlify.toml`:

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Other Hosting Providers

For Vercel, Cloudflare Pages, or other providers:

1. Copy cache headers from `netlify.toml`
2. Adapt to provider-specific configuration format
3. Ensure immutable assets have long cache times
4. Keep HTML files with short/no cache

## Integration with Image CDNs

### Cloudinary

Update `getOptimizedImageUrl` in `imageUtils.ts`:

```typescript
export const getOptimizedImageUrl = (url, options) => {
  const { width, height, format = "webp", quality = 80 } = options;
  return `https://res.cloudinary.com/your-cloud/image/upload/w_${width},h_${height},f_${format},q_${quality}/${url}`;
};
```

### Imgix

```typescript
export const getOptimizedImageUrl = (url, options) => {
  const { width, height, format = "webp", quality = 80 } = options;
  return `${url}?w=${width}&h=${height}&fm=${format}&q=${quality}&auto=compress`;
};
```

### Supabase Storage

For Supabase Storage with transformation:

```typescript
export const getOptimizedImageUrl = (url, options) => {
  const { width, height } = options;
  // Supabase doesn't have built-in transformations yet
  // Consider using a proxy service or CDN in front
  return url;
};
```

## Best Practices

### 1. Always Provide Alt Text

```tsx
<OptimizedImage
  src="/product.jpg"
  alt="Blue peptide tracking device with LCD screen"
/>
```

### 2. Use Priority for Above-the-Fold Images

```tsx
<OptimizedImage
  src="/hero.jpg"
  alt="Hero image"
  priority={true}
/>
```

### 3. Specify Dimensions to Prevent Layout Shift

```tsx
<OptimizedImage
  src="/product.jpg"
  alt="Product"
  width={800}
  height={600}
/>
```

### 4. Use Appropriate Sizes Attribute

```tsx
<OptimizedImage
  src="/product.jpg"
  alt="Product"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

### 5. Optimize Source Images

Before uploading:
- Resize to maximum needed dimensions
- Compress with tools like ImageOptim, TinyPNG
- Remove EXIF data
- Use appropriate format (JPEG for photos, PNG for graphics)

## Troubleshooting

### Images Not Loading

1. Check browser console for errors
2. Verify image URLs are correct
3. Check CORS settings for external images
4. Ensure Intersection Observer is supported

### WebP Not Working

1. Verify browser support
2. Check `isWebPSupported()` function
3. Ensure server serves correct MIME type
4. Fallback should work automatically

### Slow Loading

1. Check image file sizes
2. Verify CDN caching is working
3. Test network throttling
4. Consider using image CDN

### Layout Shift

1. Always specify width and height
2. Use aspect-ratio CSS property
3. Reserve space with min-height
4. Test with Lighthouse CLS metric

## Future Enhancements

### Planned Improvements

1. **Automatic Image Optimization**: Server-side image processing
2. **AVIF Format Support**: Next-gen format (better than WebP)
3. **Art Direction**: Different images for different breakpoints
4. **Progressive JPEG**: Better perceived performance
5. **Image Sprites**: Combine small icons
6. **Preload Critical Images**: Link rel="preload" for hero images

### Integration Ideas

1. **Image CDN**: Cloudinary, Imgix, or Cloudflare Images
2. **Build-time Optimization**: Generate optimized versions during build
3. **Edge Functions**: On-demand image transformation
4. **Service Worker**: Cache images for offline use

## Resources

- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [MDN Picture Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [WebP Format](https://developers.google.com/speed/webp)
- [Core Web Vitals](https://web.dev/vitals/)
