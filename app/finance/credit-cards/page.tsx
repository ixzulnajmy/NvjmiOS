import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { Plus, CreditCard, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default async function CreditCardsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: creditCards } = await supabase
    .from('credit_cards')
    .select('*, accounts(name, provider, credit_limit)')
    .eq('user_id', user.id)
    .order('due_date', { ascending: true });

  const pendingCards = creditCards?.filter(card => card.status === 'pending') || [];
  const overdueCards = creditCards?.filter(card => card.status === 'overdue') || [];
  const paidCards = creditCards?.filter(card => card.status === 'paid') || [];

  const totalOutstanding = pendingCards.reduce((sum, card) => sum + (card.total_amount - card.paid_amount), 0);
  const totalMinimum = pendingCards.reduce((sum, card) => sum + card.minimum_payment, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Credit Cards</h1>
          <p className="text-muted-foreground">Manage your credit card statements</p>
        </div>
        <Button asChild>
          <Link href="/finance/credit-cards/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Statement
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
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-orange-600">{pendingCards.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalOutstanding)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Min Payment</p>
            <p className="text-2xl font-bold">
              {formatCurrency(totalMinimum)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Statements */}
      {overdueCards.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Overdue
          </h2>
          <div className="space-y-2">
            {overdueCards.map((card) => (
              <CreditCardStatementCard key={card.id} statement={card} />
            ))}
          </div>
        </div>
      )}

      {/* Pending Statements */}
      {pendingCards.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pending Statements
          </h2>
          <div className="space-y-2">
            {pendingCards.map((card) => (
              <CreditCardStatementCard key={card.id} statement={card} />
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No pending statements</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Track your credit card statements here
            </p>
            <Button asChild>
              <Link href="/finance/credit-cards/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Statement
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Paid Statements */}
      {paidCards.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Paid ({paidCards.length})
          </h2>
          <div className="space-y-2">
            {paidCards.map((card) => (
              <CreditCardStatementCard key={card.id} statement={card} paid />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CreditCardStatementCard({ statement, paid = false }: { statement: any; paid?: boolean }) {
  const account = statement.accounts;
  const remainingBalance = statement.total_amount - statement.paid_amount;
  const paymentProgress = (statement.paid_amount / statement.total_amount) * 100;

  const today = new Date();
  const dueDate = new Date(statement.due_date);
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const isOverdue = statement.status === 'overdue';
  const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3 && !paid;

  return (
    <Card className={isOverdue ? 'border-red-200 bg-red-50' : isDueSoon ? 'border-orange-200 bg-orange-50' : ''}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{account?.name || 'Credit Card'}</p>
              <p className="text-sm text-muted-foreground">{account?.provider}</p>
              {account?.credit_limit && (
                <p className="text-xs text-muted-foreground mt-1">
                  Limit: {formatCurrency(account.credit_limit)}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{formatCurrency(statement.total_amount)}</p>
              {statement.statement_date && (
                <p className="text-xs text-muted-foreground">
                  Statement: {new Date(statement.statement_date).toLocaleDateString('en-MY')}
                </p>
              )}
            </div>
          </div>

          {!paid && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Progress</span>
                <span className="font-medium">
                  {formatCurrency(statement.paid_amount)} / {formatCurrency(statement.total_amount)}
                </span>
              </div>
              <Progress value={paymentProgress} className="h-2" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Min Payment</p>
              <p className="font-semibold">{formatCurrency(statement.minimum_payment)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Remaining</p>
              <p className="font-semibold">{formatCurrency(remainingBalance)}</p>
            </div>
          </div>

          {!paid && (
            <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-700' : isDueSoon ? 'text-orange-700' : 'text-muted-foreground'}`}>
              <Calendar className="h-4 w-4" />
              {isOverdue ? (
                <span className="font-medium">Payment overdue!</span>
              ) : daysUntilDue === 0 ? (
                <span className="font-medium">Due today</span>
              ) : daysUntilDue === 1 ? (
                <span className="font-medium">Due tomorrow</span>
              ) : daysUntilDue < 0 ? (
                <span className="font-medium">Overdue by {Math.abs(daysUntilDue)} days</span>
              ) : (
                <span>Due in {daysUntilDue} days ({dueDate.toLocaleDateString('en-MY')})</span>
              )}
            </div>
          )}

          {statement.notes && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">{statement.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
