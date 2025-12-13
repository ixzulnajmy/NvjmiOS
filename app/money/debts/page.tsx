// file: app/money/debts/page.tsx
"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockLoans, mockLoanPaymentsByLoanId, mockIOUs } from "./mock-data";
import { Loan, LoanPayment, IOU, LoanType, IOUDirection, IOUStatus } from "@/types/finance";
import {
  Plus,
  Search,
  FileText,
  AlertTriangle,
  Calculator,
  Link as LinkIcon,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LoanScheduleChart } from "@/components/money/debts/loan-schedule-chart";

const LOANS_PER_PAGE = 5;

// Helper functions for Title Case labels
const getLoanTypeLabel = (type: LoanType): string => {
  const labels: Record<LoanType, string> = {
    HOME: "Home",
    CAR: "Car",
    PERSONAL: "Personal",
    EDUCATION: "Education",
    OTHER: "Other",
  };
  return labels[type] || type;
};

const getLoanStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    ACTIVE: "Active",
    IN_ARREARS: "In Arrears",
    COMPLETED: "Completed",
  };
  return labels[status] || status;
};

const getIOUDirectionLabel = (direction: string): string => {
  return direction === "OWES_ME" ? "Owes Me" : "I Owe";
};

const getIOUStatusLabel = (status: string): string => {
  return status === "PENDING" ? "Pending" : "Settled";
};

const toTitleCase = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function DebtsPage() {
  const [activeTab, setActiveTab] = useState<"loans" | "ious">("loans");
  const [loans, setLoans] = useState<Loan[]>(mockLoans);
  const [ious, setIOUs] = useState<IOU[]>(mockIOUs);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(mockLoans[0]?.id || null);
  const [selectedIOUId, setSelectedIOUId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLoansPage, setCurrentLoansPage] = useState(1);

  // Edit Loan dialog state
  const [isEditLoanDialogOpen, setIsEditLoanDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  // Edit IOU dialog state
  const [isEditIOUDialogOpen, setIsEditIOUDialogOpen] = useState(false);
  const [editingIOU, setEditingIOU] = useState<IOU | null>(null);

  const selectedLoan = loans.find((loan) => loan.id === selectedLoanId) || null;
  const selectedIOU = ious.find((iou) => iou.id === selectedIOUId) || null;

  // Reset page when search changes
  useEffect(() => {
    setCurrentLoansPage(1);
  }, [searchQuery]);

  // Filter loans based on search
  const filteredLoans = loans.filter((loan) =>
    loan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loan.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loan.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination for loans
  const totalLoanPages = Math.ceil(filteredLoans.length / LOANS_PER_PAGE) || 1;
  const startIndex = (currentLoansPage - 1) * LOANS_PER_PAGE;
  const endIndex = startIndex + LOANS_PER_PAGE;
  const paginatedLoans = filteredLoans.slice(startIndex, endIndex);

  // Get loan type badge color
  const getLoanTypeColor = (type: string) => {
    switch (type) {
      case "HOME":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800";
      case "CAR":
        return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800";
      case "PERSONAL":
        return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800";
      case "EDUCATION":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  // Get loan status badge
  const getLoanStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="secondary">{getLoanStatusLabel(status)}</Badge>;
      case "IN_ARREARS":
        return <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">{getLoanStatusLabel(status)}</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">{getLoanStatusLabel(status)}</Badge>;
      default:
        return <Badge variant="secondary">{getLoanStatusLabel(status)}</Badge>;
    }
  };

  // Get IOU direction badge
  const getIOUDirectionBadge = (direction: string) => {
    if (direction === "OWES_ME") {
      return <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">{getIOUDirectionLabel(direction)}</Badge>;
    }
    return <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">{getIOUDirectionLabel(direction)}</Badge>;
  };

  // Handle edit loan
  const handleEditLoan = () => {
    if (selectedLoan) {
      setEditingLoan({ ...selectedLoan });
      setIsEditLoanDialogOpen(true);
    }
  };

  // Handle save loan edits
  const handleSaveLoan = () => {
    if (!editingLoan) return;

    // TODO: Persist loan updates to backend (Supabase/DB) when backend is wired.
    setLoans((prev) =>
      prev.map((loan) => (loan.id === editingLoan.id ? editingLoan : loan))
    );
    setIsEditLoanDialogOpen(false);
    setEditingLoan(null);
  };

  // Handle edit IOU
  const handleEditIOU = () => {
    if (selectedIOU) {
      setEditingIOU({ ...selectedIOU });
      setIsEditIOUDialogOpen(true);
    }
  };

  // Handle save IOU edits
  const handleSaveIOU = () => {
    if (!editingIOU) return;

    // TODO: Persist IOU updates to backend (Supabase/DB) when backend is wired.
    setIOUs((prev) =>
      prev.map((iou) => (iou.id === editingIOU.id ? editingIOU : iou))
    );
    setIsEditIOUDialogOpen(false);
    setEditingIOU(null);
  };

  return (
    <AppShell showDetail={false}>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Debts"
          description="Track and manage your loans and personal IOUs."
          actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New {activeTab === "loans" ? "Loan" : "IOU"}
          </Button>
        }
      />

      {/* Page-level tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "loans" | "ious")}>
        <TabsList>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="ious">IOUs</TabsTrigger>
        </TabsList>

        {/* Loans Tab */}
        <TabsContent value="loans" className="space-y-6 mt-6">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by loan name, bank, or type..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Top Card: Loans Table */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Loans</CardTitle>
              <CardDescription>Your active and completed loans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loan</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Monthly</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLoans.map((loan) => (
                      <TableRow
                        key={loan.id}
                        className={cn(
                          "cursor-pointer",
                          selectedLoanId === loan.id && "bg-muted"
                        )}
                        onClick={() => setSelectedLoanId(loan.id)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{loan.name}</p>
                            <p className="text-sm text-muted-foreground">{loan.bankName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", getLoanTypeColor(loan.type))}>
                            {getLoanTypeLabel(loan.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[140px]">
                            <Progress value={loan.progressPercent || 0} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {loan.progressPercent?.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">RM {loan.monthlyInstalment.toLocaleString()}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-semibold text-red-600 dark:text-red-400">
                            RM {loan.remainingBalance.toLocaleString()}
                          </p>
                        </TableCell>
                        <TableCell>{getLoanStatusBadge(loan.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {filteredLoans.length > LOANS_PER_PAGE && (
                <div className="flex items-center justify-between border-t px-4 py-3 mt-4 text-sm text-muted-foreground">
                  <span>
                    Showing {startIndex + 1}–{Math.min(endIndex, filteredLoans.length)} of {filteredLoans.length} loans
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentLoansPage === 1}
                      onClick={() => setCurrentLoansPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span>
                      Page {currentLoansPage} of {totalLoanPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentLoansPage === totalLoanPages}
                      onClick={() => setCurrentLoansPage((p) => Math.min(totalLoanPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottom Card: Loan Detail */}
          {selectedLoan && (
            <Card className="w-full">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{selectedLoan.name}</CardTitle>
                  <CardDescription className="text-base">{selectedLoan.bankName}</CardDescription>
                  <div className="flex gap-2 pt-2">
                    {selectedLoan.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {toTitleCase(tag)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleEditLoan}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full justify-start overflow-x-auto mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="arrears">Arrears</TabsTrigger>
                    <TabsTrigger value="simulations">Simulations</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Amount</p>
                        <p className="text-lg font-semibold">RM {selectedLoan.totalAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Remaining Balance</p>
                        <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                          RM {selectedLoan.remainingBalance.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Repayment Progress</span>
                        <span className="font-medium">{selectedLoan.progressPercent?.toFixed(1)}% paid</span>
                      </div>
                      <Progress value={selectedLoan.progressPercent || 0} className="h-3" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Monthly Instalment</p>
                        <p className="text-base font-semibold">RM {selectedLoan.monthlyInstalment.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tenure</p>
                        <p className="text-base font-semibold">
                          {Math.floor(selectedLoan.tenureMonths / 12)} years {selectedLoan.tenureMonths % 12} months
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <div className="mt-1">{getLoanStatusBadge(selectedLoan.status)}</div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Next Payment</p>
                        <p className="text-sm mt-1">{new Date(selectedLoan.nextPaymentDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Started On</p>
                      <p className="text-sm mt-1">{new Date(selectedLoan.startedOn).toLocaleDateString()}</p>
                    </div>
                  </TabsContent>

                  {/* Schedule Tab */}
                  <TabsContent value="schedule" className="space-y-4">
                    <LoanScheduleChart />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Payment History</h3>
                      <p className="text-sm text-muted-foreground mb-4">Recent payments for this loan</p>
                      <div className="border rounded-lg overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Paid (RM)</TableHead>
                              <TableHead className="text-right">Principal</TableHead>
                              <TableHead className="text-right">Interest</TableHead>
                              <TableHead className="text-right">Charges</TableHead>
                              <TableHead className="text-right">Balance After</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Transaction</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(mockLoanPaymentsByLoanId[selectedLoan.id] || []).map((payment) => {
                              const totalCharges = (payment.lateCharges || 0) + (payment.otherCharges || 0);
                              return (
                                <TableRow key={payment.id}>
                                  <TableCell className="text-sm whitespace-nowrap">
                                    {new Date(payment.date).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {payment.paidAmount.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-right text-green-600 dark:text-green-400">
                                    {payment.principalPortion.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-right text-orange-600 dark:text-orange-400">
                                    {payment.interestPortion.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-right text-red-600 dark:text-red-400">
                                    {totalCharges > 0 ? totalCharges.toLocaleString() : "-"}
                                  </TableCell>
                                  <TableCell className="text-right text-sm text-muted-foreground">
                                    {payment.runningBalanceAfter?.toLocaleString() || "-"}
                                  </TableCell>
                                  <TableCell>
                                    {payment.isExtraPayment ? (
                                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 text-xs">
                                        Extra Payment
                                      </Badge>
                                    ) : payment.isArrearsPayment ? (
                                      <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800 text-xs">
                                        Arrears Payment
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="text-xs">Normal</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {payment.transactionId ? (
                                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                                        View Transaction
                                        {/* TODO: Link to Transactions page, e.g. /money/transactions?tx=<transactionId> */}
                                      </Button>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">Not linked</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Arrears Tab */}
                  <TabsContent value="arrears" className="space-y-4">
                    {selectedLoan.hasArrears ? (
                      <>
                        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                              <CardTitle className="text-lg text-red-900 dark:text-red-300">Arrears Summary</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-red-700 dark:text-red-400">Months Behind</p>
                                <p className="text-2xl font-bold text-red-900 dark:text-red-300">1</p>
                              </div>
                              <div>
                                <p className="text-xs text-red-700 dark:text-red-400">Total Arrears Amount</p>
                                <p className="text-2xl font-bold text-red-900 dark:text-red-300">RM 2,250.00</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-red-700 dark:text-red-400">Late Payment Charges</p>
                                <p className="text-lg font-semibold text-red-900 dark:text-red-300">RM 150.00</p>
                              </div>
                              <div>
                                <p className="text-xs text-red-700 dark:text-red-400">Other Charges</p>
                                <p className="text-lg font-semibold text-red-900 dark:text-red-300">RM 50.00</p>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-red-200 dark:border-red-800">
                              <p className="text-sm font-medium text-red-900 dark:text-red-300">
                                To bring this loan fully up to date, you need to pay: <span className="text-lg">RM 2,450.00</span>
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Last Payment Allocation</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              Your last payment of RM 3,500.00 on October 12, 2025 was allocated as follows:
                            </p>
                            <ul className="mt-3 space-y-2 text-sm">
                              <li className="flex justify-between">
                                <span>Principal:</span>
                                <span className="font-medium text-green-600 dark:text-green-400">RM 1,200.00</span>
                              </li>
                              <li className="flex justify-between">
                                <span>Interest:</span>
                                <span className="font-medium text-orange-600 dark:text-orange-400">RM 550.00</span>
                              </li>
                              <li className="flex justify-between">
                                <span>Late charges:</span>
                                <span className="font-medium text-red-600 dark:text-red-400">RM 150.00</span>
                              </li>
                              <li className="flex justify-between">
                                <span>Other charges:</span>
                                <span className="font-medium text-red-600 dark:text-red-400">RM 50.00</span>
                              </li>
                              <li className="flex justify-between border-t pt-2 mt-2">
                                <span className="font-semibold">Total:</span>
                                <span className="font-semibold">RM 3,500.00</span>
                              </li>
                            </ul>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-center py-8">
                            <div className="text-center space-y-2">
                              <div className="flex justify-center">
                                <div className="rounded-full bg-green-100 dark:bg-green-950 p-3">
                                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                              <p className="text-sm font-medium">No arrears</p>
                              <p className="text-xs text-muted-foreground">This loan is up to date with all payments.</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Simulations Tab */}
                  <TabsContent value="simulations" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          <CardTitle className="text-lg">Top-up this month</CardTitle>
                        </div>
                        <CardDescription>See how extra payments can reduce your loan tenure</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Top-up amount (RM)</label>
                          <Input type="number" placeholder="e.g., 5000" />
                        </div>

                        <div className="p-4 bg-muted rounded-lg space-y-2">
                          <p className="text-xs text-muted-foreground">Estimated Results:</p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="text-muted-foreground">Months shaved off:</span>{" "}
                              <span className="font-semibold">12 months</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-muted-foreground">Interest saved:</span>{" "}
                              <span className="font-semibold text-green-600 dark:text-green-400">RM 3,240.00</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-muted-foreground">New projected payoff year:</span>{" "}
                              <span className="font-semibold">2046</span>
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          TODO: Wire real amortization calculation logic
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          <CardTitle className="text-lg">Increase monthly instalment</CardTitle>
                        </div>
                        <CardDescription>Calculate the impact of higher monthly payments</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">New monthly instalment (RM)</label>
                          <Input type="number" placeholder="e.g., 2500" />
                        </div>

                        <div className="p-4 bg-muted rounded-lg space-y-2">
                          <p className="text-xs text-muted-foreground">Estimated Results:</p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="text-muted-foreground">Months shaved off:</span>{" "}
                              <span className="font-semibold">24 months</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-muted-foreground">Interest saved:</span>{" "}
                              <span className="font-semibold text-green-600 dark:text-green-400">RM 6,850.00</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-muted-foreground">New projected payoff year:</span>{" "}
                              <span className="font-semibold">2045</span>
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          TODO: Wire real amortization calculation logic
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Loan Documents</h3>
                      <p className="text-sm text-muted-foreground mb-4">Agreements, statements, and related files</p>
                      <div className="space-y-2">
                        {[
                          { name: "Loan Agreement.pdf", size: "2.4 MB" },
                          { name: "Offer Letter Astrum.pdf", size: "1.1 MB" },
                          { name: "Statement-Dec-2025.pdf", size: "384 KB" },
                          { name: "Statement-Nov-2025.pdf", size: "412 KB" },
                        ].map((doc) => (
                          <div
                            key={doc.name}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{doc.size}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-4">
                        TODO: Hook to real file storage later
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* IOUs Tab */}
        <TabsContent value="ious" className="space-y-6 mt-6">
          {/* Top Card: IOUs Table */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>IOUs</CardTitle>
              <CardDescription>Your personal debts and credits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Person</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount (RM)</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Transaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ious.map((iou) => (
                      <TableRow
                        key={iou.id}
                        className={cn(
                          "cursor-pointer",
                          selectedIOUId === iou.id && "bg-muted"
                        )}
                        onClick={() => setSelectedIOUId(iou.id)}
                      >
                        <TableCell className="font-medium">{iou.personName}</TableCell>
                        <TableCell>{getIOUDirectionBadge(iou.direction)}</TableCell>
                        <TableCell className="text-sm">{iou.description || "-"}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {iou.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(iou.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={iou.status === "SETTLED" ? "secondary" : "default"} className="text-xs">
                            {getIOUStatusLabel(iou.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {iou.transactionId ? (
                            <Badge variant="outline" className="text-xs">
                              <LinkIcon className="h-3 w-3 mr-1" />
                              Linked
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Card: IOU Detail */}
          {selectedIOU && (
            <Card className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <h2 className="text-2xl font-bold truncate">{selectedIOU.personName}</h2>
                    {getIOUDirectionBadge(selectedIOU.direction)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditIOU}
                    className="flex-shrink-0"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold mt-1">RM {selectedIOU.amount.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm mt-1">{selectedIOU.description || "-"}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm mt-1">{new Date(selectedIOU.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="mt-1">
                      <Badge variant={selectedIOU.status === "SETTLED" ? "secondary" : "default"}>
                        {getIOUStatusLabel(selectedIOU.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Linked Transaction</p>
                  {selectedIOU.transactionId ? (
                    <div className="flex items-center gap-2 p-2 border rounded-lg">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Linked to: Transaction #{selectedIOU.transactionId}</span>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" disabled className="w-full">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Link to transaction (TODO)
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    TODO: Connect to real Transactions page
                  </p>
                </div>

                {selectedIOU.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedIOU.notes}</p>
                  </div>
                )}

                <Button
                  variant="default"
                  className="w-full"
                  disabled={selectedIOU.status === "SETTLED"}
                >
                  Mark as settled (TODO)
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Loan Dialog */}
      <Dialog open={isEditLoanDialogOpen} onOpenChange={setIsEditLoanDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Loan</DialogTitle>
            <DialogDescription>
              Update loan information. Changes are saved locally only.
            </DialogDescription>
          </DialogHeader>

          {editingLoan && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanName">Loan Name</Label>
                  <Input
                    id="loanName"
                    value={editingLoan.name}
                    onChange={(e) =>
                      setEditingLoan({ ...editingLoan, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={editingLoan.bankName}
                    onChange={(e) =>
                      setEditingLoan({ ...editingLoan, bankName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanType">Loan Type</Label>
                  <Select
                    value={editingLoan.type}
                    onValueChange={(value: LoanType) =>
                      setEditingLoan({ ...editingLoan, type: value })
                    }
                  >
                    <SelectTrigger id="loanType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOME">Home</SelectItem>
                      <SelectItem value="CAR">Car</SelectItem>
                      <SelectItem value="PERSONAL">Personal</SelectItem>
                      <SelectItem value="EDUCATION">Education</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editingLoan.status}
                    onValueChange={(value) =>
                      setEditingLoan({ ...editingLoan, status: value as any })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="IN_ARREARS">In Arrears</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Total Amount (RM)</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    value={editingLoan.totalAmount}
                    onChange={(e) =>
                      setEditingLoan({
                        ...editingLoan,
                        totalAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyInstalment">Monthly Instalment (RM)</Label>
                  <Input
                    id="monthlyInstalment"
                    type="number"
                    value={editingLoan.monthlyInstalment}
                    onChange={(e) =>
                      setEditingLoan({
                        ...editingLoan,
                        monthlyInstalment: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tenureMonths">Tenure (months)</Label>
                  <Input
                    id="tenureMonths"
                    type="number"
                    value={editingLoan.tenureMonths}
                    onChange={(e) =>
                      setEditingLoan({
                        ...editingLoan,
                        tenureMonths: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={editingLoan.startedOn}
                    onChange={(e) =>
                      setEditingLoan({ ...editingLoan, startedOn: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditLoanDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLoan}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit IOU Dialog */}
      <Dialog open={isEditIOUDialogOpen} onOpenChange={setIsEditIOUDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit IOU</DialogTitle>
            <DialogDescription>
              Update IOU information. Changes are saved locally only.
            </DialogDescription>
          </DialogHeader>

          {editingIOU && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="personName">Person Name</Label>
                  <Input
                    id="personName"
                    value={editingIOU.personName}
                    onChange={(e) =>
                      setEditingIOU({ ...editingIOU, personName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direction">Direction</Label>
                  <Select
                    value={editingIOU.direction}
                    onValueChange={(value: IOUDirection) =>
                      setEditingIOU({ ...editingIOU, direction: value })
                    }
                  >
                    <SelectTrigger id="direction">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I_OWE">I Owe</SelectItem>
                      <SelectItem value="OWES_ME">Owes Me</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editingIOU.description || ""}
                  onChange={(e) =>
                    setEditingIOU({ ...editingIOU, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (RM)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={editingIOU.amount}
                    onChange={(e) =>
                      setEditingIOU({
                        ...editingIOU,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={editingIOU.date}
                    onChange={(e) =>
                      setEditingIOU({ ...editingIOU, date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="iouStatus">Status</Label>
                <Select
                  value={editingIOU.status}
                  onValueChange={(value: IOUStatus) =>
                    setEditingIOU({ ...editingIOU, status: value })
                  }
                >
                  <SelectTrigger id="iouStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SETTLED">Settled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editingIOU.notes || ""}
                  onChange={(e) =>
                    setEditingIOU({ ...editingIOU, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditIOUDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveIOU}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AppShell>
  );
}
