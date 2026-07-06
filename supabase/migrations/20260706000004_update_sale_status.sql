-- ==============================================================================
-- Update Sale Status RPC
-- ==============================================================================

CREATE OR REPLACE FUNCTION update_sale_status(
    p_order_id UUID,
    p_status sales_order_status
) RETURNS UUID AS $$
BEGIN
    UPDATE sales_orders
    SET status = p_status,
        updated_at = NOW()
    WHERE id = p_order_id;

    RETURN p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
