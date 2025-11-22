'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PINPad } from '@/components/auth/PINPad';
import { PINDots } from '@/components/auth/PINDots';
import {
  verifyPIN,
  savePIN,
  hasPINSetup,
  unlockApp,
  isAppLocked,
} from '@/utils/pin-security';
import {
  isBiometricAvailable,
  isBiometricEnabled,
  authenticateWithBiometric,
  registerBiometric,
} from '@/utils/biometric-auth';
import { Shield, Fingerprint, Check } from 'lucide-react';

const PIN_LENGTH = 6;

type UnlockState =
  | 'loading'
  | 'enter_pin'
  | 'setup_pin'
  | 'confirm_pin'
  | 'setup_biometric'
  | 'success';

function UnlockContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get('setup') === 'true';

  const [state, setState] = useState<UnlockState>('loading');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleSuccess = useCallback(() => {
    setState('success');
    unlockApp();
    setTimeout(() => {
      router.replace('/dashboard');
    }, 500);
  }, [router]);

  const handleBiometricAuth = useCallback(async () => {
    const success = await authenticateWithBiometric();
    if (success) {
      handleSuccess();
    }
  }, [handleSuccess]);

  // Check initial state
  useEffect(() => {
    const checkState = async () => {
      // If already unlocked, go to dashboard
      if (!isAppLocked()) {
        router.replace('/dashboard');
        return;
      }

      const hasPin = hasPINSetup();
      const bioAvailable = await isBiometricAvailable();
      const bioEnabled = isBiometricEnabled();

      setBiometricAvailable(bioAvailable);
      setBiometricEnabled(bioEnabled);

      if (!hasPin || isSetup) {
        setState('setup_pin');
      } else {
        setState('enter_pin');
        // Auto-trigger biometric if enabled
        if (bioEnabled) {
          handleBiometricAuth();
        }
      }
    };

    checkState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSetup, router]);

  const handleDigit = async (digit: string) => {
    setError(false);
    setErrorMessage('');

    if (state === 'setup_pin') {
      if (pin.length < PIN_LENGTH) {
        const newPin = pin + digit;
        setPin(newPin);
        if (newPin.length === PIN_LENGTH) {
          // Move to confirm state
          setTimeout(() => {
            setState('confirm_pin');
            setPin('');
            setConfirmPin(newPin);
          }, 200);
        }
      }
    } else if (state === 'confirm_pin') {
      if (pin.length < PIN_LENGTH) {
        const newPin = pin + digit;
        setPin(newPin);
        if (newPin.length === PIN_LENGTH) {
          // Check if PINs match
          if (newPin === confirmPin) {
            await savePIN(newPin);
            // Check if biometric is available for setup
            if (biometricAvailable) {
              setState('setup_biometric');
            } else {
              handleSuccess();
            }
          } else {
            setError(true);
            setErrorMessage('PINs do not match');
            setTimeout(() => {
              setPin('');
              setError(false);
              setState('setup_pin');
              setConfirmPin('');
            }, 1000);
          }
        }
      }
    } else if (state === 'enter_pin') {
      if (pin.length < PIN_LENGTH) {
        const newPin = pin + digit;
        setPin(newPin);
        if (newPin.length === PIN_LENGTH) {
          const valid = await verifyPIN(newPin);
          if (valid) {
            handleSuccess();
          } else {
            setError(true);
            setErrorMessage('Incorrect PIN');
            setTimeout(() => {
              setPin('');
              setError(false);
            }, 800);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const handleSkipBiometric = () => {
    handleSuccess();
  };

  const handleEnableBiometric = async () => {
    const success = await registerBiometric();
    if (success) {
      setBiometricEnabled(true);
    }
    handleSuccess();
  };

  const getTitle = () => {
    switch (state) {
      case 'setup_pin':
        return 'Create PIN';
      case 'confirm_pin':
        return 'Confirm PIN';
      case 'enter_pin':
        return 'Enter PIN';
      case 'setup_biometric':
        return 'Enable Face ID';
      case 'success':
        return 'Welcome back';
      default:
        return '';
    }
  };

  const getSubtitle = () => {
    switch (state) {
      case 'setup_pin':
        return 'Create a 6-digit PIN to secure your app';
      case 'confirm_pin':
        return 'Re-enter your PIN to confirm';
      case 'enter_pin':
        return errorMessage || 'Enter your 6-digit PIN';
      case 'setup_biometric':
        return 'Unlock faster with Face ID';
      case 'success':
        return 'Izzul';
      default:
        return '';
    }
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center ios-liquid-bg">
        <div className="liquid-backdrop" />
        <div className="liquid-orb top-[-180px] left-[-120px]" />
        <div className="liquid-orb liquid-orb--secondary bottom-[-220px] right-[-140px]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 ios-liquid-bg">
      <div className="liquid-backdrop" />
      <div className="liquid-grid" />
      <div className="liquid-orb top-[-180px] left-[-120px]" />
      <div className="liquid-orb liquid-orb--secondary bottom-[-220px] right-[-140px]" />

      <motion.div
        className="relative z-10 w-full max-w-sm flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo/Icon */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <AnimatePresence mode="wait">
            {state === 'success' ? (
              <motion.div
                key="success"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-green-500" />
              </motion.div>
            ) : state === 'setup_biometric' ? (
              <motion.div
                key="biometric"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center"
              >
                <Fingerprint className="w-10 h-10 text-blue-400" />
              </motion.div>
            ) : (
              <motion.div
                key="shield"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center"
              >
                <Shield className="w-10 h-10 text-white/80" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-2xl font-bold text-white mb-2"
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {getTitle()}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className={`text-sm mb-8 ${
            error ? 'text-red-400' : 'text-white/60'
          }`}
          key={`subtitle-${state}-${error}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {getSubtitle()}
        </motion.p>

        {/* PIN Entry States */}
        <AnimatePresence mode="wait">
          {(state === 'setup_pin' ||
            state === 'confirm_pin' ||
            state === 'enter_pin') && (
            <motion.div
              key="pin-entry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center gap-10"
            >
              {/* PIN Dots */}
              <PINDots length={pin.length} maxLength={PIN_LENGTH} error={error} />

              {/* PIN Pad */}
              <PINPad
                onDigit={handleDigit}
                onDelete={handleDelete}
                onBiometric={handleBiometricAuth}
                showBiometric={state === 'enter_pin' && biometricEnabled}
                disabled={error}
              />
            </motion.div>
          )}

          {/* Biometric Setup State */}
          {state === 'setup_biometric' && (
            <motion.div
              key="biometric-setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center gap-6"
            >
              <button
                onClick={handleEnableBiometric}
                className="w-full py-4 rounded-2xl bg-blue-500 text-white font-semibold text-lg"
              >
                Enable Face ID
              </button>
              <button
                onClick={handleSkipBiometric}
                className="text-white/60 text-sm font-medium"
              >
                Skip for now
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center ios-liquid-bg">
      <div className="liquid-backdrop" />
      <div className="liquid-orb top-[-180px] left-[-120px]" />
      <div className="liquid-orb liquid-orb--secondary bottom-[-220px] right-[-140px]" />
    </div>
  );
}

export default function UnlockPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnlockContent />
    </Suspense>
  );
}
