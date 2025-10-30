'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button3D } from '@/components/ui/button-3d';
import { Button } from '@/components/ui/button';

export function AddBNPLButton() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/finance/bnpl/new');
  };

  return (
    <div className="flex items-center gap-3 self-start sm:self-auto">
      <Button3D variant="primary" className="hidden sm:inline-flex" onClick={handleNavigate}>
        <Plus className="h-4 w-4" />
        Add BNPL
      </Button3D>
      <Button
        size="icon"
        variant="outline"
        className="rounded-full border-white/20 bg-white/10 text-white sm:hidden"
        onClick={handleNavigate}
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}
