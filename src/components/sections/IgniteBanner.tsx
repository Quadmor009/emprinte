'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';

import { IgniteRegisterModal } from '@/components/ignite/IgniteRegisterModal';
import { contactInfo as defaultContact } from '@/constants/data';

const actionWidthClassName = 'w-full max-w-[360px] sm:w-[360px]';

const primaryButtonClassName =
  'inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#E63715] px-5 font-poppins text-base font-semibold text-white transition-colors hover:bg-[#c42e12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2';

const secondaryButtonClassName =
  'inline-flex h-12 w-full items-center justify-center rounded-xl border border-white px-5 font-poppins text-sm font-semibold leading-tight text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 sm:text-base';

type IgniteBannerProps = {
  contactEmail?: string;
};

export function IgniteBanner({
  contactEmail = defaultContact.email,
}: IgniteBannerProps) {
  const [registerOpen, setRegisterOpen] = useState(false);

  const openRegister = useCallback(() => setRegisterOpen(true), []);
  const closeRegister = useCallback(() => setRegisterOpen(false), []);

  const openContact = useCallback(() => {
    window.open(`mailto:${encodeURIComponent(contactEmail)}`, '_blank');
  }, [contactEmail]);

  return (
    <section id="ignite" aria-labelledby="ignite-banner-title" className="w-full">
      <h2 id="ignite-banner-title" className="sr-only">
        IGNITE — A gathering of Readers and Leaders, September 2026
      </h2>

      <div className="relative w-full">
        <Image
          src="/ignite-banner/background.png"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />

        <div className="absolute inset-x-0 top-8 z-20">
          <div className="mx-auto flex w-full max-w-[1200px] justify-center px-4 sm:px-6 md:px-8 lg:-translate-x-8 lg:justify-end xl:px-0">
            <Image
              src="/ignite-banner/date-card.png"
              alt="September 2026"
              width={286}
              height={76}
              className="h-auto w-full max-w-[200px] sm:max-w-[220px]"
            />
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 pb-8 pt-[104px] sm:px-6 sm:pb-10 sm:pt-[104px] md:px-8 lg:pb-11 lg:pt-[52px] xl:px-0">
          <div className="grid grid-cols-1 justify-items-center gap-9 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:justify-items-stretch lg:gap-12">
            <div className="flex w-fit max-w-full flex-col items-center gap-1 text-center lg:w-full lg:min-w-0 lg:max-w-full lg:justify-self-stretch">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ignite-banner/logo-mark.svg"
                alt=""
                width={620}
                height={355}
                className="block h-auto w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[75%]"
                decoding="async"
              />
              <p className="w-full text-center font-poppins text-[20px] font-medium leading-snug text-white">
                A gathering of Readers and Leaders
              </p>
            </div>

            <div
              className={`mx-auto flex shrink-0 flex-col items-center gap-2.5 lg:mx-0 lg:-translate-x-8 lg:-translate-y-2 lg:items-end lg:justify-self-end lg:self-end ${actionWidthClassName}`}
            >
              <div className="flex w-full flex-col gap-2.5">
                <button type="button" onClick={openRegister} className={primaryButtonClassName}>
                  Book A Spot
                </button>
                <button type="button" onClick={openContact} className={secondaryButtonClassName}>
                  Sponsorship, Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <IgniteRegisterModal open={registerOpen} onClose={closeRegister} />
    </section>
  );
}
