import { createClient } from '@/lib/supabase/client';
import { Expense, ExpenseCategory } from '@/types/database.types';

export interface CreateExpenseInput {
  amount: number;
  category: ExpenseCategory;
  note?: string;
  date: string; // Format: YYYY-MM-DD
}

export interface UpdateExpenseInput {
  amount?: number;
  category?: ExpenseCategory;
  note?: string;
  date?: string;
}

export interface ExpenseStats {
  totalToday: number;
  totalThisWeek: number;
  byCategory: Record<string, number>;
}

/**
 * Create a new expense
 */
export async function createExpense(input: CreateExpenseInput): Promise<Expense | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: user.id,
      amount: input.amount,
      category: input.category,
      note: input.note,
      date: input.date,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating expense:', error);
    throw error;
  }

  return data;
}

/**
 * Get all expenses for the current user
 */
export async function getExpenses(limit?: number): Promise<Expense[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get expenses for a specific date range
 */
export async function getExpensesByDateRange(
  startDate: string,
  endDate: string
): Promise<Expense[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching expenses by date range:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get expenses for today
 */
export async function getTodayExpenses(): Promise<Expense[]> {
  const today = new Date().toISOString().split('T')[0];
  return getExpensesByDateRange(today, today);
}

/**
 * Get expenses for this week (Monday to Sunday)
 */
export async function getThisWeekExpenses(): Promise<Expense[]> {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust when day is Sunday

  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const startDate = monday.toISOString().split('T')[0];
  const endDate = sunday.toISOString().split('T')[0];

  return getExpensesByDateRange(startDate, endDate);
}

/**
 * Calculate expense statistics
 */
export async function getExpenseStats(): Promise<ExpenseStats> {
  const todayExpenses = await getTodayExpenses();
  const weekExpenses = await getThisWeekExpenses();

  const totalToday = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalThisWeek = weekExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Calculate spending by category for this week
  const byCategory: Record<string, number> = {};
  weekExpenses.forEach((expense) => {
    if (!byCategory[expense.category]) {
      byCategory[expense.category] = 0;
    }
    byCategory[expense.category] += expense.amount;
  });

  return {
    totalToday,
    totalThisWeek,
    byCategory,
  };
}

/**
 * Get daily spending for the past 7 days
 */
export async function getDailySpendingLast7Days(): Promise<{ date: string; amount: number }[]> {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const startDate = sevenDaysAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const expenses = await getExpensesByDateRange(startDate, endDate);

  // Create a map of date -> total amount
  const dailyMap: Record<string, number> = {};

  // Initialize all 7 days with 0
  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo);
    date.setDate(sevenDaysAgo.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    dailyMap[dateStr] = 0;
  }

  // Sum up expenses for each day
  expenses.forEach((expense) => {
    if (dailyMap[expense.date] !== undefined) {
      dailyMap[expense.date] += expense.amount;
    }
  });

  // Convert to array format
  return Object.entries(dailyMap).map(([date, amount]) => ({
    date,
    amount,
  }));
}

/**
 * Update an expense
 */
export async function updateExpense(
  id: string,
  input: UpdateExpenseInput
): Promise<Expense | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('expenses')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating expense:', error);
    throw error;
  }

  return data;
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}

/**
 * Format currency in MYR
 */
export function formatCurrency(amount: number): string {
  return `RM ${amount.toFixed(2)}`;
}
