'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FloatingNavbar } from '@/components/dashboard/FloatingNavbar';
import { isAppLocked, hasPINSetup, shouldAutoLock, lockApp, refreshUnlockTimer } from '@/utils/pin-security';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if app is locked
    const checkLockState = () => {
      if (!hasPINSetup()) {
        router.replace('/unlock?setup=true');
        return;
      }

      if (isAppLocked() || shouldAutoLock()) {
        if (shouldAutoLock()) {
          lockApp();
        }
        router.replace('/unlock');
        return;
      }

      setIsReady(true);
    };

    checkLockState();

    // Refresh unlock timer on user activity
    const handleActivity = () => {
      refreshUnlockTimer();
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // Check for auto-lock periodically
    const interval = setInterval(() => {
      if (shouldAutoLock()) {
        lockApp();
        router.replace('/unlock');
      }
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      clearInterval(interval);
    };
  }, [router]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center ios-liquid-bg">
        <div className="liquid-backdrop" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="liquid-backdrop" />
      <div className="liquid-grid" />
      <div className="liquid-orb top-[-180px] left-[-120px]" />
      <div className="liquid-orb liquid-orb--secondary bottom-[-220px] right-[-140px]" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 pb-36 pt-12 sm:px-8">
        {children}
      </main>

      <FloatingNavbar />
    </div>
  );
}
