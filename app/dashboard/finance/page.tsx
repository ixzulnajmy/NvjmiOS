import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DollarSign, CreditCard, Receipt, PieChart } from 'lucide-react';

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Finance Brain</h1>
        <p className="text-muted-foreground">Manage your debts, expenses, and budget</p>
      </div>

      <div className="grid gap-4">
        <Link href="/dashboard/finance/debts">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Debts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track and manage all your debts
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/finance/expenses">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Log and categorize your spending
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/finance/budget">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View budget vs actual spending
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
