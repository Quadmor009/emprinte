import { NextResponse } from 'next/server';

import {
  listAllDonationsForExport,
  listDonationsForAdmin,
} from '@/lib/landing-donations-db';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/db';
import { requireLandingAdminApiAuth } from '@/lib/supabase-api-auth';

const MAX_EXPORT_ROWS = 10_000;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

function parsePositiveInt(value: string | null, fallback: number, max?: number) {
  const n = parseInt(value ?? '', 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  if (max != null) return Math.min(max, Math.floor(n));
  return Math.floor(n);
}

export async function GET(request: Request) {
  const denied = await requireLandingAdminApiAuth();
  if (!denied.ok) return denied.response;

  if (!createSupabaseServiceRoleClient()) {
    return NextResponse.json(
      {
        error: 'Server misconfigured',
        message: 'Set SUPABASE_SERVICE_ROLE_KEY to load donations.',
      },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const exportAll = url.searchParams.get('export') === 'all';

  if (exportAll) {
    const rows = await listAllDonationsForExport(MAX_EXPORT_ROWS);
    return NextResponse.json(
      { donations: rows, total: rows.length, exportAll: true },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const pageSize = parsePositiveInt(
    url.searchParams.get('pageSize'),
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
  );
  const page = parsePositiveInt(url.searchParams.get('page'), 1);
  const { rows, total } = await listDonationsForAdmin({ page, pageSize });

  return NextResponse.json(
    { donations: rows, total, page, pageSize },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
