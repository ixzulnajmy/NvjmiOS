import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CircleBackButton } from '@/components/ui/circle-back-button';
import { GlassCard } from '@/components/ui/glass-card';
import { AddBNPLButton } from '@/components/finance/bnpl/AddBNPLButton';
import { formatCurrency } from '@/lib/utils';
import type { BNPL, BNPLInstallment } from '@/types/database.types';
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface BNPLAccountSummary {
  name: string | null;
  provider: string | null;
  icon: string | null;
}

interface BNPLWithAccount extends BNPL {
  accounts: BNPLAccountSummary | null;
  installments: BNPLInstallment[];
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return 0;
}

function calculatePlanMetrics(plan: BNPLWithAccount) {
  const installments = (plan.installments || []).slice().sort((a, b) => a.sequence - b.sequence);
  const totalFromSchedule = installments.reduce((sum, inst) => sum + toNumber(inst.amount), 0);
  const total = installments.length > 0 ? totalFromSchedule : toNumber(plan.total_amount);
  const totalInstallments = installments.length || Number(plan.installments_total) || 0;
  const paidInstallments =
    installments.length > 0
      ? installments.filter((inst) => inst.is_paid).length
      : Number(plan.installments_paid) || 0;
  const remainingInstallments =
    installments.length > 0
      ? installments.filter((inst) => !inst.is_paid).length
      : Math.max(totalInstallments - paidInstallments, 0);
  const remainingBalance =
    installments.length > 0
      ? installments.filter((inst) => !inst.is_paid).reduce((sum, inst) => sum + toNumber(inst.amount), 0)
      : Math.max(total - toNumber(plan.installment_amount) * paidInstallments, 0);
  const nextInstallment =
    installments.find((inst) => !inst.is_paid)?.amount ?? plan.installment_amount ?? 0;
  const progress =
    totalInstallments > 0 ? Math.min(100, Math.round((paidInstallments / totalInstallments) * 100)) : 0;

  return {
    total,
    installment: toNumber(nextInstallment),
    totalInstallments,
    paidInstallments,
    remainingInstallments,
    remainingBalance,
    progress,
  };
}

function getDueState(plan: BNPLWithAccount) {
  if (plan.status === 'completed') {
    return { label: 'Completed', tone: 'text-emerald-300', dueDate: plan.next_due_date ? new Date(plan.next_due_date) : null };
  }

  if (!plan.next_due_date) {
    return {
      label: plan.status === 'overdue' ? 'Needs attention' : 'No due date set',
      tone: plan.status === 'overdue' ? 'text-error' : 'text-text-secondary',
      dueDate: null,
    };
  }

  const dueDate = new Date(plan.next_due_date);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDue = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const diff = Math.ceil((startOfDue.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0 || plan.status === 'overdue') {
    return { label: `Overdue by ${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'}`, tone: 'text-error', dueDate };
  }
  if (diff === 0) {
    return { label: 'Due today', tone: 'text-amber-300', dueDate };
  }
  if (diff === 1) {
    return { label: 'Due tomorrow', tone: 'text-amber-300', dueDate };
  }
  return {
    label: `Due in ${diff} days`,
    tone: diff <= 3 ? 'text-amber-300' : 'text-text-secondary',
    dueDate,
  };
}

const statusStyles: Record<BNPL['status'], string> = {
  active: 'border-sky-400/25 bg-sky-400/10 text-sky-100',
  overdue: 'border-red-500/30 bg-red-500/15 text-red-200',
  completed: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200',
};

export default async function BNPLPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from('bnpl')
    .select('*, accounts:accounts(name, provider, icon), installments:bnpl_installments(sequence, amount, is_paid, due_date)')
    .eq('user_id', user.id)
    .order('next_due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  const plans = (data || []) as BNPLWithAccount[];
  plans.forEach((plan) => {
    plan.installments = plan.installments ?? [];
  });
  const activePlans = plans.filter((plan) => plan.status === 'active');
  const overduePlans = plans.filter((plan) => plan.status === 'overdue');
  const completedPlans = plans.filter((plan) => plan.status === 'completed');

  const outstanding = activePlans.reduce((sum, plan) => sum + calculatePlanMetrics(plan).remainingBalance, 0);
  const monthlyInstallments = activePlans.reduce((sum, plan) => sum + calculatePlanMetrics(plan).installment, 0);

  const upcomingPlans = [...overduePlans, ...activePlans]
    .filter((plan) => plan.next_due_date)
    .sort((a, b) => {
      if (!a.next_due_date || !b.next_due_date) return 0;
      return new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime();
    });

  const highlightedPlan = upcomingPlans[0];
  const highlightedMetrics = highlightedPlan ? calculatePlanMetrics(highlightedPlan) : null;
  const hasPlans = plans.length > 0;

  return (
    <div className="space-y-8 pb-24 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <CircleBackButton />
          <div>
            <h1 className="text-3xl font-bold text-white">Buy Now Pay Later</h1>
            <p className="text-sm text-text-secondary">
              Monitor every installment commitment with a liquid-glass command center.
            </p>
          </div>
        </div>
        <AddBNPLButton />
      </div>

      {!hasPlans ? (
        <GlassCard variant="light" hover={false} className="flex flex-col items-center gap-5 py-16 text-center">
          <Sparkles className="h-12 w-12 text-text-secondary" />
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">No BNPL plans yet</h2>
            <p className="text-sm text-text-secondary">
              Capture your first installment purchase to start tracking pay-later commitments effortlessly.
            </p>
          </div>
          <AddBNPLButton />
        </GlassCard>
      ) : (
        <>
          <GlassCard variant="elevated" hover={false} className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-text-secondary">At a glance</p>
                <h2 className="text-xl font-semibold text-white">Your installment universe</h2>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wider text-text-secondary">Active plans</p>
                <p className="text-2xl font-semibold text-white">{activePlans.length}</p>
                <p className="text-xs text-text-secondary">{overduePlans.length} overdue</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wider text-text-secondary">Outstanding balance</p>
                <p className="text-2xl font-semibold text-white">{formatCurrency(outstanding)}</p>
                <p className="text-xs text-text-secondary">Across all active plans</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wider text-text-secondary">Monthly commitments</p>
                <p className="text-2xl font-semibold text-white">{formatCurrency(monthlyInstallments)}</p>
                <p className="text-xs text-text-secondary">Projected outgoing this cycle</p>
              </div>
            </div>
            {highlightedPlan ? (
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-sky-500/15 via-transparent to-emerald-400/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.25em] text-text-secondary">Next payment</p>
                    <p className="text-lg font-semibold text-white">
                      {highlightedPlan.item_name || highlightedPlan.merchant}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {highlightedPlan.accounts?.provider && highlightedPlan.accounts?.name
                        ? `${highlightedPlan.accounts.provider} · ${highlightedPlan.accounts.name}`
                        : highlightedPlan.accounts?.provider || 'No linked provider'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm uppercase tracking-[0.3em] text-text-secondary">Due amount</p>
                    <p className="text-xl font-semibold text-white">
                      {formatCurrency(highlightedMetrics?.installment || toNumber(highlightedPlan.installment_amount))}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {getDueState(highlightedPlan).label}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </GlassCard>

          {overduePlans.length > 0 && (
            <GlassCard
              variant="strong"
              className="space-y-4 border border-red-500/20 bg-gradient-to-br from-red-500/15 via-transparent to-rose-500/5"
            >
              <div className="flex items-center gap-3 text-sm font-semibold text-red-200">
                <AlertTriangle className="h-5 w-5" />
                Plans needing attention
              </div>
              <div className="space-y-3">
                {overduePlans.map((plan) => {
                  const metrics = calculatePlanMetrics(plan);
                  const due = getDueState(plan);
                  return (
                    <Link
                      key={plan.id}
                      href={`/finance/bnpl/${plan.id}/edit`}
                      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    >
                      <div className="rounded-2xl border border-red-500/30 bg-white/5 p-4 transition hover:bg-white/10">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-white">{plan.item_name || plan.merchant}</p>
                            <p className="text-xs text-red-200">{due.label}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm uppercase tracking-[0.3em] text-red-200">Due</p>
                            <p className="text-lg font-semibold text-white">
                              {formatCurrency(metrics.installment)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-red-200">
                          <span>
                            {metrics.paidInstallments}/{metrics.totalInstallments} paid · {formatCurrency(metrics.remainingBalance)} left
                          </span>
                          {plan.accounts?.provider && (
                            <span>• {plan.accounts.provider}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </GlassCard>
          )}

          {activePlans.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-text-secondary">
                <Activity className="h-4 w-4" />
                Active installments
              </div>
              <div className="space-y-4">
                {activePlans.map((plan) => {
                  const metrics = calculatePlanMetrics(plan);
                  const due = getDueState(plan);
                  const statusClass = statusStyles[plan.status];

                  return (
                    <Link
                      key={plan.id}
                      href={`/finance/bnpl/${plan.id}/edit`}
                      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    >
                      <GlassCard className="space-y-4" variant="light">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="text-lg font-semibold text-white">{plan.item_name || plan.merchant}</p>
                              <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${statusClass}`}>
                                {plan.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                              {plan.accounts?.provider && plan.accounts?.name && (
                                <span>
                                  {plan.accounts.provider} · {plan.accounts.name}
                                </span>
                              )}
                              <span>• {metrics.paidInstallments}/{metrics.totalInstallments} paid</span>
                              <span>• {formatCurrency(metrics.remainingBalance)} left</span>
                              <span>• {formatCurrency(metrics.installment)} per month</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm uppercase tracking-[0.3em] text-text-secondary">Total</p>
                            <p className="text-xl font-semibold text-white">{formatCurrency(metrics.total)}</p>
                            <p className="text-xs text-text-secondary">
                              {metrics.totalInstallments} × {formatCurrency(metrics.installment)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400"
                              style={{ width: `${metrics.progress}%` }}
                            />
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary">
                            <span>{metrics.progress}% complete</span>
                            <span className={`${due.tone} flex items-center gap-2 text-sm`}> 
                              <CalendarDays className="h-4 w-4" />
                              {due.dueDate
                                ? `${due.label} • ${due.dueDate.toLocaleDateString('en-MY', {
                                    day: '2-digit',
                                    month: 'short',
                                  })}`
                                : due.label}
                            </span>
                          </div>
                          {plan.notes ? (
                            <p className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-text-secondary">
                              {plan.notes}
                            </p>
                          ) : null}
                        </div>
                      </GlassCard>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {completedPlans.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-text-secondary">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Completed plans
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {completedPlans.map((plan) => {
                  const metrics = calculatePlanMetrics(plan);
                  const due = getDueState(plan);

                  return (
                    <Link
                      key={plan.id}
                      href={`/finance/bnpl/${plan.id}/edit`}
                      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    >
                      <GlassCard variant="light" className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-white">{plan.item_name || plan.merchant}</p>
                            <p className="text-xs text-text-secondary">{plan.accounts?.provider || 'Completed'}</p>
                          </div>
                          <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${statusStyles.completed}`}>
                            {plan.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-text-secondary">
                          <span>Total paid</span>
                          <span className="text-white">{formatCurrency(metrics.total)}</span>
                        </div>
                        <p className={`text-xs ${due.tone}`}>{due.label}</p>
                      </GlassCard>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
