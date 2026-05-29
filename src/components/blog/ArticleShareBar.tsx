'use client';

import { useCallback, useState } from 'react';
import { FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { IoLinkOutline } from 'react-icons/io5';
import { toast } from 'sonner';

type ArticleShareBarProps = {
  articleUrl: string;
  title: string;
  className?: string;
};

const iconBtn =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#005D51]/18 bg-white text-[#005D51] transition-colors hover:border-[#005D51]/35 hover:bg-[rgba(0,93,81,0.06)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005D51]';

export function ArticleShareBar({
  articleUrl,
  title,
  className = '',
}: ArticleShareBarProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const shareX = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      toast.success('Article link copied');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy. Select the link and copy manually.');
    }
  }, [articleUrl]);

  return (
    <section
      className={['rounded-xl border border-[#005D51]/10 bg-[#fafcfb] px-4 py-5 sm:px-5', className]
        .filter(Boolean)
        .join(' ')}
      aria-label="Share this article"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <p className="font-poppins text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#005D51]">
            Share
          </p>
          <p className="mt-1 font-poppins text-sm font-semibold text-[#142218] sm:text-base">
            Spread the word
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <a
              href={shareLinkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className={iconBtn}
              aria-label="Share on LinkedIn"
            >
              <FaLinkedinIn className="h-[18px] w-[18px]" aria-hidden />
            </a>
            <a
              href={shareX}
              target="_blank"
              rel="noopener noreferrer"
              className={iconBtn}
              aria-label="Share on X"
            >
              <FaXTwitter className="h-[17px] w-[17px]" aria-hidden />
            </a>
            <button
              type="button"
              onClick={copyLink}
              className={iconBtn}
              aria-label="Copy article link"
            >
              <IoLinkOutline className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="w-full shrink-0 sm:max-w-[min(100%,380px)] sm:pt-6">
          <p className="font-poppins text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#7a858f]">
            Article link
          </p>
          <div className="mt-2 flex items-stretch gap-2 rounded-lg border border-[#005D51]/12 bg-white">
            <p className="min-w-0 flex-1 truncate px-3 py-2.5 font-mono text-[0.7rem] leading-snug text-[#4d575f] sm:text-xs">
              {articleUrl}
            </p>
            <button
              type="button"
              onClick={copyLink}
              className="shrink-0 rounded-r-[7px] border-l border-[#005D51]/10 bg-[#005D51] px-3.5 py-2 font-poppins text-xs font-semibold text-white transition-colors hover:bg-[#004438] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005D51]"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
