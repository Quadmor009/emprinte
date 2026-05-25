import type { Metadata } from 'next';

import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { BlogArticleList } from '@/components/sections/BlogArticleList';
import { fetchInsightArticlesList } from '@/lib/insights-public';
import { getSiteSettings } from '@/lib/site-settings-server';

export const metadata: Metadata = {
  title: 'Blog | Emprinte Readers Hub',
  description:
    'Stories and updates from Emprinte Readers Hub — reading that changes the world.',
};



export default async function BlogPage() {
  const settings = await getSiteSettings();
  const articles = await fetchInsightArticlesList();

  return (
    <main className="relative flex min-h-screen w-full flex-col bg-white">
      <Header contactEmail={settings.contactInfo.email} />
      <BlogArticleList articles={articles} />
      <Footer contactInfo={settings.contactInfo} />
    </main>
  );
}
