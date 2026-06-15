import { z } from 'zod';

export const igniteRegistrationSchema = z.object({
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
  lookingForwardTo: z
    .string()
    .trim()
    .min(1, 'Please tell us what you are looking forward to')
    .max(2000, 'Response is too long'),
});

export type IgniteRegistrationInput = z.infer<typeof igniteRegistrationSchema>;
