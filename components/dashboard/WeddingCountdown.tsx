'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { Progress } from '@/components/ui/progress';
import { daysBetween, formatCurrency } from '@/lib/utils';
import { Heart } from 'lucide-react';

export function WeddingCountdown() {
  const today = new Date();
  const engagementDate = new Date('2026-04-01'); // April 2026
  const nikahDate = new Date('2026-12-01'); // December 2026

  const daysToEngagement = daysBetween(today, engagementDate);
  const daysToNikah = daysBetween(today, nikahDate);

  // Wedding fund goal
  const weddingGoal = 30000;
  const currentSavings = 0; // This will come from database later
  const percentageSaved = (currentSavings / weddingGoal) * 100;

  // Calculate monthly savings needed
  const monthsRemaining = Math.ceil(daysToNikah / 30);
  const monthlySavingsNeeded = (weddingGoal - currentSavings) / monthsRemaining;

  return (
    <GlassCard variant="strong" className="bg-gradient-to-br from-pink-900/20 to-purple-900/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 fill-pink-400 text-pink-400" />
          <h3 className="text-lg font-semibold text-white">Wedding Countdown</h3>
        </div>

        {/* Countdown Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="glass-light rounded-xl p-4 space-y-1">
            <p className="text-4xl font-bold text-pink-400">{daysToEngagement}</p>
            <p className="text-xs text-text-secondary">days to engagement</p>
            <p className="text-xs font-medium text-white">April 2026</p>
          </div>
          <div className="glass-light rounded-xl p-4 space-y-1">
            <p className="text-4xl font-bold text-pink-400">{daysToNikah}</p>
            <p className="text-xs text-text-secondary">days to nikah</p>
            <p className="text-xs font-medium text-white">December 2026</p>
          </div>
        </div>

        {/* Wedding Fund Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-white">Wedding Fund</span>
            <span className="text-text-secondary">
              {formatCurrency(currentSavings)} / {formatCurrency(weddingGoal)}
            </span>
          </div>
          <Progress value={percentageSaved} className="h-3 bg-card-elevated" />
          <p className="text-xs text-text-secondary">
            {percentageSaved.toFixed(1)}% saved • Need {formatCurrency(monthlySavingsNeeded)}/month
          </p>
        </div>

        {/* Venue Info */}
        <div className="pt-2 border-t border-white/10 text-xs text-center text-text-secondary">
          Elza Manor, Sabah • KL Ballroom Reception
        </div>
      </div>
    </GlassCard>
  );
}
