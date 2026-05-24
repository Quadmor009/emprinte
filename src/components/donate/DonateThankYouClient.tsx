'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { Logo } from '@/components/ui/Logo';
import { DONATE_PAGE_COPY } from '@/constants/donate';
import { getSameOriginApiUrl } from '@/lib/api';

type DonationSummary = {
  fullName: string;
  amountNaira: number;
  booksCredited: number;
  paymentReference: string;
};

export function DonateThankYouClient() {
  const searchParams = useSearchParams();
  const attemptRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donation, setDonation] = useState<DonationSummary | null>(null);

  useEffect(() => {
    const reference =
      searchParams.get('reference')?.trim() || searchParams.get('trxref')?.trim() || '';
    if (!reference) {
      setLoading(false);
      setError('No payment reference found. If you paid, contact us with your Paystack receipt.');
      return;
    }
    if (attemptRef.current === reference) return;
    attemptRef.current = reference;

    void (async () => {
      try {
        const res = await fetch(getSameOriginApiUrl('donations/complete'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.completed) {
          setError(
            typeof data.error === 'string'
              ? data.error
              : 'We could not confirm your donation yet.',
          );
          return;
        }
        const d = data.donation;
        if (d && typeof d.fullName === 'string') {
          setDonation({
            fullName: d.fullName,
            amountNaira: typeof d.amountNaira === 'number' ? d.amountNaira : 0,
            booksCredited: typeof d.booksCredited === 'number' ? d.booksCredited : 0,
            paymentReference:
              typeof d.paymentReference === 'string' ? d.paymentReference : reference,
          });
        }
      } catch {
        setError('Could not confirm your donation. Check your connection and refresh.');
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  return (
    <main className="min-h-screen px-4 pb-16 pt-10 md:flex md:items-center md:justify-center md:py-16">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <Link href="/" className="mb-8 inline-flex" aria-label="Emprinte home">
          <Logo />
        </Link>

        <div className="w-full rounded-2xl border border-black/6 bg-white p-8 md:p-10">
          {loading ? (
            <p className="font-poppins text-sm text-[#4a5c50]">Confirming your donation…</p>
          ) : error ? (
            <>
              <p className="font-lora text-xl font-semibold text-[#142218]">Almost there</p>
              <p className="mt-4 font-poppins text-sm leading-relaxed text-[#4a5c50]">{error}</p>
              <p className="mt-4 font-poppins text-xs text-[#4a5c50]">
                Email{' '}
                <a
                  href={`mailto:${DONATE_PAGE_COPY.supportEmail}`}
                  className="text-[#005D51] underline"
                >
                  {DONATE_PAGE_COPY.supportEmail}
                </a>{' '}
                with your Paystack reference if payment succeeded.
              </p>
            </>
          ) : (
            <>
              <div
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#005D51]/15 bg-[#eef7f4] text-3xl text-[#005D51]"
                aria-hidden
              >
                ✓
              </div>
              <h1 className="font-lora text-2xl font-semibold leading-tight text-[#142218] md:text-3xl">
                {DONATE_PAGE_COPY.thankYouTitle}
              </h1>
              <p className="mt-4 font-poppins text-[15px] leading-relaxed text-[#4a5c50]">
                {DONATE_PAGE_COPY.thankYouBody}
              </p>
              {donation ? (
                <div className="mt-6 rounded-xl bg-[#f8fcfb] px-4 py-3 text-left font-poppins text-sm text-[#142218]">
                  <p>
                    <span className="text-[#4a5c50]">From:</span> {donation.fullName}
                  </p>
                  <p className="mt-1">
                    <span className="text-[#4a5c50]">Amount:</span> ₦
                    {donation.amountNaira.toLocaleString()}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[#4a5c50]">
                    Ref: {donation.paymentReference}
                  </p>
                  <p className="mt-3 text-[#005D51]">
                    {donation.booksCredited > 0
                      ? DONATE_PAGE_COPY.thankYouBooks(donation.booksCredited)
                      : DONATE_PAGE_COPY.thankYouNoBooks}
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>

        <Link
          href="/"
          className="mt-10 inline-flex min-h-[48px] items-center justify-center rounded-2xl border-2 border-[#142218]/10 bg-white px-8 font-poppins text-sm font-semibold text-[#142218] transition hover:border-[#005D51]/25"
        >
          {DONATE_PAGE_COPY.backHome}
        </Link>
      </div>
    </main>
  );
}
