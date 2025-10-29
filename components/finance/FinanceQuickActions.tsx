'use client';

import { QuickActionsGrid } from '@/components/ui/quick-actions-grid';
import { Wallet, BarChart3, Users, Settings, Plus } from 'lucide-react';

const quickActions = [
  { icon: Wallet, label: 'Accounts', href: '/finance/accounts' },
  { icon: BarChart3, label: 'Wealth', href: '/finance' },
  { icon: Users, label: 'Friends', href: '/finance/friends' },
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
