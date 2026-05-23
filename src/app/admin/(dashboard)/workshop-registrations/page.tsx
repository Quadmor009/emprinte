'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { AdminPageSection } from '@/components/admin/AdminPageSection';
import { getSameOriginApiUrl } from '@/lib/api';
import {
  buildCsv,
  csvBlobWithBom,
  triggerCsvDownload,
} from '@/lib/csv-export';
import type { WorkshopRegistrationRow as WorkshopRegistrationRowBase } from '@emprinte/types';

type AdminWorkshopOption = {
  id: string;
  title: string;
  slug: string | null;
};

/** DB row + admin-only signed receipt URL from API. */
export type WorkshopRegistrationRow = WorkshopRegistrationRowBase & {
  receipt_signed_url?: string | null;
};

const CSV_COLUMNS: { key: keyof WorkshopRegistrationRow; header: string }[] = [
  { key: 'submitted_at', header: 'Submitted at' },
  { key: 'full_name', header: 'Full name' },
  { key: 'email', header: 'Email' },
  { key: 'is_member', header: 'Hub member' },
  { key: 'financial_category', header: 'Financial category' },
  { key: 'primary_goal', header: 'Primary goal' },
  { key: 'finance_challenges', header: 'Finance challenges' },
  { key: 'workshop_questions', header: 'Workshop questions' },
  { key: 'payment_reference', header: 'Paystack reference' },
  { key: 'receipt_storage_path', header: 'Receipt path (legacy)' },
  { key: 'id', header: 'Registration id' },
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

function formatCategory(value: string): string {
  return value.replace(/_/g, ' ');
}

type RegistrationSource = 'web' | 'app';

function listUrl(
  page: number,
  pageSize: number,
  workshopId: string | null,
  source: RegistrationSource,
): string {
  const base = getSameOriginApiUrl('admin/workshop-registrations');
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    source,
  });
  if (workshopId) params.set('workshopId', workshopId);
  return `${base}?${params.toString()}`;
}

function exportUrl(workshopId: string | null, source: RegistrationSource): string {
  const params = new URLSearchParams({ export: 'all', source });
  if (workshopId) params.set('workshopId', workshopId);
  return `${getSameOriginApiUrl('admin/workshop-registrations')}?${params.toString()}`;
}

export default function AdminWorkshopRegistrationsPage() {
  const [workshops, setWorkshops] = useState<AdminWorkshopOption[]>([]);
  const [workshopId, setWorkshopId] = useState<string>('');
  const [source, setSource] = useState<RegistrationSource>('web');
  const [rows, setRows] = useState<WorkshopRegistrationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(getSameOriginApiUrl('admin/workshops'), {
          credentials: 'include',
          cache: 'no-store',
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;
        const list = Array.isArray(data?.workshops) ? data.workshops : [];
        setWorkshops(
          list.map((w: { id: string; title: string; slug: string | null }) => ({
            id: w.id,
            title: w.title,
            slug: w.slug,
          })),
        );
      } catch {
        /* workshops filter is optional */
      }
    })();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const filterId = workshopId.trim() || null;
    try {
      const res = await fetch(listUrl(page, pageSize, filterId, source), {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data?.message === 'string'
            ? data.message
            : typeof data?.error === 'string'
              ? data.error
              : 'Could not load workshop registrations.',
        );
        setRows([]);
        setTotal(0);
        return;
      }
      const list = Array.isArray(data?.registrations) ? data.registrations : [];
      const count = typeof data?.total === 'number' ? data.total : 0;
      setRows(list as WorkshopRegistrationRow[]);
      setTotal(count);
      const maxPage = Math.max(1, Math.ceil(count / pageSize) || 1);
      if (count > 0 && page > maxPage) setPage(maxPage);
    } catch {
      setError('Network error while loading registrations.');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, workshopId, source]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  const exportCsv = useCallback(async () => {
    setExporting(true);
    setError(null);
    try {
      const filterId = workshopId.trim() || null;
      const res = await fetch(exportUrl(filterId, source), {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data?.message === 'string'
            ? data.message
            : 'Could not export registrations.',
        );
        return;
      }
      const list = Array.isArray(data?.registrations)
        ? (data.registrations as WorkshopRegistrationRow[])
        : [];
      if (list.length === 0) {
        setError('No rows to export.');
        return;
      }
      const csv = buildCsv(
        list.map((r) => ({
          ...r,
          is_member: r.is_member ? 'yes' : 'no',
        })) as Record<string, unknown>[],
        CSV_COLUMNS,
      );
      triggerCsvDownload(
        csvBlobWithBom(csv),
        `emprinte-workshop-registrations-${new Date().toISOString().slice(0, 10)}.csv`,
      );
    } catch {
      setError('Network error while exporting CSV.');
    } finally {
      setExporting(false);
    }
  }, [workshopId, source]);

  const headerActions = useMemo(
    () => (
      <>
        <button
          type="button"
          onClick={() => void exportCsv()}
          disabled={exporting || total === 0}
          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#005D51] px-4 font-poppins text-sm font-semibold text-white transition hover:bg-[#004438] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {exporting ? 'Exporting…' : 'Export CSV (all rows)'}
        </button>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border-2 border-[#005D51]/20 bg-white px-4 font-poppins text-sm font-semibold text-[#005D51] transition hover:border-[#005D51]/40 hover:bg-[#005D51]/06"
        >
          Refresh
        </button>
      </>
    ),
    [exportCsv, exporting, load, total],
  );

  return (
    <AdminPageSection
      id="workshop-registrations-heading"
      eyebrow="People"
      title="Workshop registrations"
      description="Web sign-ups and in-app join requests for workshops. Non-members pay via Paystack on the web; legacy rows may still have receipt uploads."
      actions={headerActions}
    >
      <div className="flex gap-2 rounded-xl border border-[#142218]/10 bg-white p-1 font-poppins text-sm">
        <button
          type="button"
          onClick={() => {
            setSource('web');
            setPage(1);
          }}
          className={`min-h-9 flex-1 rounded-lg px-3 font-semibold transition ${
            source === 'web'
              ? 'bg-[#005D51] text-white'
              : 'text-[#4a5c50] hover:bg-[#005D51]/06'
          }`}
        >
          Web registrations
        </button>
        <button
          type="button"
          onClick={() => {
            setSource('app');
            setPage(1);
          }}
          className={`min-h-9 flex-1 rounded-lg px-3 font-semibold transition ${
            source === 'app'
              ? 'bg-[#005D51] text-white'
              : 'text-[#4a5c50] hover:bg-[#005D51]/06'
          }`}
        >
          App join requests
        </button>
      </div>

      {workshops.length > 0 ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <label className="flex flex-col gap-1.5 font-poppins text-sm text-[#4a5c50]">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#5c6b5f]">
              Workshop
            </span>
            <select
              value={workshopId}
              onChange={(e) => {
                setWorkshopId(e.target.value);
                setPage(1);
              }}
              className="min-h-10 max-w-md rounded-xl border border-[#142218]/12 bg-white px-3 py-2 text-sm text-[#142218] outline-none focus:border-[#005D51] focus:ring-2 focus:ring-[#6FE19B]/35"
            >
              <option value="">All workshops</option>
              {workshops.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title}
                  {w.slug ? ` (${w.slug})` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-poppins text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="max-w-full overflow-hidden rounded-2xl border border-[#005D51]/12 bg-white shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-[960px] w-full border-collapse text-left font-poppins text-xs">
            <thead>
              <tr>
                <Th>Submitted</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                {source === 'web' ? (
                  <>
                    <Th>Member</Th>
                    <Th>Category</Th>
                    <Th>Primary goal</Th>
                    <Th>Receipt</Th>
                  </>
                ) : (
                  <>
                    <Th>Status</Th>
                    <Th>Workshop</Th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={source === 'web' ? 7 : 5}
                    className="px-4 py-10 text-center text-[#5c6b5f]"
                  >
                    Loading…
                  </td>
                </tr>
              ) : !rows.length ? (
                <tr>
                  <td
                    colSpan={source === 'web' ? 7 : 5}
                    className="px-4 py-10 text-center text-[#5c6b5f]"
                  >
                    No registrations yet.
                  </td>
                </tr>
              ) : source === 'app' ? (
                rows.map((r) => {
                  const app = r as WorkshopRegistrationRow & {
                    request_status?: string;
                    workshop_title?: string | null;
                  };
                  return (
                    <tr key={app.id} className="border-b border-[#142218]/06 last:border-0">
                      <Td title={app.submitted_at}>{formatWhen(app.submitted_at)}</Td>
                      <Td bold title={app.full_name}>
                        {app.full_name}
                      </Td>
                      <Td title={app.email}>{app.email}</Td>
                      <Td>{app.request_status ?? '—'}</Td>
                      <Td title={app.workshop_title ?? undefined}>
                        {app.workshop_title ?? '—'}
                      </Td>
                    </tr>
                  );
                })
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-[#142218]/06 last:border-0">
                    <Td title={r.submitted_at}>{formatWhen(r.submitted_at)}</Td>
                    <Td bold title={r.full_name}>
                      {r.full_name}
                    </Td>
                    <Td title={r.email}>{r.email}</Td>
                    <Td>{r.is_member ? 'Yes' : 'No'}</Td>
                    <Td title={r.financial_category}>
                      {formatCategory(r.financial_category)}
                    </Td>
                    <Td title={r.primary_goal}>{r.primary_goal}</Td>
                    <Td>
                      {r.payment_reference ? (
                        <span className="font-mono text-[10px] text-[#142218]">
                          {r.payment_reference}
                        </span>
                      ) : r.receipt_signed_url ? (
                        <a
                          href={r.receipt_signed_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[#005D51] underline decoration-[#005D51]/25 underline-offset-2"
                        >
                          View receipt
                        </a>
                      ) : r.receipt_storage_path ? (
                        <span className="font-mono text-[10px] text-[#5c6b5f]">
                          {r.receipt_storage_path}
                        </span>
                      ) : (
                        <span className="text-[#9aa89e]">—</span>
                      )}
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && total > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#005D51]/10 bg-[#fafcfb] px-4 py-4 font-poppins text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[#5c6b5f]">
            Showing{' '}
            <span className="font-semibold text-[#142218]">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
            </span>{' '}
            of <span className="font-semibold text-[#142218]">{total}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="min-h-9 rounded-xl border border-[#005D51]/20 bg-white px-3 text-sm font-semibold text-[#005D51] disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 text-xs text-[#5c6b5f]">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="min-h-9 rounded-xl border border-[#005D51]/20 bg-white px-3 text-sm font-semibold text-[#005D51] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </AdminPageSection>
  );
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th className="sticky top-0 z-1 whitespace-nowrap border-b border-[#142218]/10 bg-[#F0FFFD] px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#142218]">
      {children}
    </th>
  );
}

function Td({
  children,
  title,
  bold,
}: {
  children: ReactNode;
  title?: string;
  bold?: boolean;
}) {
  return (
    <td
      className={`max-w-[min(18rem,36vw)] px-3 py-2.5 align-top break-words ${
        bold ? 'font-medium text-[#142218]' : 'text-[#4a5c50]'
      }`}
      title={title}
    >
      {children}
    </td>
  );
}
