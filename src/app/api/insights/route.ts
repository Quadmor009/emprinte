import { NextResponse } from 'next/server';

import {
  deleteLandingInsightFromDb,
  fetchAllLandingInsightsFromDb,
  insertLandingInsightInDb,
  updateLandingInsightInDb,
} from '@/lib/landing-insights-db';
import {
  deleteInsight,
  findInsightById,
  getAllInsights,
  prependInsight,
  replaceInsight,
} from '@/lib/insights-store';
import { pickSlugForCreate, pickSlugForUpdate } from '@/lib/insight-slug';
import { revalidateBlogPages } from '@/lib/revalidate-blog';
import { requireLandingAdminApiAuth } from '@/lib/supabase-api-auth';
import { insightSchema, insightUpdateSchema } from '@/lib/validation/admin';

export async function GET() {
  const fromDb = await fetchAllLandingInsightsFromDb();
  if (fromDb !== null) {
    return NextResponse.json(fromDb);
  }
  return NextResponse.json(getAllInsights());
}

export async function POST(request: Request) {
  const denied = await requireLandingAdminApiAuth();
  if (!denied.ok) return denied.response;

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

  const id = String(Date.now());

  const dbList = await fetchAllLandingInsightsFromDb();
  const slug = pickSlugForCreate(
    title,
    requestedSlug,
    dbList ?? getAllInsights(),
  );

  const item = {
    id,
    slug,
    date,
    title,
    description,
    image,
    ...(articleBody ? { body: articleBody } : {}),
    ...(href ? { href } : {}),
    ...(authorName ? { authorName } : {}),
    ...(authorRole ? { authorRole } : {}),
  };

  if (dbList !== null) {
    const ok = await insertLandingInsightInDb(item);
    if (!ok) {
      return NextResponse.json(
        { error: 'Failed to save article to the database.' },
        { status: 500 },
      );
    }
    revalidateBlogPages(item);
    return NextResponse.json({ ok: true, data: item }, { status: 201 });
  }

  prependInsight(item);
  revalidateBlogPages(item);

  return NextResponse.json({ ok: true, data: item }, { status: 201 });
}

export async function PATCH(request: Request) {
  const denied = await requireLandingAdminApiAuth();
  if (!denied.ok) return denied.response;

  const body = await request.json().catch(() => null);

  const parsed = insightUpdateSchema.safeParse(body);

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
    id,
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

  const dbList = await fetchAllLandingInsightsFromDb();
  if (dbList !== null) {
    const existing = dbList.find((r) => r.id === id);
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const slug = pickSlugForUpdate(existing, requestedSlug, dbList);
    const item = {
      id,
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

  const existing = findInsightById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const slug = pickSlugForUpdate(existing, requestedSlug, getAllInsights());
  const item = {
    id,
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

export async function DELETE(request: Request) {
  const denied = await requireLandingAdminApiAuth();
  if (!denied.ok) return denied.response;

  const id = new URL(request.url).searchParams.get('id');
  if (!id?.trim()) {
    return NextResponse.json({ error: 'id query required' }, { status: 400 });
  }

  const idTrimmed = id.trim();
  const dbList = await fetchAllLandingInsightsFromDb();
  if (dbList !== null) {
    const existing = dbList.find((r) => r.id === idTrimmed);
    const ok = await deleteLandingInsightFromDb(idTrimmed);
    if (!ok) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    revalidateBlogPages(existing);
    return NextResponse.json({ ok: true });
  }

  const existing = findInsightById(idTrimmed);
  if (!deleteInsight(idTrimmed)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  revalidateBlogPages(existing);
  return NextResponse.json({ ok: true });
}
