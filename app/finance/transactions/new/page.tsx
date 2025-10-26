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
import { expenseSchema } from '@/schemas/expense.schema';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const categoryOptions = [
  { value: 'food', label: '🍔 Food' },
  { value: 'transport', label: '🚗 Transport' },
  { value: 'girlfriend', label: '💝 Girlfriend' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'bills', label: '📄 Bills' },
  { value: 'other', label: '📦 Other' },
];

export default function NewExpensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'food' as any,
    merchant_name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    account_id: '',
    payment_method_id: '',
    sort_order: 0,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (formData.account_id) {
      fetchPaymentMethods(formData.account_id);
    } else {
      setPaymentMethods([]);
      setFormData(prev => ({ ...prev, payment_method_id: '' }));
    }
  }, [formData.account_id]);

  async function fetchAccounts() {
    const supabase = createClient();
    const { data } = await supabase
      .from('accounts')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (data) {
      setAccounts(data);
    }
  }

  async function fetchPaymentMethods(accountId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('account_id', accountId)
      .order('is_default', { ascending: false });

    if (data) {
      setPaymentMethods(data);
      // Auto-select default payment method if exists
      const defaultMethod = data.find(pm => pm.is_default);
      if (defaultMethod) {
        setFormData(prev => ({ ...prev, payment_method_id: defaultMethod.id }));
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      const validatedData = expenseSchema.parse({
        ...formData,
        amount: parseFloat(formData.amount),
        account_id: formData.account_id || undefined,
        payment_method_id: formData.payment_method_id || undefined,
      });

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to add an expense');
      }

      const { error: insertError } = await supabase.from('expenses').insert({
        user_id: user.id,
        ...validatedData,
      });

      if (insertError) throw insertError;

      router.push('/finance/transactions');
      router.refresh();
    } catch (err: any) {
      console.error('Error creating expense:', err);
      setError(err.message || 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/finance/transactions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Expense</h1>
          <p className="text-muted-foreground">Track your spending</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (RM)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant_name">Merchant / Store</Label>
              <Input
                id="merchant_name"
                placeholder="e.g., Starbucks, 7-Eleven, Grab"
                value={formData.merchant_name}
                onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Note (Optional)</Label>
              <Input
                id="description"
                placeholder="Additional details"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_id">Account (Optional)</Label>
              <Select
                value={formData.account_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, account_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
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

            {formData.account_id && paymentMethods.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="payment_method_id">Payment Method</Label>
                <Select
                  value={formData.payment_method_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, payment_method_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.method_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        {method.is_default && ' (Default)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Adding...' : 'Add Expense'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/finance/transactions">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {accounts.length === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900">
              💡 Tip: Add your accounts first to track which account you used for each expense.
            </p>
            <Button variant="link" asChild className="p-0 h-auto text-blue-700">
              <Link href="/finance/accounts/new">
                Add an account →
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
