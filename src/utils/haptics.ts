/**
 * Haptic Feedback Utility
 * Provides tactile feedback on mobile devices using the Vibration API
 */

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Check if haptic feedback is supported
 */
export const isHapticSupported = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * Trigger haptic feedback with a specific pattern
 */
export const triggerHaptic = (pattern: HapticPattern = 'light'): void => {
  if (!isHapticSupported()) return;

  const patterns: Record<HapticPattern, number | number[]> = {
    light: 10,           // Quick tap
    medium: 20,          // Standard tap
    heavy: 30,           // Strong tap
    success: [10, 50, 10], // Double tap
    warning: [20, 100, 20], // Double strong tap
    error: [30, 100, 30, 100, 30], // Triple strong tap
  };

  const vibrationPattern = patterns[pattern];
  
  try {
    navigator.vibrate(vibrationPattern);
  } catch (e) {
    console.warn('Haptic feedback failed:', e);
  }
};

/**
 * Cancel any ongoing haptic feedback
 */
export const cancelHaptic = (): void => {
  if (!isHapticSupported()) return;
  
  try {
    navigator.vibrate(0);
  } catch (e) {
    console.warn('Cancel haptic failed:', e);
  }
};

/**
 * Haptic feedback for common interactions
 */
export const haptics = {
  tap: () => triggerHaptic('light'),
  press: () => triggerHaptic('medium'),
  longPress: () => triggerHaptic('heavy'),
  success: () => triggerHaptic('success'),
  warning: () => triggerHaptic('warning'),
  error: () => triggerHaptic('error'),
  cancel: () => cancelHaptic(),
};
