'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Pencil, Trash2, Calendar, Wallet, CreditCard, Tag, FileText } from 'lucide-react';

const categoryEmojis: Record<string, string> = {
  food: '🍔',
  transport: '🚗',
  girlfriend: '💝',
  shopping: '🛍️',
  bills: '📄',
  other: '📦',
};

const categoryLabels: Record<string, string> = {
  food: 'Food & Dining',
  transport: 'Transportation',
  girlfriend: 'Girlfriend',
  shopping: 'Shopping',
  bills: 'Bills & Utilities',
  other: 'Other',
};

const paymentMethodLabels: Record<string, string> = {
  qr_code: 'QR Code',
  apple_pay_tap: 'Apple Pay Tap',
  physical_card_tap: 'Card Tap',
  apple_pay_online: 'Apple Pay Online',
  bank_transfer: 'Bank Transfer',
  fpx: 'FPX',
  cash: 'Cash',
};

interface TransactionDetailModalProps {
  expense: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function TransactionDetailModal({
  expense,
  open,
  onOpenChange,
  onDeleted,
}: TransactionDetailModalProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    setDeleting(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expense.id);

    if (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete transaction');
      setDeleting(false);
    } else {
      onOpenChange(false);
      if (onDeleted) onDeleted();
    }
  }

  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-3xl">{categoryEmojis[expense.category] || '📦'}</span>
            <span>{expense.merchant_name || expense.description || 'Transaction'}</span>
          </DialogTitle>
          <DialogDescription>
            Transaction details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Amount */}
          <div className="text-center pb-4 border-b">
            <p className="text-sm text-muted-foreground mb-1">Amount</p>
            <p className="text-4xl font-bold">{formatCurrency(expense.amount)}</p>
          </div>

          {/* Details Grid */}
          <div className="space-y-3">
            {/* Date */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(new Date(expense.date))}
                </p>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-start gap-3">
              <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Category</p>
                <p className="text-sm text-muted-foreground">
                  {categoryLabels[expense.category] || expense.category}
                </p>
              </div>
            </div>

            {/* Merchant */}
            {expense.merchant_name && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Merchant</p>
                  <p className="text-sm text-muted-foreground">{expense.merchant_name}</p>
                </div>
              </div>
            )}

            {/* Account */}
            {expense.accounts && (
              <div className="flex items-start gap-3">
                <Wallet className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Account</p>
                  <p className="text-sm text-muted-foreground">
                    {expense.accounts.icon && <span>{expense.accounts.icon} </span>}
                    {expense.accounts.name} ({expense.accounts.provider})
                  </p>
                </div>
              </div>
            )}

            {/* Payment Method */}
            {expense.payment_methods && (
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-sm text-muted-foreground">
                    {paymentMethodLabels[expense.payment_methods.method_type]}
                  </p>
                </div>
              </div>
            )}

            {/* Description/Note */}
            {expense.description && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Note</p>
                  <p className="text-sm text-muted-foreground">{expense.description}</p>
                </div>
              </div>
            )}

            {/* Reconciliation Status */}
            {expense.is_reconciled && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-900 font-medium">
                  ✓ Linked to credit card statement
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/finance/transactions/${expense.id}/edit`)}
            className="flex-1"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
