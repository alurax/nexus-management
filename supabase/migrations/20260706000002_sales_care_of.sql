-- ==============================================================================
-- Sales: Care Of Status & Process Sale Update
-- ==============================================================================

-- 1. Add 'care_of' to sales_order_status enum
-- Note: In Postgres, this statement must run outside of a transaction block if the type was used,
-- but Supabase migrations usually wrap in transaction. If it fails, users might need to run it manually.
ALTER TYPE sales_order_status ADD VALUE IF NOT EXISTS 'care_of';

-- 2. Update process_sale to accept an optional p_status
DROP FUNCTION IF EXISTS process_sale;
CREATE OR REPLACE FUNCTION process_sale(
    p_customer_id UUID,
    p_location_id UUID,
    p_payment_method TEXT,
    p_discount DECIMAL,
    p_tax DECIMAL,
    p_items JSONB, -- Array of { product_id, quantity, unit_price }
    p_created_at TIMESTAMPTZ DEFAULT NULL,
    p_status sales_order_status DEFAULT 'completed'
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
    VALUES (p_customer_id, p_status, p_discount, p_tax, p_payment_method, auth.uid(), v_timestamp, v_timestamp)
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
