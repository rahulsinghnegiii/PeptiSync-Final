# Design Document

## Overview

This design document outlines the technical architecture and implementation strategy for completing the PeptiSync e-commerce platform. The system is built on a modern React + TypeScript stack with Supabase as the backend-as-a-service provider, offering authentication, database, storage, and real-time capabilities.

The design follows a component-based architecture with clear separation of concerns, utilizing React Query for data fetching and caching, React Router for navigation, and shadcn/ui for consistent UI components. The application implements role-based access control (RBAC) with three tiers: user, moderator, and admin.

### Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui (Radix UI primitives), Tailwind CSS
- **State Management**: React Context API, React Query (TanStack Query)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Payment Processing**: Stripe (to be integrated)
- **Email**: Supabase Edge Functions with Resend/SendGrid

## Architecture

### High-Level Architecture

The application follows a three-tier architecture:

1. **Client Layer**: React SPA with routing, state management, and UI components
2. **Backend Services**: Supabase providing database, authentication, storage, and serverless functions
3. **External Services**: Stripe for payments, email service for notifications, CDN for assets

### Database Schema

The application uses PostgreSQL through Supabase with the following core tables:

- **profiles**: User profile information and membership tiers
- **products**: Product catalog with pricing and inventory
- **cart_items**: Shopping cart items per user
- **orders**: Order records with status tracking
- **order_items**: Line items for each order
- **reviews**: Product reviews and ratings
- **user_roles**: Role-based access control

All tables implement Row Level Security (RLS) policies to ensure data security.

## Components and Interfaces

### Page Components

#### 1. Enhanced Checkout Page (`/checkout`)

**Purpose**: Complete purchase flow with shipping and payment

**Components**:
- `CheckoutStepper`: Multi-step progress indicator (shipping → payment → confirmation)
- `ShippingForm`: Address and contact information with Zod validation
- `PaymentForm`: Stripe payment element integration
- `OrderSummary`: Cart items and total calculation with shipping
- `OrderConfirmation`: Success page with order details and tracking

**Flow**:
1. User reviews cart items and total
2. User enters shipping information (validated)
3. User enters payment details via Stripe Elements
4. System creates Stripe payment intent
5. On successful payment, create order and order_items records
6. Clear cart and redirect to confirmation page
7. Send confirmation email via Edge Function

#### 2. Enhanced Store Page (`/store`)

**Purpose**: Browse, search, and filter products

**New Components**:
- `ProductFilters`: Category, price range, rating filters
- `ProductSearch`: Real-time search with debouncing
- `ProductSort`: Sort by price, name, rating
- `ProductCard`: Enhanced with reviews and stock status
- `ProductQuickView`: Modal for quick product details

#### 3. Product Detail Page (`/store/:productId`)

**Purpose**: Detailed product view with reviews

**Components**:
- `ProductGallery`: Image carousel with zoom capability
- `ProductInfo`: Name, price, description, stock availability
- `AddToCartButton`: Quantity selector and add to cart
- `ProductReviews`: List of reviews with pagination
- `ReviewForm`: Submit review (only if purchased)
- `RelatedProducts`: Recommendations based on category

#### 4. Enhanced Dashboard (`/dashboard`)

**New Features**:
- Real-time cart updates using Supabase subscriptions
- Order history with status tracking
- Quick reorder functionality
- Saved addresses for faster checkout
- Membership tier benefits display

#### 5. Order Tracking Page (`/orders/:orderId`)

**Purpose**: Detailed order tracking and status

**Components**:
- `OrderTimeline`: Visual status progression
- `OrderItems`: List of purchased items
- `ShippingInfo`: Delivery address and tracking number
- `OrderActions`: Cancel, return, contact support buttons

#### 6. Enhanced Settings Page (`/settings`)

**Tabs**:
- **Profile**: Edit name, email, phone, avatar
- **Security**: Change password, 2FA settings
- **Addresses**: Manage shipping addresses
- **Preferences**: Email notifications, theme
- **Membership**: View tier and upgrade options
- **Privacy**: Data export, account deletion

#### 7. Enhanced Admin Panel (`/admin`)

**Tabs**:
- **Dashboard**: Analytics and metrics with charts
- **Products**: CRUD operations with image upload
- **Orders**: View, update status, add tracking numbers
- **Users**: View users, manage roles
- **Reviews**: Moderate reviews, flag inappropriate content
- **Analytics**: Revenue charts, product performance metrics

### Shared Components

#### CartDrawer (Enhanced)

**New Features**:
- Quantity adjustment with +/- buttons
- Remove item confirmation dialog
- Real-time total calculation
- Free shipping progress bar
- Empty cart state with CTA to store

#### Navigation (Enhanced)

**New Features**:
- Cart item count badge
- User avatar dropdown menu
- Search bar in header
- Mega menu for product categories

### Custom Hooks

```typescript
// Cart Management
const useCart = () => {
  const addToCart = useMutation(/* ... */);
  const updateQuantity = useMutation(/* ... */);
  const removeItem = useMutation(/* ... */);
  const clearCart = useMutation(/* ... */);
  return { addToCart, updateQuantity, removeItem, clearCart };
};

// Products with filters
const useProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 5 * 60 * 1000,
  });
};

// Product search
const useProductSearch = (query: string) => {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => searchProducts(query),
    enabled: query.length > 2,
  });
};

// Reviews
const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetchReviews(productId),
  });
};
```

## Data Models

### TypeScript Interfaces

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  category: string;
  is_active: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  quantity: number;
  created_at: string;
}

interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: ShippingAddress;
  tracking_number?: string;
  notes?: string;
  payment_intent_id: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}
```

### Form Validation Schemas

```typescript
import { z } from 'zod';

// Shipping Form
const shippingSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
});

// Product Form (Admin)
const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  stock_quantity: z.number().int().nonnegative('Stock must be non-negative'),
  category: z.string().min(1, 'Category is required'),
  image: z.instanceof(File).optional(),
});

// Review Form
const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(500),
});
```

## Error Handling

### API Error Handling

```typescript
const handleSupabaseError = (error: PostgrestError) => {
  if (error.code === '23505') {
    return 'This item already exists';
  }
  if (error.code === '23503') {
    return 'Referenced item not found';
  }
  return error.message || 'An unexpected error occurred';
};

const handleStripeError = (error: StripeError) => {
  switch (error.type) {
    case 'card_error':
      return error.message;
    case 'validation_error':
      return 'Invalid payment information';
    default:
      return 'Payment processing failed';
  }
};
```

### Toast Notifications

Use `sonner` for consistent user feedback:
- **Success**: Green toast for successful operations
- **Error**: Red toast with actionable error messages
- **Info**: Blue toast for informational messages
- **Loading**: Toast with spinner for async operations

## Testing Strategy

### Unit Tests

**Tools**: Vitest, React Testing Library

**Coverage**:
- Utility functions (validation, formatting, calculations)
- Custom hooks (useCart, useOrders, etc.)
- Form validation schemas
- Data transformation functions

### Integration Tests

**Coverage**:
- Complete user flows (signup → browse → add to cart → checkout)
- Admin workflows (create product → manage orders)
- Authentication flows
- Payment processing (with Stripe test mode)

### Performance Testing

**Metrics**:
- Lighthouse scores (Performance, Accessibility, Best Practices, SEO)
- Core Web Vitals (LCP, FID, CLS)
- Bundle size analysis
- Database query performance

## Payment Integration

### Stripe Setup

**Flow**:
1. User submits checkout
2. Frontend calls Edge Function to create payment intent
3. Edge Function creates Stripe payment intent and returns client secret
4. Frontend confirms payment with Stripe
5. On success, create order in database
6. Send confirmation email

**Edge Function** (`create-payment-intent`):
```typescript
import Stripe from 'stripe';

export const handler = async (req: Request) => {
  const { amount, currency = 'usd' } = await req.json();
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    automatic_payment_methods: { enabled: true },
  });
  
  return new Response(
    JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
```

## Email Notifications

### Supabase Edge Function

**Function**: `send-email`

**Templates**:
1. Welcome email (on signup)
2. Order confirmation (on order creation)
3. Order status update (on status change)
4. Shipping notification (when tracking added)
5. Password reset (on request)

**Implementation**:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOrderConfirmation = async (order: Order, user: Profile) => {
  await resend.emails.send({
    from: 'PeptiSync <orders@peptisync.com>',
    to: user.email,
    subject: `Order Confirmation #${order.id.slice(0, 8)}`,
    html: renderOrderConfirmationTemplate(order, user),
  });
};
```

## File Storage

### Supabase Storage Buckets

**Buckets**:
1. `avatars`: User profile pictures (public)
2. `products`: Product images (public)
3. `documents`: Order invoices, receipts (private)

**Upload Flow**:
```typescript
const uploadProductImage = async (file: File, productId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}-${Date.now()}.${fileExt}`;
  const filePath = `products/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('products')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(filePath);
  
  return publicUrl;
};
```

## Real-time Features

### Cart Synchronization

Use Supabase real-time subscriptions to sync cart across devices:

```typescript
useEffect(() => {
  if (!user) return;
  
  const subscription = supabase
    .channel('cart-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cart_items',
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        queryClient.invalidateQueries(['cart', user.id]);
      }
    )
    .subscribe();
  
  return () => subscription.unsubscribe();
}, [user]);
```

## Security Considerations

### Authentication

- Use Supabase Auth with email/password
- Implement email verification
- Add password strength requirements
- Support password reset flow

### Authorization

- Enforce RLS policies on all tables
- Use security definer functions for role checks
- Validate user permissions on frontend and backend

### Payment Security

- Never store raw credit card numbers
- Use Stripe's PCI-compliant payment elements
- Implement 3D Secure for card payments
- Use webhook signatures to verify Stripe events

## Performance Optimization

### Code Splitting

```typescript
// Lazy load pages
const Admin = lazy(() => import('./pages/Admin'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Store = lazy(() => import('./pages/Store'));
```

### Image Optimization

- Use WebP format with JPEG fallback
- Implement responsive images with `srcset`
- Lazy load images below the fold
- Serve images from CDN

### Database Optimization

**Indexes**:
```sql
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
```

### Caching Strategy

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

## Accessibility

### WCAG 2.1 AA Compliance

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators on all interactive elements
- Color contrast ratio of at least 4.5:1
- Alt text for all images
- Form labels and error messages

## Deployment

### Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret

# Email
RESEND_API_KEY=your_resend_key

# App
VITE_APP_URL=https://peptisync.com
```

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
});
```

## Future Enhancements

### Phase 2 Features

1. **Wishlist**: Save products for later
2. **Product Comparisons**: Compare multiple products
3. **Advanced Search**: Filters, facets, autocomplete
4. **Loyalty Program**: Points and rewards system
5. **Subscription Orders**: Recurring purchases
6. **Gift Cards**: Purchase and redeem gift cards
7. **Multi-currency**: Support international customers
8. **Live Chat**: Customer support integration
9. **Product Recommendations**: AI-powered suggestions
10. **Mobile App**: React Native mobile application
