// file: app/money/page.tsx
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EntityTable, TableColumn } from "@/components/shared/entity-table";
import { DetailPanel, TagList } from "@/components/shared/detail-panel";
import { mockAccounts, mockTransactions, mockBNPLItems, mockSavingsGoals } from "@/lib/mock-data";
import { MoneyTransaction } from "@/lib/types";
import { TrendingUp, TrendingDown, Wallet, DollarSign, Target, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MoneyOverviewPage() {
  const [selectedTransaction, setSelectedTransaction] = useState<MoneyTransaction | null>(null);

  // Helper functions
  const getTransactionType = (amount: number): "income" | "expense" => {
    return amount >= 0 ? "income" : "expense";
  };

  const getTypeColor = (amount: number) => {
    const type = getTransactionType(amount);
    switch (type) {
      case "income":
        return "bg-green-100 text-green-700 border-green-200";
      case "expense":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Food & Dining": "bg-orange-100 text-orange-700",
      "Transport": "bg-blue-100 text-blue-700",
      "Shopping": "bg-purple-100 text-purple-700",
      "Entertainment": "bg-pink-100 text-pink-700",
      "Bills & Utilities": "bg-yellow-100 text-yellow-700",
      "Salary": "bg-green-100 text-green-700",
      "Freelance": "bg-emerald-100 text-emerald-700",
      "Savings": "bg-cyan-100 text-cyan-700",
      "Health": "bg-red-100 text-red-700",
      "Education": "bg-indigo-100 text-indigo-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  // Calculations for Summary Cards
  const totalAssets = mockAccounts
    .filter(acc => acc.type !== "card")
    .reduce((sum, acc) => sum + acc.balance, 0);

  const totalDebts = Math.abs(
    mockAccounts
      .filter(acc => acc.type === "card")
      .reduce((sum, acc) => sum + acc.balance, 0)
  ) + mockBNPLItems
    .filter(item => item.status === "active")
    .reduce((sum, item) => sum + item.remainingAmount, 0);

  const netWorth = totalAssets - totalDebts;

  // This month's cashflow (income vs expenses)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthTransactions = mockTransactions.filter(txn => {
    const txnDate = new Date(txn.date);
    return txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear;
  });

  const thisMonthIncome = thisMonthTransactions
    .filter(txn => txn.amount >= 0)
    .reduce((sum, txn) => sum + txn.amount, 0);

  const thisMonthExpenses = Math.abs(
    thisMonthTransactions
      .filter(txn => txn.amount < 0)
      .reduce((sum, txn) => sum + txn.amount, 0)
  );

  const cashflow = thisMonthIncome - thisMonthExpenses;

  // Upcoming payments (next 14 days)
  const fourteenDaysFromNow = new Date();
  fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);

  const upcomingBNPL = mockBNPLItems.filter(item =>
    item.status === "active" &&
    new Date(item.nextPaymentDate) <= fourteenDaysFromNow
  );

  const upcomingPayments = upcomingBNPL.reduce((sum, item) => sum + item.monthlyPayment, 0);

  // Savings progress (overall)
  const totalSavingsTarget = mockSavingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSavingsCurrent = mockSavingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const savingsProgress = totalSavingsTarget > 0 ? (totalSavingsCurrent / totalSavingsTarget) * 100 : 0;

  // Spending by Category (this month expenses)
  const expensesByCategory: Record<string, number> = {};
  thisMonthTransactions
    .filter(txn => txn.amount < 0)
    .forEach(txn => {
      const category = txn.category || "Uncategorized";
      expensesByCategory[category] = (expensesByCategory[category] || 0) + Math.abs(txn.amount);
    });

  const categoryData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const maxCategoryAmount = categoryData.length > 0 ? categoryData[0].amount : 1;

  // Recent transactions (last 10)
  const recentTransactions = [...mockTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // EntityTable columns
  const transactionColumns = [
    { key: "date" as keyof MoneyTransaction, label: "Date", sortable: true },
    { key: "description" as keyof MoneyTransaction, label: "Description", sortable: true },
    { key: "category" as keyof MoneyTransaction, label: "Category", sortable: true },
    { key: "amount" as keyof MoneyTransaction, label: "Amount", sortable: true },
  ];

  const renderTransactionCell = (transaction: MoneyTransaction, columnKey: string) => {
    switch (columnKey) {
      case "date":
        return <span className="text-sm">{new Date(transaction.date).toLocaleDateString()}</span>;
      case "description":
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{transaction.description}</span>
            {transaction.account && (
              <span className="text-xs text-muted-foreground">{transaction.account}</span>
            )}
          </div>
        );
      case "category":
        return transaction.category ? (
          <Badge variant="outline" className={cn("text-xs", getCategoryColor(transaction.category))}>
            {transaction.category}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        );
      case "amount":
        const isIncome = transaction.amount >= 0;
        return (
          <span
            className={cn(
              "text-sm font-medium flex items-center gap-1",
              isIncome ? "text-green-600" : "text-red-600"
            )}
          >
            {isIncome ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
            {isIncome ? "+" : ""}RM {Math.abs(transaction.amount).toFixed(2)}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AppShell
      showDetail={!!selectedTransaction}
      detail={
        selectedTransaction && (
          <DetailPanel
            title={selectedTransaction.description}
            subtitle={`Transaction • ${new Date(selectedTransaction.date).toLocaleDateString()}`}
            sections={[
              {
                title: "Transaction Details",
                content: (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span
                        className={cn(
                          "text-2xl font-bold",
                          selectedTransaction.amount >= 0 ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {selectedTransaction.amount >= 0 ? "+" : ""}RM {Math.abs(selectedTransaction.amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-xs text-muted-foreground">Type</span>
                      <Badge variant="outline" className={cn("capitalize", getTypeColor(selectedTransaction.amount))}>
                        {getTransactionType(selectedTransaction.amount)}
                      </Badge>
                    </div>
                    {selectedTransaction.category && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Category</span>
                        <Badge variant="outline" className={getCategoryColor(selectedTransaction.category)}>
                          {selectedTransaction.category}
                        </Badge>
                      </div>
                    )}
                    {selectedTransaction.account && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Account</span>
                        <span className="text-sm">{selectedTransaction.account}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Date</span>
                      <span className="text-sm">{new Date(selectedTransaction.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ),
              },
              ...(selectedTransaction.notes
                ? [
                    {
                      title: "Notes",
                      content: (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedTransaction.notes}
                        </p>
                      ),
                    },
                  ]
                : []),
              {
                title: "Tags",
                content: <TagList tags={selectedTransaction.tags} />,
              },
            ]}
          />
        )
      }
    >
      <div className="p-6 space-y-6">
        <PageHeader
          title="Money Overview"
          description="Your financial snapshot at a glance"
        />

        {/* Top Row - 4 Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Net Worth */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Net Worth</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RM {netWorth.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Assets: RM {totalAssets.toFixed(2)} • Debts: RM {totalDebts.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          {/* This Month Cashflow */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month Cashflow</CardTitle>
              {cashflow >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", cashflow >= 0 ? "text-green-600" : "text-red-600")}>
                {cashflow >= 0 ? "+" : ""}RM {cashflow.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                In: RM {thisMonthIncome.toFixed(2)} • Out: RM {thisMonthExpenses.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Payments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RM {upcomingPayments.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {upcomingBNPL.length} BNPL payment{upcomingBNPL.length !== 1 ? "s" : ""} in next 14 days
              </p>
            </CardContent>
          </Card>

          {/* Savings Progress */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{savingsProgress.toFixed(1)}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(savingsProgress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                RM {totalSavingsCurrent.toFixed(0)} / RM {totalSavingsTarget.toFixed(0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Middle Row - Spending by Category + Savings Goals */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Spending by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>This month's expenses breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <div className="space-y-4">
                  {categoryData.map(({ category, amount }) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category}</span>
                        <span className="text-sm text-muted-foreground">
                          RM {amount.toFixed(2)} ({((amount / thisMonthExpenses) * 100).toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(amount / maxCategoryAmount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>Total Expenses</span>
                      <span className="text-red-600">RM {thisMonthExpenses.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No expenses recorded this month
                </p>
              )}
            </CardContent>
          </Card>

          {/* Savings Goals Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle>Savings Goals Snapshot</CardTitle>
              <CardDescription>Track your savings targets</CardDescription>
            </CardHeader>
            <CardContent>
              {mockSavingsGoals.length > 0 ? (
                <div className="space-y-4">
                  {mockSavingsGoals.slice(0, 4).map((goal) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{goal.name}</span>
                          <span className="text-sm text-muted-foreground">
                            RM {goal.currentAmount.toFixed(0)} / RM {goal.targetAmount.toFixed(0)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{progress.toFixed(0)}% complete</span>
                          {goal.targetDate && (
                            <span>Due: {new Date(goal.targetDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {mockSavingsGoals.length > 4 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{mockSavingsGoals.length - 4} more goal{mockSavingsGoals.length - 4 !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No active savings goals
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Last 10 transactions across all accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <EntityTable
              data={recentTransactions}
              columns={transactionColumns}
              selectedId={selectedTransaction?.id}
              onRowClick={setSelectedTransaction}
              renderCell={renderTransactionCell}
              emptyState={<p className="text-sm text-muted-foreground text-center py-8">No recent transactions</p>}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
