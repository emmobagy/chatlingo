'use client';

import { useEffect, useState } from 'react';

/**
 * Returns true when running inside a Capacitor native app (iOS/Android).
 * On web browsers this always returns false.
 */
export function useIsNativeApp(): boolean {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // window.Capacitor is injected by the Capacitor bridge only in native apps
    setIsNative(typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.());
  }, []);

  return isNative;
}
