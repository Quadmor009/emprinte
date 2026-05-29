import type { Metadata } from 'next';
import { Lora, Poppins } from 'next/font/google';

import { AppToaster } from '@/components/AppToaster';
import { DEFAULT_DESCRIPTION, getSiteOrigin, SITE_NAME } from '@/lib/seo/site';
import './globals.css';

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: {
    default: 'Transforming Africa, One Book at a Time',
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: SITE_NAME,
    title: 'Transforming Africa, One Book at a Time',
    description: DEFAULT_DESCRIPTION,
    images: [{ url: '/Logo.png', alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Transforming Africa, One Book at a Time',
    description: DEFAULT_DESCRIPTION,
    images: ['/Logo.png'],
  },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/favicon.png', type: 'image/png' }],
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: '-tp1ZZfh78sbwKsGIrmrVl6HkRW_i6S7oW3oNm92IaQ',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lora.variable} ${poppins.variable} antialiased`}>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
