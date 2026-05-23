import type { FinancialCategory } from '@/lib/validation/workshop-registration';
import type { WorkshopPublic } from '@/lib/landing-workshops-db';

export const DEFAULT_WORKSHOP_SLUG =
  process.env.NEXT_PUBLIC_WORKSHOP_SLUG ?? 'practical-steps-financial-independence';

export const FINANCIAL_CATEGORY_OPTIONS: {
  value: FinancialCategory;
  label: string;
  hint: string;
}[] = [
  {
    value: 'borrower',
    label: 'Borrower',
    hint: 'Most income goes to repaying debt or loans.',
  },
  {
    value: 'spender',
    label: 'Spender',
    hint: 'Money flows out quickly — little left to plan with.',
  },
  {
    value: 'saver',
    label: 'Saver',
    hint: 'You set money aside, but growth may still feel unclear.',
  },
  {
    value: 'lender_investor',
    label: 'Lender / Investor',
    hint: 'You already deploy money — you want sharper systems.',
  },
];

export const WORKSHOP_STEP_ABOUT = {
  short: 'You',
  title: 'About you',
  subtitle: 'How we reach you and what you hope to gain from the session.',
} as const;

export const WORKSHOP_STEP_MONEY = {
  short: 'Money',
  title: 'Your money picture',
  subtitle: 'Honest answers help us shape examples and Q&A for the room.',
} as const;

export const WORKSHOP_FEE_NAIRA = '5,000';

export const WORKSHOP_STEP_PAYMENT = {
  short: 'Pay',
  title: 'Workshop fee',
  subtitle: 'Pay securely with Paystack before we confirm your seat.',
} as const;

export const WORKSHOP_PAYMENT_COPY = {
  heading: 'Non-members',
  feeLine: `You are required to pay a workshop fee of ₦${WORKSHOP_FEE_NAIRA} before proceeding.`,
} as const;

export const WORKSHOP_PAGE_COPY = {
  kicker: 'Exclusive workshop',
  title: 'Practical Steps to Financial Independence',
  lead: 'A focused session for young professionals and entrepreneurs ready to build a clearer system for keeping and growing money.',
  privacyNote:
    'Your answers are used only to plan this workshop. We do not sell your data.',
};

export const WORKSHOP_PAGE_FALLBACK = {
  kicker: WORKSHOP_PAGE_COPY.kicker,
  privacyNote: WORKSHOP_PAGE_COPY.privacyNote,
};

export function formatFeeNaira(amount: number | null | undefined): string {
  if (amount == null || amount <= 0) return '5,000';
  return amount.toLocaleString('en-NG');
}

export function paymentFeeLine(workshop: WorkshopPublic): string {
  const fee = formatFeeNaira(workshop.feeAmountNaira);
  return `You are required to pay a workshop fee of ₦${fee} before proceeding.`;
}

export function pageCopyFromWorkshop(workshop: WorkshopPublic) {
  return {
    kicker: WORKSHOP_PAGE_FALLBACK.kicker,
    title: workshop.title,
    lead: workshop.landingLead ?? workshop.description,
    privacyNote: WORKSHOP_PAGE_FALLBACK.privacyNote,
  };
}

export function whatsappUrlForWorkshop(workshop: WorkshopPublic): string | null {
  const url = workshop.whatsappGroupUrl?.trim();
  return url || null;
}

export const WORKSHOP_WHATSAPP_GROUP_URL =
  process.env.NEXT_PUBLIC_WORKSHOP_WHATSAPP_GROUP_URL ??
  'https://chat.whatsapp.com/KT3Krko9PfaB5yx6hfTGUq';

export const WORKSHOP_THANK_YOU_COPY = {
  title: 'You’re registered',
  body: 'Your spot is saved. Join the waiting group on WhatsApp so we can share venue details, reminders, and pre-work before the session.',
  cta: 'Join WhatsApp group',
};
