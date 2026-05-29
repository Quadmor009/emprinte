import Image from 'next/image';
import Link from 'next/link';

import { articlePublicPath } from '@/lib/insight-slug';
import type { InsightArticle } from '@/types';

type BlogArticleListProps = {
  articles: InsightArticle[];
};

function ArticleCard({
  article,
  variant,
}: {
  article: InsightArticle;
  variant: 'featured' | 'grid';
}) {
  const isFeatured = variant === 'featured';

  return (
    <article
      className={
        isFeatured
          ? 'group flex h-full flex-col rounded-2xl bg-white p-4 ring-1 ring-[#005D51]/[0.07] sm:p-5 md:min-h-0 md:p-5 lg:p-6'
          : 'group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-[#005D51]/[0.06] transition-[transform] duration-300 hover:-translate-y-0.5 hover:ring-[#005D51]/15'
      }
    >
      <Link
        href={`/blog/${encodeURIComponent(articlePublicPath(article))}`}
        className={
          isFeatured
            ? 'flex min-h-0 flex-1 flex-col gap-4 md:flex-row md:gap-6 lg:gap-8'
            : 'flex h-full flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-[#005D51] focus-visible:ring-offset-2 rounded-[inherit]'
        }
      >
        <div
          className={
            isFeatured
              ? 'relative aspect-2/1 w-full shrink-0 overflow-hidden rounded-xl bg-[#e4f2ef] md:aspect-auto md:h-auto md:w-[54%] md:min-h-[220px] lg:min-h-[260px]'
              : 'relative aspect-2/1 w-full shrink-0 overflow-hidden bg-[#e4f2ef]'
          }
        >
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-[transform] duration-500 ease-out group-hover:scale-[1.02]"
            sizes={
              isFeatured
                ? '(max-width: 768px) 100vw, 52vw'
                : '(max-width: 768px) 100vw, 50vw'
            }
          />
        </div>

        <div
          className={
            isFeatured
              ? 'flex min-w-0 flex-1 flex-col justify-center gap-2.5 py-1 md:py-2 md:pr-1'
              : 'flex flex-1 flex-col gap-2 p-4 md:gap-2.5 md:p-5'
          }
        >
          <p className="font-poppins text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#005D51]">
            <time dateTime={article.date}>{article.date}</time>
          </p>
          <h2
            className={
              isFeatured
                ? 'font-poppins text-lg font-bold leading-snug text-[#142218] transition-colors duration-200 group-hover:text-[#005D51] sm:text-xl md:text-2xl'
                : 'font-poppins text-base font-bold leading-snug text-[#142218] transition-colors duration-200 group-hover:text-[#005D51] md:text-lg'
            }
          >
            {article.title}
          </h2>
          <p
            className={
              isFeatured
                ? 'line-clamp-4 font-lora text-sm leading-relaxed text-[#5a6570]'
                : 'line-clamp-3 font-lora text-xs leading-relaxed text-[#5a6570] md:text-sm'
            }
          >
            {article.description}
          </p>
          <span className="mt-0.5 inline-flex items-center gap-1.5 font-poppins text-xs font-semibold text-[#E63715] transition-colors group-hover:text-[#c42e12]">
            Read on this site
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}

export function BlogArticleList({ articles }: BlogArticleListProps) {
  const [featured, ...rest] = articles;

  return (
    <div className="w-full bg-[#F9F9F9]">
      <div className="w-full border-b border-white/10 bg-[#172219]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14 lg:px-[75px] lg:py-16 xl:max-w-[1320px] xl:px-[120px]">
          <div className="flex w-full flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12 lg:gap-16">
            <div className="flex min-w-0 flex-1 flex-col gap-3 md:max-w-none lg:pr-8">
              <p className="font-poppins text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white">
                Read here — no paywall
              </p>
              <h1 className="font-poppins text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                Blog
              </h1>
              <p className="max-w-xl font-lora text-sm leading-relaxed text-white sm:text-base lg:text-[1.05rem]">
                Long-form pieces meant to be read calmly on this page—stories
                and ideas from the Emprinte community.
              </p>
            </div>
            <p className="hidden shrink-0 md:block md:max-w-[268px] md:text-right lg:max-w-[320px]">
              <span className="font-lora text-xs leading-relaxed text-white lg:text-sm">
                Dispatches from real reading rooms—the off-agenda debates,
                drought weeks nobody talks about, and the small thing that makes
                someone open the next chapter anyway.
              </span>
            </p>
          </div>
        </div>
      </div>

      <section
        className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-8 md:px-10 md:py-12 lg:px-[75px] lg:py-14 xl:max-w-[1320px] xl:px-[120px]"
        aria-label="Blog posts"
      >
        {articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#005D51]/25 bg-white/80 px-6 py-12 text-center">
            <p className="font-poppins text-base font-semibold text-[#142218]">
              New stories are on the way
            </p>
            <p className="mx-auto mt-2 max-w-md font-lora text-xs leading-relaxed text-[#5a6570] sm:text-sm">
              There are no posts to show yet. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8 md:gap-10">
            {featured ? (
              <ArticleCard article={featured} variant="featured" />
            ) : null}

            {rest.length > 0 ? (
              <>
                <h2 className="font-poppins text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#005D51]">
                  More stories
                </h2>
                <ul className="grid w-full list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 sm:gap-6 lg:gap-8 xl:grid-cols-3 xl:gap-7">
                  {rest.map((article) => (
                    <li key={article.id} className="min-h-0 sm:min-h-[260px]">
                      <ArticleCard article={article} variant="grid" />
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
