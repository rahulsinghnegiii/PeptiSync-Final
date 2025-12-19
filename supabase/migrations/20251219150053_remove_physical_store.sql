-- Migration: Remove physical store functionality
-- This migration drops all tables and functions related to the physical product store

-- ============================================================================
-- 1. Drop dependent tables first (respecting foreign key constraints)
-- ============================================================================

-- Drop reviews table (depends on products)
DROP TABLE IF EXISTS public.reviews CASCADE;

-- Drop order_items table (depends on orders and products)
DROP TABLE IF EXISTS public.order_items CASCADE;

-- Drop cart_items table (depends on products)
DROP TABLE IF EXISTS public.cart_items CASCADE;

-- Drop orders table
DROP TABLE IF EXISTS public.orders CASCADE;

-- Drop products table
DROP TABLE IF EXISTS public.products CASCADE;

-- ============================================================================
-- 2. Drop related functions
-- ============================================================================

-- Drop stock management functions
DROP FUNCTION IF EXISTS public.update_product_stock CASCADE;
DROP FUNCTION IF EXISTS public.calculate_product_rating CASCADE;

-- ============================================================================
-- 3. Remove shipping_address column from profiles table
-- ============================================================================

ALTER TABLE public.profiles DROP COLUMN IF EXISTS shipping_address;

-- ============================================================================
-- 4. Drop storage buckets (if they exist)
-- ============================================================================

-- Note: Storage buckets should be manually deleted from Supabase dashboard
-- or using the Supabase CLI:
-- supabase storage rm products --recursive
-- supabase storage delete-bucket products

-- ============================================================================
-- Migration complete
-- ============================================================================

-- This migration successfully removes all physical store functionality including:
-- - products table
-- - cart_items table
-- - orders table
-- - order_items table
-- - reviews table
-- - Stock management functions
-- - Product rating calculation functions
-- - Shipping address column from profiles

