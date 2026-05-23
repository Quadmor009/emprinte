import { z } from 'zod';

export const financialCategoryValues = [
  'borrower',
  'spender',
  'saver',
  'lender_investor',
] as const;

export type FinancialCategory = (typeof financialCategoryValues)[number];

const paystackReferencePattern = /^emp_(app|wks)_[a-z0-9]{8,40}$/i;

export const workshopRegistrationSchema = z
  .object({
    workshopId: z.string().uuid('Workshop is required'),
    fullName: z
      .string()
      .trim()
      .min(1, 'Full name is required')
      .max(200, 'Name is too long'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    primaryGoal: z
      .string()
      .trim()
      .min(1, 'Please share your primary goal')
      .max(2000, 'Response is too long'),
    isMember: z.enum(['yes', 'no']),
    financialCategory: z.enum(financialCategoryValues),
    financeChallenges: z
      .string()
      .trim()
      .min(1, 'Please describe your challenges')
      .max(4000, 'Response is too long'),
    workshopQuestions: z
      .string()
      .trim()
      .min(1, 'Please share your questions for the workshop')
      .max(4000, 'Response is too long'),
    paymentReference: z
      .string()
      .trim()
      .max(120)
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.isMember === 'no') {
      const ref = data.paymentReference?.trim();
      if (!ref) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Paystack payment is required for non-members.',
          path: ['paymentReference'],
        });
        return;
      }
      if (!paystackReferencePattern.test(ref)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid payment reference.',
          path: ['paymentReference'],
        });
      }
    }
  });

export type WorkshopRegistrationInput = z.infer<typeof workshopRegistrationSchema>;

/** Legacy receipt uploads (pre-Paystack). */
export function isValidWorkshopReceiptPath(path: string): boolean {
  return /^anonymous\/[0-9a-f-]{36}\/receipt-[0-9]+\.[a-z0-9]+$/i.test(path.trim());
}
