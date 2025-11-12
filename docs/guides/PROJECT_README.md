# PeptiSync Nova - E-Commerce Platform

<div align="center">

![PeptiSync Logo](public/placeholder.svg)

**Advanced Peptide Tracking & E-Commerce Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.58-green.svg)](https://supabase.com/)

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Documentation](#documentation) • [Deployment](#deployment)

</div>

---

## 📋 Overview

PeptiSync Nova is a modern, full-featured e-commerce platform built with React, TypeScript, and Supabase. It provides a complete solution for selling peptide products with advanced tracking capabilities, secure payment processing, and comprehensive admin tools.

### Key Highlights

- 🛍️ **Full E-Commerce** - Complete shopping cart, checkout, and order management
- 💳 **Stripe Integration** - Secure payment processing with PCI compliance
- 📧 **Email Notifications** - Automated emails for orders, shipping, and updates
- 👥 **Role-Based Access** - User, Moderator, and Admin roles with granular permissions
- 📊 **Analytics Dashboard** - Real-time insights into sales, orders, and performance
- ⭐ **Product Reviews** - Customer reviews with verified purchase badges
- 🔒 **Enterprise Security** - CSRF protection, XSS prevention, RLS policies
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- ♿ **Accessible** - WCAG 2.1 AA compliant
- ⚡ **High Performance** - Code splitting, lazy loading, optimized assets

---

## ✨ Features

### For Customers

- **Product Browsing**
  - Advanced search with full-text indexing
  - Multi-criteria filtering (category, price, rating)
  - Product sorting and pagination
  - Detailed product pages with image galleries

- **Shopping Experience**
  - Real-time cart synchronization
  - Free shipping threshold indicator
  - Saved shipping addresses
  - Order history and tracking

- **Account Management**
  - Secure authentication with email verification
  - Profile customization with avatar upload
  - Password management
  - Email preferences

- **Reviews & Ratings**
  - Write reviews for purchased products
  - Star ratings and detailed comments
  - Verified purchase badges

### For Administrators

- **Product Management**
  - CRUD operations for products
  - Image upload with validation
  - Inventory tracking
  - Low stock alerts

- **Order Management**
  - View all orders
  - Update order status
  - Add tracking numbers
  - Order notes and history

- **Analytics**
  - Revenue tracking
  - Sales trends
  - Top-selling products
  - Customer insights

- **User Management**
  - View all users
  - Manage roles and permissions
  - Activity monitoring

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** React 18.3 with TypeScript
- **Build Tool:** Vite 5.4
- **Routing:** React Router v6
- **State Management:** React Query (TanStack Query)
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form + Zod validation
- **Animations:** Framer Motion

### Backend

- **BaaS:** Supabase
  - PostgreSQL database
  - Authentication
  - Storage
  - Real-time subscriptions
  - Edge Functions (Deno)

### Third-Party Services

- **Payments:** Stripe
- **Email:** Resend
- **Hosting:** Vercel / Render / Netlify

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account (test mode)
- Resend account (optional, for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd peptisync-nova-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   VITE_APP_URL=http://localhost:8080
   ```

4. **Set up Supabase**
   ```bash
   # Login to Supabase
   npx supabase login
   
   # Link your project
   npx supabase link --project-ref your-project-id
   
   # Apply migrations
   npx supabase db push
   
   # Deploy Edge Functions
   npx supabase functions deploy create-payment-intent
   npx supabase functions deploy send-email
   npx supabase functions deploy check-permissions
   
   # Set secrets
   npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
   npx supabase secrets set RESEND_API_KEY=re_...
   ```

5. **Create storage buckets**
   
   In Supabase Dashboard → Storage, create:
   - `avatars` (public)
   - `products` (public)
   - `documents` (private)

6. **Start development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:8080](http://localhost:8080)

---

## 📚 Documentation

### Core Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide for Vercel, Render, and Netlify
- **[SECURITY.md](SECURITY.md)** - Security implementation details and best practices
- **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** - Comprehensive testing checklist
- **[.env.example](.env.example)** - Environment variables reference

### Implementation Guides

- **[CHECKOUT_IMPLEMENTATION_SUMMARY.md](CHECKOUT_IMPLEMENTATION_SUMMARY.md)** - Checkout flow details
- **[EMAIL_NOTIFICATION_IMPLEMENTATION.md](EMAIL_NOTIFICATION_IMPLEMENTATION.md)** - Email system setup
- **[ACCESSIBILITY_IMPLEMENTATION_SUMMARY.md](ACCESSIBILITY_IMPLEMENTATION_SUMMARY.md)** - Accessibility features
- **[PERFORMANCE_OPTIMIZATION_GUIDE.md](PERFORMANCE_OPTIMIZATION_GUIDE.md)** - Performance tips

### Database

- **[supabase/MIGRATION_GUIDE.md](supabase/MIGRATION_GUIDE.md)** - Database migration instructions
- **[APPLY_MIGRATION.md](APPLY_MIGRATION.md)** - Quick migration guide

---

## 🏗️ Project Structure

```
peptisync-nova-main/
├── src/
│   ├── components/          # React components
│   │   ├── admin/          # Admin panel components
│   │   ├── checkout/       # Checkout flow components
│   │   ├── settings/       # User settings components
│   │   └── ui/             # shadcn/ui components
│   ├── contexts/           # React contexts (Auth, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # Third-party integrations
│   │   └── supabase/       # Supabase client and types
│   ├── lib/                # Utility functions
│   │   ├── authorization.ts
│   │   ├── csrfProtection.ts
│   │   ├── inputSanitization.ts
│   │   ├── rateLimiter.ts
│   │   └── ...
│   ├── pages/              # Page components
│   └── main.tsx            # Application entry point
├── supabase/
│   ├── functions/          # Edge Functions
│   │   ├── create-payment-intent/
│   │   ├── send-email/
│   │   └── check-permissions/
│   └── migrations/         # Database migrations
├── public/                 # Static assets
├── .env.example           # Environment variables template
├── vercel.json            # Vercel configuration
├── render.yaml            # Render configuration
├── netlify.toml           # Netlify configuration
└── package.json           # Dependencies
```

---

## 🔐 Security

PeptiSync implements enterprise-grade security:

- ✅ **Authentication** - Email verification, password strength requirements
- ✅ **Authorization** - Role-based access control with RLS policies
- ✅ **CSRF Protection** - Token-based protection for all forms
- ✅ **XSS Prevention** - Input sanitization and output encoding
- ✅ **SQL Injection** - Parameterized queries and input validation
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **Session Management** - Automatic timeout and secure storage
- ✅ **Security Headers** - CSP, X-Frame-Options, etc.

See [SECURITY.md](SECURITY.md) for complete details.

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Testing Checklist

Use [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) for comprehensive testing before deployment.

### Test Accounts

**Admin Account:**
- Email: admin@peptisync.com
- Password: (set during first deployment)

**Test Payment:**
- Card: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits

---

## 📦 Deployment

### Quick Deploy

**Vercel (Recommended)**
```bash
npm i -g vercel
vercel
```

**Render**
```bash
# Push render.yaml to repository
# Connect repository in Render dashboard
```

**Netlify**
```bash
npm i -g netlify-cli
netlify deploy --prod
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 🎨 Customization

### Branding

Update branding in:
- `index.html` - Meta tags and title
- `src/components/Navigation.tsx` - Logo and navigation
- `tailwind.config.ts` - Colors and theme
- `src/index.css` - Custom styles

### Features

Enable/disable features in:
- `src/lib/config.ts` - Feature flags
- Environment variables - Service integrations

---

## 📈 Performance

### Optimization Features

- ✅ Code splitting with lazy loading
- ✅ Image optimization with lazy loading
- ✅ Asset caching with CDN
- ✅ Database query optimization
- ✅ React Query caching
- ✅ Bundle size optimization

### Performance Targets

- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.8s
- Lighthouse Score: > 90

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Stripe](https://stripe.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📞 Support

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Email:** support@peptisync.com

---

<div align="center">

**Built with ❤️ by the PeptiSync Team**

[Website](https://peptisync.com) • [Documentation](docs/) • [Support](mailto:support@peptisync.com)

</div>

