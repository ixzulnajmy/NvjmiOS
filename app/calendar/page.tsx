// file: app/calendar/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTasks, mockMeetings, mockTimeEntries, mockBNPLItems, mockLifeEvents } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, Clock, DollarSign, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Get events for selected date
  const getEventsForDate = (date: Date | null) => {
    if (!date) return { tasks: [], meetings: [], timeEntries: [], bnpl: [], lifeEvents: [] };

    const dateKey = formatDateKey(date);

    return {
      tasks: mockTasks.filter(t => t.dueDate === dateKey),
      meetings: mockMeetings.filter(m => m.date === dateKey),
      timeEntries: mockTimeEntries.filter(t => t.date === dateKey),
      bnpl: mockBNPLItems.filter(b => b.nextPaymentDate === dateKey && b.status === "active"),
      lifeEvents: mockLifeEvents.filter(e => e.date === dateKey),
    };
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedDate && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedDateEvents.tasks.length + selectedDateEvents.meetings.length + selectedDateEvents.lifeEvents.length} events
              </p>
            </div>

            <div className="space-y-4">
              {/* Tasks */}
              {selectedDateEvents.tasks.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Tasks ({selectedDateEvents.tasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedDateEvents.tasks.map((task) => (
                      <div key={task.id} className="space-y-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">{task.priority}</Badge>
                          <Badge variant="secondary" className="text-xs">{task.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Meetings */}
              {selectedDateEvents.meetings.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Meetings ({selectedDateEvents.meetings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedDateEvents.meetings.map((meeting) => (
                      <div key={meeting.id} className="space-y-1">
                        <p className="text-sm font-medium">{meeting.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {meeting.startTime} - {meeting.endTime}
                        </p>
                        {meeting.location && (
                          <p className="text-xs text-muted-foreground">{meeting.location}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Time Entries */}
              {selectedDateEvents.timeEntries.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time Entries ({selectedDateEvents.timeEntries.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedDateEvents.timeEntries.map((entry) => (
                      <div key={entry.id} className="space-y-1">
                        <p className="text-sm font-medium">{entry.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.startTime} - {entry.endTime} • {entry.duration}min
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* BNPL Due */}
              {selectedDateEvents.bnpl.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      BNPL Due ({selectedDateEvents.bnpl.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedDateEvents.bnpl.map((item) => (
                      <div key={item.id} className="space-y-1">
                        <p className="text-sm font-medium">{item.item}</p>
                        <p className="text-xs text-muted-foreground">
                          RM {item.monthlyPayment.toFixed(2)} • {item.provider}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Life Events */}
              {selectedDateEvents.lifeEvents.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Life Events ({selectedDateEvents.lifeEvents.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedDateEvents.lifeEvents.map((event) => (
                      <div key={event.id} className="space-y-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">{event.type}</Badge>
                          <Badge variant="secondary" className="text-xs">★ {event.importance}/5</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {selectedDateEvents.tasks.length === 0 &&
               selectedDateEvents.meetings.length === 0 &&
               selectedDateEvents.timeEntries.length === 0 &&
               selectedDateEvents.bnpl.length === 0 &&
               selectedDateEvents.lifeEvents.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No events on this day</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )
      }
    >
      <div className="p-6 space-y-6">
        <PageHeader
          title="Calendar"
          description="View and manage your schedule"
        />

        {/* Month Navigator */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border rounded-lg p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dateKey = formatDateKey(day);
              const hasEvents =
                mockTasks.some(t => t.dueDate === dateKey) ||
                mockMeetings.some(m => m.date === dateKey) ||
                mockLifeEvents.some(e => e.date === dateKey);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "aspect-square rounded-lg border-2 p-2 text-sm font-medium transition-colors",
                    "hover:bg-muted",
                    isToday(day) && "border-primary bg-primary/10",
                    !isToday(day) && "border-transparent",
                    isSameDay(day, selectedDate) && "bg-muted ring-2 ring-primary"
                  )}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className={cn(
                      isToday(day) && "text-primary font-bold"
                    )}>
                      {day.getDate()}
                    </span>
                    {hasEvents && (
                      <div className="h-1 w-1 rounded-full bg-primary mt-1" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
