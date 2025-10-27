import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/ui/glass-card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { Wallet } from 'lucide-react';
import { format } from 'date-fns';

interface TodaySpendingProps {
  userId: string;
}

export async function TodaySpending({ userId }: TodaySpendingProps) {
  const supabase = await createClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Fetch today's expenses
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today);

  const totalSpent = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  const dailyBudget = 60; // RM 60 daily budget
  const percentageSpent = (totalSpent / dailyBudget) * 100;

  // Group by category
  const byCategory = expenses?.reduce((acc, exp) => {
    const cat = exp.category;
    acc[cat] = (acc[cat] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <GlassCard variant="strong" className="bg-gradient-to-br from-blue-900/20 to-purple-900/20" hover={false}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Today&apos;s Spending</h3>
        </div>

        {/* Spending Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Daily Budget</span>
            <span className="text-lg font-bold text-white">
              {formatCurrency(totalSpent)} / {formatCurrency(dailyBudget)}
            </span>
          </div>
          <Progress
            value={Math.min(percentageSpent, 100)}
            className={`h-3 ${totalSpent > dailyBudget ? 'bg-error/20' : 'bg-card-elevated'}`}
          />
          {totalSpent > dailyBudget ? (
            <p className="text-xs text-error font-medium">
              Over budget by {formatCurrency(totalSpent - dailyBudget)}
            </p>
          ) : (
            <p className="text-xs text-text-secondary">
              {formatCurrency(dailyBudget - totalSpent)} remaining
            </p>
          )}
        </div>

        {/* Category Breakdown */}
        {Object.keys(byCategory).length > 0 && (
          <div className="space-y-2 pt-3 border-t border-white/10">
            {(Object.entries(byCategory) as [string, number][]).map(([category, amount]) => (
              <div key={category} className="flex justify-between text-sm glass-light rounded-lg p-2">
                <span className="text-text-secondary capitalize">{category}</span>
                <span className="font-medium text-white">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
