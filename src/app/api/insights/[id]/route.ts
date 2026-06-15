import { NextResponse } from 'next/server';

import {
  fetchAllLandingInsightsFromDb,
  updateLandingInsightInDb,
} from '@/lib/landing-insights-db';
import {
  findInsightById,
  findInsightBySlugOrId,
  getAllInsights,
  replaceInsight,
} from '@/lib/insights-store';
import { pickSlugForUpdate } from '@/lib/insight-slug';
import { revalidateBlogPages } from '@/lib/revalidate-blog';
import { requireLandingAdminApiAuth } from '@/lib/supabase-api-auth';
import { insightSchema } from '@/lib/validation/admin';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const param = id.trim();
  const rows = await fetchAllLandingInsightsFromDb();
  if (rows !== null) {
    const found = rows.find((r) => r.slug === param || r.id === param);
    if (!found) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(found);
  }

  const item = findInsightBySlugOrId(param);
  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const denied = await requireLandingAdminApiAuth();
  if (!denied.ok) return denied.response;

  const { id } = await context.params;
  const idTrimmed = id?.trim();
  if (!idTrimmed) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = insightSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid input',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const {
    title,
    description,
    date,
    image,
    href,
    body: articleBody,
    authorName,
    authorRole,
    slug: requestedSlug,
  } = parsed.data;

  const rows = await fetchAllLandingInsightsFromDb();
  if (rows !== null) {
    const existing = rows.find((r) => r.id === idTrimmed);
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const slug = pickSlugForUpdate(existing, requestedSlug, rows);
    const item = {
      id: idTrimmed,
      slug,
      title,
      description,
      date,
      image,
      ...(articleBody ? { body: articleBody } : {}),
      ...(href ? { href } : {}),
      ...(authorName ? { authorName } : {}),
      ...(authorRole ? { authorRole } : {}),
    };
    const ok = await updateLandingInsightInDb(item);
    if (!ok) {
      return NextResponse.json(
        { error: 'Failed to update article in the database.' },
        { status: 500 },
      );
    }
    revalidateBlogPages(item);
    return NextResponse.json({ ok: true, data: item });
  }

  const existing = findInsightById(idTrimmed);
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const slug = pickSlugForUpdate(existing, requestedSlug, getAllInsights());
  const item = {
    id: idTrimmed,
    slug,
    title,
    description,
    date,
    image,
    ...(articleBody ? { body: articleBody } : {}),
    ...(href ? { href } : {}),
    ...(authorName ? { authorName } : {}),
    ...(authorRole ? { authorRole } : {}),
  };

  replaceInsight(item);
  revalidateBlogPages(item);

  return NextResponse.json({ ok: true, data: item });
}
