import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/ui/glass-card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { HARDCODED_USER_ID } from '@/lib/constants';
import { AlertCircle, TrendingDown } from 'lucide-react';

export async function DebtSummary() {
  const supabase = await createClient();

  // Fetch all debts using hardcoded user_id
  const { data: debts } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', HARDCODED_USER_ID);

  const totalDebt = debts?.reduce((sum, debt) => sum + Number(debt.current_balance), 0) || 0;
  const totalOriginal = debts?.reduce((sum, debt) => sum + Number(debt.total_amount), 0) || 0;
  const percentagePaid = totalOriginal > 0 ? ((totalOriginal - totalDebt) / totalOriginal) * 100 : 0;

  // Get upcoming payments (next 15 days)
  const today = new Date();
  const fifteenDaysLater = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
  const currentDay = today.getDate();

  const upcomingPayments = debts?.filter((debt) => {
    if (!debt.due_day) return false;
    const dueDay = debt.due_day;
    return dueDay >= currentDay && dueDay <= fifteenDaysLater.getDate();
  }).sort((a, b) => (a.due_day || 0) - (b.due_day || 0));

  const totalUpcoming = upcomingPayments?.reduce((sum, debt) => sum + Number(debt.minimum_payment), 0) || 0;

  return (
    <GlassCard variant="strong" className="bg-gradient-to-br from-red-900/20 to-orange-900/20" hover={false}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-error" />
          <h3 className="text-lg font-semibold text-white">Debt Status</h3>
        </div>

        {/* Total Debt */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-white">Total Debt</span>
            <span className="text-2xl font-bold text-error">
              {formatCurrency(totalDebt)}
            </span>
          </div>
          <Progress value={percentagePaid} className="h-3 bg-card-elevated" />
          <p className="text-xs text-text-secondary">
            {percentagePaid.toFixed(1)}% paid • Target: Debt-free by Dec 2026
          </p>
        </div>

        {/* Upcoming Payments */}
        {upcomingPayments && upcomingPayments.length > 0 && (
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <AlertCircle className="h-4 w-4 text-error" />
              <span>Upcoming Payments (Next 15 days)</span>
            </div>
            <div className="space-y-2">
              {upcomingPayments.slice(0, 3).map((debt) => (
                <div key={debt.id} className="flex justify-between text-sm glass-light rounded-lg p-2">
                  <span className="text-text-secondary">
                    {debt.name} (Due: {debt.due_day})
                  </span>
                  <span className="font-medium text-white">{formatCurrency(Number(debt.minimum_payment))}</span>
                </div>
              ))}
            </div>
            <p className="text-xs font-medium text-error pt-1">
              Total due: {formatCurrency(totalUpcoming)}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 text-xs text-center text-text-secondary border-t border-white/10">
          {debts?.length || 0} active debts
        </div>
      </div>
    </GlassCard>
  );
}
