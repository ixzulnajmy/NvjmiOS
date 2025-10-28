import { GlassCard } from '@/components/ui/glass-card';
import { CircleBackButton } from '@/components/ui/circle-back-button';
import { QuickActionsGrid } from '@/components/ui/quick-actions-grid';
import { Button3D } from '@/components/ui/button-3d';
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
  Plus,
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
    { data: recentTransactions },
  ] = await Promise.all([
    supabase.from('accounts').select('*').eq('user_id', user.id).eq('is_active', true),
    supabase.from('expenses').select('*').eq('user_id', user.id)
      .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
      .lte('date', new Date().toISOString().split('T')[0]),
    supabase.from('bnpl').select('*').eq('user_id', user.id).eq('status', 'active'),
    supabase.from('credit_cards').select('*').eq('user_id', user.id).eq('status', 'pending'),
    supabase.from('expenses').select('*, accounts(name, icon, color)').eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10),
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

  // Calculate next payday (assume end of month for now, can be configured later)
  const nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, 0);

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

  // Calculate "Available to Spend" - payments due before next payday
  const bnplDueBeforePayday = bnpl?.filter(b => {
    if (!b.next_due_date) return false;
    const dueDate = new Date(b.next_due_date);
    return dueDate >= today && dueDate <= nextPayday;
  }).reduce((sum, b) => sum + b.installment_amount, 0) || 0;

  const ccDueBeforePayday = creditCards?.filter(c => {
    const dueDate = new Date(c.due_date);
    return dueDate >= today && dueDate <= nextPayday;
  }).reduce((sum, c) => sum + c.minimum_payment, 0) || 0;

  const availableToSpend = totalAvailable - bnplDueBeforePayday - ccDueBeforePayday;

  // Color coding for available to spend
  const getAvailableColor = () => {
    if (availableToSpend < 0) return 'text-error';
    if (availableToSpend < 500) return 'text-orange-400';
    return 'text-success';
  };

  const quickActions = [
    { icon: 'Plus', label: 'Add', href: '/finance/transactions/new' },
    { icon: 'Wallet', label: 'Accounts', href: '/finance/accounts' },
    { icon: 'Users', label: 'IOU', href: '/finance/iou' },
    { icon: 'BarChart3', label: 'Categories', href: '/finance/categories' },
    { icon: 'Settings', label: 'Settings', href: '/finance/settings' },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 pt-4">
        <CircleBackButton />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">Finance</h1>
          <p className="text-sm text-text-secondary">Your complete financial picture</p>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActionsGrid
        title="Quick Actions"
        actions={quickActions}
        showSeeAll={false}
      />

      {/* Hero Balance Section with Available to Spend */}
      <GlassCard variant="strong" className="bg-gradient-to-br from-green-900/20 to-blue-900/20">
        <div className="space-y-4">
          {/* Available to Spend - Primary Metric */}
          <div className="text-center pb-4 border-b border-white/10">
            <p className="text-sm text-text-secondary mb-1">Available to Spend</p>
            <h2 className={`text-4xl font-bold ${getAvailableColor()}`}>
              {formatCurrency(availableToSpend)}
            </h2>
            <p className="text-xs text-text-secondary mt-2">
              After {formatCurrency(bnplDueBeforePayday + ccDueBeforePayday)} payments due before next payday
            </p>
          </div>

          {/* Stats Grid - 3 columns */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 glass-light rounded-lg">
              <p className="text-xs text-text-secondary mb-1">Net Worth</p>
              <p className={`text-lg font-bold ${netWorth >= 0 ? 'text-success' : 'text-error'}`}>
                {formatCurrency(netWorth)}
              </p>
            </div>
            <div className="text-center p-3 glass-light rounded-lg">
              <p className="text-xs text-text-secondary mb-1">In Accounts</p>
              <p className="text-lg font-bold text-white">
                {formatCurrency(totalAvailable)}
              </p>
            </div>
            <div className="text-center p-3 glass-light rounded-lg">
              <p className="text-xs text-text-secondary mb-1">Total Owed</p>
              <p className="text-lg font-bold text-error">
                {formatCurrency(totalOwed)}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Upcoming Payments Alert */}
      {hasUpcoming && (
        <GlassCard variant="strong" className="bg-gradient-to-br from-orange-900/20 to-red-900/20">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-error" />
              <h3 className="text-lg font-semibold text-white">Upcoming Payments</h3>
            </div>
            <div className="space-y-2">
              {upcomingBNPL.map((item) => {
                const daysUntil = Math.ceil((new Date(item.next_due_date!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={item.id} className="flex justify-between items-center text-sm glass-light rounded-lg p-3">
                    <span className="text-white">{item.merchant} - BNPL</span>
                    <span className="font-medium text-error">
                      {formatCurrency(item.installment_amount)} • {daysUntil}d
                    </span>
                  </div>
                );
              })}
              {upcomingCC.map((card) => {
                const daysUntil = Math.ceil((new Date(card.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={card.id} className="flex justify-between items-center text-sm glass-light rounded-lg p-3">
                    <span className="text-white">Credit Card Payment</span>
                    <span className="font-medium text-error">
                      {formatCurrency(card.minimum_payment)} • {daysUntil}d
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      )}

      {/* This Month Spending */}
      <GlassCard variant="strong">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-white" />
            <h3 className="text-lg font-semibold text-white">This Month</h3>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Spent</span>
            <span className="text-lg font-bold text-white">
              {formatCurrency(thisMonthSpent)} / {formatCurrency(monthlyBudget)}
            </span>
          </div>
          <Progress value={Math.min(spendingPercentage, 100)} className="h-3 bg-card-elevated" />
          {spendingPercentage > 100 && (
            <p className="text-sm text-error font-medium">
              Over budget by {formatCurrency(thisMonthSpent - monthlyBudget)}
            </p>
          )}
        </div>
      </GlassCard>

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
          <Link href="/finance/transactions" className="text-xs text-text-secondary hover:text-white transition-colors">
            View All →
          </Link>
        </div>
        {recentTransactions && recentTransactions.length > 0 ? (
          <GlassCard variant="strong">
            <div className="space-y-2">
              {recentTransactions.map((txn: any) => (
                <div key={txn.id} className="flex items-center justify-between p-3 glass-light rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: txn.accounts?.color || '#3b82f6' }}
                    >
                      {txn.accounts?.icon || '💰'}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">
                        {txn.merchant_name || txn.description || 'Transaction'}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {txn.category} • {new Date(txn.date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <p className="text-error font-bold">
                    -{formatCurrency(txn.amount)}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        ) : (
          <GlassCard variant="strong">
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-text-secondary mx-auto mb-3" />
              <p className="text-text-secondary">No transactions yet</p>
              <Link href="/finance/transactions/new" className="mt-3 inline-block">
                <Button3D variant="primary">
                  <Plus className="h-4 w-4 mr-2 inline" />
                  Add Transaction
                </Button3D>
              </Link>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
