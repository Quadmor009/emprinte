'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { HiOutlineCheckCircle } from 'react-icons/hi';

import { getSameOriginApiUrl } from '@/lib/api';
import { igniteRegistrationSchema } from '@/lib/validation/ignite-registration';

const inputClassName =
  'w-full rounded-xl border border-[#142218]/12 bg-white px-4 py-3.5 text-base font-poppins text-[#142218] placeholder:text-[#8a8a8a] outline-none transition-[box-shadow,border-color] focus:border-[#005D51] focus:ring-2 focus:ring-[#005D51]/20 disabled:opacity-60';

const labelClassName = 'font-poppins text-sm font-medium text-[#142218]';

const primaryButtonClassName =
  'flex h-12 w-full items-center justify-center rounded-xl bg-[#E63715] font-poppins text-base font-semibold text-white transition-colors hover:bg-[#c42e12] focus-visible:outline-2 focus-visible:outline-[#E63715] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-65';

const secondaryButtonClassName =
  'flex h-12 w-full items-center justify-center rounded-xl border border-[#142218]/15 bg-white font-poppins text-base font-semibold text-[#142218] transition-colors hover:bg-[#142218]/5 focus-visible:outline-2 focus-visible:outline-[#005D51] focus-visible:outline-offset-2';

const IGNITE_SHARE_TITLE = 'IGNITE 2026 — A gathering of Readers and Leaders';
const IGNITE_SHARE_TEXT =
  "I'm going to IGNITE — Emprinte's gathering of Readers and Leaders in September 2026. Book your spot!";

type ModalStep = 'form' | 'success';

type IgniteRegisterModalProps = {
  open: boolean;
  onClose: () => void;
};

function igniteShareUrl(): string {
  if (typeof window === 'undefined') return '/#ignite';
  return `${window.location.origin}/#ignite`;
}

export function IgniteRegisterModal({ open, onClose }: IgniteRegisterModalProps) {
  const [step, setStep] = useState<ModalStep>('form');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'sharing'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [lookingForwardTo, setLookingForwardTo] = useState('');

  const isBusy = status === 'loading' || status === 'sharing';

  const handleClose = useCallback(() => {
    if (isBusy) return;
    onClose();
  }, [isBusy, onClose]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBusy) handleClose();
    };

    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, handleClose, isBusy]);

  useEffect(() => {
    if (!open) {
      setStep('form');
      setStatus('idle');
      setMessage(null);
      setShareFeedback(null);
    }
  }, [open]);

  const showSuccess = useCallback(() => {
    setFullName('');
    setEmail('');
    setLookingForwardTo('');
    setMessage(null);
    setShareFeedback(null);
    setStep('success');
    setStatus('idle');
  }, []);

  const handleInviteFriend = useCallback(async () => {
    setStatus('sharing');
    setShareFeedback(null);

    const url = igniteShareUrl();
    const shareData = {
      title: IGNITE_SHARE_TITLE,
      text: IGNITE_SHARE_TEXT,
      url,
    };

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share(shareData);
        setShareFeedback('Thanks for spreading the word!');
        return;
      }

      await navigator.clipboard.writeText(`${IGNITE_SHARE_TEXT}\n\n${url}`);
      setShareFeedback('Invite link copied — share it with a friend.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      setShareFeedback('Could not share right now. Try copying the link from the homepage.');
    } finally {
      setStatus('idle');
    }
  }, []);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setMessage(null);

    const parsed = igniteRegistrationSchema.safeParse({
      fullName,
      email,
      lookingForwardTo,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const validationMessage =
        fieldErrors.fullName?.[0] ??
        fieldErrors.email?.[0] ??
        fieldErrors.lookingForwardTo?.[0] ??
        'Please check your details.';

      setStatus('error');
      setMessage(validationMessage);
      return;
    }

    try {
      const response = await fetch(getSameOriginApiUrl('ignite-registration'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      if (response.status === 409) {
        showSuccess();
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const errorMessage =
          (data && (data.message || data.error)) ||
          'Unable to register right now. Please try again later.';
        throw new Error(errorMessage);
      }

      showSuccess();
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to register right now. Please try again later.',
      );
    } finally {
      setStatus((prev) => (prev === 'loading' ? 'idle' : prev));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-[#142218]/55 p-4 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={step === 'form' ? 'ignite-register-title' : 'ignite-success-title'}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#142218]/10 bg-white shadow-[0_24px_64px_-12px_rgba(20,34,24,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        {step === 'form' ? (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-[#142218]/08 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h2
                  id="ignite-register-title"
                  className="font-lora text-xl font-semibold text-[#142218]"
                >
                  Book a spot at IGNITE
                </h2>
                <p className="mt-1 font-poppins text-sm text-[#7B7B7B]">
                  September 2026 — A gathering of Readers and Leaders
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isBusy}
                className="shrink-0 rounded-lg px-3 py-1.5 font-poppins text-sm font-semibold text-[#7B7B7B] transition hover:bg-[#142218]/5 hover:text-[#142218] disabled:opacity-50"
              >
                Close
              </button>
            </div>

            <form
              className="flex flex-col gap-4 px-5 py-6 sm:px-6"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="ignite-full-name" className={labelClassName}>
                  Full name
                </label>
                <input
                  id="ignite-full-name"
                  type="text"
                  name="fullName"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your full name"
                  className={inputClassName}
                  autoComplete="name"
                  disabled={isBusy}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="ignite-email" className={labelClassName}>
                  Email
                </label>
                <input
                  id="ignite-email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className={inputClassName}
                  autoComplete="email"
                  disabled={isBusy}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="ignite-looking-forward" className={labelClassName}>
                  What are you looking forward to?
                </label>
                <textarea
                  id="ignite-looking-forward"
                  name="lookingForwardTo"
                  value={lookingForwardTo}
                  onChange={(event) => setLookingForwardTo(event.target.value)}
                  placeholder="Tell us what excites you about IGNITE…"
                  rows={4}
                  className={`${inputClassName} min-h-[112px] resize-y`}
                  disabled={isBusy}
                  required
                />
              </div>

              <button type="submit" disabled={isBusy} className={`mt-1 ${primaryButtonClassName}`}>
                {status === 'loading' ? 'Submitting…' : 'Submit'}
              </button>

              <p
                className={`min-h-5 font-poppins text-sm text-[#E63715] ${
                  message && status === 'error' ? 'opacity-100' : 'opacity-0'
                }`}
                aria-live="polite"
              >
                {message ?? '\u00a0'}
              </p>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center px-5 py-8 text-center sm:px-8 sm:py-10">
            <HiOutlineCheckCircle
              className="h-16 w-16 text-[#005D51]"
              aria-hidden
            />
            <h2
              id="ignite-success-title"
              className="mt-4 font-lora text-2xl font-semibold text-[#142218]"
            >
              You&apos;re in!
            </h2>
            <p className="mt-2 max-w-sm font-poppins text-sm leading-relaxed text-[#7B7B7B] sm:text-base">
              Your spot is reserved. We&apos;ll be in touch with IGNITE updates soon.
            </p>
            <p className="mt-1 max-w-sm font-poppins text-sm leading-relaxed text-[#7B7B7B]">
              Know someone who&apos;d love this? Bring them along.
            </p>

            <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
              <button
                type="button"
                onClick={() => void handleInviteFriend()}
                disabled={isBusy}
                className={primaryButtonClassName}
              >
                {status === 'sharing' ? 'Opening share…' : 'Invite a friend'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isBusy}
                className={secondaryButtonClassName}
              >
                Done
              </button>
            </div>

            <p
              className={`mt-4 min-h-5 max-w-sm font-poppins text-sm text-[#005D51] ${
                shareFeedback ? 'opacity-100' : 'opacity-0'
              }`}
              aria-live="polite"
            >
              {shareFeedback ?? '\u00a0'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
