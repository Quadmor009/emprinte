'use client';

import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';
import { formatCountedStat, parseStatValue } from '@/lib/parse-stat-value';

type CountUpTextProps = {
  /** Plain number (e.g. books collected) */
  value: number;
  className?: string;
  durationMs?: number;
  active?: boolean;
};

export function CountUpText({
  value,
  className = '',
  durationMs = 1400,
  active: activeProp,
}: CountUpTextProps) {
  const { ref, inView } = useInView({ threshold: 0.25 });
  const active = activeProp ?? inView;
  const count = useCountUp(value, active, durationMs);
  const display = Math.round(count).toLocaleString();

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={className}>
      {display}
    </span>
  );
}

/** Homepage stats like "2000+" or "50+" */
export function CountUpStat({
  value,
  className = '',
}: {
  value: string;
  className?: string;
}) {
  const { ref, inView } = useInView({ threshold: 0.25 });
  const parsed = parseStatValue(value);
  const count = useCountUp(
    parsed.numeric ?? 0,
    inView && parsed.numeric !== null,
  );
  const display =
    parsed.numeric === null ? value : formatCountedStat(count, parsed);

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={className}>
      {display}
    </span>
  );
}
