import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import {
  DollarSign,
  CreditCard,
  Receipt,
  Wallet,
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';

export default async function FinancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch all financial data
  const [
    { data: accounts },
    { data: expenses },
    { data: bnpl },
    { data: creditCards },
  ] = await Promise.all([
    supabase.from('accounts').select('*').eq('user_id', user.id).eq('is_active', true),
    supabase.from('expenses').select('*').eq('user_id', user.id)
      .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
      .lte('date', new Date().toISOString().split('T')[0]),
    supabase.from('bnpl').select('*').eq('user_id', user.id).eq('status', 'active'),
    supabase.from('credit_cards').select('*').eq('user_id', user.id).eq('status', 'pending'),
  ]);

  // Calculate financial overview
  const totalAvailable = accounts?.reduce((sum, acc) => {
    if (acc.account_type === 'savings' || acc.account_type === 'checking' || acc.account_type === 'ewallet') {
      return sum + (acc.balance || 0);
    }
    return sum;
  }, 0) || 0;

  const totalOwed = [
    ...(bnpl?.map(b => b.total_amount - (b.installment_amount * b.installments_paid)) || []),
    ...(creditCards?.map(c => c.total_amount - c.paid_amount) || [])
  ].reduce((sum, amount) => sum + amount, 0);

  const netWorth = totalAvailable - totalOwed;

  // This month spending
  const thisMonthSpent = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const monthlyBudget = 3000; // TODO: Get from user settings
  const spendingPercentage = (thisMonthSpent / monthlyBudget) * 100;

  // Upcoming payments (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const upcomingBNPL = bnpl?.filter(b => {
    if (!b.next_due_date) return false;
    const dueDate = new Date(b.next_due_date);
    return dueDate >= today && dueDate <= nextWeek;
  }) || [];

  const upcomingCC = creditCards?.filter(c => {
    const dueDate = new Date(c.due_date);
    return dueDate >= today && dueDate <= nextWeek;
  }) || [];

  const hasUpcoming = upcomingBNPL.length > 0 || upcomingCC.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Overview</h1>
        <p className="text-muted-foreground">Your complete financial picture</p>
      </div>

      {/* Financial Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Net Worth</p>
              <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netWorth)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalAvailable)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Owed</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalOwed)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Payments Alert */}
      {hasUpcoming && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="h-5 w-5" />
              Upcoming Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingBNPL.map((item) => {
              const daysUntil = Math.ceil((new Date(item.next_due_date!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-orange-900">{item.merchant} - BNPL</span>
                  <span className="font-medium text-orange-700">
                    {formatCurrency(item.installment_amount)} due in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                  </span>
                </div>
              );
            })}
            {upcomingCC.map((card) => {
              const daysUntil = Math.ceil((new Date(card.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={card.id} className="flex justify-between items-center text-sm">
                  <span className="text-orange-900">Credit Card Payment</span>
                  <span className="font-medium text-orange-700">
                    {formatCurrency(card.minimum_payment)} due in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* This Month Spending */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            This Month
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Spent</span>
            <span className="text-lg font-bold">
              {formatCurrency(thisMonthSpent)} / {formatCurrency(monthlyBudget)}
            </span>
          </div>
          <Progress value={Math.min(spendingPercentage, 100)} className="h-2" />
          {spendingPercentage > 100 && (
            <p className="text-sm text-red-600 font-medium">
              Over budget by {formatCurrency(thisMonthSpent - monthlyBudget)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/dashboard/finance/accounts">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="h-4 w-4" />
                Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {accounts?.length || 0} active
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/finance/bnpl">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                BNPL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {bnpl?.length || 0} active
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/finance/credit-cards">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                Credit Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {creditCards?.length || 0} pending
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/finance/transactions">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="h-4 w-4" />
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View all
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
