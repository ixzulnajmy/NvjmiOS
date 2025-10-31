import { CircleBackButton } from '@/components/ui/circle-back-button';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { createClient } from '@/lib/supabase/server';

export default async function NewTransactionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4 pt-4">
        <CircleBackButton />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">New Transaction</h1>
          <p className="text-sm text-text-secondary">Capture every detail so the ledger stays personal.</p>
        </div>
      </div>

      <TransactionForm mode="create" />
    </div>
  );
}
