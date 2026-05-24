import { NextResponse } from 'next/server';
import { z } from 'zod';

import { completeDonationFromReference } from '@/lib/donation-complete';
import { isPaystackConfigured } from '@/lib/paystack/server';

const bodySchema = z.object({
  reference: z.string().trim().min(1),
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
    return NextResponse.json({ error: 'Payment reference is required.' }, { status: 400 });
  }

  const result = await completeDonationFromReference(parsed.data.reference);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, completed: false }, { status: 400 });
  }

  const amountNaira = Math.floor(result.donation.amount_kobo / 100);

  return NextResponse.json({
    completed: true,
    alreadyRecorded: result.alreadyRecorded,
    donation: {
      fullName: result.donation.full_name,
      email: result.donation.email,
      amountNaira,
      booksCredited: result.booksCredited,
      paymentReference: result.donation.payment_reference,
    },
  });
}
