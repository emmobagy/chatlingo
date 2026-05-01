'use client';

import { useEffect } from 'react';

/**
 * Suppresses benign AbortErrors that Next.js App Router fires during
 * navigation / prefetch cancellation. These are NOT real errors — the
 * router intentionally aborts in-flight requests when the user navigates
 * away, and the dev overlay incorrectly surfaces them as unhandled rejections.
 *
 * Catches:
 *   - "signal is aborted without reason"
 *   - "The user aborted a request."   (ad-blocker / fetch cancel)
 *   - Any AbortError / DOMException with name === 'AbortError'
 */
export default function SuppressAbortErrors() {
  useEffect(() => {
    function handler(event: PromiseRejectionEvent) {
      const err = event.reason;
      if (!err) return;

      const isAbort =
        (err instanceof DOMException && err.name === 'AbortError') ||
        (err instanceof Error && err.name === 'AbortError') ||
        (typeof err?.message === 'string' &&
          (err.message.includes('aborted') ||
           err.message.includes('abort') ||
           err.message.includes('signal is aborted')));

      if (isAbort) {
        // Prevent Next.js dev overlay from showing it
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }

    window.addEventListener('unhandledrejection', handler, { capture: true });
    return () => window.removeEventListener('unhandledrejection', handler, { capture: true });
  }, []);

  return null;
}
