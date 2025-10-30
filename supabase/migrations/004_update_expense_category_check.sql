-- Expand expenses category check constraint to support richer income and expense tagging
ALTER TABLE expenses
  DROP CONSTRAINT IF EXISTS expenses_category_check;

ALTER TABLE expenses
  ADD CONSTRAINT expenses_category_check
  CHECK (
    category IN (
      'food',
      'transport',
      'girlfriend',
      'shopping',
      'bills',
      'other',
      'salary',
      'investments',
      'gifts',
      'subscriptions',
      'health',
      'entertainment',
      'groceries',
      'travel'
    )
  );
