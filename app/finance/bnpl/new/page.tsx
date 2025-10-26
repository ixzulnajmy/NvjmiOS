'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { bnplSchema } from '@/schemas/account.schema';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBNPLPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    account_id: '',
    merchant: '',
    item_name: '',
    total_amount: '',
    installment_amount: '',
    installments_total: '',
    installments_paid: '0',
    next_due_date: '',
    status: 'active' as any,
    notes: '',
  });

  useEffect(() => {
    fetchBNPLAccounts();
  }, []);

  async function fetchBNPLAccounts() {
    const supabase = createClient();
    const { data } = await supabase
      .from('accounts')
      .select('*')
      .eq('account_type', 'bnpl')
      .eq('is_active', true)
      .order('name');

    if (data) {
      setAccounts(data);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      const validatedData = bnplSchema.parse({
        ...formData,
        account_id: formData.account_id || undefined,
        total_amount: parseFloat(formData.total_amount),
        installment_amount: parseFloat(formData.installment_amount),
        installments_total: parseInt(formData.installments_total),
        installments_paid: parseInt(formData.installments_paid),
      });

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to add a BNPL purchase');
      }

      const { error: insertError } = await supabase.from('bnpl').insert({
        user_id: user.id,
        ...validatedData,
      });

      if (insertError) throw insertError;

      router.push('/finance/bnpl');
      router.refresh();
    } catch (err: any) {
      console.error('Error creating BNPL:', err);
      setError(err.message || 'Failed to create BNPL purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/finance/bnpl">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add BNPL Purchase</h1>
          <p className="text-muted-foreground">Track a new installment purchase</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant / Store</Label>
              <Input
                id="merchant"
                placeholder="e.g., Shopee, Lazada, Apple Store"
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item_name">Item Name (Optional)</Label>
              <Input
                id="item_name"
                placeholder="e.g., iPhone 15 Pro, AirPods"
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_amount">Total Amount (RM)</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installment_amount">Per Installment (RM)</Label>
                <Input
                  id="installment_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.installment_amount}
                  onChange={(e) => setFormData({ ...formData, installment_amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="installments_total">Total Installments</Label>
                <Input
                  id="installments_total"
                  type="number"
                  placeholder="e.g., 3, 6, 12"
                  value={formData.installments_total}
                  onChange={(e) => setFormData({ ...formData, installments_total: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installments_paid">Already Paid</Label>
                <Input
                  id="installments_paid"
                  type="number"
                  placeholder="0"
                  value={formData.installments_paid}
                  onChange={(e) => setFormData({ ...formData, installments_paid: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_due_date">Next Due Date</Label>
              <Input
                id="next_due_date"
                type="date"
                value={formData.next_due_date}
                onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_id">BNPL Account (Optional)</Label>
              <Select
                value={formData.account_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, account_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select BNPL account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No account</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.icon && <span>{account.icon} </span>}
                      {account.name} ({account.provider})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Additional notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Adding...' : 'Add BNPL Purchase'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/finance/bnpl">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {accounts.length === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900">
              💡 Tip: Add BNPL accounts (ShopeePay Later, Atome, etc.) to link purchases to specific providers.
            </p>
            <Button variant="link" asChild className="p-0 h-auto text-blue-700">
              <Link href="/finance/accounts/new">
                Add BNPL account →
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
