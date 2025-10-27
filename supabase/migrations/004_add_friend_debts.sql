-- Create friend_debts table for tracking IOUs between user and friends
CREATE TABLE IF NOT EXISTS friend_debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  debt_type TEXT NOT NULL CHECK (debt_type IN ('they_owe_me', 'i_owe_them')),
  description TEXT,
  related_expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  due_date DATE,
  settled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_friend_debts_user_id ON friend_debts(user_id);
CREATE INDEX idx_friend_debts_status ON friend_debts(status);
CREATE INDEX idx_friend_debts_friend_name ON friend_debts(friend_name);
CREATE INDEX idx_friend_debts_due_date ON friend_debts(due_date);
CREATE INDEX idx_friend_debts_related_expense ON friend_debts(related_expense_id);

-- Enable Row Level Security
ALTER TABLE friend_debts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own friend debts"
  ON friend_debts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own friend debts"
  ON friend_debts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friend debts"
  ON friend_debts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own friend debts"
  ON friend_debts FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_friend_debts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER friend_debts_updated_at
  BEFORE UPDATE ON friend_debts
  FOR EACH ROW
  EXECUTE FUNCTION update_friend_debts_updated_at();

-- Create trigger to automatically set settled_at when status changes to paid
CREATE OR REPLACE FUNCTION set_friend_debt_settled_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' AND NEW.settled_at IS NULL THEN
    NEW.settled_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER friend_debt_settled
  BEFORE UPDATE ON friend_debts
  FOR EACH ROW
  EXECUTE FUNCTION set_friend_debt_settled_at();
