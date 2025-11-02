# Design Document

## Overview

This design document outlines the technical implementation for Phase 3 marketing and landing page enhancements for PeptiSync. The implementation builds upon the existing React + TypeScript + Supabase architecture with established theme system, responsive design patterns, and accessibility compliance from Phases 1 and 2.

Phase 3 focuses on six priority areas:
1. Shop page enhancements with product categories and cart functionality
2. "How It Works" informational section
3. Founding user counter with real-time Firebase updates
4. Comprehensive 5-tier pricing comparison table
5. Feature preview demonstrations
6. Stripe integration for shop products

### Technology Stack

**Existing Stack (Maintained)**:
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS + shadcn/ui components
- Supabase (database, auth, storage)
- React Query (TanStack Query) for data fetching
- React Router v6 for navigation
- Framer Motion for animations
- Firebase Realtime Database (for founding user counter)

**New Integrations**:
- Stripe React library (@stripe/react-stripe-js, @stripe/stripe-js)
- Stripe Checkout for shop product payments

### Design Principles

1. **Theme Awareness**: All components must support dark/light themes using CSS variables
2. **Responsive First**: Mobile-first design with breakpoints at 640px, 768px, 1024px, 1280px
3. **Accessibility**: WCAG 2.1 AA compliance with ARIA labels, keyboard navigation, screen reader support
4. **Performance**: Lazy loading, code splitting, optimized images
5. **Consistency**: Reuse existing component patterns and styling conventions


## Architecture

### Component Hierarchy

```
Index (Landing Page)
├── Navigation
├── Hero
├── HowItWorks (NEW)
├── FoundingUserCounter (NEW)
├── Features
├── FeaturePreviews (NEW)
│   ├── TrackerDemo
│   ├── ProtocolLibrary
│   └── VendorPriceTracker
├── PricingComparison (ENHANCED)
└── Footer

Store Page (ENHANCED)
├── Navigation
├── Hero Section
├── ProductCategoryFilters (NEW)
├── ProductGrid (ENHANCED)
│   └── ProductCard (ENHANCED)
├── CartPage (NEW)
│   ├── CartItemList
│   ├── CartSummary
│   └── CheckoutButton
└── Footer

Checkout Flow (NEW)
├── StripeCheckout
├── OrderConfirmation
└── ErrorHandling
```

### Data Flow

**Shop Products**:
1. Products stored in Supabase `products` table
2. Cart items stored in Supabase `cart_items` table (authenticated users)
3. Cart state managed via React Query with optimistic updates
4. Checkout handled by Stripe Checkout session

**Founding User Counter**:
1. Counter data stored in Firebase Realtime Database at `/foundingUserCounter`
2. Real-time subscription via `useFoundingUserCounter` hook
3. Updates propagate instantly to all connected clients

**Pricing Plans**:
1. Plan metadata stored in component constants
2. Stripe product IDs configured in environment variables
3. Checkout links direct to Stripe Checkout with pre-filled plan data


## Components and Interfaces

### 1. Shop Page Enhancements

#### ProductCategoryFilters Component

**Purpose**: Filter products by category with visual category badges

**Props**:
```typescript
interface ProductCategoryFiltersProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  availableCategories: string[];
}
```

**Features**:
- Horizontal scrollable category pills on mobile
- Multi-select with checkboxes
- Active state styling with cyan accent
- "All Products" option to clear filters

#### Enhanced ProductCard Component

**Enhancements to existing component**:
- Hover zoom effect on product image (scale 1.05, transition 300ms)
- Cyan-colored price display (text-primary class)
- Quantity selector with +/- buttons (range 1-99)
- "Add to Cart" button with loading state
- Out of stock badge and disabled state
- Theme-aware card styling

**Structure**:
```typescript
<Card className="group hover:shadow-lg transition-all">
  <div className="relative overflow-hidden">
    <img className="group-hover:scale-105 transition-transform" />
    {stock === 0 && <Badge>Out of Stock</Badge>}
  </div>
  <CardContent>
    <h3>{name}</h3>
    <p className="text-primary font-bold">${price}</p>
    <p className="text-muted-foreground">{description}</p>
    <QuantitySelector value={qty} onChange={setQty} />
    <Button onClick={handleAddToCart} disabled={stock === 0}>
      Add to Cart
    </Button>
  </CardContent>
</Card>
```

#### CartPage Component

**Purpose**: Display cart items and checkout summary

**Route**: `/cart`

**Sections**:
1. **Cart Items List**:
   - Product image (thumbnail)
   - Product name (link to product page)
   - Unit price
   - Quantity selector (inline update)
   - Subtotal (price × quantity)
   - Remove button (trash icon)

2. **Cart Summary** (sticky sidebar on desktop):
   - Subtotal
   - Tax (calculated at 8%)
   - Total
   - "Proceed to Checkout" button

3. **Empty State**:
   - Empty cart icon
   - "Your cart is empty" message
   - "Continue Shopping" button linking to /store

**State Management**:
```typescript
const { data: cartItems, isLoading } = useCart();
const { updateQuantity, removeItem } = useCartMutations();
```


### 2. How It Works Section

**Purpose**: Showcase 4 key app features below hero section

**Component**: `HowItWorks.tsx`

**Layout**:
- Section heading: "How It Works"
- 2×2 grid on desktop (≥1024px)
- 1 column on mobile (<1024px)
- Each feature block is a card with hover effect

**Feature Blocks**:
```typescript
const features = [
  {
    icon: <Activity className="w-12 h-12 text-primary" />,
    title: "Peptide Tracker",
    description: "Log dose, time, injection site with ease. Track multiple peptides simultaneously with detailed history."
  },
  {
    icon: <Calendar className="w-12 h-12 text-primary" />,
    title: "Protocol Calendar",
    description: "Schedule and track your cycles. Visualize your protocol timeline with daily, weekly, and monthly views."
  },
  {
    icon: <Package className="w-12 h-12 text-primary" />,
    title: "Inventory Manager",
    description: "Monitor supply levels automatically. Get low stock alerts and track batch numbers for safety."
  },
  {
    icon: <TrendingUp className="w-12 h-12 text-primary" />,
    title: "Progress Analytics",
    description: "AI-powered insights for optimization. Visualize trends, track symptoms, and optimize your protocols."
  }
];
```

**Card Styling**:
```css
.feature-card {
  @apply glass rounded-lg p-6 hover:shadow-xl transition-all;
  @apply hover:-translate-y-1 duration-300;
}
```

**Icons**: Use lucide-react icons (Activity, Calendar, Package, TrendingUp)


### 3. Founding User Counter

**Purpose**: Display limited-time founding member availability with urgency

**Component**: `FoundingUserCounter.tsx`

**Data Source**: Firebase Realtime Database via `useFoundingUserCounter` hook

**Layout**:
```tsx
<section className="py-20 bg-gradient-to-br from-primary/10 to-background">
  <div className="max-w-4xl mx-auto text-center">
    <h2>Join the Founding Members</h2>
    <div className="relative">
      <Progress value={percentage} className="h-4" />
      <span className="absolute inset-0 flex items-center justify-center">
        {current} of {total} Claimed
      </span>
    </div>
    <p className="text-lg">{percentage}% of lifetime deals claimed</p>
    <p className="text-muted-foreground">
      Exclusive lifetime pricing for early adopters
    </p>
    <Button size="lg" className="mt-6">
      Claim Your Spot
    </Button>
  </div>
</section>
```

**Animation**:
- Progress bar animates on scroll into view using Framer Motion
- Intersection Observer triggers animation when 50% visible
- Animate from 0 to actual percentage over 1.5 seconds with easeOut

**Real-time Updates**:
```typescript
const { current, total } = useFoundingUserCounter();
const percentage = (current / total) * 100;

useEffect(() => {
  // Announce updates to screen readers
  announce(`${current} of ${total} founding member spots claimed`);
}, [current, total]);
```

**Theme Awareness**:
- Background gradient uses primary color with opacity
- Progress bar uses primary color
- Text colors adapt to theme (foreground/muted-foreground)


### 4. Pricing Comparison Table

**Purpose**: Display all 5 pricing tiers with feature comparison

**Component**: `PricingComparison.tsx` (replaces existing Pricing component)

**Pricing Tiers Data Structure**:
```typescript
interface PricingTier {
  id: string;
  name: string;
  productIds: {
    monthly?: string;
    yearly?: string;
    annual?: string;
  };
  prices: {
    monthly?: number;
    yearly?: number;
    annual?: number;
  };
  entitlement: string;
  badge?: 'popular' | 'limited';
  userLimit?: number;
  features: string[];
  savings?: {
    yearly?: number;
  };
}

const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    productIds: {},
    prices: { monthly: 0 },
    entitlement: 'free_access',
    features: [
      'Track up to 3 peptides',
      'Basic monthly calendar',
      'Basic symptom tracking',
      '5 progress photos/month',
      '1 stack template',
      'Archive inactive cycles',
      'Dark mode',
      'Basic help/FAQ only'
    ]
  },
  {
    id: 'basic',
    name: 'Basic',
    productIds: {
      monthly: 'basic_monthly',
      yearly: 'basic_yearly'
    },
    prices: {
      monthly: 4.99,
      yearly: 54.99
    },
    entitlement: 'basic_access',
    savings: {
      yearly: 5 // Save $5/year vs monthly
    },
    features: [
      'Everything in Free, plus:',
      'Track up to 5 peptides',
      '3-month calendar view (daily/weekly/monthly)',
      'Symptom severity levels',
      '20 progress photos/month',
      '3 stack templates',
      'Reconstitution tracker',
      'Measurement tracking',
      'Private notes and tags'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    productIds: {
      monthly: 'pro_monthly',
      yearly: 'pro_yearly'
    },
    prices: {
      monthly: 9.99,
      yearly: 99.99
    },
    entitlement: 'pro_access',
    savings: {
      yearly: 20 // Save $20/year vs monthly
    },
    features: [
      'Everything in Basic, plus:',
      'Unlimited peptides',
      'Full calendar access',
      'Advanced reminders',
      'Unlimited progress photos',
      'Analytics and dosage charts',
      'Symptom trend tracking',
      'Supply inventory tracking',
      'Order tracker',
      'Preset protocol library',
      'Test result uploads'
    ]
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    productIds: {
      monthly: 'pro_plus_monthly',
      yearly: 'pro_plus_yearly'
    },
    prices: {
      monthly: 14.99,
      yearly: 159.99
    },
    entitlement: 'pro_plus_access',
    badge: 'popular',
    savings: {
      yearly: 20 // Save $20/year vs monthly
    },
    features: [
      'Everything in Pro, plus:',
      'Vendor pricing tracker',
      'Batch/vial tracking',
      'Low stock alerts',
      'Protocol note attachments',
      'Advanced priority sync'
    ]
  },
  {
    id: 'elite',
    name: 'Elite',
    productIds: {
      annual: 'elite_annual'
    },
    prices: {
      annual: 149.99
    },
    entitlement: 'elite_access',
    badge: 'limited',
    userLimit: 300,
    features: [
      'Everything in Pro+, plus:',
      'System level estimation engine',
      'Full data export (CSV/PDF)',
      'Referral rewards system',
      'Beta feature access',
      'Highest priority support'
    ]
  }
];
```

**Layout**:
- Horizontal scrollable cards on mobile (<768px)
- 5-column grid on desktop (≥1280px)
- 3-column grid on tablet (768px-1279px) with horizontal scroll
- Each tier is a card with consistent height
- Pro+ highlighted with cyan glow border and "Most Popular" badge
- Elite highlighted with gold/premium accent and "Only 300 Spots Available" badge

**Design Specifications**:
- Card dimensions: Min height 600px, consistent width
- Spacing: 24px gap between cards
- Border radius: 12px
- Pro+ glow: `box-shadow: 0 0 0 2px hsl(var(--primary))`
- Elite accent: Gold border `#FFD700` or `hsl(45, 100%, 50%)`
- Hover effect: Translate Y -4px, increase shadow

**Billing Toggle**:
```tsx
<div className="flex items-center justify-center gap-4 mb-8">
  <span className={billingPeriod === 'monthly' ? 'font-bold text-foreground' : 'text-muted-foreground'}>
    Monthly
  </span>
  <Switch 
    checked={billingPeriod === 'yearly'} 
    onCheckedChange={toggleBilling}
    aria-label="Toggle between monthly and yearly billing"
  />
  <span className={billingPeriod === 'yearly' ? 'font-bold text-foreground' : 'text-muted-foreground'}>
    Yearly <Badge variant="secondary" className="ml-2">Save up to $20</Badge>
  </span>
</div>
```

**Price Display Logic**:
```tsx
// Show monthly price or yearly price based on toggle
// For Elite, always show annual price (no toggle applies)
const displayPrice = (tier: PricingTier) => {
  if (tier.id === 'elite') {
    return `$${tier.prices.annual}/year`;
  }
  if (tier.id === 'free') {
    return 'Free';
  }
  if (billingPeriod === 'yearly' && tier.prices.yearly) {
    return `$${tier.prices.yearly}/year`;
  }
  return `$${tier.prices.monthly}/month`;
};

// Show savings badge for yearly billing
const showSavings = (tier: PricingTier) => {
  if (billingPeriod === 'yearly' && tier.savings?.yearly) {
    return <Badge variant="success">Save ${tier.savings.yearly}/year</Badge>;
  }
  return null;
};
```

**Feature List Rendering**:
- Cyan checkmark icon for included features
- Grayed out X icon for excluded features (if showing comparison)
- Hierarchical indentation for "Everything in X, plus:" items

**CTA Buttons**:
- Free: "Get Started" → /auth?mode=signup
- Paid plans: "Choose Plan" → Stripe Checkout with pre-filled product ID
- Elite: "Claim Limited Spot" → Stripe Checkout


### 5. Feature Previews Section

**Purpose**: Demonstrate key app features with mockups and sample data

**Component**: `FeaturePreviews.tsx`

#### A. Tracker Demo

**Layout**:
```tsx
<div className="grid md:grid-cols-2 gap-8 items-center">
  <div>
    <h3>Track Every Detail</h3>
    <p>Log your peptide doses with precision...</p>
    <Button>View in App</Button>
  </div>
  <div className="relative">
    <img 
      src={theme === 'dark' ? '/tracker-dark.png' : '/tracker-light.png'}
      alt="Peptide tracker interface showing sample entry"
      className="rounded-lg shadow-2xl"
    />
  </div>
</div>
```

**Mockup Content**:
- Sample entry: "Semaglutide - 0.5mg - Left Abdomen - 9:00 AM"
- Calendar view with marked injection days
- Recent entries list
- Theme-aware screenshot (switch image based on theme)

#### B. Preset Protocol Library

**Layout**: Grid of 3-4 stack cards

```typescript
const protocolStacks = [
  {
    name: 'Performance Stack',
    peptides: ['BPC-157', 'TB-500', 'Ipamorelin'],
    duration: '8-12 weeks',
    benefit: 'Enhance athletic performance and recovery',
    icon: <Zap />
  },
  {
    name: 'Recovery Stack',
    peptides: ['BPC-157', 'GHK-Cu', 'Thymosin Beta-4'],
    duration: '4-8 weeks',
    benefit: 'Accelerate healing and tissue repair',
    icon: <Heart />
  },
  {
    name: 'Glow Stack',
    peptides: ['GHK-Cu', 'Epitalon', 'NAD+'],
    duration: '12 weeks',
    benefit: 'Skin rejuvenation and anti-aging',
    icon: <Sparkles />
  },
  {
    name: 'Longevity Stack',
    peptides: ['NMN', 'Resveratrol', 'NAD+'],
    duration: 'Ongoing',
    benefit: 'Cellular health and longevity support',
    icon: <Clock />
  }
];
```

**Card Design**:
```tsx
<Card className="glass hover:shadow-xl transition-all">
  <CardHeader>
    <div className="flex items-center gap-3">
      {icon}
      <h4>{name}</h4>
    </div>
  </CardHeader>
  <CardContent>
    <div className="flex flex-wrap gap-2 mb-3">
      {peptides.map(p => <Badge key={p}>{p}</Badge>)}
    </div>
    <p className="text-sm text-muted-foreground">{benefit}</p>
    <p className="text-xs text-primary mt-2">Duration: {duration}</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline" size="sm">View in App</Button>
  </CardFooter>
</Card>
```

#### C. Vendor Price Tracker

**Layout**: Table or card list showing sample vendor listings

```tsx
<div className="space-y-4">
  <h3>Compare Vendor Prices</h3>
  <div className="glass rounded-lg overflow-hidden">
    <table className="w-full">
      <thead>
        <tr className="border-b border-border">
          <th>Product</th>
          <th>Vendor</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {sampleListings.map(listing => (
          <tr key={listing.id} className="border-b border-border/50">
            <td>{listing.product}</td>
            <td>{listing.vendor}</td>
            <td className="text-primary font-bold">${listing.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  <p className="text-sm text-muted-foreground">
    Compare prices from 50+ verified vendors in the app
  </p>
  <Button>View All Prices</Button>
</div>
```

**Sample Data**:
```typescript
const sampleListings = [
  { id: 1, product: 'BPC-157 (5mg)', vendor: 'VendorX', price: 45.99 },
  { id: 2, product: 'TB-500 (5mg)', vendor: 'VendorY', price: 52.99 },
  { id: 3, product: 'Semaglutide (2mg)', vendor: 'VendorZ', price: 89.99 },
  { id: 4, product: 'GHK-Cu (50mg)', vendor: 'VendorA', price: 38.99 },
  { id: 5, product: 'Ipamorelin (5mg)', vendor: 'VendorB', price: 42.99 }
];
```


### 6. Stripe Checkout Integration

**Purpose**: Process payments for shop products

**Flow**:
1. User clicks "Proceed to Checkout" from cart
2. Frontend creates Stripe Checkout session via Supabase Edge Function
3. User redirected to Stripe-hosted checkout page
4. After payment, user redirected to order confirmation page
5. Webhook updates order status in database

**Implementation**:

#### Supabase Edge Function: `create-checkout-session`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  try {
    const { cartItems, userId } = await req.json();
    
    // Create line items from cart
    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product_name,
          images: item.product_image ? [item.product_image] : [],
        },
        unit_amount: Math.round(item.product_price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/cart`,
      metadata: {
        userId,
      },
    });
    
    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

#### Frontend Hook: `useCheckout`

```typescript
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const useCheckout = () => {
  return useMutation({
    mutationFn: async (cartItems: CartItem[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Call edge function to create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { cartItems, userId: user.id },
      });
      
      if (error) throw error;
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');
      
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      
      if (stripeError) throw stripeError;
    },
    onError: (error) => {
      toast.error('Checkout failed: ' + error.message);
    },
  });
};
```

#### Order Confirmation Page

**Route**: `/order-confirmation`

**Query Params**: `?session_id={CHECKOUT_SESSION_ID}`

```tsx
const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const { data: session, isLoading } = useQuery({
    queryKey: ['checkout-session', sessionId],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke('get-checkout-session', {
        body: { sessionId },
      });
      return data;
    },
    enabled: !!sessionId,
  });
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
      <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Thank you for your purchase. Your order number is #{session.orderId}
      </p>
      <div className="glass rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Order Details</h2>
        {/* Order items list */}
      </div>
      <div className="flex gap-4 justify-center">
        <Button onClick={() => navigate('/store')}>Continue Shopping</Button>
        <Button variant="outline" onClick={() => navigate('/orders')}>
          View Orders
        </Button>
      </div>
    </div>
  );
};
```


## Data Models

### Cart Item (Existing - Enhanced)

```typescript
interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
}
```

### Pricing Plan

```typescript
interface PricingPlan {
  id: string;
  name: string;
  productIds: {
    monthly?: string;
    yearly?: string;
    annual?: string;
  };
  prices: {
    monthly?: number;
    yearly?: number;
    annual?: number;
  };
  entitlement: string;
  badge?: 'popular' | 'limited';
  userLimit?: number;
  features: string[];
  savings?: {
    yearly?: number; // Amount saved vs monthly
  };
}
```

### Protocol Stack

```typescript
interface ProtocolStack {
  id: string;
  name: string;
  peptides: string[];
  duration: string;
  benefit: string;
  icon: ReactNode;
  category: 'performance' | 'recovery' | 'aesthetic' | 'longevity';
}
```

### Vendor Listing (Sample Data)

```typescript
interface VendorListing {
  id: string;
  product: string;
  vendor: string;
  price: number;
  inStock: boolean;
  rating?: number;
}
```

### Founding User Counter

```typescript
interface FoundingUserCounter {
  current: number;
  total: number;
  lastUpdated?: number;
}
```


## Error Handling

### Stripe Checkout Errors

```typescript
const handleCheckoutError = (error: Error) => {
  if (error.message.includes('authentication')) {
    toast.error('Please sign in to complete checkout');
    navigate('/auth');
  } else if (error.message.includes('network')) {
    toast.error('Network error. Please check your connection and try again.');
  } else if (error.message.includes('Stripe')) {
    toast.error('Payment processing error. Please try again or contact support.');
  } else {
    toast.error('Checkout failed. Please try again.');
  }
};
```

### Cart Operations Errors

```typescript
const handleCartError = (error: Error, operation: 'add' | 'update' | 'remove') => {
  const messages = {
    add: 'Failed to add item to cart',
    update: 'Failed to update quantity',
    remove: 'Failed to remove item',
  };
  
  toast.error(messages[operation], {
    description: 'Please try again or refresh the page',
    action: {
      label: 'Retry',
      onClick: () => retryOperation(),
    },
  });
};
```

### Firebase Connection Errors

```typescript
// In useFoundingUserCounter hook
const handleFirebaseError = (error: Error) => {
  console.error('Firebase counter error:', error);
  // Fallback to default values
  return DEFAULT_COUNTER;
};
```

### Loading States

All async operations must show loading states:
- Cart operations: Button spinner
- Checkout: Full-page loading overlay
- Product loading: Skeleton cards
- Counter loading: Animated placeholder


## Testing Strategy

### Unit Tests

**Components to Test**:
- `QuantitySelector`: Min/max bounds, increment/decrement
- `PricingComparison`: Billing toggle, price calculations, savings display
- `FoundingUserCounter`: Percentage calculation, animation triggers
- `CartSummary`: Tax calculation, total calculation

**Utilities to Test**:
- Price formatting functions
- Percentage calculations
- Date/time formatting for orders

### Integration Tests

**User Flows**:
1. Browse products → Add to cart → View cart → Checkout
2. Filter products by category → Add filtered product to cart
3. Update cart quantity → Verify total updates
4. Remove cart item → Verify cart updates
5. Empty cart → See empty state → Navigate to store

### Accessibility Tests

**Checklist**:
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible on all focusable elements
- [ ] ARIA labels present on icon buttons
- [ ] Screen reader announcements for cart updates
- [ ] Color contrast ratios meet WCAG AA (4.5:1)
- [ ] Alt text on all images
- [ ] Form labels associated with inputs

### Performance Tests

**Metrics**:
- Lighthouse score ≥90 on all pages
- First Contentful Paint <1.5s
- Largest Contentful Paint <2.5s
- Cumulative Layout Shift <0.1
- Time to Interactive <3.5s

**Optimization Checklist**:
- [ ] Images lazy loaded
- [ ] Code split by route
- [ ] React Query caching configured
- [ ] Debounced search input
- [ ] Optimistic UI updates for cart


## Responsive Design Breakpoints

### Mobile (<640px)
- Single column layouts
- Horizontal scrolling for pricing cards
- Stacked feature blocks
- Full-width product cards
- Sticky cart summary at bottom
- Hamburger navigation menu

### Tablet (640px - 1024px)
- 2-column product grid
- 2-column feature blocks
- Side-by-side cart items and summary
- Expanded navigation with dropdowns

### Desktop (≥1024px)
- 3-column product grid
- 2×2 feature grid
- 5-column pricing table
- Sidebar cart summary (sticky)
- Full navigation with all links visible

### Large Desktop (≥1280px)
- 4-column product grid (optional)
- Wider max-width containers (1280px)
- More whitespace and padding

## Theme Implementation

### CSS Variables (Existing)

All components use CSS variables defined in `index.css`:

```css
:root {
  --primary: 180 100% 50%; /* Cyan */
  --background: 222 47% 11%;
  --foreground: 213 31% 91%;
  --muted: 223 47% 11%;
  --muted-foreground: 215.4 16.3% 56.9%;
  /* ... other variables */
}

.light {
  --primary: 180 100% 40%;
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  /* ... other variables */
}
```

### Theme-Aware Components

All new components must:
1. Use Tailwind classes that reference CSS variables (e.g., `bg-background`, `text-foreground`)
2. Avoid hardcoded colors
3. Test in both light and dark modes
4. Use `useTheme()` hook when conditional logic needed

### Glass Effect

Reuse existing glass effect for cards:

```css
.glass {
  @apply bg-background/50 backdrop-blur-lg border border-border/50;
}
```


## Environment Variables

### Required New Variables

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Stripe Product IDs (for pricing plans)
VITE_STRIPE_BASIC_MONTHLY=price_...
VITE_STRIPE_BASIC_YEARLY=price_...
VITE_STRIPE_PRO_MONTHLY=price_...
VITE_STRIPE_PRO_YEARLY=price_...
VITE_STRIPE_PRO_PLUS_MONTHLY=price_...
VITE_STRIPE_PRO_PLUS_YEARLY=price_...
VITE_STRIPE_ELITE_ANNUAL=price_...

# App URLs
VITE_APP_URL=http://localhost:5173
```

### Existing Variables (Maintained)

```env
# Supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Firebase (for founding user counter)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
```

## File Structure

```
src/
├── components/
│   ├── HowItWorks.tsx (NEW)
│   ├── FoundingUserCounter.tsx (NEW)
│   ├── PricingComparison.tsx (NEW - replaces Pricing.tsx)
│   ├── FeaturePreviews.tsx (NEW)
│   │   ├── TrackerDemo.tsx
│   │   ├── ProtocolLibrary.tsx
│   │   └── VendorPriceTracker.tsx
│   ├── ProductCategoryFilters.tsx (NEW)
│   ├── QuantitySelector.tsx (NEW)
│   ├── CartItemCard.tsx (NEW)
│   └── CartSummary.tsx (NEW)
├── pages/
│   ├── Cart.tsx (NEW)
│   ├── OrderConfirmation.tsx (NEW)
│   └── Store.tsx (ENHANCED)
├── hooks/
│   ├── useCheckout.ts (NEW)
│   ├── useCartMutations.ts (NEW)
│   └── useFoundingUserCounter.ts (EXISTING)
├── lib/
│   └── stripe.ts (NEW)
└── types/
    └── pricing.ts (NEW)

supabase/functions/
├── create-checkout-session/ (NEW)
│   └── index.ts
└── get-checkout-session/ (NEW)
    └── index.ts
```

## Deployment Checklist

### Pre-Deployment

- [ ] Configure Stripe products in Stripe Dashboard
- [ ] Set up Stripe webhook endpoint
- [ ] Add environment variables to hosting platform
- [ ] Test checkout flow in Stripe test mode
- [ ] Verify Firebase Realtime Database rules
- [ ] Test all responsive breakpoints
- [ ] Run accessibility audit
- [ ] Run Lighthouse performance audit

### Post-Deployment

- [ ] Switch Stripe to live mode
- [ ] Monitor error logs for checkout issues
- [ ] Verify founding user counter updates
- [ ] Test email notifications (if implemented)
- [ ] Monitor cart abandonment rates
- [ ] Track conversion metrics

