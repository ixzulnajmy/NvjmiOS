"use client"

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { QuickAddExpense } from './QuickAddExpense';

interface ExpenseFABProps {
  onExpenseAdded?: () => void;
}

export function ExpenseFAB({ onExpenseAdded }: ExpenseFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="
          fixed bottom-6 right-6 z-40
          h-16 w-16
          rounded-full
          bg-primary
          text-primary-foreground
          shadow-lg
          hover:shadow-xl
          active:scale-95
          transition-all
          duration-200
          flex items-center justify-center
          group
        "
        aria-label="Add expense"
      >
        <Plus className="h-8 w-8 group-hover:scale-110 transition-transform" />
      </button>

      {/* Quick Add Modal */}
      <QuickAddExpense
        open={isOpen}
        onOpenChange={setIsOpen}
        onSuccess={onExpenseAdded}
      />
    </>
  );
}
