# Requirements Document

## Introduction

This document outlines the requirements for Phase 3 of the PeptiSync website development, focusing on marketing and landing page enhancements. PeptiSync is a peptide tracking application with an integrated e-commerce shop. Phase 3 aims to improve user engagement, showcase product value, and drive conversions through enhanced shop functionality, informative content sections, social proof elements, and comprehensive pricing information.

The implementation builds upon the existing React + TypeScript + Supabase stack with theme-aware styling, responsive design, and accessibility compliance established in Phases 1 and 2.

## Glossary

- **PeptiSync_System**: The web application including frontend, backend, and database components
- **Shop_Component**: The e-commerce section for purchasing custom labels, cases, accessories, and merchandise
- **Cart_System**: Shopping cart functionality for managing product selections and quantities
- **Stripe_Integration**: Payment processing system using Stripe Checkout
- **Theme_System**: Dark/light mode theming established in Phase 1
- **Founding_User**: Early adopter eligible for lifetime pricing (limited to 500 users)
- **Product_Category**: Classification of shop items (Custom Labels, Cases & Accessories, Merch)
- **Pricing_Tier**: Subscription plan level (Free, Basic, Pro, Pro+, Elite)
- **Entitlement**: Access level granted by a pricing tier
- **Feature_Preview**: Non-functional mockup demonstrating app capabilities
- **Protocol_Stack**: Pre-configured combination of peptides for specific goals

## Requirements

### Requirement 1: Shop Page Product Display and Filtering

**User Story:** As a customer, I want to browse shop products by category with clear product information, so that I can easily find and select items to purchase.

#### Acceptance Criteria

1. WHEN a user navigates to the shop page, THE PeptiSync_System SHALL display products in a responsive grid (3 columns on desktop, 2 on tablet, 1 on mobile)
2. WHEN a user selects a Product_Category filter, THE PeptiSync_System SHALL display only products matching that category
3. WHEN a user views a product card, THE PeptiSync_System SHALL display product image, name, price in cyan color, short description, quantity selector, and "Add to Cart" button
4. WHEN a user hovers over a product image, THE PeptiSync_System SHALL apply a zoom effect
5. WHEN a user adjusts quantity using +/- buttons, THE PeptiSync_System SHALL update the quantity value between 1 and 99
6. WHEN the Theme_System is in dark mode, THE PeptiSync_System SHALL apply theme-aware styling to all shop components

### Requirement 2: Shopping Cart Functionality

**User Story:** As a customer, I want to manage items in my shopping cart and proceed to checkout, so that I can complete my purchase.

#### Acceptance Criteria

1. WHEN a user clicks "Add to Cart", THE PeptiSync_System SHALL add the selected product and quantity to the Cart_System
2. WHEN a user navigates to the cart page, THE PeptiSync_System SHALL display all cart items with image, name, quantity, price, and remove button
3. WHEN a user adjusts item quantity in cart, THE PeptiSync_System SHALL update the subtotal in real-time
4. WHEN a user removes an item, THE PeptiSync_System SHALL delete it from the Cart_System and update totals
5. WHEN the cart is empty, THE PeptiSync_System SHALL display an empty state message with "Continue Shopping" link
6. WHEN a user views cart summary, THE PeptiSync_System SHALL display subtotal, tax calculation, and total amount

### Requirement 3: Stripe Checkout Integration

**User Story:** As a customer, I want to securely complete my purchase using Stripe, so that I can receive my products.

#### Acceptance Criteria

1. WHEN a user clicks "Proceed to Checkout", THE PeptiSync_System SHALL initiate Stripe_Integration checkout flow
2. WHEN Stripe_Integration processes payment successfully, THE PeptiSync_System SHALL redirect to an order confirmation page
3. WHEN payment fails, THE PeptiSync_System SHALL display an error message and allow retry
4. WHEN testing checkout, THE PeptiSync_System SHALL accept Stripe test card numbers
5. WHEN an order is confirmed, THE PeptiSync_System SHALL display order number and confirmation details
6. WHEN checkout errors occur, THE PeptiSync_System SHALL handle them gracefully with user-friendly messages

### Requirement 4: How It Works Section

**User Story:** As a visitor, I want to understand the app's key features at a glance, so that I can quickly assess its value.

#### Acceptance Criteria

1. WHEN a user scrolls below the hero section, THE PeptiSync_System SHALL display a "How It Works" section with heading
2. WHEN viewing the How It Works section, THE PeptiSync_System SHALL display 4 feature blocks in a grid (2x2 on desktop, 1 column on mobile)
3. WHEN a user views each feature block, THE PeptiSync_System SHALL display a cyan icon, heading, and 2-3 line description
4. WHEN a user hovers over a feature block, THE PeptiSync_System SHALL apply a hover effect
5. WHEN the Theme_System changes, THE PeptiSync_System SHALL apply theme-aware styling to feature cards
6. WHEN on mobile devices, THE PeptiSync_System SHALL stack feature blocks in a single column

### Requirement 5: Founding User Counter

**User Story:** As a visitor, I want to see how many founding member spots remain, so that I feel urgency to claim lifetime pricing.

#### Acceptance Criteria

1. WHEN a user views the founding user section, THE PeptiSync_System SHALL display current count out of 500 total spots
2. WHEN the counter updates in Firebase, THE PeptiSync_System SHALL reflect changes in real-time
3. WHEN a user views the progress bar, THE PeptiSync_System SHALL display percentage of claimed spots with animation
4. WHEN a user scrolls the progress bar into view, THE PeptiSync_System SHALL animate the progress bar fill
5. WHEN a user clicks "Claim Your Spot", THE PeptiSync_System SHALL navigate to signup or pricing page
6. WHEN the Theme_System is active, THE PeptiSync_System SHALL apply theme-aware styling to the counter section

### Requirement 6: Pricing Comparison Table (5 Tiers)

**User Story:** As a potential customer, I want to compare all 5 pricing tiers and their features, so that I can choose the best plan for my needs.

#### Pricing Plans Specification

**Free Plan:**
- Product ID: `free_plan`
- Price: $0 (always free)
- Entitlement: `free_access`
- Features:
  - Track up to 3 peptides
  - Basic monthly calendar
  - Basic symptom tracking
  - 5 progress photos/month
  - 1 stack template
  - Archive inactive cycles
  - Dark mode
  - Basic help/FAQ only

**Basic Plan:**
- Product ID (Monthly): `basic_monthly` → $4.99/month
- Product ID (Yearly): `basic_yearly` → $54.99/year (save $5/year)
- Entitlement: `basic_access`
- Features (Everything in Free, plus):
  - Track up to 5 peptides
  - 3-month calendar view (daily/weekly/monthly)
  - Symptom severity levels
  - 20 progress photos/month
  - 3 stack templates
  - Reconstitution tracker
  - Measurement tracking
  - Private notes and tags

**Pro Plan:**
- Product ID (Monthly): `pro_monthly` → $9.99/month
- Product ID (Yearly): `pro_yearly` → $99.99/year (save $20/year)
- Entitlement: `pro_access`
- Features (Everything in Basic, plus):
  - Unlimited peptides
  - Full calendar access
  - Advanced reminders
  - Unlimited progress photos
  - Analytics and dosage charts
  - Symptom trend tracking
  - Supply inventory tracking
  - Order tracker
  - Preset protocol library
  - Test result uploads

**Pro+ Plan (MOST POPULAR):**
- Product ID (Monthly): `pro_plus_monthly` → $14.99/month
- Product ID (Yearly): `pro_plus_yearly` → $159.99/year (save $20/year)
- Entitlement: `pro_plus_access`
- Badge: "Most Popular"
- Features (Everything in Pro, plus):
  - Vendor pricing tracker
  - Batch/vial tracking
  - Low stock alerts
  - Protocol note attachments
  - Advanced priority sync

**Elite Annual Plan (EXCLUSIVE):**
- Product ID: `elite_annual`
- Price: $149.99/year (one-time annual purchase)
- Entitlement: `elite_access`
- User Limit: Maximum 300 users only
- Badge: "Only 300 Spots Available"
- Features (Everything in Pro+, plus):
  - System level estimation engine
  - Full data export (CSV/PDF)
  - Referral rewards system
  - Beta feature access
  - Highest priority support

#### Acceptance Criteria

1. WHEN a user views the pricing section, THE PeptiSync_System SHALL display all 5 Pricing_Tiers (Free, Basic, Pro, Pro+, Elite) in a horizontal layout
2. WHEN viewing pricing cards, THE PeptiSync_System SHALL highlight Pro+ as "Most Popular" with cyan glow border
3. WHEN viewing the Elite plan, THE PeptiSync_System SHALL display "Only 300 Spots Available" badge with gold/premium accent
4. WHEN a user toggles monthly/yearly billing, THE PeptiSync_System SHALL update prices for Basic, Pro, and Pro+ plans and display yearly savings
5. WHEN a user views feature lists, THE PeptiSync_System SHALL display cyan checkmarks for included features
6. WHEN a user clicks "Choose Plan" on Free tier, THE PeptiSync_System SHALL navigate to app signup without payment
7. WHEN a user clicks "Choose Plan" on paid tiers, THE PeptiSync_System SHALL navigate to Stripe checkout with correct product ID
8. WHEN on mobile devices, THE PeptiSync_System SHALL enable horizontal scrolling for pricing cards
9. WHEN a user hovers over a pricing card, THE PeptiSync_System SHALL apply elevation effect
10. WHEN the Theme_System changes, THE PeptiSync_System SHALL apply theme-aware styling to all pricing cards

### Requirement 7: Feature Previews Section

**User Story:** As a visitor, I want to see demonstrations of key app features, so that I understand what I'll get before signing up.

#### Acceptance Criteria

1. WHEN a user views the tracker demo, THE PeptiSync_System SHALL display a non-functional mockup showing sample entry data
2. WHEN the Theme_System changes, THE PeptiSync_System SHALL switch the tracker mockup image to match the theme
3. WHEN a user views the preset protocol library, THE PeptiSync_System SHALL display 3-4 stack cards with peptide lists and durations
4. WHEN a user views the vendor price tracker, THE PeptiSync_System SHALL display a sample table with 3-5 vendor listings
5. WHEN a user clicks "View in App" or "View All Prices", THE PeptiSync_System SHALL navigate to the appropriate app section
6. WHEN a user hovers over preview cards, THE PeptiSync_System SHALL apply hover effects

### Requirement 8: Responsive Design and Theme Awareness

**User Story:** As a user on any device, I want all Phase 3 features to work seamlessly across screen sizes and themes, so that I have a consistent experience.

#### Acceptance Criteria

1. WHEN a user accesses Phase 3 features on mobile, THE PeptiSync_System SHALL display mobile-optimized layouts
2. WHEN a user switches between dark and light themes, THE PeptiSync_System SHALL apply appropriate styling to all Phase 3 components
3. WHEN a user views content on tablet, THE PeptiSync_System SHALL adjust grid layouts to 2-column where specified
4. WHEN a user resizes the browser, THE PeptiSync_System SHALL maintain layout integrity without horizontal scrolling
5. WHEN animations trigger, THE PeptiSync_System SHALL use smooth transitions (fade-in on scroll, hover effects)
6. WHEN loading content, THE PeptiSync_System SHALL display loading states where applicable

### Requirement 9: Accessibility Compliance

**User Story:** As a user with accessibility needs, I want all Phase 3 features to be fully accessible, so that I can navigate and use the site effectively.

#### Acceptance Criteria

1. WHEN a user navigates with keyboard, THE PeptiSync_System SHALL support full keyboard navigation with visible focus indicators
2. WHEN a user employs a screen reader, THE PeptiSync_System SHALL provide ARIA labels for all interactive elements
3. WHEN images are displayed, THE PeptiSync_System SHALL include descriptive alt text
4. WHEN buttons are rendered, THE PeptiSync_System SHALL include descriptive labels and roles
5. WHEN forms are presented, THE PeptiSync_System SHALL associate labels with inputs and provide error messages
6. WHEN color is used to convey information, THE PeptiSync_System SHALL provide additional non-color indicators

### Requirement 10: Stripe Product Configuration

**User Story:** As a system administrator, I want all pricing tiers properly configured in Stripe, so that customers can subscribe to the correct plans.

#### Acceptance Criteria

1. WHEN configuring Stripe products, THE PeptiSync_System SHALL create products for basic_monthly, basic_yearly, pro_monthly, pro_yearly, pro_plus_monthly, pro_plus_yearly, and elite_annual
2. WHEN a user selects Basic monthly, THE PeptiSync_System SHALL link to Stripe product `basic_monthly` with price $4.99/month and entitlement `basic_access`
3. WHEN a user selects Basic yearly, THE PeptiSync_System SHALL link to Stripe product `basic_yearly` with price $54.99/year and entitlement `basic_access`
4. WHEN a user selects Pro monthly, THE PeptiSync_System SHALL link to Stripe product `pro_monthly` with price $9.99/month and entitlement `pro_access`
5. WHEN a user selects Pro yearly, THE PeptiSync_System SHALL link to Stripe product `pro_yearly` with price $99.99/year and entitlement `pro_access`
6. WHEN a user selects Pro+ monthly, THE PeptiSync_System SHALL link to Stripe product `pro_plus_monthly` with price $14.99/month and entitlement `pro_plus_access`
7. WHEN a user selects Pro+ yearly, THE PeptiSync_System SHALL link to Stripe product `pro_plus_yearly` with price $159.99/year and entitlement `pro_plus_access`
8. WHEN a user selects Elite annual, THE PeptiSync_System SHALL link to Stripe product `elite_annual` with price $149.99/year and entitlement `elite_access`
9. WHEN a user selects Free plan, THE PeptiSync_System SHALL navigate to signup without payment processing and assign entitlement `free_access`
