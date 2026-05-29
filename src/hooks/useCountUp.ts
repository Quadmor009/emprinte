'use client';

import { useEffect, useState } from 'react';

import { easeOutCubic, prefersReducedMotion } from '@/lib/motion';

export function useCountUp(
  target: number,
  active: boolean,
  durationMs = 1400,
): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active || target <= 0) {
      setValue(active ? target : 0);
      return;
    }

    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    let frame = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      setValue(target * easeOutCubic(progress));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    setValue(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, durationMs]);

  return value;
}
