-- ==============================================================================
-- 1. Custom Types & Enums
-- ==============================================================================
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'staff');
CREATE TYPE product_type AS ENUM ('retail', 'rental', 'service');
CREATE TYPE inventory_movement_type AS ENUM ('receive', 'sale', 'transfer', 'adjustment', 'return');
CREATE TYPE purchase_order_status AS ENUM ('draft', 'pending', 'received', 'cancelled');
CREATE TYPE sales_order_status AS ENUM ('pending', 'completed', 'refunded', 'cancelled');
CREATE TYPE rental_status AS ENUM ('reserved', 'active', 'completed', 'cancelled');
CREATE TYPE rental_item_status AS ENUM ('pending', 'out', 'returned', 'damaged');
CREATE TYPE location_type AS ENUM ('store', 'warehouse', 'rental_hub');
CREATE TYPE audit_action AS ENUM ('insert', 'update', 'delete');

-- ==============================================================================
-- 2. Core Tables
-- ==============================================================================

-- 2.1 Profiles (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'staff',
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 People (Customers & Suppliers)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 Catalog (Categories & Products)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    barcode TEXT UNIQUE,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    type product_type NOT NULL DEFAULT 'retail',
    base_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    cost_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.4 Inventory
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type location_type NOT NULL DEFAULT 'store',
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, location_id)
);

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    from_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    to_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    type inventory_movement_type NOT NULL,
    reference_id UUID, -- Can link to a sales order, purchase order, etc.
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.5 Purchasing
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    status purchase_order_status NOT NULL DEFAULT 'draft',
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    expected_date DATE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    received_quantity INTEGER NOT NULL DEFAULT 0,
    unit_cost DECIMAL(12,2) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL
);

-- 2.6 Sales
CREATE TABLE sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    status sales_order_status NOT NULL DEFAULT 'completed',
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    payment_method TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL
);

-- 2.7 Rentals
CREATE TABLE rental_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    status rental_status NOT NULL DEFAULT 'reserved',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    deposit_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rental_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_reservation_id UUID NOT NULL REFERENCES rental_reservations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    status rental_item_status NOT NULL DEFAULT 'pending'
);

-- 2.8 Expenses
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
    amount DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    receipt_url TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.9 Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action audit_action NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. Security (Row Level Security & Policies)
-- ==============================================================================
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function to get current user's role
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Users can read all profiles, but only update their own (unless owner/manager)
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Owners can update any profile" ON profiles FOR UPDATE USING (public.user_role() = 'owner');

-- Publicly readable by authenticated (Catalog, Locations, Customers)
CREATE POLICY "Catalog is readable by all authenticated" ON categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Catalog is readable by all authenticated" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Locations readable by all authenticated" ON locations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated can manage locations" ON locations FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Customers readable by all authenticated" ON customers FOR SELECT USING (auth.role() = 'authenticated');

-- Inventory & Transactions (Readable/Writeable by all authenticated, depending on UI enforcement, but restricted if strict)
-- For a small business BMS, usually all employees can ring up sales and view inventory.
CREATE POLICY "All authenticated can view/manage inventory" ON inventory_levels FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated can view/manage movements" ON inventory_movements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated can view/manage sales" ON sales_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated can view/manage sales items" ON sales_order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated can view/manage rentals" ON rental_reservations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated can view/manage rental items" ON rental_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated can manage customers" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated can manage categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated can manage products" ON products FOR ALL USING (auth.role() = 'authenticated');

-- Purchasing & Suppliers: Managers & Owners Only
CREATE POLICY "Managers and owners can manage suppliers" ON suppliers FOR ALL USING (public.user_role() IN ('owner', 'manager'));
CREATE POLICY "Managers and owners can manage POs" ON purchase_orders FOR ALL USING (public.user_role() IN ('owner', 'manager'));
CREATE POLICY "Managers and owners can manage PO items" ON purchase_order_items FOR ALL USING (public.user_role() IN ('owner', 'manager'));

-- Expenses: Managers & Owners Only
CREATE POLICY "Managers and owners can manage expense categories" ON expense_categories FOR ALL USING (public.user_role() IN ('owner', 'manager'));
CREATE POLICY "Managers and owners can manage expenses" ON expenses FOR ALL USING (public.user_role() IN ('owner', 'manager'));

-- Audit Logs: Read-only for Managers/Owners, Insert for everyone via trigger
CREATE POLICY "Anyone can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Owners and managers can view audit logs" ON audit_logs FOR SELECT USING (public.user_role() IN ('owner', 'manager'));
-- Note: NO UPDATE OR DELETE policies for audit logs (immutable).

-- ==============================================================================
-- 4. Triggers & Functions
-- ==============================================================================

-- 4.1 Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_levels_updated_at BEFORE UPDATE ON inventory_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_orders_updated_at BEFORE UPDATE ON sales_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rental_reservations_updated_at BEFORE UPDATE ON rental_reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4.2 Auto-create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', 'owner'); 
  -- Defaulting to owner for the very first user, subsequent logic can change this.
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4.3 Atomic Sale Processing RPC
-- Processes a sale, creates order, items, and deducts inventory safely.
CREATE OR REPLACE FUNCTION process_sale(
    p_customer_id UUID,
    p_location_id UUID,
    p_payment_method TEXT,
    p_discount DECIMAL,
    p_tax DECIMAL,
    p_items JSONB -- Array of { product_id, quantity, unit_price }
) RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_total_amount DECIMAL := 0;
    v_item RECORD;
    v_item_total DECIMAL;
BEGIN
    -- 1. Create the sales order
    INSERT INTO sales_orders (customer_id, status, discount_amount, tax_amount, payment_method, created_by)
    VALUES (p_customer_id, 'completed', p_discount, p_tax, p_payment_method, auth.uid())
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
        SET quantity = quantity - v_item.quantity 
        WHERE product_id = v_item.product_id AND location_id = p_location_id;

        -- Log movement
        INSERT INTO inventory_movements (product_id, from_location_id, quantity, type, reference_id, notes, created_by)
        VALUES (v_item.product_id, p_location_id, v_item.quantity, 'sale', v_order_id, 'Completed sale', auth.uid());
    END LOOP;

    -- 3. Update total amount
    UPDATE sales_orders 
    SET total_amount = (v_total_amount - p_discount + p_tax) 
    WHERE id = v_order_id;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
