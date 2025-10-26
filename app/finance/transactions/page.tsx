'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Filter, Calendar } from 'lucide-react';
import Link from 'next/link';

const categoryEmojis: Record<string, string> = {
  food: '🍔',
  transport: '🚗',
  girlfriend: '💝',
  shopping: '🛍️',
  bills: '📄',
  other: '📦',
};

const paymentMethodLabels: Record<string, string> = {
  qr_code: 'QR Code',
  apple_pay_tap: 'Apple Pay Tap',
  physical_card_tap: 'Card Tap',
  apple_pay_online: 'Apple Pay Online',
  bank_transfer: 'Bank Transfer',
  fpx: 'FPX',
  cash: 'Cash',
};

export default function TransactionsPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth]);

  async function fetchExpenses() {
    setLoading(true);
    const supabase = createClient();

    const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        accounts(name, provider, color, icon),
        payment_methods(method_type)
      `)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .order('sort_order', { ascending: false });

    if (!error && data) {
      setExpenses(data);
    }
    setLoading(false);
  }

  // Group expenses by date
  const groupedExpenses = expenses.reduce((acc, expense) => {
    const date = expense.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(expense);
    return acc;
  }, {} as Record<string, typeof expenses>);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            {selectedMonth.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Month Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold">{expenses.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : expenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Start tracking your expenses
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedExpenses).map(([date, dayExpenses]) => {
            const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

            return (
              <div key={date} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-semibold text-sm">
                    {formatDate(new Date(date))}
                  </h3>
                  <span className="text-sm font-medium text-muted-foreground">
                    {formatCurrency(dayTotal)}
                  </span>
                </div>

                <div className="space-y-2">
                  {dayExpenses.map((expense) => (
                    <Card key={expense.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Category Icon */}
                          <div className="text-2xl">
                            {categoryEmojis[expense.category] || '📦'}
                          </div>

                          {/* Expense Details */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">
                              {expense.merchant_name || expense.description || expense.category}
                            </p>
                            {expense.description && expense.merchant_name && (
                              <p className="text-xs text-muted-foreground truncate">
                                {expense.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                              {expense.accounts && (
                                <span className="flex items-center gap-1">
                                  {expense.accounts.icon && <span>{expense.accounts.icon}</span>}
                                  <span>{expense.accounts.provider}</span>
                                </span>
                              )}
                              {expense.payment_methods && expense.accounts && <span>•</span>}
                              {expense.payment_methods && (
                                <span>{paymentMethodLabels[expense.payment_methods.method_type]}</span>
                              )}
                              {!expense.accounts && !expense.payment_methods && (
                                <span className="capitalize">{expense.category}</span>
                              )}
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {formatCurrency(expense.amount)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <Button
        asChild
        size="lg"
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg z-40"
      >
        <Link href="/finance/transactions/new">
          <Plus className="h-6 w-6" />
        </Link>
      </Button>
    </div>
  );
}
