'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CircleBackButtonProps {
  className?: string;
  onClick?: () => void;
}

export function CircleBackButton({ className, onClick }: CircleBackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        'group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full touch-target transition-all duration-300',
        className
      )}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      aria-label="Go back"
    >
      <span className="absolute inset-0 rounded-full border border-white/15 bg-white/5 backdrop-blur-xl transition-colors duration-500 group-hover:border-white/40 group-hover:bg-white/10" />
      <span className="absolute -inset-6 rounded-full bg-gradient-to-br from-sky-500/25 via-transparent to-purple-500/25 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
      <ChevronLeft className="relative z-10 h-6 w-6 text-white drop-shadow-[0_6px_12px_rgba(56,189,248,0.45)]" />
    </motion.button>
  );
}
