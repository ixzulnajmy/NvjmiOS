-- Complete Finance System Migration
-- Adds categories, IOU tracking, and settings tables

-- ============================================
-- CATEGORIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('income', 'expense', 'transfer')) NOT NULL,
  icon TEXT DEFAULT '💰',
  color TEXT DEFAULT '#3b82f6',
  budget_amount DECIMAL(10, 2),
  is_system BOOLEAN DEFAULT FALSE,  -- System categories cannot be deleted
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name, type)
);

-- ============================================
-- IOU DEBTS TABLE (Renamed from "Friends")
-- ============================================

CREATE TABLE IF NOT EXISTS iou_debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  person_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  direction VARCHAR(20) CHECK (direction IN ('they_owe_me', 'i_owe_them')) NOT NULL,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  status VARCHAR(20) CHECK (status IN ('active', 'paid', 'overdue')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER FINANCE SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_finance_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  monthly_budget DECIMAL(10, 2) DEFAULT 3000,
  budget_start_day INTEGER DEFAULT 1,  -- Day of month budget starts
  payday_date INTEGER DEFAULT 25,  -- Day of month salary is received
  rollover_unused BOOLEAN DEFAULT FALSE,
  include_savings_in_available BOOLEAN DEFAULT TRUE,
  include_credit_in_available BOOLEAN DEFAULT TRUE,
  notification_budget_warning BOOLEAN DEFAULT TRUE,
  notification_payment_reminder BOOLEAN DEFAULT TRUE,
  notification_iou_reminder BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_categories_user_type ON categories(user_id, type);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_iou_user_status ON iou_debts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_iou_due_date ON iou_debts(due_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_user_finance_settings_user_id ON user_finance_settings(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE iou_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_finance_settings ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Users can view their own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id AND is_system = FALSE);

-- IOU Debts Policies
CREATE POLICY "Users can view their own ious"
  ON iou_debts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ious"
  ON iou_debts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ious"
  ON iou_debts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ious"
  ON iou_debts FOR DELETE
  USING (auth.uid() = user_id);

-- User Finance Settings Policies
CREATE POLICY "Users can view their own settings"
  ON user_finance_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_finance_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_finance_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_iou_debts_updated_at BEFORE UPDATE ON iou_debts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_finance_settings_updated_at BEFORE UPDATE ON user_finance_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update IOU status based on due date
CREATE OR REPLACE FUNCTION update_iou_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.due_date IS NOT NULL AND NEW.due_date < CURRENT_DATE AND NEW.status = 'active' THEN
    NEW.status = 'overdue';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER check_iou_status
  BEFORE INSERT OR UPDATE ON iou_debts
  FOR EACH ROW EXECUTE FUNCTION update_iou_status();

-- ============================================
-- SEED DEFAULT CATEGORIES
-- ============================================

-- This function will be called when a new user signs up
CREATE OR REPLACE FUNCTION create_default_categories(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Default expense categories
  INSERT INTO categories (user_id, name, type, icon, color, is_system, display_order) VALUES
    (p_user_id, 'Food & Dining', 'expense', '🍔', '#ef4444', true, 1),
    (p_user_id, 'Transport', 'expense', '🚗', '#f97316', true, 2),
    (p_user_id, 'Shopping', 'expense', '🛍️', '#ec4899', true, 3),
    (p_user_id, 'Bills & Utilities', 'expense', '📄', '#8b5cf6', true, 4),
    (p_user_id, 'Entertainment', 'expense', '🎬', '#06b6d4', true, 5),
    (p_user_id, 'Healthcare', 'expense', '🏥', '#10b981', true, 6),
    (p_user_id, 'Groceries', 'expense', '🛒', '#84cc16', true, 7),
    (p_user_id, 'Personal Care', 'expense', '💄', '#f59e0b', true, 8),
    (p_user_id, 'Other', 'expense', '📦', '#6b7280', true, 99);

  -- Default income categories
  INSERT INTO categories (user_id, name, type, icon, color, is_system, display_order) VALUES
    (p_user_id, 'Salary', 'income', '💰', '#10b981', true, 1),
    (p_user_id, 'Freelance', 'income', '💼', '#3b82f6', true, 2),
    (p_user_id, 'Investments', 'income', '📈', '#8b5cf6', true, 3),
    (p_user_id, 'Other Income', 'income', '💵', '#6b7280', true, 99);

  -- System categories
  INSERT INTO categories (user_id, name, type, icon, color, is_system, display_order) VALUES
    (p_user_id, 'Transfer', 'transfer', '🔄', '#3b82f6', true, 1),
    (p_user_id, 'Initial Balance', 'income', '🏦', '#10b981', true, 0);

  -- Create default user finance settings
  INSERT INTO user_finance_settings (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ language 'plpgsql';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Complete Finance System Migration completed successfully!';
  RAISE NOTICE 'New tables created: categories, iou_debts, user_finance_settings';
  RAISE NOTICE 'Default categories function created';
  RAISE NOTICE 'All RLS policies and triggers configured';
END $$;
