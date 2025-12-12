// file: app/life/events/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { mockLifeEvents } from "@/lib/mock-data";
import { LifeEvent } from "@/lib/types";
import { Plus, Search, Star, DollarSign, CheckSquare, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const eventTypeColors: Record<string, string> = {
  Work: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Health: "bg-green-500/10 text-green-500 border-green-500/20",
  Money: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Relationship: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  Travel: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Achievement: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Other: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function LifeEventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(
    mockLifeEvents[0]
  );
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const filteredEvents = mockLifeEvents.filter((event) =>
    typeFilter ? event.type === typeFilter : true
  );

  const uniqueTypes = Array.from(new Set(mockLifeEvents.map((e) => e.type)));

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedEvent && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Event Details</h2>
              <p className="text-sm text-muted-foreground">
                {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Event Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    defaultValue={selectedEvent.title}
                    className="text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      defaultValue={selectedEvent.date}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <div
                      className={cn(
                        "px-3 py-2 rounded-md border text-sm font-medium",
                        eventTypeColors[selectedEvent.type]
                      )}
                    >
                      {selectedEvent.type}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Importance ({selectedEvent.importance}/5)
                  </label>
                  <div className="flex items-center gap-2">
                    <Slider
                      defaultValue={[selectedEvent.importance]}
                      max={5}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i <= selectedEvent.importance
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    defaultValue={selectedEvent.description}
                    className="text-sm min-h-[80px]"
                  />
                </div>

                {selectedEvent.notes && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      defaultValue={selectedEvent.notes}
                      className="text-sm min-h-[60px]"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-1">
                    {selectedEvent.tags.map((tag) => (
                      <div
                        key={tag}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Linked Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedEvent.linkedTransactions && selectedEvent.linkedTransactions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Transactions
                    </p>
                    {selectedEvent.linkedTransactions.map((txnId) => (
                      <div
                        key={txnId}
                        className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md"
                      >
                        <DollarSign className="h-3 w-3" />
                        <span className="text-xs">Transaction {txnId}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedEvent.linkedTasks && selectedEvent.linkedTasks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Tasks
                    </p>
                    {selectedEvent.linkedTasks.map((taskId) => (
                      <div
                        key={taskId}
                        className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md"
                      >
                        <CheckSquare className="h-3 w-3" />
                        <span className="text-xs">Task {taskId}</span>
                      </div>
                    ))}
                  </div>
                )}

                {(!selectedEvent.linkedTransactions || selectedEvent.linkedTransactions.length === 0) &&
                  (!selectedEvent.linkedTasks || selectedEvent.linkedTasks.length === 0) && (
                    <p className="text-sm text-muted-foreground">
                      No linked items yet
                    </p>
                  )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Reflection</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="What did you learn from this experience? How did it impact you?"
                  defaultValue={selectedEvent.reflection}
                  className="text-sm min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {/* TODO: AI journaling assistant will help here */}
                  This space is for deeper reflection and will be enhanced with AI insights in the future.
                </p>
              </CardContent>
            </Card>
          </div>
        )
      }
    >
      <div className="p-6 space-y-6">
        <PageHeader
          title="LifeEvents"
          description="High-signal events in life: promotions, trips, big purchases, health moments, etc."
          actions={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          }
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={typeFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(null)}
            >
              All
            </Button>
            {uniqueTypes.map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Timeline View */}
        <div className="space-y-4">
          {filteredEvents.map((event, index) => (
            <div key={event.id} className="flex gap-4">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  "h-3 w-3 rounded-full border-2 bg-background",
                  selectedEvent?.id === event.id ? "border-primary" : "border-muted-foreground"
                )} />
                {index < filteredEvents.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border mt-2" />
                )}
              </div>

              {/* Event card */}
              <Card
                className={cn(
                  "flex-1 cursor-pointer transition-colors hover:bg-accent/50 mb-4",
                  selectedEvent?.id === event.id && "border-primary bg-accent"
                )}
                onClick={() => setSelectedEvent(event)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base mb-2">
                        {event.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <div
                          className={cn(
                            "px-2 py-0.5 rounded-md border text-xs font-medium",
                            eventTypeColors[event.type]
                          )}
                        >
                          {event.type}
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3 w-3",
                                i <= event.importance
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                  {(event.linkedTransactions?.length || event.linkedTasks?.length) ? (
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      {event.linkedTransactions && event.linkedTransactions.length > 0 && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{event.linkedTransactions.length}</span>
                        </div>
                      )}
                      {event.linkedTasks && event.linkedTasks.length > 0 && (
                        <div className="flex items-center gap-1">
                          <CheckSquare className="h-3 w-3" />
                          <span>{event.linkedTasks.length}</span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
