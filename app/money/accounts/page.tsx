// file: app/money/accounts/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockAccounts } from "@/lib/mock-data";
import { Account } from "@/lib/types";
import { Plus, Search, Wallet, CreditCard, Smartphone, ShoppingBag, TrendingUp } from "lucide-react";
import { DetailPanel, TagList } from "@/components/shared/detail-panel";
import { SuggestedSteps } from "@/components/shared/suggested-steps";
import { EntityTable, TableColumn } from "@/components/shared/entity-table";
import { cn } from "@/lib/utils";

export default function AccountsPage() {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(mockAccounts[0] || null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const columns: TableColumn[] = [
    { key: "name", label: "Account Name", width: "250px" },
    { key: "type", label: "Type", width: "140px" },
    { key: "balance", label: "Balance", width: "160px", align: "right" },
    { key: "limit", label: "Limit", width: "140px", align: "right" },
    { key: "billing", label: "Billing Day", width: "120px", align: "center" },
  ];

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <Wallet className="h-4 w-4" />;
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "ewallet":
        return <Smartphone className="h-4 w-4" />;
      case "bnpl":
        return <ShoppingBag className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bank":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "card":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "ewallet":
        return "text-green-600 bg-green-50 border-green-200";
      case "bnpl":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance < 0) return "text-red-600";
    if (balance > 10000) return "text-green-600";
    return "text-foreground";
  };

  const renderCell = (account: Account, columnKey: string) => {
    switch (columnKey) {
      case "name":
        return (
          <div className="flex items-center gap-2">
            {getAccountIcon(account.type)}
            <span className="font-medium">{account.name}</span>
          </div>
        );
      case "type":
        return (
          <Badge variant="outline" className={cn("capitalize", getTypeColor(account.type))}>
            {account.type}
          </Badge>
        );
      case "balance":
        return (
          <span className={cn("font-medium", getBalanceColor(account.balance))}>
            RM {account.balance.toFixed(2)}
          </span>
        );
      case "limit":
        return account.limit !== undefined ? (
          <span className="text-sm text-muted-foreground">RM {account.limit.toFixed(2)}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      case "billing":
        return account.billingDay !== undefined ? (
          <Badge variant="secondary">{account.billingDay}</Badge>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      default:
        return null;
    }
  };

  const totalBalance = mockAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <AppShell
      showDetail={true}
      detail={
        selectedAccount && (
          <DetailPanel
            title={selectedAccount.name}
            subtitle={selectedAccount.type.charAt(0).toUpperCase() + selectedAccount.type.slice(1)}
            sections={[
              {
                title: "Balance & Limits",
                icon: <TrendingUp className="h-4 w-4" />,
                content: (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Balance</span>
                      <span className={cn("text-2xl font-bold", getBalanceColor(selectedAccount.balance))}>
                        RM {selectedAccount.balance.toFixed(2)}
                      </span>
                    </div>
                    {selectedAccount.limit !== undefined && (
                      <>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-xs text-muted-foreground">Credit Limit</span>
                          <span className="text-sm font-medium">RM {selectedAccount.limit.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Available</span>
                          <span className="text-sm font-medium text-green-600">
                            RM {(selectedAccount.limit + selectedAccount.balance).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Utilization</span>
                          <span className="text-sm font-medium">
                            {((Math.abs(selectedAccount.balance) / selectedAccount.limit) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ),
              },
              {
                title: "Account Details",
                content: (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Type</label>
                      <Badge variant="outline" className={cn("capitalize", getTypeColor(selectedAccount.type))}>
                        {getAccountIcon(selectedAccount.type)}
                        <span className="ml-1">{selectedAccount.type}</span>
                      </Badge>
                    </div>
                    {selectedAccount.billingDay !== undefined && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Billing Day</label>
                        <p className="text-sm">Day {selectedAccount.billingDay} of each month</p>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                title: "Tags",
                content: <TagList tags={selectedAccount.tags} />,
              },
              ...(selectedAccount.notes
                ? [
                    {
                      title: "Notes",
                      content: (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedAccount.notes}
                        </p>
                      ),
                    },
                  ]
                : []),
              {
                title: "Account Insights",
                content: (
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>• You have {mockAccounts.length} active accounts</p>
                    <p>• Total balance across all accounts: RM {totalBalance.toFixed(2)}</p>
                    <p>• Track transactions from this account in Transactions page</p>
                  </div>
                ),
              },
              {
                title: "Action Steps",
                content: (
                  <SuggestedSteps
                    steps={[
                      "Review all account balances weekly",
                      "Set up alerts for low balance on key accounts",
                      "Monitor credit card utilization (keep below 30%)",
                      "Link transactions to specific accounts for tracking",
                      "Review and optimize account fees and charges",
                      "Consider consolidating accounts to simplify management",
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
          title="Accounts"
          description="Manage all your financial accounts"
          actions={
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>New Account</DialogTitle>
                  <DialogDescription>
                    Add a new financial account to track
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="acc-name">Account Name</Label>
                    <Input id="acc-name" placeholder="e.g., Maybank Savings" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acc-type">Account Type</Label>
                    <Select>
                      <SelectTrigger id="acc-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Bank Account</SelectItem>
                        <SelectItem value="card">Credit Card</SelectItem>
                        <SelectItem value="ewallet">E-Wallet</SelectItem>
                        <SelectItem value="bnpl">Buy Now Pay Later</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acc-balance">Current Balance (RM)</Label>
                    <Input id="acc-balance" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="acc-limit">Credit Limit (Optional)</Label>
                      <Input id="acc-limit" type="number" step="0.01" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="acc-billing">Billing Day (Optional)</Label>
                      <Input id="acc-billing" type="number" min="1" max="31" placeholder="1-31" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acc-notes">Notes (Optional)</Label>
                    <Textarea id="acc-notes" placeholder="Any additional notes..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acc-tags">Tags</Label>
                    <Input id="acc-tags" placeholder="e.g., savings, primary, daily" />
                    <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setDialogOpen(false)}>
                    Save Account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search accounts..." className="pl-9" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <p className={cn("text-2xl font-bold mt-1", getBalanceColor(totalBalance))}>
              RM {totalBalance.toFixed(2)}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Active Accounts</p>
            <p className="text-2xl font-bold mt-1">{mockAccounts.length}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Credit Utilization</p>
            <p className="text-2xl font-bold mt-1">
              {(
                (mockAccounts
                  .filter((a) => a.limit)
                  .reduce((sum, a) => sum + Math.abs(a.balance), 0) /
                  mockAccounts.filter((a) => a.limit).reduce((sum, a) => sum + (a.limit || 0), 0)) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
        </div>

        <EntityTable
          columns={columns}
          data={mockAccounts}
          onRowClick={setSelectedAccount}
          selectedId={selectedAccount?.id}
          renderCell={renderCell}
        />
      </div>
    </AppShell>
  );
}
