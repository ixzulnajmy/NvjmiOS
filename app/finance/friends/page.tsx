'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Users, TrendingUp, TrendingDown, Plus, Check, X, AlertCircle } from 'lucide-react';
import { AddFriendDebtModal } from '@/components/finance/AddFriendDebtModal';
import type { FriendDebt } from '@/types/database.types';

export default function FriendsPage() {
  const [loading, setLoading] = useState(true);
  const [friendDebts, setFriendDebts] = useState<FriendDebt[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchFriendDebts();
  }, []);

  async function fetchFriendDebts() {
    setLoading(true);
    const supabase = createClient();

    const { data } = await supabase
      .from('friend_debts')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) {
      setFriendDebts(data);
    }

    setLoading(false);
  }

  async function markAsPaid(id: string) {
    if (!confirm('Mark this debt as paid?')) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('friend_debts')
      .update({ status: 'paid' })
      .eq('id', id);

    if (!error) {
      fetchFriendDebts();
    } else {
      console.error('Error marking debt as paid:', error);
      alert('Failed to mark as paid');
    }
  }

  async function cancelDebt(id: string) {
    if (!confirm('Cancel this debt?')) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('friend_debts')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (!error) {
      fetchFriendDebts();
    } else {
      console.error('Error cancelling debt:', error);
      alert('Failed to cancel debt');
    }
  }

  // Calculate summaries
  const theyOweMe = friendDebts
    .filter(d => d.debt_type === 'they_owe_me')
    .reduce((sum, d) => sum + d.amount, 0);

  const iOweThem = friendDebts
    .filter(d => d.debt_type === 'i_owe_them')
    .reduce((sum, d) => sum + d.amount, 0);

  const netPosition = theyOweMe - iOweThem;

  // Split debts by type
  const theyOweMeList = friendDebts.filter(d => d.debt_type === 'they_owe_me');
  const iOweThemList = friendDebts.filter(d => d.debt_type === 'i_owe_them');

  // Calculate days since/until
  function getDaysInfo(debt: FriendDebt) {
    const today = new Date();

    if (debt.due_date) {
      const dueDate = new Date(debt.due_date);
      const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil < 0) {
        return { text: `${Math.abs(daysUntil)} days overdue`, isOverdue: true };
      } else if (daysUntil === 0) {
        return { text: 'Due today', isOverdue: false };
      } else {
        return { text: `Due in ${daysUntil} days`, isOverdue: false };
      }
    } else {
      const createdDate = new Date(debt.created_at);
      const daysSince = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      return { text: `${daysSince} days ago`, isOverdue: false };
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Friend Debts</h1>
          <p className="text-muted-foreground">Track money owed between friends</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Debt
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              They Owe Me
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(theyOweMe)}</p>
            <p className="text-xs text-muted-foreground mt-1">{theyOweMeList.length} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              I Owe Them
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(iOweThem)}</p>
            <p className="text-xs text-muted-foreground mt-1">{iOweThemList.length} pending</p>
          </CardContent>
        </Card>

        <Card className={netPosition >= 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Net Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${netPosition >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {netPosition >= 0 ? '+' : ''}{formatCurrency(netPosition)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {netPosition >= 0 ? 'In your favor' : 'You owe more'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* They Owe Me List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            They Owe Me ({theyOweMeList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {theyOweMeList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No pending debts from friends</p>
            </div>
          ) : (
            <div className="space-y-3">
              {theyOweMeList.map((debt) => {
                const daysInfo = getDaysInfo(debt);
                return (
                  <div
                    key={debt.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      daysInfo.isOverdue ? 'bg-red-50 border-red-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{debt.friend_name}</p>
                        {daysInfo.isOverdue && <AlertCircle className="h-4 w-4 text-red-600" />}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {debt.description || 'No description'}
                      </p>
                      <p className={`text-xs mt-1 ${daysInfo.isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                        {daysInfo.text}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <p className="text-xl font-bold text-green-600">{formatCurrency(debt.amount)}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsPaid(debt.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelDebt(debt.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* I Owe Them List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-orange-600" />
            I Owe Them ({iOweThemList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {iOweThemList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No pending debts to friends</p>
            </div>
          ) : (
            <div className="space-y-3">
              {iOweThemList.map((debt) => {
                const daysInfo = getDaysInfo(debt);
                return (
                  <div
                    key={debt.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      daysInfo.isOverdue ? 'bg-red-50 border-red-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{debt.friend_name}</p>
                        {daysInfo.isOverdue && <AlertCircle className="h-4 w-4 text-red-600" />}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {debt.description || 'No description'}
                      </p>
                      <p className={`text-xs mt-1 ${daysInfo.isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                        {daysInfo.text}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <p className="text-xl font-bold text-orange-600">{formatCurrency(debt.amount)}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsPaid(debt.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelDebt(debt.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Friend Debt Modal */}
      <AddFriendDebtModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={fetchFriendDebts}
      />
    </div>
  );
}
