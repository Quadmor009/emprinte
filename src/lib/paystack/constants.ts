/** Paystack amounts and purpose keys for landing-site checkout. */

export const PAYSTACK_API_BASE = 'https://api.paystack.co';

/** Community membership application fee (naira). */
export const APPLICATION_FEE_NAIRA = 3000;

export const APPLICATION_FEE_KOBO = APPLICATION_FEE_NAIRA * 100;

export type PaystackPurpose = 'community_application' | 'workshop_registration';

export const PAYSTACK_SESSION_KEYS = {
  applyDraft: 'emprinte:apply:draft',
  applyPaymentRef: 'emprinte:apply:paymentRef',
  workshopDraft: (workshopId: string) => `emprinte:workshop:draft:${workshopId}`,
  workshopPaymentRef: (workshopId: string) => `emprinte:workshop:paymentRef:${workshopId}`,
} as const;
