'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useAdminInsights } from '@/hooks/admin/useAdminInsights';
import { articlePublicPath } from '@/lib/insight-slug';
import type { InsightArticle } from '@/types';

/** Matches `BlogArticleList` grid card shell (public blog). */
const adminBlogCardShell =
  'flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_0_rgba(0,93,81,0.05),0_8px_28px_-16px_rgba(20,34,24,0.12)] ring-1 ring-[#005D51]/[0.06] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-20px_rgba(20,34,24,0.16)] hover:ring-[#005D51]/15';

function CardGridSkeleton() {
  return (
    <ul
      className="grid list-none grid-cols-1 gap-6 p-5 sm:grid-cols-2 sm:gap-6 sm:p-6 lg:grid-cols-3 lg:gap-8"
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <li key={i} className="min-h-[260px]">
          <div
            className={`${adminBlogCardShell} animate-pulse ring-0 hover:translate-y-0 hover:shadow-[0_8px_28px_-16px_rgba(20,34,24,0.12)]`}
          >
            <div className="aspect-2/1 w-full bg-[#dfecea]" />
            <div className="flex flex-col gap-3 p-5">
              <div className="h-3 w-20 rounded bg-[#005D51]/15" />
              <div className="h-5 w-full max-w-[90%] rounded bg-[#142218]/10" />
              <div className="h-3 w-full rounded bg-[#142218]/08" />
              <div className="h-3 w-full rounded bg-[#142218]/08" />
              <div className="mt-4 flex gap-2 border-t border-[#005D51]/08 pt-4">
                <div className="h-9 flex-1 rounded-lg bg-[#005D51]/12" />
                <div className="h-9 flex-1 rounded-lg bg-[#142218]/08" />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function AdminBlogPostCard({
  article,
  onDelete,
}: {
  article: InsightArticle;
  onDelete: () => void;
}) {
  const path = articlePublicPath(article);
  const [imageBroken, setImageBroken] = useState(false);

  return (
    <article className={adminBlogCardShell}>
      <div className="relative aspect-2/1 w-full shrink-0 overflow-hidden bg-[#e4f2ef]">
        {imageBroken ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 px-4 text-center">
            <p className="font-poppins text-xs font-semibold text-[#005D51]">
              Image could not load
            </p>
            <p className="font-poppins text-[10px] leading-snug text-[#5a6570]">
              Edit this post and use Upload image, or fix the Image URL.
            </p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview; avoids Next image host rules on bad URLs
          <img
            src={article.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setImageBroken(true)}
          />
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-4 md:gap-2.5 md:p-5">
        <p className="font-poppins text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#005D51]">
          <time dateTime={article.date}>{article.date}</time>
        </p>
        <h2 className="line-clamp-2 font-lora text-base font-bold leading-snug text-[#142218] md:text-lg">
          {article.title}
        </h2>
        <p className="line-clamp-3 font-poppins text-xs leading-relaxed text-[#5a6570] md:text-sm">
          {article.description}
        </p>
        <p className="font-mono text-[10px] leading-tight text-[#8a9399]">
          /blog/{path}
        </p>

        <div className="mt-auto flex flex-col gap-3 border-t border-[#005D51]/08 pt-4">
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/blog/edit?id=${encodeURIComponent(article.id)}`}
              className="inline-flex min-w-22 flex-1 items-center justify-center rounded-lg bg-[#005D51] px-3 py-2.5 text-center font-poppins text-xs font-semibold text-white transition hover:bg-[#004438] sm:flex-none sm:px-4"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex min-w-22 flex-1 items-center justify-center rounded-lg border border-red-200/90 bg-white px-3 py-2.5 font-poppins text-xs font-semibold text-red-700 transition hover:bg-red-50 sm:flex-none sm:px-4"
            >
              Delete
            </button>
          </div>
          <Link
            href={`/blog/${encodeURIComponent(path)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#005D51]/20 bg-[#F0FFFD]/80 px-3 py-2 font-poppins text-xs font-semibold text-[#005D51] transition hover:border-[#005D51]/35 hover:bg-[#005D51]/08"
          >
            View live post
            <span aria-hidden className="text-sm leading-none">
              ↗
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function AdminInsightsPanel() {
  const { listLoading, remove, list } = useAdminInsights();

  return (
    <div className="space-y-10">
      <section
        aria-labelledby="blog-posts-list-heading"
        className="overflow-hidden rounded-2xl border border-[#005D51]/12 bg-white shadow-[0_1px_2px_rgba(20,34,24,0.04)]"
      >
        <div className="flex flex-col gap-4 border-b border-[#005D51]/10 bg-[#F0FFFD]/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <h2
              id="blog-posts-list-heading"
              className="font-lora text-lg font-semibold text-[#142218]"
            >
              All posts
            </h2>
            <p className="mt-1 font-poppins text-sm font-medium text-[#7B7B7B]">
              Open the full-page editor to write with rich formatting—same layout
              as the public blog.
            </p>
          </div>
          <Link
            href="/admin/blog/edit"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#005D51] px-5 py-2.5 text-center font-poppins text-sm font-semibold text-white shadow-[0_1px_2px_rgba(20,34,24,0.08)] transition hover:bg-[#004438] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005D51]/40 focus-visible:ring-offset-2"
          >
            New post
          </Link>
        </div>

        <div className="bg-[#f4faf8]">
          {listLoading ? (
            <CardGridSkeleton />
          ) : list.length === 0 ? (
            <div className="px-5 py-12 text-center sm:px-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-[#005D51]/20 bg-[#F0FFFD] text-[#005D51]">
                <svg
                  className="h-7 w-7 opacity-90"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <p className="font-lora text-base font-semibold text-[#142218]">
                No posts yet
              </p>
              <p className="mx-auto mt-2 max-w-md font-poppins text-sm font-medium leading-relaxed text-[#7B7B7B]">
                Use <span className="font-semibold text-[#142218]">New post</span> to
                open the editor and publish your first story.
              </p>
            </div>
          ) : (
            <ul className="grid list-none grid-cols-1 gap-6 p-5 sm:grid-cols-2 sm:gap-6 sm:p-6 lg:grid-cols-3 lg:gap-8 lg:p-8">
              {list.map((row) => (
                <li key={row.id} className="min-h-0 sm:min-h-[260px]">
                  <AdminBlogPostCard
                    article={row}
                    onDelete={() => remove(row.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
