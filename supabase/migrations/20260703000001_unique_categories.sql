-- ==============================================================================
-- Unique Categories
-- ==============================================================================

-- 1. First, you must manually delete or rename any duplicate categories in your database!
-- Otherwise, this migration will fail.

-- 2. Add a UNIQUE constraint to the name column
ALTER TABLE categories ADD CONSTRAINT categories_name_key UNIQUE (name);
