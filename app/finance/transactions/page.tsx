'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Filter, Calendar } from 'lucide-react';
import Link from 'next/link';
import { TransactionDetailModal } from '@/components/finance/TransactionDetailModal';

const categoryEmojis: Record<string, string> = {
  food: '🍔',
  transport: '🚗',
  girlfriend: '💝',
  shopping: '🛍️',
  bills: '📄',
  other: '📦',
};

const categoryLabels: Record<string, string> = {
  food: 'Food',
  transport: 'Transport',
  girlfriend: 'Girlfriend',
  shopping: 'Shopping',
  bills: 'Bills',
  other: 'Other',
};

const paymentMethodLabels: Record<string, string> = {
  qr_code: 'QR',
  apple_pay_tap: 'Apple Pay',
  physical_card_tap: 'Card',
  apple_pay_online: 'Apple Pay',
  bank_transfer: 'Transfer',
  fpx: 'FPX',
  cash: 'Cash',
};

export default function TransactionsPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  function handleExpenseClick(expense: any) {
    setSelectedExpense(expense);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setSelectedExpense(null);
  }

  function handleDeleted() {
    fetchExpenses(); // Refresh list
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
                    <Card
                      key={expense.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleExpenseClick(expense)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Category Icon */}
                          <div className="text-2xl">
                            {categoryEmojis[expense.category] || '📦'}
                          </div>

                          {/* Expense Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <p className="font-semibold truncate">
                                {expense.merchant_name || expense.description || 'Expense'}
                              </p>
                            </div>
                            {expense.description && expense.merchant_name && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {expense.description}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 flex-wrap">
                              <span className="capitalize">{categoryLabels[expense.category]}</span>
                              {expense.accounts && (
                                <>
                                  <span>•</span>
                                  <span>{expense.accounts.icon} {expense.accounts.provider}</span>
                                </>
                              )}
                              {expense.payment_methods && (
                                <>
                                  <span>•</span>
                                  <span>{paymentMethodLabels[expense.payment_methods.method_type]}</span>
                                </>
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

      {/* Transaction Detail Modal */}
      {selectedExpense && (
        <TransactionDetailModal
          expense={selectedExpense}
          open={modalOpen}
          onOpenChange={handleModalClose}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
