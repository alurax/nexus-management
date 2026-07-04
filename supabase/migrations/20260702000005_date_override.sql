-- ==============================================================================
-- Date Override (Backdating) RPC Updates
-- ==============================================================================

-- 1. Update adjust_inventory to accept p_created_at
DROP FUNCTION IF EXISTS adjust_inventory;
CREATE OR REPLACE FUNCTION adjust_inventory(
    p_product_id UUID,
    p_location_id UUID,
    p_quantity_change INTEGER,
    p_type inventory_movement_type,
    p_reference_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_created_at TIMESTAMPTZ DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_current_quantity INTEGER;
    v_timestamp TIMESTAMPTZ;
BEGIN
    v_timestamp := COALESCE(p_created_at, NOW());

    -- 1. Ensure the inventory level record exists, or create it if it doesn't
    INSERT INTO inventory_levels (product_id, location_id, quantity)
    VALUES (p_product_id, p_location_id, 0)
    ON CONFLICT (product_id, location_id) DO NOTHING;

    -- 2. Update the inventory level
    UPDATE inventory_levels
    SET quantity = quantity + p_quantity_change, updated_at = v_timestamp
    WHERE product_id = p_product_id AND location_id = p_location_id
    RETURNING quantity INTO v_current_quantity;

    -- 3. Prevent negative stock (optional, but good practice for a BMS)
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
        created_by,
        created_at
    )
    VALUES (
        p_product_id, 
        p_location_id, 
        p_quantity_change, 
        p_type, 
        p_reference_id, 
        p_notes, 
        auth.uid(),
        v_timestamp
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Update process_sale to accept p_created_at
DROP FUNCTION IF EXISTS process_sale;
CREATE OR REPLACE FUNCTION process_sale(
    p_customer_id UUID,
    p_location_id UUID,
    p_payment_method TEXT,
    p_discount DECIMAL,
    p_tax DECIMAL,
    p_items JSONB, -- Array of { product_id, quantity, unit_price }
    p_created_at TIMESTAMPTZ DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_total_amount DECIMAL := 0;
    v_item RECORD;
    v_item_total DECIMAL;
    v_timestamp TIMESTAMPTZ;
BEGIN
    v_timestamp := COALESCE(p_created_at, NOW());

    -- 1. Create the sales order
    INSERT INTO sales_orders (customer_id, status, discount_amount, tax_amount, payment_method, created_by, created_at, updated_at)
    VALUES (p_customer_id, 'completed', p_discount, p_tax, p_payment_method, auth.uid(), v_timestamp, v_timestamp)
    RETURNING id INTO v_order_id;

    -- 2. Process items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT, unit_price DECIMAL)
    LOOP
        v_item_total := v_item.quantity * v_item.unit_price;
        v_total_amount := v_total_amount + v_item_total;

        -- Insert order item
        INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, total_price)
        VALUES (v_order_id, v_item.product_id, v_item.quantity, v_item.unit_price, v_item_total);

        -- Deduct inventory
        UPDATE inventory_levels 
        SET quantity = quantity - v_item.quantity, updated_at = v_timestamp
        WHERE product_id = v_item.product_id AND location_id = p_location_id;

        -- Log movement
        INSERT INTO inventory_movements (product_id, from_location_id, quantity, type, reference_id, notes, created_by, created_at)
        VALUES (v_item.product_id, p_location_id, v_item.quantity, 'sale', v_order_id, 'Completed sale', auth.uid(), v_timestamp);
    END LOOP;

    -- 3. Update total amount
    UPDATE sales_orders 
    SET total_amount = (v_total_amount - p_discount + p_tax) 
    WHERE id = v_order_id;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Update update_rental_status to accept p_created_at
DROP FUNCTION IF EXISTS update_rental_status;
CREATE OR REPLACE FUNCTION update_rental_status(
    p_reservation_id UUID,
    p_new_status rental_status,
    p_location_id UUID, -- The location where items are picked up / returned
    p_created_at TIMESTAMPTZ DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_old_status rental_status;
    v_item RECORD;
    v_timestamp TIMESTAMPTZ;
BEGIN
    v_timestamp := COALESCE(p_created_at, NOW());

    -- 1. Get the current status
    SELECT status INTO v_old_status 
    FROM rental_reservations 
    WHERE id = p_reservation_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reservation not found';
    END IF;

    -- 2. Update the reservation status
    UPDATE rental_reservations 
    SET status = p_new_status, updated_at = v_timestamp
    WHERE id = p_reservation_id;

    -- 3. Update the individual items status based on the reservation status
    IF p_new_status = 'active' THEN
        UPDATE rental_items SET status = 'out' WHERE rental_reservation_id = p_reservation_id;
    ELSIF p_new_status = 'completed' THEN
        UPDATE rental_items SET status = 'returned' WHERE rental_reservation_id = p_reservation_id;
    ELSIF p_new_status = 'cancelled' THEN
        UPDATE rental_items SET status = 'pending' WHERE rental_reservation_id = p_reservation_id;
    END IF;

    -- 4. Handle Inventory Deductions/Returns if transitioning between specific states
    FOR v_item IN (SELECT product_id, quantity FROM rental_items WHERE rental_reservation_id = p_reservation_id)
    LOOP
        -- If items are going OUT (Reserved -> Active)
        IF v_old_status IN ('reserved', 'pending') AND p_new_status = 'active' THEN
            PERFORM adjust_inventory(
                v_item.product_id, 
                p_location_id, 
                -(v_item.quantity), -- Deduct stock
                'transfer', 
                p_reservation_id, 
                'Rental picked up',
                v_timestamp
            );
        END IF;

        -- If items are coming BACK IN (Active -> Completed)
        IF v_old_status = 'active' AND p_new_status = 'completed' THEN
            PERFORM adjust_inventory(
                v_item.product_id, 
                p_location_id, 
                v_item.quantity, -- Add stock back
                'return', 
                p_reservation_id, 
                'Rental returned',
                v_timestamp
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
