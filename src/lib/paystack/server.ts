import { createHmac, randomUUID } from 'crypto';

import {
  APPLICATION_FEE_KOBO,
  PAYSTACK_API_BASE,
  type PaystackPurpose,
} from '@/lib/paystack/constants';

export type PaystackVerifyData = {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  customerEmail: string | null;
  metadata: Record<string, unknown>;
};

export function paystackSecretKey(): string | null {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  return key || null;
}

export function paystackWebhookSecret(): string | null {
  return process.env.PAYSTACK_WEBHOOK_SECRET?.trim() || paystackSecretKey();
}

export function isPaystackConfigured(): boolean {
  return Boolean(paystackSecretKey());
}

export function resolveSiteOrigin(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  if (host) {
    return `${proto}://${host}`;
  }
  return `http://127.0.0.1:${process.env.PORT || '3000'}`;
}

export function generatePaystackReference(purpose: PaystackPurpose): string {
  const prefix =
    purpose === 'community_application'
      ? 'emp_app'
      : purpose === 'workshop_registration'
        ? 'emp_wks'
        : 'emp_don';
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

export function amountKoboForPurpose(
  purpose: PaystackPurpose,
  workshopFeeNaira: number | null | undefined,
  donationNaira?: number,
): number {
  if (purpose === 'community_application') {
    return APPLICATION_FEE_KOBO;
  }
  if (purpose === 'build_a_reader_donation') {
    const naira = donationNaira ?? 0;
    if (!Number.isFinite(naira) || naira <= 0) {
      throw new Error('Donation amount is not valid.');
    }
    return Math.round(naira * 100);
  }
  const naira = workshopFeeNaira ?? 5000;
  if (!Number.isFinite(naira) || naira <= 0) {
    throw new Error('Workshop fee is not configured.');
  }
  return Math.round(naira * 100);
}

async function paystackFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; data: T }> {
  const secret = paystackSecretKey();
  if (!secret) {
    throw new Error('Paystack is not configured.');
  }

  const res = await fetch(`${PAYSTACK_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

export async function initializePaystackTransaction(args: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<{ authorizationUrl: string; reference: string; accessCode: string }> {
  const { ok, data } = await paystackFetch<{
    status?: boolean;
    message?: string;
    data?: {
      authorization_url?: string;
      reference?: string;
      access_code?: string;
    };
  }>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: args.email.trim(),
      amount: args.amountKobo,
      reference: args.reference,
      callback_url: args.callbackUrl,
      currency: 'NGN',
      metadata: args.metadata,
    }),
  });

  if (!ok || !data.status || !data.data?.authorization_url) {
    const msg =
      typeof data.message === 'string' ? data.message : 'Could not start Paystack checkout.';
    throw new Error(msg);
  }

  return {
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference ?? args.reference,
    accessCode: data.data.access_code ?? '',
  };
}

export async function verifyPaystackReference(
  reference: string,
): Promise<PaystackVerifyData | null> {
  const trimmed = reference.trim();
  if (!trimmed) {
    return null;
  }

  const { ok, data } = await paystackFetch<{
    status?: boolean;
    message?: string;
    data?: {
      reference?: string;
      status?: string;
      amount?: number;
      currency?: string;
      customer?: { email?: string };
      metadata?: Record<string, unknown>;
    };
  }>(`/transaction/verify/${encodeURIComponent(trimmed)}`);

  if (!ok || !data.status || !data.data) {
    return null;
  }

  const tx = data.data;
  return {
    reference: tx.reference ?? trimmed,
    status: tx.status ?? '',
    amount: tx.amount ?? 0,
    currency: tx.currency ?? 'NGN',
    customerEmail: tx.customer?.email?.trim() || null,
    metadata: tx.metadata ?? {},
  };
}

export function verifyPaystackWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  const secret = paystackWebhookSecret();
  if (!secret || !signatureHeader) {
    return false;
  }
  const hash = createHmac('sha512', secret).update(rawBody).digest('hex');
  return hash === signatureHeader;
}
