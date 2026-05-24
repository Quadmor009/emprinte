import { Suspense } from 'react';

import { DonateThankYouClient } from '@/components/donate/DonateThankYouClient';

function ThankYouFallback() {
  return (
    <main className="flex min-h-[40vh] items-center justify-center px-4">
      <p className="font-poppins text-sm text-[#4a5c50]">Loading…</p>
    </main>
  );
}

export default function DonateThankYouPage() {
  return (
    <Suspense fallback={<ThankYouFallback />}>
      <DonateThankYouClient />
    </Suspense>
  );
}
