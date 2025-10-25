import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface PrayerStatusProps {
  userId: string;
}

const PRAYER_NAMES = [
  { name: 'subuh', label: 'Subuh', time: '5:45 AM' },
  { name: 'zohor', label: 'Zohor', time: '1:10 PM' },
  { name: 'asar', label: 'Asar', time: '4:30 PM' },
  { name: 'maghrib', label: 'Maghrib', time: '7:15 PM' },
  { name: 'isyak', label: 'Isyak', time: '8:30 PM' },
];

export async function PrayerStatus({ userId }: PrayerStatusProps) {
  const supabase = await createClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Fetch today's prayers
  const { data: prayers } = await supabase
    .from('prayers')
    .select('*')
    .eq('user_id', userId)
    .eq('prayer_date', today);

  const prayerMap = new Map(prayers?.map(p => [p.prayer_name, p]) || []);
  const completedCount = prayers?.filter(p => p.completed).length || 0;
  const jemaahCount = prayers?.filter(p => p.jemaah).length || 0;

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-green-900">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            Today's Prayers
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {completedCount}/5 • {jemaahCount} Jemaah
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {PRAYER_NAMES.map(({ name, label, time }) => {
          const prayer = prayerMap.get(name);
          const isCompleted = prayer?.completed || false;
          const isJemaah = prayer?.jemaah || false;

          return (
            <div
              key={name}
              className="flex items-center justify-between py-2 border-b border-green-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Checkbox checked={isCompleted} disabled />
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{time}</p>
                </div>
              </div>
              {isJemaah && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  Jemaah
                </span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
