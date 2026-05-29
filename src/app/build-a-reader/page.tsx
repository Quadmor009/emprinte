import type { Metadata } from 'next';
import Image from 'next/image';

import { BuildAReaderClosingCta } from '@/components/build-a-reader/BuildAReaderClosingCta';
import { BuildAReaderFaq } from '@/components/build-a-reader/BuildAReaderFaq';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  BUILD_A_READER_FAQ,
  faqAnswerToPlainText,
} from '@/constants/build-a-reader-faq';
import { faqPageJsonLd } from '@/lib/seo/json-ld';
import { buildPageMetadata } from '@/lib/seo/site';
import { getSiteSettings } from '@/lib/site-settings-server';

export const metadata: Metadata = buildPageMetadata({
  title: '#BuildAReader Partnership Proposal',
  description:
    'Partnership proposal for #BuildAReader: making readers out of Africa for transformational leadership through books, mentorship, and impact.',
  path: '/build-a-reader',
});

const shell =
  'mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-[75px] xl:max-w-[1320px] xl:px-[120px]';

const p =
  'font-poppins text-sm leading-[1.75] text-[#2d3640] sm:text-base sm:leading-[1.72]';

/** PDF pages 2–9 as images (page 1 omitted—hero; page 10 omitted—closing CTA). */
const DECK_FIRST_SLIDE = 2;
const DECK_LAST_SLIDE = 9;
const DECK_SLIDE_COUNT = DECK_LAST_SLIDE - DECK_FIRST_SLIDE + 1;
const deckSlideSrc = (pdfPage: number) =>
  `/build-a-reader-slides/slide-${String(pdfPage).padStart(2, '0')}.jpg`;

export default async function BuildAReaderProposalPage() {
  const settings = await getSiteSettings();
  const faqSchema = faqPageJsonLd(
    BUILD_A_READER_FAQ.map((item) => ({
      question: item.question,
      answer: faqAnswerToPlainText(item.answer),
    })),
  );

  return (
    <main className="relative flex min-h-screen w-full flex-col bg-white">
      <JsonLd data={faqSchema} />
      <Header contactEmail={settings.contactInfo.email} />

      <article className="w-full flex-1 pb-14 pt-8 md:pb-16 md:pt-10">
        {/* Hero */}
        <div className="w-full bg-[url(/map-green.png)] bg-cover bg-center px-5 py-12 text-white sm:px-8 lg:px-[75px] xl:px-[120px]">
          <div className={`${shell} max-w-[900px]`}>
            <p className="font-poppins text-sm font-medium text-white/90">
              Emprinte Readers Hub
            </p>
            <h1 className="mt-2 font-lora text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              #BuildAReader
            </h1>
            <p className="mt-4 max-w-2xl font-poppins text-base text-white/95 sm:text-lg">
              Making Readers out of Africa for Transformational Leadership — Partnership
              Proposal
            </p>
            <div className="mt-6 flex flex-wrap gap-4 font-poppins text-sm text-white/90">
              <a
                href="https://www.emprintereaders.com"
                className="underline-offset-2 hover:underline"
              >
                www.emprintereaders.com
              </a>
              <span className="hidden sm:inline" aria-hidden>
                ·
              </span>
              <a
                href="mailto:projects@emprintereaders.com"
                className="underline-offset-2 hover:underline"
              >
                projects@emprintereaders.com
              </a>
            </div>
          </div>
        </div>

        <section
          aria-labelledby="deck-heading"
          className="w-full border-b border-[#005D51]/10 bg-white px-5 py-10 sm:px-8 lg:px-[75px] xl:px-[120px]"
        >
          <div className="mx-auto w-full max-w-[1100px]">
            <h2
              id="deck-heading"
              className="font-lora text-2xl font-bold text-[#142218] sm:text-3xl"
            >
              Full proposal deck
            </h2>
            <p className={`${p} mt-3 max-w-2xl text-[#5a6570]`}>
              Eight slides from the partnership PDF (pages 2–9)—then a single next step so nothing
              repeats the hero above or the contact block in the footer.
            </p>
            <div className="mt-8 flex flex-col gap-[8px]">
              {Array.from({ length: DECK_SLIDE_COUNT }, (_, i) => {
                const pdfPage = DECK_FIRST_SLIDE + i;
                const deckPosition = i + 1;
                return (
                  <figure
                    key={pdfPage}
                    className="overflow-hidden rounded-2xl border border-[#005D51]/12 bg-white"
                  >
                    <Image
                      src={deckSlideSrc(pdfPage)}
                      alt={`#BuildAReader partnership proposal, deck slide ${deckPosition} of ${DECK_SLIDE_COUNT}`}
                      width={2400}
                      height={1350}
                      sizes="(max-width: 1100px) 100vw, 1100px"
                      className="h-auto w-full"
                      priority={deckPosition === 1}
                    />
                  </figure>
                );
              })}
              <BuildAReaderFaq embedded />
              <BuildAReaderClosingCta />
            </div>
          </div>
        </section>
      </article>

      <Footer contactInfo={settings.contactInfo} />
    </main>
  );
}
