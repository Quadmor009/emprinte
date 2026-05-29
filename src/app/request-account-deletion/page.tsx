import type { Metadata } from 'next';
import Link from 'next/link';

import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { buildPageMetadata } from '@/lib/seo/site';
import { getSiteSettings } from '@/lib/site-settings-server';

export const metadata: Metadata = buildPageMetadata({
  title: 'Request account deletion',
  description:
    'How to ask us to delete your Emprinte account and associated data.',
  path: '/request-account-deletion',
});

const shell =
  'mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-[75px] xl:max-w-[1320px] xl:px-[120px]';

const p =
  'font-poppins text-sm leading-[1.75] text-[#2d3640] sm:text-base sm:leading-[1.72]';

const deletionMailto =
  'mailto:hello@emprintereaders.com?subject=Delete%20my%20account%20and%20data';

export default async function RequestAccountDeletionPage() {
  const settings = await getSiteSettings();

  return (
    <main className="relative flex min-h-screen w-full flex-col bg-[#f4faf8]">
      <Header contactEmail={settings.contactInfo.email} />

      <article className="w-full flex-1 bg-[#f4faf8] pb-14 pt-8 md:pb-16 md:pt-10">
        <div className={shell}>
          <header className="border-b border-[#005D51]/15 pb-8">
            <h1 className="font-lora text-2xl font-bold leading-snug text-[#142218] sm:text-3xl">
              Request account deletion
            </h1>
            <p className={`${p} mt-3 text-[#5a6570]`}>
              Emprinte mobile app — Emprinte Readers Hub
            </p>
          </header>

          <div className="pt-8">
            <p className={p}>
              To delete your account and the personal data we hold for it, email
              us from the <strong>same address you used to register</strong> so we
              can confirm the request.
            </p>

            <p className={`${p} mt-5`}>
              Send your message to{' '}
              <a
                href={deletionMailto}
                className="font-semibold text-[#005D51] underline-offset-2 hover:underline"
              >
                hello@emprintereaders.com
              </a>{' '}
              with a subject line such as{' '}
              <span className="font-semibold text-[#142218]">
                Delete my account and data
              </span>
              . Briefly state that you want your account and associated data
              deleted. We will process your request in line with our{' '}
              <Link
                href="/privacy-policy"
                className="font-semibold text-[#005D51] underline-offset-2 hover:underline"
              >
                Privacy Policy
              </Link>{' '}
              and applicable law. Some information may need to be kept where the
              law requires.
            </p>

            <p className={`${p} mt-5 text-[#5a6570]`}>
              If you no longer have access to your registered email, say so in
              your message and include details we can use to verify your account
              (for example the username or phone number on the account).
            </p>
          </div>
        </div>
      </article>

      <Footer contactInfo={settings.contactInfo} />
    </main>
  );
}
