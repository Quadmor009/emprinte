import { fetchBuildAReaderRow, upsertBuildAReaderRow } from '@/lib/landing-build-a-reader-db';
import {
  fetchDonationByReference,
  insertDonationRow,
  type DonationRow,
} from '@/lib/landing-donations-db';
import { assertPaystackPayment } from '@/lib/paystack/assert-payment';
import type { PaystackVerifyData } from '@/lib/paystack/server';

function metadataString(meta: Record<string, unknown>, key: string): string | null {
  const v = meta[key];
  if (typeof v === 'string' && v.trim()) {
    return v.trim();
  }
  return null;
}

export type CompleteDonationResult =
  | { ok: true; donation: DonationRow; booksCredited: number; alreadyRecorded: boolean }
  | { ok: false; error: string };

/** Books funded by amount; progress bar only increases up to campaign goal. */
export function booksCreditedFromDonation(args: {
  amountKobo: number;
  pricePerBook: number;
  booksCollected: number;
  totalBooks: number;
}): number {
  const price = Math.max(1, Math.floor(args.pricePerBook));
  const amountNaira = Math.floor(args.amountKobo / 100);
  const equivalent = Math.floor(amountNaira / price);
  const headroom = Math.max(0, args.totalBooks - args.booksCollected);
  return Math.min(equivalent, headroom);
}

export async function completeDonationFromReference(
  reference: string,
): Promise<CompleteDonationResult> {
  const ref = reference.trim();
  if (!ref) {
    return { ok: false, error: 'Payment reference is required.' };
  }

  const existing = await fetchDonationByReference(ref);
  if (existing) {
    return {
      ok: true,
      donation: existing,
      booksCredited: existing.books_credited,
      alreadyRecorded: true,
    };
  }

  const campaign = await fetchBuildAReaderRow();
  if (!campaign || campaign.pricePerBook <= 0) {
    return { ok: false, error: 'Donations are not configured yet. Try again later.' };
  }

  const minNaira = Math.max(1, Math.floor(campaign.pricePerBook));

  const payment = await assertPaystackPayment({
    reference: ref,
    purpose: 'build_a_reader_donation',
    expectedAmountKobo: 0,
    skipAmountCheck: true,
    skipConsumedCheck: true,
  });

  if (!payment.ok) {
    return { ok: false, error: payment.error };
  }

  const tx = payment.transaction;
  const amountError = validateDonationTransactionAmount(tx, minNaira);
  if (amountError) {
    return { ok: false, error: amountError };
  }

  const anonymous = tx.metadata.anonymous === true || tx.metadata.anonymous === 'true';
  const fullName = metadataString(tx.metadata, 'full_name') ?? (anonymous ? 'Anonymous Donor' : null);
  const email =
    metadataString(tx.metadata, 'email') ??
    tx.customerEmail?.trim() ??
    null;
  const message = metadataString(tx.metadata, 'message');

  if (!fullName) {
    return { ok: false, error: 'Donation details are incomplete. Contact support with your reference.' };
  }
  if (!email) {
    return { ok: false, error: 'Donation email is missing. Contact support with your reference.' };
  }

  const booksToCredit = booksCreditedFromDonation({
    amountKobo: tx.amount,
    pricePerBook: campaign.pricePerBook,
    booksCollected: campaign.booksCollected,
    totalBooks: campaign.totalBooks,
  });

  const donation = await insertDonationRow({
    fullName,
    email,
    message,
    amountKobo: tx.amount,
    booksCredited: booksToCredit,
    paymentReference: tx.reference,
    anonymous,
  });

  if (!donation) {
    return { ok: false, error: 'Could not save your donation. Contact support with your Paystack reference.' };
  }

  if (booksToCredit > 0) {
    const updated = await upsertBuildAReaderRow({
      ...campaign,
      booksCollected: campaign.booksCollected + booksToCredit,
    });
    if (!updated) {
      console.error('[donations] books_collected bump failed after insert', tx.reference);
    }
  }

  return {
    ok: true,
    donation,
    booksCredited: booksToCredit,
    alreadyRecorded: false,
  };
}

function validateDonationTransactionAmount(
  tx: PaystackVerifyData,
  minNaira: number,
): string | null {
  const metaAmount = metadataString(tx.metadata, 'amount_naira');
  const paidNaira = Math.floor(tx.amount / 100);

  if (metaAmount) {
    const expected = parseInt(metaAmount, 10);
    if (Number.isFinite(expected) && expected !== paidNaira) {
      return 'Payment amount does not match checkout.';
    }
  }

  if (paidNaira < minNaira) {
    return `Minimum donation is ₦${minNaira.toLocaleString()} (one book).`;
  }

  if (paidNaira > 2_000_000) {
    return 'Donation amount exceeds the maximum allowed.';
  }

  return null;
}
