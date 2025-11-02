# Design Document: PeptiSync Website Redesign & Optimization

## Overview

This document outlines the technical design for redesigning the PeptiSync website with a modern wellness-tech aesthetic, implementing e-commerce functionality, and optimizing for memory efficiency and performance on Render.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React SPA)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Homepage   │  │  Shop Page   │  │  Cart/Checkout│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌────────▼────────┐   ┌───────▼────────┐
│   Supabase     │   │    Firebase     │   │     Stripe     │
│   (Auth/DB)    │   │  (Realtime DB)  │   │   (Payments)   │
└────────────────┘   └─────────────────┘   └────────────────┘
```

### Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: React Query, Context API
- **Backend**: Supabase (PostgreSQL), Firebase Realtime Database
- **Payments**: Stripe Checkout
- **Deployment**: Render (Static Site)
- **Email**: Resend or SendGrid

## Design System

### Color Palette

```typescript
const colors = {
  // Primary - Wellness Green
  primary: {
    50: '#F0F9F4',
    100: '#D9F2E3',
    500: '#7FB069', // Main accent
    600: '#6A9657',
    700: '#557C45',
  },
  
  // Secondary - Soft Blue
  secondary: {
    50: '#EBF5FB',
    100: '#D6EAF8',
    500: '#6B9BD1', // Accent
    600: '#5A84B8',
    700: '#496D9F',
  },
  
  // Accent - Warm Coral
  accent: {
    50: '#FFF3F0',
    100: '#FFE7E0',
    500: '#FF8B7B', // Highlight
    600: '#FF6B57',
    700: '#FF4B33',
  },
  
  // Neutrals
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: {
    primary: '#222222',
    secondary: '#6B7280',
    muted: '#9CA3AF',
  },
  
  // Dark (Header/Footer only)
  dark: {
    navy: '#1A1F2E',
    charcoal: '#2C3E50',
  },
};
```

### Typography

```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'Poppins', 'Sora', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};
```

### Spacing & Layout

```typescript
const spacing = {
  section: '5rem',      // 80px between sections
  container: '1280px',  // Max content width
  gutter: '1.5rem',     // 24px side padding
  card: '1.5rem',       // 24px card padding
  gap: {
    xs: '0.5rem',       // 8px
    sm: '1rem',         // 16px
    md: '1.5rem',       // 24px
    lg: '2rem',         // 32px
    xl: '3rem',         // 48px
  },
};
```

### Shadows

```typescript
const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 2px 8px rgba(0, 0, 0, 0.08)',
  lg: '0 4px 16px rgba(0, 0, 0, 0.12)',
  xl: '0 8px 24px rgba(0, 0, 0, 0.16)',
};
```

## Components and Interfaces

### Homepage Components

#### 1. Hero Section
```typescript
interface HeroProps {
  tagline: string;
  description: string;
  ctaButtons: {
    primary: { text: string; href: string };
    secondary: { text: string; href: string };
  };
  appMockups: {
    ios: string;
    android: string;
  };
}
```

#### 2. How It Works Section
```typescript
interface HowItWorksStep {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface HowItWorksProps {
  steps: HowItWorksStep[];
}
```

#### 3. Feature Preview
```typescript
interface FeaturePreview {
  id: string;
  title: string;
  description: string;
  demoComponent: React.ComponentType;
  image?: string;
}
```

#### 4. Founding User Counter
```typescript
interface FoundingUserCounterProps {
  current: number;
  total: number;
  firebaseRef: string;
}
```

#### 5. Pricing Comparison
```typescript
interface PricingTier {
  name: string;
  price: number;
  period: 'month' | 'year' | 'lifetime';
  features: {
    name: string;
    included: boolean;
    description?: string;
  }[];
  cta: {
    text: string;
    href: string;
    variant: 'primary' | 'secondary';
  };
  popular?: boolean;
}
```

### Shop Components

#### 1. Product Card
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: 'labels' | 'cases' | 'accessories' | 'merch';
  inStock: boolean;
  variants?: {
    name: string;
    options: string[];
  }[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}
```

#### 2. Shopping Cart
```typescript
interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

interface CartActions {
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}
```

#### 3. Checkout Flow
```typescript
interface CheckoutData {
  cart: CartState;
  customer: {
    email: string;
    name: string;
  };
  shipping: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}
```

## Data Models

### Firebase Schema

```typescript
// Realtime Database Structure
interface FirebaseSchema {
  vendorPrices: {
    [peptideId: string]: {
      [vendorId: string]: {
        price: number;
        url: string;
        lastUpdated: number;
        submittedBy: string;
      };
    };
  };
  
  foundingUserCounter: {
    current: number;
    total: number;
    lastUpdated: number;
  };
  
  contactSubmissions: {
    [submissionId: string]: {
      name: string;
      email: string;
      subject: string;
      message: string;
      timestamp: number;
      status: 'new' | 'read' | 'responded';
    };
  };
}
```

### Supabase Schema (Existing)

```sql
-- Products table for shop
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  variants JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  stripe_payment_id TEXT,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  shipping DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Memory Optimization Strategy

### 1. Component Lifecycle Management

```typescript
// Cleanup pattern for event listeners
useEffect(() => {
  const handleScroll = () => {
    // Handle scroll
  };
  
  window.addEventListener('scroll', handleScroll);
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);

// Cleanup pattern for subscriptions
useEffect(() => {
  const unsubscribe = firebase
    .ref('foundingUserCounter')
    .on('value', (snapshot) => {
      setCounter(snapshot.val());
    });
  
  return () => {
    unsubscribe();
  };
}, []);
```

### 2. Image Optimization

```typescript
// Lazy loading images
const OptimizedImage: React.FC<{src: string; alt: string}> = ({ src, alt }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={(e) => {
        // Release memory after load if needed
        URL.revokeObjectURL(src);
      }}
    />
  );
};
```

### 3. Data Caching Strategy

```typescript
// React Query configuration with memory limits
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Limit cache size
queryClient.setQueryDefaults(['products'], {
  cacheTime: 5 * 60 * 1000,
});
```

### 4. Bundle Size Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', '@radix-ui/react-dialog'],
          'firebase': ['firebase/app', 'firebase/database'],
          'stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
        },
      },
    },
    chunkSizeWarningLimit: 500, // 500kb
  },
});
```

### 5. Memory Leak Detection

```typescript
// Development-only memory profiler
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    if (performance.memory) {
      console.log({
        usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      });
    }
  }, 10000);
}
```

## Integration Points

### Stripe Integration

```typescript
// Stripe checkout session creation
const createCheckoutSession = async (cart: CartState) => {
  const lineItems = cart.items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.product.name,
        images: [item.product.images[0]],
      },
      unit_amount: Math.round(item.product.price * 100),
    },
    quantity: item.quantity,
  }));
  
  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: `${window.location.origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${window.location.origin}/cart`,
  });
  
  return session;
};
```

### Firebase Integration

```typescript
// Firebase realtime updates
const useFoundingUserCounter = () => {
  const [counter, setCounter] = useState({ current: 0, total: 500 });
  
  useEffect(() => {
    const counterRef = firebase.database().ref('foundingUserCounter');
    
    const unsubscribe = counterRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCounter(data);
      }
    });
    
    return () => {
      counterRef.off('value', unsubscribe);
    };
  }, []);
  
  return counter;
};
```

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Memory Usage**: < 50MB baseline, < 100MB under load
- **Bundle Size**: < 500KB initial, < 1MB total
- **Lighthouse Score**: > 90 (all categories)

## Testing Strategy

### Memory Testing
1. Chrome DevTools Memory Profiler
2. Heap snapshots before/after user sessions
3. Performance monitoring on Render
4. Load testing with Artillery or k6

### Performance Testing
1. Lighthouse CI in deployment pipeline
2. WebPageTest for real-world metrics
3. Bundle analyzer for size monitoring

### Accessibility Testing
1. WAVE browser extension
2. axe DevTools
3. Screen reader testing (NVDA, JAWS)
4. Keyboard navigation testing

## Deployment Configuration

### Render Settings
```yaml
# render.yaml
services:
  - type: web
    name: peptisync-redesign
    env: static
    buildCommand: npm ci && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: NODE_ENV
        value: production
      - key: VITE_SUPABASE_URL
        sync: false
      - key: VITE_FIREBASE_API_KEY
        sync: false
      - key: VITE_STRIPE_PUBLISHABLE_KEY
        sync: false
    headers:
      - path: /*
        name: Cache-Control
        value: public, max-age=0, must-revalidate
      - path: /assets/*
        name: Cache-Control
        value: public, max-age=31536000, immutable
```

## Security Considerations

1. **API Keys**: All sensitive keys in environment variables
2. **CORS**: Configured for Stripe and Firebase domains
3. **CSP**: Content Security Policy headers
4. **Input Validation**: Sanitize all user inputs
5. **Rate Limiting**: Implement on contact form and checkout

