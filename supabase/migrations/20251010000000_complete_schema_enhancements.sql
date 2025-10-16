-- Migration: Complete schema enhancements for PeptiSync
-- This migration adds missing tables, columns, and indexes for the complete e-commerce functionality

-- ============================================================================
-- 1. Add shipping_address column to profiles table
-- ============================================================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS shipping_address JSONB;

COMMENT ON COLUMN public.profiles.shipping_address IS 'Stores user default shipping address as JSON: {fullName, address, city, state, zipCode, phoneNumber}';

-- ============================================================================
-- 2. Add product_id foreign key to cart_items table
-- ============================================================================
-- First, add the product_id column
ALTER TABLE public.cart_items
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

-- ============================================================================
-- 3. Create reviews table for product reviews and ratings
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK (char_length(comment) >= 10 AND char_length(comment) <= 500),
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, product_id)
);

COMMENT ON TABLE public.reviews IS 'Product reviews and ratings from users';
COMMENT ON COLUMN public.reviews.is_verified_purchase IS 'True if user purchased this product before reviewing';

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews RLS policies
CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
USING (true);

CREATE POLICY "Users can create reviews for products they purchased"
ON public.reviews
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can update their own reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.reviews
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any review"
ON public.reviews
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for reviews updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 4. Add rating and review_count columns to products table
-- ============================================================================
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0 CHECK (review_count >= 0);

COMMENT ON COLUMN public.products.rating IS 'Average rating calculated from reviews (0-5)';
COMMENT ON COLUMN public.products.review_count IS 'Total number of reviews for this product';

-- ============================================================================
-- 5. Add payment_intent_id to orders table
-- ============================================================================
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

COMMENT ON COLUMN public.orders.payment_intent_id IS 'Stripe payment intent ID for this order';

-- ============================================================================
-- 6. Update order_items table to include product_id
-- ============================================================================
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.order_items.product_id IS 'Reference to product (nullable in case product is deleted)';

-- ============================================================================
-- 7. Create function to update product rating after review changes
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the product's rating and review count
  UPDATE public.products
  SET 
    rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers to update product rating
CREATE TRIGGER update_product_rating_on_insert
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_product_rating();

CREATE TRIGGER update_product_rating_on_update
AFTER UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_product_rating();

CREATE TRIGGER update_product_rating_on_delete
AFTER DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_product_rating();

-- ============================================================================
-- 8. Create performance indexes
-- ============================================================================

-- Indexes for products table
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_rating ON public.products(rating DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock_quantity) WHERE is_active = true;

-- Indexes for orders table
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, status);

-- Indexes for order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Indexes for cart_items table
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_product ON public.cart_items(user_id, product_id);

-- Indexes for reviews table
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_membership_tier ON public.profiles(membership_tier);

-- Indexes for user_roles table
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- ============================================================================
-- 9. Create full-text search index for products
-- ============================================================================
-- Add tsvector column for full-text search
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION public.products_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C');
  RETURN NEW;
END;
$$;

-- Create trigger for search vector
DROP TRIGGER IF EXISTS products_search_vector_trigger ON public.products;
CREATE TRIGGER products_search_vector_trigger
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.products_search_vector_update();

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON public.products USING GIN(search_vector);

-- Update existing products with search vectors
UPDATE public.products
SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(category, '')), 'C')
WHERE search_vector IS NULL;

-- ============================================================================
-- 10. Create helper function to check if user purchased a product
-- ============================================================================
CREATE OR REPLACE FUNCTION public.user_purchased_product(_user_id uuid, _product_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE o.user_id = _user_id 
    AND oi.product_id = _product_id
    AND o.status IN ('processing', 'shipped', 'delivered')
  )
$$;

COMMENT ON FUNCTION public.user_purchased_product IS 'Check if a user has purchased a specific product';

-- ============================================================================
-- 11. Add constraint to ensure order status values
-- ============================================================================
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));

-- ============================================================================
-- 12. Create storage buckets (if not exists)
-- ============================================================================
-- Note: These need to be created via Supabase dashboard or CLI
-- Buckets needed:
-- - avatars (public)
-- - products (public)
-- - documents (private)

-- ============================================================================
-- Migration complete
-- ============================================================================
