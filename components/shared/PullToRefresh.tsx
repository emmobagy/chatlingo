'use client';

import { useRef, useEffect, useCallback, ReactNode } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

const PULL_THRESHOLD = 72;   // px to trigger refresh
const MAX_PULL = 110;        // px max drag distance

export default function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const currentPullRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const isDraggingRef = useRef(false);

  const setIndicator = useCallback((pull: number, refreshing: boolean) => {
    const indicator = indicatorRef.current;
    const spinner = spinnerRef.current;
    if (!indicator || !spinner) return;

    if (refreshing) {
      indicator.style.transform = `translateY(${PULL_THRESHOLD}px)`;
      indicator.style.opacity = '1';
      spinner.style.animation = 'spin 0.7s linear infinite';
      spinner.style.transform = 'rotate(0deg)';
    } else if (pull <= 0) {
      indicator.style.transform = 'translateY(0px)';
      indicator.style.opacity = '0';
      spinner.style.animation = 'none';
    } else {
      const clamped = Math.min(pull, MAX_PULL);
      const ratio = Math.min(clamped / PULL_THRESHOLD, 1);
      indicator.style.transform = `translateY(${clamped * 0.6}px)`;
      indicator.style.opacity = String(ratio);
      spinner.style.animation = 'none';
      // Rotate proportionally to pull distance
      spinner.style.transform = `rotate(${ratio * 270}deg)`;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function onTouchStart(e: TouchEvent) {
      if (isRefreshingRef.current) return;
      // Only trigger when scrolled to top
      if (container!.scrollTop > 2) return;
      startYRef.current = e.touches[0].clientY;
      isDraggingRef.current = true;
    }

    function onTouchMove(e: TouchEvent) {
      if (!isDraggingRef.current || isRefreshingRef.current) return;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta <= 0) { currentPullRef.current = 0; return; }
      // Prevent native scroll while pulling
      if (container!.scrollTop <= 0 && delta > 0) e.preventDefault();
      const eased = delta * (1 - delta / (MAX_PULL * 3)); // rubber-band feel
      currentPullRef.current = Math.max(0, eased);
      setIndicator(currentPullRef.current, false);
    }

    async function onTouchEnd() {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      const pull = currentPullRef.current;
      currentPullRef.current = 0;

      if (pull >= PULL_THRESHOLD) {
        isRefreshingRef.current = true;
        setIndicator(0, true);
        try {
          await onRefresh();
        } finally {
          isRefreshingRef.current = false;
          // Animate out
          const indicator = indicatorRef.current;
          if (indicator) {
            indicator.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            setIndicator(0, false);
            setTimeout(() => { if (indicator) indicator.style.transition = ''; }, 350);
          }
        }
      } else {
        const indicator = indicatorRef.current;
        if (indicator) {
          indicator.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
          setIndicator(0, false);
          setTimeout(() => { if (indicator) indicator.style.transition = ''; }, 280);
        }
      }
    }

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [onRefresh, setIndicator]);

  return (
    <div ref={containerRef} className={`relative overflow-y-auto ${className}`}>
      {/* Pull indicator */}
      <div
        ref={indicatorRef}
        style={{ opacity: 0, transform: 'translateY(0px)', willChange: 'transform, opacity' }}
        className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-50"
        aria-hidden
      >
        <div className="mt-[-44px] w-9 h-9 rounded-full bg-gray-800 border border-white/10 shadow-xl flex items-center justify-center">
          <div
            ref={spinnerRef}
            style={{ willChange: 'transform' }}
            className="w-5 h-5"
          >
            {/* Arc spinner SVG */}
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <circle cx="10" cy="10" r="7" stroke="white" strokeOpacity="0.15" strokeWidth="2.5" />
              <path
                d="M10 3 A7 7 0 0 1 17 10"
                stroke="#818cf8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {children}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
