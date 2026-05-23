import { NextResponse } from 'next/server';

import { verifyPaystackWebhookSignature } from '@/lib/paystack/server';

/** Paystack webhook — validates signature; submissions verify payment again on save. */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature');

  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; status?: string } };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.info('[paystack webhook]', event.event, event.data?.reference, event.data?.status);
  }

  return NextResponse.json({ received: true });
}
