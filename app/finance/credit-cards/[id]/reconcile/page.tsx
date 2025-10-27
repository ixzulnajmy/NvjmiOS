'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Search, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const categoryEmojis: Record<string, string> = {
  food: '🍔',
  transport: '🚗',
  girlfriend: '💝',
  shopping: '🛍️',
  bills: '📄',
  other: '📦',
};

export default function ReconcileStatementPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statement, setStatement] = useState<any>(null);
  const [matchingTransactions, setMatchingTransactions] = useState<any[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStatementAndTransactions();
  }, []);

  async function fetchStatementAndTransactions() {
    setLoading(true);
    const supabase = createClient();

    // Fetch statement
    const { data: statementData } = await supabase
      .from('credit_cards')
      .select('*, accounts(id, name, provider)')
      .eq('id', params.id)
      .single();

    if (statementData) {
      setStatement(statementData);

      // Calculate date range (statement date to due date, or 30 days before due date)
      const dueDate = new Date(statementData.due_date);
      const startDate = statementData.statement_date
        ? new Date(statementData.statement_date)
        : new Date(dueDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days before due

      // Fetch transactions from that credit card account in the date range
      const { data: transactions } = await supabase
        .from('expenses')
        .select('*')
        .eq('account_id', statementData.accounts.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', dueDate.toISOString().split('T')[0])
        .is('statement_id', null) // Only unlinked transactions
        .order('date', { ascending: false });

      if (transactions) {
        setMatchingTransactions(transactions);

        // Auto-select all matching transactions
        const allIds = new Set(transactions.map(t => t.id));
        setSelectedTransactions(allIds);
      }
    }

    setLoading(false);
  }

  function toggleTransaction(id: string) {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTransactions(newSelected);
  }

  function selectAll() {
    const allIds = new Set(matchingTransactions.map(t => t.id));
    setSelectedTransactions(allIds);
  }

  function deselectAll() {
    setSelectedTransactions(new Set());
  }

  async function linkTransactions() {
    setSaving(true);
    const supabase = createClient();

    // Update selected transactions to link them to this statement
    const transactionIds = Array.from(selectedTransactions);

    const { error } = await supabase
      .from('expenses')
      .update({
        statement_id: params.id,
        is_reconciled: true
      })
      .in('id', transactionIds);

    if (error) {
      console.error('Error linking transactions:', error);
      alert('Failed to link transactions');
    } else {
      router.push(`/finance/credit-cards/${params.id}`);
      router.refresh();
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!statement) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Statement not found</p>
      </div>
    );
  }

  const selectedTotal = matchingTransactions
    .filter(t => selectedTransactions.has(t.id))
    .reduce((sum, t) => sum + t.amount, 0);

  const difference = statement.total_amount - selectedTotal;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/finance/credit-cards/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Reconcile Statement</h1>
          <p className="text-sm text-muted-foreground">{statement.accounts?.name}</p>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Statement Total</p>
              <p className="text-xl font-bold">{formatCurrency(statement.total_amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Selected</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(selectedTotal)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Difference</p>
              <p className={`text-xl font-bold ${difference === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {formatCurrency(Math.abs(difference))}
              </p>
            </div>
          </div>

          {difference !== 0 && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900">
                  {difference > 0 ? 'Missing transactions' : 'Extra transactions selected'}
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  {difference > 0
                    ? `You may have ${formatCurrency(difference)} in transactions not logged yet.`
                    : `You've selected ${formatCurrency(Math.abs(difference))} more than the statement total.`
                  }
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matching Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Matching Transactions ({matchingTransactions.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {matchingTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No matching transactions found</p>
              <p className="text-sm mt-2">
                Transactions must be logged with account: {statement.accounts?.name}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {matchingTransactions.map((expense) => (
                <div
                  key={expense.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTransactions.has(expense.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => toggleTransaction(expense.id)}
                >
                  <Checkbox
                    checked={selectedTransactions.has(expense.id)}
                    onCheckedChange={() => toggleTransaction(expense.id)}
                  />
                  <div className="text-2xl">
                    {categoryEmojis[expense.category] || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {expense.merchant_name || expense.description || expense.category}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(new Date(expense.date))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(expense.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 sticky bottom-20 bg-white p-4 border-t shadow-lg">
        <Button
          onClick={linkTransactions}
          disabled={saving || selectedTransactions.size === 0}
          className="flex-1"
        >
          {saving ? 'Linking...' : `Link ${selectedTransactions.size} Transaction${selectedTransactions.size !== 1 ? 's' : ''}`}
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/finance/credit-cards/${params.id}`}>Cancel</Link>
        </Button>
      </div>
    </div>
  );
}
