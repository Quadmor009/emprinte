import { createSupabaseServiceRoleClient } from '@/lib/supabase/db';
import { type PaystackPurpose } from '@/lib/paystack/constants';
import { type PaystackVerifyData, verifyPaystackReference } from '@/lib/paystack/server';

export type AssertPaymentArgs = {
  reference: string;
  purpose: PaystackPurpose;
  expectedAmountKobo: number;
  expectedEmail?: string;
  expectedUserId?: string;
  expectedWorkshopId?: string;
  /** Donations validate amount separately against campaign min/max. */
  skipAmountCheck?: boolean;
  /** Allow re-reading a reference already stored for this flow (donation idempotency). */
  skipConsumedCheck?: boolean;
};

export type AssertPaymentResult =
  | { ok: true; reference: string; transaction: PaystackVerifyData }
  | { ok: false; error: string };

function metadataString(meta: Record<string, unknown>, key: string): string | null {
  const v = meta[key];
  if (typeof v === 'string' && v.trim()) {
    return v.trim();
  }
  return null;
}

export async function isPaymentReferenceConsumed(reference: string): Promise<boolean> {
  const admin = createSupabaseServiceRoleClient();
  if (!admin) {
    return false;
  }

  const ref = reference.trim();
  const [{ data: apps }, { data: workshops }, { data: donations }] = await Promise.all([
    admin
      .schema('landing')
      .from('community_applications')
      .select('id')
      .eq('payment_reference', ref)
      .limit(1),
    admin
      .schema('landing')
      .from('workshop_registrations')
      .select('id')
      .eq('payment_reference', ref)
      .limit(1),
    admin
      .schema('landing')
      .from('donations')
      .select('id')
      .eq('payment_reference', ref)
      .limit(1),
  ]);

  return Boolean(
    (apps && apps.length > 0) ||
      (workshops && workshops.length > 0) ||
      (donations && donations.length > 0),
  );
}

export async function assertPaystackPayment(
  args: AssertPaymentArgs,
): Promise<AssertPaymentResult> {
  const reference = args.reference.trim();
  if (!reference) {
    return { ok: false, error: 'Payment reference is required.' };
  }

  if (!args.skipConsumedCheck && (await isPaymentReferenceConsumed(reference))) {
    return { ok: false, error: 'This payment has already been used.' };
  }

  const tx = await verifyPaystackReference(reference);
  if (!tx) {
    return { ok: false, error: 'We could not verify your payment. Try again or contact support.' };
  }

  if (tx.status !== 'success') {
    return { ok: false, error: 'Payment was not completed. Please pay before submitting.' };
  }

  if (tx.currency !== 'NGN') {
    return { ok: false, error: 'Payment currency is not supported.' };
  }

  if (!args.skipAmountCheck && tx.amount !== args.expectedAmountKobo) {
    return { ok: false, error: 'Payment amount does not match the expected fee.' };
  }

  const metaPurpose = metadataString(tx.metadata, 'purpose');
  if (metaPurpose !== args.purpose) {
    return { ok: false, error: 'Payment does not match this checkout.' };
  }

  if (args.expectedUserId) {
    const metaUser = metadataString(tx.metadata, 'user_id');
    if (metaUser !== args.expectedUserId) {
      return { ok: false, error: 'Payment does not match your account.' };
    }
  }

  if (args.expectedWorkshopId) {
    const metaWorkshop = metadataString(tx.metadata, 'workshop_id');
    if (metaWorkshop !== args.expectedWorkshopId) {
      return { ok: false, error: 'Payment does not match this workshop.' };
    }
  }

  if (args.expectedEmail) {
    const expected = args.expectedEmail.trim().toLowerCase();
    const paidEmail = (tx.customerEmail ?? metadataString(tx.metadata, 'email') ?? '')
      .trim()
      .toLowerCase();
    if (paidEmail && paidEmail !== expected) {
      return { ok: false, error: 'Payment email does not match your registration email.' };
    }
  }

  return { ok: true, reference: tx.reference, transaction: tx };
}
