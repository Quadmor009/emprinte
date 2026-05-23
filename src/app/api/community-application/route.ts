import { NextResponse } from 'next/server';

import { assertPaystackPayment } from '@/lib/paystack/assert-payment';
import { APPLICATION_FEE_KOBO } from '@/lib/paystack/constants';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  communityApplicationSubmitSchema,
  type CommunityApplicationSubmitInput,
} from '@/lib/validation/community-application';

function portraitPathBelongsToUser(userId: string, portraitPath: string): boolean {
  const prefix = `${userId}/`;
  return portraitPath.startsWith(prefix) && !portraitPath.includes('..');
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Server is not configured for applications.' },
      { status: 503 },
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .schema('landing')
    .from('community_applications')
    .select('id, submitted_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: 'Could not load application status.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    submitted: Boolean(data),
    submittedAt: data?.submitted_at ?? null,
  });
}

function mapBodyToRow(userId: string, email: string, body: CommunityApplicationSubmitInput) {
  return {
    user_id: userId,
    email,
    first_name: body.firstName,
    last_name: body.lastName,
    phone: body.phone,
    gender: body.gender,
    date_of_birth: body.dateOfBirth.slice(0, 10),
    location: body.location,
    professional_status: body.professionalStatus,
    plan_choice: body.planChoice,
    consistent_reader: body.consistentReader,
    books_last_12_months: body.booksLast12Months,
    book_types: body.bookTypes,
    book_types_other: body.bookTypesOther?.trim() || null,
    weekend_commitment: body.weekendCommitment,
    commitment_scale: body.commitmentScale,
    reading_goals_12m: body.readingGoals12m,
    portrait_storage_path: body.portraitStoragePath,
    referral_source: body.referralSource,
    referral_other: body.referralOther?.trim() || null,
    payment_reference: body.paymentReference.trim(),
    receipt_storage_path: null,
  };
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Server is not configured for applications.' },
      { status: 503 },
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user?.id || !user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = communityApplicationSubmitSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const body = parsed.data;
  if (!portraitPathBelongsToUser(user.id, body.portraitStoragePath)) {
    return NextResponse.json(
      { error: 'Invalid portrait path for this account.' },
      { status: 400 },
    );
  }

  const payment = await assertPaystackPayment({
    reference: body.paymentReference,
    purpose: 'community_application',
    expectedAmountKobo: APPLICATION_FEE_KOBO,
    expectedUserId: user.id,
    expectedEmail: user.email,
  });
  if (!payment.ok) {
    return NextResponse.json({ error: payment.error }, { status: 402 });
  }

  const row = mapBodyToRow(user.id, user.email, body);

  const { error: insertError } = await supabase
    .schema('landing')
    .from('community_applications')
    .insert(row);

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json(
        { error: 'You have already submitted an application with this account.' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: insertError.message || 'Could not save application.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
