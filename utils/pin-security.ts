/**
 * PIN Security Utilities for NvjmiOS
 * Device-level security with PIN + optional biometrics
 */

export const hashPIN = async (pin: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + 'nvjmios_salt_izzul');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const verifyPIN = async (input: string): Promise<boolean> => {
  const stored = localStorage.getItem('app_pin_hash');
  if (!stored) return false;
  const inputHash = await hashPIN(input);
  return stored === inputHash;
};

export const savePIN = async (pin: string): Promise<void> => {
  const hash = await hashPIN(pin);
  localStorage.setItem('app_pin_hash', hash);
};

export const hasPINSetup = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('app_pin_hash');
};

export const isAppLocked = (): boolean => {
  if (typeof window === 'undefined') return true;
  return !sessionStorage.getItem('app_unlocked');
};

export const unlockApp = (): void => {
  sessionStorage.setItem('app_unlocked', 'true');
  sessionStorage.setItem('app_unlocked_at', Date.now().toString());
};

export const lockApp = (): void => {
  sessionStorage.removeItem('app_unlocked');
  sessionStorage.removeItem('app_unlocked_at');
};

// Auto-lock after 30 minutes of inactivity
export const AUTO_LOCK_TIMEOUT_MS = 30 * 60 * 1000;

export const shouldAutoLock = (): boolean => {
  const unlockedAt = sessionStorage.getItem('app_unlocked_at');
  if (!unlockedAt) return true;
  const elapsed = Date.now() - parseInt(unlockedAt, 10);
  return elapsed > AUTO_LOCK_TIMEOUT_MS;
};

export const refreshUnlockTimer = (): void => {
  if (!isAppLocked()) {
    sessionStorage.setItem('app_unlocked_at', Date.now().toString());
  }
};
