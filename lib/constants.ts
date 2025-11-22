/**
 * Application Constants for NvjmiOS
 * Single-user app for Izzul - no multi-user auth needed
 */

// Hardcoded user ID for all database queries
export const HARDCODED_USER_ID = 'izzul';

// Default budget settings
export const DEFAULT_MONTHLY_BUDGET = 3000;
export const DEFAULT_DAILY_BUDGET = 60;

// Category configuration
export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food', emoji: '🍜' },
  { value: 'transport', label: 'Transport', emoji: '🛵' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'bills', label: 'Bills', emoji: '🧾' },
  { value: 'income', label: 'Income', emoji: '💼' },
  { value: 'other', label: 'Other', emoji: '🪄' },
] as const;

export const CATEGORY_EMOJIS: Record<string, string> = {
  food: '🍜',
  transport: '🛵',
  girlfriend: '💝',
  shopping: '🛍️',
  bills: '🧾',
  other: '🪄',
  salary: '💼',
  investments: '📈',
  gifts: '🎁',
  subscriptions: '🔁',
  health: '💊',
  entertainment: '🎬',
  groceries: '🛒',
  travel: '✈️',
  income: '💰',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  qr_code: 'QR Code',
  apple_pay_tap: 'Apple Pay NFC',
  physical_card_tap: 'Physical Card',
  apple_pay_online: 'Apple Pay Web',
  bank_transfer: 'Bank Transfer',
  fpx: 'FPX',
  cash: 'Cash',
};

export const PAYMENT_CHANNEL_LABELS: Record<string, string> = {
  mae_qr: 'MAE QR',
  apple_pay_nfc: 'Apple Pay NFC',
  uob_one_credit: 'UOB One Credit Card',
  apple_pay_web: 'Apple Pay Web',
  fpx_maybank2u: 'FPX Maybank2u',
  bank_transfer: 'Bank Transfer',
  cash: 'Cash',
  other: 'Other',
};
