# Requirements Document: PeptiSync Theme System & Feature Overhaul

## Introduction

This document outlines requirements for implementing a complete dual-theme system (lightened dark mode + new light mode) with theme toggle, adding new homepage features, shop enhancements, and critical performance optimizations for the PeptiSync website deployed on Render.

## Glossary

- **Theme System**: Dual-mode color scheme with user preference persistence
- **Dark Mode**: Lightened version of current dark theme (#1a1d26 base instead of pure black)
- **Light Mode**: New bright theme with white backgrounds
- **Theme Toggle**: UI control allowing users to switch between themes
- **System Preference**: Browser/OS-level theme preference detection
- **Memory Leak**: Programming error causing progressive memory consumption
- **WCAG AA**: Web Content Accessibility Guidelines Level AA compliance
- **Render**: Cloud platform for deploying web applications

## Requirements

### Requirement 1: Lightened Dark Mode Theme

**User Story:** As a user, I want a dark mode that is easier on the eyes than pure black, so that I can use the app comfortably in low-light conditions.

#### Acceptance Criteria

1. WHEN viewing the site in dark mode, THE System SHALL display main background color #1a1d26 instead of pure black
2. WHEN viewing cards in dark mode, THE System SHALL display background #1f2535 with subtle shadows
3. WHEN viewing text in dark mode, THE System SHALL display body text in #b0b8c9 for improved readability
4. WHEN viewing interactive elements in dark mode, THE System SHALL maintain cyan accent #00d4ff
5. WHEN viewing borders in dark mode, THE System SHALL use #2a3447 for subtle definition

### Requirement 2: New Light Mode Theme

**User Story:** As a user who prefers light interfaces, I want a clean light mode option, so that I can use the app in bright environments.

#### Acceptance Criteria

1. WHEN viewing the site in light mode, THE System SHALL display main background #ffffff
2. WHEN viewing cards in light mode, THE System SHALL display white backgrounds with shadows (0 2px 8px rgba(0,0,0,0.08))
3. WHEN viewing text in light mode, THE System SHALL display headings in #1a1d26 and body text in #374151
4. WHEN viewing interactive elements in light mode, THE System SHALL use #0891b2 cyan accent for sufficient contrast
5. WHEN viewing borders in light mode, THE System SHALL use #e5e7eb for subtle definition

### Requirement 3: Theme Toggle Functionality

**User Story:** As a user, I want to easily switch between light and dark modes, so that I can choose my preferred viewing experience.

#### Acceptance Criteria

1. WHEN viewing the navigation bar, THE System SHALL display a theme toggle button with sun/moon icon
2. WHEN clicking the theme toggle, THE System SHALL switch themes within 300ms with smooth transitions
3. WHEN switching themes, THE System SHALL save preference to localStorage
4. WHEN revisiting the site, THE System SHALL apply saved theme preference before page renders
5. WHEN no preference is saved, THE System SHALL detect and apply system preference via prefers-color-scheme

### Requirement 4: Homepage Feature Sections

**User Story:** As a visitor, I want to see clear explanations of features and benefits, so that I understand the value proposition.

#### Acceptance Criteria

1. WHEN viewing the homepage, THE System SHALL display "How It Works" section with 4 feature blocks
2. WHEN viewing feature previews, THE System SHALL display non-functional demos for Tracker, Protocol Library, and Vendor Prices
3. WHEN viewing the founding user counter, THE System SHALL display real-time count from Firebase (X of 500)
4. WHEN viewing the comparison table, THE System SHALL display Free vs Pro+ features side-by-side
5. WHEN viewing the shop teaser, THE System SHALL display product preview with "Browse Shop" CTA

### Requirement 5: Enhanced Shop Page

**User Story:** As a shopper, I want an intuitive shopping experience with clear product categories, so that I can easily find and purchase items.

#### Acceptance Criteria

1. WHEN navigating to shop, THE System SHALL display product categories (Custom Labels, Cases & Accessories, Merch)
2. WHEN viewing products, THE System SHALL display cards with image, name, price, and "Add to Cart" button
3. WHEN adding to cart, THE System SHALL update cart icon badge with item count
4. WHEN viewing cart, THE System SHALL display items with quantity controls and subtotal
5. WHEN proceeding to checkout, THE System SHALL integrate with Stripe Checkout for payment

### Requirement 6: Performance & Memory Optimization

**User Story:** As a system administrator, I want the application to run efficiently without memory leaks, so that it remains stable on Render.

#### Acceptance Criteria

1. WHEN monitoring memory usage, THE System SHALL maintain stable footprint over 1000+ requests
2. WHEN components unmount, THE System SHALL cleanup all event listeners and subscriptions
3. WHEN switching themes, THE System SHALL not create memory leaks or duplicate listeners
4. WHEN loading images, THE System SHALL use lazy loading for below-the-fold content
5. WHEN profiling the application, THE System SHALL show no memory leaks in Chrome DevTools

### Requirement 7: Accessibility Compliance

**User Story:** As a user with disabilities, I want the website to be accessible with assistive technologies, so that I can use all features independently.

#### Acceptance Criteria

1. WHEN using keyboard navigation, THE System SHALL provide visible focus indicators on all interactive elements
2. WHEN using a screen reader, THE System SHALL provide descriptive ARIA labels for theme toggle and cart icon
3. WHEN checking color contrast, THE System SHALL meet WCAG 2.1 AA standards in both themes (4.5:1 for text)
4. WHEN theme changes, THE System SHALL announce change to screen readers via ARIA live region
5. WHEN using reduced motion preference, THE System SHALL respect prefers-reduced-motion setting

### Requirement 8: Responsive Design

**User Story:** As a mobile user, I want the website to work perfectly on my device, so that I can access all features on the go.

#### Acceptance Criteria

1. WHEN viewing on mobile (320px-767px), THE System SHALL display single-column layouts with full-width buttons
2. WHEN viewing on tablet (768px-1023px), THE System SHALL display optimized two-column layouts
3. WHEN viewing on desktop (1024px+), THE System SHALL display full multi-column layouts
4. WHEN testing touch interactions, THE System SHALL provide touch-friendly button sizes (min 44x44px)
5. WHEN rotating device, THE System SHALL adapt layout to new orientation

### Requirement 9: Favicon Update

**User Story:** As a user, I want to see a recognizable brand icon in my browser tab, so that I can easily identify the PeptiSync tab.

#### Acceptance Criteria

1. WHEN viewing the browser tab, THE System SHALL display a custom favicon with peptide/DNA helix design
2. WHEN viewing on mobile home screen, THE System SHALL display appropriate app icon sizes
3. WHEN viewing the favicon, THE System SHALL use cyan color matching brand identity
4. WHEN viewing in dark mode browser, THE System SHALL display theme-appropriate favicon variant
5. WHEN adding to bookmarks, THE System SHALL display high-resolution favicon

### Requirement 10: Firebase Real-time Features

**User Story:** As a user, I want to see live updates for founding user counter and vendor prices, so that I have current information.

#### Acceptance Criteria

1. WHEN viewing founding user counter, THE System SHALL display real-time count from Firebase Realtime Database
2. WHEN a user claims a spot, THE System SHALL update counter across all connected clients within 1 second
3. WHEN viewing vendor prices, THE System SHALL fetch latest data from Firebase
4. WHEN Firebase connection fails, THE System SHALL display cached data with offline indicator
5. WHEN components unmount, THE System SHALL properly cleanup Firebase listeners to prevent memory leaks
