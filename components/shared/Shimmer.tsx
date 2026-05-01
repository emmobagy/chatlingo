'use client';

import { CSSProperties } from 'react';

/**
 * Shimmer — base building block for all skeleton screens.
 *
 * direction: 'ltr' (→) | 'rtl' (←) | 'ttb' (↓) | 'btt' (↑)
 * The shimmer sweep always crosses the element in the chosen axis.
 */

type Direction = 'ltr' | 'rtl' | 'ttb' | 'btt';

interface ShimmerProps {
  className?: string;
  direction?: Direction;
  style?: CSSProperties;
  rounded?: string; // tailwind rounded class, e.g. 'rounded-full'
  speed?: 'slow' | 'normal' | 'fast';
  delay?: number;  // ms — stagger offset for wave effect
}

const ANGLE: Record<Direction, string> = {
  ltr: '90deg',
  rtl: '270deg',
  ttb: '180deg',
  btt: '0deg',
};

const DURATION: Record<string, string> = {
  slow: '2.2s',
  normal: '1.6s',
  fast: '1.1s',
};

export function Shimmer({
  className = '',
  direction = 'ltr',
  style,
  rounded = 'rounded-lg',
  speed = 'normal',
  delay = 0,
}: ShimmerProps) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-100 ${rounded} ${className}`}
      style={style}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${ANGLE[direction]}, transparent 0%, transparent 30%, rgba(255,255,255,0.65) 50%, transparent 70%, transparent 100%)`,
          backgroundSize: direction === 'ltr' || direction === 'rtl' ? '200% 100%' : '100% 200%',
          animation: `shimmer-${direction} ${DURATION[speed]} ease-in-out ${delay}ms infinite`,
        }}
      />
      <style>{`
        @keyframes shimmer-ltr {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes shimmer-rtl {
          0%   { background-position:  200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes shimmer-ttb {
          0%   { background-position: 0 -200%; }
          100% { background-position: 0  200%; }
        }
        @keyframes shimmer-btt {
          0%   { background-position: 0  200%; }
          100% { background-position: 0 -200%; }
        }
      `}</style>
    </div>
  );
}

/** Convenience: a text-line placeholder of variable width */
export function ShimmerLine({
  width = 'w-full',
  height = 'h-4',
  direction,
  speed,
}: {
  width?: string;
  height?: string;
  direction?: Direction;
  speed?: 'slow' | 'normal' | 'fast';
}) {
  return <Shimmer className={`${width} ${height}`} rounded="rounded-md" direction={direction} speed={speed} />;
}
