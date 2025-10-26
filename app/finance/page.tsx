"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ExpenseFAB } from '@/components/expense/ExpenseFAB';
import {
  getExpenseStats,
  getDailySpendingLast7Days,
  getExpenses,
  formatCurrency,
  deleteExpense,
} from '@/lib/services/expense-service';
import { DEFAULT_DAILY_BUDGET, EXPENSE_CATEGORIES } from '@/lib/constants/expense-categories';
import { Expense } from '@/types/database.types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function FinancePage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalToday: 0,
    totalThisWeek: 0,
    byCategory: {} as Record<string, number>,
  });
  const [weeklyData, setWeeklyData] = useState<{ date: string; amount: number }[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsData, weeklyDataRaw, expensesData] = await Promise.all([
        getExpenseStats(),
        getDailySpendingLast7Days(),
        getExpenses(10),
      ]);

      setStats(statsData);
      setWeeklyData(weeklyDataRaw);
      setRecentExpenses(expensesData);
    } catch (error) {
      console.error('Error loading finance data:', error);
      toast.error('Failed to load finance data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await deleteExpense(id);
      toast.success('Expense deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  const todayPercentage = (stats.totalToday / DEFAULT_DAILY_BUDGET) * 100;

  // Transform weekly data for chart
  const chartData = weeklyData.map((item) => {
    const date = new Date(item.date);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      day: dayNames[date.getDay()],
      amount: item.amount,
    };
  });

  // Get top categories
  const topCategories = Object.entries(stats.byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: stats.totalThisWeek > 0 ? (amount / stats.totalThisWeek) * 100 : 0,
    }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Finance Brain</h1>
              <p className="text-sm text-muted-foreground">Track your spending</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Today's Spending */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Today&apos;s Spending</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{formatCurrency(stats.totalToday)}</span>
              <span className="text-xl text-muted-foreground">/ {formatCurrency(DEFAULT_DAILY_BUDGET)}</span>
            </div>
            <Progress value={Math.min(todayPercentage, 100)} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {todayPercentage.toFixed(0)}% of daily budget
              {todayPercentage > 100 && (
                <span className="text-destructive font-medium"> • Over budget!</span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* This Week Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>This Week</CardTitle>
            <CardDescription>Daily spending for the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-2 shadow-lg">
                          <p className="text-sm font-medium">{payload[0].payload.day}</p>
                          <p className="text-sm text-primary">
                            {formatCurrency(payload[0].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Total this week</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalThisWeek)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
              <CardDescription>This week&apos;s spending by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topCategories.map(({ category, amount, percentage }) => {
                const categoryConfig = EXPENSE_CATEGORIES[category as keyof typeof EXPENSE_CATEGORIES];
                const Icon = categoryConfig?.icon;

                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {categoryConfig && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{categoryConfig.emoji}</span>
                          <span className="font-medium capitalize">{categoryConfig.label}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {percentage.toFixed(0)}%
                      </span>
                      <span className="font-semibold min-w-[80px] text-right">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Last 10 expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No expenses yet. Add your first expense using the + button!
              </p>
            ) : (
              <div className="space-y-2">
                {recentExpenses.map((expense) => {
                  const categoryConfig = EXPENSE_CATEGORIES[expense.category];
                  const expenseDate = new Date(expense.date);
                  const isToday = expenseDate.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{categoryConfig.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {expense.note || categoryConfig.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {isToday
                              ? 'Today'
                              : expenseDate.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatCurrency(expense.amount)}</span>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-lg"
                          aria-label="Delete expense"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <ExpenseFAB onExpenseAdded={loadData} />
    </div>
  );
}
