import Link from 'next/link';

import { Logo } from '@/components/ui/Logo';
import { contactInfo as defaultContactInfo } from '@/constants/data';
import type { ContactInfo } from '@/types';
import { ImLinkedin2 } from 'react-icons/im';
import { RiInstagramFill } from 'react-icons/ri';

type FooterProps = {
  /** From `GET /api/settings` (`contactInfo`). */
  contactInfo?: ContactInfo;
};

const navLinkClass =
  'text-sm leading-snug text-[#7B7B7B] font-poppins py-0.5';

export function Footer({
  contactInfo = defaultContactInfo,
}: FooterProps) {
  return (
    <footer
      id="site-footer"
      className="w-full bg-white px-4 py-9 xl:px-[120px] lg:px-[64px] md:px-[32px]  "
    >
      <div className="max-w-[1440px] mx-auto  flex flex-col items-start gap-2.5">
        <div className="w-full flex flex-col items-end gap-[42px]">
          <div className="flex items-start gap-[38px] md:justify-between w-full">
            <div className="w-[224px] flex flex-col items-start gap-6">
              <Link href="/" className="inline-flex" aria-label="Emprinte home">
                <Logo />
              </Link>

              <div className="w-full flex flex-col justify-center items-start gap-[30px]">
                <div className="w-full">
                  <div className="text-base leading-[28px] font-bold text-black mb-1 font-lora">
                    Email
                  </div>
                  <div className="text-base leading-[28px] font-semibold text-[#7B7B7B] font-poppins">
                    {contactInfo.email}
                  </div>
                </div>

                <div className="w-full">
                  <div className="text-base leading-[28px] font-bold text-black mb-2 font-lora">
                    Phone
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    {contactInfo.phone.map((p) => (
                      <div
                        key={`${p.label}-${p.number}`}
                        className="text-base leading-[28px] font-semibold text-[#7B7B7B] font-poppins"
                      >
                        {p.label} - {p.number}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-[64px]">
              <div className="md:flex hidden flex-col items-start gap-3">
                <p className="text-[28px] font-bold font-lora text-black">
                  Navigation
                </p>
                <div className="flex flex-col gap-1">
                  <Link href="/" className={navLinkClass}>
                    Home
                  </Link>
                  <Link href="/blog" className={navLinkClass}>
                    Blog
                  </Link>
                  <Link href="/#bootcamps" className={navLinkClass}>
                    Bootcamps
                  </Link>
                  <Link href="/build-a-reader" className={navLinkClass}>
                    BuildAReader
                  </Link>
                  <Link href="/#about" className={navLinkClass}>
                    About Us
                  </Link>
                  <Link href="/privacy-policy" className={navLinkClass}>
                    Privacy Policy
                  </Link>
                  <Link
                    href="/request-account-deletion"
                    className={navLinkClass}
                  >
                    Request account deletion
                  </Link>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 md:gap-6">
                <div className="text-base md:text-[28px] leading-[28px] md:leading-normal font-bold text-center text-black font-lora">
                  Follow Us
                </div>

                <div className="flex flex-col md:flex-row justify-center items-start md:items-center gap-6">
                  <a
                    href="https://www.instagram.com/emprintereaders?igsh=MTU5cmcyc3QyamZtcg=="
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <RiInstagramFill color="#005D51" size={38} />
                  </a>

                  <a
                    href="https://www.linkedin.com/company/emprinte-readers/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded bg-[#005D51] flex items-center justify-center"
                    aria-label="LinkedIn"
                  >
                    <ImLinkedin2 color="#fff" size={24} />
                  </a>

                  <a
                    href="https://x.com/emprintereaders?s=21"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded bg-[#005D51] flex items-center justify-center"
                    aria-label="Twitter"
                  >
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path
                        d="M32 25.5025C32 29.0762 29.0762 32 25.5025 32H6.49746C2.92383 32 0 29.0762 0 25.5025V6.49746C0 2.9239 2.92383 0 6.49746 0H25.5025C29.0762 0 32 2.9239 32 6.49746V25.5025Z"
                        fill="#005D51"
                      />
                      <path
                        d="M18.3946 14.4043L26.092 4.81055H23.8624L17.2802 13.0151L10.6972 4.81055H3.34766L13.605 17.5952L5.90696 27.1897H8.13653L14.7195 18.9845L21.3031 27.1897H28.6527L18.3946 14.4043ZM6.972 6.54961H9.86244L25.0277 25.4505H22.1372L6.972 6.54961Z"
                        fill="#F0F0F1"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 w-full">
            <div className="w-full h-px bg-[#005D51]"></div>
            <div className="text-xs leading-[28px] font-semibold text-[#7B7B7B] font-poppins">
              @2026 Emprinte Readers Hub All Right Reserved
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
