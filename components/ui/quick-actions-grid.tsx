'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface QuickAction {
  icon: LucideIcon;
  label: string;
  href: string;
  color?: string;
}

export interface QuickActionsGridProps {
  title?: string;
  actions: QuickAction[];
  showSeeAll?: boolean;
  seeAllHref?: string;
  className?: string;
}

export function QuickActionsGrid({
  title = "Quick Actions",
  actions,
  showSeeAll = true,
  seeAllHref = "#",
  className,
}: QuickActionsGridProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {showSeeAll && (
          <Link
            href={seeAllHref}
            className="text-xs text-text-secondary hover:text-white transition-colors"
          >
            See All
          </Link>
        )}
      </div>

      {/* Actions Grid - Horizontal Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {actions.map((action, index) => (
          <QuickActionButton
            key={action.label}
            action={action}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

function QuickActionButton({ action, index }: { action: QuickAction; index: number }) {
  const Icon = action.icon;

  return (
    <Link href={action.href}>
      <motion.div
        className="flex flex-col items-center gap-2 min-w-[64px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="glass-light rounded-full w-14 h-14 flex items-center justify-center shadow-lg touch-target"
          whileHover={{
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
          }}
        >
          <Icon
            className="h-6 w-6 text-white"
            style={{ color: action.color }}
          />
        </motion.div>
        <span className="text-xs text-text-secondary text-center leading-tight">
          {action.label}
        </span>
      </motion.div>
    </Link>
  );
}
