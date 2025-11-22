'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LineChart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Simplified navigation - 3 tabs only
const navItems = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Finance',
    href: '/finance',
    icon: LineChart,
  },
  {
    name: 'Ibadah',
    href: '/dashboard/ibadah',
    icon: Sparkles,
  },
];

const spring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export function FloatingNavbar() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 sm:px-6">
      <motion.div
        className="glass-navbar pointer-events-auto relative flex w-full max-w-sm items-center justify-between gap-1 rounded-[28px] border border-white/10 bg-white/10 px-3 py-2"
        initial={{ y: 96, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 210, damping: 26 }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="group relative flex flex-1 items-center justify-center"
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                className={cn(
                  'relative flex items-center justify-center gap-2 rounded-2xl px-3 py-2 transition-colors',
                  isActive ? 'text-slate-900' : 'text-slate-300/80'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/85 via-white/40 to-white/10 shadow-[0_8px_30px_rgba(15,23,42,0.35)]"
                    transition={spring}
                  />
                )}
                <Icon
                  className={cn(
                    'relative z-10 h-[22px] w-[22px] transition-colors drop-shadow-[0_6px_12px_rgba(56,189,248,0.25)]',
                    isActive ? 'text-slate-900' : 'text-white/80'
                  )}
                />
                <motion.span
                  className={cn(
                    'relative z-10 text-[11px] font-semibold uppercase tracking-[0.12em]',
                    isActive ? 'text-slate-900' : 'text-transparent'
                  )}
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0, width: isActive ? 'auto' : 0 }}
                  transition={{ ...spring, stiffness: 260 }}
                >
                  {item.name}
                </motion.span>
              </motion.div>
            </Link>
          );
        })}
        <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/10 opacity-60" />
      </motion.div>
    </nav>
  );
}
