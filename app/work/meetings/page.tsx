// file: app/work/meetings/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockMeetings } from "@/lib/mock-data";
import { Meeting } from "@/lib/types";
import { Plus, Search, Calendar, Users, CheckSquare, FileText } from "lucide-react";
import { DetailPanel, TagList } from "@/components/shared/detail-panel";
import { SuggestedSteps } from "@/components/shared/suggested-steps";
import { EntityTable, TableColumn } from "@/components/shared/entity-table";
import { cn } from "@/lib/utils";

export default function MeetingsPage() {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(mockMeetings[0] || null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const columns: TableColumn[] = [
    { key: "title", label: "Meeting", width: "300px" },
    { key: "date", label: "Date", width: "140px" },
    { key: "time", label: "Time", width: "120px" },
    { key: "attendees", label: "Attendees", width: "100px" },
    { key: "status", label: "Status", width: "120px" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "planned":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "cancelled":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const renderCell = (meeting: Meeting, columnKey: string) => {
    switch (columnKey) {
      case "title":
        return (
          <div>
            <div className="font-medium">{meeting.title}</div>
            {meeting.project && (
              <div className="text-xs text-muted-foreground mt-1">{meeting.project}</div>
            )}
          </div>
        );
      case "date":
        return (
          <span className="text-sm">
            {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        );
      case "time":
        return (
          <span className="text-sm text-muted-foreground">
            {meeting.startTime} - {meeting.endTime}
          </span>
        );
      case "attendees":
        return (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{meeting.attendees.length}</span>
          </div>
        );
      case "status":
        return (
          <Badge variant="outline" className={cn("capitalize", getStatusColor(meeting.status))}>
            {meeting.status}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedMeeting && (
          <DetailPanel
            title={selectedMeeting.title}
            subtitle={new Date(selectedMeeting.date).toLocaleDateString()}
            sections={[
              {
                title: "Meeting Info",
                icon: <Calendar className="h-4 w-4" />,
                content: (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Date & Time</label>
                      <p className="text-sm">
                        {new Date(selectedMeeting.date).toLocaleDateString()} at {selectedMeeting.startTime} - {selectedMeeting.endTime}
                      </p>
                    </div>
                    {selectedMeeting.location && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Location</label>
                        <p className="text-sm">{selectedMeeting.location}</p>
                      </div>
                    )}
                    {selectedMeeting.project && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Project</label>
                        <Badge variant="secondary">{selectedMeeting.project}</Badge>
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Status</label>
                      <Badge variant="outline" className={cn("capitalize", getStatusColor(selectedMeeting.status))}>
                        {selectedMeeting.status}
                      </Badge>
                    </div>
                  </div>
                ),
              },
              {
                title: "Attendees",
                icon: <Users className="h-4 w-4" />,
                content: (
                  <div className="space-y-2">
                    {selectedMeeting.attendees.map((attendee, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {attendee.charAt(0).toUpperCase()}
                        </div>
                        <span>{attendee}</span>
                      </div>
                    ))}
                  </div>
                ),
              },
              ...(selectedMeeting.agenda
                ? [
                    {
                      title: "Agenda",
                      icon: <FileText className="h-4 w-4" />,
                      content: (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedMeeting.agenda}
                        </p>
                      ),
                    },
                  ]
                : []),
              ...(selectedMeeting.decisions && selectedMeeting.decisions.length > 0
                ? [
                    {
                      title: "Key Decisions",
                      content: (
                        <ul className="space-y-2">
                          {selectedMeeting.decisions.map((decision, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-primary">•</span>
                              <span>{decision}</span>
                            </li>
                          ))}
                        </ul>
                      ),
                    },
                  ]
                : []),
              ...(selectedMeeting.actionItems && selectedMeeting.actionItems.length > 0
                ? [
                    {
                      title: "Action Items",
                      icon: <CheckSquare className="h-4 w-4" />,
                      content: (
                        <div className="space-y-2">
                          {selectedMeeting.actionItems.map((item) => (
                            <div key={item.id} className="flex items-start gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={item.done}
                                className="mt-0.5"
                                readOnly
                              />
                              <div className={cn("flex-1", item.done && "line-through text-muted-foreground")}>
                                <div>{item.task}</div>
                                <div className="text-xs text-muted-foreground">Assigned to: {item.assignee}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                  ]
                : []),
              ...(selectedMeeting.notes
                ? [
                    {
                      title: "Notes",
                      content: (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedMeeting.notes}
                        </p>
                      ),
                    },
                  ]
                : []),
              {
                title: "Tags",
                content: <TagList tags={selectedMeeting.tags} />,
              },
              {
                title: "Action Steps",
                content: (
                  <SuggestedSteps
                    steps={[
                      "Send meeting notes to all attendees within 24 hours",
                      "Create tasks for all action items in your task manager",
                      "Schedule follow-up meetings if needed",
                      "Review and update project status based on decisions",
                      "Archive completed meetings for future reference",
                      "Track time spent in meetings for productivity analysis",
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
          title="Meetings"
          description="Track meetings, agendas, and action items"
          actions={
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Meeting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>New Meeting</DialogTitle>
                  <DialogDescription>
                    Log a meeting and capture important details
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="meeting-title">Title</Label>
                    <Input id="meeting-title" placeholder="e.g., Sprint Planning" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meeting-date">Date</Label>
                      <Input id="meeting-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meeting-time">Time</Label>
                      <div className="flex gap-2">
                        <Input id="meeting-start" type="time" placeholder="Start" />
                        <Input id="meeting-end" type="time" placeholder="End" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meeting-location">Location (Optional)</Label>
                    <Input id="meeting-location" placeholder="e.g., Conference Room A, Zoom" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meeting-attendees">Attendees</Label>
                    <Input id="meeting-attendees" placeholder="e.g., John, Sarah, Alex" />
                    <p className="text-xs text-muted-foreground">Separate names with commas</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meeting-agenda">Agenda (Optional)</Label>
                    <Textarea id="meeting-agenda" placeholder="Meeting agenda and topics..." rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meeting-notes">Notes (Optional)</Label>
                    <Textarea id="meeting-notes" placeholder="Meeting notes and discussions..." rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meeting-tags">Tags</Label>
                    <Input id="meeting-tags" placeholder="e.g., sprint, planning, team" />
                    <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setDialogOpen(false)}>
                    Save Meeting
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search meetings..." className="pl-9" />
          </div>
        </div>

        <EntityTable
          columns={columns}
          data={mockMeetings}
          onRowClick={setSelectedMeeting}
          selectedId={selectedMeeting?.id}
          renderCell={renderCell}
        />
      </div>
    </AppShell>
  );
}
