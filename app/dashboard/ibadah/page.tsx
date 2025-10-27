import { CircleBackButton } from '@/components/ui/circle-back-button';
import { GlassCard } from '@/components/ui/glass-card';
import Link from 'next/link';
import { Sparkles, Book, Heart, ChevronRight } from 'lucide-react';

export default function IbadahPage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 pt-4">
        <CircleBackButton />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">Ibadah Brain</h1>
          <p className="text-sm text-text-secondary">Track your spiritual journey</p>
        </div>
      </div>

      {/* Ibadah Categories */}
      <div className="space-y-4">
        {/* Prayers */}
        <Link href="/dashboard/ibadah/prayers">
          <GlassCard variant="strong" className="bg-gradient-to-br from-green-900/20 to-emerald-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Prayers</h3>
                  <p className="text-sm text-text-secondary">Track your 5 daily prayers and jemaah</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-text-secondary" />
            </div>
          </GlassCard>
        </Link>

        {/* Quran */}
        <Link href="/dashboard/ibadah/quran">
          <GlassCard variant="strong" className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Book className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Quran</h3>
                  <p className="text-sm text-text-secondary">Log your daily Quran reading</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-text-secondary" />
            </div>
          </GlassCard>
        </Link>

        {/* Sedekah */}
        <GlassCard variant="strong" className="bg-gradient-to-br from-pink-900/20 to-rose-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                <Heart className="h-6 w-6 text-pink-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Sedekah</h3>
                <p className="text-sm text-text-secondary">Track your charitable giving</p>
              </div>
            </div>
            <span className="text-xs bg-white/10 text-text-secondary px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
