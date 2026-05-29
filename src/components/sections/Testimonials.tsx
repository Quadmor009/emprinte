'use client';
import { useEffect, useState } from 'react';
import { IoStar } from 'react-icons/io5';

import { AnimateOnView } from '@/components/motion/AnimateOnView';
import { TestimonialCardSkeleton } from './TestimonialCardSkeleton';
import { getSameOriginApiUrl } from '@/lib/api';
import { Testimonial } from '@/types';
import { Badge } from '../ui';

const SKELETON_COUNT = 3;

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch(getSameOriginApiUrl('testimonials'));
        if (!res.ok) {
          setTestimonials([]);
          return;
        }
        const data = await res.json().catch(() => []);
        setTestimonials(Array.isArray(data) ? data : []);
      } catch {
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);
  return (
    <section
      id="testimonials"
      className="w-full overflow-x-visible bg-white px-6 py-14 lg:px-[75px] lg:py-20 xl:px-[120px]"
    >
      {/* Same grid rail as Initiatives / BookClub / Newsletter: gutters + max-w-[1200px]. */}
      <div className="mx-auto w-full max-w-[1200px]">
        <AnimateOnView>
          <header className="flex flex-col gap-3 sm:gap-4">
            <Badge>Testimonials</Badge>
            <h2 className="max-w-4xl font-lora text-4xl font-bold leading-[1.08] tracking-tight text-[#005D51] md:text-5xl lg:text-6xl xl:text-[clamp(2.75rem,3.2vw+1.25rem,3.75rem)]">
              Here is what our Readers have to say
            </h2>
          </header>
        </AnimateOnView>

        <div
          className="hide-scrollbar mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-hidden pb-4 sm:mt-8 sm:gap-6 lg:mt-8 xl:mt-10"
          aria-busy={loading}
          aria-label={loading ? 'Loading testimonials' : undefined}
        >
          {loading
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <TestimonialCardSkeleton key={i} />
              ))
            : testimonials.map((testimonial, index) => (
                <AnimateOnView
                  key={testimonial.id}
                  delayMs={index * 80}
                  className="flex w-[min(340px,calc(100vw-3rem))] shrink-0 snap-start sm:w-[340px] md:w-[380px]"
                >
                <article
                  className="flex h-full w-full flex-col items-stretch gap-4 rounded-2xl bg-[#142218] p-6"
                >
                  <div className="flex gap-1">
                    {Array.from({
                      length: testimonial.rating ?? 5,
                    }).map((_, i) => (
                      <IoStar
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="flex-1 text-left font-poppins text-sm leading-relaxed text-white/90">
                    {testimonial.text}
                  </p>
                  <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-4 text-left">
                    <span className="font-poppins text-base font-semibold uppercase tracking-wide text-white">
                      {testimonial.name}
                    </span>
                    <span className="font-poppins text-sm font-medium uppercase tracking-wide text-white/70">
                      {testimonial.title}
                    </span>
                  </div>
                </article>
                </AnimateOnView>
              ))}
        </div>
      </div>
    </section>
  );
}
