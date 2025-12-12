// file: app/inbox/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { mockInboxItems } from "@/lib/mock-data";
import { InboxItem, CaptureType, CaptureStatus } from "@/lib/types";
import { Search, FileText, CheckCircle, Archive, Clock, Link2, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickCaptureDialog } from "@/components/shared/quick-capture-dialog";

export default function InboxPage() {
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(mockInboxItems[0] || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<CaptureStatus | "all">("all");
  const [filterType, setFilterType] = useState<CaptureType | "all">("all");
  const [captureDialogOpen, setCaptureDialogOpen] = useState(false);

  // Filter inbox items
  const filteredItems = mockInboxItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getTypeColor = (type: CaptureType) => {
    switch (type) {
      case "task": return "bg-blue-100 text-blue-700";
      case "money": return "bg-green-100 text-green-700";
      case "time": return "bg-purple-100 text-purple-700";
      case "life": return "bg-pink-100 text-pink-700";
      case "document": return "bg-yellow-100 text-yellow-700";
      case "note": return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: CaptureStatus) => {
    switch (status) {
      case "inbox": return <Clock className="h-3 w-3" />;
      case "converted": return <CheckCircle className="h-3 w-3" />;
      case "archived": return <Archive className="h-3 w-3" />;
    }
  };

  // TODO: In production, these would call APIs and update database
  const handleConvert = (targetType: string) => {
    if (!selectedItem) return;
    console.log(`Converting ${selectedItem.id} to ${targetType}`);
    // Mock conversion - just update status in memory
    selectedItem.status = "converted";
    selectedItem.convertedTo = {
      type: targetType,
      id: `${targetType}_${Date.now()}`,
      convertedAt: new Date().toISOString(),
    };
    alert(`Successfully converted to ${targetType}!`);
  };

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedItem && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">{selectedItem.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Captured {new Date(selectedItem.capturedAt).toLocaleString()}
              </p>
            </div>

            {/* Content Preview */}
            <Card className="p-4">
              <h3 className="text-sm font-medium mb-2">Content</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {selectedItem.content}
              </p>
            </Card>

            {/* Type & Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Type:</span>
                <Badge className={cn("capitalize", getTypeColor(selectedItem.type))}>
                  {selectedItem.type}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant="outline" className="capitalize flex items-center gap-1">
                  {getStatusIcon(selectedItem.status)}
                  {selectedItem.status}
                </Badge>
              </div>
            </div>

            {/* Attachments */}
            {selectedItem.attachments && selectedItem.attachments.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Attachments</h3>
                {selectedItem.attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Paperclip className="h-3 w-3" />
                    <span>{att.name}</span>
                    <span className="text-xs">({(att.size / 1024).toFixed(0)} KB)</span>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Target */}
            {selectedItem.suggestedTarget && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Suggested Conversion</h3>
                <Badge variant="secondary">{selectedItem.suggestedTarget}</Badge>
              </div>
            )}

            {/* Linked Entity */}
            {selectedItem.linkedEntity && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Linked To
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedItem.linkedEntity.title} ({selectedItem.linkedEntity.type})
                </p>
              </div>
            )}

            {/* Conversion Info */}
            {selectedItem.convertedTo && (
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span>Converted to {selectedItem.convertedTo.type}</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {new Date(selectedItem.convertedTo.convertedAt).toLocaleString()}
                </p>
              </Card>
            )}

            {/* Conversion Actions */}
            {selectedItem.status === "inbox" && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Convert To</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleConvert("task")}>
                    Task
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleConvert("transaction")}>
                    Money
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleConvert("timeEntry")}>
                    Time Log
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleConvert("lifeEvent")}>
                    Life Event
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleConvert("document")}>
                    Document
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleConvert("note")}>
                    Note
                  </Button>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {selectedItem.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )
      }
    >
      <div className="p-6 space-y-6">
        <PageHeader
          title="Inbox"
          description="Quick captures waiting to be processed"
          actions={
            <Button onClick={() => setCaptureDialogOpen(true)}>
              Quick Capture
            </Button>
          }
        />

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inbox..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            All
          </Button>
          <Button
            variant={filterStatus === "inbox" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("inbox")}
          >
            Inbox
          </Button>
          <Button
            variant={filterStatus === "converted" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("converted")}
          >
            Converted
          </Button>
        </div>

        {/* Inbox List */}
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-colors",
                selectedItem?.id === item.id
                  ? "border-primary bg-muted"
                  : "border-transparent hover:bg-muted"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{item.title}</h3>
                    <Badge className={cn("text-xs capitalize", getTypeColor(item.type))}>
                      {item.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{new Date(item.capturedAt).toLocaleDateString()}</span>
                    {item.attachments && item.attachments.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        {item.attachments.length}
                      </span>
                    )}
                    {item.linkedEntity && (
                      <span className="flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        Linked
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1 shrink-0">
                  {getStatusIcon(item.status)}
                  {item.status}
                </Badge>
              </div>
            </button>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No items found</p>
            </div>
          )}
        </div>
      </div>

      <QuickCaptureDialog
        open={captureDialogOpen}
        onOpenChange={setCaptureDialogOpen}
      />
    </AppShell>
  );
}
