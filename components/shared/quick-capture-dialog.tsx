// file: components/shared/quick-capture-dialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { mockInboxItems } from "@/lib/mock-data";
import { CaptureType } from "@/lib/types";
import { Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: CaptureType;
}

export function QuickCaptureDialog({ open, onOpenChange, defaultType = "note" }: QuickCaptureDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedType, setSelectedType] = useState<CaptureType>(defaultType);
  const [tags, setTags] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const captureTypes: { type: CaptureType; label: string; color: string }[] = [
    { type: "task", label: "Task", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
    { type: "money", label: "Money", color: "bg-green-100 text-green-700 hover:bg-green-200" },
    { type: "time", label: "Time", color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
    { type: "life", label: "Life", color: "bg-pink-100 text-pink-700 hover:bg-pink-200" },
    { type: "document", label: "Document", color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
    { type: "note", label: "Note", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
  ];

  const handleSave = () => {
    // TODO: In production, this would call an API
    // For now, we'll just add to the mock array in memory
    const newItem = {
      id: `inbox_${Date.now()}`,
      title: title || "Untitled",
      content,
      type: selectedType,
      status: "inbox" as const,
      capturedAt: new Date().toISOString(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      suggestedTarget: getSuggestedTarget(selectedType),
    };

    // Add to mock data (in-memory only)
    mockInboxItems.unshift(newItem);

    // Reset form
    setTitle("");
    setContent("");
    setTags("");
    setDate(new Date().toISOString().split("T")[0]);

    // Show success (TODO: use toast notification)
    console.log("Saved to inbox:", newItem);

    // Close dialog
    onOpenChange(false);
  };

  const getSuggestedTarget = (type: CaptureType): string => {
    switch (type) {
      case "task":
        return "Task";
      case "money":
        return "Money Transaction";
      case "time":
        return "Time Entry";
      case "life":
        return "Life Event";
      case "document":
        return "Document";
      case "note":
        return "Knowledge Note";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quick Capture</DialogTitle>
          <DialogDescription>
            Capture anything quickly. You can convert it later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type Pills */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex flex-wrap gap-2">
              {captureTypes.map(({ type, label, color }) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                    selectedType === type
                      ? color
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="quick-title">Title</Label>
            <Input
              id="quick-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quick summary..."
              autoFocus
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="quick-content">Content</Label>
            <Textarea
              id="quick-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Details, notes, thoughts..."
              rows={6}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="quick-date">Date</Label>
            <Input
              id="quick-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="quick-tags">Tags</Label>
            <Input
              id="quick-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="work, urgent, personal (comma-separated)"
            />
          </div>

          {/* Attachment Upload (UI only) */}
          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Images, PDFs, documents (max 10MB)
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Plus className="h-4 w-4 mr-2" />
            Save to Inbox
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
