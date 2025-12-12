// file: app/life/time/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockTimeEntries } from "@/lib/mock-data";
import { TimeEntry } from "@/lib/types";
import { Plus, Search, Clock, Tag, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { DetailPanel, TagList } from "@/components/shared/detail-panel";
import { InsightCard } from "@/components/shared/insight-card";

export default function TimeTrackingPage() {
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(mockTimeEntries[0] || null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "work":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "learning":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "personal":
        return "text-green-600 bg-green-50 border-green-200";
      case "meeting":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedEntry && (
          <DetailPanel
            title={selectedEntry.description}
            subtitle={`${new Date(selectedEntry.date).toLocaleDateString()} • ${selectedEntry.startTime} - ${selectedEntry.endTime}`}
            sections={[
              {
                title: "Duration",
                icon: <Clock className="h-4 w-4" />,
                content: (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Time</span>
                      <span className="text-2xl font-bold">{formatDuration(selectedEntry.duration)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedEntry.startTime} - {selectedEntry.endTime}
                    </div>
                  </div>
                ),
              },
              {
                title: "Details",
                content: (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Category</label>
                      <Badge variant="secondary" className={cn("capitalize", getCategoryColor(selectedEntry.category))}>
                        {selectedEntry.category}
                      </Badge>
                    </div>
                    {selectedEntry.project && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Project</label>
                        <p className="text-sm font-medium">{selectedEntry.project}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Billable
                      </label>
                      <Badge variant={selectedEntry.billable ? "default" : "secondary"}>
                        {selectedEntry.billable ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                ),
              },
              {
                title: "Tags",
                icon: <Tag className="h-4 w-4" />,
                content: <TagList tags={selectedEntry.tags} />,
              },
              ...(selectedEntry.notes
                ? [
                    {
                      title: "Notes",
                      content: (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedEntry.notes}
                        </p>
                      ),
                    },
                  ]
                : []),
              {
                title: "Insights",
                content: (
                  <InsightCard
                    insight={[
                      "AI-powered time analysis and productivity insights will appear here.",
                      "Identify most productive hours and track time distribution across projects.",
                      "Optimize billable vs non-billable ratio.",
                    ]}
                  />
                ),
              },
            ]}
          />
        )
      }
    >
      <div className="p-6 space-y-6">
        <PageHeader
          title="Time Tracking"
          description="Track how you spend your time"
          actions={
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Time Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>New Time Entry</DialogTitle>
                  <DialogDescription>
                    Log a new time entry for your activities
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="entry-description">Description</Label>
                    <Input id="entry-description" placeholder="e.g., Feature development - API integration" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entry-date">Date</Label>
                    <Input id="entry-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input id="start-time" type="time" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-time">End Time</Label>
                      <Input id="end-time" type="time" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project">Project (Optional)</Label>
                    <Input id="project" placeholder="e.g., Main Product" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="billable" />
                    <label
                      htmlFor="billable"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Billable
                    </label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea id="notes" placeholder="Any additional notes..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input id="tags" placeholder="e.g., development, frontend, urgent" />
                    <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setDialogOpen(false)}>
                    Save Entry
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search time entries..." className="pl-9" />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Billable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTimeEntries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className={cn(
                    "cursor-pointer",
                    selectedEntry?.id === entry.id && "bg-muted"
                  )}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <TableCell>
                    <p className="text-sm font-medium">
                      {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{entry.description}</p>
                      {entry.project && (
                        <p className="text-xs text-muted-foreground">{entry.project}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {entry.startTime} - {entry.endTime}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{formatDuration(entry.duration)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("text-xs capitalize", getCategoryColor(entry.category))}>
                      {entry.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={entry.billable ? "default" : "secondary"} className="text-xs">
                      {entry.billable ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}
