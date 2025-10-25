import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Sparkles, Book, Heart } from 'lucide-react';

export default function IbadahPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ibadah Brain</h1>
        <p className="text-muted-foreground">Track your spiritual journey</p>
      </div>

      <div className="grid gap-4">
        <Link href="/dashboard/ibadah/prayers">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Prayers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track your 5 daily prayers and jemaah
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/ibadah/quran">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Quran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Log your daily Quran reading
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Sedekah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track your charitable giving
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
