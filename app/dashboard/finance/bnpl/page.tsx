import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { Plus, ShoppingBag, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function BNPLPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: bnplItems } = await supabase
    .from('bnpl')
    .select('*, accounts(name, provider)')
    .eq('user_id', user.id)
    .order('next_due_date', { ascending: true });

  const activeBNPL = bnplItems?.filter(item => item.status === 'active') || [];
  const completedBNPL = bnplItems?.filter(item => item.status === 'completed') || [];
  const overdueBNPL = bnplItems?.filter(item => item.status === 'overdue') || [];

  const totalRemaining = activeBNPL.reduce((sum, item) => {
    const remaining = item.total_amount - (item.installment_amount * item.installments_paid);
    return sum + remaining;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Buy Now Pay Later</h1>
          <p className="text-muted-foreground">Track your installment purchases</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/finance/bnpl/new">
            <Plus className="h-4 w-4 mr-2" />
            Add BNPL
          </Link>
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-blue-600">{activeBNPL.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Remaining</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalRemaining)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completedBNPL.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Items */}
      {overdueBNPL.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Overdue
          </h2>
          <div className="space-y-2">
            {overdueBNPL.map((item) => (
              <BNPLCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Active BNPL */}
      {activeBNPL.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Active Purchases
          </h2>
          <div className="space-y-2">
            {activeBNPL.map((item) => (
              <BNPLCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No active BNPL purchases</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Track your installment purchases here
            </p>
            <Button asChild>
              <Link href="/dashboard/finance/bnpl/new">
                <Plus className="h-4 w-4 mr-2" />
                Add BNPL Purchase
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Completed BNPL */}
      {completedBNPL.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Completed ({completedBNPL.length})
          </h2>
          <div className="space-y-2">
            {completedBNPL.map((item) => (
              <BNPLCard key={item.id} item={item} completed />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BNPLCard({ item, completed = false }: { item: any; completed?: boolean }) {
  const progress = (item.installments_paid / item.installments_total) * 100;
  const remaining = item.total_amount - (item.installment_amount * item.installments_paid);

  const today = new Date();
  const dueDate = item.next_due_date ? new Date(item.next_due_date) : null;
  const daysUntilDue = dueDate
    ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isOverdue = item.status === 'overdue';
  const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 3;

  return (
    <Card className={isOverdue ? 'border-red-200 bg-red-50' : isDueSoon ? 'border-orange-200 bg-orange-50' : ''}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{item.item_name || 'Purchase'}</p>
              <p className="text-sm text-muted-foreground">{item.merchant}</p>
              {item.accounts && (
                <p className="text-xs text-muted-foreground mt-1">
                  via {item.accounts.provider}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{formatCurrency(item.total_amount)}</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(item.installment_amount)} × {item.installments_total}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {item.installments_paid} / {item.installments_total} paid
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {!completed && dueDate && (
            <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-700' : isDueSoon ? 'text-orange-700' : 'text-muted-foreground'}`}>
              <Calendar className="h-4 w-4" />
              {isOverdue ? (
                <span className="font-medium">Overdue!</span>
              ) : daysUntilDue === 0 ? (
                <span className="font-medium">Due today - {formatCurrency(item.installment_amount)}</span>
              ) : daysUntilDue === 1 ? (
                <span className="font-medium">Due tomorrow - {formatCurrency(item.installment_amount)}</span>
              ) : (
                <span>Next: {formatCurrency(item.installment_amount)} in {daysUntilDue} days</span>
              )}
            </div>
          )}

          {!completed && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium">
                Remaining: {formatCurrency(remaining)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
