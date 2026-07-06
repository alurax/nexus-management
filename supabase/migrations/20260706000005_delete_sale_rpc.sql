-- ==============================================================================
-- Delete Sale RPC
-- ==============================================================================

CREATE OR REPLACE FUNCTION delete_sale(
    p_order_id UUID
) RETURNS VOID AS $$
DECLARE
    v_location_id UUID;
    v_old_item RECORD;
    v_has_returns BOOLEAN;
BEGIN
    -- 1. Check if the order has been returned
    SELECT EXISTS (
        SELECT 1 FROM inventory_movements 
        WHERE reference_id = p_order_id AND type = 'return'
    ) INTO v_has_returns;

    -- 2. Find the original location_id used for this sale
    SELECT from_location_id INTO v_location_id 
    FROM inventory_movements 
    WHERE reference_id = p_order_id AND type = 'sale' 
    LIMIT 1;

    -- 3. Revert old inventory levels ONLY if the order hasn't already been returned.
    -- If it was returned, the stock was already added back to inventory.
    IF v_location_id IS NOT NULL AND NOT v_has_returns THEN
        FOR v_old_item IN (SELECT product_id, quantity FROM sales_order_items WHERE sales_order_id = p_order_id) LOOP
            UPDATE inventory_levels 
            SET quantity = quantity + v_old_item.quantity, updated_at = NOW()
            WHERE product_id = v_old_item.product_id AND location_id = v_location_id;
        END LOOP;
    END IF;

    -- 4. Delete old records (Items, ALL movements including 'return', and Order)
    DELETE FROM sales_order_items WHERE sales_order_id = p_order_id;
    DELETE FROM inventory_movements WHERE reference_id = p_order_id; -- Deletes both 'sale' and 'return' movements
    DELETE FROM sales_orders WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
