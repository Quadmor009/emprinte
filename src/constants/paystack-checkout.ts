import { APPLICATION_FEE_NAIRA } from '@/lib/paystack/constants';

/** Community apply + workshop Paystack checkout copy. */
export const PAYSTACK_CHECKOUT_COPY = {
  applicationFeeLead: `Pay the ₦${APPLICATION_FEE_NAIRA.toLocaleString('en-NG')} application fee securely with Paystack (card, bank transfer, or USSD).`,
  applicationFeeConfirmed: 'Application fee paid',
  applicationPayCta: `Pay ₦${APPLICATION_FEE_NAIRA.toLocaleString('en-NG')} with Paystack`,
  workshopFeeLead:
    'Non-members pay the workshop fee with Paystack before we confirm your seat.',
  workshopPayCta: (feeLabel: string) => `Pay ₦${feeLabel} with Paystack`,
  paymentConfirmed: 'Payment confirmed',
  paymentPending: 'Complete payment to continue.',
  payRedirectHint: 'You will leave this page briefly to pay on Paystack, then return here to submit.',
  verifyBusy: 'Confirming payment…',
  payBusy: 'Opening Paystack…',
} as const;
