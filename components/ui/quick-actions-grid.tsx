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
        <h2 className="text-lg font-semibold tracking-tight text-white">
          {title}
        </h2>
        {showSeeAll && (
          <Link
            href={seeAllHref}
            className="text-xs font-medium text-text-secondary transition-colors hover:text-white"
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
        className="group relative flex min-w-[90px] flex-col items-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, type: 'spring', stiffness: 260, damping: 22 }}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.96 }}
      >
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 group-hover:border-white/30 group-hover:bg-white/10" />
          <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-sky-500/30 via-transparent to-purple-500/30 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-80" />
          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-white/80 via-white/30 to-white/10 shadow-[0_10px_24px_rgba(15,23,42,0.45)]">
            <Icon
              className="h-6 w-6 text-slate-900"
              style={{ color: action.color || undefined }}
            />
          </div>
        </div>
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-text-secondary transition-colors group-hover:text-white">
          {action.label}
        </span>
      </motion.div>
    </Link>
  );
}
