-- ==============================================================================
-- Atomic Rental Status Update RPC
-- ==============================================================================
-- This safely updates a rental reservation status and automatically adjusts 
-- physical inventory when items go out (Active) or come back (Completed).

CREATE OR REPLACE FUNCTION update_rental_status(
    p_reservation_id UUID,
    p_new_status rental_status,
    p_location_id UUID -- The location where items are picked up / returned
) RETURNS VOID AS $$
DECLARE
    v_old_status rental_status;
    v_item RECORD;
BEGIN
    -- 1. Get the current status
    SELECT status INTO v_old_status 
    FROM rental_reservations 
    WHERE id = p_reservation_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reservation not found';
    END IF;

    -- 2. Update the reservation status
    UPDATE rental_reservations 
    SET status = p_new_status, updated_at = NOW()
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
                'Rental picked up'
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
                'Rental returned'
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
