# Design Document

## Overview

This design outlines the technical approach for integrating the LOGO.png file as the primary branding element across the PeptiSync website. The implementation involves updating the Navigation component to display the actual logo image and generating multiple favicon formats for cross-browser compatibility.

## Architecture

### Component Structure

```
Navigation Component
├── Logo Image Element (replaces gradient div)
│   ├── src: /logo.png
│   ├── alt: "PeptiSync Logo"
│   └── Framer Motion animations
└── Existing navigation elements (unchanged)

index.html
├── Primary favicon (PNG)
├── Fallback favicon (ICO)
├── Apple touch icon (PNG 180x180)
└── Standard favicon sizes (16x16, 32x32)
```

### Asset Pipeline

```
LOGO.png (root)
    ↓
Copy to public/logo.png
    ↓
Generate favicon variants:
    ├── public/favicon.ico (16x16, 32x32)
    ├── public/favicon-16x16.png
    ├── public/favicon-32x32.png
    └── public/apple-touch-icon.png (180x180)
```

## Components and Interfaces

### Navigation Component Updates

**File:** `src/components/Navigation.tsx`

**Changes:**
1. Replace the gradient placeholder div with an `<img>` element
2. Maintain existing Framer Motion animations
3. Add proper image sizing and styling
4. Include accessibility attributes

**Implementation:**
```tsx
<Link to="/" aria-label="PeptiSync home">
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="flex items-center space-x-2"
  >
    <img 
      src="/logo.png" 
      alt="PeptiSync Logo" 
      className="w-8 h-8 object-contain"
    />
    <span className="text-xl font-bold text-gradient">PeptiSync</span>
  </motion.div>
</Link>
```

### HTML Head Updates

**File:** `index.html`

**Changes:**
1. Update favicon link tags to reference new logo-based favicons
2. Add multiple size variants for better browser support
3. Ensure proper MIME types and sizes

**Implementation:**
```html
<!-- Favicon -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

## Data Models

No database or state management changes required. This is a purely presentational update.

## Asset Processing

### Logo Optimization

**Source:** `LOGO.png` (200x200px)

**Processing Steps:**
1. Copy original to `public/logo.png` for Navigation component
2. Generate favicon.ico with embedded 16x16 and 32x32 sizes
3. Generate PNG favicons at specific sizes:
   - 16x16 for browser tabs
   - 32x32 for browser tabs (retina)
   - 180x180 for Apple touch icon

**Tools:**
- Manual copy for logo.png
- Online favicon generator or ImageMagick for conversions
- Optimization with tools like TinyPNG or built-in compression

### File Locations

```
public/
├── logo.png              (200x200, for Navigation)
├── favicon.ico           (multi-size ICO)
├── favicon-16x16.png     (16x16)
├── favicon-32x32.png     (32x32)
└── apple-touch-icon.png  (180x180)
```

## Error Handling

### Image Loading Failures

**Scenario:** Logo image fails to load in Navigation

**Handling:**
- Browser will display broken image icon
- Alt text "PeptiSync Logo" provides context
- Text "PeptiSync" remains visible as fallback branding

**Future Enhancement:** Add `onError` handler to show gradient fallback

### Favicon Loading Failures

**Scenario:** Favicon fails to load

**Handling:**
- Browser falls back to next available format (PNG → ICO)
- Multiple format support ensures at least one loads
- No user-facing error, just missing icon

## Testing Strategy

### Visual Testing

1. **Navigation Logo**
   - Verify logo displays correctly on all pages
   - Test hover animation works smoothly
   - Check sizing on mobile and desktop viewports
   - Verify logo maintains aspect ratio

2. **Favicon Display**
   - Test in Chrome, Firefox, Safari, Edge
   - Verify tab icon displays correctly
   - Check bookmark icon appearance
   - Test Apple touch icon on iOS devices

### Cross-Browser Testing

**Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

**Test Cases:**
- Logo renders correctly
- Favicon appears in tab
- Favicon appears in bookmarks
- Apple touch icon works on iOS home screen

### Accessibility Testing

1. **Screen Reader Testing**
   - Verify alt text is announced correctly
   - Ensure logo link is properly labeled

2. **Keyboard Navigation**
   - Confirm logo link is keyboard accessible
   - Test focus states are visible

### Performance Testing

1. **Load Time**
   - Measure logo.png load time
   - Verify image is cached properly
   - Check favicon load impact

2. **Image Optimization**
   - Verify file sizes are reasonable
   - Confirm proper compression applied
   - Test lazy loading not applied to above-fold logo

## Implementation Notes

### Asset Generation Process

1. Copy `LOGO.png` to `public/logo.png`
2. Use online tool (e.g., favicon.io, realfavicongenerator.net) to generate:
   - favicon.ico
   - favicon-16x16.png
   - favicon-32x32.png
   - apple-touch-icon.png
3. Place all generated files in `public/` directory
4. Update `index.html` with new favicon references
5. Update `Navigation.tsx` with logo image

### Styling Considerations

- Logo should maintain 32px height (h-8) to match current design
- Use `object-contain` to preserve aspect ratio
- Consider adding subtle drop shadow for depth
- Ensure logo works on both light and dark themes

### Cache Busting

Favicon changes may require cache clearing for users. Consider:
- Adding version query parameter: `/favicon.ico?v=2`
- Documenting cache clearing in deployment notes
- Testing in incognito/private browsing mode

## Design Decisions

### Decision 1: Keep Text Logo Alongside Image

**Rationale:** Maintains brand recognition and provides fallback if image fails to load. The combination of logo image + text creates stronger brand presence.

### Decision 2: Use PNG for Primary Favicon

**Rationale:** PNG supports transparency and better quality than ICO format. Modern browsers support PNG favicons, with ICO as fallback for older browsers.

### Decision 3: Multiple Favicon Sizes

**Rationale:** Different contexts (browser tabs, bookmarks, home screen) require different sizes. Providing multiple sizes ensures optimal display quality across all use cases.

### Decision 4: Maintain Current Animation

**Rationale:** The existing hover scale animation works well and provides good user feedback. No need to change what's working.

## Dependencies

- No new npm packages required
- Framer Motion (already installed) for animations
- React Router (already installed) for Link component
- Favicon generation tool (external, one-time use)

## Rollback Plan

If issues arise:
1. Revert `Navigation.tsx` to use gradient div
2. Restore original `favicon.svg` and `favicon.ico` references in `index.html`
3. Remove new logo files from `public/` directory
4. Clear browser cache and test

Changes are minimal and easily reversible.
