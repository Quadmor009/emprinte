import type { InsightArticle } from '@/types';

import { articlePublicPath } from '@/lib/insight-slug';

import { absoluteUrl, articleDateToIso, DEFAULT_DESCRIPTION, SITE_NAME } from './site';

export type FaqSchemaItem = {
  question: string;
  answer: string;
};

export function faqPageJsonLd(items: FaqSchemaItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/Logo.png'),
    description: DEFAULT_DESCRIPTION,
    sameAs: [
      'https://www.instagram.com/emprintereaders',
      'https://x.com/emprintereaders',
    ],
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
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
