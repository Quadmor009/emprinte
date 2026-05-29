'use client';

import Link from 'next/link';

import { membershipApplyHref } from '@/constants/apply';

export function Hero() {
  const applyHref = membershipApplyHref();
  return (
    <section className="w-full bg-white py-6 xl:px-0 px-6 md:pb-16 md:pt-0 md:px-8 xl:min-h-[820px] max-w-[1200px] mx-auto flex">
      <div className="max-w-[390px] md:max-w-7xl mx-auto flex flex-col items-center gap-6 md:gap-12 flex-1 ">
        <div className="w-full pb-6 flex flex-col md:flex-row-reverse items-start md:items-center justify-between gap-5 md:gap-12 lg:gap-16">
          <div
            className="relative w-full h-[367px] lg:h-[500px] xl:h-[746px] lg:w-[450px] xl:w-[630px]"
            aria-label="Emprinte Readers Hub members reading together"
          >
            <img
              src="/hero1.png"
              alt="Emprinte reader with books at a community reading event"
              className="absolute left-0 top-[101px] lg:top-[140px] xl:top-[264px] w-[153px] lg:w-[240px] lg:h-[360px] xl:w-[282px] xl:h-[460px] h-[266px] object-cover rounded-[2162px_2162px_13px_13px] border border-white"
            />
            <img
              src="/hero2.png"
              alt="Young reader smiling while holding a book outdoors"
              className="absolute left-[65px] xl:left-[121px] top-0 w-[153px] lg:w-[240px] lg:h-[360px] xl:w-[282px] xl:h-[460px] h-[249px] object-cover rounded-[0_0_2162px_2162px] border border-white"
            />
            <img
              src="/hero3.png"
              alt="Emprinte book club member reading with friends"
              className="absolute left-[188px] xl:left-[350px] top-[57px] xl:top-[101px] w-[153px] lg:w-[240px] lg:h-[360px] xl:w-[282px] xl:h-[460px] h-[263px] object-cover rounded-[2162px_2162px_13px_13px] border border-white"
            />
          </div>

          <div className="flex flex-col items-start gap-4 min-w-[300px] w-full xl:w-[519px] max-w-[520px] h-fit flex-1">
            <div className="flex flex-col items-start gap-2">
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
            </div>

            <Link
              href={applyHref}
              className="lg:h-[56px] h-10 lg:px-10 px-5 flex justify-center items-center gap-2.5 rounded-lg font-medium transition-colors bg-[#005D51] text-white hover:bg-[#004438] text-base lg:text-xl leading-[150%] font-poppins w-full max-w-[276px]"
            >
              Join Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
