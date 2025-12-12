// file: components/shared/suggested-steps.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface SuggestedStepsProps {
  title?: string;
  steps: string[];
}

export function SuggestedSteps({ title = "Suggested next steps", steps }: SuggestedStepsProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2 text-sm">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span className="text-primary font-medium shrink-0">{index + 1}.</span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
