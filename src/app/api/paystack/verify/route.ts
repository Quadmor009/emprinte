import { NextResponse } from 'next/server';
import { z } from 'zod';

import { fetchWorkshopById } from '@/lib/landing-workshops-db';
import { assertPaystackPayment } from '@/lib/paystack/assert-payment';
import { APPLICATION_FEE_KOBO, type PaystackPurpose } from '@/lib/paystack/constants';
import { amountKoboForPurpose } from '@/lib/paystack/server';
import { isPaystackConfigured } from '@/lib/paystack/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const querySchema = z.object({
  reference: z.string().trim().min(1),
  purpose: z.enum(['community_application', 'workshop_registration']),
  workshopId: z.string().uuid().optional(),
  email: z.string().trim().email().optional(),
});

export async function GET(request: Request) {
  if (!isPaystackConfigured()) {
    return NextResponse.json(
      { error: 'Payments unavailable', verified: false },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    reference: url.searchParams.get('reference') ?? url.searchParams.get('trxref'),
    purpose: url.searchParams.get('purpose'),
    workshopId: url.searchParams.get('workshopId') ?? undefined,
    email: url.searchParams.get('email') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid verification request.', verified: false },
      { status: 400 },
    );
  }

  const { reference, purpose, workshopId, email } = parsed.data;

  let expectedAmountKobo = APPLICATION_FEE_KOBO;
  let expectedUserId: string | undefined;
  let expectedWorkshopId: string | undefined;
  const expectedEmail = email;

  if (purpose === 'community_application') {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server not configured.', verified: false }, { status: 503 });
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized', verified: false }, { status: 401 });
    }
    expectedUserId = user.id;
  } else {
    if (!workshopId) {
      return NextResponse.json(
        { error: 'workshopId is required.', verified: false },
        { status: 400 },
      );
    }
    const workshop = await fetchWorkshopById(workshopId);
    if (!workshop) {
      return NextResponse.json({ error: 'Workshop not found.', verified: false }, { status: 404 });
    }
    expectedAmountKobo = amountKoboForPurpose('workshop_registration', workshop.feeAmountNaira);
    expectedWorkshopId = workshopId;
  }

  const result = await assertPaystackPayment({
    reference,
    purpose: purpose as PaystackPurpose,
    expectedAmountKobo,
    expectedEmail,
    expectedUserId,
    expectedWorkshopId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error, verified: false }, { status: 400 });
  }

  return NextResponse.json({ verified: true, reference: result.reference });
}
