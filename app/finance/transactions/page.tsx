'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CircleBackButton } from '@/components/ui/circle-back-button';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Button3D } from '@/components/ui/button-3d';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CalendarCheck2, ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';

const categoryEmojis: Record<string, string> = {
  food: '🍜',
  transport: '🛵',
  girlfriend: '💝',
  shopping: '🛍️',
  bills: '🧾',
  other: '🪄',
  salary: '💼',
  investments: '📈',
  gifts: '🎁',
  subscriptions: '🔁',
  health: '💊',
  entertainment: '🎬',
  groceries: '🛒',
  travel: '✈️',
};

const paymentMethodLabels: Record<string, string> = {
  qr_code: 'QR Code',
  apple_pay_tap: 'Apple Pay • NFC',
  physical_card_tap: 'Physical Card',
  apple_pay_online: 'Apple Pay • Web',
  bank_transfer: 'Bank Transfer',
  fpx: 'FPX',
  cash: 'Cash',
};

const paymentChannelLabels: Record<string, string> = {
  mae_qr: 'MAE QR',
  apple_pay_nfc: 'Apple Pay • NFC',
  uob_one_credit: 'UOB One Credit Card',
  apple_pay_web: 'Apple Pay • Web',
  fpx_maybank2u: 'FPX Maybank2u',
  bank_transfer: 'Bank Transfer',
  cash: 'Cash',
  other: 'Other',
};

const counterpartyLabels: Record<string, string> = {
  merchant: 'Merchant',
  friend: 'Friend',
  family: 'Family',
  partner: 'Partner',
  work: 'Work / Client',
  charity: 'Charity',
};

type TransactionTypeFilter = 'all' | 'expense' | 'income' | 'transfer';

const typeFilterLabels: Record<TransactionTypeFilter, string> = {
  all: 'All',
  expense: 'Expense',
  income: 'Income',
  transfer: 'Transfer',
};

const typeAccentClass: Record<string, string> = {
  expense: 'text-error',
  income: 'text-success',
  transfer: 'text-blue-300',
};

function getMonthLabel(date: Date) {
  return date.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });
}

function getMonthBounds(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end };
}

type ExpenseRecord = any;

type GroupedExpenses = Record<string, ExpenseRecord[]>;

export default function TransactionsPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { start, end } = getMonthBounds(selectedMonth);

    const { data, error } = await supabase
      .from('expenses')
      .select(
        `*,
        accounts:accounts(id, name, provider, icon, account_type),
        payment_methods:payment_methods(id, method_type)
      `
      )
      .gte('date', start.toISOString().split('T')[0])
      .lte('date', end.toISOString().split('T')[0])
      .order('occurred_at', { ascending: false, nullsFirst: false })
      .order('date', { ascending: false })
      .order('sort_order', { ascending: false });

    if (!error && data) {
      setExpenses(data);
    }

    setLoading(false);
  }, [selectedMonth]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const filteredExpenses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return expenses.filter((expense) => {
      if (typeFilter !== 'all' && expense.transaction_type !== typeFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        expense.item_name,
        expense.merchant_name,
        expense.description,
        expense.category,
        expense.payment_channel,
        expense.accounts?.provider,
        expense.accounts?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [expenses, typeFilter, searchTerm]);

  const groupedExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc: GroupedExpenses, expense) => {
      const occurredAt = expense.occurred_at ? new Date(expense.occurred_at) : new Date(expense.date);
      const dateKey = occurredAt.toLocaleDateString('en-CA');

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }

      acc[dateKey].push({ ...expense, occurredAt });
      return acc;
    }, {} as GroupedExpenses);
  }, [filteredExpenses]);

  const totals = useMemo(() => {
    return filteredExpenses.reduce(
      (acc, expense) => {
        if (expense.transaction_type === 'income') {
          acc.inflow += expense.amount;
        } else if (expense.transaction_type === 'transfer') {
          acc.transfer += expense.amount;
        } else {
          acc.outflow += expense.amount;
        }
        return acc;
      },
      { inflow: 0, outflow: 0, transfer: 0 }
    );
  }, [filteredExpenses]);

  const handleMonthChange = (direction: 'previous' | 'next') => {
    setSelectedMonth((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + (direction === 'next' ? 1 : -1));
      return next;
    });
  };

  const hasTransactions = filteredExpenses.length > 0;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <CircleBackButton />
          <div>
            <h1 className="text-3xl font-bold text-white">Transactions</h1>
            <p className="text-sm text-text-secondary">Detailed, scannable history of every ringgit.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Button3D variant="primary" onClick={() => router.push('/finance/transactions/new')} className="hidden sm:inline-flex">
            Add Transaction
          </Button3D>
          <Button
            size="icon"
            variant="outline"
            className="rounded-full border-white/20 bg-white/10 text-white sm:hidden"
            onClick={() => router.push('/finance/transactions/new')}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <GlassCard variant="elevated" className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Selected month</p>
            <p className="text-2xl font-semibold text-white">{getMonthLabel(selectedMonth)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full border border-white/10 bg-white/5 text-white"
              onClick={() => handleMonthChange('previous')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full border border-white/10 bg-white/5 text-white"
              onClick={() => handleMonthChange('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-text-secondary">Spent</p>
            <p className="text-2xl font-semibold text-error">{formatCurrency(totals.outflow)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-text-secondary">Received</p>
            <p className="text-2xl font-semibold text-success">{formatCurrency(totals.inflow)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-text-secondary">Net Flow</p>
            <p className="text-2xl font-semibold text-white">
              {formatCurrency(totals.inflow - totals.outflow)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(Object.keys(typeFilterLabels) as TransactionTypeFilter[]).map((key) => {
              const isActive = typeFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTypeFilter(key)}
                  className={`rounded-full px-4 py-2 text-sm transition-all ${
                    isActive
                      ? 'bg-white/20 text-white shadow-[0_8px_20px_rgba(15,118,230,0.35)]'
                      : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {typeFilterLabels[key]}
                </button>
              );
            })}
          </div>
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search item, merchant, notes"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          </div>
        </div>
      </GlassCard>

      {loading ? (
        <GlassCard variant="light" hover={false} className="flex items-center justify-center py-12 text-text-secondary">
          Syncing your ledger…
        </GlassCard>
      ) : !hasTransactions ? (
        <GlassCard variant="light" hover={false} className="flex flex-col items-center gap-4 py-12 text-center">
          <CalendarCheck2 className="h-12 w-12 text-text-secondary" />
          <div>
            <h2 className="text-lg font-semibold text-white">No transactions yet</h2>
            <p className="text-sm text-text-secondary">
              Add your first entry to start charting your financial story for this month.
            </p>
          </div>
          <Button3D variant="primary" className="px-8" onClick={() => router.push('/finance/transactions/new')}>
            Add your first transaction
          </Button3D>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedExpenses)
            .sort((a, b) => (a[0] < b[0] ? 1 : -1))
            .map(([dateKey, dayExpenses]) => {
              const dayDate = new Date(dateKey);
              const dayOutflow = dayExpenses
                .filter((expense: ExpenseRecord) => expense.transaction_type !== 'income')
                .reduce((sum: number, expense: ExpenseRecord) => sum + expense.amount, 0);
              const dayInflow = dayExpenses
                .filter((expense: ExpenseRecord) => expense.transaction_type === 'income')
                .reduce((sum: number, expense: ExpenseRecord) => sum + expense.amount, 0);

              return (
                <div key={dateKey} className="space-y-3">
                  <div className="flex flex-col gap-1 px-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
                        {formatDate(dayDate)}
                      </p>
                    </div>
                    <div className="flex gap-3 text-xs text-text-secondary">
                      {dayOutflow > 0 && <span>Spent {formatCurrency(dayOutflow)}</span>}
                      {dayInflow > 0 && <span>Received {formatCurrency(dayInflow)}</span>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {dayExpenses.map((expense: ExpenseRecord) => {
                      const emoji = categoryEmojis[expense.category] || '📦';
                      const paymentLabel =
                        paymentMethodLabels[expense.payment_methods?.method_type as string] ||
                        paymentChannelLabels[expense.payment_channel as string] ||
                        '—';
                      const typeClass = typeAccentClass[expense.transaction_type] || 'text-white';
                      const counterpartyLabel = expense.counterparty_type
                        ? counterpartyLabels[expense.counterparty_type] || expense.counterparty_type
                        : null;
                      const timeLabel = expense.occurredAt
                        ? expense.occurredAt.toLocaleTimeString('en-MY', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '';

                      return (
                        <Link
                          key={expense.id}
                          href={`/finance/transactions/${expense.id}/edit`}
                          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                        >
                          <GlassCard className="gap-4 space-y-0" variant="light">
                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">
                                {emoji}
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-base font-semibold text-white">
                                        {expense.item_name || expense.description || expense.merchant_name || expense.category}
                                      </p>
                                      <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-xs capitalize text-text-secondary">
                                        {expense.category.replace('_', ' ')}
                                      </span>
                                      <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-xs capitalize text-text-secondary">
                                        {expense.transaction_type}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                                      {expense.merchant_name && <span>{expense.merchant_name}</span>}
                                      {counterpartyLabel && <span>• {counterpartyLabel}</span>}
                                      {expense.accounts?.provider && (
                                        <span>• {expense.accounts.provider} · {expense.accounts.name}</span>
                                      )}
                                      {paymentLabel && <span>• {paymentLabel}</span>}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-lg font-semibold ${typeClass}`}>
                                      {expense.transaction_type === 'income'
                                        ? `+${formatCurrency(expense.amount)}`
                                        : expense.transaction_type === 'transfer'
                                        ? formatCurrency(expense.amount)
                                        : `-${formatCurrency(expense.amount)}`}
                                    </p>
                                    <p className="text-xs text-text-secondary">{timeLabel}</p>
                                  </div>
                                </div>
                                {expense.description && (
                                  <p className="text-xs text-text-secondary">{expense.description}</p>
                                )}
                                <p className="text-[11px] uppercase tracking-[0.2em] text-text-secondary">
                                  Tap to edit · Keeps history perfectly synced
                                </p>
                              </div>
                            </div>
                          </GlassCard>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
