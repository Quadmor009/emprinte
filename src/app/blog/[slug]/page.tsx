import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { BlogPostView } from '@/components/sections/BlogPostView';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  fetchAdjacentInsightArticles,
  fetchInsightArticleBySlugParam,
} from '@/lib/insights-public';
import { articlePublicPath } from '@/lib/insight-slug';
import { getPublicSiteOrigin } from '@/lib/public-site-url';
import {
  articlePagePath,
  blogPostingJsonLd,
  breadcrumbJsonLd,
} from '@/lib/seo/json-ld';
import { absoluteUrl, articleDateToIso, buildPageMetadata } from '@/lib/seo/site';
import { getSiteSettings } from '@/lib/site-settings-server';

/** New and updated posts must be readable without a full redeploy. */
export const dynamic = 'force-dynamic';

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
  const path = articlePagePath(article);
  return buildPageMetadata({
    title: article.title,
    description: desc,
    path,
    image: article.image,
    type: 'article',
    publishedTime: articleDateToIso(article.date),
  });
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
  const { previous, next } = await fetchAdjacentInsightArticles(article);

  return (
    <main className="relative flex min-h-screen w-full flex-col bg-white">
      <JsonLd data={blogPostingJsonLd(article, articleUrl)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Blog', url: absoluteUrl('/blog') },
          { name: article.title, url: articleUrl },
        ])}
      />
      <Header contactEmail={settings.contactInfo.email} />
      <BlogPostView
        article={article}
        articleUrl={articleUrl}
        previousArticle={previous}
        nextArticle={next}
      />
      <Footer contactInfo={settings.contactInfo} />
    </main>
  );
}
