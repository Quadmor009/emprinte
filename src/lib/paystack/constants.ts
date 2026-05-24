/** Paystack amounts and purpose keys for landing-site checkout. */

export const PAYSTACK_API_BASE = 'https://api.paystack.co';

/** Community membership application fee (naira). */
export const APPLICATION_FEE_NAIRA = 3000;

export const APPLICATION_FEE_KOBO = APPLICATION_FEE_NAIRA * 100;

export type PaystackPurpose =
  | 'community_application'
  | 'workshop_registration'
  | 'build_a_reader_donation';

/** Quick-pick amounts on /donate (naira). */
export const DONATION_PRESET_NAIRA = [50_000, 100_000, 200_000] as const;

export const DONATION_MAX_NAIRA = 2_000_000;

export const PAYSTACK_SESSION_KEYS = {
  applyDraft: 'emprinte:apply:draft',
  applyPaymentRef: 'emprinte:apply:paymentRef',
  workshopDraft: (workshopId: string) => `emprinte:workshop:draft:${workshopId}`,
  workshopPaymentRef: (workshopId: string) => `emprinte:workshop:paymentRef:${workshopId}`,
  donationPending: 'emprinte:donation:pending',
} as const;
