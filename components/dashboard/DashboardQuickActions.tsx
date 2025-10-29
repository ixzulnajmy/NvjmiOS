'use client';

import { QuickActionsGrid } from '@/components/ui/quick-actions-grid';
import { Clock, DollarSign, CheckSquare, BarChart3, Plus } from 'lucide-react';

const quickActions = [
  { icon: Clock, label: 'Time', href: '/dashboard/time', color: '#38bdf8' },
  { icon: DollarSign, label: 'Finance', href: '/finance', color: '#34d399' },
  { icon: CheckSquare, label: 'Tasks', href: '/dashboard/tasks', color: '#f472b6' },
  { icon: BarChart3, label: 'Stats', href: '/finance', color: '#a855f7' },
  { icon: Plus, label: 'Add', href: '/finance/expenses?action=add', color: '#facc15' },
];

export function DashboardQuickActions() {
  return (
    <QuickActionsGrid
      title="Quick Actions"
      actions={quickActions}
      showSeeAll={false}
    />
  );
}
