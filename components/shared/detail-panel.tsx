// file: components/shared/detail-panel.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

interface DetailSection {
  title: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface DetailPanelProps {
  title: string;
  subtitle?: string;
  sections: DetailSection[];
}

export function DetailPanel({ title, subtitle, sections }: DetailPanelProps) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {sections.map((section, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {section.icon}
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent>{section.content}</CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
