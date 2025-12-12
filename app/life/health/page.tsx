// file: app/life/health/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockHealthMetrics } from "@/lib/mock-data";
import { HealthMetric } from "@/lib/types";
import { Plus, Activity, Heart, Moon, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import { DetailPanel, TagList } from "@/components/shared/detail-panel";

const moodColors = {
  great: "text-green-500",
  good: "text-blue-500",
  okay: "text-yellow-500",
  bad: "text-orange-500",
  terrible: "text-red-500",
};

export default function HealthPage() {
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(mockHealthMetrics[0]);

  const latestMetric = mockHealthMetrics[0];
  const avgWeight = mockHealthMetrics.reduce((sum, m) => sum + (m.weight || 0), 0) / mockHealthMetrics.length;
  const avgSleep = mockHealthMetrics.reduce((sum, m) => sum + (m.sleepHours || 0), 0) / mockHealthMetrics.length;
  const avgSteps = mockHealthMetrics.reduce((sum, m) => sum + (m.steps || 0), 0) / mockHealthMetrics.length;

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedMetric && (
          <DetailPanel
            title={new Date(selectedMetric.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
            sections={[
              {
                title: "Metrics",
                content: (
                  <div className="space-y-4">
                    {selectedMetric.weight && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Weight</span>
                        <span className="text-base font-semibold">{selectedMetric.weight} kg</span>
                      </div>
                    )}
                    {selectedMetric.sleepHours && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Sleep</span>
                        <span className="text-base font-semibold">{selectedMetric.sleepHours}h</span>
                      </div>
                    )}
                    {selectedMetric.steps && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Steps</span>
                        <span className="text-base font-semibold">{selectedMetric.steps.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedMetric.waterIntake && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Water</span>
                        <span className="text-base font-semibold">{selectedMetric.waterIntake}L</span>
                      </div>
                    )}
                    {selectedMetric.mood && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Mood</span>
                        <Badge className={moodColors[selectedMetric.mood]}>
                          {selectedMetric.mood}
                        </Badge>
                      </div>
                    )}
                    {selectedMetric.energy && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Energy</span>
                        <span className="text-base font-semibold">{selectedMetric.energy}/5</span>
                      </div>
                    )}
                    {selectedMetric.notes && (
                      <div className="space-y-1 pt-2 border-t">
                        <label className="text-xs text-muted-foreground">Notes</label>
                        <p className="text-sm">{selectedMetric.notes}</p>
                      </div>
                    )}
                    <div className="space-y-1 pt-2 border-t">
                      <label className="text-xs text-muted-foreground">Tags</label>
                      <TagList tags={selectedMetric.tags} />
                    </div>
                  </div>
                ),
              },
            ]}
          />
        )
      }
    >
      <div className="p-6 space-y-6">
        <PageHeader
          title="Health"
          description="Track your health metrics and wellness"
          actions={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Metrics
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Weight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latestMetric.weight || "-"} kg</p>
              <p className="text-xs text-muted-foreground">Avg: {avgWeight.toFixed(1)} kg</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Sleep
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latestMetric.sleepHours || "-"}h</p>
              <p className="text-xs text-muted-foreground">Avg: {avgSleep.toFixed(1)}h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latestMetric.steps?.toLocaleString() || "-"}</p>
              <p className="text-xs text-muted-foreground">Avg: {Math.round(avgSteps).toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Water
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latestMetric.waterIntake || "-"}L</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Sleep</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Water</TableHead>
                <TableHead>Mood</TableHead>
                <TableHead>Energy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHealthMetrics.map((metric) => (
                <TableRow
                  key={metric.id}
                  className={cn(
                    "cursor-pointer",
                    selectedMetric?.id === metric.id && "bg-muted"
                  )}
                  onClick={() => setSelectedMetric(metric)}
                >
                  <TableCell className="font-medium">
                    {new Date(metric.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{metric.weight ? `${metric.weight} kg` : "-"}</TableCell>
                  <TableCell>{metric.sleepHours ? `${metric.sleepHours}h` : "-"}</TableCell>
                  <TableCell>{metric.steps?.toLocaleString() || "-"}</TableCell>
                  <TableCell>{metric.waterIntake ? `${metric.waterIntake}L` : "-"}</TableCell>
                  <TableCell>
                    {metric.mood && (
                      <Badge variant="secondary" className={cn("text-xs", moodColors[metric.mood])}>
                        {metric.mood}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{metric.energy ? `${metric.energy}/5` : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}
