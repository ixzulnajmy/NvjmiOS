'use client';

import * as React from 'react';
import { motion, type MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof MotionProps> {
  variant?: 'light' | 'strong' | 'elevated';
  hover?: boolean;
  children: React.ReactNode;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'light', hover = true, children, ...props }, ref) => {
    const variantClasses = {
      light: 'glass-light bg-white/5',
      strong: 'glass-strong bg-white/8',
      elevated: 'glass-strong bg-white/12',
    } as const;

    const content = (
      <div className="relative z-10 space-y-3 text-slate-100">
        {children}
      </div>
    );

    const baseClass = cn(
      'group relative overflow-hidden rounded-[26px] border border-white/10 px-5 py-5 text-white shadow-[0_22px_60px_rgba(2,6,23,0.45)] transition-all duration-300',
      variantClasses[variant],
      className
    );

    const overlayElements = (
      <>
        <div className="pointer-events-none absolute inset-px rounded-[24px] border border-white/5" />
        <div className="pointer-events-none absolute inset-0 rounded-[26px] bg-gradient-to-br from-white/12 via-transparent to-white/5 opacity-70" />
        <div className="pointer-events-none absolute -inset-40 rotate-6 bg-gradient-to-br from-sky-500/15 via-emerald-400/10 to-transparent blur-3xl transition-opacity duration-700 group-hover:opacity-80" />
        <div className="pointer-events-none absolute inset-0 rounded-[26px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-70" />
      </>
    );

    if (hover) {
      return (
        <motion.div
          ref={ref}
          className={baseClass}
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.995 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          {...(props as any)}
        >
          {overlayElements}
          {content}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={baseClass} {...props}>
        {overlayElements}
        {content}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
