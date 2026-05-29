'use client';

import { useEffect, useRef, useState } from 'react';

type UseInViewOptions = {
  threshold?: number;
  rootMargin?: string;
  /** Fire once when element enters view (default true) */
  once?: boolean;
  /** Animate on mount without waiting for scroll (hero) */
  immediate?: boolean;
};

export function useInView({
  threshold = 0.2,
  rootMargin = '0px 0px -8% 0px',
  once = true,
  immediate = false,
}: UseInViewOptions = {}) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(immediate);

  useEffect(() => {
    if (immediate) {
      setInView(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once, immediate]);

  return { ref, inView };
}
