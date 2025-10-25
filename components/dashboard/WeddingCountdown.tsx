import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-pink-900">
          <Heart className="h-5 w-5 fill-pink-500 text-pink-500" />
          Wedding Countdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-3xl font-bold text-pink-600">{daysToEngagement}</p>
            <p className="text-xs text-muted-foreground">days to engagement</p>
            <p className="text-xs font-medium">April 2026</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-pink-600">{daysToNikah}</p>
            <p className="text-xs text-muted-foreground">days to nikah</p>
            <p className="text-xs font-medium">December 2026</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Wedding Fund</span>
            <span className="text-muted-foreground">
              {formatCurrency(currentSavings)} / {formatCurrency(weddingGoal)}
            </span>
          </div>
          <Progress value={percentageSaved} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {percentageSaved.toFixed(1)}% saved • Need {formatCurrency(monthlySavingsNeeded)}/month
          </p>
        </div>

        <div className="pt-2 border-t text-xs text-center text-muted-foreground">
          Elza Manor, Sabah • KL Ballroom Reception
        </div>
      </CardContent>
    </Card>
  );
}
