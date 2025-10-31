-- Finance Categories support

-- Create finance_categories table
CREATE TABLE IF NOT EXISTS finance_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT GENERATED ALWAYS AS (
    lower(regexp_replace(name, '[^a-z0-9]+', '-', 'g'))
  ) STORED,
  category_type VARCHAR(20) CHECK (category_type IN ('expense', 'income')) DEFAULT 'expense' NOT NULL,
  icon TEXT,
  color TEXT DEFAULT '#3b82f6',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_finance_categories_user ON finance_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_categories_type ON finance_categories(user_id, category_type);

-- Backfill categories from existing expenses so they can be managed going forward
INSERT INTO finance_categories (user_id, name, category_type, icon, color, sort_order)
SELECT
  user_id,
  category,
  CASE WHEN category IN ('salary', 'investments', 'gifts') THEN 'income' ELSE 'expense' END AS category_type,
  NULL,
  '#3b82f6',
  0
FROM (
  SELECT DISTINCT user_id, category
  FROM expenses
  WHERE category IS NOT NULL
    AND category <> ''
) AS distinct_categories
ON CONFLICT (user_id, name) DO NOTHING;

-- Enable RLS
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their categories"
  ON finance_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their categories"
  ON finance_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their categories"
  ON finance_categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their categories"
  ON finance_categories FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_finance_categories_updated_at
  BEFORE UPDATE ON finance_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Allow expenses.category to store user-defined values
ALTER TABLE expenses
  DROP CONSTRAINT IF EXISTS expenses_category_check;
