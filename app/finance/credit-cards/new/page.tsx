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
import { creditCardSchema } from '@/schemas/account.schema';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewCreditCardStatementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    account_id: '',
    statement_date: '',
    due_date: '',
    total_amount: '',
    minimum_payment: '',
    paid_amount: '0',
    status: 'pending' as any,
    notes: '',
  });

  useEffect(() => {
    fetchCreditCardAccounts();
  }, []);

  async function fetchCreditCardAccounts() {
    const supabase = createClient();
    const { data } = await supabase
      .from('accounts')
      .select('*')
      .eq('account_type', 'credit_card')
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
      const validatedData = creditCardSchema.parse({
        ...formData,
        account_id: formData.account_id,
        total_amount: parseFloat(formData.total_amount),
        minimum_payment: parseFloat(formData.minimum_payment),
        paid_amount: parseFloat(formData.paid_amount),
      });

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to add a credit card statement');
      }

      const { error: insertError } = await supabase.from('credit_cards').insert({
        user_id: user.id,
        ...validatedData,
      });

      if (insertError) throw insertError;

      router.push('/finance/credit-cards');
      router.refresh();
    } catch (err: any) {
      console.error('Error creating credit card statement:', err);
      setError(err.message || 'Failed to create credit card statement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/finance/credit-cards">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Credit Card Statement</h1>
          <p className="text-muted-foreground">Track your credit card bill</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statement Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="account_id">Credit Card Account</Label>
              <Select
                value={formData.account_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, account_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select credit card" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.icon && <span>{account.icon} </span>}
                      {account.name} ({account.provider})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="statement_date">Statement Date</Label>
                <Input
                  id="statement_date"
                  type="date"
                  value={formData.statement_date}
                  onChange={(e) => setFormData({ ...formData, statement_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>
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
                <Label htmlFor="minimum_payment">Minimum Payment (RM)</Label>
                <Input
                  id="minimum_payment"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.minimum_payment}
                  onChange={(e) => setFormData({ ...formData, minimum_payment: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paid_amount">Already Paid (RM)</Label>
              <Input
                id="paid_amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.paid_amount}
                onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
              />
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
                {loading ? 'Adding...' : 'Add Statement'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/finance/credit-cards">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {accounts.length === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900">
              💡 You need to add a credit card account first.
            </p>
            <Button variant="link" asChild className="p-0 h-auto text-blue-700">
              <Link href="/finance/accounts/new">
                Add credit card account →
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
