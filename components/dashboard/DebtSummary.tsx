import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle, TrendingDown } from 'lucide-react';

interface DebtSummaryProps {
  userId: string;
}

export async function DebtSummary({ userId }: DebtSummaryProps) {
  const supabase = await createClient();

  // Fetch all debts
  const { data: debts } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', userId);

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
    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-red-900">
          <TrendingDown className="h-5 w-5 text-red-600" />
          Debt Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Debt</span>
            <span className="text-2xl font-bold text-red-600">
              {formatCurrency(totalDebt)}
            </span>
          </div>
          <Progress value={percentagePaid} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {percentagePaid.toFixed(1)}% paid • Target: Debt-free by Dec 2026
          </p>
        </div>

        {upcomingPayments && upcomingPayments.length > 0 && (
          <div className="pt-3 border-t space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span>Upcoming Payments (Next 15 days)</span>
            </div>
            <div className="space-y-1">
              {upcomingPayments.slice(0, 3).map((debt) => (
                <div key={debt.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {debt.name} (Due: {debt.due_day})
                  </span>
                  <span className="font-medium">{formatCurrency(Number(debt.minimum_payment))}</span>
                </div>
              ))}
            </div>
            <p className="text-xs font-medium text-orange-600 pt-1">
              Total due: {formatCurrency(totalUpcoming)}
            </p>
          </div>
        )}

        <div className="pt-2 text-xs text-center text-muted-foreground">
          {debts?.length || 0} active debts
        </div>
      </CardContent>
    </Card>
  );
}
