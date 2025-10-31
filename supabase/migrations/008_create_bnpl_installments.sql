-- BNPL Installment schedule support

-- Create table to store each planned installment
CREATE TABLE IF NOT EXISTS bnpl_installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bnpl_id UUID REFERENCES bnpl(id) ON DELETE CASCADE NOT NULL,
  sequence INTEGER NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  due_date DATE,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (bnpl_id, sequence)
);

CREATE INDEX IF NOT EXISTS idx_bnpl_installments_bnpl ON bnpl_installments(bnpl_id);
CREATE INDEX IF NOT EXISTS idx_bnpl_installments_due_date ON bnpl_installments(due_date);
CREATE INDEX IF NOT EXISTS idx_bnpl_installments_paid ON bnpl_installments(bnpl_id, is_paid);

-- Enable row level security and mirror policies
ALTER TABLE bnpl_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their bnpl installments"
  ON bnpl_installments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bnpl
      WHERE bnpl.id = bnpl_installments.bnpl_id
        AND bnpl.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their bnpl installments"
  ON bnpl_installments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bnpl
      WHERE bnpl.id = bnpl_installments.bnpl_id
        AND bnpl.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their bnpl installments"
  ON bnpl_installments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM bnpl
      WHERE bnpl.id = bnpl_installments.bnpl_id
        AND bnpl.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their bnpl installments"
  ON bnpl_installments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM bnpl
      WHERE bnpl.id = bnpl_installments.bnpl_id
        AND bnpl.user_id = auth.uid()
    )
  );

-- Trigger to maintain updated_at
CREATE TRIGGER update_bnpl_installments_updated_at
  BEFORE UPDATE ON bnpl_installments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Backfill existing BNPL plans into installment schedule
WITH plans AS (
  SELECT
    id,
    total_amount,
    installment_amount,
    installments_total,
    installments_paid,
    next_due_date,
    created_at
  FROM bnpl
),
expanded AS (
  SELECT
    p.id AS bnpl_id,
    generate_series(1, GREATEST(p.installments_total, 0)) AS sequence,
    p.total_amount,
    p.installment_amount,
    p.installments_total,
    p.installments_paid,
    p.next_due_date,
    p.created_at
  FROM plans p
)
INSERT INTO bnpl_installments (bnpl_id, sequence, amount, due_date, is_paid)
SELECT
  e.bnpl_id,
  e.sequence,
  CASE
    WHEN e.installments_total <= 0 THEN 0
    WHEN e.sequence < e.installments_total THEN COALESCE(e.installment_amount, 0)
    ELSE GREATEST(e.total_amount - COALESCE(e.installment_amount, 0) * (e.installments_total - 1), 0)
  END,
  CASE
    WHEN e.sequence = e.installments_paid + 1 THEN e.next_due_date
    ELSE NULL
  END,
  CASE
    WHEN e.sequence <= e.installments_paid THEN TRUE
    ELSE FALSE
  END
FROM expanded e
ON CONFLICT DO NOTHING;
