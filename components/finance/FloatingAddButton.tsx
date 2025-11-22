'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { AddTransactionSheet } from './AddTransactionSheet';

const spring = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 30,
};

export function FloatingAddButton() {
  const [isOpen, setIsOpen] = useState(false);

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handlePress = () => {
    triggerHaptic();
    setIsOpen(true);
  };

  return (
    <>
      <motion.button
        onClick={handlePress}
        className="fixed bottom-28 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30"
        style={{
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={spring}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </motion.button>

      <AddTransactionSheet open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
