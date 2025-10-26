// Database Types - matches Supabase schema

export type DebtCategory = 'credit_card' | 'installment' | 'paylater' | 'loan' | 'insurance' | 'other';
export type ExpenseCategory = 'food' | 'transport' | 'shopping' | 'bills' | 'personal' | 'entertainment' | 'health' | 'others';
export type TimeCategory = 'deep_work' | 'meetings' | 'learning' | 'ibadah' | 'girlfriend' | 'family' | 'exercise' | 'eating' | 'commute' | 'social_media' | 'entertainment' | 'sleep' | 'other';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskListType = 'today' | 'someday' | 'work' | 'personal' | 'groceries' | 'goals';
export type PrayerName = 'subuh' | 'zohor' | 'asar' | 'maghrib' | 'isyak';
export type PrayerStatus = 'on_time' | 'late' | 'missed';
export type PrayerLocation = 'home' | 'office' | 'masjid_muadz' | 'other';

export interface UserSettings {
  id: string;
  user_id: string;
  prayer_times: Record<string, any>;
  notification_preferences: Record<string, any>;
  budget_settings: Record<string, any>;
  theme_preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  current_balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_day: number;
  category: DebtCategory;
  created_at: string;
  updated_at: string;
}

export interface DebtPayment {
  id: string;
  debt_id: string;
  amount: number;
  payment_date: string;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: ExpenseCategory;
  note?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  category: TimeCategory;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  notes?: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: TaskPriority;
  completed: boolean;
  completed_at?: string;
  list_type: TaskListType;
  recurring_rule?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Prayer {
  id: string;
  user_id: string;
  prayer_name: PrayerName;
  prayer_date: string;
  completed: boolean;
  completed_at?: string;
  status: PrayerStatus;
  jemaah: boolean;
  location: PrayerLocation;
  created_at: string;
}

export interface QuranLog {
  id: string;
  user_id: string;
  date: string;
  pages_read: number;
  surah_name?: string;
  notes?: string;
  created_at: string;
}

export interface Sedekah {
  id: string;
  user_id: string;
  amount: number;
  description?: string;
  date: string;
  created_at: string;
}

// Database tables type
export interface Database {
  public: {
    Tables: {
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>>;
      };
      debts: {
        Row: Debt;
        Insert: Omit<Debt, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Debt, 'id' | 'created_at' | 'updated_at'>>;
      };
      debt_payments: {
        Row: DebtPayment;
        Insert: Omit<DebtPayment, 'id' | 'created_at'>;
        Update: Partial<Omit<DebtPayment, 'id' | 'created_at'>>;
      };
      expenses: {
        Row: Expense;
        Insert: Omit<Expense, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Expense, 'id' | 'created_at' | 'updated_at'>>;
      };
      time_entries: {
        Row: TimeEntry;
        Insert: Omit<TimeEntry, 'id' | 'created_at'>;
        Update: Partial<Omit<TimeEntry, 'id' | 'created_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
      };
      prayers: {
        Row: Prayer;
        Insert: Omit<Prayer, 'id' | 'created_at'>;
        Update: Partial<Omit<Prayer, 'id' | 'created_at'>>;
      };
      quran_logs: {
        Row: QuranLog;
        Insert: Omit<QuranLog, 'id' | 'created_at'>;
        Update: Partial<Omit<QuranLog, 'id' | 'created_at'>>;
      };
      sedekah: {
        Row: Sedekah;
        Insert: Omit<Sedekah, 'id' | 'created_at'>;
        Update: Partial<Omit<Sedekah, 'id' | 'created_at'>>;
      };
    };
  };
}
