'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';

import { IgniteRegisterModal } from '@/components/ignite/IgniteRegisterModal';
import { contactInfo as defaultContact } from '@/constants/data';

const primaryButtonClassName =
  'inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#E63715] px-6 font-poppins text-base font-semibold text-white transition-colors hover:bg-[#c42e12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2';

const secondaryButtonClassName =
  'inline-flex h-12 w-full items-center justify-center rounded-xl border border-white px-6 font-poppins text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2';

const ctaOverlayClassName =
  'absolute cursor-pointer rounded-xl border-0 bg-transparent p-0 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2';

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

      {/* Mobile: stacked layout */}
      <div className="relative min-h-[640px] w-full lg:hidden">
        <Image
          src="/ignite-banner/background.png"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />

        <div className="relative z-10 flex flex-col items-center gap-8 px-6 py-10">
          <Image
            src="/ignite-banner/date-card.png"
            alt="September 2026"
            width={286}
            height={76}
            className="h-auto w-[220px]"
          />

          <div className="flex w-full max-w-[400px] flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ignite-banner/logo-mark.svg"
              alt=""
              width={630}
              height={430}
              className="h-auto w-full"
              decoding="async"
            />
            <p className="text-center font-poppins text-sm font-medium text-white sm:text-base">
              A gathering of Readers and Leaders
            </p>
          </div>

          <div className="flex w-full max-w-[393px] flex-col gap-3">
            <button type="button" onClick={openRegister} className={primaryButtonClassName}>
              Book A Spot
            </button>
            <button type="button" onClick={openContact} className={secondaryButtonClassName}>
              Sponsorship, Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: full-width banner artwork */}
      <div className="relative hidden w-full lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/ignite-banner/banner.svg"
          alt=""
          width={1440}
          height={548}
          className="block h-auto w-full"
          decoding="async"
        />

        <button
          type="button"
          onClick={openRegister}
          className={`${ctaOverlayClassName} left-[64.2%] top-[62.4%] h-[11.7%] w-[27.3%]`}
          aria-label="Book a spot at IGNITE 2026"
        />

        <button
          type="button"
          onClick={openContact}
          className={`${ctaOverlayClassName} left-[64.3%] top-[77.1%] h-[11.5%] w-[27.2%]`}
          aria-label="Contact us about IGNITE sponsorship"
        />
      </div>

      <IgniteRegisterModal open={registerOpen} onClose={closeRegister} />
    </section>
  );
}
