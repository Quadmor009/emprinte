'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { useInView } from '@/hooks/useInView';
import { prefersReducedMotion } from '@/lib/motion';

type AnimateOnViewProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  /** Hero / above-the-fold: animate on first paint */
  immediate?: boolean;
};

export function AnimateOnView({
  children,
  className = '',
  delayMs = 0,
  immediate = false,
}: AnimateOnViewProps) {
  const { ref, inView } = useInView({ immediate, threshold: 0.12 });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  const visible = reduced || inView;

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={[
        reduced ? '' : 'transition-[opacity,transform] duration-700 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-7 opacity-0',
        className,
      ].join(' ')}
      style={
        visible && delayMs > 0 && !reduced
          ? { transitionDelay: `${delayMs}ms` }
          : undefined
      }
    >
      {children}
    </div>
  );
}
