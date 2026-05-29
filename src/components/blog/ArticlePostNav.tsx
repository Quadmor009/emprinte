import Link from 'next/link';

import { articlePublicPath } from '@/lib/insight-slug';
import type { InsightArticle } from '@/types';

type ArticlePostNavProps = {
  article: InsightArticle;
  direction: 'previous' | 'next';
  variant?: 'side' | 'inline';
};

const cardBase =
  'group block rounded-xl border border-[#005D51]/10 bg-[#fafcfb] p-4 transition-[border-color,background-color,box-shadow] duration-200 hover:border-[#005D51]/22 hover:bg-white hover:shadow-[0_8px_28px_-18px_rgba(20,34,24,0.18)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005D51]';

export function ArticlePostNav({
  article,
  direction,
  variant = 'side',
}: ArticlePostNavProps) {
  const href = `/blog/${encodeURIComponent(articlePublicPath(article))}`;
  const isPrevious = direction === 'previous';
  const label = isPrevious ? 'Previous article' : 'Next article';

  if (variant === 'inline') {
    return (
      <Link
        href={href}
        aria-label={`${label}: ${article.title}`}
        className={[
          cardBase,
          'min-w-0 flex-1',
          isPrevious ? 'text-left' : 'text-right',
        ].join(' ')}
      >
        <span
          className={[
            'flex items-center gap-1.5 font-poppins text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#005D51]',
            isPrevious ? 'justify-start' : 'justify-end',
          ].join(' ')}
        >
          {isPrevious ? (
            <>
              <span aria-hidden className="text-sm leading-none">
                ←
              </span>
              <span>Previous</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <span aria-hidden className="text-sm leading-none">
                →
              </span>
            </>
          )}
        </span>
        <span className="mt-2 block font-lora text-sm font-medium leading-snug text-[#142218] line-clamp-2 group-hover:text-[#005D51]">
          {article.title}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-label={`${label}: ${article.title}`}
      className={[
        cardBase,
        'sticky top-28 w-full max-w-[11.75rem]',
        isPrevious ? 'ml-auto text-right' : 'mr-auto text-left',
      ].join(' ')}
    >
      <span
        className={[
          'flex items-center gap-1.5 font-poppins text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#005D51]',
          isPrevious ? 'justify-end' : 'justify-start',
        ].join(' ')}
      >
        {isPrevious ? (
          <>
            <span aria-hidden className="text-sm leading-none">
              ←
            </span>
            <span>Previous</span>
          </>
        ) : (
          <>
            <span>Next</span>
            <span aria-hidden className="text-sm leading-none">
              →
            </span>
          </>
        )}
      </span>
      <span className="mt-2.5 block font-lora text-[0.8125rem] leading-[1.45] text-[#4d575f] line-clamp-3 group-hover:text-[#142218]">
        {article.title}
      </span>
    </Link>
  );
}
