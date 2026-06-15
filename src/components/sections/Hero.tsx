'use client';

import Image from 'next/image';
import Link from 'next/link';

import { AnimateOnView } from '@/components/motion/AnimateOnView';
import { membershipApplyHref } from '@/constants/apply';
import { hoverLiftClass } from '@/lib/motion';

const HERO_PHOTOS = [
  {
    src: '/hero1.png',
    alt: 'Emprinte reader with books at a community reading event',
    className:
      'absolute left-0 top-[109px] lg:top-[148px] xl:top-[272px] w-[153px] lg:w-[240px] lg:h-[360px] xl:w-[282px] xl:h-[460px] h-[266px] overflow-hidden object-cover rounded-[2162px_2162px_13px_13px] border border-white',
    delayMs: 0,
  },
  {
    src: '/hero2.png',
    alt: 'Young reader smiling while holding a book outdoors',
    className:
      'absolute left-[65px] xl:left-[121px] top-2 lg:top-2 xl:top-2 w-[153px] lg:w-[240px] lg:h-[360px] xl:w-[282px] xl:h-[460px] h-[249px] overflow-hidden object-cover rounded-[0_0_2162px_2162px] border border-white',
    delayMs: 120,
  },
  {
    src: '/hero3.png',
    alt: 'Emprinte book club member reading with friends',
    className:
      'absolute left-[188px] xl:left-[350px] top-[65px] xl:top-[109px] w-[153px] lg:w-[240px] lg:h-[360px] xl:w-[282px] xl:h-[460px] h-[263px] overflow-hidden object-cover rounded-[2162px_2162px_13px_13px] border border-white',
    delayMs: 240,
  },
] as const;

export function Hero() {
  const applyHref = membershipApplyHref();
  return (
    <section className="w-full bg-white py-6 xl:px-0 px-6 md:pb-16 md:pt-0 md:px-8 xl:min-h-[820px] max-w-[1200px] mx-auto flex">
      <div className="max-w-[390px] md:max-w-7xl mx-auto flex flex-col items-center gap-6 md:gap-12 flex-1 ">
        <div className="w-full pb-6 flex flex-col md:flex-row-reverse items-start md:items-center justify-between gap-5 md:gap-12 lg:gap-16">
          <div
            className="relative w-full h-[399px] shrink-0 overflow-visible lg:h-[532px] xl:h-[778px] lg:w-[450px] xl:w-[630px]"
            aria-label="Emprinte Readers Hub members reading together"
          >
            {HERO_PHOTOS.map((photo) => (
              <AnimateOnView
                key={photo.src}
                immediate
                delayMs={photo.delayMs}
                className={photo.className}
              >
                <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 1024px) 153px, (max-width: 1280px) 240px, 282px" className="object-cover" priority={photo.delayMs === 0} />
              </AnimateOnView>
            ))}
          </div>

          <div className="flex flex-col items-start gap-4 min-w-[300px] w-full xl:w-[519px] max-w-[520px] h-fit flex-1">
            <AnimateOnView immediate className="flex flex-col items-start gap-2">
              <h1 className="text-[32px] md:text-[36px] lg:text-[52px] xl:text-[64px] leading-snug font-bold text-[#142218] font-lora">
                <span className="text-[#142218]">
                  Transforming <br /> Africa,
                </span>{' '}
                <span className="text-[#005D51]">
                  One Book
                  <br className="md:hidden block lg:block xl:hidden" /> at a
                  Time
                </span>
              </h1>
              <p className="text-base leading-[130%] font-medium text-[#7B7B7B] font-poppins">
                Join Emprinte Readers Hub – Where Books Connect, Inspire, and
                Change Lives.
              </p>
            </AnimateOnView>

            <AnimateOnView immediate delayMs={200}>
              <Link
                href={applyHref}
                className={`lg:h-[56px] h-10 lg:px-10 px-5 flex justify-center items-center gap-2.5 rounded-lg font-medium transition-colors bg-[#005D51] text-white hover:bg-[#004438] text-base lg:text-xl leading-[150%] font-poppins w-full max-w-[276px] ${hoverLiftClass}`}
              >
                Join Now
              </Link>
            </AnimateOnView>
          </div>
        </div>
      </div>
    </section>
  );
}
