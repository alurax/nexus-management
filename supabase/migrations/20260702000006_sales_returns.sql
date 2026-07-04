-- ==============================================================================
-- Sales Returns & Remarks
-- ==============================================================================

-- 1. Add notes column to sales_orders if it doesn't exist
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Create RPC to process a full sale return
CREATE OR REPLACE FUNCTION process_sale_return(
    p_order_id UUID,
    p_location_id UUID,
    p_notes TEXT
) RETURNS VOID AS $$
DECLARE
    v_order_status sales_order_status;
    v_item RECORD;
BEGIN
    -- Get current status
    SELECT status INTO v_order_status FROM sales_orders WHERE id = p_order_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    IF v_order_status = 'refunded' THEN
        RAISE EXCEPTION 'Order is already refunded';
    END IF;

    IF v_order_status != 'completed' THEN
        RAISE EXCEPTION 'Only completed orders can be refunded';
    END IF;

    -- Update order status and notes
    UPDATE sales_orders
    SET 
        status = 'refunded',
        notes = CASE 
            WHEN notes IS NULL OR notes = '' THEN p_notes
            ELSE notes || E'\n---\nReturn Remarks: ' || p_notes
        END,
        updated_at = NOW()
    WHERE id = p_order_id;

    -- Loop through all items and restock them
    FOR v_item IN (SELECT product_id, quantity FROM sales_order_items WHERE sales_order_id = p_order_id)
    LOOP
        -- Re-use the existing adjust_inventory RPC to safely add stock back
        PERFORM adjust_inventory(
            v_item.product_id,
            p_location_id,
            v_item.quantity,
            'return',
            p_order_id,
            'Restocked from returned sale'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Create RPC to just update notes
CREATE OR REPLACE FUNCTION update_sale_notes(
    p_order_id UUID,
    p_notes TEXT
) RETURNS VOID AS $$
BEGIN
    UPDATE sales_orders
    SET notes = p_notes, updated_at = NOW()
    WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
