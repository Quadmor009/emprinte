import { z } from 'zod';

export const genderSchema = z.enum(['male', 'female']);

export const professionalStatusSchema = z.enum([
  'student_nysc',
  'employed',
  'entrepreneur',
  'unemployed',
]);

export const planChoiceSchema = z.enum(['quarterly', 'monthly', 'student']);

export const consistentReaderSchema = z.enum(['yes', 'no', 'not_sure']);

export const booksLast12MonthsSchema = z.enum([
  '0',
  '1-3',
  '3-5',
  '5-10',
  'more_than_10',
]);

export const bookTypeSchema = z.enum([
  'finance',
  'relationship',
  'psychology',
  'spiritual',
  'business',
  'science',
  'other',
]);

export type BookType = z.infer<typeof bookTypeSchema>;

export const weekendCommitmentSchema = z.enum(['yes', 'no']);

export const referralSourceSchema = z.enum([
  'facebook',
  'twitter',
  'instagram',
  'linkedin',
  'community_member',
  'other',
]);

const paystackReferencePattern = /^emp_(app|wks)_[a-z0-9]{8,40}$/i;

export const communityApplicationSubmitSchema = z
  .object({
    firstName: z.string().trim().min(1).max(120),
    lastName: z.string().trim().min(1).max(120),
    phone: z
      .string()
      .trim()
      .min(5)
      .max(80)
      .regex(/^[+()\d\s.-]{5,}$/, 'Please enter a valid phone number'),
    gender: genderSchema,
    dateOfBirth: z.string().trim().min(1),
    location: z.string().trim().min(1).max(300),
    professionalStatus: professionalStatusSchema,
    planChoice: planChoiceSchema,
    consistentReader: consistentReaderSchema,
    booksLast12Months: booksLast12MonthsSchema,
    bookTypes: z.array(bookTypeSchema).min(1),
    bookTypesOther: z.string().trim().max(500).optional().nullable(),
    weekendCommitment: weekendCommitmentSchema,
    commitmentScale: z.coerce.number().int().min(1).max(10),
    readingGoals12m: z.string().trim().min(1).max(4000),
    portraitStoragePath: z.string().trim().min(1).max(500),
    paymentReference: z.string().trim().min(1).max(120),
    referralSource: referralSourceSchema,
    referralOther: z.string().trim().max(500).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const dob = Date.parse(data.dateOfBirth);
    if (Number.isNaN(dob)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid date of birth',
        path: ['dateOfBirth'],
      });
    }
    if (!paystackReferencePattern.test(data.paymentReference)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid payment reference.',
        path: ['paymentReference'],
      });
    }
    if (data.bookTypes.includes('other')) {
      const o = data.bookTypesOther?.trim();
      if (!o) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please describe other topics',
          path: ['bookTypesOther'],
        });
      }
    }
    if (data.referralSource === 'other') {
      const o = data.referralOther?.trim();
      if (!o) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please tell us how you heard about us',
          path: ['referralOther'],
        });
      }
    }
  });

export type CommunityApplicationSubmitInput = z.infer<
  typeof communityApplicationSubmitSchema
>;
