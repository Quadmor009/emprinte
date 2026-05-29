import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo/site';

export const metadata: Metadata = buildPageMetadata({
  title: 'Workshop Registration',
  description:
    'Register for Practical Steps to Financial Independence — an exclusive Emprinte workshop.',
  path: '/workshop/register',
});

export default function WorkshopRegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white text-[#142218] antialiased">{children}</div>
  );
}
