'use client';

import { QuickActionsGrid } from '@/components/ui/quick-actions-grid';
import { Wallet, ListOrdered, Settings, Plus, PieChart, BadgePercent, HelpingHand } from 'lucide-react';

const quickActions = [
  { icon: Wallet, label: 'Accounts', href: '/finance/accounts' },
  { icon: PieChart, label: 'Categories', href: '/finance/categories' },
  { icon: ListOrdered, label: 'Transactions', href: '/finance/transactions' },
  { icon: BadgePercent, label: 'BNPL', href: '/finance/bnpl' },
  { icon: HelpingHand, label: 'IOU', href: '/finance/debts' },
  { icon: Settings, label: 'Settings', href: '/finance/settings' },
  { icon: Plus, label: 'Add', href: '/finance/expenses?action=add' },
];

export function FinanceQuickActions() {
  return (
    <QuickActionsGrid
      title="Quick Actions"
      actions={quickActions}
      showSeeAll={false}
    />
  );
}
