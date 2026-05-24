'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { getSameOriginApiUrl } from '@/lib/api';
import type { PaystackPurpose } from '@/lib/paystack/constants';

export type UsePaystackReturnOptions = {
  purpose: PaystackPurpose;
  workshopId?: string;
  email?: string;
  paymentRefStorageKey: string;
  onVerified?: (reference: string) => void;
};

/** After Paystack redirect, read ?reference= and verify with the server. */
export function usePaystackReturn({
  purpose,
  workshopId,
  email,
  paymentRefStorageKey,
  onVerified,
}: UsePaystackReturnOptions) {
  const searchParams = useSearchParams();
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [verifyingReturn, setVerifyingReturn] = useState(false);
  const verifyAttemptRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem(paymentRefStorageKey);
    if (stored?.trim()) {
      setPaymentReference(stored.trim());
    }
  }, [paymentRefStorageKey]);

  useEffect(() => {
    const fromUrl =
      searchParams.get('reference')?.trim() || searchParams.get('trxref')?.trim() || '';
    if (!fromUrl) return;
    if (verifyAttemptRef.current === fromUrl) return;
    if (paymentReference === fromUrl) return;

    verifyAttemptRef.current = fromUrl;
    let cancelled = false;
    setVerifyingReturn(true);

    void (async () => {
      const params = new URLSearchParams({
        reference: fromUrl,
        purpose,
      });
      if (workshopId) params.set('workshopId', workshopId);
      if (email?.trim()) params.set('email', email.trim());

      try {
        const res = await fetch(`${getSameOriginApiUrl('paystack/verify')}?${params.toString()}`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (!res.ok || !data.verified) {
          toast.error(
            typeof data.error === 'string'
              ? data.error
              : 'We could not confirm your payment yet.',
          );
          return;
        }

        const ref = typeof data.reference === 'string' ? data.reference : fromUrl;
        sessionStorage.setItem(paymentRefStorageKey, ref);
        setPaymentReference(ref);
        onVerified?.(ref);
        toast.success('Payment confirmed. You can finish your submission.');
      } catch {
        if (!cancelled) {
          toast.error('Could not verify payment. Check your connection and try again.');
        }
      } finally {
        if (!cancelled) setVerifyingReturn(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    searchParams,
    purpose,
    workshopId,
    email,
    paymentRefStorageKey,
    onVerified,
    paymentReference,
  ]);

  const clearPaymentReference = useCallback(() => {
    sessionStorage.removeItem(paymentRefStorageKey);
    setPaymentReference(null);
    verifyAttemptRef.current = null;
  }, [paymentRefStorageKey]);

  return {
    paymentReference,
    verifyingReturn,
    setPaymentReference,
    clearPaymentReference,
  };
}

export async function startDonationCheckout(args: {
  fullName: string;
  email: string;
  message?: string;
  amountNaira: number;
}): Promise<boolean> {
  const res = await fetch(getSameOriginApiUrl('paystack/initialize'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      purpose: 'build_a_reader_donation',
      email: args.email.trim(),
      fullName: args.fullName.trim(),
      message: args.message?.trim() || undefined,
      amountNaira: args.amountNaira,
      callbackPath: '/donate/thank-you',
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      typeof data.message === 'string' && data.message
        ? data.message
        : typeof data.error === 'string'
          ? data.error
          : 'Could not open Paystack checkout.';
    toast.error(detail);
    return false;
  }

  const url = typeof data.authorizationUrl === 'string' ? data.authorizationUrl : '';
  if (!url) {
    toast.error('Paystack did not return a checkout link.');
    return false;
  }

  window.location.assign(url);
  return true;
}

export async function startPaystackRedirectCheckout(args: {
  purpose: PaystackPurpose;
  email: string;
  callbackPath: string;
  workshopId?: string;
}): Promise<boolean> {
  const res = await fetch(getSameOriginApiUrl('paystack/initialize'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      purpose: args.purpose,
      email: args.email.trim(),
      callbackPath: args.callbackPath,
      workshopId: args.workshopId,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    toast.error(
      typeof data.error === 'string'
        ? data.error
        : typeof data.message === 'string'
          ? data.message
          : 'Could not open Paystack checkout.',
    );
    return false;
  }

  const url = typeof data.authorizationUrl === 'string' ? data.authorizationUrl : '';
  if (!url) {
    toast.error('Paystack did not return a checkout link.');
    return false;
  }

  window.location.assign(url);
  return true;
}
