'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { BuildAReaderSlideshow } from '../ui/BuildAReaderSlideshow';
import { BookProgressProps } from '@/types';
import { BookIcon } from './BookIcon';
import { getSameOriginApiUrl } from '@/lib/api';
import { Badge } from '../ui';

export function BookClub() {
  const [bookProgress, setBookProgress] = useState<BookProgressProps>();
  const collected = bookProgress?.booksCollected ?? 0;
  const total = bookProgress?.totalBooks ?? 0;
  const progressPercent =
    total > 0 ? Math.min((collected / total) * 100, 100) : 0;

  useEffect(() => {
    const fetchBookProgress = async () => {
      const res = await fetch(getSameOriginApiUrl('build-a-reader'), {
        cache: 'no-store',
      });
      const data = await res.json();
      const slides = Array.isArray(data?.slideshowUrls)
        ? data.slideshowUrls.filter(
            (s: unknown): s is string =>
              typeof s === 'string' && /^https?:\/\//i.test(s.trim()),
          )
        : [];
      setBookProgress({
        booksCollected: typeof data?.booksCollected === 'number' ? data.booksCollected : 0,
        totalBooks: typeof data?.totalBooks === 'number' ? data.totalBooks : 0,
        pricePerBook: typeof data?.pricePerBook === 'number' ? data.pricePerBook : 0,
        slideshowUrls: slides.map((s: string) => s.trim()).slice(0, 5),
      });
    };
    fetchBookProgress();
  }, []);

  return (
    <section
      id="initiatives"
      className="w-full bg-[url(/map-green.png)] bg-cover bg-center px-6 py-10 lg:px-[75px] xl:px-[120px]"
    >
      {/* Match Initiatives / site grid: symmetric gutters + full-width 1200px rail. */}
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-10 lg:grid-cols-[minmax(0,550px)_minmax(0,1fr)] lg:items-stretch lg:gap-x-12 lg:gap-y-0 xl:gap-x-14">
        <div className="flex min-h-[280px] w-full min-w-0 flex-col lg:min-h-0 lg:h-full">
          <BuildAReaderSlideshow fillColumn urls={bookProgress?.slideshowUrls} />
        </div>

        <div className="flex min-h-0 min-w-0 flex-col gap-8 lg:h-full lg:justify-start">
          <div className="flex w-full max-w-[640px] flex-col gap-8 xl:max-w-2xl">
            <Badge>Explore our Initiatives</Badge>

            <div className="flex flex-col gap-1 text-white">
              <span className="font-poppins text-base xl:text-2xl">Ongoing Initiative..</span>
              <div className="flex items-end">
                <p className="max-w-[255px] font-lora text-6xl font-bold leading-[0.9] xl:max-w-[351px] xl:text-[82px]">
                  BUILD A READER
                </p>
                <span className="font-lora text-2xl font-bold xl:text-5xl">2.0</span>
              </div>
            </div>

            <div className="flex w-full max-w-full flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="font-poppins text-3xl font-bold text-white xl:text-5xl">
                    {bookProgress?.booksCollected ?? '--'}
                  </span>
                  <span className="ml-1 font-poppins text-sm font-medium text-white/90 xl:ml-2 xl:text-lg">
                    of {bookProgress?.totalBooks ?? '--'} Books
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <BookIcon size={24} />
                  <span className="font-poppins text-base font-medium xl:text-[28px]">
                    N{bookProgress?.pricePerBook?.toLocaleString() ?? '--'}/BOOK
                  </span>
                </div>
              </div>
              <div className="relative w-full">
                <div className="h-6 w-full overflow-hidden rounded-full border-4 border-white bg-white md:h-8">
                  <div
                    className="h-full rounded-full bg-[#ed4e32] transition-all"
                    style={{ width: `${progressPercent ?? 0}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between font-poppins text-sm font-medium text-white xl:text-base">
                  {[0, 100, 200, 300, 400, bookProgress?.totalBooks].map((n, idx) => (
                    <span key={idx}>{n}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex w-full max-w-full flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/donate"
                className="flex h-10 w-full items-center justify-center rounded-xl bg-[#E63715] font-medium text-white xl:h-16 xl:text-2xl"
              >
                Donate Now
              </Link>
              <Link
                href="/build-a-reader"
                className="flex h-10 w-full items-center justify-center rounded-xl border border-white bg-transparent font-medium text-white xl:h-16 xl:text-2xl"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
