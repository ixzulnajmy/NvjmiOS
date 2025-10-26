-- Finance System Upgrade Migration
-- Adds comprehensive personal finance management capabilities
-- Run this migration in Supabase SQL Editor

-- ============================================
-- NEW TABLE: ACCOUNTS
-- ============================================

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_type VARCHAR(50) CHECK (account_type IN ('savings', 'checking', 'credit_card', 'bnpl', 'ewallet')) NOT NULL,
  provider TEXT NOT NULL,  -- Maybank, UOB, Atome, ShopeePay, etc.
  name TEXT NOT NULL,  -- Custom user name for the account
  balance DECIMAL(10, 2),  -- Optional, for accounts with balance
  credit_limit DECIMAL(10, 2),  -- Optional, for credit cards
  icon TEXT,  -- Icon name or emoji
  color TEXT DEFAULT '#3b82f6',  -- Hex color for UI
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NEW TABLE: PAYMENT METHODS
-- ============================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  method_type VARCHAR(50) CHECK (method_type IN ('qr_code', 'apple_pay_tap', 'physical_card_tap', 'apple_pay_online', 'bank_transfer', 'fpx', 'cash')) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NEW TABLE: BNPL (Buy Now Pay Later)
-- ============================================

CREATE TABLE IF NOT EXISTS bnpl (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,  -- Which BNPL account (Atome, ShopeePay Later, etc.)
  merchant TEXT NOT NULL,  -- Where the purchase was made
  item_name TEXT,  -- What was purchased (e.g., "iPhone 15 Pro")
  total_amount DECIMAL(10, 2) NOT NULL,
  installment_amount DECIMAL(10, 2) NOT NULL,
  installments_total INTEGER NOT NULL,  -- Total number of installments
  installments_paid INTEGER DEFAULT 0,  -- How many have been paid
  next_due_date DATE,
  status VARCHAR(20) CHECK (status IN ('active', 'completed', 'overdue')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NEW TABLE: CREDIT CARDS
-- ============================================

CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  statement_date DATE,  -- When the statement is generated
  due_date DATE NOT NULL,  -- When payment is due
  total_amount DECIMAL(10, 2) NOT NULL,  -- Total statement amount
  minimum_payment DECIMAL(10, 2) NOT NULL,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MODIFY EXPENSES TABLE
-- ============================================

-- Add new columns to expenses table
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Create index for sort_order
CREATE INDEX IF NOT EXISTS idx_expenses_user_date_sort ON expenses(user_id, date DESC, sort_order);

-- ============================================
-- INDEXES FOR NEW TABLES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_account ON payment_methods(user_id, account_id);
CREATE INDEX IF NOT EXISTS idx_bnpl_user_status ON bnpl(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bnpl_next_due_date ON bnpl(next_due_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_due ON credit_cards(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_credit_cards_status ON credit_cards(status) WHERE status IN ('pending', 'overdue');

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE bnpl ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

-- Accounts Policies
CREATE POLICY "Users can view their own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Payment Methods Policies
CREATE POLICY "Users can view their own payment methods"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods"
  ON payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods"
  ON payment_methods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods"
  ON payment_methods FOR DELETE
  USING (auth.uid() = user_id);

-- BNPL Policies
CREATE POLICY "Users can view their own bnpl"
  ON bnpl FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bnpl"
  ON bnpl FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bnpl"
  ON bnpl FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bnpl"
  ON bnpl FOR DELETE
  USING (auth.uid() = user_id);

-- Credit Cards Policies
CREATE POLICY "Users can view their own credit cards"
  ON credit_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit cards"
  ON credit_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit cards"
  ON credit_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credit cards"
  ON credit_cards FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bnpl_updated_at BEFORE UPDATE ON bnpl
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON credit_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to automatically update BNPL status based on installments
CREATE OR REPLACE FUNCTION update_bnpl_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.installments_paid >= NEW.installments_total THEN
    NEW.status = 'completed';
  ELSIF NEW.next_due_date < CURRENT_DATE AND NEW.status = 'active' THEN
    NEW.status = 'overdue';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER check_bnpl_status
  BEFORE INSERT OR UPDATE ON bnpl
  FOR EACH ROW EXECUTE FUNCTION update_bnpl_status();

-- Function to ensure only one default payment method per account
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    -- Unset other default payment methods for this account
    UPDATE payment_methods
    SET is_default = FALSE
    WHERE account_id = NEW.account_id
      AND user_id = NEW.user_id
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_default_payment_method
  BEFORE INSERT OR UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION ensure_single_default_payment_method();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Finance System Upgrade Migration completed successfully!';
  RAISE NOTICE 'New tables created: accounts, payment_methods, bnpl, credit_cards';
  RAISE NOTICE 'Expenses table enhanced with account_id, payment_method_id, sort_order';
  RAISE NOTICE 'All RLS policies and triggers configured';
END $$;
