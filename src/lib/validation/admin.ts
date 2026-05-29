import { z } from 'zod';

import { validateArticleImageUrl } from '@/lib/article-image-url';

export const insightSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  body: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : undefined)),
  date: z.string().trim().min(1, 'Date is required'),
  image: z
    .string()
    .url('Image must be a valid URL')
    .superRefine((val, ctx) => {
      const msg = validateArticleImageUrl(val);
      if (msg) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: msg });
      }
    }),
  href: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? v : undefined)),
  authorName: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v == null || typeof v !== 'string') return undefined;
      const t = v.trim();
      return t.length ? t.slice(0, 120) : undefined;
    }),
  authorRole: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v == null || typeof v !== 'string') return undefined;
      const t = v.trim();
      return t.length ? t.slice(0, 200) : undefined;
    }),
  slug: z.preprocess(
    (val) => {
      if (val === '' || val === undefined || val === null) return undefined;
      return String(val).trim().toLowerCase();
    },
    z
      .string()
      .max(96)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and single hyphens only')
      .optional(),
  ),
});

export const insightUpdateSchema = insightSchema.extend({
  id: z.string().trim().min(1),
});

export const navigationLinkSchema = z.object({
  label: z.string().trim().min(1),
  href: z.string().trim().min(1),
});

export const contactInfoSchema = z.object({
  email: z.string().trim().min(1).email('Invalid email'),
  phone: z.array(
    z.object({
      label: z.string().trim().min(1),
      number: z.string().trim().min(1),
    })
  ),
});

export const socialLinkSchema = z.object({
  platform: z.enum(['instagram', 'linkedin', 'twitter']),
  href: z.string().url('Invalid URL'),
});

export const statValueSchema = z.string().trim().min(1);

export const statSchema = z.object({
  value: statValueSchema,
  label: z.string().trim().min(1),
});

/** Partial update for PUT /api/stats/:id — `label` omitted keeps the current label. */
export const statUpdateSchema = z.object({
  value: statValueSchema,
  label: z.string().trim().min(1).optional(),
});

/** One row in PUT /api/settings `stats` — patch by stable id. */
export const settingsStatPatchEntrySchema = z.object({
  id: z.union([
    z.string().trim().min(1),
    z.number().int().min(0),
  ]),
  value: statValueSchema,
  label: z.string().trim().min(1).optional(),
});

/** PUT/PATCH `/api/settings`: all sections optional; omit `stats` to leave stats unchanged. */
export const settingsWriteSchema = z.object({
  navigationLinks: z.array(navigationLinkSchema).optional(),
  footerNavigation: z.array(navigationLinkSchema).optional(),
  socialMediaLinks: z.array(socialLinkSchema).optional(),
  contactInfo: contactInfoSchema.optional(),
  stats: z.array(settingsStatPatchEntrySchema).optional(),
});

export const buildAReaderSchema = z.object({
  booksCollected: z.number().int().min(0),
  totalBooks: z.number().int().min(1),
  pricePerBook: z.number().int().min(0),
  slideshowUrls: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(2000)
        .refine((s) => /^https?:\/\//i.test(s), 'Each slide must be an https URL'),
    )
    .max(5)
    .default([]),
});

export const testimonialSchema = z.object({
  id: z.string().trim().min(1),
  text: z.string().trim().min(1),
  name: z.string().trim().min(1),
  title: z.string().trim().min(1),
  rating: z.number().int().min(1).max(5).optional(),
});

export const testimonialsSchema = z.array(testimonialSchema);
