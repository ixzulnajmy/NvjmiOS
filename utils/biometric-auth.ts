/**
 * Biometric Authentication (WebAuthn) for NvjmiOS
 * Uses Web Authentication API for Face ID/Touch ID
 */

const CREDENTIAL_ID_KEY = 'biometric_credential_id';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export const isBiometricAvailable = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  if (!window.PublicKeyCredential) return false;

  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};

export const isBiometricEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(BIOMETRIC_ENABLED_KEY) === 'true';
};

export const registerBiometric = async (): Promise<boolean> => {
  try {
    const available = await isBiometricAvailable();
    if (!available) return false;

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'NvjmiOS',
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode('izzul'),
          name: 'Izzul',
          displayName: 'Izzul',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
      },
    }) as PublicKeyCredential | null;

    if (!credential) return false;

    const credentialId = btoa(
      String.fromCharCode(...new Uint8Array(credential.rawId))
    );
    localStorage.setItem(CREDENTIAL_ID_KEY, credentialId);
    localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');

    return true;
  } catch (error) {
    console.error('Biometric registration failed:', error);
    return false;
  }
};

export const authenticateWithBiometric = async (): Promise<boolean> => {
  try {
    const credentialId = localStorage.getItem(CREDENTIAL_ID_KEY);
    if (!credentialId) return false;

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const rawId = Uint8Array.from(atob(credentialId), (c) => c.charCodeAt(0));

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [
          {
            id: rawId,
            type: 'public-key',
            transports: ['internal'],
          },
        ],
        userVerification: 'required',
        timeout: 60000,
      },
    });

    return !!assertion;
  } catch (error) {
    console.error('Biometric authentication failed:', error);
    return false;
  }
};

export const disableBiometric = (): void => {
  localStorage.removeItem(CREDENTIAL_ID_KEY);
  localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
};
