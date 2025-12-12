// file: app/money/transactions/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockTransactions } from "@/lib/mock-data";
import { MoneyTransaction } from "@/lib/types";
import { Plus, Search, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  const [selectedTransaction, setSelectedTransaction] = useState<MoneyTransaction | null>(
    mockTransactions[0]
  );
  const [filter, setFilter] = useState<"all" | "week" | "month">("all");

  const filteredTransactions = mockTransactions.filter((t) => {
    if (filter === "all") return true;
    const date = new Date(t.date);
    const now = new Date();
    if (filter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return date >= weekAgo;
    }
    if (filter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return date >= monthAgo;
    }
    return true;
  });

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedTransaction && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Transaction Details</h2>
              <p className="text-sm text-muted-foreground">
                ID: {selectedTransaction.id}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    defaultValue={selectedTransaction.description}
                    className="text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      defaultValue={selectedTransaction.date}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <Input
                      type="number"
                      defaultValue={selectedTransaction.amount}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      defaultValue={selectedTransaction.category}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Account</label>
                    <Input
                      defaultValue={selectedTransaction.account}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-1">
                    {selectedTransaction.tags.map((tag) => (
                      <div
                        key={tag}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTransaction.notes && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedTransaction.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Linked Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {/* TODO: Implement linking to LifeEvents, Documents, etc. */}
                  {selectedTransaction.linkedEvents?.length || 0} linked events
                </p>
                {selectedTransaction.linkedEvents && selectedTransaction.linkedEvents.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedTransaction.linkedEvents.map((eventId) => (
                      <div
                        key={eventId}
                        className="px-2 py-1 bg-muted rounded-md text-xs"
                      >
                        Event: {eventId}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {selectedTransaction.amount < 0
                    ? `Typical expense for category "${selectedTransaction.category}". Occurs approximately 3x per week.`
                    : `Income transaction. Part of regular income stream.`}
                </p>
                {/* TODO: Replace with real AI-generated insights */}
              </CardContent>
            </Card>
          </div>
        )
      }
    >
      <div className="p-6 space-y-6">
        <PageHeader
          title="Transactions"
          description="All your financial transactions in one place"
          actions={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          }
        />

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={filter === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("week")}
            >
              This Week
            </Button>
            <Button
              variant={filter === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("month")}
            >
              This Month
            </Button>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className={cn(
                    "cursor-pointer",
                    selectedTransaction?.id === transaction.id && "bg-muted"
                  )}
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <TableCell className="text-sm">
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-xs">
                      {transaction.category}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {transaction.account}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      transaction.amount < 0 ? "text-red-500" : "text-green-500"
                    )}
                  >
                    {transaction.amount < 0 ? "-" : "+"}RM{" "}
                    {Math.abs(transaction.amount).toFixed(2)}
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
