import type { Metadata } from 'next';

import { Testimonials } from '@/components/sections/Testimonials';
import { Initiatives } from '@/components/sections/Initiatives';
import { Newsletter } from '@/components/sections/Newsletter';
import { Bootcamps } from '@/components/sections/Bootcamps';
import { BookClub } from '@/components/sections/BookClub';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { Stats } from '@/components/sections/Stats';
import { ExclusiveWorkshop } from '@/components/sections/ExclusiveWorkshop';
import { Hero } from '@/components/sections/Hero';
import { Insights } from '@/components/sections/Insights';
import { JsonLd } from '@/components/seo/JsonLd';
import { fetchInsightArticlesList } from '@/lib/insights-public';
import { organizationJsonLd, webSiteJsonLd } from '@/lib/seo/json-ld';
import { buildPageMetadata } from '@/lib/seo/site';
import { getSiteSettings } from '@/lib/site-settings-server';

export const metadata: Metadata = buildPageMetadata({
  title: 'Transforming Africa, One Book at a Time',
  description:
    'Join Emprinte Readers Hub — book clubs, reading programs, and #BuildAReader. Connect with readers across Africa.',
  path: '/',
});

export default async function Home() {
  const settings = await getSiteSettings();
  const landingInsights = (await fetchInsightArticlesList()).slice(0, 3);

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-x-visible bg-white">
      <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
      <div className="w-full max-w-full overflow-x-visible md:max-w-7xl lg:max-w-full">
        <Header contactEmail={settings.contactInfo.email} />
        <Hero />
        <Stats />
        <ExclusiveWorkshop />
        <BookClub />
        <Initiatives />
        <Bootcamps />
        <Insights articles={landingInsights} />
        <Testimonials />
        <Newsletter />
        <Footer contactInfo={settings.contactInfo} />
      </div>
    </main>
  );
}
