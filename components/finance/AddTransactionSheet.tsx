'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { HARDCODED_USER_ID, EXPENSE_CATEGORIES } from '@/lib/constants';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface AddTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const spring = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 30,
};

export function AddTransactionSheet({ open, onOpenChange }: AddTransactionSheetProps) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleCategorySelect = (value: string) => {
    triggerHaptic();
    setCategory(value);
  };

  const handleSubmit = async () => {
    if (!amount || !category) return;

    setIsSubmitting(true);
    triggerHaptic();

    try {
      const supabase = createClient();
      const isIncome = category === 'income';
      const transactionType = isIncome ? 'income' : 'expense';

      const { error } = await supabase.from('expenses').insert({
        user_id: HARDCODED_USER_ID,
        amount: parseFloat(amount),
        category: category,
        item_name: note || undefined,
        merchant_name: note || undefined,
        date: date,
        occurred_at: new Date().toISOString(),
        transaction_type: transactionType,
      });

      if (error) {
        console.error('Error adding transaction:', error);
        return;
      }

      // Reset form
      setAmount('');
      setCategory('');
      setNote('');
      setShowAdvanced(false);
      setDate(new Date().toISOString().split('T')[0]);

      // Close sheet and refresh
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleaned);
  };

  const isValid = amount && parseFloat(amount) > 0 && category;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-t border-white/10 bg-[#1C1C1E] p-0"
      >
        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-white/20" />

        <SheetHeader className="px-6 pt-4 pb-2">
          <SheetTitle className="text-xl font-bold text-white">
            Add Transaction
          </SheetTitle>
        </SheetHeader>

        <div className="px-6 pb-8 space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm text-white/60">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-white/60">
                RM
              </span>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="h-16 pl-16 text-3xl font-bold bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-2xl"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <label className="text-sm text-white/60">Category</label>
            <div className="grid grid-cols-3 gap-3">
              {EXPENSE_CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategorySelect(cat.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-colors ${
                    category === cat.value
                      ? 'bg-blue-500/20 border-blue-500 text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  transition={spring}
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-xs font-medium">{cat.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-2">
            <label className="text-sm text-white/60">Note (optional)</label>
            <Input
              type="text"
              placeholder="What was this for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
            />
          </div>

          {/* Advanced Options Toggle */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setShowAdvanced(!showAdvanced);
            }}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors"
          >
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Advanced options
          </button>

          {/* Advanced Options */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm text-white/60">Date</label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-12 bg-white/5 border-white/10 text-white rounded-xl"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="w-full h-14 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Add Transaction'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
