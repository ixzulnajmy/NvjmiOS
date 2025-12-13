// file: components/money/debts/loan-schedule-chart.tsx
// Placeholder chart component for loan schedule visualization

import { Card } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";

export function LoanScheduleChart() {
  // TODO: Integrate real charting library (e.g., recharts, chart.js) for actual visualization
  return (
    <Card className="p-6">
      <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
        <div className="text-center space-y-2">
          <TrendingDown className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Outstanding Balance Over Time
          </p>
          <p className="text-xs text-muted-foreground">
            TODO: Implement chart visualization
          </p>
        </div>
      </div>
    </Card>
  );
}
