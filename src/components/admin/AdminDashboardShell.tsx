'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  HiBars3BottomLeft,
  HiOutlineClipboardDocumentList,
  HiOutlineDocumentText,
  HiOutlineEnvelope,
  HiOutlineSquares2X2,
  HiOutlineUserCircle,
  HiOutlineUserPlus,
  HiOutlineHeart,
  HiOutlineAcademicCap,
  HiXMark,
} from 'react-icons/hi2';

import { AdminBrandLogo } from '@/components/admin/AdminBrandLogo';
import { AdminHeaderUserMenu } from '@/components/admin/AdminHeaderUserMenu';

const navIconClass =
  'size-5 shrink-0 text-[#142218]/50 transition-colors group-hover:text-[#142218]/75';
const navIconActive = 'text-[#005D51] group-hover:text-[#005D51]';

function navLinkClass(active: boolean): string {
  return [
    'group relative flex min-h-[44px] items-center gap-3 rounded-xl py-2.5 pl-3 pr-3 text-sm font-poppins transition-colors',
    'before:pointer-events-none before:absolute before:left-0 before:top-1/2 before:h-[60%] before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-[#005D51] before:transition-opacity',
    active
      ? 'bg-[#005D51]/10 font-semibold text-[#005D51] before:opacity-100'
      : 'font-medium text-[#142218]/85 before:opacity-0 hover:bg-[#005D51]/08 hover:text-[#142218]',
  ].join(' ');
}

function NavSectionTitle({ children }: { children: string }) {
  return (
    <p className="px-3 pb-1.5 pt-4 font-poppins text-[10px] font-bold uppercase tracking-[0.16em] text-[#142218]/38 first:pt-2">
      {children}
    </p>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const siteInfoActive = pathname === '/admin';
  const blogActive = pathname === '/admin/blog';
  const newsletterActive = pathname === '/admin/newsletter';
  const applicationsActive = pathname === '/admin/community-applications';
  const workshopRegistrationsActive = pathname === '/admin/workshop-registrations';
  const bootcampRegistrationsActive = pathname === '/admin/bootcamp-registrations';
  const donationsActive = pathname === '/admin/donations';
  const profileActive = pathname === '/admin/profile';
  const inviteActive = pathname === '/admin/invite';

  return (
    <>
      <NavSectionTitle>Content</NavSectionTitle>
      <div className="space-y-0.5">
        <Link
          href="/admin"
          onClick={onNavigate}
          className={navLinkClass(siteInfoActive)}
        >
          <HiOutlineSquares2X2
            className={`${navIconClass} ${siteInfoActive ? navIconActive : ''}`}
            aria-hidden
          />
          <span>Site info</span>
        </Link>
        <Link
          href="/admin/blog"
          onClick={onNavigate}
          className={navLinkClass(blogActive)}
        >
          <HiOutlineDocumentText
            className={`${navIconClass} ${blogActive ? navIconActive : ''}`}
            aria-hidden
          />
          <span>Blog</span>
        </Link>
      </div>

      <NavSectionTitle>People &amp; access</NavSectionTitle>
      <div className="space-y-0.5">
        <Link
          href="/admin/newsletter"
          onClick={onNavigate}
          className={navLinkClass(newsletterActive)}
        >
          <HiOutlineEnvelope
            className={`${navIconClass} ${newsletterActive ? navIconActive : ''}`}
            aria-hidden
          />
          <span>Newsletter subscribers</span>
        </Link>
        <Link
          href="/admin/community-applications"
          onClick={onNavigate}
          className={navLinkClass(applicationsActive)}
        >
          <HiOutlineClipboardDocumentList
            className={`${navIconClass} ${applicationsActive ? navIconActive : ''}`}
            aria-hidden
          />
          <span>Membership applications</span>
        </Link>
        <Link
          href="/admin/workshop-registrations"
          onClick={onNavigate}
          className={navLinkClass(workshopRegistrationsActive)}
        >
          <HiOutlineAcademicCap
            className={`${navIconClass} ${workshopRegistrationsActive ? navIconActive : ''}`}
            aria-hidden
          />
          <span>Workshop registrations</span>
        </Link>
        <Link
          href="/admin/bootcamp-registrations"
          onClick={onNavigate}
          className={navLinkClass(bootcampRegistrationsActive)}
        >
          <HiOutlineClipboardDocumentList
            className={`${navIconClass} ${bootcampRegistrationsActive ? navIconActive : ''}`}
            aria-hidden
          />
          <span>Bootcamp registrations</span>
        </Link>
        <Link
          href="/admin/donations"
          onClick={onNavigate}
          className={navLinkClass(donationsActive)}
        >
          <HiOutlineHeart
            className={`${navIconClass} ${donationsActive ? navIconActive : ''}`}
            aria-hidden
          />
          <span>Donations</span>
        </Link>
        <Link
          href="/admin/profile"
          onClick={onNavigate}
          className={navLinkClass(profileActive)}
        >
          <HiOutlineUserCircle
            className={`${navIconClass} ${profileActive ? navIconActive : ''}`}
            aria-hidden
          />
          <span>Profile</span>
        </Link>
        <Link
          href="/admin/invite"
          onClick={onNavigate}
          className={navLinkClass(inviteActive)}
        >
          <HiOutlineUserPlus
            className={`${navIconClass} ${inviteActive ? navIconActive : ''}`}
            aria-hidden
          />
          <span>Send invite</span>
        </Link>
      </div>
    </>
  );
}

export function AdminDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const inviteActive = pathname === '/admin/invite';
  const applicationsActive = pathname === '/admin/community-applications';
  const profileActive = pathname === '/admin/profile';
  const newsletterActive = pathname === '/admin/newsletter';
  const blogActive = pathname === '/admin/blog';

  const headerTitle = inviteActive
    ? 'Send invite'
    : applicationsActive
      ? 'Membership applications'
      : profileActive
        ? 'Profile'
        : newsletterActive
          ? 'Newsletter subscribers'
          : blogActive
            ? 'Blog'
            : 'Site info';

  const closeMobile = () => setMobileNavOpen(false);

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-[#eef5f2] text-[#142218]">
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[#142218]/25 backdrop-blur-[1px] md:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-[min(17rem,88vw)] max-w-full flex-col overflow-y-auto border-r border-[#005D51]/12 bg-white shadow-[4px_0_24px_rgba(20,34,24,0.06)] transition-transform duration-200 ease-out md:static md:z-0 md:w-56 md:shrink-0 md:translate-x-0 md:rounded-r-2xl md:shadow-none',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <div className="border-b border-[#005D51]/10 p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <AdminBrandLogo href="/admin" width={120} height={50} priority />
              <p className="mt-3 inline-flex items-center rounded-full border border-[#005D51]/15 bg-[#005D51]/06 px-2.5 py-0.5 font-poppins text-[10px] font-bold uppercase tracking-[0.18em] text-[#005D51]">
                Admin
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-[#142218]/50 hover:bg-[#005D51]/10 hover:text-[#142218] md:hidden"
              onClick={closeMobile}
              aria-label="Close navigation"
            >
              <HiXMark className="size-6" aria-hidden />
            </button>
          </div>
        </div>
        <nav className="flex-1 p-3 pb-8" aria-label="Admin sections">
          <SidebarNav onNavigate={closeMobile} />
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#142218]/08 bg-white/95 px-4 shadow-[0_1px_0_rgba(0,93,81,0.06)] backdrop-blur-sm sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="rounded-lg border border-[#142218]/10 bg-white p-2 text-[#142218] hover:border-[#005D51]/25 hover:bg-[#005D51]/06 md:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <HiBars3BottomLeft className="size-5" aria-hidden />
            </button>
            <p className="min-w-0 truncate font-lora text-lg font-semibold tracking-tight text-[#142218] sm:text-xl md:text-2xl md:leading-snug">
              {headerTitle}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="hidden rounded-lg border-2 border-[#005D51] bg-white px-3 py-2 font-poppins text-sm font-medium text-[#005D51] transition-colors duration-200 hover:border-[#004438] hover:bg-[#005D51]/10 hover:text-[#004438] sm:inline-flex"
            >
              View site
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-lg border-2 border-[#005D51] bg-white p-2 text-[#005D51] transition-colors duration-200 hover:border-[#004438] hover:bg-[#005D51]/10 hover:text-[#004438] sm:hidden"
              aria-label="View public site"
            >
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </Link>
            <AdminHeaderUserMenu />
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          <div className="mx-auto max-w-[1300px] min-w-0 px-4 py-8 md:px-8 md:py-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
