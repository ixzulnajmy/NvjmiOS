import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Today's Spending
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {formatCurrency(totalSpent)} / {formatCurrency(dailyBudget)}
            </span>
            <span className={`text-sm font-medium ${totalSpent > dailyBudget ? 'text-red-600' : 'text-green-600'}`}>
              {totalSpent > dailyBudget ? 'Over budget' : 'On track'}
            </span>
          </div>
          <Progress
            value={Math.min(percentageSpent, 100)}
            className={`h-2 ${totalSpent > dailyBudget ? 'bg-red-100' : ''}`}
          />
        </div>

        {Object.keys(byCategory).length > 0 && (
          <div className="space-y-1 pt-2 border-t">
            {Object.entries(byCategory).map(([category, amount]) => (
              <div key={category} className="flex justify-between text-sm">
                <span className="text-muted-foreground capitalize">{category}</span>
                <span className="font-medium">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
