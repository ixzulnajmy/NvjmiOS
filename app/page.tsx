// file: app/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { mockTasks, mockBNPLItems, mockMeetings, mockHealthMetrics, mockInboxItems } from "@/lib/mock-data";
import { Plus, DollarSign, Users, Heart, Droplet } from "lucide-react";
import { CaptureType } from "@/lib/types";
import { QuickCaptureDialog } from "@/components/shared/quick-capture-dialog";
import Link from "next/link";

export default function TodayPage() {
  const [solatChecked, setSolatChecked] = useState({
    subuh: false,
    zohor: false,
    asar: false,
    maghrib: false,
    isyak: false,
  });
  const [captureDialogOpen, setCaptureDialogOpen] = useState(false);
  const [quickCaptureType, setQuickCaptureType] = useState<CaptureType>("note");

  // Get today's date
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Get user name and greeting
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  // Filter today's tasks (we'll use in_progress and todo status as "today")
  const todayTasks = mockTasks.filter(t => t.status === "in_progress" || t.status === "todo").slice(0, 5);

  // Get next BNPL due
  const nextBNPL = mockBNPLItems
    .filter(item => item.status === "active")
    .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime())[0];

  // Count dues this week
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const duesThisWeek = mockBNPLItems.filter(
    item => item.status === "active" && new Date(item.nextPaymentDate) <= weekFromNow
  ).length;

  // Today's meetings
  const todayMeetings = mockMeetings.filter(m => m.date === todayStr);

  // Health snapshot (mock data)
  const latestHealth = mockHealthMetrics[0];

  const toggleSolat = (prayer: keyof typeof solatChecked) => {
    setSolatChecked(prev => ({ ...prev, [prayer]: !prev[prayer] }));
  };

  return (
    <AppShell showDetail={false}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">{greeting}, Najmi</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening today.</p>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Solat Tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Solat Tracker</CardTitle>
              <CardDescription>Track your daily prayers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(solatChecked).map(([prayer, checked]) => (
                <div key={prayer} className="flex items-center gap-3">
                  <Checkbox
                    id={prayer}
                    checked={checked}
                    onCheckedChange={() => toggleSolat(prayer as keyof typeof solatChecked)}
                  />
                  <label
                    htmlFor={prayer}
                    className="text-sm font-medium capitalize cursor-pointer"
                  >
                    {prayer}
                  </label>
                </div>
              ))}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  {Object.values(solatChecked).filter(Boolean).length}/5 completed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Today's Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Tasks</CardTitle>
              <CardDescription>Focus on these tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayTasks.length > 0 ? (
                todayTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3">
                    <Checkbox className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{task.title}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {task.priority}
                        </Badge>
                        {task.project && (
                          <span className="text-xs text-muted-foreground">{task.project}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No tasks for today</p>
              )}
              <Link href="/work/tasks">
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View All Tasks
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Money Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Money Alerts
              </CardTitle>
              <CardDescription>Upcoming payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {nextBNPL && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Next BNPL Due</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{nextBNPL.item}</span>
                    <Badge variant="secondary">RM {nextBNPL.monthlyPayment.toFixed(2)}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Due: {new Date(nextBNPL.nextPaymentDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div className="space-y-1 pt-2 border-t">
                <p className="text-sm font-medium">Credit Card Billing</p>
                <p className="text-xs text-muted-foreground">Next billing: Day 15 of month</p>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dues this week</span>
                  <Badge variant="destructive">{duesThisWeek}</Badge>
                </div>
              </div>
              <Link href="/money/bnpl">
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View All Payments
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Today's Meetings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Today's Meetings
              </CardTitle>
              <CardDescription>Scheduled for today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayMeetings.length > 0 ? (
                todayMeetings.map((meeting) => (
                  <div key={meeting.id} className="space-y-1">
                    <p className="text-sm font-medium">{meeting.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{meeting.startTime} - {meeting.endTime}</span>
                      {meeting.location && (
                        <>
                          <span>•</span>
                          <span>{meeting.location}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {meeting.attendees.length} attendees
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No meetings today</p>
              )}
              <Link href="/work/meetings">
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View All Meetings
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Health Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Health Snapshot
              </CardTitle>
              <CardDescription>Your wellness today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestHealth && (
                <>
                  {latestHealth.sleepHours !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sleep (yesterday)</span>
                      <span className="font-medium">{latestHealth.sleepHours}h</span>
                    </div>
                  )}
                  {latestHealth.steps !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Steps</span>
                      <span className="font-medium">{latestHealth.steps.toLocaleString()}</span>
                    </div>
                  )}
                  {latestHealth.waterIntake !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-1">
                        <Droplet className="h-3 w-3" />
                        Water Intake
                      </span>
                      <span className="font-medium">{latestHealth.waterIntake}L</span>
                    </div>
                  )}
                  {latestHealth.mood && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mood</span>
                      <Badge variant="secondary" className="capitalize">{latestHealth.mood}</Badge>
                    </div>
                  )}
                </>
              )}
              <Link href="/life/health">
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View Health Log
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Capture */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Capture
              </CardTitle>
              <CardDescription>Capture anything instantly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="What's on your mind? (Press Enter)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setCaptureDialogOpen(true);
                  }
                }}
                onClick={() => setCaptureDialogOpen(true)}
                className="cursor-pointer"
              />
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuickCaptureType("task");
                    setCaptureDialogOpen(true);
                  }}
                >
                  + Task
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuickCaptureType("note");
                    setCaptureDialogOpen(true);
                  }}
                >
                  + Note
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuickCaptureType("money");
                    setCaptureDialogOpen(true);
                  }}
                >
                  + Money
                </Button>
              </div>
              <Link href="/inbox">
                <Button variant="ghost" size="sm" className="w-full">
                  View Inbox ({mockInboxItems.filter(i => i.status === "inbox").length})
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <QuickCaptureDialog
        open={captureDialogOpen}
        onOpenChange={setCaptureDialogOpen}
        defaultType={quickCaptureType}
      />
    </AppShell>
  );
}
