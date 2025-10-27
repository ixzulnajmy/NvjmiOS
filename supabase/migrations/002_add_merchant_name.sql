-- Add merchant_name field to expenses table
-- This allows tracking where the expense occurred separately from description/notes

ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS merchant_name TEXT;

-- Create index for merchant searches
CREATE INDEX IF NOT EXISTS idx_expenses_merchant ON expenses(merchant_name);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Added merchant_name column to expenses table';
END $$;
