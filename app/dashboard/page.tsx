import { createClient } from '@/lib/supabase/server';
import { WeddingCountdown } from '@/components/dashboard/WeddingCountdown';
import { DebtSummary } from '@/components/dashboard/DebtSummary';
import { PrayerStatus } from '@/components/dashboard/PrayerStatus';
import { TodaySpending } from '@/components/dashboard/TodaySpending';
import { QuickActionsGrid } from '@/components/ui/quick-actions-grid';
import { getGreeting, formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const quickActions = [
    { icon: 'Clock', label: 'Time', href: '/dashboard/time', color: '#00ff88' },
    { icon: 'DollarSign', label: 'Finance', href: '/finance', color: '#00ff88' },
    { icon: 'CheckSquare', label: 'Tasks', href: '/dashboard/tasks', color: '#00ff88' },
    { icon: 'BarChart3', label: 'Stats', href: '/finance', color: '#00ff88' },
    { icon: 'Plus', label: 'Add', href: '/finance/transactions/new', color: '#00ff88' },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="space-y-1 pt-4">
        <h1 className="text-3xl font-bold text-white">{getGreeting()}, Izzul</h1>
        <p className="text-sm text-text-secondary">{formatDate(new Date())}</p>
      </div>

      {/* Quick Actions Grid */}
      <QuickActionsGrid
        title="Quick Actions"
        actions={quickActions}
        showSeeAll={false}
      />

      {/* Wedding Countdown */}
      <WeddingCountdown />

      {/* Debt Summary */}
      <DebtSummary userId={user.id} />

      {/* Prayer Status for Today */}
      <PrayerStatus userId={user.id} />

      {/* Spending for Today */}
      <TodaySpending userId={user.id} />
    </div>
  );
}
