import { createSupabaseServiceRoleClient } from '@/lib/supabase/db';

export type DonationRow = {
  id: string;
  full_name: string;
  email: string;
  message: string | null;
  amount_kobo: number;
  books_credited: number;
  payment_reference: string;
  submitted_at: string;
  anonymous: boolean;
};

export async function fetchDonationByReference(
  reference: string,
): Promise<DonationRow | null> {
  const sb = createSupabaseServiceRoleClient();
  if (!sb) return null;

  const { data, error } = await sb
    .schema('landing')
    .from('donations')
    .select('*')
    .eq('payment_reference', reference.trim())
    .maybeSingle<DonationRow>();

  if (error) {
    console.error('[donations] fetch by reference failed', error);
    return null;
  }
  return data;
}

export async function insertDonationRow(row: {
  fullName: string;
  email: string;
  message: string | null;
  amountKobo: number;
  booksCredited: number;
  paymentReference: string;
  anonymous?: boolean;
}): Promise<DonationRow | null> {
  const sb = createSupabaseServiceRoleClient();
  if (!sb) return null;

  const { data, error } = await sb
    .schema('landing')
    .from('donations')
    .insert({
      full_name: row.fullName.trim(),
      email: row.email.trim(),
      message: row.message?.trim() || null,
      amount_kobo: row.amountKobo,
      books_credited: row.booksCredited,
      payment_reference: row.paymentReference.trim(),
      anonymous: row.anonymous ?? false,
    })
    .select('*')
    .single<DonationRow>();

  if (error) {
    console.error('[donations] insert failed', error);
    return null;
  }
  return data;
}

export async function listDonationsForAdmin(args: {
  page: number;
  pageSize: number;
}): Promise<{ rows: DonationRow[]; total: number }> {
  const sb = createSupabaseServiceRoleClient();
  if (!sb) return { rows: [], total: 0 };

  const from = (args.page - 1) * args.pageSize;
  const to = from + args.pageSize - 1;

  const { data, error, count } = await sb
    .schema('landing')
    .from('donations')
    .select('*', { count: 'exact' })
    .order('submitted_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('[donations] admin list failed', error);
    return { rows: [], total: 0 };
  }

  return { rows: data ?? [], total: count ?? 0 };
}

export async function listAllDonationsForExport(limit = 10_000): Promise<DonationRow[]> {
  const sb = createSupabaseServiceRoleClient();
  if (!sb) return [];

  const { data, error } = await sb
    .schema('landing')
    .from('donations')
    .select('*')
    .order('submitted_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[donations] export failed', error);
    return [];
  }
  return data ?? [];
}
