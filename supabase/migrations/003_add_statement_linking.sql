-- Add statement_id to expenses table to link transactions to credit card statements
-- This enables proper reconciliation between daily expenses and monthly statements

ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS statement_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL;

-- Create index for statement queries
CREATE INDEX IF NOT EXISTS idx_expenses_statement ON expenses(statement_id) WHERE statement_id IS NOT NULL;

-- Add column to track if transaction is reconciled
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS is_reconciled BOOLEAN DEFAULT FALSE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Added statement_id and is_reconciled columns to expenses table';
  RAISE NOTICE 'Expenses can now be linked to credit card statements';
END $$;
