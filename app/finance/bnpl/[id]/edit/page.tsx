import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CircleBackButton } from '@/components/ui/circle-back-button';
import { GlassCard } from '@/components/ui/glass-card';
import { BNPLForm } from '@/components/finance/bnpl/BNPLForm';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { BNPL, BNPLInstallment } from '@/types/database.types';

type EditBNPLPageProps = {
  params: Promise<{ id: string }>;
};

interface BNPLAccount {
  id: string;
  name: string | null;
  provider: string | null;
  icon: string | null;
}

interface BNPLWithAccount extends BNPL {
  accounts: BNPLAccount | null;
  installments: BNPLInstallment[];
}

function getDueDescriptor(nextDueDate?: string | null) {
  if (!nextDueDate) {
    return 'No due date set';
  }

  const today = new Date();
  const due = new Date(nextDueDate);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diff = Math.ceil((startOfDue.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    return `Overdue by ${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'}`;
  }
  if (diff === 0) {
    return 'Due today';
  }
  if (diff === 1) {
    return 'Due tomorrow';
  }
  return `Due in ${diff} days`;
}

export default async function EditBNPLPage({ params }: EditBNPLPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: bnpl } = await supabase
    .from('bnpl')
    .select('*, accounts:accounts(id, name, provider, icon), installments:bnpl_installments(id, sequence, amount, is_paid, due_date)')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!bnpl) {
    notFound();
  }

  const typed = bnpl as BNPLWithAccount;
  const schedule = (typed.installments ?? []).slice().sort((a, b) => a.sequence - b.sequence);
  const totalAmount = schedule.reduce((sum, inst) => sum + Number(inst.amount ?? 0), 0) || Number(typed.total_amount) || 0;
  const installmentsTotal = schedule.length || Number(typed.installments_total) || 0;
  const installmentsPaid =
    schedule.length > 0 ? schedule.filter((inst) => inst.is_paid).length : Number(typed.installments_paid) || 0;
  const remainingInstallments = Math.max(installmentsTotal - installmentsPaid, 0);
  const remainingBalance =
    schedule.length > 0
      ? schedule.filter((inst) => !inst.is_paid).reduce((sum, inst) => sum + Number(inst.amount ?? 0), 0)
      : Math.max(totalAmount - Number(typed.installment_amount ?? 0) * installmentsPaid, 0);
  const averageInstallment = installmentsTotal > 0 ? totalAmount / installmentsTotal : Number(typed.installment_amount ?? 0);
  const progress = installmentsTotal > 0 ? Math.round((installmentsPaid / installmentsTotal) * 100) : 0;

  return (
    <div className="space-y-8 pb-24 pt-4">
      <div className="flex items-center gap-4">
        <CircleBackButton />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">Edit BNPL purchase</h1>
          <p className="text-sm text-text-secondary">
            Keep the installment plan in sync with reality—adjust amounts, timing, or linked accounts effortlessly.
          </p>
        </div>
      </div>

      <GlassCard variant="light" hover={false} className="grid gap-4 sm:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-text-secondary">Plan</p>
          <p className="text-base font-semibold text-white">{typed.item_name || typed.merchant}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-text-secondary">Outstanding</p>
          <p className="text-lg font-semibold text-white">{formatCurrency(remainingBalance)}</p>
          <p className="text-xs text-text-secondary">
            {remainingInstallments} installment{remainingInstallments === 1 ? '' : 's'} ·{' '}
            {formatCurrency(averageInstallment)} each
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-text-secondary">Progress</p>
          <p className="text-base font-semibold text-white">{progress}% • {installmentsPaid}/{installmentsTotal}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-text-secondary">Next payment</p>
          <p className="text-base font-semibold text-white">
            {typed.next_due_date ? formatDate(new Date(typed.next_due_date)) : 'Set a due date'}
          </p>
          <p className="text-xs text-text-secondary">{getDueDescriptor(typed.next_due_date)}</p>
        </div>
      </GlassCard>

      <BNPLForm
        mode="edit"
        bnplId={typed.id}
        initialData={{
          ...typed,
          account: typed.accounts
            ? {
                id: typed.accounts.id,
                name: typed.accounts.name ?? 'Linked BNPL account',
                provider: typed.accounts.provider ?? 'BNPL',
                icon: typed.accounts.icon,
              }
            : null,
          installments: (typed.installments ?? [])
            .sort((a, b) => a.sequence - b.sequence)
            .map((inst) => ({
              id: inst.id,
              sequence: inst.sequence,
              amount: Number(inst.amount),
              is_paid: inst.is_paid,
              due_date: inst.due_date,
            })),
        }}
      />
    </div>
  );
}
