// file: app/money/debts/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockDebts } from "@/lib/mock-data";
import { Debt } from "@/lib/types";
import { Plus, Search, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DetailPanel, TagList } from "@/components/shared/detail-panel";
import { Input } from "@/components/ui/input";

export default function DebtsPage() {
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(mockDebts[0]);

  const totalDebt = mockDebts.reduce((sum, d) => sum + d.remainingAmount, 0);

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedDebt && (
          <DetailPanel
            title={selectedDebt.name}
            subtitle={selectedDebt.creditor}
            sections={[
              {
                title: "Debt Details",
                icon: <TrendingDown className="h-4 w-4" />,
                content: (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Total Amount</label>
                        <p className="text-lg font-semibold">RM {selectedDebt.totalAmount.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Remaining</label>
                        <p className="text-lg font-semibold text-red-500">
                          RM {selectedDebt.remainingAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Repayment Progress</span>
                        <span className="font-medium">
                          {((selectedDebt.paidAmount / selectedDebt.totalAmount) * 100).toFixed(1)}% paid
                        </span>
                      </div>
                      <Progress
                        value={(selectedDebt.paidAmount / selectedDebt.totalAmount) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Monthly Payment</label>
                        <p className="text-base font-semibold">RM {selectedDebt.monthlyPayment.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Interest Rate</label>
                        <p className="text-base font-semibold">{selectedDebt.interestRate.toFixed(2)}%</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Next Payment Date</label>
                      <p className="text-sm">{new Date(selectedDebt.nextPaymentDate).toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Debt Type</label>
                      <Badge variant="secondary">{selectedDebt.type.replace("_", " ")}</Badge>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Status</label>
                      <Badge variant={selectedDebt.status === "active" ? "default" : "secondary"}>
                        {selectedDebt.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Start Date</label>
                      <p className="text-sm">{new Date(selectedDebt.startDate).toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Tags</label>
                      <TagList tags={selectedDebt.tags} />
                    </div>

                    {selectedDebt.notes && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Notes</label>
                        <p className="text-sm text-muted-foreground">{selectedDebt.notes}</p>
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
          title="Debts"
          description="Track and manage your debts and loans"
          actions={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Debt
            </Button>
          }
        />

        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Outstanding Debt</p>
              <p className="text-2xl font-bold text-destructive">RM {totalDebt.toFixed(2)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search debts..." className="pl-9" />
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Creditor</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Next Payment</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDebts.map((debt) => (
                <TableRow
                  key={debt.id}
                  className={cn(
                    "cursor-pointer",
                    selectedDebt?.id === debt.id && "bg-muted"
                  )}
                  onClick={() => setSelectedDebt(debt)}
                >
                  <TableCell className="font-medium">{debt.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {debt.type.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{debt.creditor}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <Progress
                        value={(debt.paidAmount / debt.totalAmount) * 100}
                        className="h-1.5 flex-1"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {((debt.paidAmount / debt.totalAmount) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(debt.nextPaymentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-red-500">
                    RM {debt.remainingAmount.toFixed(2)}
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
