'use client';

import { useEffect, useState } from 'react';

import { useInView } from '@/hooks/useInView';
import { prefersReducedMotion } from '@/lib/motion';

type AnimatedProgressBarProps = {
  percent: number;
  className?: string;
  durationMs?: number;
};

export function AnimatedProgressBar({
  percent,
  className = '',
  durationMs = 1600,
}: AnimatedProgressBarProps) {
  const { ref, inView } = useInView({ threshold: 0.35 });
  const [width, setWidth] = useState(0);
  const [reduced, setReduced] = useState(false);
  const clamped = Math.min(Math.max(percent, 0), 100);

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!inView) return;

    if (reduced) {
      setWidth(clamped);
      return;
    }

    setWidth(0);
    const frame = requestAnimationFrame(() => setWidth(clamped));
    return () => cancelAnimationFrame(frame);
  }, [inView, clamped, reduced]);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={[
        'h-full rounded-full bg-[#ed4e32]',
        reduced ? '' : 'transition-[width] ease-out',
        className,
      ].join(' ')}
      style={{
        width: `${width}%`,
        transitionDuration: reduced ? undefined : `${durationMs}ms`,
      }}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
