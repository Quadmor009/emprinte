import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo/site';

export const metadata: Metadata = buildPageMetadata({
  title: 'Apply',
  description:
    'Apply to join Emprinte Readers Hub — create your applicant account, complete the form, and submit your application fee receipt.',
  path: '/apply',
});

export default function ApplyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white text-[#142218] antialiased">
      {children}
    </div>
  );
}
