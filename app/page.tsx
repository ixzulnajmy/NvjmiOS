'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAppLocked, hasPINSetup } from '@/utils/pin-security';

/**
 * Root page - handles initial routing
 *
 * Single-user app flow:
 * 1. If no PIN setup: go to /unlock?setup=true
 * 2. If locked: go to /unlock
 * 3. If unlocked: go to /dashboard
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check PIN and lock state
    const hasPin = hasPINSetup();
    const locked = isAppLocked();

    if (!hasPin) {
      // First time user - setup PIN
      router.replace('/unlock?setup=true');
    } else if (locked) {
      // App is locked - need PIN
      router.replace('/unlock');
    } else {
      // Unlocked - go to dashboard
      router.replace('/dashboard');
    }
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center ios-liquid-bg">
      <div className="liquid-backdrop" />
      <div className="liquid-orb top-[-180px] left-[-120px]" />
      <div className="liquid-orb liquid-orb--secondary bottom-[-220px] right-[-140px]" />
    </div>
  );
}
