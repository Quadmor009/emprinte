import { NextResponse } from 'next/server';
import { z } from 'zod';

import { fetchBuildAReaderRow } from '@/lib/landing-build-a-reader-db';
import { fetchWorkshopById } from '@/lib/landing-workshops-db';
import {
  APPLICATION_FEE_KOBO,
  DONATION_MAX_NAIRA,
  type PaystackPurpose,
} from '@/lib/paystack/constants';
import {
  amountKoboForPurpose,
  generatePaystackReference,
  initializePaystackTransaction,
  isPaystackConfigured,
  resolveSiteOrigin,
} from '@/lib/paystack/server';
import { validateDonationAmountNaira } from '@/lib/validation/donation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const bodySchema = z.object({
  purpose: z.enum([
    'community_application',
    'workshop_registration',
    'build_a_reader_donation',
  ]),
  email: z.string().trim().email(),
  callbackPath: z.string().trim().min(1).max(500),
  workshopId: z.string().uuid().optional(),
  amountNaira: z.number().int().positive().optional(),
  fullName: z.string().trim().min(1).max(200).optional(),
  message: z.string().trim().max(2000).optional(),
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

  const { purpose, email, callbackPath, workshopId, amountNaira, fullName, message } =
    parsed.data;
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
  } else if (purpose === 'build_a_reader_donation') {
    if (!fullName?.trim()) {
      return NextResponse.json({ error: 'Name is required for donations.' }, { status: 400 });
    }
    if (amountNaira == null) {
      return NextResponse.json({ error: 'Donation amount is required.' }, { status: 400 });
    }

    const campaign = await fetchBuildAReaderRow();
    const pricePerBook = campaign?.pricePerBook ?? 0;
    if (pricePerBook <= 0) {
      return NextResponse.json(
        { error: 'Donations are not configured yet. Try again later.' },
        { status: 503 },
      );
    }

    const amountError = validateDonationAmountNaira(amountNaira, pricePerBook);
    if (amountError) {
      return NextResponse.json({ error: amountError }, { status: 400 });
    }
    if (amountNaira > DONATION_MAX_NAIRA) {
      return NextResponse.json(
        { error: `Maximum donation is ₦${DONATION_MAX_NAIRA.toLocaleString()}.` },
        { status: 400 },
      );
    }

    amountKobo = amountKoboForPurpose('build_a_reader_donation', null, amountNaira);
    metadata = {
      ...metadata,
      full_name: fullName.trim(),
      amount_naira: amountNaira,
      ...(message?.trim() ? { message: message.trim() } : {}),
    };
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
