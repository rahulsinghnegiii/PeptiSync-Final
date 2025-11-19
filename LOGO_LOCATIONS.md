# PeptiSync Logo Locations

## Visual Guide - Where Your Logo Appears

---

### 🌐 Browser & System

#### 1. Browser Tab (Favicon)
```
┌─────────────────────────────────────┐
│ [🔷] PeptiSync - Track peptides... │  ← Logo appears here
└─────────────────────────────────────┘
```
**File:** `public/logo.png` via `index.html`

#### 2. Bookmarks
```
Bookmarks Bar:
[🔷 PeptiSync] [Other Site] [Another Site]
 ↑ Your logo
```

#### 3. iOS Home Screen
```
┌──────┐
│  🔷  │  ← When users "Add to Home Screen"
│      │
└──────┘
PeptiSync
```
**File:** `public/apple-touch-icon.png`

#### 4. Social Media Previews
```
┌─────────────────────────────────────┐
│  🔷                                 │  ← Logo in preview
│                                     │
│  PeptiSync - Track peptides...     │
│  The most advanced peptide...      │
└─────────────────────────────────────┘
```
**Meta tags:** Open Graph & Twitter Card

---

### 📱 Website Components

#### 5. Navigation Bar (Desktop)
```
┌──────────────────────────────────────────────────────────┐
│  [🔷 PeptiSync]  Features  Pricing  Store  FAQ  [Sign In] │
│   ↑ Logo here                                             │
└──────────────────────────────────────────────────────────┘
```
**Component:** `src/components/Navigation.tsx`  
**Size:** 32x32 pixels (w-8 h-8)

#### 6. Navigation Bar (Mobile)
```
┌──────────────────────────────┐
│ [🔷 PeptiSync]          [☰] │
│  ↑ Logo here                 │
└──────────────────────────────┘
```
**Component:** `src/components/Navigation.tsx`  
**Size:** 32x32 pixels (w-8 h-8)

#### 7. Footer
```
┌────────────────────────────────────────┐
│                                        │
│  [🔷 PeptiSync]                       │
│   ↑ Logo here                          │
│                                        │
│  The most advanced peptide tracking   │
│  platform...                           │
│                                        │
│  [Social Icons]                        │
└────────────────────────────────────────┘
```
**Component:** `src/components/Footer.tsx`  
**Size:** 32x32 pixels (w-8 h-8)

#### 8. Authentication Page
```
┌─────────────────────────────┐
│                             │
│          🔷                 │  ← Logo here (larger)
│                             │
│   Welcome to PeptiSync      │
│                             │
│   [Sign In] [Sign Up]       │
│                             │
│   Email: ___________        │
│   Password: _________       │
│                             │
│   [Sign In Button]          │
└─────────────────────────────┘
```
**Component:** `src/pages/Auth.tsx`  
**Size:** 48x48 pixels (w-12 h-12)

---

## Logo Sizes Reference

| Location | Size (px) | Tailwind Class | Purpose |
|----------|-----------|----------------|---------|
| Navigation | 32x32 | `w-8 h-8` | Header branding |
| Footer | 32x32 | `w-8 h-8` | Footer branding |
| Auth Page | 48x48 | `w-12 h-12` | Prominent display |
| Favicon | 16x16 | N/A | Browser tab |
| Apple Touch | 180x180 | N/A | iOS home screen |

---

## File Structure

```
public/
├── logo.png              ← Main logo (used everywhere)
├── favicon.ico           ← Browser favicon
├── apple-touch-icon.png  ← iOS home screen icon
└── assets/
    └── LOGO.png          ← Original logo file

src/
├── components/
│   ├── Navigation.tsx    ← Uses logo in header
│   └── Footer.tsx        ← Uses logo in footer
└── pages/
    └── Auth.tsx          ← Uses logo on login page

index.html                ← Favicon & meta tags
```

---

## Code Examples

### Navigation Component
```tsx
<img 
  src="/logo.png" 
  alt="PeptiSync Logo" 
  className="w-8 h-8 object-contain"
/>
```

### Footer Component
```tsx
<img 
  src="/logo.png" 
  alt="PeptiSync Logo" 
  className="w-8 h-8 object-contain"
/>
```

### Auth Page
```tsx
<img 
  src="/logo.png" 
  alt="PeptiSync Logo" 
  className="w-12 h-12 object-contain"
/>
```

### HTML Head
```html
<link rel="icon" type="image/png" href="/logo.png" />
<link rel="shortcut icon" href="/logo.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta property="og:image" content="/logo.png" />
<meta name="twitter:image" content="/logo.png" />
```

---

## Testing Your Logo

### Desktop Browser
1. Open your site in Chrome/Firefox/Safari/Edge
2. Look at the browser tab - logo should appear
3. Check navigation bar - logo should be in top-left
4. Scroll to footer - logo should be visible
5. Go to `/auth` page - logo should be at top of card

### Mobile Browser
1. Open your site on mobile device
2. Check navigation bar - logo should be visible
3. Tap menu icon - logo should remain visible
4. Scroll to footer - logo should be visible
5. Add to home screen - logo should be the icon

### Social Media
1. Share your site URL on Facebook
2. Check preview - logo should appear
3. Share on Twitter - logo should appear
4. Share on LinkedIn - logo should appear

---

## Quick Reference

**All logo files are in:** `public/` directory  
**All components use:** `/logo.png` path  
**Logo maintains aspect ratio:** `object-contain` class  
**Logo is accessible:** All images have `alt` text  

**Status:** ✅ Fully Integrated  
**Ready for:** Production Deployment

