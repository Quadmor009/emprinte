import type { InsightArticle } from '@/types';

import { articlePublicPath } from '@/lib/insight-slug';

import { absoluteUrl, articleDateToIso, DEFAULT_DESCRIPTION, SITE_NAME } from './site';

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/Logo.png'),
    description: DEFAULT_DESCRIPTION,
  };
}

export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    description: DEFAULT_DESCRIPTION,
  };
}

export function blogPostingJsonLd(article: InsightArticle, articleUrl: string) {
  const published = articleDateToIso(article.date);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    image: article.image?.trim() || absoluteUrl('/Logo.png'),
    datePublished: published,
    author: {
      '@type': 'Person',
      name: article.authorName?.trim() || SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/Logo.png'),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    url: articleUrl,
  };
}

export function blogIndexJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE_NAME} Blog`,
    description: 'Stories and ideas from the Emprinte reading community.',
    url: absoluteUrl('/blog'),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  };
}

export function articlePagePath(article: InsightArticle): string {
  return `/blog/${encodeURIComponent(articlePublicPath(article))}`;
}
