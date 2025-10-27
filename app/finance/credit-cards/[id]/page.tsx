import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Calendar, AlertCircle, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const categoryEmojis: Record<string, string> = {
  food: '🍔',
  transport: '🚗',
  girlfriend: '💝',
  shopping: '🛍️',
  bills: '📄',
  other: '📦',
};

export default async function StatementDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch statement with account details
  const { data: statement } = await supabase
    .from('credit_cards')
    .select('*, accounts(name, provider, icon, color)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!statement) {
    notFound();
  }

  // Fetch linked transactions
  const { data: linkedTransactions } = await supabase
    .from('expenses')
    .select('*')
    .eq('statement_id', params.id)
    .order('date', { ascending: false });

  const totalLinked = linkedTransactions?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const remainingBalance = statement.total_amount - statement.paid_amount;
  const paymentProgress = (statement.paid_amount / statement.total_amount) * 100;
  const difference = statement.total_amount - totalLinked;

  const today = new Date();
  const dueDate = new Date(statement.due_date);
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const isOverdue = statement.status === 'overdue' || daysUntilDue < 0;
  const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/finance/credit-cards">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{statement.accounts?.name || 'Credit Card'}</h1>
          <p className="text-sm text-muted-foreground">{statement.accounts?.provider}</p>
        </div>
      </div>

      {/* Statement Summary */}
      <Card className={isOverdue ? 'border-red-200 bg-red-50' : isDueSoon ? 'border-orange-200 bg-orange-50' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Statement Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Statement Date</p>
              <p className="font-semibold">
                {statement.statement_date ? formatDate(new Date(statement.statement_date)) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className={`font-semibold ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : ''}`}>
                {formatDate(new Date(statement.due_date))}
                {isOverdue && ' (Overdue!)'}
                {isDueSoon && !isOverdue && ` (${daysUntilDue} days)`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-xl font-bold">{formatCurrency(statement.total_amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(statement.paid_amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-xl font-bold text-orange-600">{formatCurrency(remainingBalance)}</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Payment Progress</span>
              <span>{Math.round(paymentProgress)}%</span>
            </div>
            <Progress value={paymentProgress} className="h-2" />
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">Minimum Payment</p>
            <p className="text-lg font-semibold">{formatCurrency(statement.minimum_payment)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Reconciliation Status */}
      <Card className={difference !== 0 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {difference === 0 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-900">Fully Reconciled</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold text-orange-900">
                    {difference > 0 ? 'Missing Transactions' : 'Extra Transactions'}
                  </span>
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Logged vs Statement</p>
              <p className={`font-bold ${difference === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {formatCurrency(totalLinked)} vs {formatCurrency(statement.total_amount)}
              </p>
              {difference !== 0 && (
                <p className="text-sm text-orange-700">
                  Difference: {formatCurrency(Math.abs(difference))}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Linked Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Linked Transactions ({linkedTransactions?.length || 0})
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/finance/credit-cards/${params.id}/reconcile`}>
                Find Transactions
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!linkedTransactions || linkedTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions linked to this statement</p>
              <Button variant="link" asChild className="mt-2">
                <Link href={`/finance/credit-cards/${params.id}/reconcile`}>
                  Link transactions →
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {linkedTransactions.map((expense) => (
                <div key={expense.id} className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow">
                  <div className="text-2xl">
                    {categoryEmojis[expense.category] || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {expense.merchant_name || expense.description || expense.category}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(new Date(expense.date))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(expense.amount)}</p>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total ({linkedTransactions.length} transactions)</span>
                  <span className="text-xl font-bold">{formatCurrency(totalLinked)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
