import { createClient } from '@/lib/supabase/server';
import { WeddingCountdown } from '@/components/dashboard/WeddingCountdown';
import { DebtSummary } from '@/components/dashboard/DebtSummary';
import { PrayerStatus } from '@/components/dashboard/PrayerStatus';
import { TodaySpending } from '@/components/dashboard/TodaySpending';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { getGreeting, formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{getGreeting()}, Izzul</h1>
        <p className="text-sm text-muted-foreground">{formatDate(new Date())}</p>
      </div>

      {/* Wedding Countdown */}
      <WeddingCountdown />

      {/* Debt Summary */}
      <DebtSummary userId={user.id} />

      {/* Prayer Status for Today */}
      <PrayerStatus userId={user.id} />

      {/* Spending for Today */}
      <TodaySpending userId={user.id} />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
