-- ==============================================================================
-- Dashboard Metrics RPC (Timezone Aware)
-- ==============================================================================

CREATE OR REPLACE FUNCTION get_dashboard_metrics(
    p_timezone TEXT DEFAULT 'UTC'
)
RETURNS JSON AS $$
DECLARE
    v_sales_today DECIMAL;
    v_monthly_revenue DECIMAL;
    v_inventory_value DECIMAL;
    v_active_rentals INTEGER;
BEGIN
    -- 1. Sales Today (based on user's timezone)
    SELECT COALESCE(SUM(total_amount), 0) INTO v_sales_today
    FROM sales_orders
    WHERE DATE(created_at AT TIME ZONE p_timezone) = DATE(NOW() AT TIME ZONE p_timezone) 
      AND status = 'completed';

    -- 2. Monthly Revenue (based on user's timezone)
    SELECT COALESCE(SUM(total_amount), 0) INTO v_monthly_revenue
    FROM sales_orders
    WHERE EXTRACT(MONTH FROM created_at AT TIME ZONE p_timezone) = EXTRACT(MONTH FROM NOW() AT TIME ZONE p_timezone)
      AND EXTRACT(YEAR FROM created_at AT TIME ZONE p_timezone) = EXTRACT(YEAR FROM NOW() AT TIME ZONE p_timezone)
      AND status = 'completed';

    -- 3. Inventory Value
    SELECT COALESCE(SUM(il.quantity * p.cost_price), 0) INTO v_inventory_value
    FROM inventory_levels il
    JOIN products p ON il.product_id = p.id;

    -- 4. Active Rentals Count
    SELECT COUNT(*) INTO v_active_rentals
    FROM rental_reservations
    WHERE status = 'active';

    -- Return as JSON
    RETURN json_build_object(
        'salesToday', v_sales_today,
        'monthlyRevenue', v_monthly_revenue,
        'inventoryValue', v_inventory_value,
        'activeRentals', v_active_rentals
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
