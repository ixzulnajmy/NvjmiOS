// file: app/work/knowledge/page.tsx
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
import { mockKnowledgeNotes } from "@/lib/mock-data";
import { KnowledgeNote } from "@/lib/types";
import { Plus, Search, BookOpen, Link2 } from "lucide-react";
import { DetailPanel, TagList } from "@/components/shared/detail-panel";
import { SuggestedSteps } from "@/components/shared/suggested-steps";
import { EntityTable, TableColumn } from "@/components/shared/entity-table";

export default function KnowledgePage() {
  const [selectedNote, setSelectedNote] = useState<KnowledgeNote | null>(mockKnowledgeNotes[0] || null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const columns: TableColumn[] = [
    { key: "title", label: "Title" },
    { key: "category", label: "Category", width: "160px" },
    { key: "tags", label: "Tags", width: "200px" },
    { key: "updated", label: "Last Updated", width: "140px" },
  ];

  const renderCell = (note: KnowledgeNote, columnKey: string) => {
    switch (columnKey) {
      case "title":
        return (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{note.title}</span>
          </div>
        );
      case "category":
        return <Badge variant="secondary">{note.category}</Badge>;
      case "tags":
        return (
          <div className="flex gap-1">
            {note.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{note.tags.length - 2}
              </Badge>
            )}
          </div>
        );
      case "updated":
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedNote && (
          <DetailPanel
            title={selectedNote.title}
            subtitle={selectedNote.category}
            sections={[
              {
                title: "Content Preview",
                icon: <BookOpen className="h-4 w-4" />,
                content: (
                  <div className="max-h-[300px] overflow-y-auto rounded-md bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedNote.content}
                    </p>
                  </div>
                ),
              },
              {
                title: "Details",
                content: (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Category</label>
                      <Badge variant="secondary">{selectedNote.category}</Badge>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Created</label>
                      <p className="text-sm">{new Date(selectedNote.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Last Updated</label>
                      <p className="text-sm">{new Date(selectedNote.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ),
              },
              {
                title: "Tags",
                content: <TagList tags={selectedNote.tags} />,
              },
              ...(selectedNote.linkedNotes && selectedNote.linkedNotes.length > 0
                ? [
                    {
                      title: "Linked Notes",
                      icon: <Link2 className="h-4 w-4" />,
                      content: (
                        <div className="space-y-2">
                          {selectedNote.linkedNotes.map((noteId, idx) => (
                            <div key={noteId} className="flex items-center gap-2 text-sm">
                              <BookOpen className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Note #{idx + 1}</span>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                  ]
                : []),
              {
                title: "Knowledge Insights",
                content: (
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>• You have {mockKnowledgeNotes.length} notes in this category</p>
                    <p>• Most recent update was 2 days ago</p>
                    <p>• This note is linked to 3 related topics</p>
                  </div>
                ),
              },
              {
                title: "Action Steps",
                content: (
                  <SuggestedSteps
                    steps={[
                      "Review related notes to build comprehensive understanding",
                      "Add cross-references to connect related concepts",
                      "Schedule regular reviews of important notes",
                      "Export notes to create study guides or documentation",
                      "Tag notes by project or learning path",
                      "Create visual mind maps from interconnected notes",
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
          title="Knowledge Base"
          description="Capture and organize your learnings"
          actions={
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>New Knowledge Note</DialogTitle>
                  <DialogDescription>
                    Capture learnings, insights, and important information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="note-title">Title</Label>
                    <Input id="note-title" placeholder="e.g., React Server Components Best Practices" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note-category">Category</Label>
                    <Input id="note-category" placeholder="e.g., Development, Design, Business" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note-content">Content</Label>
                    <Textarea
                      id="note-content"
                      placeholder="Write your notes here. Supports markdown formatting..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note-tags">Tags</Label>
                    <Input id="note-tags" placeholder="e.g., react, nextjs, performance" />
                    <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setDialogOpen(false)}>
                    Save Note
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search notes..." className="pl-9" />
          </div>
        </div>

        <EntityTable
          columns={columns}
          data={mockKnowledgeNotes}
          onRowClick={setSelectedNote}
          selectedId={selectedNote?.id}
          renderCell={renderCell}
        />
      </div>
    </AppShell>
  );
}
