'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { friendDebtSchema, type FriendDebtFormData } from '@/schemas/friend-debt.schema';

interface AddFriendDebtModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddFriendDebtModal({ open, onOpenChange, onSuccess }: AddFriendDebtModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<FriendDebtFormData>>({
    friend_name: '',
    amount: 0,
    debt_type: 'they_owe_me',
    description: '',
    due_date: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Validate form data
      const validatedData = friendDebtSchema.parse(formData);

      // Insert into database
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase.from('friend_debts').insert({
        user_id: user.id,
        friend_name: validatedData.friend_name,
        amount: validatedData.amount,
        debt_type: validatedData.debt_type,
        description: validatedData.description || null,
        due_date: validatedData.due_date || null,
        status: 'pending',
      });

      if (error) throw error;

      // Reset form and close modal
      setFormData({
        friend_name: '',
        amount: 0,
        debt_type: 'they_owe_me',
        description: '',
        due_date: '',
      });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        console.error('Error adding friend debt:', error);
        alert('Failed to add friend debt');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Friend Debt</DialogTitle>
            <DialogDescription>
              Track money owed between you and your friends
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Friend Name */}
            <div className="space-y-2">
              <Label htmlFor="friend_name">Friend Name</Label>
              <Input
                id="friend_name"
                value={formData.friend_name}
                onChange={(e) => setFormData({ ...formData, friend_name: e.target.value })}
                placeholder="Enter friend's name"
              />
              {errors.friend_name && (
                <p className="text-sm text-red-600">{errors.friend_name}</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (RM)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* Debt Type */}
            <div className="space-y-2">
              <Label htmlFor="debt_type">Type</Label>
              <Select
                value={formData.debt_type}
                onValueChange={(value) => setFormData({ ...formData, debt_type: value as 'they_owe_me' | 'i_owe_them' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="they_owe_me">They Owe Me</SelectItem>
                  <SelectItem value="i_owe_them">I Owe Them</SelectItem>
                </SelectContent>
              </Select>
              {errors.debt_type && (
                <p className="text-sm text-red-600">{errors.debt_type}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date (Optional)</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
              {errors.due_date && (
                <p className="text-sm text-red-600">{errors.due_date}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this debt for?"
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Debt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
