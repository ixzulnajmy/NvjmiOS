// file: app/money/bnpl/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockBNPLItems } from "@/lib/mock-data";
import { BNPLItem } from "@/lib/types";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { DetailPanel, TagList } from "@/components/shared/detail-panel";

export default function BNPLPage() {
  const [selectedItem, setSelectedItem] = useState<BNPLItem | null>(mockBNPLItems[0]);
  const [statusFilter, setStatusFilter] = useState<string | null>("active");

  const filteredItems = mockBNPLItems.filter((item) =>
    statusFilter ? item.status === statusFilter : true
  );

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedItem && (
          <DetailPanel
            title={selectedItem.item}
            subtitle={`${selectedItem.merchant} • ${selectedItem.provider}`}
            sections={[
              {
                title: "Payment Details",
                content: (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Total Amount</label>
                        <p className="text-lg font-semibold">RM {selectedItem.totalAmount.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Remaining</label>
                        <p className="text-lg font-semibold text-red-500">
                          RM {selectedItem.remainingAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Payment Progress</span>
                        <span className="font-medium">
                          {selectedItem.installmentsPaid}/{selectedItem.installments} installments
                        </span>
                      </div>
                      <Progress
                        value={(selectedItem.installmentsPaid / selectedItem.installments) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Monthly Payment</label>
                        <p className="text-base font-semibold">RM {selectedItem.monthlyPayment.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Next Payment</label>
                        <p className="text-base">{new Date(selectedItem.nextPaymentDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Status</label>
                      <Badge
                        variant={selectedItem.status === "active" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {selectedItem.status}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Start Date</label>
                      <p className="text-sm">{new Date(selectedItem.startDate).toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Tags</label>
                      <TagList tags={selectedItem.tags} />
                    </div>

                    {selectedItem.notes && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Notes</label>
                        <p className="text-sm text-muted-foreground">{selectedItem.notes}</p>
                      </div>
                    )}
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
          title="Buy Now Pay Later (BNPL)"
          description="Track your installment payments and BNPL purchases"
          actions={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New BNPL
            </Button>
          }
        />

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search BNPL items..." className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={statusFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(null)}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("completed")}
            >
              Completed
            </Button>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Next Payment</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    "cursor-pointer",
                    selectedItem?.id === item.id && "bg-muted"
                  )}
                  onClick={() => setSelectedItem(item)}
                >
                  <TableCell className="font-medium">{item.item}</TableCell>
                  <TableCell className="text-sm">{item.merchant}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {item.provider}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <Progress
                        value={(item.installmentsPaid / item.installments) * 100}
                        className="h-1.5 flex-1"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {item.installmentsPaid}/{item.installments}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(item.nextPaymentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-red-500">
                    RM {item.remainingAmount.toFixed(2)}
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
