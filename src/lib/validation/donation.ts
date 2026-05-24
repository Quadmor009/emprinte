import { z } from 'zod';

import {
  DONATION_MAX_NAIRA,
} from '@/lib/paystack/constants';

export const donationFormSchema = z
  .object({
    fullName: z.string().trim().max(200).optional().or(z.literal('')),
    email: z.string().trim().email('Enter a valid email.'),
    message: z.string().trim().max(2000).optional().or(z.literal('')),
    anonymous: z.boolean().optional(),
    amountNaira: z
      .number({ error: 'Enter a donation amount.' })
      .int('Amount must be a whole naira value.')
      .positive('Amount must be greater than zero.'),
  })
  .refine((d) => d.anonymous || (d.fullName && d.fullName.length >= 1), {
    message: 'Name is required unless donating anonymously.',
    path: ['fullName'],
  });

export type DonationFormValues = z.infer<typeof donationFormSchema>;

export function validateDonationAmountNaira(
  amountNaira: number,
  pricePerBook: number,
): string | null {
  if (!Number.isFinite(amountNaira) || amountNaira <= 0) {
    return 'Enter a valid donation amount.';
  }
  const min = Math.max(1, Math.floor(pricePerBook));
  if (amountNaira < min) {
    return `Minimum donation is ₦${min.toLocaleString()} (one book).`;
  }
  if (amountNaira > DONATION_MAX_NAIRA) {
    return `Maximum donation is ₦${DONATION_MAX_NAIRA.toLocaleString()}.`;
  }
  return null;
}

export const paystackDonationReferencePattern = /^emp_don_[a-z0-9]{8,40}$/i;
