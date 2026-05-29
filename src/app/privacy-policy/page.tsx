import type { Metadata } from 'next';
import Link from 'next/link';

import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { buildPageMetadata } from '@/lib/seo/site';
import { getSiteSettings } from '@/lib/site-settings-server';

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description:
    'How Emprinte collects, uses, stores, and shares information when you use our website and mobile app.',
  path: '/privacy-policy',
});

const shell =
  'mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-[75px] xl:max-w-[1320px] xl:px-[120px]';

const p =
  'font-poppins text-sm leading-[1.75] text-[#2d3640] sm:text-base sm:leading-[1.72]';
const h2 =
  'mt-10 font-lora text-lg font-bold text-[#142218] first:mt-0 sm:text-xl';
const h3 = 'mt-6 font-lora text-base font-bold text-[#142218] sm:text-lg';
const ul = 'mt-3 list-disc space-y-2 pl-5 font-poppins text-sm text-[#2d3640] sm:text-base';

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();

  return (
    <main className="relative flex min-h-screen w-full flex-col bg-[#f4faf8]">
      <Header contactEmail={settings.contactInfo.email} />

      <article className="w-full flex-1 bg-[#f4faf8] pb-14 pt-8 md:pb-16 md:pt-10">
        <div className={shell}>
          <header className="border-b border-[#005D51]/15 pb-8">
            <h1 className="font-lora text-2xl font-bold leading-snug text-[#142218] sm:text-3xl">
              Privacy Policy for Emprinte
            </h1>
            <p className={`${p} mt-3 text-[#5a6570]`}>
              Last updated: April 3, 2026
            </p>
          </header>

          <div className="pt-8">
            <h2 className={h2}>1. Who we are</h2>
            <p className={`${p} mt-3`}>
              Emprinte Readers Hub (&quot;we&quot;, &quot;us&quot;) operates the
              mobile app Emprinte (the &quot;App&quot;).
            </p>
            <p className={`${p} mt-3`}>
              Contact:{' '}
              <a
                href="mailto:hello@emprintereaders.com"
                className="font-semibold text-[#005D51] underline-offset-2 hover:underline"
              >
                hello@emprintereaders.com
              </a>
            </p>

            <h2 className={h2}>2. What this policy covers</h2>
            <p className={`${p} mt-3`}>
              This policy describes how we collect, use, store, and share
              information when you use the App. By using the App, you agree to
              this policy.
            </p>

            <h2 className={h2}>3. Information we collect</h2>

            <h3 className={h3}>3.1 You provide</h3>
            <ul className={ul}>
              <li>
                <strong>Account:</strong> name, email, phone number (if you
                create an account), password (stored securely; we do not store it
                in plain text), username or profile details you choose.
              </li>
              <li>
                <strong>Profile &amp; community:</strong> profile photo or
                images you upload; posts, comments, quotes, or other content you
                submit in community features.
              </li>
              <li>
                <strong>Reading &amp; productivity:</strong> reading progress,
                goals, to-dos, notes, highlights, bookmarks, and similar data
                you save in the App.
              </li>
              <li>
                <strong>Books &amp; files:</strong> metadata and files (e.g.
                PDFs) you upload for reading in the App.
              </li>
              <li>
                <strong>Membership:</strong> we store information about your
                community membership tier and status on our systems when our
                team activates or updates your account. Application and payment
                for membership are <strong>not</strong> completed inside the
                App; they take place through our processes outside the App (for
                example web forms, email, or staff). The App shows plan
                summaries <strong>for reference only</strong> and does{' '}
                <strong>not</strong> process membership payments or store
                payment card details.
              </li>
            </ul>

            <h3 className={h3}>3.2 Automatically</h3>
            <ul className={ul}>
              <li>
                <strong>Device &amp; app:</strong> device type, operating
                system, app version, and technical logs needed to run the App
                and fix errors.
              </li>
              <li>
                <strong>Push notifications:</strong> if you opt in, a push token
                so we can send reminders and updates you have agreed to.
              </li>
              <li>
                <strong>Usage:</strong> we use{' '}
                <strong>Google Firebase Cloud Messaging (FCM)</strong> together
                with <strong>Expo</strong> notification tooling to deliver push
                notifications you opt into. We do <strong>not</strong> use
                Firebase for advertising analytics.
              </li>
            </ul>

            <h2 className={h2}>4. Permissions</h2>
            <p className={`${p} mt-3`}>The App may request access to:</p>
            <ul className={ul}>
              <li>
                <strong>Camera / photos</strong> – to take or choose images for
                your profile or to share in the community, when you use those
                features.
              </li>
              <li>
                <strong>Storage</strong> – to import or open documents (e.g.
                PDFs) where the system requires it.
              </li>
              <li>
                <strong>Notifications</strong> – only if you enable them.
              </li>
              <li>
                <strong>Microphone</strong> – on <strong>Android</strong>, the
                App may <strong>declare</strong> microphone-related permission
                because of how the operating system or included libraries expose
                capabilities. <strong>We do not use the microphone to record you</strong>, and{' '}
                <strong>we do not collect or store audio</strong> from the App
                for our own purposes.
              </li>
            </ul>
            <p className={`${p} mt-3`}>
              You can change many permissions in your device settings; some
              features may not work without them.
            </p>

            <h2 className={h2}>5. How we use your information</h2>
            <ul className={ul}>
              <li>
                To provide and improve the App (reading, library, goals,
                community, bootcamps, etc.).
              </li>
              <li>
                To create and manage your account and to show your membership
                tier and status when applicable.
              </li>
              <li>
                To send service-related messages and, if you opt in, push
                notifications.
              </li>
              <li>
                To keep the App secure, prevent abuse, and comply with the law.
              </li>
            </ul>
            <p className={`${p} mt-3`}>
              <strong>Guests (signed out):</strong> you may use parts of the App
              without an account. Reading-related data you create in that mode
              is stored <strong>on your device</strong> and is{' '}
              <strong>not</strong> synced to our servers until you create an
              account and we associate or migrate that data as part of
              onboarding. Until then we do not use that on-device guest data
              for server-side profiling.
            </p>

            <h2 className={h2}>6. Legal bases (if you have users in the UK/EEA)</h2>
            <ul className={ul}>
              <li>
                <strong>Registered members:</strong> we rely on{' '}
                <strong>performance of a contract</strong> where processing is
                needed to provide your account and membership features;{' '}
                <strong>legitimate interests</strong> (security, improving the
                App, where not overridden by your rights);{' '}
                <strong>consent</strong> where required (for example optional
                notifications); and <strong>legal obligations</strong>.
              </li>
              <li>
                <strong>Guests:</strong> where UK/EEA law applies we rely on{' '}
                <strong>legitimate interests</strong> in providing optional
                guest features and on <strong>consent</strong> where required (for
                example if you opt into notifications before signing up, if
                offered).
              </li>
            </ul>

            <h2 className={h2}>7. Who we share information with</h2>
            <p className={`${p} mt-3`}>
              We use service providers who process data on our instructions:
            </p>
            <ul className={ul}>
              <li>
                <strong>Supabase</strong> – database, authentication, and related
                cloud infrastructure for accounts and synced data.
              </li>
              <li>
                <strong>Google Firebase Cloud Messaging</strong> and{' '}
                <strong>platform notification services</strong> (used with
                Expo) – to deliver push notifications you opt into.
              </li>
              <li>
                <strong>External links:</strong> when you open links that leave
                the App (for example an application form in your browser), the
                site or service you open applies its own privacy policy; we do
                not control that processing.
              </li>
            </ul>
            <p className={`${p} mt-3`}>
              We do <strong>not</strong> sell your personal information. We may
              disclose information if the law requires it or to protect rights
              and safety.
            </p>

            <h2 className={h2}>8. International transfers</h2>
            <p className={`${p} mt-3`}>
              Your information may be processed in countries where our service
              providers operate. We use appropriate safeguards where required by
              law.
            </p>

            <h2 className={h2}>9. Retention</h2>
            <p className={`${p} mt-3`}>
              We keep information as long as your account is active and as
              needed to provide the App, comply with law, resolve disputes, and
              enforce our terms. You may ask us to delete your account; some
              information may be retained where the law requires. See{' '}
              <Link
                href="/request-account-deletion"
                className="font-semibold text-[#005D51] underline-offset-2 hover:underline"
              >
                Request account deletion
              </Link>{' '}
              for how to submit a deletion request.
            </p>

            <h2 className={h2}>10. Security</h2>
            <p className={`${p} mt-3`}>
              We use technical and organisational measures designed to protect
              your information. No method of transmission or storage is 100%
              secure.
            </p>

            <h2 className={h2}>11. Your rights</h2>
            <p className={`${p} mt-3`}>
              Depending on where you live, you may have the right to access,
              correct, delete, or export your data, to object to or restrict
              certain processing, and to withdraw consent where processing is
              consent-based. To exercise these rights, contact{' '}
              <a
                href="mailto:hello@emprintereaders.com"
                className="font-semibold text-[#005D51] underline-offset-2 hover:underline"
              >
                hello@emprintereaders.com
              </a>
              . For account and data deletion specifically, follow the steps on{' '}
              <Link
                href="/request-account-deletion"
                className="font-semibold text-[#005D51] underline-offset-2 hover:underline"
              >
                Request account deletion
              </Link>
              . You may also complain to your local data protection authority.
            </p>

            <h2 className={h2}>12. Children</h2>
            <p className={`${p} mt-3`}>
              The App is not directed at children under 13. We do not knowingly
              collect personal information from children below that age. If you
              believe we have, contact us and we will delete it.
            </p>

            <h2 className={h2}>13. Changes</h2>
            <p className={`${p} mt-3`}>
              We may update this policy. We will post the new version in the App
              or on{' '}
              <a
                href="https://www.emprintereaders.com/privacy-policy"
                className="font-semibold text-[#005D51] underline-offset-2 hover:underline"
              >
                https://www.emprintereaders.com/privacy-policy
              </a>{' '}
              and update the &quot;Last updated&quot; date. Continued use after
              changes means you accept the updated policy where the law allows.
            </p>

            <h2 className={h2}>14. Contact</h2>
            <p className={`${p} mt-3`}>
              Questions about this policy:{' '}
              <a
                href="mailto:hello@emprintereaders.com"
                className="font-semibold text-[#005D51] underline-offset-2 hover:underline"
              >
                hello@emprintereaders.com
              </a>
            </p>
          </div>
        </div>
      </article>

      <Footer contactInfo={settings.contactInfo} />
    </main>
  );
}
