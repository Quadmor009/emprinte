import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { BlogPostView } from '@/components/sections/BlogPostView';
import { fetchInsightArticleBySlugParam } from '@/lib/insights-public';
import { articlePublicPath } from '@/lib/insight-slug';
import { getPublicSiteOrigin } from '@/lib/public-site-url';
import { getSiteSettings } from '@/lib/site-settings-server';

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function resolveArticle(slugParam: string) {
  return fetchInsightArticleBySlugParam(slugParam);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await resolveArticle(slug);
  if (!article) {
    return { title: 'Post not found | Emprinte Readers Hub' };
  }
  const desc =
    article.description.slice(0, 155) +
    (article.description.length > 155 ? '…' : '');
  return {
    title: `${article.title} | Emprinte Readers Hub`,
    description: desc,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await resolveArticle(slug);

  if (!article) {
    notFound();
  }

  const settings = await getSiteSettings();
  const origin = await getPublicSiteOrigin();
  const pathSeg = articlePublicPath(article);
  const articleUrl = `${origin}/blog/${encodeURIComponent(pathSeg)}`;

  return (
    <main className="relative flex min-h-screen w-full flex-col bg-white">
      <Header contactEmail={settings.contactInfo.email} />
      <BlogPostView article={article} articleUrl={articleUrl} />
      <Footer contactInfo={settings.contactInfo} />
    </main>
  );
}
