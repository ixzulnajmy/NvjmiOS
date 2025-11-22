'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PINDotsProps {
  length: number;
  maxLength: number;
  error?: boolean;
}

const spring = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 30,
};

export function PINDots({ length, maxLength, error = false }: PINDotsProps) {
  return (
    <div className="flex gap-4 justify-center">
      {Array.from({ length: maxLength }).map((_, i) => {
        const isFilled = i < length;

        return (
          <motion.div
            key={i}
            className={cn(
              'w-4 h-4 rounded-full border-2 transition-colors',
              error
                ? 'border-red-500 bg-red-500'
                : isFilled
                ? 'border-white bg-white'
                : 'border-white/40 bg-transparent'
            )}
            initial={false}
            animate={{
              scale: isFilled ? 1 : 0.8,
              x: error ? [0, -4, 4, -4, 4, 0] : 0,
            }}
            transition={error ? { duration: 0.4 } : spring}
          />
        );
      })}
    </div>
  );
}
