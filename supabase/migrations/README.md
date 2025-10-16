# Database Migrations

This directory contains Supabase database migrations for the PeptiSync e-commerce platform.

## Migration Files

### 20250928055643_ad34655a-c62e-4bb1-82e7-00d2063de360.sql
Initial setup:
- Creates `profiles` table with user information
- Sets up RLS policies for profiles
- Creates automatic profile creation on user signup

### 20251007160128_12707812-fb93-433a-b8e4-6e0e5ba3fc4b.sql
Cart and orders:
- Creates `cart_items` table for shopping carts
- Creates `orders` table for order tracking
- Creates `order_items` table for order line items
- Sets up RLS policies for cart and orders

### 20251009015932_a43dc283-7bec-40d9-9ac6-61ddfadd0f73.sql
Admin and products:
- Creates `user_roles` table with role-based access control
- Creates `products` table for product catalog
- Adds tracking fields to orders
- Sets up admin-specific RLS policies

### 20251010000000_complete_schema_enhancements.sql
Complete e-commerce features:
- Adds `shipping_address` JSONB column to profiles
- Adds `product_id` foreign key to cart_items
- Creates `reviews` table for product reviews and ratings
- Adds `rating` and `review_count` columns to products
- Adds `payment_intent_id` to orders for Stripe integration
- Creates comprehensive database indexes for performance
- Adds full-text search capability for products
- Creates helper functions for rating updates and purchase verification
- Adds order status constraints

## Applying Migrations

### Local Development

To apply migrations to your local Supabase instance:

```bash
# Start Supabase locally (if not already running)
npx supabase start

# Apply all pending migrations
npx supabase db push

# Or reset the database and apply all migrations
npx supabase db reset
```

### Production

To apply migrations to production:

```bash
# Link to your production project
npx supabase link --project-ref your-project-ref

# Push migrations to production
npx supabase db push
```

## Storage Buckets

After applying migrations, you need to create the following storage buckets in Supabase:

### 1. avatars (public)
- For user profile pictures
- Max file size: 2MB
- Allowed MIME types: image/jpeg, image/png, image/webp

### 2. products (public)
- For product images
- Max file size: 5MB
- Allowed MIME types: image/jpeg, image/png, image/webp

### 3. documents (private)
- For order invoices and receipts
- Max file size: 10MB
- Allowed MIME types: application/pdf

### Creating Buckets via Supabase CLI

```bash
# Create avatars bucket
npx supabase storage create avatars --public

# Create products bucket
npx supabase storage create products --public

# Create documents bucket (private)
npx supabase storage create documents
```

## Database Schema Overview

### Core Tables

- **profiles**: User profile information and membership tiers
- **user_roles**: Role-based access control (admin, moderator, user)
- **products**: Product catalog with inventory and pricing
- **cart_items**: Shopping cart items per user
- **orders**: Order records with status tracking
- **order_items**: Line items for each order
- **reviews**: Product reviews and ratings

### Key Features

- **Row Level Security (RLS)**: All tables have RLS policies enabled
- **Automatic Timestamps**: `created_at` and `updated_at` fields auto-update
- **Foreign Key Constraints**: Maintain referential integrity
- **Performance Indexes**: Optimized for common queries
- **Full-Text Search**: Products searchable by name, description, category
- **Automatic Rating Updates**: Product ratings recalculate on review changes

## Verification

After applying migrations, verify the schema:

```bash
# Check migration status
npx supabase migration list

# Inspect the database
npx supabase db inspect
```

## Rollback

If you need to rollback migrations:

```bash
# Reset to a specific migration
npx supabase db reset --version 20251009015932

# Or reset completely
npx supabase db reset
```

## Notes

- All migrations use `IF NOT EXISTS` clauses to be idempotent
- RLS policies ensure data security at the database level
- Indexes are created for optimal query performance
- Helper functions simplify common operations (role checks, purchase verification)
