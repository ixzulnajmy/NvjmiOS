import { GlassCard } from '@/components/ui/glass-card';
import { CircleBackButton } from '@/components/ui/circle-back-button';
import { Button3D } from '@/components/ui/button-3d';
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
  type Account = NonNullable<typeof accounts>[number];
  const groupedAccounts = accounts?.reduce((acc, account) => {
    if (!acc[account.account_type]) {
      acc[account.account_type] = [];
    }
    acc[account.account_type].push(account);
    return acc;
  }, {} as Record<string, Account[]>) || {};

  return (
    <div className="space-y-6 pb-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 pt-4">
        <CircleBackButton />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">Accounts</h1>
          <p className="text-sm text-text-secondary">Manage your financial accounts</p>
        </div>
      </div>

      {/* Add Account Button */}
      <Link href="/dashboard/finance/accounts/new">
        <Button3D variant="primary" className="w-full">
          <Plus className="h-5 w-5 mr-2" />
          Add Account
        </Button3D>
      </Link>

      {!accounts || accounts.length === 0 ? (
        <GlassCard variant="strong">
          <div className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-text-secondary mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">No accounts yet</h3>
            <p className="text-sm text-text-secondary mb-4 text-center">
              Start by adding your first financial account
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {(Object.entries(groupedAccounts) as [string, Account[]][]).map(([type, accs]) => {
            const Icon = accountTypeIcons[type as keyof typeof accountTypeIcons];
            const label = accountTypeLabels[type as keyof typeof accountTypeLabels];

            return (
              <div key={type} className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-white px-1">
                  <Icon className="h-5 w-5" />
                  {label}
                </h2>
                <div className="space-y-3">
                  {accs.map((account) => (
                    <Link key={account.id} href={`/dashboard/finance/accounts/${account.id}`}>
                      <GlassCard variant="strong" hover={true}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg"
                              style={{ backgroundColor: account.color || '#2a2d3a' }}
                            >
                              {account.icon || account.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-white">{account.name}</p>
                              <p className="text-sm text-text-secondary">{account.provider}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {account.account_type === 'credit_card' ? (
                              <div className="text-right">
                                <p className="text-xl font-bold text-white">
                                  {account.credit_limit ? formatCurrency(account.credit_limit) : 'N/A'}
                                </p>
                                <p className="text-xs text-text-secondary">Credit Limit</p>
                              </div>
                            ) : (
                              <div className="text-right">
                                <p className="text-xl font-bold text-white">
                                  {account.balance !== null && account.balance !== undefined
                                    ? formatCurrency(account.balance)
                                    : 'N/A'}
                                </p>
                                <p className="text-xs text-text-secondary">Balance</p>
                              </div>
                            )}
                            <ChevronRight className="h-5 w-5 text-text-secondary" />
                          </div>
                        </div>
                      </GlassCard>
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
