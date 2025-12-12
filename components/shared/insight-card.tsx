// file: components/shared/insight-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface InsightCardProps {
  title?: string;
  insight: string | string[];
}

export function InsightCard({ title = "Insights", insight }: InsightCardProps) {
  const insights = Array.isArray(insight) ? insight : [insight];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.map((text, index) => (
          <p key={index} className="text-sm text-muted-foreground">
            {text}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}
