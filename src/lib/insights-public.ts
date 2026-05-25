import { cache } from 'react';

import { findInsightBySlugOrId, getAllInsights } from '@/lib/insights-store';
import { fetchAllLandingInsightsFromDb } from '@/lib/landing-insights-db';
import type { InsightArticle } from '@/types';

/**
 * Public blog list for Server Components — same data as `GET /api/insights`.
 * Reads Supabase directly so we do not depend on an HTTP round-trip (which can
 * miss posts when `NEXT_PUBLIC_API_URL` points at another host or self-fetch fails at build).
 */
export const fetchInsightArticlesList = cache(
  async (): Promise<InsightArticle[]> => {
    const fromDb = await fetchAllLandingInsightsFromDb();
    if (fromDb !== null) return fromDb;
    return getAllInsights();
  },
);

/** Resolve a post by URL segment (`slug` or legacy `id`). */
export async function fetchInsightArticleBySlugParam(
  slug: string,
): Promise<InsightArticle | null> {
  const param = slug.trim();
  if (!param) return null;

  const list = await fetchInsightArticlesList();
  return list.find((r) => r.slug === param || r.id === param) ?? null;
}
