import Link from 'next/link';

import { DonateForm } from '@/components/donate/DonateForm';
import { Logo } from '@/components/ui/Logo';
import { DONATE_PAGE_COPY } from '@/constants/donate';
import { fetchBuildAReaderRow } from '@/lib/landing-build-a-reader-db';

export const metadata = {
  title: 'Donate | #BuildAReader | Emprinte Readers Hub',
  description:
    'Support #BuildAReader with a secure Paystack donation. Fund books for young readers across our communities.',
};

export default async function DonatePage() {
  const campaign = await fetchBuildAReaderRow();
  const pricePerBook = campaign?.pricePerBook ?? 2500;

  return (
    <main className="min-h-screen px-4 pb-28 pt-6 md:pb-32 md:pt-10">
      <header className="mx-auto mb-8 flex max-w-3xl flex-col items-center text-center">
        <Link href="/" className="mb-5 inline-flex" aria-label="Emprinte home">
          <Logo />
        </Link>
        <p className="font-poppins text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005D51]/85 sm:text-xs sm:tracking-[0.2em]">
          {DONATE_PAGE_COPY.kicker}
        </p>
        <h1 className="mt-2 font-lora text-2xl font-semibold leading-tight text-[#142218] md:text-3xl">
          {DONATE_PAGE_COPY.title}
        </h1>
        <p className="mx-auto mt-2 max-w-md font-poppins text-sm leading-relaxed text-[#4a5c50]">
          {DONATE_PAGE_COPY.lead}
        </p>
      </header>

      <div className="mx-auto max-w-3xl lg:flex lg:items-start lg:gap-8">
        {/* Form — main column */}
        <div className="min-w-0 flex-1 lg:max-w-lg">
          {/* Disclaimer inline on mobile only */}
          <div className="mb-8 rounded-xl border border-[#005D51]/15 bg-[#f8fcfb] px-4 py-3 font-poppins text-sm leading-relaxed text-[#4a5c50] lg:hidden">
            {DONATE_PAGE_COPY.disclaimer}
          </div>

          <DonateForm pricePerBook={pricePerBook} />

          <p className="mt-8 text-center">
            <Link
              href="/build-a-reader"
              className="font-poppins text-sm font-medium text-[#005D51] underline underline-offset-2"
            >
              {DONATE_PAGE_COPY.learnMore}
            </Link>
          </p>
        </div>

        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block lg:w-72 lg:shrink-0">
          <div className="sticky top-10 space-y-5">
            <div className="rounded-2xl border border-[#005D51]/12 bg-[#f8fcfb] px-5 py-5 shadow-[0_1px_3px_rgba(20,34,24,0.04)]">
              <p className="mb-2 font-poppins text-xs font-bold uppercase tracking-[0.12em] text-[#005D51]">
                About this campaign
              </p>
              <p className="font-poppins text-[13px] leading-relaxed text-[#4a5c50]">
                {DONATE_PAGE_COPY.disclaimer}
              </p>
            </div>
            <div className="rounded-2xl border border-[#142218]/06 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(20,34,24,0.04)]">
              <p className="mb-1 font-poppins text-xs font-bold uppercase tracking-[0.12em] text-[#142218]/40">
                Questions?
              </p>
              <Link
                href={`mailto:${DONATE_PAGE_COPY.supportEmail}`}
                className="font-poppins text-sm font-medium text-[#005D51] underline underline-offset-2"
              >
                {DONATE_PAGE_COPY.supportEmail}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
