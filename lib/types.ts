// file: lib/types.ts
// Core type definitions for NvjmiOS 2.0

export type MoneyTransactionType = "income" | "expense" | "transfer";
export type MoneyCategory =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Bills"
  | "Entertainment"
  | "Health"
  | "Salary"
  | "Investment"
  | "Gift"
  | "Other";

export interface MoneyTransaction {
  id: string;
  date: string; // ISO date string
  description: string;
  category: MoneyCategory;
  amount: number; // negative for expenses, positive for income
  account: string;
  tags: string[];
  notes?: string;
  linkedEvents?: string[]; // IDs of linked LifeEvents
  linkedDocuments?: string[]; // IDs of linked documents
}

export type LifeEventType =
  | "Work"
  | "Health"
  | "Money"
  | "Relationship"
  | "Travel"
  | "Achievement"
  | "Other";

export type LifeEventImportance = 1 | 2 | 3 | 4 | 5;

export interface LifeEvent {
  id: string;
  title: string;
  date: string; // ISO date string
  type: LifeEventType;
  importance: LifeEventImportance;
  description: string;
  notes?: string;
  reflection?: string;
  linkedTransactions?: string[]; // IDs of transactions
  linkedTasks?: string[]; // IDs of tasks
  linkedDocuments?: string[]; // IDs of documents
  tags: string[];
}

export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // ISO date string
  project?: string;
  tags: string[];
  linkedEvents?: string[]; // IDs of linked LifeEvents
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  type: "salary_slip" | "bank_statement" | "agreement" | "receipt" | "other";
  date: string; // ISO date string
  fileUrl?: string;
  tags: string[];
  linkedTransactions?: string[];
  linkedEvents?: string[];
}

export interface Module {
  id: string;
  name: string;
  icon?: string;
  path: string;
  subModules?: Module[];
}

// Money - Extended types
export type WishlistStatus = "wishlist" | "researching" | "saved_for" | "purchased" | "archived";

export interface WishlistItem {
  id: string;
  name: string;
  description?: string;
  estimatedCost: number;
  priority: 1 | 2 | 3 | 4 | 5; // 1 = low, 5 = urgent
  status: WishlistStatus;
  category: string;
  url?: string;
  notes?: string;
  savedAmount?: number;
  targetDate?: string;
  createdAt: string;
  tags: string[];
}

export type BNPLStatus = "active" | "completed" | "defaulted";

export interface BNPLItem {
  id: string;
  merchant: string;
  item: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  installments: number;
  installmentsPaid: number;
  monthlyPayment: number;
  nextPaymentDate: string;
  status: BNPLStatus;
  provider: string; // e.g., "Atome", "PayLater", etc.
  startDate: string;
  tags: string[];
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: string; // e.g., "Emergency Fund", "Vacation", "Home", etc.
  targetDate?: string;
  monthlyContribution?: number;
  notes?: string;
  createdAt: string;
  tags: string[];
}

export type DebtType = "credit_card" | "personal_loan" | "car_loan" | "home_loan" | "other";
export type DebtStatus = "active" | "paid_off" | "defaulted";

export interface Debt {
  id: string;
  name: string;
  type: DebtType;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  interestRate: number; // percentage
  monthlyPayment: number;
  nextPaymentDate: string;
  status: DebtStatus;
  creditor: string;
  startDate: string;
  notes?: string;
  tags: string[];
}

// Life - Extended types
export interface HealthMetric {
  id: string;
  date: string;
  weight?: number; // kg
  sleepHours?: number;
  steps?: number;
  waterIntake?: number; // liters
  mood?: "great" | "good" | "okay" | "bad" | "terrible";
  energy?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  tags: string[];
}

export interface FoodLogEntry {
  id: string;
  date: string;
  time: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  description: string;
  location?: string;
  calories?: number;
  protein?: number; // grams
  carbs?: number; // grams
  fats?: number; // grams
  waterIntake?: number; // liters
  mood?: string;
  notes?: string;
  tags: string[];
}

export type HabitFrequency = "daily" | "weekly" | "monthly";
export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  targetCount: number; // per frequency period
  color?: string;
  icon?: string;
  currentStreak: number;
  longestStreak: number;
  completedDates: string[]; // ISO date strings
  createdAt: string;
  tags: string[];
}

export interface TimeEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  category: "work" | "personal" | "projects" | "health" | "learning" | "social" | "other";
  description: string;
  project?: string;
  billable?: boolean;
  notes?: string;
  tags: string[];
}

// Work - Extended types
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "planning" | "active" | "on_hold" | "completed" | "archived";
  progress: number; // 0-100
  startDate?: string;
  endDate?: string;
  nextMilestone?: string;
  team?: string[];
  tags: string[];
  linkedTasks?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeNote {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  linkedNotes?: string[];
  linkedTasks?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  location?: string;
  project?: string;
  agenda?: string;
  notes?: string;
  decisions?: string[];
  actionItems?: { id: string; task: string; assignee: string; done: boolean }[];
  status: "planned" | "completed" | "cancelled";
  linkedTasks?: string[];
  tags: string[];
}

// Money - Account management
export interface Account {
  id: string;
  name: string;
  type: "bank" | "card" | "ewallet" | "bnpl";
  balance: number;
  limit?: number;
  billingDay?: number;
  notes?: string;
  tags: string[];
}

// Money - Expense tracking (separate from transactions for analysis)
export interface Expense {
  id: string;
  date: string;
  description: string;
  category: MoneyCategory;
  amount: number;
  account: string;
  tags: string[];
  notes?: string;
  percentOfMonthly?: number; // computed field
  linkedTransactions?: string[];
}

// Money - Purchase tracking
export type PurchaseStatus = "wishlist" | "ordered" | "delivered" | "completed";

export interface Purchase {
  id: string;
  item: string;
  category: string;
  store: string;
  cost: number;
  status: PurchaseStatus;
  purchasedOn?: string;
  warrantyUntil?: string;
  notes?: string;
  linkedDocuments?: string[]; // receipts
  tags: string[];
}

// Documents - Extended types
export type StatementStatus = "uploaded" | "parsed" | "error";

export interface BankStatement {
  id: string;
  title: string;
  account: string;
  period: string; // e.g., "Nov 2025"
  startDate: string;
  endDate: string;
  fileType: string; // e.g., "PDF", "CSV"
  fileSize?: string; // e.g., "2.4 MB"
  uploadedOn: string;
  status: StatementStatus;
  transactionCount?: number;
  linkedTransactions?: string[];
  tags: string[];
}

export type AgreementType = "rental" | "service" | "loan" | "employment" | "other";
export type AgreementStatus = "active" | "expired" | "terminated";

export interface Agreement {
  id: string;
  title: string;
  type: AgreementType;
  counterparty: string;
  startDate: string;
  endDate?: string;
  status: AgreementStatus;
  renewalDate?: string;
  monthlyPayment?: number;
  importantClauses?: string[];
  notes?: string;
  linkedDocuments?: string[];
  tags: string[];
}

export interface Receipt {
  id: string;
  title: string;
  category: string;
  store: string;
  amount: number;
  purchasedOn: string;
  warrantyUntil?: string;
  linkedPurchase?: string;
  linkedExpense?: string;
  fileUrl?: string;
  notes?: string;
  tags: string[];
}

// Inbox - Quick Capture System
export type CaptureType = "task" | "money" | "time" | "life" | "document" | "note";
export type CaptureStatus = "inbox" | "converted" | "archived";

export interface CaptureAttachment {
  id: string;
  name: string;
  type: string; // MIME type
  size: number; // bytes
  url: string; // dummy URL for now
  uploadedAt: string;
}

export interface InboxItem {
  id: string;
  title: string;
  content: string;
  type: CaptureType;
  status: CaptureStatus;
  capturedAt: string;
  attachments?: CaptureAttachment[];
  tags: string[];
  suggestedTarget?: string; // e.g., "Task", "Money Transaction", "Time Entry"
  linkedEntity?: {
    type: string; // e.g., "task", "transaction", "timeEntry"
    id: string;
    title: string;
  };
  convertedTo?: {
    type: string;
    id: string;
    convertedAt: string;
  };
}
