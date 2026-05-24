'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { AdminPageSection } from '@/components/admin/AdminPageSection';
import { getSameOriginApiUrl } from '@/lib/api';
import {
  buildCsv,
  csvBlobWithBom,
  triggerCsvDownload,
} from '@/lib/csv-export';
import type { DonationRow } from '@emprinte/types';

const CSV_COLUMNS: { key: keyof DonationRow; header: string }[] = [
  { key: 'submitted_at', header: 'Submitted at' },
  { key: 'full_name', header: 'Full name' },
  { key: 'email', header: 'Email' },
  { key: 'amount_kobo', header: 'Amount (kobo)' },
  { key: 'books_credited', header: 'Books credited' },
  { key: 'payment_reference', header: 'Paystack reference' },
  { key: 'message', header: 'Message' },
  { key: 'id', header: 'Donation id' },
];

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatNairaFromKobo(kobo: number): string {
  return `₦${Math.floor(kobo / 100).toLocaleString()}`;
}

export default function AdminDonationsPage() {
  const [rows, setRows] = useState<DonationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      const res = await fetch(`${getSameOriginApiUrl('admin/donations')}?${params}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data?.message === 'string' ? data.message : 'Could not load donations.',
        );
        setRows([]);
        setTotal(0);
        return;
      }
      setRows(Array.isArray(data?.donations) ? data.donations : []);
      setTotal(typeof data?.total === 'number' ? data.total : 0);
    } catch {
      setError('Network error while loading donations.');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  const headerActions = useMemo(
    () => (
      <button
        type="button"
        onClick={() => {
          void (async () => {
            const res = await fetch(
              `${getSameOriginApiUrl('admin/donations')}?export=all`,
              { credentials: 'include', cache: 'no-store' },
            );
            const data = await res.json().catch(() => ({}));
            if (!res.ok) return;
            const list = Array.isArray(data?.donations) ? (data.donations as DonationRow[]) : [];
            const csv = buildCsv(
              list.map((r) => ({ ...r })) as Record<string, unknown>[],
              CSV_COLUMNS,
            );
            triggerCsvDownload(csvBlobWithBom(csv), 'build-a-reader-donations.csv');
          })();
        }}
        className="rounded-xl border border-[#142218]/12 bg-white px-4 py-2 font-poppins text-sm font-medium text-[#142218] hover:border-[#005D51]/25"
      >
        Export CSV
      </button>
    ),
    [],
  );

  return (
    <AdminPageSection
      eyebrow="Fundraising"
      id="admin-donations-heading"
      title="Donations"
      description="Verified #BuildAReader gifts via Paystack. Read-only log — adjust campaign totals on Site info if needed."
      actions={headerActions}
    >
      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-poppins text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="font-poppins text-sm text-[#4a5c50]">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="font-poppins text-sm text-[#4a5c50]">No donations yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#142218]/8 bg-white">
          <table className="min-w-full text-left font-poppins text-sm">
            <thead className="border-b border-[#142218]/8 bg-[#f8fcfb] text-xs uppercase tracking-wide text-[#4a5c50]">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Books</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Message</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[#142218]/6 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-[#4a5c50]">
                    {formatWhen(r.submitted_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#142218]">{r.full_name}</div>
                    <div className="text-xs text-[#4a5c50]">{r.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-[#142218]">
                    {formatNairaFromKobo(r.amount_kobo)}
                  </td>
                  <td className="px-4 py-3">{r.books_credited}</td>
                  <td className="max-w-[140px] truncate px-4 py-3 font-mono text-xs text-[#4a5c50]">
                    {r.payment_reference}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-[#4a5c50]">
                    {r.message ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between font-poppins text-sm">
          <p className="text-[#4a5c50]">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-[#142218]/12 px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-[#142218]/12 px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </AdminPageSection>
  );
}
