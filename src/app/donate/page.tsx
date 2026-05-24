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
      <div className="mx-auto max-w-lg">
        <header className="mb-8 flex flex-col items-center text-center">
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
    </main>
  );
}
