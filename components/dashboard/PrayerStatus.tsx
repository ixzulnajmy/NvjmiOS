import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/ui/glass-card';
import { Checkbox } from '@/components/ui/checkbox';
import { HARDCODED_USER_ID } from '@/lib/constants';
import { Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const PRAYER_NAMES = [
  { name: 'subuh', label: 'Subuh', time: '5:45 AM' },
  { name: 'zohor', label: 'Zohor', time: '1:10 PM' },
  { name: 'asar', label: 'Asar', time: '4:30 PM' },
  { name: 'maghrib', label: 'Maghrib', time: '7:15 PM' },
  { name: 'isyak', label: 'Isyak', time: '8:30 PM' },
];

export async function PrayerStatus() {
  const supabase = await createClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Fetch today's prayers using hardcoded user_id
  const { data: prayers } = await supabase
    .from('prayers')
    .select('*')
    .eq('user_id', HARDCODED_USER_ID)
    .eq('prayer_date', today);

  const prayerMap = new Map(prayers?.map(p => [p.prayer_name, p]) || []);
  const completedCount = prayers?.filter(p => p.completed).length || 0;
  const jemaahCount = prayers?.filter(p => p.jemaah).length || 0;

  return (
    <GlassCard variant="strong" className="bg-gradient-to-br from-green-900/20 to-emerald-900/20" hover={false}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-success" />
            <h3 className="text-lg font-semibold text-white">Today&apos;s Prayers</h3>
          </div>
          <span className="text-sm text-text-secondary">
            {completedCount}/5 • {jemaahCount} Jemaah
          </span>
        </div>

        {/* Prayer List */}
        <div className="space-y-2">
          {PRAYER_NAMES.map(({ name, label, time }) => {
            const prayer = prayerMap.get(name);
            const isCompleted = prayer?.completed || false;
            const isJemaah = prayer?.jemaah || false;

            return (
              <div
                key={name}
                className="flex items-center justify-between py-2 glass-light rounded-lg px-3"
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={isCompleted} disabled className="border-white/20" />
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-text-secondary">{time}</p>
                  </div>
                </div>
                {isJemaah && (
                  <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full font-medium border border-success/30">
                    Jemaah
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
