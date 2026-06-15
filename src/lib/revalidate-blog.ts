import { revalidatePath } from 'next/cache';

import { articlePublicPath } from '@/lib/insight-slug';
import type { InsightArticle } from '@/types';

/** Bust static caches after blog content changes in admin. */
export function revalidateBlogPages(article?: Pick<InsightArticle, 'slug' | 'id'>) {
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');

  if (article) {
    revalidatePath(`/blog/${articlePublicPath(article)}`);
  }
}
