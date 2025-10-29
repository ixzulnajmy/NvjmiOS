import { createClient } from '@/lib/supabase/server';
import { WeddingCountdown } from '@/components/dashboard/WeddingCountdown';
import { DebtSummary } from '@/components/dashboard/DebtSummary';
import { PrayerStatus } from '@/components/dashboard/PrayerStatus';
import { TodaySpending } from '@/components/dashboard/TodaySpending';
import { QuickActionsGrid } from '@/components/ui/quick-actions-grid';
import { GlassCard } from '@/components/ui/glass-card';
import { getGreeting, formatDate } from '@/lib/utils';
import { Clock, DollarSign, CheckSquare, BarChart3, Plus, Sparkles } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  const quickActions = [
    { icon: Clock, label: 'Time', href: '/dashboard/time', color: '#38bdf8' },
    { icon: DollarSign, label: 'Finance', href: '/finance', color: '#34d399' },
    { icon: CheckSquare, label: 'Tasks', href: '/dashboard/tasks', color: '#f472b6' },
    { icon: BarChart3, label: 'Stats', href: '/finance', color: '#a855f7' },
    { icon: Plus, label: 'Add', href: '/finance/expenses?action=add', color: '#facc15' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <GlassCard variant="elevated" className="px-6 py-7">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-text-secondary">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              synced
            </span>
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-white">
                {getGreeting()}, Izzul
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                {formatDate(now)}
              </p>
            </div>
          </div>
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-white/80 via-white/30 to-white/10 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.45)]">
            <Sparkles className="h-7 w-7" />
            <div className="absolute inset-0 rounded-full border border-white/30" />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-text-secondary">
          <span className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
            <Clock className="h-3.5 w-3.5" />
            focus mode
          </span>
          <span className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
            {`Today • ${currentTime}`}
          </span>
        </div>
      </GlassCard>

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
