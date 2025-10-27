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
        'glass-light rounded-full w-11 h-11 flex items-center justify-center touch-target',
        'shadow-lg',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Go back"
    >
      <ChevronLeft className="h-6 w-6 text-white" />
    </motion.button>
  );
}
