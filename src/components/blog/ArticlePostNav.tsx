import Link from 'next/link';

import { articlePublicPath } from '@/lib/insight-slug';
import type { InsightArticle } from '@/types';

type ArticlePostNavLinkProps = {
  article: InsightArticle;
  direction: 'previous' | 'next';
};

const linkBase =
  'group block min-w-0 py-3 transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[rgba(0,93,81,0.05)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#005D51] sm:max-w-[min(100%,18rem)] sm:px-4 sm:py-4';

function ArticlePostNavLink({ article, direction }: ArticlePostNavLinkProps) {
  const href = `/blog/${encodeURIComponent(articlePublicPath(article))}`;
  const isPrevious = direction === 'previous';
  const label = isPrevious ? 'Previous article' : 'Next article';

  return (
    <Link
      href={href}
      aria-label={`${label}: ${article.title}`}
      className={[linkBase, isPrevious ? 'text-left' : 'text-right sm:ml-auto'].join(
        ' ',
      )}
    >
      <span
        className={[
          'flex items-center gap-1 font-poppins text-xs text-[#7a858f] transition-colors group-hover:text-[#005D51]/80',
          isPrevious ? 'justify-start' : 'justify-end',
        ].join(' ')}
      >
        {isPrevious ? (
          <>
            <span aria-hidden>←</span>
            <span>Previous</span>
          </>
        ) : (
          <>
            <span>Next</span>
            <span aria-hidden>→</span>
          </>
        )}
      </span>
      <span className="mt-2 block font-poppins text-base font-semibold leading-snug text-[#142218] transition-colors group-hover:text-[#005D51] sm:text-lg sm:leading-snug">
        {article.title}
      </span>
    </Link>
  );
}

type ArticlePostNavigationProps = {
  previousArticle?: InsightArticle | null;
  nextArticle?: InsightArticle | null;
};

export function ArticlePostNavigation({
  previousArticle = null,
  nextArticle = null,
}: ArticlePostNavigationProps) {
  if (!previousArticle && !nextArticle) {
    return null;
  }

  return (
    <nav
      aria-label="Continue reading"
      className="mt-12 border-t border-[#005D51]/10 pt-10 md:mt-16 md:pt-12"
    >
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
        {previousArticle ? (
          <ArticlePostNavLink article={previousArticle} direction="previous" />
        ) : (
          <div className="hidden min-w-0 flex-1 sm:block" aria-hidden />
        )}
        {nextArticle ? (
          <ArticlePostNavLink article={nextArticle} direction="next" />
        ) : null}
      </div>
    </nav>
  );
}
