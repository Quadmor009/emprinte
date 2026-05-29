import Link from 'next/link';

import { articlePublicPath } from '@/lib/insight-slug';
import type { InsightArticle } from '@/types';

type ArticlePostNavProps = {
  article: InsightArticle;
  direction: 'previous' | 'next';
  variant?: 'side' | 'inline';
};

export function ArticlePostNav({
  article,
  direction,
  variant = 'side',
}: ArticlePostNavProps) {
  const href = `/blog/${encodeURIComponent(articlePublicPath(article))}`;
  const isPrevious = direction === 'previous';

  if (variant === 'inline') {
    return (
      <Link
        href={href}
        className={[
          'group flex min-w-0 flex-1 flex-col gap-1 rounded-xl border border-[#005D51]/10 bg-[#fafcfb] p-4 transition-colors hover:border-[#005D51]/22 hover:bg-white',
          isPrevious ? 'items-start text-left' : 'items-end text-right',
        ].join(' ')}
      >
        <span className="font-poppins text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#005D51]">
          {isPrevious ? '← Previous' : 'Next →'}
        </span>
        <span className="font-lora text-sm font-medium leading-snug text-[#142218] line-clamp-2 group-hover:text-[#005D51]">
          {article.title}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={[
        'group sticky top-28 flex max-w-[9.5rem] flex-col gap-2 py-2 transition-colors',
        isPrevious ? 'ml-auto items-end text-right' : 'items-start text-left',
      ].join(' ')}
    >
      <span className="font-poppins text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#005D51]">
        {isPrevious ? '← Previous' : 'Next →'}
      </span>
      <span
        className={[
          'font-lora text-sm leading-snug text-[#5a6570] transition-colors group-hover:text-[#142218]',
          isPrevious ? '[writing-mode:vertical-rl] rotate-180' : '[writing-mode:vertical-rl]',
        ].join(' ')}
        style={{ maxHeight: 'min(42vh, 280px)' }}
      >
        <span className="line-clamp-6">{article.title}</span>
      </span>
    </Link>
  );
}
