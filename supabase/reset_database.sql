-- ==========================================
-- RESET DATABASE SCRIPT
-- ==========================================
-- WARNING: This will permanently delete ALL data in these tables.
-- Run this in the Supabase SQL Editor to wipe the slate clean.

-- 1. Drop Tables (in reverse dependency order to avoid foreign key errors)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS expense_categories CASCADE;
DROP TABLE IF EXISTS rental_items CASCADE;
DROP TABLE IF EXISTS rental_reservations CASCADE;
DROP TABLE IF EXISTS sales_order_items CASCADE;
DROP TABLE IF EXISTS sales_orders CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS inventory_levels CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Drop Functions & Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.user_role() CASCADE;
DROP FUNCTION IF EXISTS public.adjust_inventory() CASCADE;
DROP FUNCTION IF EXISTS public.process_sale() CASCADE;

-- 3. Drop Types
DROP TYPE IF EXISTS audit_action CASCADE;
DROP TYPE IF EXISTS location_type CASCADE;
DROP TYPE IF EXISTS rental_item_status CASCADE;
DROP TYPE IF EXISTS rental_status CASCADE;
DROP TYPE IF EXISTS sales_order_status CASCADE;
DROP TYPE IF EXISTS purchase_order_status CASCADE;
DROP TYPE IF EXISTS inventory_movement_type CASCADE;
DROP TYPE IF EXISTS product_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Note: After running this, re-run:
-- 1. 20260702000000_initial_schema.sql
-- 2. 20260702000001_inventory_rpc.sql
