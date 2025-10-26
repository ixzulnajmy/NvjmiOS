"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORIES_ARRAY } from '@/lib/constants/expense-categories';
import { createExpense } from '@/lib/services/expense-service';
import { ExpenseCategory } from '@/types/database.types';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface QuickAddExpenseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function QuickAddExpense({ open, onOpenChange, onSuccess }: QuickAddExpenseProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNote, setShowNote] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category) {
      toast.error('Please enter amount and select category');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);

    try {
      await createExpense({
        amount: amountNum,
        category,
        note: note || undefined,
        date,
      });

      toast.success('Expense added successfully!');

      // Reset form
      setAmount('');
      setCategory(null);
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      setShowNote(false);

      // Close modal
      onOpenChange(false);

      // Call success callback
      onSuccess?.();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setAmount('');
      setCategory(null);
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      setShowNote(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (RM)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              inputMode="decimal"
              className="text-2xl font-semibold"
            />
          </div>

          {/* Category Pills */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
              {CATEGORIES_ARRAY.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.value;

                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all
                      ${isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:border-primary/50'
                      }
                    `}
                  >
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Note Field */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowNote(!showNote)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showNote ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide note
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Add note (optional)
                </>
              )}
            </button>

            {showNote && (
              <Textarea
                placeholder="Add a note about this expense..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            )}
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-lg font-semibold"
            disabled={isLoading || !amount || !category}
          >
            {isLoading ? 'Saving...' : 'Save Expense'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
