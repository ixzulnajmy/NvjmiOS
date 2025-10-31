import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FloatingNavbar } from '@/components/dashboard/FloatingNavbar';

export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="liquid-backdrop" />
      <div className="liquid-grid" />
      <div className="liquid-orb top-[-160px] left-[-140px]" />
      <div className="liquid-orb liquid-orb--secondary bottom-[-240px] right-[-80px]" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 pb-36 pt-12 sm:px-8">
        {children}
      </main>
      <FloatingNavbar />
    </div>
  );
}
