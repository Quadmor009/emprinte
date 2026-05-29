import type { MetadataRoute } from 'next';

import { absoluteUrl, getSiteOrigin } from '@/lib/seo/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/apply/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: getSiteOrigin(),
  };
}
