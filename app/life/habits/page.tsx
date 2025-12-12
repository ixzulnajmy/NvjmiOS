// file: app/life/habits/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockHabits } from "@/lib/mock-data";
import { Habit } from "@/lib/types";
import { Plus, Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { DetailPanel, TagList } from "@/components/shared/detail-panel";

export default function HabitsPage() {
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(mockHabits[0]);

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedHabit && (
          <DetailPanel
            title={selectedHabit.name}
            subtitle={selectedHabit.description}
            sections={[
              {
                title: "Habit Details",
                content: (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Frequency</label>
                        <Badge variant="secondary">{selectedHabit.frequency}</Badge>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Target</label>
                        <p className="text-base font-semibold">{selectedHabit.targetCount}x per {selectedHabit.frequency === "daily" ? "day" : selectedHabit.frequency === "weekly" ? "week" : "month"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          Current Streak
                        </label>
                        <p className="text-2xl font-bold">{selectedHabit.currentStreak}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          Longest Streak
                        </label>
                        <p className="text-2xl font-bold text-yellow-500">{selectedHabit.longestStreak}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Total Completions</label>
                      <p className="text-base font-semibold">{selectedHabit.completedDates.length}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Tags</label>
                      <TagList tags={selectedHabit.tags} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Created</label>
                      <p className="text-sm">{new Date(selectedHabit.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ),
              },
              {
                title: "Recent Activity",
                content: (
                  <div className="space-y-2">
                    {selectedHabit.completedDates.slice(0, 7).map((date) => (
                      <div key={date} className="flex items-center justify-between py-1">
                        <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
                        <Badge variant="secondary" className="text-xs">Completed</Badge>
                      </div>
                    ))}
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
          title="Habits"
          description="Track your daily habits and build streaks"
          actions={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Habit
            </Button>
          }
        />

        <div className="grid gap-4">
          {mockHabits.map((habit) => (
            <Card
              key={habit.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-accent/50",
                selectedHabit?.id === habit.id && "border-primary bg-accent"
              )}
              onClick={() => setSelectedHabit(habit)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-base">{habit.name}</CardTitle>
                    {habit.description && (
                      <p className="text-sm text-muted-foreground">{habit.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-orange-500">
                        <Flame className="h-4 w-4" />
                        <span className="text-lg font-bold">{habit.currentStreak}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">streak</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Trophy className="h-4 w-4" />
                        <span className="text-lg font-bold">{habit.longestStreak}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">best</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {habit.frequency} • {habit.targetCount}x target
                  </Badge>
                  <div className="flex gap-1">
                    {habit.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
