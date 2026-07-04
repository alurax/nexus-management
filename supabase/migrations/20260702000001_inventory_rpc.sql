-- ==============================================================================
-- Atomic Inventory Adjustment RPC
-- ==============================================================================
-- This function safely adds or removes stock and logs the movement in a single transaction.
-- If an inventory_level record doesn't exist for the location yet, it creates one.

CREATE OR REPLACE FUNCTION adjust_inventory(
    p_product_id UUID,
    p_location_id UUID,
    p_quantity_change INTEGER,
    p_type inventory_movement_type,
    p_reference_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_current_quantity INTEGER;
BEGIN
    -- 1. Ensure the inventory level record exists, or create it if it doesn't
    INSERT INTO inventory_levels (product_id, location_id, quantity)
    VALUES (p_product_id, p_location_id, 0)
    ON CONFLICT (product_id, location_id) DO NOTHING;

    -- 2. Update the inventory level
    UPDATE inventory_levels
    SET quantity = quantity + p_quantity_change
    WHERE product_id = p_product_id AND location_id = p_location_id
    RETURNING quantity INTO v_current_quantity;

    -- 3. Prevent negative stock (optional, but good practice for a BMS)
    -- If you want to allow backorders, you can comment this block out.
    IF v_current_quantity < 0 THEN
        RAISE EXCEPTION 'Insufficient stock. Cannot reduce stock below 0.';
    END IF;

    -- 4. Log the movement
    INSERT INTO inventory_movements (
        product_id, 
        to_location_id, 
        quantity, 
        type, 
        reference_id, 
        notes, 
        created_by
    )
    VALUES (
        p_product_id, 
        p_location_id, 
        p_quantity_change, 
        p_type, 
        p_reference_id, 
        p_notes, 
        auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
