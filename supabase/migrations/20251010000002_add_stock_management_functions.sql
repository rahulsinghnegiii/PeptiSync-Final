-- Function to safely decrement product stock
CREATE OR REPLACE FUNCTION decrement_product_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update stock quantity, ensuring it doesn't go below 0
  UPDATE products
  SET 
    stock_quantity = GREATEST(stock_quantity - quantity, 0),
    updated_at = now()
  WHERE id = product_id;
  
  -- If stock reaches 0, mark as inactive
  UPDATE products
  SET is_active = false
  WHERE id = product_id AND stock_quantity = 0;
END;
$$;

-- Function to increment product stock (for returns/cancellations)
CREATE OR REPLACE FUNCTION increment_product_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update stock quantity
  UPDATE products
  SET 
    stock_quantity = stock_quantity + quantity,
    updated_at = now()
  WHERE id = product_id;
  
  -- If stock is now available, mark as active
  UPDATE products
  SET is_active = true
  WHERE id = product_id AND stock_quantity > 0;
END;
$$;

-- Function to check if product has sufficient stock
CREATE OR REPLACE FUNCTION check_product_stock(
  product_id UUID,
  required_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock_quantity INTO current_stock
  FROM products
  WHERE id = product_id;
  
  RETURN current_stock >= required_quantity;
END;
$$;

-- Trigger to automatically mark products as inactive when stock reaches 0
CREATE OR REPLACE FUNCTION auto_deactivate_out_of_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.stock_quantity = 0 AND OLD.stock_quantity > 0 THEN
    NEW.is_active := false;
  ELSIF NEW.stock_quantity > 0 AND OLD.stock_quantity = 0 THEN
    NEW.is_active := true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on products table
DROP TRIGGER IF EXISTS trigger_auto_deactivate_out_of_stock ON products;
CREATE TRIGGER trigger_auto_deactivate_out_of_stock
  BEFORE UPDATE OF stock_quantity ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_deactivate_out_of_stock();
