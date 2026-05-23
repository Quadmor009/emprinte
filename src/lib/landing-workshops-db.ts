import {
  createSupabaseAnonClient,
  createSupabaseServiceRoleClient,
} from '@/lib/supabase/db';

/** Public workshop rows; anon key is enough when service role is unset locally. */
function workshopReadClient() {
  return createSupabaseServiceRoleClient() ?? createSupabaseAnonClient();
}

/** App + web workshop row (`public.challenges`). */
export type PublicWorkshopRow = {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  rules: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  is_auto_approve: boolean;
  slug: string | null;
  registration_open: boolean;
  fee_amount_naira: number | null;
  whatsapp_group_url: string | null;
  landing_lead: string | null;
  created_at: string;
};

export type WorkshopPublic = {
  id: string;
  title: string;
  description: string;
  slug: string;
  registrationOpen: boolean;
  feeAmountNaira: number | null;
  whatsappGroupUrl: string | null;
  landingLead: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
};

function rowToPublic(row: PublicWorkshopRow): WorkshopPublic | null {
  const slug = row.slug?.trim();
  if (!slug) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    slug,
    registrationOpen: Boolean(row.registration_open),
    feeAmountNaira: row.fee_amount_naira,
    whatsappGroupUrl: row.whatsapp_group_url,
    landingLead: row.landing_lead,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
  };
}

export async function fetchWorkshopBySlug(slug: string): Promise<WorkshopPublic | null> {
  const sb = workshopReadClient();
  if (!sb) return null;

  const normalized = slug.trim().toLowerCase();
  const { data, error } = await sb
    .from('challenges')
    .select(
      'id, title, description, duration_days, rules, start_date, end_date, status, is_auto_approve, slug, registration_open, fee_amount_naira, whatsapp_group_url, landing_lead, created_at',
    )
    .eq('slug', normalized)
    .maybeSingle<PublicWorkshopRow>();

  if (error || !data) {
    if (error) console.error('[challenges] fetch by slug failed', error);
    return null;
  }
  return rowToPublic(data);
}

export async function fetchWorkshopById(id: string): Promise<WorkshopPublic | null> {
  const sb = workshopReadClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from('challenges')
    .select(
      'id, title, description, duration_days, rules, start_date, end_date, status, is_auto_approve, slug, registration_open, fee_amount_naira, whatsapp_group_url, landing_lead, created_at',
    )
    .eq('id', id)
    .maybeSingle<PublicWorkshopRow>();

  if (error || !data) return null;
  return rowToPublic(data);
}

export async function listWorkshopsForAdmin(): Promise<PublicWorkshopRow[]> {
  const sb = createSupabaseServiceRoleClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('challenges')
    .select(
      'id, title, description, duration_days, rules, start_date, end_date, status, is_auto_approve, slug, registration_open, fee_amount_naira, whatsapp_group_url, landing_lead, created_at',
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[challenges] admin list failed', error);
    return [];
  }
  return data ?? [];
}
