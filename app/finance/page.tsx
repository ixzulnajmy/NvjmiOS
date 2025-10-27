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
  Calendar,
  Users,
  RefreshCw,
  Plus,
  BarChart3,
  ArrowUpRight,
  Settings
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
    { icon: Wallet, label: 'Accounts', href: '/finance/accounts' },
    { icon: BarChart3, label: 'Wealth', href: '/finance' },
    { icon: Users, label: 'Friends', href: '/finance/friends' },
    { icon: Settings, label: 'Settings', href: '/finance/settings' },
    { icon: Plus, label: 'Add', href: '/finance/expenses?action=add' },
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

          {/* Net Worth */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Net Worth</p>
              <div className="flex items-baseline gap-2">
                <h3 className={`text-2xl font-bold ${netWorth >= 0 ? 'text-success' : 'text-error'}`}>
                  {formatCurrency(netWorth)}
                </h3>
                <div className="flex items-center gap-1 text-success text-sm">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>+5.5%</span>
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-1">Last Week</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link href="/finance/transactions/new" className="flex-1">
              <Button3D variant="primary" className="w-full">
                Deposit
              </Button3D>
            </Link>
            <Link href="/finance/expenses?action=add" className="flex-1">
              <Button3D variant="secondary" className="w-full">
                Send
              </Button3D>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-xs text-text-secondary">In Accounts</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(totalAvailable)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Total Owed</p>
              <p className="text-xl font-bold text-error">
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

      {/* Transaction Categories Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-semibold text-white">Transaction</h3>
          <Link href="/finance/transactions" className="text-xs text-text-secondary hover:text-white transition-colors">
            See more →
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <Link href="/finance/accounts">
            <div className="flex flex-col items-center gap-2 min-w-[64px]">
              <div className="glass-light rounded-full w-14 h-14 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs text-text-secondary text-center">E-wallet</span>
            </div>
          </Link>
          <Link href="/finance/bnpl">
            <div className="flex flex-col items-center gap-2 min-w-[64px]">
              <div className="glass-light rounded-full w-14 h-14 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs text-text-secondary text-center">Top Up</span>
            </div>
          </Link>
          <Link href="/finance/credit-cards">
            <div className="flex flex-col items-center gap-2 min-w-[64px]">
              <div className="glass-light rounded-full w-14 h-14 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs text-text-secondary text-center">Card</span>
            </div>
          </Link>
          <Link href="/finance/transactions">
            <div className="flex flex-col items-center gap-2 min-w-[64px]">
              <div className="glass-light rounded-full w-14 h-14 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs text-text-secondary text-center">Power</span>
            </div>
          </Link>
          <Link href="/finance/accounts">
            <div className="flex flex-col items-center gap-2 min-w-[64px]">
              <div className="glass-light rounded-full w-14 h-14 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs text-text-secondary text-center">Bank</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
