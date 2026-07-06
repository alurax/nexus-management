-- ==============================================================================
-- Edit Sale RPC
-- ==============================================================================

DROP FUNCTION IF EXISTS edit_sale(UUID, DECIMAL, DECIMAL, TEXT, JSONB);

CREATE OR REPLACE FUNCTION edit_sale(
    p_order_id UUID,
    p_discount DECIMAL,
    p_tax DECIMAL,
    p_payment_method TEXT,
    p_status sales_order_status,
    p_items JSONB -- Array of { product_id, quantity, unit_price }
) RETURNS UUID AS $$
DECLARE
    v_location_id UUID;
    v_total_amount DECIMAL := 0;
    v_item RECORD;
    v_old_item RECORD;
    v_item_total DECIMAL;
    v_timestamp TIMESTAMPTZ := NOW();
    v_has_returns BOOLEAN;
BEGIN
    -- 1. Check if the order has been returned
    SELECT EXISTS (
        SELECT 1 FROM inventory_movements 
        WHERE reference_id = p_order_id AND type = 'return'
    ) INTO v_has_returns;

    IF v_has_returns THEN
        RAISE EXCEPTION 'Cannot edit an order that has already been returned or partially returned.';
    END IF;

    -- 2. Find the original location_id used for this sale
    SELECT from_location_id INTO v_location_id 
    FROM inventory_movements 
    WHERE reference_id = p_order_id AND type = 'sale' 
    LIMIT 1;

    IF v_location_id IS NULL THEN
        RAISE EXCEPTION 'Could not determine the location of the original sale.';
    END IF;

    -- 3. Revert old inventory levels
    FOR v_old_item IN (SELECT product_id, quantity FROM sales_order_items WHERE sales_order_id = p_order_id) LOOP
        UPDATE inventory_levels 
        SET quantity = quantity + v_old_item.quantity, updated_at = v_timestamp
        WHERE product_id = v_old_item.product_id AND location_id = v_location_id;
    END LOOP;

    -- 4. Delete old records (Items and Movements)
    DELETE FROM sales_order_items WHERE sales_order_id = p_order_id;
    DELETE FROM inventory_movements WHERE reference_id = p_order_id AND type = 'sale';

    -- 5. Process new items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT, unit_price DECIMAL)
    LOOP
        v_item_total := v_item.quantity * v_item.unit_price;
        v_total_amount := v_total_amount + v_item_total;

        -- Insert new order item
        INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, total_price)
        VALUES (p_order_id, v_item.product_id, v_item.quantity, v_item.unit_price, v_item_total);

        -- Deduct new inventory
        UPDATE inventory_levels 
        SET quantity = quantity - v_item.quantity, updated_at = v_timestamp
        WHERE product_id = v_item.product_id AND location_id = v_location_id;

        -- Log new movement
        INSERT INTO inventory_movements (product_id, from_location_id, quantity, type, reference_id, notes, created_by, created_at)
        VALUES (v_item.product_id, v_location_id, v_item.quantity, 'sale', p_order_id, 'Edited completed sale', auth.uid(), v_timestamp);
    END LOOP;

    -- 6. Update the main sales_order record
    UPDATE sales_orders 
    SET total_amount = (v_total_amount - p_discount + p_tax),
        discount_amount = p_discount,
        tax_amount = p_tax,
        payment_method = p_payment_method,
        status = p_status,
        updated_at = v_timestamp
    WHERE id = p_order_id;

    RETURN p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
