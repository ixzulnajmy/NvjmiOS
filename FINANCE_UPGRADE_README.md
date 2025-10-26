# Finance System Upgrade

## Overview

This upgrade transforms the basic expense tracking into a comprehensive personal finance management system with:

- **Accounts Management**: Track savings, checking, credit cards, BNPL, and e-wallets
- **Payment Methods**: Link payment methods to accounts (QR, Apple Pay, Card Tap, etc.)
- **BNPL Tracking**: Monitor Buy Now Pay Later installment purchases
- **Credit Card Management**: Track statements, due dates, and payments
- **Enhanced Transactions**: View all expenses with account and payment method details
- **Financial Dashboard**: Complete overview of net worth, available funds, and upcoming payments

## Database Migration

### Migration File
`/home/user/NvjmiOS/supabase/migrations/001_finance_system_upgrade.sql`

### New Tables Created

1. **accounts**
   - Stores financial accounts (banks, credit cards, e-wallets, BNPL providers)
   - Fields: account_type, provider, name, balance, credit_limit, icon, color

2. **payment_methods**
   - Links payment methods to accounts
   - Fields: account_id, method_type, is_default

3. **bnpl** (Buy Now Pay Later)
   - Tracks installment purchases
   - Fields: merchant, item_name, total_amount, installment_amount, installments_total, next_due_date

4. **credit_cards**
   - Manages credit card statements
   - Fields: account_id, statement_date, due_date, total_amount, minimum_payment, paid_amount

### Modified Tables

**expenses** table - Added columns:
- `account_id` - Links expense to an account
- `payment_method_id` - Tracks how payment was made
- `sort_order` - Enables manual reordering of transactions

### To Apply Migration

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `/home/user/NvjmiOS/supabase/migrations/001_finance_system_upgrade.sql`
4. Click "Run"

The migration includes:
- Table creation with proper constraints
- Foreign key relationships
- Row Level Security (RLS) policies
- Indexes for performance
- Automatic triggers for status updates
- Helper functions

## New Features

### 1. Main Dashboard (`/dashboard/finance`)
- Financial overview (Net Worth, Available, Owed)
- Upcoming payments alert
- Monthly spending summary
- Quick navigation to all sections

### 2. Accounts Page (`/dashboard/finance/accounts`)
- View all financial accounts grouped by type
- Add new accounts with custom names, icons, and colors
- See balances and credit limits at a glance

### 3. BNPL Page (`/dashboard/finance/bnpl`)
- Track all installment purchases
- See progress for each purchase
- Upcoming installment due dates with alerts
- Automatic overdue detection

### 4. Credit Cards Page (`/dashboard/finance/credit-cards`)
- Monitor credit card statements
- Track payment progress
- Minimum payment and due date alerts
- Statement history

### 5. Enhanced Transactions (`/dashboard/finance/transactions`)
- View all expenses with account details
- See payment method used (QR, Apple Pay, etc.)
- Monthly summary
- Floating Action Button (FAB) for quick expense entry
- **FAB positioned at bottom-24 to avoid overlap with bottom navigation**

### 6. Add Expense (`/dashboard/finance/transactions/new`)
- Select account and payment method
- Auto-populate default payment method
- Category selection with emojis
- Date picker

## UI Components Added

- `/components/ui/select.tsx` - Dropdown select component (shadcn/ui)

## Type Safety

### TypeScript Types (`types/database.types.ts`)
- `Account`, `PaymentMethod`, `BNPL`, `CreditCard`
- Updated `Expense` interface with new fields
- Full database type definitions with Insert/Update types

### Zod Schemas (`schemas/account.schema.ts`)
- `accountSchema` - Validates account creation
- `paymentMethodSchema` - Validates payment methods
- `bnplSchema` - Validates BNPL purchases
- `creditCardSchema` - Validates credit card statements
- Updated `expenseSchema` with account and payment method fields

## Architecture Highlights

### Data Relationships
```
accounts (1) ─────┐
                  ├──> (M) payment_methods
                  ├──> (M) bnpl
                  ├──> (M) credit_cards
                  └──> (M) expenses

expenses (M) ──> (1) payment_methods
```

### Security (RLS Policies)
All tables have Row Level Security enabled:
- Users can only view/modify their own data
- Foreign key checks in RLS policies for related tables

### Automatic Features
- BNPL status auto-updates based on installments paid
- Credit card overdue status auto-detection
- Only one default payment method per account
- Timestamps auto-managed

## Testing Checklist

- [ ] Apply database migration in Supabase
- [ ] Create a test account (e.g., "Maybank Savings")
- [ ] Add a payment method to the account
- [ ] Create a test expense with account/payment method
- [ ] Add a BNPL purchase
- [ ] Add a credit card statement
- [ ] Verify dashboard shows correct calculations
- [ ] Check upcoming payments alerts work
- [ ] Test FAB button doesn't overlap bottom nav

## Future Enhancements

- [ ] Drag-and-drop transaction reordering
- [ ] Account details page with transaction history
- [ ] Payment recording for BNPL and credit cards
- [ ] Spending analytics and charts
- [ ] Budget management with category limits
- [ ] Export transactions to CSV
- [ ] Recurring expenses
- [ ] Receipt photo upload
- [ ] Search and advanced filtering

## Migration Rollback

If needed, run this SQL to rollback:

```sql
DROP TABLE IF EXISTS credit_cards CASCADE;
DROP TABLE IF EXISTS bnpl CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;

ALTER TABLE expenses DROP COLUMN IF EXISTS account_id;
ALTER TABLE expenses DROP COLUMN IF EXISTS payment_method_id;
ALTER TABLE expenses DROP COLUMN IF EXISTS sort_order;
```

## Notes

- All monetary values use DECIMAL(10, 2) for precision
- Dates are stored as DATE type
- Colors are hex strings validated with regex
- Account icons can be emojis or icon names
- Payment method types are constrained to predefined values
- BNPL and credit card statuses auto-update via database triggers
