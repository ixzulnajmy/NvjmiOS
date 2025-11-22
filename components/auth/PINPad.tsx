'use client';

import { motion } from 'framer-motion';
import { Delete, Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PINPadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onBiometric?: () => void;
  showBiometric?: boolean;
  disabled?: boolean;
}

const spring = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 30,
};

export function PINPad({
  onDigit,
  onDelete,
  onBiometric,
  showBiometric = false,
  disabled = false,
}: PINPadProps) {
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleDigit = (digit: string) => {
    if (disabled) return;
    triggerHaptic();
    onDigit(digit);
  };

  const handleDelete = () => {
    if (disabled) return;
    triggerHaptic();
    onDelete();
  };

  const handleBiometric = () => {
    if (disabled || !onBiometric) return;
    triggerHaptic();
    onBiometric();
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full max-w-[280px] mx-auto">
      {/* Number pad 1-9 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {digits.map((digit) => (
          <motion.button
            key={digit}
            type="button"
            onClick={() => handleDigit(digit)}
            disabled={disabled}
            className={cn(
              'aspect-square rounded-full text-2xl font-semibold',
              'bg-white/10 text-white',
              'border border-white/10',
              'flex items-center justify-center',
              'touch-target',
              disabled && 'opacity-50'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, backgroundColor: 'rgba(255,255,255,0.2)' }}
            transition={spring}
          >
            {digit}
          </motion.button>
        ))}
      </div>

      {/* Bottom row: Biometric / 0 / Delete */}
      <div className="grid grid-cols-3 gap-4">
        {/* Biometric button or empty */}
        <motion.button
          type="button"
          onClick={handleBiometric}
          disabled={disabled || !showBiometric}
          className={cn(
            'aspect-square rounded-full text-2xl',
            'flex items-center justify-center',
            'touch-target',
            showBiometric
              ? 'bg-white/10 text-white border border-white/10'
              : 'bg-transparent'
          )}
          whileHover={showBiometric ? { scale: 1.05 } : {}}
          whileTap={
            showBiometric
              ? { scale: 0.95, backgroundColor: 'rgba(255,255,255,0.2)' }
              : {}
          }
          transition={spring}
        >
          {showBiometric && <Fingerprint className="h-7 w-7" />}
        </motion.button>

        {/* Zero button */}
        <motion.button
          type="button"
          onClick={() => handleDigit('0')}
          disabled={disabled}
          className={cn(
            'aspect-square rounded-full text-2xl font-semibold',
            'bg-white/10 text-white',
            'border border-white/10',
            'flex items-center justify-center',
            'touch-target',
            disabled && 'opacity-50'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, backgroundColor: 'rgba(255,255,255,0.2)' }}
          transition={spring}
        >
          0
        </motion.button>

        {/* Delete button */}
        <motion.button
          type="button"
          onClick={handleDelete}
          disabled={disabled}
          className={cn(
            'aspect-square rounded-full text-2xl',
            'bg-white/10 text-white',
            'border border-white/10',
            'flex items-center justify-center',
            'touch-target',
            disabled && 'opacity-50'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, backgroundColor: 'rgba(255,255,255,0.2)' }}
          transition={spring}
        >
          <Delete className="h-6 w-6" />
        </motion.button>
      </div>
    </div>
  );
}
