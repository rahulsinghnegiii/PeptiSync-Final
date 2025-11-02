# Implementation Plan: PeptiSync Website Redesign & Optimization

- [x] 1. Set up design system and theme configuration


  - Create Tailwind config with wellness-tech color palette
  - Define typography scale with Inter, Poppins, Sora fonts
  - Configure spacing, shadows, and border radius tokens
  - Create CSS custom properties for theme values
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Implement memory optimization infrastructure


  - Create useCleanup hook for automatic event listener cleanup
  - Implement useFirebaseSubscription hook with automatic unsubscribe
  - Create memory profiler utility for development monitoring
  - Configure React Query with cache size limits
  - Add bundle analyzer to track chunk sizes
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_


- [x] 3. Redesign homepage hero section


  - Create Hero component with white background
  - Add tagline "Simplify your peptide routine. Track. Plan. Progress."
  - Implement app mockup displays (iOS/Android images)
  - Add "Start Free Trial" and "Download App" CTA buttons
  - Implement subtle scroll animations with framer-motion
  - _Requirements: 2.1, 2.2, 12.1, 12.2_

- [x] 4. Build How It Works section


  - Create HowItWorksStep component with icon, title, description
  - Implement 4 feature blocks: Tracker, Calendar, Inventory, Analytics
  - Add icon animations on scroll-into-view
  - Use white card backgrounds with soft shadows
  - Ensure mobile-responsive grid layout
  - _Requirements: 2.1, 2.3, 10.1, 10.2_

- [x] 5. Create feature preview components


- [x] 5.1 Build Peptide Tracker preview


  - Create non-functional animated demo of tracker interface
  - Show sample peptide entries with dosage and timing
  - Add smooth transitions between demo states
  - Use wellness color palette for UI elements
  - _Requirements: 2.4_

- [x] 5.2 Build Protocol Library preview


  - Create demo showing 3-4 preset stacks (Performance, Recovery, Glow)
  - Display stack cards with peptide combinations
  - Add hover effects and selection animations
  - Show sample protocol details on selection
  - _Requirements: 2.4_

- [x] 5.3 Build Vendor Price Tracker preview


  - Create demo table with sample vendor listings
  - Show peptide names, vendors, prices, and links
  - Implement sort functionality (price, vendor)
  - Add "Best Price" badge highlighting
  - _Requirements: 2.4_

- [x] 6. Implement founding user counter with Firebase



  - Set up Firebase Realtime Database connection
  - Create useFoundingUserCounter hook with real-time updates
  - Build FoundingUserCounter component with progress bar
  - Display "X of 500 Lifetime Deals Claimed" with animation
  - Implement automatic cleanup on component unmount
  - _Requirements: 2.5, 6.1, 6.2, 6.3, 6.4, 8.2_

- [x] 7. Build pricing comparison table


  - Create PricingTier component for Free and Pro+ plans
  - Display feature comparison with checkmarks
  - Add "Popular" badge for Pro+ tier
  - Implement CTA buttons linking to Stripe checkout
  - Use light background with clear visual hierarchy
  - _Requirements: 2.1, 5.2_

- [x] 8. Add testimonials section


  - Create Testimonial component with user quote, name, role
  - Implement carousel or grid layout for multiple testimonials
  - Add subtle animations on scroll
  - Use white cards with soft shadows
  - _Requirements: 2.1, 12.1_

- [x] 9. Create shop teaser section on homepage



  - Build ShopTeaser component with banner design
  - Display featured products or categories
  - Add "Visit Shop" CTA button
  - Implement hover effects on product previews
  - _Requirements: 2.1, 3.1_

- [x] 10. Build complete shop page


- [x] 10.1 Create shop page layout and navigation


  - Build Shop page component with category filters
  - Implement product grid layout (responsive)
  - Add category tabs: All, Labels, Cases, Accessories, Merch
  - Create search and sort functionality
  - _Requirements: 3.1, 3.2, 10.1, 10.2_

- [x] 10.2 Implement product card component

  - Create ProductCard with image, name, price, description
  - Add "Add to Cart" button with loading state
  - Implement quantity selector
  - Show "Out of Stock" badge when applicable
  - Add hover effects and animations
  - _Requirements: 3.2, 12.2_

- [x] 10.3 Create product detail modal/page

  - Build ProductDetail component with image gallery
  - Display full description and specifications
  - Add variant selector (size, color, etc.)
  - Implement "Add to Cart" with quantity selection
  - Show related products section
  - _Requirements: 3.2, 3.3_

- [x] 11. Implement shopping cart functionality


- [x] 11.1 Create cart state management

  - Build useCart hook with add, remove, update actions
  - Implement localStorage persistence for guest users
  - Sync cart with Supabase for authenticated users
  - Add cart item validation (stock, price)
  - _Requirements: 4.1, 4.2, 4.3, 8.3_

- [x] 11.2 Build cart drawer/modal component

  - Create CartDrawer component with slide-in animation
  - Display cart items with image, name, price, quantity
  - Add quantity adjustment buttons (+/-)
  - Show subtotal, tax, shipping estimates
  - Implement "Proceed to Checkout" button
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 11.3 Add cart icon to navigation

  - Update Navigation component with cart icon
  - Display item count badge on cart icon
  - Implement click to open cart drawer
  - Add cart icon animation when items added
  - _Requirements: 3.3, 4.4_

- [x] 12. Integrate Stripe checkout for shop

- [x] 12.1 Set up Stripe checkout session creation

  - Create Supabase Edge Function for checkout session
  - Implement line items mapping from cart
  - Configure success and cancel URLs
  - Add metadata for order tracking
  - _Requirements: 5.1, 5.2_

- [x] 12.2 Build checkout flow

  - Create Checkout page with order summary
  - Implement redirect to Stripe Checkout
  - Build order success page with confirmation
  - Create order failure page with retry option
  - Store completed orders in shop_orders table
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 12.3 Add subscription checkout

  - Create subscription plans in Stripe
  - Implement subscription checkout for Pro+ tier
  - Build subscription management page
  - Add cancel/upgrade subscription functionality
  - _Requirements: 5.1, 5.2, 5.5_

- [x] 13. Implement Firebase vendor price tracker


  - Set up Firebase Realtime Database structure
  - Create useVendorPrices hook with real-time updates
  - Build VendorPriceTable component
  - Implement price submission form (admin only)
  - Add automatic cleanup on unmount
  - _Requirements: 6.1, 6.2, 6.5, 8.2_

- [x] 14. Build contact form with email integration


  - Create ContactForm component with validation
  - Implement form fields: name, email, subject, message
  - Create Supabase Edge Function for email sending
  - Configure email to route to support@peptisync.com
  - Add success/error toast notifications
  - Store submissions in Firebase for tracking
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 15. Optimize images and assets

  - Implement lazy loading for all images
  - Convert images to WebP format with fallbacks
  - Add responsive image srcsets
  - Implement blur-up loading technique
  - Configure CDN caching headers
  - _Requirements: 9.2, 9.4_

- [x] 16. Implement code splitting and lazy loading

  - Add React.lazy for all route components
  - Implement Suspense boundaries with loading fallbacks
  - Configure Vite manual chunks for vendors
  - Split large components into separate bundles
  - _Requirements: 9.3, 9.4_

- [x] 17. Add memory leak prevention measures

  - Audit all useEffect hooks for cleanup functions
  - Implement AbortController for fetch requests
  - Add cleanup for all Firebase subscriptions
  - Remove unused event listeners
  - Implement WeakMap for cached data where appropriate
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 18. Implement responsive design system

  - Create responsive breakpoint utilities
  - Update all components for mobile-first design
  - Test layouts at 320px, 768px, 1024px, 1440px
  - Implement touch-friendly button sizes (min 44x44px)
  - Add responsive typography scaling
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 19. Add accessibility features

  - Add alt text to all images
  - Implement proper heading hierarchy (h1-h6)
  - Add ARIA labels to interactive elements
  - Ensure keyboard navigation works throughout
  - Add visible focus indicators
  - Test with screen readers
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 20. Implement animations and transitions

  - Add scroll-triggered fade-in animations
  - Implement hover effects on interactive elements
  - Add smooth page transitions
  - Respect prefers-reduced-motion preference
  - Ensure 60fps performance during animations
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 21. Update header and footer styling

  - Redesign header with dark navy background
  - Update navigation with wellness color accents
  - Redesign footer with dark charcoal background
  - Add footer links: Privacy Policy, Terms, Medical Disclaimer, Contact
  - Ensure header/footer contrast with light content areas
  - _Requirements: 1.2, 2.1_

- [x] 22. Create shop database schema

  - Create products table in Supabase
  - Create shop_orders table for order tracking
  - Add product categories and variants support
  - Create indexes for performance
  - Set up RLS policies for shop tables
  - _Requirements: 3.1, 3.2_

- [x] 23. Seed shop with initial products

  - Add Custom Labels products with images and pricing
  - Add Cases & Accessories products
  - Add Merch/Apparel placeholder products
  - Upload product images to Supabase Storage
  - _Requirements: 3.1, 3.2_

- [x] 24. Configure Firebase for real-time features

  - Set up Firebase project and credentials
  - Create Realtime Database structure
  - Implement security rules for Firebase
  - Add Firebase SDK to project
  - Configure environment variables
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 25. Optimize bundle size and performance

  - Run bundle analyzer and identify large dependencies
  - Implement tree-shaking for unused code
  - Configure Vite build optimizations
  - Add compression for assets
  - Minimize third-party library usage
  - _Requirements: 9.1, 9.3, 9.4, 9.5_

- [x] 26. Set up performance monitoring

  - Implement performance.memory tracking
  - Add Lighthouse CI to deployment pipeline
  - Create memory usage dashboard
  - Set up alerts for memory threshold breaches
  - Monitor bundle size in CI/CD
  - _Requirements: 8.1, 8.5, 9.5_

- [x] 27. Deploy and test on Render

  - Update render.yaml with optimized configuration
  - Set all required environment variables
  - Deploy to Render and monitor memory usage
  - Run load tests to verify stability
  - Test all features in production environment
  - _Requirements: 8.1, 9.1, 9.5_

- [x] 28. Final testing and optimization


  - Run Lighthouse audits on all pages
  - Test checkout flow end-to-end
  - Verify Firebase real-time updates
  - Test on multiple devices and browsers
  - Fix any remaining memory leaks
  - Verify WCAG 2.1 AA compliance
  - _Requirements: 8.5, 9.5, 11.5_

