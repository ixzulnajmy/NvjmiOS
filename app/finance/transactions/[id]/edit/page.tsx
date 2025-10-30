import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CircleBackButton } from '@/components/ui/circle-back-button';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { GlassCard } from '@/components/ui/glass-card';
import { formatCurrency, formatDate } from '@/lib/utils';

interface EditTransactionPageProps {
  params: { id: string };
}

export default async function EditTransactionPage({ params }: EditTransactionPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: expense } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!expense) {
    notFound();
  }

  const occurredDate = expense.occurred_at ? new Date(expense.occurred_at) : new Date(expense.date);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4 pt-4">
        <CircleBackButton />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">Edit Transaction</h1>
          <p className="text-sm text-text-secondary">Refine the record so it mirrors exactly what happened.</p>
        </div>
      </div>

      <GlassCard variant="light" hover={false} className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-text-secondary">Amount</p>
          <p className="text-2xl font-semibold text-white">{formatCurrency(expense.amount)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-text-secondary">What</p>
          <p className="text-base font-medium text-white">{expense.item_name || expense.category}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-text-secondary">When</p>
          <p className="text-base font-medium text-white">
            {formatDate(occurredDate)} · {occurredDate.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </GlassCard>

      <TransactionForm mode="edit" transactionId={expense.id} initialData={expense} />
    </div>
  );
}
