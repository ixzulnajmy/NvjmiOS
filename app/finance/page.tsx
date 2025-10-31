import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { CircleBackButton } from '@/components/ui/circle-back-button';
import { FinanceQuickActions } from '@/components/finance/FinanceQuickActions';
import { Button3D } from '@/components/ui/button-3d';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import type {
  Account,
  BNPL,
  BNPLInstallment,
  CreditCard,
  Expense,
  PaymentMethod,
} from '@/types/database.types';
import {
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export default async function FinancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch all financial data
  const [
    { data: accounts },
    { data: expenses },
    { data: bnpl },
    { data: creditCards },
  ] = await Promise.all([
    supabase.from('accounts').select('*').eq('user_id', user.id).eq('is_active', true),
    supabase
      .from('expenses')
      .select(
        `*,
        accounts:accounts(id, name, provider, account_type),
        payment_methods:payment_methods(id, method_type)
      `
      )
      .eq('user_id', user.id)
      .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
      .lte('date', new Date().toISOString().split('T')[0]),
    supabase
      .from('bnpl')
      .select(`*, accounts:accounts(id, name, provider, account_type), installments:bnpl_installments(sequence, amount, is_paid, due_date)`)
      .eq('user_id', user.id)
      .eq('status', 'active'),
    supabase
      .from('credit_cards')
      .select(`*, accounts:accounts(id, name, provider, account_type)`)
      .eq('user_id', user.id)
      .eq('status', 'pending'),
  ]);

  const bnplWithAccounts = (bnpl || []) as BNPLWithAccount[];
  const bnplMetrics = new Map<
    string,
    { remainingBalance: number; nextAmount: number; nextDueDate: string | null }
  >();

  bnplWithAccounts.forEach((plan) => {
    const schedule = (plan.installments ?? []).slice().sort((a, b) => a.sequence - b.sequence);
    const remainingBalance = schedule
      .filter((inst) => !inst.is_paid)
      .reduce((sum, inst) => sum + Number(inst.amount ?? 0), 0);
    const nextInstallment = schedule.find((inst) => !inst.is_paid);
    const nextAmount =
      nextInstallment !== undefined ? Number(nextInstallment.amount ?? 0) : Number(plan.installment_amount ?? 0);
    const nextDueDate = nextInstallment?.due_date ?? plan.next_due_date ?? null;
    bnplMetrics.set(plan.id, {
      remainingBalance,
      nextAmount,
      nextDueDate,
    });
  });

  // Calculate financial overview
  const totalAvailable = accounts?.reduce((sum, acc) => {
    if (acc.account_type === 'savings' || acc.account_type === 'checking' || acc.account_type === 'ewallet') {
      return sum + (acc.balance || 0);
    }
    return sum;
  }, 0) || 0;

  const totalBnplOutstanding = bnplWithAccounts.reduce(
    (sum, plan) => sum + (bnplMetrics.get(plan.id)?.remainingBalance ?? 0),
    0
  );
  const totalCreditOutstanding =
    creditCards?.reduce((sum, card) => sum + (card.total_amount - card.paid_amount), 0) || 0;

  const totalOwed = totalBnplOutstanding + totalCreditOutstanding;

  const netWorth = totalAvailable - totalOwed;

  // This month spending
  const thisMonthSpent = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const monthlyBudget = 3000; // TODO: Get from user settings
  const spendingPercentage = (thisMonthSpent / monthlyBudget) * 100;

  // Upcoming payments (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  // Calculate next payday (assume end of month for now, can be configured later)
  const nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const upcomingBNPL = bnplWithAccounts
    .map((plan) => ({
      plan,
      meta: bnplMetrics.get(plan.id),
    }))
    .filter(({ meta }) => {
      if (!meta?.nextDueDate) return false;
      const dueDate = new Date(meta.nextDueDate);
      return dueDate >= today && dueDate <= nextWeek;
    });

  const upcomingCC = creditCards?.filter(c => {
    const dueDate = new Date(c.due_date);
    return dueDate >= today && dueDate <= nextWeek;
  }) || [];

  const hasUpcoming = upcomingBNPL.length > 0 || upcomingCC.length > 0;

  // Calculate "Available to Spend" - payments due before next payday
  const bnplDueBeforePayday = bnplWithAccounts
    .filter((plan) => {
      const meta = bnplMetrics.get(plan.id);
      if (!meta?.nextDueDate) return false;
      const dueDate = new Date(meta.nextDueDate);
      return dueDate >= today && dueDate <= nextPayday;
    })
    .reduce((sum, plan) => sum + (bnplMetrics.get(plan.id)?.nextAmount ?? 0), 0);

  const ccDueBeforePayday = creditCards?.filter(c => {
    const dueDate = new Date(c.due_date);
    return dueDate >= today && dueDate <= nextPayday;
  }).reduce((sum, c) => sum + c.minimum_payment, 0) || 0;

  const availableToSpend = totalAvailable - bnplDueBeforePayday - ccDueBeforePayday;

  // Color coding for available to spend
  const getAvailableColor = () => {
    if (availableToSpend < 0) return 'text-error';
    if (availableToSpend < 500) return 'text-orange-400';
    return 'text-success';
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

  type AccountSummary = Pick<Account, 'id' | 'name' | 'provider' | 'account_type'>;
  type PaymentMethodSummary = Pick<PaymentMethod, 'id' | 'method_type'>;
  type ExpenseWithRelations = Expense & {
    accounts?: AccountSummary | null;
    payment_methods?: PaymentMethodSummary | null;
  };
  type BNPLWithAccount = BNPL & { accounts?: AccountSummary | null; installments?: BNPLInstallment[] };
  type CreditCardWithAccount = CreditCard & { accounts?: AccountSummary | null };

  type CombinedTransaction = {
    id: string;
    title: string;
    subtitle?: string;
    occurredAt: Date;
    amount: number;
    direction: 'inflow' | 'outflow' | 'neutral';
    type: 'expense' | 'income' | 'transfer' | 'bnpl' | 'credit';
    href: string;
    accent: string;
    meta?: string;
  };

  const toShortDate = (date: Date) =>
    date.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' });

  const toShortTime = (date: Date) =>
    date.toLocaleTimeString('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const expensesWithRelations = (expenses ?? []) as ExpenseWithRelations[];
  const creditWithAccounts = (creditCards ?? []) as CreditCardWithAccount[];

  const expenseTransactions: CombinedTransaction[] = expensesWithRelations
    .map((expense) => {
      const occurredAt = expense.occurred_at
        ? new Date(expense.occurred_at)
        : new Date(`${expense.date}T00:00:00`);

      if (Number.isNaN(occurredAt.getTime())) {
        return null;
      }

      const emoji = categoryEmojis[expense.category] ?? '💳';
      const baseTitle = expense.item_name || expense.merchant_name || 'Transaction';
      const title = `${emoji} ${baseTitle}`;

      const detailParts = [
        expense.transaction_type === 'income'
          ? 'Income'
          : expense.transaction_type === 'transfer'
          ? 'Transfer'
          : 'Expense',
        expense.category ? expense.category.replace(/_/g, ' ') : undefined,
        expense.merchant_name && expense.merchant_name !== baseTitle
          ? expense.merchant_name
          : undefined,
        expense.payment_channel
          ? paymentChannelLabels[expense.payment_channel] || expense.payment_channel
          : undefined,
        expense.payment_methods?.method_type
          ? paymentMethodLabels[expense.payment_methods.method_type] || expense.payment_methods.method_type
          : undefined,
        expense.accounts?.name || expense.accounts?.provider,
      ].filter(Boolean);

      const subtitle = detailParts.join(' • ');
      const direction =
        expense.transaction_type === 'income'
          ? 'inflow'
          : expense.transaction_type === 'transfer'
          ? 'neutral'
          : 'outflow';

      return {
        id: `expense-${expense.id}`,
        title,
        subtitle,
        occurredAt,
        amount: expense.amount,
        direction,
        type: expense.transaction_type,
        href: `/finance/transactions/${expense.id}/edit`,
        accent:
          expense.transaction_type === 'income'
            ? 'bg-success/20 text-success'
            : expense.transaction_type === 'transfer'
            ? 'bg-blue-400/20 text-blue-200'
            : 'bg-error/15 text-error',
        meta: `${toShortDate(occurredAt)} • ${toShortTime(occurredAt)}`,
      } satisfies CombinedTransaction;
    })
    .filter(Boolean) as CombinedTransaction[];

  const bnplTransactions: CombinedTransaction[] = bnplWithAccounts
    .map((plan) => {
      const meta = bnplMetrics.get(plan.id);
      const dueDateString = meta?.nextDueDate ?? plan.next_due_date;
      if (!dueDateString) return null;
      const occurredAt = new Date(`${dueDateString}T00:00:00`);
      if (Number.isNaN(occurredAt.getTime())) {
        return null;
      }

      const schedule = plan.installments ?? [];
      const totalInstallments = schedule.length || plan.installments_total;
      const paidInstallments =
        schedule.length > 0 ? schedule.filter((inst) => inst.is_paid).length : plan.installments_paid;

      const subtitleParts = [
        `Installment ${Math.min(paidInstallments + 1, totalInstallments)} / ${totalInstallments}`,
        plan.accounts?.name || plan.accounts?.provider,
      ].filter(Boolean);

      return {
        id: `bnpl-${plan.id}`,
        title: `🌀 ${plan.merchant}`,
        subtitle: subtitleParts.join(' • '),
        occurredAt,
        amount: meta?.nextAmount ?? plan.installment_amount,
        direction: 'outflow',
        type: 'bnpl',
        href: `/finance/bnpl/${plan.id}/edit`,
        accent: 'bg-purple-500/20 text-purple-200',
        meta: `Due ${toShortDate(occurredAt)}`,
      } satisfies CombinedTransaction;
    })
    .filter(Boolean) as CombinedTransaction[];

  const creditTransactions: CombinedTransaction[] = creditWithAccounts
    .map((card) => {
      const occurredAt = new Date(`${card.due_date}T00:00:00`);
      if (Number.isNaN(occurredAt.getTime())) {
        return null;
      }

      const subtitleParts = [
        card.accounts?.name || card.accounts?.provider || 'Credit Card',
        card.notes,
      ].filter(Boolean);

      return {
        id: `credit-${card.id}`,
        title: '💳 Credit Card Payment',
        subtitle: subtitleParts.join(' • '),
        occurredAt,
        amount: card.minimum_payment,
        direction: 'outflow',
        type: 'credit',
        href: '/finance/credit-cards',
        accent: 'bg-sky-500/20 text-sky-200',
        meta: `Due ${toShortDate(occurredAt)}`,
      } satisfies CombinedTransaction;
    })
    .filter(Boolean) as CombinedTransaction[];

  const recentTransactions = [...expenseTransactions, ...bnplTransactions, ...creditTransactions]
    .filter((transaction) => transaction.occurredAt)
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .slice(0, 6);

  const typeLabels: Record<CombinedTransaction['type'], string> = {
    expense: 'Expense',
    income: 'Income',
    transfer: 'Transfer',
    bnpl: 'BNPL',
    credit: 'Credit',
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 pt-4">
        <CircleBackButton />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">Finance</h1>
          <p className="text-sm text-text-secondary">Your complete financial picture</p>
        </div>
      </div>

      {/* Quick Actions */}
      <FinanceQuickActions />

      {/* Hero Balance Section with Available to Spend */}
      <GlassCard variant="strong" className="bg-gradient-to-br from-green-900/20 to-blue-900/20">
        <div className="space-y-4">
          {/* Available to Spend - Primary Metric */}
          <div className="text-center pb-4 border-b border-white/10">
            <p className="text-sm text-text-secondary mb-1">Available to Spend</p>
            <h2 className={`text-4xl font-bold ${getAvailableColor()}`}>
              {formatCurrency(availableToSpend)}
            </h2>
            <p className="text-xs text-text-secondary mt-2">
              After {formatCurrency(bnplDueBeforePayday + ccDueBeforePayday)} payments due before next payday
            </p>
          </div>

          {/* Net Worth */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Net Worth</p>
              <div className="flex items-baseline gap-2">
                <h3 className={`text-2xl font-bold ${netWorth >= 0 ? 'text-success' : 'text-error'}`}>
                  {formatCurrency(netWorth)}
                </h3>
                <div className="flex items-center gap-1 text-success text-sm">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>+5.5%</span>
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-1">Last Week</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link href="/finance/transactions/new" className="flex-1">
              <Button3D variant="primary" className="w-full">
                Deposit
              </Button3D>
            </Link>
            <Link href="/finance/expenses?action=add" className="flex-1">
              <Button3D variant="secondary" className="w-full">
                Send
              </Button3D>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-xs text-text-secondary">In Accounts</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(totalAvailable)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Total Owed</p>
              <p className="text-xl font-bold text-error">
                {formatCurrency(totalOwed)}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Upcoming Payments Alert */}
      {hasUpcoming && (
        <GlassCard variant="strong" className="bg-gradient-to-br from-orange-900/20 to-red-900/20">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-error" />
              <h3 className="text-lg font-semibold text-white">Upcoming Payments</h3>
            </div>
            <div className="space-y-2">
              {upcomingBNPL.map(({ plan, meta }) => {
                const dueDate = meta?.nextDueDate ? new Date(meta.nextDueDate) : null;
                const daysUntil =
                  dueDate !== null
                    ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                return (
                  <div key={plan.id} className="flex justify-between items-center text-sm glass-light rounded-lg p-3">
                    <span className="text-white">{plan.merchant} - BNPL</span>
                    <span className="font-medium text-error">
                      {formatCurrency(meta?.nextAmount ?? plan.installment_amount)} •{' '}
                      {daysUntil !== null ? `${daysUntil}d` : '—'}
                    </span>
                  </div>
                );
              })}
              {upcomingCC.map((card) => {
                const daysUntil = Math.ceil((new Date(card.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={card.id} className="flex justify-between items-center text-sm glass-light rounded-lg p-3">
                    <span className="text-white">Credit Card Payment</span>
                    <span className="font-medium text-error">
                      {formatCurrency(card.minimum_payment)} • {daysUntil}d
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      )}

      {/* This Month Spending */}
      <GlassCard variant="strong">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-white" />
            <h3 className="text-lg font-semibold text-white">This Month</h3>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Spent</span>
            <span className="text-lg font-bold text-white">
              {formatCurrency(thisMonthSpent)} / {formatCurrency(monthlyBudget)}
            </span>
          </div>
          <Progress value={Math.min(spendingPercentage, 100)} className="h-3 bg-card-elevated" />
          {spendingPercentage > 100 && (
            <p className="text-sm text-error font-medium">
              Over budget by {formatCurrency(thisMonthSpent - monthlyBudget)}
            </p>
          )}
        </div>
      </GlassCard>

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <Link href="/finance/transactions" className="text-xs text-text-secondary hover:text-white transition-colors">
            See more →
          </Link>
        </div>
        <GlassCard variant="strong" className="p-0" hover={false}>
          <div className="divide-y divide-white/5">
            {recentTransactions.length === 0 ? (
              <div className="px-5 py-6 text-sm text-text-secondary">
                No activity logged yet. Start by adding a transaction, BNPL plan, or credit payment.
              </div>
            ) : (
              recentTransactions.map((transaction) => {
                const isInflow = transaction.direction === 'inflow';
                const isNeutral = transaction.direction === 'neutral';
                const amountLabel = formatCurrency(transaction.amount);

                return (
                  <Link
                    key={transaction.id}
                    href={transaction.href}
                    className="flex items-center gap-4 px-5 py-4 transition-colors duration-300 hover:bg-white/5"
                  >
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-white truncate">
                          {transaction.title}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${transaction.accent}`}
                        >
                          {typeLabels[transaction.type]}
                        </span>
                      </div>
                      {transaction.subtitle && (
                        <p className="text-xs text-text-secondary line-clamp-1">{transaction.subtitle}</p>
                      )}
                      {transaction.meta && (
                        <p className="text-xs text-text-tertiary">{transaction.meta}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-base font-semibold ${
                          isNeutral ? 'text-blue-200' : isInflow ? 'text-success' : 'text-white'
                        }`}
                      >
                        {isNeutral ? amountLabel : `${isInflow ? '+' : '−'}${amountLabel}`}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
