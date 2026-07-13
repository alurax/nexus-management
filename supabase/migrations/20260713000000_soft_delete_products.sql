-- ==============================================================================
-- Soft Delete for Products
-- ==============================================================================

-- 1. Add is_active column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- 2. Create an RPC to safely soft-delete a product
CREATE OR REPLACE FUNCTION soft_delete_product(p_product_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products SET is_active = false WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
