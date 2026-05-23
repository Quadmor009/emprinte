import { NextResponse } from 'next/server';

import { fetchWorkshopById } from '@/lib/landing-workshops-db';
import { assertPaystackPayment } from '@/lib/paystack/assert-payment';
import { amountKoboForPurpose } from '@/lib/paystack/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/db';
import { workshopRegistrationSchema } from '@/lib/validation/workshop-registration';

type WorkshopRow = {
  id: string;
  workshopId: string;
  fullName: string;
  email: string;
  primaryGoal: string;
  isMember: boolean;
  financialCategory: string;
  financeChallenges: string;
  workshopQuestions: string;
  receiptStoragePath: string | null;
  paymentReference: string | null;
  submittedAt: string;
};

let memoryRegistrations: WorkshopRow[] = [];

function isSupabaseReady(): boolean {
  return Boolean(createSupabaseServiceRoleClient());
}

function allowMemoryStore(): boolean {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.ALLOW_WORKSHOP_MEMORY_FALLBACK === 'true'
  );
}

function misconfiguredResponse() {
  return NextResponse.json(
    {
      error: 'Workshop registration is not configured',
      message:
        'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, apply the workshop registrations migration, and expose the landing schema.',
    },
    { status: 503 },
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = workshopRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid input',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const data = parsed.data;

  if (data.isMember === 'no') {
    const workshop = await fetchWorkshopById(data.workshopId);
    if (!workshop) {
      return NextResponse.json({ error: 'Workshop not found.' }, { status: 404 });
    }

    const payment = await assertPaystackPayment({
      reference: data.paymentReference!.trim(),
      purpose: 'workshop_registration',
      expectedAmountKobo: amountKoboForPurpose('workshop_registration', workshop.feeAmountNaira),
      expectedEmail: data.email,
      expectedWorkshopId: data.workshopId,
    });
    if (!payment.ok) {
      return NextResponse.json({ error: payment.error }, { status: 402 });
    }
  }

  const row = {
    workshop_id: data.workshopId,
    full_name: data.fullName,
    email: data.email.trim().toLowerCase(),
    primary_goal: data.primaryGoal,
    is_member: data.isMember === 'yes',
    financial_category: data.financialCategory,
    finance_challenges: data.financeChallenges,
    workshop_questions: data.workshopQuestions,
    receipt_storage_path: null,
    payment_reference:
      data.isMember === 'no' ? data.paymentReference?.trim() ?? null : null,
  };

  if (isSupabaseReady()) {
    const admin = createSupabaseServiceRoleClient()!;
    const { error } = await admin
      .schema('landing')
      .from('workshop_registrations')
      .insert(row);

    if (error) {
      return NextResponse.json(
        { error: 'Database error', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  }

  if (allowMemoryStore()) {
    memoryRegistrations.push({
      id: crypto.randomUUID(),
      workshopId: data.workshopId,
      fullName: data.fullName,
      email: data.email,
      primaryGoal: data.primaryGoal,
      isMember: data.isMember === 'yes',
      financialCategory: data.financialCategory,
      financeChallenges: data.financeChallenges,
      workshopQuestions: data.workshopQuestions,
      receiptStoragePath: null,
      paymentReference:
        data.isMember === 'no' ? data.paymentReference?.trim() ?? null : null,
      submittedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  }

  return misconfiguredResponse();
}
