import { insightArticles } from '@/constants/data';
import { slugifyTitle } from '@/lib/insight-slug';
import type { InsightArticle } from '@/types';

/**
 * In-memory insights (blog posts). Used only when `SUPABASE_SERVICE_ROLE_KEY` is
 * not set (e.g. local dev). Production uses `landing_insights` via
 * `landing-insights-db.ts` — that data survives deploys.
 */
let adminInsights: InsightArticle[] = insightArticles.map((article) => ({
  ...article,
  slug: article.slug?.trim() || slugifyTitle(article.title),
}));

export function getAllInsights(): InsightArticle[] {
  return [...adminInsights];
}

export function findInsightById(id: string): InsightArticle | undefined {
  return adminInsights.find((i) => i.id === id);
}

export function findInsightBySlugOrId(param: string): InsightArticle | undefined {
  const p = param.trim();
  return adminInsights.find((i) => i.id === p || i.slug === p);
}

export function prependInsight(item: InsightArticle): void {
  adminInsights = [item, ...adminInsights];
}

export function replaceInsight(item: InsightArticle): void {
  const idx = adminInsights.findIndex((i) => i.id === item.id);
  if (idx === -1) return;
  adminInsights[idx] = item;
}

export function deleteInsight(id: string): boolean {
  const next = adminInsights.filter((i) => i.id !== id);
  if (next.length === adminInsights.length) return false;
  adminInsights = next;
  return true;
}
