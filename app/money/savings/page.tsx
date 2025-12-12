// file: app/money/savings/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockSavingsGoals } from "@/lib/mock-data";
import { SavingsGoal } from "@/lib/types";
import { Plus, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DetailPanel, TagList } from "@/components/shared/detail-panel";

export default function SavingsPage() {
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(mockSavingsGoals[0]);

  const totalTarget = mockSavingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrent = mockSavingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedGoal && (
          <DetailPanel
            title={selectedGoal.name}
            subtitle={selectedGoal.category}
            sections={[
              {
                title: "Goal Details",
                icon: <Target className="h-4 w-4" />,
                content: (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Target Amount</label>
                        <p className="text-lg font-semibold">RM {selectedGoal.targetAmount.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Current Amount</label>
                        <p className="text-lg font-semibold text-green-500">
                          RM {selectedGoal.currentAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={(selectedGoal.currentAmount / selectedGoal.targetAmount) * 100}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        RM {(selectedGoal.targetAmount - selectedGoal.currentAmount).toFixed(2)} remaining
                      </p>
                    </div>

                    {selectedGoal.monthlyContribution && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Monthly Contribution</label>
                        <p className="text-base font-semibold">RM {selectedGoal.monthlyContribution.toFixed(2)}</p>
                      </div>
                    )}

                    {selectedGoal.targetDate && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Target Date</label>
                        <p className="text-sm">{new Date(selectedGoal.targetDate).toLocaleDateString()}</p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Tags</label>
                      <TagList tags={selectedGoal.tags} />
                    </div>

                    {selectedGoal.notes && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Notes</label>
                        <p className="text-sm text-muted-foreground">{selectedGoal.notes}</p>
                      </div>
                    )}
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
          title="Savings Goals"
          description="Track your savings goals and progress"
          actions={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-500">RM {totalCurrent.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Target</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">RM {totalTarget.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{((totalCurrent / totalTarget) * 100).toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          {mockSavingsGoals.map((goal) => (
            <Card
              key={goal.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-accent/50",
                selectedGoal?.id === goal.id && "border-primary bg-accent"
              )}
              onClick={() => setSelectedGoal(goal)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{goal.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{goal.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-500">
                      RM {goal.currentAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      of RM {goal.targetAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress
                  value={(goal.currentAmount / goal.targetAmount) * 100}
                  className="h-2"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}% complete
                  </span>
                  {goal.monthlyContribution && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      RM {goal.monthlyContribution}/month
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
