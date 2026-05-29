export type BuildAReaderFaqPart =
  | string
  | { href: string; label: string; external?: boolean };

export type BuildAReaderFaqItem = {
  question: string;
  answer: BuildAReaderFaqPart[];
};

/** Edit Q&A here without touching layout code. */
export const BUILD_A_READER_FAQ: BuildAReaderFaqItem[] = [
  {
    question: 'What is #BuildAReader?',
    answer: [
      '#BuildAReader is Emprinte Readers Hub’s literacy campaign — putting books in the hands of young readers across Africa, alongside mentorship and reading programs. The goal is to grow thoughtful readers who can lead with clarity and empathy in their communities.',
    ],
  },
  {
    question: 'Who is this partnership proposal for?',
    answer: [
      'This page is for organisations exploring sponsorship at scale — brands, foundations, schools, and community partners who want to fund books, school visits, and reader programs with Emprinte. If you want to give as an individual, use our ',
      { href: '/donate', label: 'donate page' },
      ' instead.',
    ],
  },
  {
    question: 'How can my organisation partner with Emprinte?',
    answer: [
      'Email ',
      {
        href: 'mailto:projects@emprintereaders.com',
        label: 'projects@emprintereaders.com',
        external: true,
      },
      ' with a short note about your organisation and what you have in mind. The team will follow up on sponsorship tiers, logistics, and school visits — you do not need a formal proposal before reaching out.',
    ],
  },
  {
    question: 'Can individuals support the campaign?',
    answer: [
      'Yes. Visit ',
      { href: '/donate', label: '/donate' },
      ' to give any amount securely through Paystack. Gifts support book sourcing, distribution, and reader programs in the communities Emprinte serves.',
    ],
  },
  {
    question: 'Where do the books and programs go?',
    answer: [
      'Books and reading activities reach young readers through Emprinte’s book clubs, partner schools, and community programs. Campaign progress — books funded toward the current goal — is shown on the ',
      { href: '/', label: 'homepage' },
      ' in the BuildAReader section.',
    ],
  },
  {
    question: 'Are donations tax-deductible?',
    answer: [
      'Emprinte cannot provide tax advice. Donations go directly to the #BuildAReader initiative. Whether a gift is tax-deductible where you live depends on local rules and your situation. Give only what you can afford.',
    ],
  },
];

export function faqAnswerToPlainText(parts: BuildAReaderFaqPart[]): string {
  return parts
    .map((part) => (typeof part === 'string' ? part : part.label))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}
