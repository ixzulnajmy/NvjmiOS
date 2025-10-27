import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FloatingNavbar } from '@/components/dashboard/FloatingNavbar';

export default async function DashboardLayout({
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
    <div className="min-h-screen bg-app-bg safe-bottom">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Floating Navigation - iOS 26 Liquid Glass */}
      <FloatingNavbar />
    </div>
  );
}
