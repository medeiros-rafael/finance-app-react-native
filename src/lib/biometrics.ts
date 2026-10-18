import * as LocalAuthentication from 'expo-local-authentication';

export type BiometricAvailability = 'available' | 'notEnrolled' | 'unavailable';

export async function biometricAvailability(): Promise<BiometricAvailability> {
  const [hasHardware, level] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.getEnrolledLevelAsync(),
  ]);
  if (level !== LocalAuthentication.SecurityLevel.NONE) return 'available';
  return hasHardware ? 'notEnrolled' : 'unavailable';
}

export async function authenticate(options: { title: string; subtitle: string; cancelLabel: string }) {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: options.title,
    promptSubtitle: options.subtitle,
    cancelLabel: options.cancelLabel,
    disableDeviceFallback: false,
    biometricsSecurityLevel: 'weak',
    requireConfirmation: false,
  });
  return result.success;
}
