import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(amount)
}

export function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Assalamualaikum, good morning"
  if (hour < 15) return "Assalamualaikum, good afternoon"
  if (hour < 18) return "Assalamualaikum"
  return "Assalamualaikum, good evening"
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ms-MY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
