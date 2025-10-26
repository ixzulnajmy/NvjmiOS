import { ExpenseCategory } from '@/types/database.types';
import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Lightbulb,
  User,
  Gamepad2,
  Heart,
  Star,
  LucideIcon
} from 'lucide-react';

export interface CategoryConfig {
  value: ExpenseCategory;
  label: string;
  icon: LucideIcon;
  emoji: string;
  color: string;
}

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, CategoryConfig> = {
  food: {
    value: 'food',
    label: 'Food',
    icon: UtensilsCrossed,
    emoji: '🍔',
    color: 'text-orange-600',
  },
  transport: {
    value: 'transport',
    label: 'Transport',
    icon: Car,
    emoji: '🚗',
    color: 'text-blue-600',
  },
  shopping: {
    value: 'shopping',
    label: 'Shopping',
    icon: ShoppingBag,
    emoji: '🛍️',
    color: 'text-pink-600',
  },
  bills: {
    value: 'bills',
    label: 'Bills',
    icon: Lightbulb,
    emoji: '💡',
    color: 'text-yellow-600',
  },
  personal: {
    value: 'personal',
    label: 'Personal',
    icon: User,
    emoji: '💅',
    color: 'text-purple-600',
  },
  entertainment: {
    value: 'entertainment',
    label: 'Entertainment',
    icon: Gamepad2,
    emoji: '🎮',
    color: 'text-green-600',
  },
  health: {
    value: 'health',
    label: 'Health',
    icon: Heart,
    emoji: '🏥',
    color: 'text-red-600',
  },
  others: {
    value: 'others',
    label: 'Others',
    icon: Star,
    emoji: '⭐',
    color: 'text-gray-600',
  },
};

export const CATEGORIES_ARRAY = Object.values(EXPENSE_CATEGORIES);

// Default daily budget in MYR
export const DEFAULT_DAILY_BUDGET = 60.00;
