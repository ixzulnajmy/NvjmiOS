'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CalendarDays, Loader2, RefreshCcw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { bnplSchema } from '@/schemas/account.schema';
import { GlassCard } from '@/components/ui/glass-card';
import { Button3D } from '@/components/ui/button-3d';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import type { BNPLStatus } from '@/types/database.types';

interface AccountOption {
  id: string;
  name: string;
  provider: string;
  icon?: string | null;
}

interface BNPLFormProps {
  mode: 'create' | 'edit';
  bnplId?: string;
  initialData?: {
    id?: string;
    account_id?: string | null;
    account?: AccountOption | null;
    merchant: string;
    item_name?: string | null;
    total_amount: number;
    installment_amount: number;
    installments_total: number;
    installments_paid: number;
    next_due_date?: string | null;
    status: BNPLStatus;
    notes?: string | null;
    installments?: {
      id?: string;
      sequence: number;
      amount: number;
      is_paid: boolean;
      due_date?: string | null;
    }[];
  };
}

interface InstallmentState {
  id?: string;
  sequence: number;
  amount: string;
  is_paid: boolean;
  due_date: string;
}

interface FormState {
  account_id: string;
  merchant: string;
  item_name: string;
  total_amount: string;
  installment_count: string;
  next_due_date: string;
  status: BNPLStatus;
  notes: string;
  installments: InstallmentState[];
}

const statusOptions: { value: BNPLStatus; label: string; hint: string }[] = [
  { value: 'active', label: 'Active', hint: 'Currently in progress' },
  { value: 'overdue', label: 'Overdue', hint: 'Payment behind schedule' },
  { value: 'completed', label: 'Completed', hint: 'All installments paid' },
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function BNPLForm({ mode, bnplId, initialData }: BNPLFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(() => ({
    account_id: initialData?.account_id ?? '',
    merchant: initialData?.merchant ?? '',
    item_name: initialData?.item_name ?? '',
    total_amount: initialData ? String(initialData.total_amount ?? '') : '',
    installment_count: initialData ? String(initialData.installments_total ?? '') : '',
    next_due_date: initialData?.next_due_date ? initialData.next_due_date.slice(0, 10) : '',
    status: initialData?.status ?? 'active',
    notes: initialData?.notes ?? '',
    installments:
      initialData?.installments?.map((inst) => ({
        id: inst.id,
        sequence: inst.sequence,
        amount: inst.amount.toFixed(2),
        is_paid: inst.is_paid,
        due_date: inst.due_date ? inst.due_date.slice(0, 10) : '',
      })) ?? [],
  }));
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installmentsDirty, setInstallmentsDirty] = useState(() => Boolean(initialData?.installments?.length));

  useEffect(() => {
    const loadAccounts = async () => {
      setAccountsLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from('accounts')
        .select('id, name, provider, icon')
        .eq('account_type', 'bnpl')
        .eq('is_active', true)
        .order('name');

      let options = data || [];

      if (
        initialData?.account_id &&
        !options.some((account) => account.id === initialData.account_id)
      ) {
        options = [
          ...options,
          {
            id: initialData.account_id,
            name: initialData.account?.name ?? 'Linked BNPL account',
            provider: initialData.account?.provider ?? 'BNPL',
            icon: initialData.account?.icon,
          },
        ];
      }

      setAccounts(options);
      setAccountsLoading(false);

      if (!initialData?.account_id && options.length > 0) {
        setFormState((prev) => ({
          ...prev,
          account_id: prev.account_id || options[0].id,
        }));
      }
    };

    loadAccounts();
  }, [initialData?.account_id, initialData?.account]);

  useEffect(() => {
    if (installmentsDirty) return;
    const total = parseFloat(formState.total_amount);
    const count = parseInt(formState.installment_count || '0', 10);

    if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(count) || count <= 0) {
      if (formState.installments.length > 0) {
        setFormState((prev) => ({
          ...prev,
          installments: [],
        }));
      }
      return;
    }

    const centsTotal = Math.round(total * 100);
    if (centsTotal <= 0) {
      if (formState.installments.length > 0) {
        setFormState((prev) => ({
          ...prev,
          installments: [],
        }));
      }
      return;
    }

    setFormState((prev) => {
      const base = Math.floor(centsTotal / count);
      let remainder = centsTotal - base * count;
      const newInstallments = Array.from({ length: count }, (_, index) => {
        const amountCents = base + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
        const prevInst = prev.installments.find((inst) => inst.sequence === index + 1);
        return {
          id: prevInst?.id,
          sequence: index + 1,
          amount: (amountCents / 100).toFixed(2),
          is_paid: prevInst?.is_paid ?? false,
          due_date: prevInst?.due_date ?? '',
        };
      });

      const unchanged =
        newInstallments.length === prev.installments.length &&
        newInstallments.every((inst, idx) => {
          const prevInst = prev.installments[idx];
          return (
            prevInst &&
            inst.amount === prevInst.amount &&
            inst.is_paid === prevInst.is_paid &&
            inst.id === prevInst.id &&
            inst.due_date === prevInst.due_date
          );
        });

      if (unchanged) {
        return prev;
      }

      return {
        ...prev,
        installments: newInstallments,
      };
    });
  }, [formState.total_amount, formState.installment_count, formState.installments.length, installmentsDirty]);

  const scheduleSummary = useMemo(() => {
    const installments = formState.installments;
    if (installments.length === 0) {
      const totalInput = parseFloat(formState.total_amount) || 0;
      return {
        total: totalInput,
        totalInstallments: 0,
        paidInstallments: 0,
        remainingInstallments: 0,
        outstanding: totalInput,
        progress: 0,
        nextInstallmentAmount: null,
        paidAmount: 0,
        averageInstallment: totalInput,
      };
    }

    let total = 0;
    let paidAmount = 0;
    const paidInstallments = installments.filter((inst) => inst.is_paid).length;
    installments.forEach((inst) => {
      const amount = parseFloat(inst.amount) || 0;
      total += amount;
      if (inst.is_paid) {
        paidAmount += amount;
      }
    });

    const outstanding = Math.max(total - paidAmount, 0);
    const nextInstallment = installments.find((inst) => !inst.is_paid);

    return {
      total,
      totalInstallments: installments.length,
      paidInstallments,
      remainingInstallments: installments.length - paidInstallments,
      outstanding,
      progress:
        installments.length > 0 ? Math.min(100, Math.round((paidInstallments / installments.length) * 100)) : 0,
      nextInstallmentAmount: nextInstallment ? parseFloat(nextInstallment.amount) || 0 : null,
      paidAmount,
      averageInstallment: installments.length > 0 ? total / installments.length : total,
    };
  }, [formState.installments, formState.total_amount]);

  const dueDateInsights = useMemo(() => {
    const sourceDate = formState.next_due_date || '';
    if (!sourceDate) {
      return {
        label: 'No due date set yet',
        tone: 'text-text-secondary',
      };
    }

    const dueDate = startOfDay(new Date(sourceDate));
    const today = startOfDay(new Date());
    const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      return {
        label: `Overdue by ${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'}`,
        tone: 'text-error',
      };
    }

    if (diff === 0) {
      return {
        label: 'Due today',
        tone: 'text-amber-300',
      };
    }

    if (diff === 1) {
      return {
        label: 'Due tomorrow',
        tone: 'text-amber-300',
      };
    }

    return {
      label: `Due in ${diff} days`,
      tone: diff <= 3 ? 'text-amber-300' : 'text-text-secondary',
    };
  }, [formState.next_due_date]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const normalizedInstallments = formState.installments.map((inst, index) => ({
        sequence: index + 1,
        amount: parseFloat(inst.amount),
        is_paid: inst.is_paid,
        due_date: inst.due_date ? inst.due_date : undefined,
        paid_at: inst.is_paid ? inst.due_date || undefined : undefined,
      }));

      if (normalizedInstallments.some((inst) => !Number.isFinite(inst.amount) || inst.amount <= 0)) {
        throw new Error('Each installment needs a valid amount greater than zero.');
      }

      const payload = {
        account_id: formState.account_id || undefined,
        merchant: formState.merchant.trim(),
        item_name: formState.item_name.trim() || undefined,
        total_amount: parseFloat(formState.total_amount),
        installments: normalizedInstallments,
        next_due_date: formState.next_due_date || undefined,
        status: formState.status,
        notes: formState.notes.trim() || undefined,
      };

      const validated = bnplSchema.parse(payload);
      const scheduleTotal = Number(
        validated.installments.reduce((sum, installment) => sum + installment.amount, 0).toFixed(2)
      );
      const installmentsTotal = validated.installments.length;
      const installmentsPaid = validated.installments.filter((inst) => inst.is_paid).length;
      const averageInstallment =
        installmentsTotal > 0 ? Number((scheduleTotal / installmentsTotal).toFixed(2)) : scheduleTotal;
      const nextDueDate =
        validated.next_due_date ||
        validated.installments.find((inst) => !inst.is_paid)?.due_date ||
        null;
      const derivedStatus =
        installmentsTotal > 0 && installmentsPaid === installmentsTotal ? 'completed' : validated.status;

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to manage BNPL plans.');
      }

      let planId = bnplId;

      if (mode === 'create') {
        const { data: insertData, error: insertError } = await supabase
          .from('bnpl')
          .insert({
            user_id: user.id,
            account_id: validated.account_id,
            merchant: validated.merchant,
            item_name: validated.item_name,
            total_amount: scheduleTotal,
            installment_amount: averageInstallment,
            installments_total: installmentsTotal,
            installments_paid: installmentsPaid,
            next_due_date: nextDueDate,
            status: derivedStatus,
            notes: validated.notes,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        planId = insertData?.id ?? undefined;
      } else if (mode === 'edit' && bnplId) {
        const { error: updateError } = await supabase
          .from('bnpl')
          .update({
            account_id: validated.account_id,
            merchant: validated.merchant,
            item_name: validated.item_name,
            total_amount: scheduleTotal,
            installment_amount: averageInstallment,
            installments_total: installmentsTotal,
            installments_paid: installmentsPaid,
            next_due_date: nextDueDate,
            status: derivedStatus,
            notes: validated.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', bnplId)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
        planId = bnplId;

        await supabase.from('bnpl_installments').delete().eq('bnpl_id', bnplId);
      }

      if (!planId) {
        throw new Error('Unable to determine BNPL plan identifier.');
      }

      if (validated.installments.length > 0) {
        const schedulePayload = validated.installments.map((inst) => ({
          bnpl_id: planId!,
          sequence: inst.sequence,
          amount: Number(inst.amount.toFixed(2)),
          due_date: inst.due_date ?? null,
          is_paid: inst.is_paid,
          paid_at: inst.is_paid ? inst.paid_at ?? null : null,
        }));

        const { error: scheduleError } = await supabase.from('bnpl_installments').insert(schedulePayload);
        if (scheduleError) throw scheduleError;
      }

      router.replace('/finance/bnpl');
      router.refresh();
    } catch (err: any) {
      console.error('Failed to submit BNPL form', err);
      setError(err.message ?? 'Something went wrong while saving your BNPL plan.');
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  };

  const handleCancel = () => {
    router.push('/finance/bnpl');
  };

  const totalFieldValue = parseFloat(formState.total_amount) || 0;
  const scheduleMismatch =
    formState.installments.length > 0 && Math.abs(scheduleSummary.total - totalFieldValue) >= 0.05;
  const isScheduleReady = formState.installments.length > 0;
  const showAccountPlaceholder = !accountsLoading && accounts.length === 0;

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_320px]">
      <GlassCard variant="elevated" hover={false} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="account_id" className="text-xs uppercase tracking-[0.25em] text-text-secondary">
            Linked BNPL account
          </Label>
          {accountsLoading ? (
            <div className="flex h-10 items-center justify-center text-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : showAccountPlaceholder ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-4 text-sm text-text-secondary">
              You haven&apos;t created a BNPL account yet. Add one under Finance → Accounts to keep purchases grouped.
            </div>
          ) : (
            <Select
              value={formState.account_id || ''}
              onValueChange={(value) => setFormState((prev) => ({ ...prev, account_id: value }))}
            >
              <SelectTrigger id="account_id" className="bg-white/5 text-left text-sm text-white">
                <SelectValue placeholder="Select BNPL provider" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 text-white">
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <span className="flex items-center gap-2">
                      {account.icon ? <span>{account.icon}</span> : null}
                      <span>{account.name}</span>
                      <span className="text-xs text-text-secondary">{account.provider}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="merchant" className="text-xs uppercase tracking-[0.25em] text-text-secondary">
            Merchant / store
          </Label>
          <Input
            id="merchant"
            required
            placeholder="e.g., Apple Store, Shopee, Lazada"
            value={formState.merchant}
            onChange={(event) => setFormState((prev) => ({ ...prev, merchant: event.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="item_name" className="text-xs uppercase tracking-[0.25em] text-text-secondary">
            Item name
          </Label>
          <Input
            id="item_name"
            placeholder="What did you buy?"
            value={formState.item_name}
            onChange={(event) => setFormState((prev) => ({ ...prev, item_name: event.target.value }))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="total_amount" className="text-xs uppercase tracking-[0.25em] text-text-secondary">
              Total amount (RM)
            </Label>
            <Input
              id="total_amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formState.total_amount}
              onChange={(event) => {
                const value = event.target.value;
                setFormState((prev) => ({ ...prev, total_amount: value }));
                setInstallmentsDirty(false);
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="installment_count" className="text-xs uppercase tracking-[0.25em] text-text-secondary">
              Total installments
            </Label>
            <Input
              id="installment_count"
              type="number"
              inputMode="numeric"
              min="1"
              placeholder="e.g., 3, 6, 12"
              value={formState.installment_count}
              onChange={(event) => {
                const value = event.target.value;
                setFormState((prev) => ({ ...prev, installment_count: value }));
                setInstallmentsDirty(false);
              }}
              required
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-text-secondary">Installment schedule</p>
              <p className="text-xs text-text-secondary">
                We evenly distributed the total across each installment. Tweak the amounts and mark paid ones below.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 px-3"
              onClick={() => setInstallmentsDirty(false)}
              disabled={formState.installments.length === 0}
            >
              <RefreshCcw className="h-4 w-4" />
              Redistribute
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {formState.installments.length === 0 ? (
              <p className="text-sm text-text-secondary">
                Enter a total amount and number of installments to generate a schedule.
              </p>
            ) : (
              formState.installments.map((installment) => (
                <div
                  key={installment.sequence}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-black/20 p-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`installment-${installment.sequence}`}
                      checked={installment.is_paid}
                      onCheckedChange={(checked) =>
                        setFormState((prev) => ({
                          ...prev,
                          installments: prev.installments.map((inst) =>
                            inst.sequence === installment.sequence
                              ? { ...inst, is_paid: Boolean(checked) }
                              : inst
                          ),
                        }))
                      }
                    />
                    <div>
                      <label
                        htmlFor={`installment-${installment.sequence}`}
                        className="text-sm font-semibold text-white"
                      >
                        Installment {installment.sequence}
                      </label>
                      <p className="text-xs text-text-secondary">
                        {installment.is_paid ? 'Marked as paid' : 'Pending payment'}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 sm:flex-none sm:w-32">
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={installment.amount}
                      onChange={(event) => {
                        const value = event.target.value;
                        setInstallmentsDirty(true);
                        setFormState((prev) => ({
                          ...prev,
                          installments: prev.installments.map((inst) =>
                            inst.sequence === installment.sequence ? { ...inst, amount: value } : inst
                          ),
                        }));
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {formState.installments.length > 0 && (
            <div className="pt-3 text-xs text-text-secondary">
              Sum of installments: {formatCurrency(scheduleSummary.total)}{' '}
              {scheduleMismatch && (
                <span className="text-error">· Adjust the amounts or total so everything adds up</span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="next_due_date" className="text-xs uppercase tracking-[0.25em] text-text-secondary">
            Next due date
          </Label>
          <Input
            id="next_due_date"
            type="date"
            value={formState.next_due_date}
            onChange={(event) => setFormState((prev) => ({ ...prev, next_due_date: event.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-[0.25em] text-text-secondary">Plan status</Label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const isActive = formState.status === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormState((prev) => ({ ...prev, status: option.value }))}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    isActive
                      ? 'bg-white/20 text-white shadow-[0_8px_18px_rgba(59,130,246,0.25)]'
                      : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="font-semibold">{option.label}</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] opacity-70">{option.hint}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-xs uppercase tracking-[0.25em] text-text-secondary">
            Notes
          </Label>
          <Input
            id="notes"
            placeholder="Optional reminders"
            value={formState.notes}
            onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" variant="ghost" className="text-text-secondary hover:text-white" onClick={handleCancel}>
            Cancel
          </Button>
          <Button3D type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </span>
            ) : mode === 'create' ? (
              'Add BNPL purchase'
            ) : (
              'Save changes'
            )}
          </Button3D>
        </div>
      </GlassCard>

      <div className="space-y-4">
        <GlassCard hover={false} className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-text-secondary">Plan snapshot</p>
            <h2 className="text-xl font-semibold text-white">
              {formState.item_name || formState.merchant || 'New BNPL purchase'}
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400"
                  style={{ width: `${scheduleSummary.progress}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                <span>
                  {scheduleSummary.paidInstallments} / {scheduleSummary.totalInstallments || '—'} paid
                </span>
                <span>• {formatCurrency(scheduleSummary.outstanding || 0)} remaining</span>
                <span>
                  • {scheduleSummary.remainingInstallments} installment
                  {scheduleSummary.remainingInstallments === 1 ? '' : 's'} left
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
              <CalendarDays className="h-4 w-4 text-text-secondary" />
              <div className="flex flex-col">
                <span className={`text-xs uppercase tracking-[0.3em] ${dueDateInsights.tone}`}>
                  {dueDateInsights.label}
                </span>
                <span>
                  {formState.next_due_date
                    ? new Date(formState.next_due_date).toLocaleDateString('en-MY', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Pick a due date to get reminders'}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-text-secondary">
              <div className="flex items-center justify-between">
                <span>Total financed</span>
                <span className="text-white">{formatCurrency(scheduleSummary.total)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Average per installment</span>
                <span className="text-white">
                  {scheduleSummary.totalInstallments > 0
                    ? formatCurrency(scheduleSummary.total / scheduleSummary.totalInstallments)
                    : 'RM 0.00'}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Next payment</span>
                <span className="text-white">
                  {scheduleSummary.nextInstallmentAmount !== null
                    ? formatCurrency(scheduleSummary.nextInstallmentAmount)
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {showAccountPlaceholder ? (
          <GlassCard hover={false} className="space-y-3 border border-sky-500/20 bg-sky-500/5">
            <div className="flex items-center gap-2 text-sm text-white">
              <RefreshCcw className="h-4 w-4 text-sky-300" />
              <span>Link BNPL providers</span>
            </div>
            <p className="text-sm text-text-secondary">
              Add your Atome, ShopeePay Later, or Grab PayLater accounts so each purchase stays perfectly synced.
            </p>
            <Button
              type="button"
              variant="link"
              className="justify-start px-0 text-sky-300 hover:text-sky-200"
              onClick={() => router.push('/finance/accounts/new')}
            >
              Add BNPL provider →
            </Button>
          </GlassCard>
        ) : null}
      </div>
    </form>
  );
}
