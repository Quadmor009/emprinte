import type { MetadataRoute } from 'next';

import { fetchInsightArticlesList } from '@/lib/insights-public';
import { articlePagePath } from '@/lib/seo/json-ld';
import { absoluteUrl } from '@/lib/seo/site';

const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/build-a-reader', changeFrequency: 'monthly', priority: 0.85 },
  { path: '/donate', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/request-account-deletion', changeFrequency: 'yearly', priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await fetchInsightArticlesList();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(articlePagePath(article)),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.75,
    images: article.image?.trim() ? [article.image.trim()] : [],
  }));

  return [...staticEntries, ...articleEntries];
}
