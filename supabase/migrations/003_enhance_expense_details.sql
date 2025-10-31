-- Enhance expenses table with richer transaction metadata
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(20) CHECK (transaction_type IN ('expense', 'income', 'transfer')) DEFAULT 'expense',
  ADD COLUMN IF NOT EXISTS item_name TEXT,
  ADD COLUMN IF NOT EXISTS occurred_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_channel TEXT,
  ADD COLUMN IF NOT EXISTS counterparty_type TEXT;

-- Backfill occurred_at using existing date when available
UPDATE expenses
SET occurred_at = COALESCE(occurred_at, (date::timestamptz))
WHERE occurred_at IS NULL AND date IS NOT NULL;

-- Ensure transaction type defaults are set
UPDATE expenses
SET transaction_type = 'expense'
WHERE transaction_type IS NULL;

-- Helpful index for sorting by occurrence time
CREATE INDEX IF NOT EXISTS idx_expenses_user_occurred_at
  ON expenses(user_id, occurred_at DESC NULLS LAST, date DESC, sort_order DESC);
