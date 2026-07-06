-- ==============================================================================
-- Store Settings
-- ==============================================================================

CREATE TABLE store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name TEXT NOT NULL DEFAULT 'My Store',
    default_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'PHP',
    contact_email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Store settings are readable by all authenticated" 
ON store_settings FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only owners can update store settings" 
ON store_settings FOR UPDATE 
USING (public.user_role() = 'owner');

CREATE POLICY "Only owners can insert store settings" 
ON store_settings FOR INSERT 
WITH CHECK (public.user_role() = 'owner');

-- Insert a default row so we always have exactly one settings row
INSERT INTO store_settings (store_name) VALUES ('El Nido Outdoor') ON CONFLICT DO NOTHING;
