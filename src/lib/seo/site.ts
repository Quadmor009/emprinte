import type { Metadata } from 'next';

export const SITE_NAME = 'Emprinte Readers Hub';
export const DEFAULT_DESCRIPTION =
  'Emprinte Readers Hub is a reading community in Africa — book clubs, literacy programs, and the #BuildAReader campaign.';

export const DEFAULT_OG_IMAGE = '/og.png';

export function getSiteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '') ||
    'https://www.emprintereaders.com'
  );
}

export function absoluteUrl(path = '/'): string {
  const base = getSiteOrigin();
  if (!path || path === '/') return `${base}/`;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function resolveImageUrl(image?: string): string {
  if (!image?.trim()) return absoluteUrl(DEFAULT_OG_IMAGE);
  const trimmed = image.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return absoluteUrl(trimmed);
}

export function buildPageMetadata(options: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
}): Metadata {
  const url = absoluteUrl(options.path);
  const imageUrl = resolveImageUrl(options.image);
  const type = options.type ?? 'website';

  return {
    title: options.title,
    description: options.description,
    alternates: { canonical: url },
    openGraph: {
      title: options.title,
      description: options.description,
      url,
      siteName: SITE_NAME,
      locale: 'en_US',
      type,
      images: [{ url: imageUrl, alt: options.title }],
      ...(type === 'article' && options.publishedTime
        ? { publishedTime: options.publishedTime }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description: options.description,
      images: [imageUrl],
    },
  };
}

export function articleDateToIso(stored: string): string | undefined {
  const t = Date.parse(stored.trim());
  if (Number.isNaN(t)) return undefined;
  return new Date(t).toISOString();
}
