# Implementation Plan

## PRIORITY 1: Shop Page Enhancements (5-6 hours)

- [x] 1. Enhance shop page with improved category filters and UI




- [ ] 1.1 Verify and enhance product category filters
  - Ensure ProductFilters component supports categories: "Custom Labels", "Cases & Accessories", "Merch"
  - Verify category filter UI is prominent and easy to use
  - Test category filtering with existing products in database
  - Confirm URL params update when categories change
  - _Requirements: 1.2_



- [ ] 1.2 Add quantity selector to product cards
  - Check if QuantitySelector component exists in codebase
  - If not exists, create reusable QuantitySelector component with +/- buttons
  - Implement min (1) and max (99) value constraints
  - Add keyboard support (arrow keys, number input)
  - Integrate into ProductCard component

  - Style with theme-aware colors and disabled states
  - _Requirements: 1.5_

- [ ] 1.3 Enhance product card styling and interactions
  - Verify hover zoom effect on product images (scale 1.05, transition 300ms)
  - Ensure price displays in cyan/primary color with bold font weight
  - Add out-of-stock badge when stock is 0
  - Disable "Add to Cart" button for out-of-stock items

  - Test all states: default, hover, disabled, loading
  - Verify theme-aware styling in both dark and light modes
  - _Requirements: 1.1, 1.3, 1.4, 1.6_

- [ ] 1.4 Improve cart page UI and functionality
  - Verify Cart page exists at /cart route
  - Enhance cart item display with better layout
  - Ensure quantity can be adjusted inline with +/- buttons
  - Add remove item button with confirmation
  - Display subtotal calculation (price × quantity) for each item

  - Show cart summary with subtotal, tax (8%), and total
  - Implement empty cart state with icon and "Continue Shopping" link
  - Test responsive layout (sidebar on desktop, bottom section on mobile)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 1.5 Test Stripe checkout end-to-end
  - Verify Stripe integration is configured
  - Test "Proceed to Checkout" button functionality




  - Test with Stripe test card numbers
  - Verify redirect to order confirmation page after successful payment
  - Test error handling for failed payments
  - Confirm authentication requirement (redirect to /auth if not logged in)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

## PRIORITY 2: How It Works Section (2-3 hours)


- [ ] 2. Create "How It Works" section below hero
- [ ] 2.1 Build HowItWorks component
  - Create HowItWorks component at src/components/HowItWorks.tsx
  - Define 4 feature blocks with data
  - Use lucide-react icons: Activity, Calendar, Package, TrendingUp
  - Implement 2x2 grid layout on desktop
  - Implement 1 column layout on mobile





  - Add hover effects
  - Style with glass effect and theme-aware colors
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 2.2 Integrate HowItWorks into Index page
  - Import HowItWorks component into src/pages/Index.tsx
  - Position below Hero section

  - Test responsive layout at all breakpoints
  - Verify theme switching works correctly
  - _Requirements: 4.1, 4.6_

## PRIORITY 3: Founding User Counter (2-3 hours)


- [ ] 3. Build Founding User Counter with real-time Firebase integration
- [ ] 3.1 Create FoundingUserCounter component
  - Create FoundingUserCounter component

  - Use useFoundingUserCounter hook for real-time data
  - Calculate percentage
  - Implement Progress component
  - Add "Claim Your Spot" CTA button
  - Style with gradient background





  - _Requirements: 5.1, 5.2, 5.6_

- [x] 3.2 Add progress bar animation

  - Implement Intersection Observer

  - Animate progress bar using Framer Motion
  - Use 1.5 second duration with easeOut
  - _Requirements: 5.4_

- [ ] 3.3 Add accessibility features
  - Implement ARIA live region

  - Add descriptive labels
  - _Requirements: 5.3_

- [ ] 3.4 Integrate FoundingUserCounter into Index page
  - Import and position component

  - Test real-time updates
  - Verify animation
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_






## PRIORITY 4: Pricing Comparison Table - 5 Tiers (3-4 hours)


- [-] 4. Create comprehensive 5-tier pricing comparison table

- [ ] 4.1 Define pricing tier data structure
  - Create src/types/pricing.ts

  - Define all 5 tiers with exact product IDs and pricing
  - _Requirements: 6.1, 6.3, 10.1-10.9_



- [ ] 4.2 Build PricingComparison component
  - Create PricingComparison component


  - Implement billing toggle
  - Build 5-column pricing card grid
  - Highlight Pro+ with cyan glow
  - Highlight Elite with gold accent
  - Add feature lists with checkmarks
  - _Requirements: 6.1-6.8, 6.10_

- [ ] 4.3 Implement Stripe checkout links
  - Wire up Choose Plan buttons
  - Handle Free plan navigation
  - Pass correct product IDs
  - _Requirements: 6.6, 10.9_

- [ ] 4.4 Replace existing Pricing component
  - Update Index page
  - Test all functionality
  - _Requirements: 6.1, 6.7, 6.8_

## PRIORITY 5: Feature Previews Section (3-4 hours)

- [ ] 5. Build Feature Previews section
- [ ] 5.1 Create TrackerDemo component
  - Build component with theme-aware images
  - _Requirements: 7.1, 7.2_

- [ ] 5.2 Create ProtocolLibrary component
  - Define 4 protocol stacks
  - Build stack cards
  - _Requirements: 7.3, 7.5, 7.6_

- [ ] 5.3 Create VendorPriceTracker component
  - Build table with sample data
  - _Requirements: 7.4, 7.5, 7.6_

- [ ] 5.4 Create FeaturePreviews wrapper
  - Integrate all preview components
  - _Requirements: 7.1-7.6_

- [ ] 5.5 Integrate into Index page
  - Position and test
  - _Requirements: 7.1-7.6_

## TESTING & DEPLOYMENT

- [ ] 6. Testing and quality assurance
- [ ] 6.1 Test responsive design
  - Mobile, tablet, desktop layouts
  - _Requirements: 8.1, 8.3_

- [ ] 6.2 Verify theme switching
  - Test both themes
  - _Requirements: 8.2, 8.5_

- [ ] 6.3 Accessibility compliance
  - ARIA labels, keyboard nav, screen readers
  - _Requirements: 9.1-9.6_

- [ ] 6.4 Performance and cross-browser testing
  - Lighthouse audits, browser compatibility
  - _Requirements: 8.1-8.5_

- [ ] 7. Final verification and documentation
  - Update environment variables docs
  - Test complete user journey
  - _Requirements: All_
