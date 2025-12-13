// file: types/finance.ts
// Extended finance types for Loans and IOUs

export type LoanType = "HOME" | "CAR" | "PERSONAL" | "EDUCATION" | "OTHER";

export interface Loan {
  id: string;
  name: string;
  bankName: string;
  type: LoanType;
  totalAmount: number;
  remainingBalance: number;
  monthlyInstalment: number;
  tenureMonths: number;
  startedOn: string;
  status: "ACTIVE" | "COMPLETED" | "IN_ARREARS";
  nextPaymentDate: string;
  tags?: string[];
  progressPercent?: number;
  hasArrears?: boolean;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  transactionId?: string;
  date: string;
  paidAmount: number;
  principalPortion: number;
  interestPortion: number;
  lateCharges?: number;
  otherCharges?: number;
  isExtraPayment: boolean;
  isArrearsPayment: boolean;
  runningBalanceAfter?: number;
  notes?: string;
}

export type IOUDirection = "I_OWE" | "OWES_ME";
export type IOUStatus = "PENDING" | "SETTLED";

export interface IOU {
  id: string;
  personName: string;
  direction: IOUDirection;
  amount: number;
  description?: string;
  date: string;
  transactionId?: string;
  status: IOUStatus;
  notes?: string;
}
