'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Check, Book, Heart } from 'lucide-react';

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/finance/transactions/new">
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <PlusCircle className="h-4 w-4" />
              Log Expense
            </Button>
          </Link>
          <Link href="/dashboard/ibadah/prayers">
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <Check className="h-4 w-4" />
              Prayer
            </Button>
          </Link>
          <Link href="/dashboard/ibadah/quran">
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <Book className="h-4 w-4" />
              Quran
            </Button>
          </Link>
          <Link href="/finance/debts">
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <Heart className="h-4 w-4" />
              Pay Debt
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
