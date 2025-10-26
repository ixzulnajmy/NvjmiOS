-- Migration: Update Expenses Table
-- Run this in Supabase SQL Editor if you already have the old expenses table

-- Drop the old constraint
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_check;

-- Rename description to note if it exists
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns
            WHERE table_name='expenses' AND column_name='description') THEN
    ALTER TABLE expenses RENAME COLUMN description TO note;
  END IF;
END $$;

-- Drop receipt_url column if it exists (no longer needed)
ALTER TABLE expenses DROP COLUMN IF EXISTS receipt_url;

-- Add new constraint with updated categories
ALTER TABLE expenses ADD CONSTRAINT expenses_category_check
  CHECK (category IN ('food', 'transport', 'shopping', 'bills', 'personal', 'entertainment', 'health', 'others'));

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Expenses table updated successfully!';
  RAISE NOTICE 'New categories: food, transport, shopping, bills, personal, entertainment, health, others';
END $$;
