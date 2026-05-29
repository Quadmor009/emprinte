import Image from 'next/image';
import Link from 'next/link';

import { articlePublicPath } from '@/lib/insight-slug';
import type { InsightArticle } from '@/types';
import { Badge } from '../ui';

type InsightsProps = {
  articles: InsightArticle[];
};

/** Landing preview: date | thumbnail | title + excerpt + Read More (max 3 rows). */
export function Insights({ articles }: InsightsProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section
      id="insights"
      className="w-full bg-[#F0FFFD] px-4 py-12 sm:px-6 md:px-8 md:py-16 lg:px-[75px] lg:py-24 xl:px-[120px]"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 sm:gap-10 md:gap-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <Badge>Emprinte Insider</Badge>
            <h2 className="max-w-[600px] font-lora text-2xl font-bold leading-tight text-[#005D51] sm:text-3xl md:text-3xl lg:text-5xl">
              Explore Insights from Emprinte Readers
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex shrink-0 items-center gap-1.5 font-poppins text-sm font-semibold text-[#005D51] underline-offset-4 transition-colors hover:text-[#004840] hover:underline sm:text-base"
          >
            View all posts
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="flex flex-col gap-10 sm:gap-12 md:gap-14 lg:gap-16">
          {articles.map((article) => {
            const postHref = `/blog/${encodeURIComponent(articlePublicPath(article))}`;
            return (
              <article
                key={article.id}
                className="flex w-full flex-col items-start gap-5 sm:gap-6 md:min-h-[280px] md:flex-row md:gap-6 lg:min-h-[333px] lg:gap-8"
              >
                <div className="order-2 w-full shrink-0 md:order-1 md:w-auto md:min-w-[85px] lg:min-w-[140px]">
                  <time
                    dateTime={article.date}
                    className="block whitespace-pre-line font-poppins text-base font-semibold text-[#151515] sm:text-lg md:text-sm lg:text-xl"
                  >
                    {article.date.replace(/, (\d{4})$/, '\n$1')}
                  </time>
                </div>

                <Link
                  href={postHref}
                  className="relative order-1 aspect-400/280 w-full shrink-0 overflow-hidden rounded-lg md:order-2 md:w-[200px] lg:w-[300px] xl:w-[452px]"
                >
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    unoptimized
                    className="rounded-2xl object-cover transition-[transform] duration-300 hover:scale-[1.02] sm:rounded-3xl"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 200px, 452px"
                  />
                </Link>

                <div className="order-3 flex min-w-0 flex-1 flex-col justify-between gap-3 md:gap-4">
                  <div className="flex flex-col gap-2 md:gap-3 lg:gap-4">
                    <h3 className="font-poppins text-xl font-semibold leading-tight text-gray-900 sm:text-2xl md:text-lg lg:text-3xl">
                      <Link
                        href={postHref}
                        className="transition-colors hover:text-[#005D51]"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p className="font-poppins text-base font-medium leading-tight text-[#7B7B7B] sm:text-lg md:text-sm lg:text-xl">
                      {article.description}
                    </p>
                  </div>
                  <Link
                    href={postHref}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#E63715] font-poppins text-lg font-medium text-white transition-colors hover:bg-[#c42e12] sm:h-12 sm:w-auto sm:min-w-[200px] md:h-9 md:min-w-0 md:px-3 md:text-sm lg:h-12 lg:px-4 lg:text-2xl"
                  >
                    Read More
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
