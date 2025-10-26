# Expense Tracking Feature

## Overview

The NvjmiOS expense tracking system is designed for **zero-friction expense logging**. The goal is to log an expense in under 5 seconds from opening the app.

## Features Implemented

### 1. Quick Add Expense (FAB)
- **Floating Action Button** - Always visible in the bottom-right corner
- **Click to open modal** with:
  - Auto-focused amount input (numeric keyboard on mobile)
  - Category pills with emojis for one-tap selection
  - Optional note field (collapsed by default)
  - Date picker (defaults to today)
  - Big "Save" button
- **Success toast** notification after saving
- **Auto-refresh** dashboard after adding expense

### 2. Finance Dashboard (`/finance`)

#### Today's Spending
- Large display: "RM X.XX / RM 60.00"
- Visual progress bar
- Percentage of daily budget
- Warning when over budget

#### This Week Chart
- Bar chart showing last 7 days of spending
- Day labels (Mon-Sun)
- Hover tooltips showing exact amounts
- Total spending for the week

#### Top Categories
- Top 5 spending categories for the week
- Shows: Icon, Category name, Amount, Percentage
- Sorted by amount (highest first)

#### Recent Transactions
- Last 10 expenses
- Each row shows: Category icon, Note/Category, Amount
- Hover to reveal delete button
- Click to confirm deletion

## Database Schema

The `expenses` table includes:
- `id` - UUID primary key
- `user_id` - Foreign key to auth.users
- `amount` - Decimal(10, 2)
- `category` - One of: food, transport, shopping, bills, personal, entertainment, health, others
- `note` - Text (optional)
- `date` - Date (defaults to current date)
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Row Level Security (RLS)** is enabled - users can only see their own expenses.

## Categories

1. **Food** 🍔 - Meals, groceries, snacks
2. **Transport** 🚗 - Fuel, parking, ride-sharing
3. **Shopping** 🛍️ - Clothing, electronics, general shopping
4. **Bills** 💡 - Utilities, subscriptions, rent
5. **Personal** 💅 - Self-care, grooming, personal items
6. **Entertainment** 🎮 - Movies, games, hobbies
7. **Health** 🏥 - Medicine, doctor visits, fitness
8. **Others** ⭐ - Miscellaneous expenses

## Budget Settings

**Current Default:**
- Daily budget: RM 60.00

This is currently hardcoded in `/lib/constants/expense-categories.ts`.

## Setup Required

### 1. Update Supabase Schema

If you already have the old expenses table, run the migration:

```sql
-- Run this in Supabase SQL Editor
-- File: supabase/migrations/001_update_expenses_table.sql
```

If you're setting up from scratch, run:

```sql
-- Run this in Supabase SQL Editor
-- File: supabase/schema.sql
```

### 2. Environment Variables

Make sure your `.env.local` has:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Test Locally

```bash
npm run dev
```

Visit:
- `http://localhost:3000/finance` - Finance Dashboard
- Click the **+** button to add an expense

### 4. Deploy

After local testing:

```bash
npm run build  # Should pass without errors
```

Then deploy to Vercel.

## File Structure

```
app/
  finance/
    page.tsx                    # Main Finance Dashboard page

components/
  expense/
    ExpenseFAB.tsx             # Floating Action Button
    QuickAddExpense.tsx        # Quick Add modal

  ui/
    dialog.tsx                 # Dialog component (Radix UI)
    textarea.tsx               # Textarea component
    sonner.tsx                 # Toast notifications

lib/
  constants/
    expense-categories.ts      # Category config with icons/labels

  services/
    expense-service.ts         # CRUD operations for expenses

types/
  database.types.ts            # TypeScript types (updated)

supabase/
  schema.sql                   # Main schema (updated)
  migrations/
    001_update_expenses_table.sql  # Migration for existing DBs
```

## Usage Flow

### Adding an Expense (Target: < 5 seconds)

1. Open app → Navigate to `/finance`
2. Click **+** button (bottom-right)
3. Type amount (keyboard auto-opens on mobile)
4. Tap category pill
5. Click **Save**
6. Done! ✅

**Optional:** Add note or change date before saving.

## Technical Details

### Service Functions

Located in `/lib/services/expense-service.ts`:

- `createExpense()` - Add new expense
- `getExpenses()` - Get all expenses (with optional limit)
- `getTodayExpenses()` - Get today's expenses
- `getThisWeekExpenses()` - Get this week's expenses (Mon-Sun)
- `getExpenseStats()` - Calculate spending stats
- `getDailySpendingLast7Days()` - Data for weekly chart
- `updateExpense()` - Update existing expense
- `deleteExpense()` - Delete expense
- `formatCurrency()` - Format numbers as "RM X.XX"

### State Management

Uses React hooks:
- `useState` for component state
- `useEffect` for data loading
- No global state needed (data fetched on mount)

### Charts

Uses Recharts library for the weekly bar chart:
- Responsive container
- Custom tooltips
- Clean, minimal design

## Future Enhancements

Possible improvements:
- [ ] Configurable daily budget per user
- [ ] Monthly spending trends
- [ ] Budget alerts/notifications
- [ ] Export expenses to CSV
- [ ] Receipt photo upload
- [ ] Recurring expenses
- [ ] Budget categories (separate budget per category)
- [ ] Spending insights/analytics

## Testing Checklist

- [x] Build succeeds without errors
- [ ] Can add expense via FAB
- [ ] Modal closes after successful save
- [ ] Toast notification appears
- [ ] Dashboard updates with new expense
- [ ] Today's spending shows correct amount
- [ ] Weekly chart displays correctly
- [ ] Top categories show correct data
- [ ] Can delete expense
- [ ] RLS works (users see only their expenses)

## Troubleshooting

**Problem:** Modal doesn't open
- Check browser console for errors
- Ensure Dialog component is properly imported

**Problem:** Data not loading
- Check Supabase credentials in `.env.local`
- Verify RLS policies are enabled
- Check browser network tab for API errors

**Problem:** Build errors
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors with `npm run build`

## Performance Notes

- Data is fetched on page load
- FAB is lightweight and always visible
- Charts are responsive and optimized for mobile
- Toast notifications are performant (using Sonner)

---

Built with ❤️ for Muhammad Izzul Najmi's financial freedom journey.
