import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { Plus, Wallet, CreditCard, Smartphone, Building2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const accountTypeIcons = {
  savings: Building2,
  checking: Building2,
  credit_card: CreditCard,
  bnpl: Smartphone,
  ewallet: Wallet,
};

const accountTypeLabels = {
  savings: 'Savings',
  checking: 'Checking',
  credit_card: 'Credit Card',
  bnpl: 'BNPL',
  ewallet: 'E-Wallet',
};

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Group accounts by type
  const groupedAccounts = accounts?.reduce((acc, account) => {
    if (!acc[account.account_type]) {
      acc[account.account_type] = [];
    }
    acc[account.account_type].push(account);
    return acc;
  }, {} as Record<string, typeof accounts>) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage your financial accounts</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/finance/accounts/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Link>
        </Button>
      </div>

      {!accounts || accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Start by adding your first financial account
            </p>
            <Button asChild>
              <Link href="/dashboard/finance/accounts/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAccounts).map(([type, accs]) => {
            const Icon = accountTypeIcons[type as keyof typeof accountTypeIcons];
            const label = accountTypeLabels[type as keyof typeof accountTypeLabels];

            return (
              <div key={type} className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {label}
                </h2>
                <div className="space-y-2">
                  {accs?.map((account) => (
                    <Link key={account.id} href={`/dashboard/finance/accounts/${account.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                                style={{ backgroundColor: account.color }}
                              >
                                {account.icon || account.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold">{account.name}</p>
                                <p className="text-sm text-muted-foreground">{account.provider}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {account.account_type === 'credit_card' ? (
                                <div className="text-right">
                                  <p className="text-lg font-bold">
                                    {account.credit_limit ? formatCurrency(account.credit_limit) : 'N/A'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Credit Limit</p>
                                </div>
                              ) : (
                                <div className="text-right">
                                  <p className="text-lg font-bold">
                                    {account.balance !== null && account.balance !== undefined
                                      ? formatCurrency(account.balance)
                                      : 'N/A'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Balance</p>
                                </div>
                              )}
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
