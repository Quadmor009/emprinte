import type { Metadata } from 'next';

import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { BlogArticleList } from '@/components/sections/BlogArticleList';
import { fetchInsightArticlesList } from '@/lib/insights-public';
import { JsonLd } from '@/components/seo/JsonLd';
import { blogIndexJsonLd } from '@/lib/seo/json-ld';
import { buildPageMetadata } from '@/lib/seo/site';
import { getSiteSettings } from '@/lib/site-settings-server';

/** Blog posts are added in admin after deploy — do not freeze the list at build time. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildPageMetadata({
  title: 'Blog',
  description:
    'Stories and ideas from Emprinte Readers Hub — reading culture, book clubs, and community across Africa.',
  path: '/blog',
});



export default async function BlogPage() {
  const settings = await getSiteSettings();
  const articles = await fetchInsightArticlesList();

  return (
    <main className="relative flex min-h-screen w-full flex-col bg-white">
      <JsonLd data={blogIndexJsonLd()} />
      <Header contactEmail={settings.contactInfo.email} />
      <BlogArticleList articles={articles} />
      <Footer contactInfo={settings.contactInfo} />
    </main>
  );
}
