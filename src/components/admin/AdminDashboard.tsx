'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { AdminDashboardProps, DashboardTile, Snapshot } from '@/types';
import { getSameOriginApiUrl } from '@/lib/api';

function StatSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      <div className="h-3 w-20 max-w-full rounded bg-[#005D51]/12" />
      <div className="h-10 w-28 max-w-[90%] animate-pulse rounded-lg bg-[#005D51]/10" />
      <div className="h-3.5 w-full max-w-[85%] rounded bg-[#005D51]/08" />
    </div>
  );
}

const tileAccent: Record<string, { bar: string; bg: string; icon: string }> = {
  blog: { bar: 'bg-[#005D51]', bg: 'bg-[#005D51]/[0.04]', icon: 'text-[#005D51]' },
  buildAReader: { bar: 'bg-[#e63715]', bg: 'bg-[#e63715]/[0.04]', icon: 'text-[#e63715]' },
  testimonials: { bar: 'bg-[#6b5cff]', bg: 'bg-[#6b5cff]/[0.04]', icon: 'text-[#6b5cff]' },
  settings: { bar: 'bg-[#0d8bd9]', bg: 'bg-[#0d8bd9]/[0.04]', icon: 'text-[#0d8bd9]' },
};

const tileIcons: Record<string, ReactNode> = {
  blog: (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
  ),
  buildAReader: (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.25-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
  ),
  testimonials: (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
  ),
  settings: (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ),
};

function MetricPill({
  label,
  value,
  sub,
  loading,
  accent,
  footer,
}: {
  label: string;
  value: string;
  sub?: string | null;
  loading: boolean;
  accent?: string;
  footer?: ReactNode;
}) {
  return (
    <div className="group flex min-h-full min-w-0 flex-col rounded-2xl border border-[#142218]/06 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(20,34,24,0.04)] transition hover:shadow-[0_4px_12px_rgba(20,34,24,0.06)]">
      <p className={`font-poppins text-[11px] font-semibold uppercase tracking-[0.12em] ${accent ?? 'text-[#142218]/40'}`}>
        {label}
      </p>
      {loading ? (
        <div className="mt-3 h-9 w-16 animate-pulse rounded-lg bg-[#005D51]/08" />
      ) : (
        <p className="mt-1.5 truncate font-poppins text-[1.75rem] font-bold tabular-nums leading-tight tracking-tight text-[#142218]">
          {value}
        </p>
      )}
      {sub && !loading ? (
        <p className="mt-1 truncate font-poppins text-xs font-medium text-[#5c6b5f]/80">{sub}</p>
      ) : null}
      {footer ? <div className="mt-auto min-w-0 pt-3">{footer}</div> : null}
    </div>
  );
}

export function AdminDashboard({ refreshKey, onManage }: AdminDashboardProps) {
  const [snap, setSnap] = useState<Snapshot>({
    booksCollected: null,
    testimonialCount: 0,
    contactEmail: null,
    totalBooks: null,
    insightCount: 0,
    loading: true,
    error: null,
  });
  const [loadRetry, setLoadRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [insRes, testRes, barRes, setRes] = await Promise.all([
          fetch(getSameOriginApiUrl('insights')),
          fetch(getSameOriginApiUrl('testimonials')),
          fetch(getSameOriginApiUrl('build-a-reader')),
          fetch(getSameOriginApiUrl('settings')),
        ]);

        const [ins, test, bar, set] = await Promise.all([
          insRes.json(),
          testRes.json(),
          barRes.json(),
          setRes.json(),
        ]);

        if (cancelled) return;

        setSnap({
          insightCount: Array.isArray(ins) ? ins.length : 0,
          testimonialCount: Array.isArray(test) ? test.length : 0,
          booksCollected: typeof bar?.booksCollected === 'number' ? bar.booksCollected : null,
          totalBooks: typeof bar?.totalBooks === 'number' ? bar.totalBooks : null,
          contactEmail: typeof set?.contactInfo?.email === 'string' ? set.contactInfo.email : null,
          loading: false,
          error: null,
        });
      } catch {
        if (!cancelled) {
          setSnap((s) => ({
            ...s,
            loading: false,
            error:
              'We could not load this overview. Check your connection or try again in a moment.',
          }));
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey, loadRetry]);

  const tiles: DashboardTile[] = [
    {
      key: 'blog',
      href: '/admin/blog',
      title: 'Blog',
      blurb: 'Stories and updates on /blog and anywhere they are featured.',
      statLabel: 'Articles',
      highlight: snap.loading ? '' : String(snap.insightCount),
      detail: snap.loading
        ? null
        : snap.insightCount === 0
          ? 'No articles yet — add your first one.'
          : snap.insightCount === 1
            ? 'article live'
            : 'articles live',
    },
    {
      key: 'buildAReader',
      manage: 'buildAReader',
      title: 'Build a Reader',
      blurb: 'Book drive progress, goal, and donation amount visitors see.',
      statLabel: 'Books collected',
      highlight:
        snap.loading || snap.booksCollected == null || snap.totalBooks == null
          ? ''
          : String(snap.booksCollected),
      detail:
        snap.loading || snap.booksCollected == null || snap.totalBooks == null
          ? null
          : `of ${snap.totalBooks} toward your goal`,
    },
    {
      key: 'testimonials',
      manage: 'testimonials',
      title: 'Testimonials',
      blurb: 'Reader quotes shown on the homepage.',
      statLabel: 'Quotes',
      highlight: snap.loading ? '' : String(snap.testimonialCount),
      detail: snap.loading
        ? null
        : snap.testimonialCount === 0
          ? 'None yet — add quotes when you are ready.'
          : snap.testimonialCount === 1
            ? 'quote on the site'
            : 'quotes on the site',
    },
    {
      key: 'settings',
      manage: 'settings',
      title: 'Site details',
      blurb: 'Navigation, footer, contact info, social links, and headline numbers.',
      statLabel: 'Primary email',
      highlight: snap.loading
        ? ''
        : snap.contactEmail
          ? snap.contactEmail.length > 36
            ? `${snap.contactEmail.slice(0, 34)}…`
            : snap.contactEmail
          : 'Not set',
      detail: snap.loading
        ? null
        : snap.contactEmail
          ? 'Shown to visitors'
          : 'Add email, links, and stats',
    },
  ];

  const bookProgressPct =
    !snap.loading &&
    snap.booksCollected != null &&
    snap.totalBooks != null &&
    snap.totalBooks > 0
      ? Math.min(100, Math.round((snap.booksCollected / snap.totalBooks) * 100))
      : null;

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Compact welcome header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-lora text-2xl font-semibold tracking-tight text-[#142218] md:text-[1.75rem]">
            Site overview
          </h1>
          <p className="mt-1.5 max-w-xl font-poppins text-sm leading-relaxed text-[#5c6b5f]">
            Manage homepage sections, book drive, quotes, and contact details.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#005D51]/20 bg-white px-4 py-2.5 font-poppins text-sm font-medium text-[#005D51] transition hover:border-[#005D51]/40 hover:bg-[#005D51]/05"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
          View live site
        </Link>
      </header>

      {snap.error ? (
        <div
          className="flex flex-col gap-4 rounded-2xl border border-red-200/80 bg-red-50/90 px-5 py-4 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p className="min-w-0">{snap.error}</p>
          <button
            type="button"
            onClick={() => {
              setSnap((s) => ({ ...s, loading: true, error: null }));
              setLoadRetry((n) => n + 1);
            }}
            className="shrink-0 rounded-lg border border-red-300/80 bg-white px-4 py-2 text-sm font-medium text-red-950 hover:bg-red-50"
          >
            Try again
          </button>
        </div>
      ) : null}

      {/* At-a-glance metrics */}
      <section aria-label="Key metrics" className="scroll-mt-4">
        <h2 className="sr-only">Key metrics</h2>
        <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <MetricPill
            label="Articles"
            value={snap.loading ? '—' : String(snap.insightCount)}
            sub="Live on /blog"
            accent="text-[#005D51]"
            loading={snap.loading}
          />
          <MetricPill
            label="Books collected"
            value={
              snap.loading || snap.booksCollected == null || snap.totalBooks == null
                ? '—'
                : `${snap.booksCollected} / ${snap.totalBooks}`
            }
            sub={bookProgressPct != null ? `${bookProgressPct}% of goal` : null}
            accent="text-[#e63715]"
            loading={snap.loading}
            footer={
              bookProgressPct != null && !snap.loading ? (
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-[#142218]/08"
                  role="progressbar"
                  aria-valuenow={bookProgressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progress toward book collection goal"
                >
                  <div
                    className="h-full rounded-full bg-[#e63715] transition-[width] duration-500"
                    style={{ width: `${bookProgressPct}%` }}
                  />
                </div>
              ) : null
            }
          />
          <MetricPill
            label="Quotes"
            value={snap.loading ? '—' : String(snap.testimonialCount)}
            sub="Homepage carousel"
            accent="text-[#6b5cff]"
            loading={snap.loading}
          />
          <Link
            href="/admin/newsletter"
            className="group flex min-h-full min-w-0 flex-col rounded-2xl border border-[#142218]/06 bg-white px-5 py-4 text-left shadow-[0_1px_3px_rgba(20,34,24,0.04)] transition hover:border-[#005D51]/25 hover:shadow-[0_4px_12px_rgba(0,93,81,0.08)]"
          >
            <p className="font-poppins text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0d8bd9]">
              Newsletter
            </p>
            <p className="mt-1.5 font-poppins text-[1.75rem] font-bold leading-tight tracking-tight text-[#142218]">
              View
            </p>
            <p className="mt-1 font-poppins text-xs font-medium text-[#5c6b5f]/80">
              Subscribers &amp; CSV export
            </p>
          </Link>
        </div>
      </section>

      {/* Content editors */}
      <section className="scroll-mt-4">
        <h2 className="mb-4 font-poppins text-xs font-bold uppercase tracking-[0.12em] text-[#142218]/40">
          Content editors
        </h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((t) => {
            const accent = tileAccent[t.key] ?? tileAccent.blog;
            const icon = tileIcons[t.key];

            const tileClassName = [
              'group relative flex w-full max-w-full flex-col overflow-hidden rounded-2xl border border-[#142218]/06 bg-white text-left shadow-[0_1px_3px_rgba(20,34,24,0.04)] transition duration-200',
              'hover:border-[#142218]/10 hover:shadow-[0_8px_30px_rgba(0,93,81,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005D51]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#eef5f2]',
            ].join(' ');

            const body = (
              <>
                {/* Colored top bar */}
                <div className={`h-1 w-full ${accent.bar}`} />
                <div className="flex flex-1 flex-col px-5 pb-5 pt-4 md:px-6">
                  {/* Icon + title row */}
                  <div className="flex items-center gap-3">
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${accent.bg} ${accent.icon}`}>
                      {icon}
                    </div>
                    <h3 className="font-lora text-base font-semibold text-[#142218]">{t.title}</h3>
                  </div>

                  {/* Stat */}
                  <div className="mt-4 min-h-10">
                    {snap.loading ? (
                      <StatSkeleton />
                    ) : (
                      <>
                        <div className="flex items-baseline gap-2">
                          <p className="font-poppins text-2xl font-bold tabular-nums leading-tight tracking-tight text-[#142218] wrap-anywhere">
                            {t.highlight}
                          </p>
                          {t.detail ? (
                            <p className="font-poppins text-xs font-medium text-[#5c6b5f]/80">
                              {t.detail}
                            </p>
                          ) : null}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-2 font-poppins text-[13px] leading-relaxed text-[#7B7B7B]">{t.blurb}</p>

                  {/* CTA */}
                  <span className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#005D51] px-4 py-2.5 font-poppins text-sm font-semibold text-white transition group-hover:bg-[#004438]">
                    {'href' in t ? 'Open blog' : 'Open editor'}
                    <span className="ml-1.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
                      &rarr;
                    </span>
                  </span>
                </div>
              </>
            );

            return (
              <li key={t.key} className="flex">
                {'href' in t ? (
                  <Link href={t.href} className={tileClassName} aria-label={`Open blog: ${t.title}`}>
                    {body}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => onManage(t.manage)}
                    className={tileClassName}
                    aria-label={`Open editor: ${t.title}`}
                  >
                    {body}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Getting started — compact checklist */}
      <section className="rounded-2xl border border-[#005D51]/10 bg-white px-5 py-5 shadow-[0_1px_3px_rgba(20,34,24,0.04)] sm:px-6 sm:py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#005D51]/08">
            <svg className="size-4 text-[#005D51]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          </div>
          <h2 className="font-poppins text-sm font-semibold text-[#142218]">
            Getting started
          </h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            'Set contact email & social links in Site details',
            'Add at least one homepage quote',
            'Publish your first blog post',
            'Check Newsletter after campaigns go live',
          ].map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 rounded-xl bg-[#f7faf8] px-3.5 py-3"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#005D51]/10 font-poppins text-[11px] font-bold text-[#005D51]">
                {i + 1}
              </span>
              <p className="font-poppins text-[13px] leading-snug text-[#4a5c50]">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
