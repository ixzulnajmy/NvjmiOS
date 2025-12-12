// file: app/documents/salary/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockDocuments } from "@/lib/mock-data";
import { Document } from "@/lib/types";
import { Plus, Search, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { DetailPanel, TagList } from "@/components/shared/detail-panel";

export default function SalarySlipsPage() {
  const documents = mockDocuments.filter((d) => d.type === "salary_slip");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(documents[0] || null);

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedDoc && (
          <DetailPanel
            title={selectedDoc.title}
            subtitle={new Date(selectedDoc.date).toLocaleDateString()}
            sections={[
              {
                title: "Document Details",
                icon: <File className="h-4 w-4" />,
                content: (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Type</label>
                      <Badge variant="secondary">{selectedDoc.type.replace("_", " ")}</Badge>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Date</label>
                      <p className="text-sm">{new Date(selectedDoc.date).toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Tags</label>
                      <TagList tags={selectedDoc.tags} />
                    </div>

                    <Button className="w-full" variant="outline">
                      Open Document
                    </Button>
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
          title="Salary Slips"
          description="Manage your salary slip documents"
          actions={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Salary Slip
            </Button>
          }
        />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search documents..." className="pl-9" />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow
                  key={doc.id}
                  className={cn(
                    "cursor-pointer",
                    selectedDoc?.id === doc.id && "bg-muted"
                  )}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell>{new Date(doc.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {doc.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
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
