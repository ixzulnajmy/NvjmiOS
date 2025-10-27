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
      light: 'glass-light bg-card-bg/60',
      strong: 'glass-strong bg-card-bg/80',
      elevated: 'glass-strong bg-card-elevated/80',
    };

    const motionProps = hover
      ? {
          whileHover: { y: -2, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)' },
          transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
        }
      : {};

    if (hover) {
      return (
        <motion.div
          ref={ref}
          className={cn(
            'rounded-2xl p-4 shadow-lg transition-all',
            variantClasses[variant],
            className
          )}
          {...motionProps}
          {...(props as any)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-4 shadow-lg transition-all',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
