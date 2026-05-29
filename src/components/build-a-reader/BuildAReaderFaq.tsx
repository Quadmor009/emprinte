'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  BUILD_A_READER_FAQ,
  type BuildAReaderFaqPart,
} from '@/constants/build-a-reader-faq';

function FaqAnswer({ parts }: { parts: BuildAReaderFaqPart[] }) {
  return (
    <p className="font-poppins text-sm leading-[1.75] text-[#5a6570] sm:text-base sm:leading-[1.72]">
      {parts.map((part, i) => {
        if (typeof part === 'string') {
          return <span key={i}>{part}</span>;
        }
        if (part.href.startsWith('mailto:') || part.external) {
          return (
            <a
              key={i}
              href={part.href}
              className="font-medium text-[#005D51] underline-offset-2 hover:underline"
            >
              {part.label}
            </a>
          );
        }
        return (
          <Link
            key={i}
            href={part.href}
            className="font-medium text-[#005D51] underline-offset-2 hover:underline"
          >
            {part.label}
          </Link>
        );
      })}
    </p>
  );
}

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mt-8 -mx-5 border-y border-[#005D51]/10 sm:-mx-8">
      {BUILD_A_READER_FAQ.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `bar-faq-panel-${index}`;
        const buttonId = `bar-faq-trigger-${index}`;

        return (
          <div
            key={item.question}
            className="border-b border-[#005D51]/10 last:border-b-0"
          >
            <h3 className="m-0">
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className={[
                  'flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors sm:px-8 sm:py-6',
                  isOpen ? 'bg-[#f0fffd]' : 'hover:bg-[#f0fffd]',
                ].join(' ')}
              >
                <span className="font-poppins text-base font-semibold leading-snug text-[#142218] sm:text-lg">
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className={[
                    'shrink-0 font-poppins text-lg leading-none text-[#005D51] transition-transform duration-200',
                    isOpen ? 'rotate-45' : 'rotate-0',
                  ].join(' ')}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="bg-[#f0fffd] px-5 pb-5 sm:px-8 sm:pb-6"
            >
              <FaqAnswer parts={item.answer} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BuildAReaderFaq({ embedded = false }: { embedded?: boolean }) {
  const inner = (
    <>
      <h2
        id="bar-faq-heading"
        className="font-lora text-2xl font-bold text-[#142218] sm:text-3xl"
      >
        Frequently asked questions
      </h2>
      <p className="mt-3 max-w-2xl font-poppins text-sm leading-relaxed text-[#5a6570] sm:text-base">
        Quick answers for partners and supporters. For anything not covered here,
        email{' '}
        <a
          href="mailto:projects@emprintereaders.com"
          className="font-medium text-[#005D51] underline-offset-2 hover:underline"
        >
          projects@emprintereaders.com
        </a>
        .
      </p>

      <FaqAccordion />
    </>
  );

  if (embedded) {
    return (
      <section
        aria-labelledby="bar-faq-heading"
        className="mt-8 w-full rounded-2xl border border-[#005D51]/10 bg-white px-5 py-6 sm:px-8 sm:py-8"
      >
        {inner}
      </section>
    );
  }

  return (
    <section
      aria-labelledby="bar-faq-heading"
      className="w-full border-b border-[#005D51]/10 bg-white px-5 py-10 sm:px-8 lg:px-[75px] xl:px-[120px]"
    >
      <div className="mx-auto w-full max-w-[1100px]">{inner}</div>
    </section>
  );
}
