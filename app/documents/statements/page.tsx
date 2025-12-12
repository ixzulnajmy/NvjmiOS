// file: app/documents/statements/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockBankStatements } from "@/lib/mock-data";
import { BankStatement } from "@/lib/types";
import { Plus, Search, FileText, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { DetailPanel, TagList } from "@/components/shared/detail-panel";
import { SuggestedSteps } from "@/components/shared/suggested-steps";
import { EntityTable, TableColumn } from "@/components/shared/entity-table";
import { cn } from "@/lib/utils";

export default function BankStatementsPage() {
  const [selectedStatement, setSelectedStatement] = useState<BankStatement | null>(mockBankStatements[0] || null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const columns: TableColumn[] = [
    { key: "account", label: "Account", width: "160px" },
    { key: "period", label: "Period", width: "120px" },
    { key: "dates", label: "Date Range", width: "200px" },
    { key: "transactions", label: "Transactions", width: "120px", align: "center" },
    { key: "status", label: "Status", width: "120px" },
    { key: "file", label: "File Info", width: "160px" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "parsed":
        return "text-green-600 bg-green-50 border-green-200";
      case "uploaded":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "parsed":
        return <CheckCircle className="h-3 w-3" />;
      case "error":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Upload className="h-3 w-3" />;
    }
  };

  const renderCell = (statement: BankStatement, columnKey: string) => {
    switch (columnKey) {
      case "account":
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{statement.account}</span>
          </div>
        );
      case "period":
        return <Badge variant="secondary">{statement.period}</Badge>;
      case "dates":
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(statement.startDate).toLocaleDateString()} - {new Date(statement.endDate).toLocaleDateString()}
          </span>
        );
      case "transactions":
        return statement.transactionCount !== undefined ? (
          <span className="text-sm font-medium">{statement.transactionCount}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      case "status":
        return (
          <Badge variant="outline" className={cn("capitalize flex items-center gap-1", getStatusColor(statement.status))}>
            {getStatusIcon(statement.status)}
            {statement.status}
          </Badge>
        );
      case "file":
        return (
          <div className="text-xs text-muted-foreground">
            <div>{statement.fileType}</div>
            {statement.fileSize && <div>{statement.fileSize}</div>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedStatement && (
          <DetailPanel
            title={selectedStatement.title}
            subtitle={selectedStatement.account}
            sections={[
              {
                title: "Statement Details",
                icon: <FileText className="h-4 w-4" />,
                content: (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Account</label>
                      <p className="text-sm font-medium">{selectedStatement.account}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Period</label>
                      <Badge variant="secondary">{selectedStatement.period}</Badge>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Date Range</label>
                      <p className="text-sm">
                        {new Date(selectedStatement.startDate).toLocaleDateString()} -{" "}
                        {new Date(selectedStatement.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Uploaded On</label>
                      <p className="text-sm">{new Date(selectedStatement.uploadedOn).toLocaleDateString()}</p>
                    </div>
                  </div>
                ),
              },
              {
                title: "File Information",
                icon: <Upload className="h-4 w-4" />,
                content: (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">File Type</label>
                      <Badge variant="outline">{selectedStatement.fileType}</Badge>
                    </div>
                    {selectedStatement.fileSize && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">File Size</label>
                        <p className="text-sm">{selectedStatement.fileSize}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Status</label>
                      <Badge variant="outline" className={cn("capitalize flex items-center gap-1 w-fit", getStatusColor(selectedStatement.status))}>
                        {getStatusIcon(selectedStatement.status)}
                        {selectedStatement.status}
                      </Badge>
                    </div>
                  </div>
                ),
              },
              {
                title: "Transaction Summary",
                content: (
                  <div className="space-y-3">
                    {selectedStatement.transactionCount !== undefined ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Transactions</span>
                          <span className="text-2xl font-bold">{selectedStatement.transactionCount}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedStatement.linkedTransactions && selectedStatement.linkedTransactions.length > 0
                            ? `${selectedStatement.linkedTransactions.length} transactions linked to your records`
                            : "No transactions linked yet"}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No transaction data available</p>
                    )}
                  </div>
                ),
              },
              {
                title: "Tags",
                content: <TagList tags={selectedStatement.tags} />,
              },
              {
                title: "Document Insights",
                content: (
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>• You have {mockBankStatements.length} statements uploaded</p>
                    <p>• {mockBankStatements.filter(s => s.status === "parsed").length} successfully parsed</p>
                    <p>• Keep statements for at least 7 years for tax purposes</p>
                  </div>
                ),
              },
              {
                title: "Action Steps",
                content: (
                  <SuggestedSteps
                    steps={[
                      "Review all transactions and reconcile with your records",
                      "Link statement transactions to your expense tracking",
                      "Set up automatic statement downloads from your bank",
                      "Organize statements by year and account for easy retrieval",
                      "Verify all recurring payments and subscriptions",
                      "Archive old statements securely after 7 years",
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
          title="Bank Statements"
          description="Manage and organize your bank statement documents"
          actions={
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Statement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Bank Statement</DialogTitle>
                  <DialogDescription>
                    Upload a new bank statement document
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="stmt-title">Title</Label>
                    <Input id="stmt-title" placeholder="e.g., Maybank November 2025" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stmt-account">Account</Label>
                    <Select>
                      <SelectTrigger id="stmt-account">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Maybank">Maybank</SelectItem>
                        <SelectItem value="CIMB">CIMB</SelectItem>
                        <SelectItem value="Public Bank">Public Bank</SelectItem>
                        <SelectItem value="RHB">RHB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stmt-period">Period</Label>
                    <Input id="stmt-period" placeholder="e.g., Nov 2025" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stmt-start">Start Date</Label>
                      <Input id="stmt-start" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stmt-end">End Date</Label>
                      <Input id="stmt-end" type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stmt-file">File Upload</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, CSV, or Excel files</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stmt-tags">Tags</Label>
                    <Input id="stmt-tags" placeholder="e.g., monthly, savings, checking" />
                    <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setDialogOpen(false)}>
                    Upload Statement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search statements..." className="pl-9" />
          </div>
        </div>

        <EntityTable
          columns={columns}
          data={mockBankStatements}
          onRowClick={setSelectedStatement}
          selectedId={selectedStatement?.id}
          renderCell={renderCell}
        />
      </div>
    </AppShell>
  );
}
