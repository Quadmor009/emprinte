/** Copy for #BuildAReader donation pages. */

export const DONATE_PAGE_COPY = {
  kicker: 'Support #BuildAReader',
  title: 'Fund books for young readers',
  lead:
    'Your gift helps Emprinte Readers Hub place books in hands that need them. Every naira moves the campaign forward.',
  disclaimer:
    'Donations support the #BuildAReader initiative — book sourcing, distribution, and reader programs across our partner communities. This is not tax-deductible advice; give only what you can afford.',
  supportEmail: 'hello@emprintereaders.com',
  amountLabel: 'Choose an amount (NGN)',
  customAmountLabel: 'Or enter your amount',
  nameLabel: 'Full name',
  emailLabel: 'Email',
  messageLabel: 'Message (optional)',
  payCta: (formatted: string) => `Donate ${formatted} with Paystack`,
  openingPaystack: 'Opening Paystack…',
  thankYouTitle: 'Thank you for your gift',
  thankYouBody:
    'Your donation was received. Paystack will email your payment receipt. We are grateful you chose to build a reader with us.',
  thankYouBooks: (count: number) =>
    count === 1
      ? 'Your gift added 1 book to the campaign progress.'
      : `Your gift added ${count} books to the campaign progress.`,
  thankYouNoBooks:
    'The campaign goal has been reached — your gift is recorded and still supports the initiative.',
  backHome: 'Back to homepage',
  learnMore: 'Learn about #BuildAReader',
} as const;
