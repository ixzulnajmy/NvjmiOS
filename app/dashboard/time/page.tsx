import { CircleBackButton } from '@/components/ui/circle-back-button';
import { GlassCard } from '@/components/ui/glass-card';
import { Clock, Timer, Calendar, TrendingUp } from 'lucide-react';

export default function TimePage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 pt-4">
        <CircleBackButton />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">Time Tracker</h1>
          <p className="text-sm text-text-secondary">Monitor your productivity</p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <GlassCard variant="strong" className="bg-gradient-to-br from-blue-900/20 to-purple-900/20">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <Clock className="h-20 w-20 text-white/20" />
            <Timer className="h-10 w-10 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-white">Time Tracking Coming Soon</h3>
            <p className="text-sm text-text-secondary max-w-md">
              Track your time, analyze productivity patterns, and optimize your daily schedule with detailed insights.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Future Features Grid */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard variant="strong" hover={false}>
          <div className="flex flex-col items-center text-center space-y-2 py-4">
            <Calendar className="h-8 w-8 text-white" />
            <h4 className="text-sm font-semibold text-white">Schedule</h4>
            <p className="text-xs text-text-secondary">Plan your day</p>
          </div>
        </GlassCard>

        <GlassCard variant="strong" hover={false}>
          <div className="flex flex-col items-center text-center space-y-2 py-4">
            <TrendingUp className="h-8 w-8 text-white" />
            <h4 className="text-sm font-semibold text-white">Analytics</h4>
            <p className="text-xs text-text-secondary">Track progress</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
