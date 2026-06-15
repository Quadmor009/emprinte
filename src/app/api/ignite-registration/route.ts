import { NextResponse } from 'next/server';

import { createSupabaseServiceRoleClient } from '@/lib/supabase/db';
import { igniteRegistrationSchema } from '@/lib/validation/ignite-registration';

type IgniteRow = {
  id: string;
  fullName: string;
  email: string;
  lookingForwardTo: string;
  submittedAt: string;
};

let memoryRegistrations: IgniteRow[] = [];

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isSupabaseReady(): boolean {
  return Boolean(createSupabaseServiceRoleClient());
}

function allowMemoryStore(): boolean {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.ALLOW_IGNITE_MEMORY_FALLBACK === 'true'
  );
}

function misconfiguredResponse() {
  return NextResponse.json(
    {
      error: 'IGNITE registration is not configured',
      message:
        'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, apply the IGNITE registrations migration, and expose the landing schema.',
    },
    { status: 503 },
  );
}

function rowFromDb(row: {
  id: string;
  full_name: string;
  email: string;
  looking_forward_to: string;
  submitted_at: string;
}): IgniteRow {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    lookingForwardTo: row.looking_forward_to,
    submittedAt: row.submitted_at,
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = igniteRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid input',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { fullName, email, lookingForwardTo } = parsed.data;

  if (isSupabaseReady()) {
    const admin = createSupabaseServiceRoleClient()!;
    const { data, error } = await admin
      .schema('landing')
      .from('ignite_registrations')
      .insert({
        full_name: fullName,
        email: email.trim(),
        looking_forward_to: lookingForwardTo,
      })
      .select('id, full_name, email, looking_forward_to, submitted_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          {
            error: 'Already registered',
            message: 'This email is already registered for IGNITE.',
          },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: 'Database error', message: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Database error', message: 'No row returned.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, data: rowFromDb(data) }, { status: 201 });
  }

  if (allowMemoryStore()) {
    const emailKey = normalizeEmail(email);
    if (memoryRegistrations.some((row) => normalizeEmail(row.email) === emailKey)) {
      return NextResponse.json(
        {
          error: 'Already registered',
          message: 'This email is already registered for IGNITE.',
        },
        { status: 409 },
      );
    }

    const row: IgniteRow = {
      id: crypto.randomUUID(),
      fullName,
      email: email.trim(),
      lookingForwardTo,
      submittedAt: new Date().toISOString(),
    };

    memoryRegistrations = [row, ...memoryRegistrations];
    return NextResponse.json({ ok: true, data: row }, { status: 201 });
  }

  return misconfiguredResponse();
}
