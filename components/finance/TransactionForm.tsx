'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { expenseSchema, expenseCategories, transactionTypeEnum } from '@/schemas/expense.schema';
import { Button3D } from '@/components/ui/button-3d';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Calendar, CreditCard, Wallet2 } from 'lucide-react';

type TransactionFormState = {
  amount: string;
  transaction_type: (typeof transactionTypeEnum)[number];
  category: (typeof expenseCategories)[number];
  item_name: string;
  merchant_name: string;
  description: string;
  date: string;
  time: string;
  account_id: string;
  payment_method_id: string;
  payment_channel: string;
  counterparty_type: string;
  sort_order: number;
};

type AccountOption = {
  id: string;
  name: string;
  provider: string;
  icon?: string;
};

type PaymentMethodOption = {
  id: string;
  method_type: string;
  label?: string;
};

export type TransactionFormProps = {
  mode: 'create' | 'edit';
  transactionId?: string;
  initialData?: {
    id: string;
    amount: number;
    transaction_type?: string;
    category: string;
    item_name?: string | null;
    merchant_name?: string | null;
    description?: string | null;
    date: string;
    occurred_at?: string | null;
    account_id?: string | null;
    payment_method_id?: string | null;
    payment_channel?: string | null;
    counterparty_type?: string | null;
    sort_order?: number | null;
  } | null;
};

const paymentChannelOptions: { value: string; label: string }[] = [
  { value: 'mae_qr', label: 'MAE QR' },
  { value: 'apple_pay_nfc', label: 'Apple Pay • NFC' },
  { value: 'uob_one_credit', label: 'UOB One Credit Card' },
  { value: 'apple_pay_web', label: 'Apple Pay • Web' },
  { value: 'fpx_maybank2u', label: 'FPX Maybank2u' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
];

const counterpartyOptions: { value: string; label: string }[] = [
  { value: 'merchant', label: 'Merchant / Store' },
  { value: 'friend', label: 'Friend' },
  { value: 'family', label: 'Family' },
  { value: 'partner', label: 'Partner' },
  { value: 'work', label: 'Work / Client' },
  { value: 'charity', label: 'Charity / Donation' },
  { value: 'other', label: 'Other' },
];

const typeMeta: Record<(typeof transactionTypeEnum)[number], { label: string; subtitle: string }> = {
  expense: { label: 'Expense', subtitle: 'Money going out' },
  income: { label: 'Income', subtitle: 'Money coming in' },
  transfer: { label: 'Transfer', subtitle: 'Moving between accounts' },
};

const categoryGroups = [
  {
    label: 'Spending',
    options: ['food', 'transport', 'shopping', 'girlfriend', 'entertainment', 'groceries', 'travel', 'other'] as const,
  },
  {
    label: 'Bills & Commitments',
    options: ['bills', 'subscriptions', 'health'] as const,
  },
  {
    label: 'Inflow',
    options: ['salary', 'investments', 'gifts'] as const,
  },
];

function getInitialTime(date?: string | null) {
  if (!date) return new Date().toISOString().slice(11, 16);
  try {
    return new Date(date).toISOString().slice(11, 16);
  } catch (error) {
    return '12:00';
  }
}

function buildInitialState(initialData?: TransactionFormProps['initialData']): TransactionFormState {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const initialDate = initialData?.date ?? today;
  const initialTime = initialData?.occurred_at ? getInitialTime(initialData.occurred_at) : now.toISOString().slice(11, 16);

  return {
    amount: initialData ? initialData.amount.toString() : '',
    transaction_type: (initialData?.transaction_type as TransactionFormState['transaction_type']) ?? 'expense',
    category: (initialData?.category as TransactionFormState['category']) ?? 'food',
    item_name: initialData?.item_name ?? '',
    merchant_name: initialData?.merchant_name ?? '',
    description: initialData?.description ?? '',
    date: initialDate,
    time: initialTime,
    account_id: initialData?.account_id ?? '',
    payment_method_id: initialData?.payment_method_id ?? '',
    payment_channel: initialData?.payment_channel ?? '',
    counterparty_type: initialData?.counterparty_type ?? '',
    sort_order: initialData?.sort_order ?? 0,
  };
}

export function TransactionForm({ mode, transactionId, initialData }: TransactionFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<TransactionFormState>(() => buildInitialState(initialData));
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormState(buildInitialState(initialData));
  }, [initialData]);

  const supabase = useMemo(() => createClient(), []);

  const fetchAccounts = useCallback(async () => {
    const { data } = await supabase
      .from('accounts')
      .select('id, name, provider, icon')
      .eq('is_active', true)
      .order('name');

    if (data) {
      setAccounts(data as AccountOption[]);
    }
  }, [supabase]);

  const fetchPaymentMethods = useCallback(
    async (accountId: string) => {
      const { data } = await supabase
        .from('payment_methods')
        .select('id, method_type')
        .eq('account_id', accountId)
        .order('is_default', { ascending: false });

      if (data) {
        setPaymentMethods(data as PaymentMethodOption[]);
      }
    },
    [supabase]
  );

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (formState.account_id) {
      fetchPaymentMethods(formState.account_id);
    } else {
      setPaymentMethods([]);
      setFormState((prev) => ({ ...prev, payment_method_id: '' }));
    }
  }, [fetchPaymentMethods, formState.account_id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;

      if (!user) {
        throw new Error('You must be signed in to manage transactions');
      }

      const occurredAt = new Date(`${formState.date}T${formState.time || '00:00'}:00`);

      const payload = expenseSchema.parse({
        amount: parseFloat(formState.amount),
        transaction_type: formState.transaction_type,
        category: formState.category,
        item_name: formState.item_name,
        merchant_name: formState.merchant_name || undefined,
        description: formState.description || undefined,
        date: formState.date,
        occurred_at: occurredAt.toISOString(),
        account_id: formState.account_id || undefined,
        payment_method_id: formState.payment_method_id || undefined,
        payment_channel: formState.payment_channel || undefined,
        counterparty_type: formState.counterparty_type || undefined,
        sort_order: formState.sort_order ?? 0,
      });

      if (Number.isNaN(payload.amount)) {
        throw new Error('Please enter a valid amount');
      }

      if (mode === 'create') {
        const { error: insertError } = await supabase.from('expenses').insert({
          user_id: user.id,
          ...payload,
        });

        if (insertError) throw insertError;
      } else if (transactionId) {
        const { error: updateError } = await supabase
          .from('expenses')
          .update(payload)
          .eq('id', transactionId);

        if (updateError) throw updateError;
      }

      router.push('/finance/transactions');
      router.refresh();
    } catch (submitError: any) {
      console.error(submitError);
      setError(submitError.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const typeButtons = transactionTypeEnum.map((type) => {
    const isActive = formState.transaction_type === type;
    const meta = typeMeta[type];

    return (
      <motion.button
        key={type}
        type="button"
        onClick={() => setFormState((prev) => ({ ...prev, transaction_type: type }))}
        className={cn(
          'flex-1 rounded-2xl border px-4 py-3 text-left transition-all',
          'bg-white/5/60 backdrop-blur-sm border-white/10 shadow-inner',
          isActive ? 'border-white/30 bg-white/15 text-white' : 'text-text-secondary hover:border-white/20 hover:text-white'
        )}
        whileTap={{ scale: 0.98 }}
      >
        <p className="text-sm font-semibold capitalize">{meta.label}</p>
        <p className="text-xs text-text-secondary">{meta.subtitle}</p>
      </motion.button>
    );
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <GlassCard variant="elevated" className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Transaction type</h2>
          <p className="text-sm text-text-secondary">Choose whether this is an expense, income or a transfer.</p>
          <div className="flex gap-3">
            {typeButtons}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (RM)</Label>
            <Input
              id="amount"
              inputMode="decimal"
              type="number"
              step="0.01"
              required
              value={formState.amount}
              onChange={(event) => setFormState((prev) => ({ ...prev, amount: event.target.value }))}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item_name">Item / Purpose</Label>
            <Input
              id="item_name"
              value={formState.item_name}
              onChange={(event) => setFormState((prev) => ({ ...prev, item_name: event.target.value }))}
              placeholder="E.g. Dinner at WAW, UOB bill, Grab ride"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formState.category}
              onValueChange={(value) => setFormState((prev) => ({ ...prev, category: value as TransactionFormState['category'] }))}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryGroups.map((group) => (
                  <div key={group.label}>
                    <p className="px-3 pt-2 text-xs font-semibold uppercase text-text-secondary">{group.label}</p>
                    {group.options.map((option) => (
                      <SelectItem key={option} value={option} className="capitalize">
                        {option.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="merchant_name">Merchant / Receiver</Label>
            <Input
              id="merchant_name"
              value={formState.merchant_name}
              onChange={(event) => setFormState((prev) => ({ ...prev, merchant_name: event.target.value }))}
              placeholder="Who did you pay or receive from?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="counterparty_type">Relationship</Label>
            <Select
              value={formState.counterparty_type || 'none'}
              onValueChange={(value) =>
                setFormState((prev) => ({ ...prev, counterparty_type: value === 'none' ? '' : value }))
              }
            >
              <SelectTrigger id="counterparty_type">
                <SelectValue placeholder="Who is this to you?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not specified</SelectItem>
                {counterpartyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Notes</Label>
            <Input
              id="description"
              value={formState.description}
              onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Any extra context — e.g. receipt number, project, vibe"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>When</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  value={formState.date}
                  onChange={(event) => setFormState((prev) => ({ ...prev, date: event.target.value }))}
                  required
                  className="pr-10"
                />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              </div>
              <div className="relative">
                <Input
                  id="time"
                  type="time"
                  value={formState.time}
                  onChange={(event) => setFormState((prev) => ({ ...prev, time: event.target.value }))}
                  required
                  className="pr-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_channel">Payment Channel</Label>
            <Select
              value={formState.payment_channel || 'none'}
              onValueChange={(value) =>
                setFormState((prev) => ({ ...prev, payment_channel: value === 'none' ? '' : value }))
              }
            >
              <SelectTrigger id="payment_channel">
                <SelectValue placeholder="How did this happen?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not specified</SelectItem>
                {paymentChannelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="account_id">Account</Label>
            <Select
              value={formState.account_id || 'none'}
              onValueChange={(value) =>
                setFormState((prev) => ({ ...prev, account_id: value === 'none' ? '' : value }))
              }
            >
              <SelectTrigger id="account_id">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No account</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <span className="flex items-center gap-2">
                      <Wallet2 className="h-4 w-4" />
                      <span className="truncate">
                        {account.icon ? `${account.icon} ` : ''}
                        {account.provider} · {account.name}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method_id">Payment Method</Label>
            <Select
              value={formState.payment_method_id || 'none'}
              onValueChange={(value) =>
                setFormState((prev) => ({ ...prev, payment_method_id: value === 'none' ? '' : value }))
              }
              disabled={paymentMethods.length === 0}
            >
              <SelectTrigger id="payment_method_id">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific method</SelectItem>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="capitalize">{method.method_type.replace(/_/g, ' ')}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-text-secondary">
            Transactions are saved instantly and sync to the dashboard and insights.
          </p>
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <Button3D type="submit" variant="primary" disabled={loading} className="md:min-w-[160px]">
              {loading ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Add Transaction'}
            </Button3D>
            <Button3D
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => router.back()}
              className="md:min-w-[160px]"
            >
              Cancel
            </Button3D>
          </div>
        </div>
      </GlassCard>
    </form>
  );
}
