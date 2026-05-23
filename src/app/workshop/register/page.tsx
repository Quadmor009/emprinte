import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { WorkshopRegistrationWizard } from '@/components/workshop/WorkshopRegistrationWizard';
import {
  DEFAULT_WORKSHOP_SLUG,
  pageCopyFromWorkshop,
} from '@/constants/workshop-registration';
import { Logo } from '@/components/ui/Logo';
import { fetchWorkshopBySlug } from '@/lib/landing-workshops-db';

type PageProps = {
  searchParams: Promise<{ slug?: string }>;
};

function WorkshopRegisterFallback() {
  return (
    <main className="flex min-h-[40vh] items-center justify-center px-4">
      <p className="font-poppins text-sm text-[#4a5c50]">Loading registration…</p>
    </main>
  );
}

/** Workshop sign-up and payment happen on the web only; the app links here. */
export default async function WorkshopRegisterPage({ searchParams }: PageProps) {
  const { slug: slugParam } = await searchParams;
  const slug = (slugParam?.trim() || DEFAULT_WORKSHOP_SLUG).toLowerCase();
  const workshop = await fetchWorkshopBySlug(slug);

  if (!workshop || !workshop.registrationOpen) {
    notFound();
  }

  const pageCopy = pageCopyFromWorkshop(workshop);

  return (
    <main className="min-h-screen px-4 pb-28 pt-6 md:pb-32 md:pt-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-5 inline-flex" aria-label="Emprinte home">
            <Logo />
          </Link>
          <p className="font-poppins text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005D51]/85 sm:text-xs sm:tracking-[0.2em]">
            {pageCopy.kicker}
          </p>
          <h1 className="mt-2 font-lora text-2xl font-semibold leading-tight text-[#142218] md:text-3xl">
            {pageCopy.title}
          </h1>
          <p className="mx-auto mt-2 max-w-md font-poppins text-sm leading-relaxed text-[#4a5c50]">
            {pageCopy.lead}
          </p>
        </header>

        <Suspense fallback={<WorkshopRegisterFallback />}>
          <WorkshopRegistrationWizard workshop={workshop} pageCopy={pageCopy} />
        </Suspense>
      </div>
    </main>
  );
}
