'use client';

import { AnimateOnView } from '@/components/motion/AnimateOnView';
import { Badge } from '@/components/ui';
import { NewsletterSubscribeForm } from '@/components/sections/NewsletterSubscribeForm';

export function Newsletter() {
  return (
    <section className="w-full bg-linear-to-b from-[#142218] via-[#142218] to-[#0f1a12] px-6 py-12 md:px-8 md:py-16 xl:px-[120px] lg:px-16 xl:py-[100px]">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-x-16 xl:gap-x-24 lg:items-start">
          <AnimateOnView className="flex max-w-xl flex-col gap-5 md:gap-6">
          <header className="flex flex-col gap-5 md:gap-6">
            <Badge>Join our newsletter</Badge>

            <div className="flex flex-col gap-3 md:gap-4">
              <h2 className="font-lora text-[1.75rem] font-semibold leading-tight text-white md:text-[2.25rem] md:leading-[1.15] xl:text-[2.5rem]">
                Stories, initiatives, and what we&apos;re reading next
              </h2>
              <p className="max-w-[36ch] font-poppins text-base font-medium leading-relaxed text-white/88 md:text-lg md:leading-relaxed">
                Leave your details and we&apos;ll share updates on programmes,
                events, and the communities we serve—no spam.
              </p>
            </div>

            <p className="font-poppins text-sm leading-snug text-white/50">
              We only use this information to stay in touch. You can ask us to
              stop at any time.
            </p>
          </header>
          </AnimateOnView>

          <AnimateOnView delayMs={120} className="lg:pt-1">
            <NewsletterSubscribeForm idPrefix="newsletter" />
          </AnimateOnView>
        </div>
      </div>
    </section>
  );
}
