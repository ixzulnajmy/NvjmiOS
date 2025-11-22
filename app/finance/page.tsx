import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { HARDCODED_USER_ID, DEFAULT_MONTHLY_BUDGET, CATEGORY_EMOJIS, PAYMENT_CHANNEL_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/constants';
import { FloatingAddButton } from '@/components/finance/FloatingAddButton';
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
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

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

export default async function FinancePage() {
  const supabase = await createClient();

  // Fetch all financial data using hardcoded user_id
  const [
    { data: accounts },
    { data: expenses },
    { data: bnpl },
    { data: creditCards },
  ] = await Promise.all([
    supabase.from('accounts').select('*').eq('user_id', HARDCODED_USER_ID).eq('is_active', true),
    supabase
      .from('expenses')
      .select(
        `*,
        accounts:accounts(id, name, provider, account_type),
        payment_methods:payment_methods(id, method_type)
      `
      )
      .eq('user_id', HARDCODED_USER_ID)
      .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
      .lte('date', new Date().toISOString().split('T')[0]),
    supabase
      .from('bnpl')
      .select(`*, accounts:accounts(id, name, provider, account_type), installments:bnpl_installments(sequence, amount, is_paid, due_date)`)
      .eq('user_id', HARDCODED_USER_ID)
      .eq('status', 'active'),
    supabase
      .from('credit_cards')
      .select(`*, accounts:accounts(id, name, provider, account_type)`)
      .eq('user_id', HARDCODED_USER_ID)
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

  // This month spending
  const thisMonthSpent = expenses?.filter(exp => exp.transaction_type === 'expense').reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const monthlyBudget = DEFAULT_MONTHLY_BUDGET;
  const spendingPercentage = (thisMonthSpent / monthlyBudget) * 100;

  // Upcoming payments (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  // Calculate next payday (assume end of month for now)
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

  const totalDueBeforePayday = bnplDueBeforePayday + ccDueBeforePayday;
  const availableToSpend = totalAvailable - totalDueBeforePayday;

  // Color coding for available to spend
  const getAvailableColor = () => {
    if (availableToSpend < 0) return 'text-red-400';
    if (availableToSpend < 500) return 'text-orange-400';
    return 'text-green-400';
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

      const emoji = CATEGORY_EMOJIS[expense.category] ?? '💳';
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
          ? PAYMENT_CHANNEL_LABELS[expense.payment_channel] || expense.payment_channel
          : undefined,
        expense.payment_methods?.method_type
          ? PAYMENT_METHOD_LABELS[expense.payment_methods.method_type] || expense.payment_methods.method_type
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
            ? 'bg-green-500/20 text-green-400'
            : expense.transaction_type === 'transfer'
            ? 'bg-blue-400/20 text-blue-200'
            : 'bg-red-500/15 text-red-400',
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
    .slice(0, 5);

  const typeLabels: Record<CombinedTransaction['type'], string> = {
    expense: 'Expense',
    income: 'Income',
    transfer: 'Transfer',
    bnpl: 'BNPL',
    credit: 'Credit',
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Available to Spend - Hero Card */}
      <GlassCard variant="strong" className="text-center">
        <p className="text-sm text-white/60 mb-2">Available to Spend</p>
        <h1 className={`text-5xl font-bold tracking-tight ${getAvailableColor()}`}>
          {formatCurrency(availableToSpend)}
        </h1>
        {totalDueBeforePayday > 0 && (
          <p className="text-sm text-white/50 mt-3">
            (After {formatCurrency(totalDueBeforePayday)} due today)
          </p>
        )}
      </GlassCard>

      {/* This Month Spending */}
      <GlassCard variant="strong">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-white/80" />
          <h3 className="text-lg font-semibold text-white">This Month</h3>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl font-bold text-white">
            {formatCurrency(thisMonthSpent)}
          </span>
          <span className="text-sm text-white/60">
            / {formatCurrency(monthlyBudget)}
          </span>
        </div>
        <Progress
          value={Math.min(spendingPercentage, 100)}
          className="h-3 bg-white/10"
        />
        <p className="text-sm text-white/50 mt-2">
          {Math.round(spendingPercentage)}% of budget used
        </p>
      </GlassCard>

      {/* BNPL Due Next 7 Days */}
      {hasUpcoming && (
        <GlassCard variant="strong">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">BNPL Due Next 7 Days</h3>
          </div>
          <div className="space-y-2">
            {upcomingBNPL.map(({ plan, meta }) => {
              const dueDate = meta?.nextDueDate ? new Date(meta.nextDueDate) : null;
              const daysUntil =
                dueDate !== null
                  ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  : null;
              return (
                <Link
                  key={plan.id}
                  href={`/finance/bnpl/${plan.id}/edit`}
                  className="flex justify-between items-center glass-light rounded-xl p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ChevronRight className="h-4 w-4 text-white/40" />
                    <span className="text-white font-medium">{plan.merchant}</span>
                  </div>
                  <span className="font-semibold text-orange-400">
                    {formatCurrency(meta?.nextAmount ?? plan.installment_amount)}
                    {daysUntil !== null && (
                      <span className="text-white/50 text-sm ml-2">
                        {daysUntil === 0 ? 'Today' : `${daysUntil}d`}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
            {upcomingCC.map((card) => {
              const daysUntil = Math.ceil((new Date(card.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <Link
                  key={card.id}
                  href="/finance/credit-cards"
                  className="flex justify-between items-center glass-light rounded-xl p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ChevronRight className="h-4 w-4 text-white/40" />
                    <span className="text-white font-medium">Credit Card</span>
                  </div>
                  <span className="font-semibold text-orange-400">
                    {formatCurrency(card.minimum_payment)}
                    <span className="text-white/50 text-sm ml-2">
                      {daysUntil === 0 ? 'Today' : `${daysUntil}d`}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-semibold text-white">Recent</h3>
          <Link href="/finance/transactions" className="text-sm text-white/50 hover:text-white transition-colors">
            See all →
          </Link>
        </div>
        <GlassCard variant="strong" className="p-0" hover={false}>
          <div className="divide-y divide-white/5">
            {recentTransactions.length === 0 ? (
              <div className="px-5 py-8 text-center text-white/50">
                No transactions yet. Tap + to add one.
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
                    className="flex items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-white/5"
                  >
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-white truncate">
                          {transaction.title}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${transaction.accent}`}
                        >
                          {typeLabels[transaction.type]}
                        </span>
                      </div>
                      {transaction.meta && (
                        <p className="text-xs text-white/40">{transaction.meta}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-base font-semibold ${
                          isNeutral ? 'text-blue-200' : isInflow ? 'text-green-400' : 'text-white'
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

      {/* Floating Add Button */}
      <FloatingAddButton />
    </div>
  );
}
