-- Fix slug generation to keep leading characters and deduplicate conflicting categories
ALTER TABLE finance_categories
  DROP COLUMN IF EXISTS slug;

ALTER TABLE finance_categories
  ADD COLUMN slug TEXT GENERATED ALWAYS AS (
    regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g')
  ) STORED;

-- Remove duplicate categories based on the new slug (keep earliest record)
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY user_id, slug ORDER BY created_at) AS rn
  FROM finance_categories
)
DELETE FROM finance_categories fc
USING ranked r
WHERE fc.id = r.id
  AND r.rn > 1;

-- Enforce uniqueness by slug per user to prevent future duplicates
DROP INDEX IF EXISTS finance_categories_user_slug_key;
CREATE UNIQUE INDEX finance_categories_user_slug_key
  ON finance_categories(user_id, slug);
0