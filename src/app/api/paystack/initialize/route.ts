import { NextResponse } from 'next/server';
import { z } from 'zod';

import { fetchWorkshopById } from '@/lib/landing-workshops-db';
import { APPLICATION_FEE_KOBO, type PaystackPurpose } from '@/lib/paystack/constants';
import {
  amountKoboForPurpose,
  generatePaystackReference,
  initializePaystackTransaction,
  isPaystackConfigured,
  resolveSiteOrigin,
} from '@/lib/paystack/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const bodySchema = z.object({
  purpose: z.enum(['community_application', 'workshop_registration']),
  email: z.string().trim().email(),
  callbackPath: z.string().trim().min(1).max(500),
  workshopId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  if (!isPaystackConfigured()) {
    return NextResponse.json(
      {
        error: 'Payments unavailable',
        message: 'Set PAYSTACK_SECRET_KEY to enable Paystack checkout.',
      },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { purpose, email, callbackPath, workshopId } = parsed.data;
  const origin = resolveSiteOrigin(request);
  const callbackUrl = `${origin}${callbackPath.startsWith('/') ? callbackPath : `/${callbackPath}`}`;

  let amountKobo: number;
  let metadata: Record<string, unknown> = { purpose, email: email.trim() };
  let userId: string | undefined;

  if (purpose === 'community_application') {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server not configured.' }, { status: 503 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json({ error: 'Sign in required to pay the application fee.' }, { status: 401 });
    }

    userId = user.id;
    amountKobo = APPLICATION_FEE_KOBO;
    metadata = { ...metadata, user_id: user.id };
  } else {
    if (!workshopId) {
      return NextResponse.json({ error: 'workshopId is required for workshop payments.' }, { status: 400 });
    }

    const workshop = await fetchWorkshopById(workshopId);
    if (!workshop || !workshop.registrationOpen) {
      return NextResponse.json({ error: 'Workshop registration is not open.' }, { status: 400 });
    }

    amountKobo = amountKoboForPurpose('workshop_registration', workshop.feeAmountNaira);
    metadata = { ...metadata, workshop_id: workshopId };
  }

  const reference = generatePaystackReference(purpose as PaystackPurpose);

  try {
    const checkout = await initializePaystackTransaction({
      email,
      amountKobo,
      reference,
      callbackUrl,
      metadata,
    });

    return NextResponse.json({
      authorizationUrl: checkout.authorizationUrl,
      reference: checkout.reference,
      amountKobo,
      userId: userId ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not start checkout.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
