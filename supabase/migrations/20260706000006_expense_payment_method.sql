-- ==============================================================================
-- Add Payment Method to Expenses
-- ==============================================================================

ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash' NOT NULL;
