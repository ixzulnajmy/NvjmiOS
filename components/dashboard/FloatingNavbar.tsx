'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, DollarSign, Clock, CheckSquare, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Finance',
    href: '/dashboard/finance',
    icon: DollarSign,
  },
  {
    name: 'Time',
    href: '/dashboard/time',
    icon: Clock,
  },
  {
    name: 'Tasks',
    href: '/dashboard/tasks',
    icon: CheckSquare,
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
    <nav className="fixed bottom-3 left-4 right-4 z-50 flex items-center justify-center">
      <motion.div
        className="glass-navbar rounded-[24px] h-16 flex items-center justify-around w-full max-w-2xl mx-auto px-2 shadow-2xl"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex items-center justify-center flex-1 h-12 touch-target"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-full mx-1"
                  transition={spring}
                />
              )}
              <motion.div
                className={cn(
                  "relative flex items-center justify-center gap-1.5 px-3 py-2 rounded-full z-10 transition-colors",
                  isActive ? "text-black" : "text-gray-400"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-black" : "text-gray-400")} />
                {isActive && (
                  <motion.span
                    className="text-xs font-semibold text-black"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={spring}
                  >
                    {item.name}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </nav>
  );
}
