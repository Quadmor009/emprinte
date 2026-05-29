/** Shared motion helpers — respect accessibility preferences. */

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Ease-out cubic: fast start, gentle finish */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Subtle lift on hover — pair with focus-visible ring on interactive elements */
export const hoverLiftClass =
  'transition-[transform,box-shadow] duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_10px_28px_-14px_rgba(20,34,24,0.35)] motion-safe:active:translate-y-0';
