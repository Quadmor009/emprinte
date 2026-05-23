'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { AdminPageSection } from '@/components/admin/AdminPageSection';
import { getSameOriginApiUrl } from '@/lib/api';
import {
  buildCsv,
  csvBlobWithBom,
  triggerCsvDownload,
} from '@/lib/csv-export';

/** Row shape from `GET /api/admin/community-applications` (Supabase `landing.community_applications`). */
export type ApplicationRow = {
  id: string;
  user_id: string;
  submitted_at: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  location: string;
  professional_status: string;
  plan_choice: string;
  consistent_reader: string;
  books_last_12_months: string;
  book_types: unknown;
  book_types_other: string | null;
  weekend_commitment: string;
  commitment_scale: number;
  reading_goals_12m: string;
  portrait_storage_path: string;
  referral_source: string;
  referral_other: string | null;
  receipt_storage_path: string | null;
  payment_reference: string | null;
};

const CSV_COLUMNS: { key: keyof ApplicationRow; header: string }[] = [
  { key: 'submitted_at', header: 'Submitted at' },
  { key: 'id', header: 'Application id' },
  { key: 'user_id', header: 'User id' },
  { key: 'email', header: 'Email' },
  { key: 'first_name', header: 'First name' },
  { key: 'last_name', header: 'Last name' },
  { key: 'phone', header: 'Phone' },
  { key: 'gender', header: 'Gender' },
  { key: 'date_of_birth', header: 'Date of birth' },
  { key: 'location', header: 'Location' },
  { key: 'professional_status', header: 'Professional status' },
  { key: 'plan_choice', header: 'Plan' },
  { key: 'consistent_reader', header: 'Consistent reader' },
  { key: 'books_last_12_months', header: 'Books last 12 months' },
  { key: 'book_types', header: 'Book types (JSON)' },
  { key: 'book_types_other', header: 'Book types other' },
  { key: 'weekend_commitment', header: 'Weekend commitment' },
  { key: 'commitment_scale', header: 'Commitment scale' },
  { key: 'reading_goals_12m', header: 'Reading goals (12m)' },
  { key: 'portrait_storage_path', header: 'Portrait storage path' },
  { key: 'referral_source', header: 'Referral source' },
  { key: 'referral_other', header: 'Referral other' },
  { key: 'payment_reference', header: 'Paystack reference' },
  { key: 'receipt_storage_path', header: 'Receipt storage path (legacy)' },
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

function formatDob(value: string): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
      new Date(value),
    );
  } catch {
    return value;
  }
}

function formatBookTypes(value: unknown): string {
  if (value == null) return '—';
  if (Array.isArray(value)) {
    return value.map(String).join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

type ColDef = {
  id: string;
  label: string;
  /** Included in compact mode (subset of triage columns). */
  compact: boolean;
  narrow?: boolean;
  mono?: boolean;
  title: (r: ApplicationRow) => string;
  cell: (r: ApplicationRow) => ReactNode;
};

const COLUMN_DEFS: ColDef[] = [
  {
    id: 'submitted',
    label: 'Submitted',
    compact: true,
    narrow: true,
    title: (r) => r.submitted_at,
    cell: (r) => formatWhen(r.submitted_at),
  },
  {
    id: 'name',
    label: 'Name',
    compact: true,
    title: (r) => `${r.first_name} ${r.last_name}`,
    cell: (r) => (
      <>
        {r.first_name} {r.last_name}
      </>
    ),
  },
  {
    id: 'email',
    label: 'Email',
    compact: true,
    title: (r) => r.email,
    cell: (r) => r.email,
  },
  {
    id: 'phone',
    label: 'Phone',
    compact: true,
    narrow: true,
    title: (r) => r.phone,
    cell: (r) => r.phone,
  },
  {
    id: 'dob',
    label: 'DOB',
    compact: true,
    narrow: true,
    title: (r) => r.date_of_birth,
    cell: (r) => formatDob(r.date_of_birth),
  },
  {
    id: 'gender',
    label: 'Gender',
    compact: true,
    narrow: true,
    title: (r) => r.gender,
    cell: (r) => r.gender,
  },
  {
    id: 'location',
    label: 'Location',
    compact: true,
    title: (r) => r.location,
    cell: (r) => r.location,
  },
  {
    id: 'professional_status',
    label: 'Professional status',
    compact: false,
    title: (r) => r.professional_status,
    cell: (r) => r.professional_status,
  },
  {
    id: 'plan',
    label: 'Plan',
    compact: true,
    narrow: true,
    title: (r) => r.plan_choice,
    cell: (r) => r.plan_choice,
  },
  {
    id: 'consistent_reader',
    label: 'Consistent reader',
    compact: false,
    title: (r) => r.consistent_reader,
    cell: (r) => r.consistent_reader,
  },
  {
    id: 'books',
    label: 'Books (12 mo)',
    compact: false,
    title: (r) => r.books_last_12_months,
    cell: (r) => r.books_last_12_months,
  },
  {
    id: 'book_types',
    label: 'Book types',
    compact: false,
    title: (r) => formatBookTypes(r.book_types),
    cell: (r) => formatBookTypes(r.book_types),
  },
  {
    id: 'book_types_other',
    label: 'Book types other',
    compact: false,
    title: (r) => r.book_types_other ?? '',
    cell: (r) => r.book_types_other ?? '—',
  },
  {
    id: 'weekend',
    label: 'Weekend',
    compact: false,
    title: (r) => r.weekend_commitment,
    cell: (r) => r.weekend_commitment,
  },
  {
    id: 'scale',
    label: 'Scale',
    compact: true,
    narrow: true,
    title: (r) => String(r.commitment_scale),
    cell: (r) => r.commitment_scale,
  },
  {
    id: 'reading_goals',
    label: 'Reading goals',
    compact: false,
    title: (r) => r.reading_goals_12m,
    cell: (r) => r.reading_goals_12m,
  },
  {
    id: 'portrait',
    label: 'Portrait path',
    compact: true,
    mono: true,
    title: (r) => r.portrait_storage_path,
    cell: (r) => r.portrait_storage_path,
  },
  {
    id: 'referral',
    label: 'Referral',
    compact: true,
    title: (r) => r.referral_source,
    cell: (r) => r.referral_source,
  },
  {
    id: 'referral_other',
    label: 'Referral other',
    compact: false,
    title: (r) => r.referral_other ?? '',
    cell: (r) => r.referral_other ?? '—',
  },
  {
    id: 'payment_reference',
    label: 'Paystack ref',
    compact: true,
    mono: true,
    title: (r) => r.payment_reference ?? r.receipt_storage_path ?? '',
    cell: (r) => r.payment_reference ?? r.receipt_storage_path ?? '—',
  },
  {
    id: 'user_id',
    label: 'User id',
    compact: false,
    narrow: true,
    mono: true,
    title: (r) => r.user_id,
    cell: (r) => r.user_id,
  },
  {
    id: 'row_id',
    label: 'Row id',
    compact: false,
    narrow: true,
    mono: true,
    title: (r) => r.id,
    cell: (r) => r.id,
  },
];

function cellClass(
  opts: {
    compactLayout: boolean;
    narrow?: boolean;
    mono?: boolean;
    bold?: boolean;
  },
): string {
  const pad = opts.compactLayout ? 'px-2 py-1.5' : 'px-3 py-2.5';
  const text = opts.compactLayout ? 'text-[10px]' : 'text-xs';
  const width = opts.narrow
    ? opts.compactLayout
      ? 'max-w-[88px] truncate'
      : 'max-w-[100px] truncate'
    : opts.compactLayout
      ? 'max-w-[min(16rem,36vw)] min-w-[6rem] break-words'
      : 'max-w-[min(22rem,40vw)] min-w-[8rem] break-words';
  const font = opts.mono
    ? opts.compactLayout
      ? 'font-mono text-[9px]'
      : 'font-mono text-[11px]'
    : '';
  const weight = opts.bold ? 'font-medium text-[#142218]' : 'text-[#4a5c50]';
  return `${pad} ${text} ${width} align-top ${font} ${weight}`;
}

function Th({
  children,
  compactLayout,
}: {
  children: ReactNode;
  compactLayout: boolean;
}) {
  const p = compactLayout ? 'px-2 py-1.5 text-[9px]' : 'px-3 py-2.5 text-[11px]';
  return (
    <th
      className={`sticky top-0 z-1 whitespace-nowrap border-b border-[#142218]/10 bg-[#F0FFFD] ${p} text-left font-semibold uppercase tracking-wide text-[#142218]`}
    >
      {children}
    </th>
  );
}

function applicationsListUrl(page: number, pageSize: number): string {
  const base = getSameOriginApiUrl('admin/community-applications');
  const q = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  return `${base}?${q.toString()}`;
}

function applicationsExportUrl(): string {
  const base = getSameOriginApiUrl('admin/community-applications');
  return `${base}?export=all`;
}

export default function AdminCommunityApplicationsPage() {
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [compactLayout, setCompactLayout] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const visibleColumns = useMemo(
    () => COLUMN_DEFS.filter((c) => !compactLayout || c.compact),
    [compactLayout],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(applicationsListUrl(page, pageSize), {
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
              : 'Could not load applications.',
        );
        setRows([]);
        setTotal(0);
        return;
      }
      const list = Array.isArray(data?.applications) ? data.applications : [];
      const count = typeof data?.total === 'number' ? data.total : 0;
      setRows(list as ApplicationRow[]);
      setTotal(count);

      const maxPage = Math.max(1, Math.ceil(count / pageSize) || 1);
      if (count > 0 && page > maxPage) {
        setPage(maxPage);
      }
    } catch {
      setError('Network error while loading applications.');
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

  const exportCsv = useCallback(async () => {
    setExporting(true);
    setError(null);
    try {
      const res = await fetch(applicationsExportUrl(), {
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
              : 'Could not export applications.',
        );
        return;
      }
      const list = Array.isArray(data?.applications)
        ? (data.applications as ApplicationRow[])
        : [];
      if (list.length === 0) {
        setError('No rows to export.');
        return;
      }
      const asRecords = list.map((r) => ({ ...r })) as Record<string, unknown>[];
      const csv = buildCsv(asRecords, CSV_COLUMNS);
      const blob = csvBlobWithBom(csv);
      const stamp = new Date().toISOString().slice(0, 10);
      triggerCsvDownload(blob, `emprinte-community-applications-${stamp}.csv`);
    } catch {
      setError('Network error while exporting CSV.');
    } finally {
      setExporting(false);
    }
  }, []);

  const setPageSizeAndReset = useCallback((n: 50 | 100) => {
    setPageSize(n);
    setPage(1);
  }, []);

  const toolbar = useMemo(
    () => (
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <label className="inline-flex cursor-pointer select-none items-center gap-2 font-poppins text-sm font-medium text-[#142218]">
          <input
            type="checkbox"
            checked={compactLayout}
            onChange={(e) => setCompactLayout(e.target.checked)}
            className="h-4 w-4 rounded border-[#005D51]/30 text-[#005D51] focus:ring-[#005D51]"
          />
          Compact columns
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-poppins text-xs font-medium text-[#5c6b5f]">Rows per page</span>
          <div className="inline-flex rounded-xl border border-[#005D51]/20 p-0.5">
            <button
              type="button"
              onClick={() => setPageSizeAndReset(50)}
              className={`rounded-lg px-3 py-1.5 font-poppins text-xs font-semibold transition ${
                pageSize === 50
                  ? 'bg-[#005D51] text-white'
                  : 'text-[#005D51] hover:bg-[#005D51]/08'
              }`}
            >
              50
            </button>
            <button
              type="button"
              onClick={() => setPageSizeAndReset(100)}
              className={`rounded-lg px-3 py-1.5 font-poppins text-xs font-semibold transition ${
                pageSize === 100
                  ? 'bg-[#005D51] text-white'
                  : 'text-[#005D51] hover:bg-[#005D51]/08'
              }`}
            >
              100
            </button>
          </div>
        </div>
      </div>
    ),
    [compactLayout, pageSize, setPageSizeAndReset],
  );

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

  const colCount = visibleColumns.length;
  const tableMinW = compactLayout ? 'min-w-[720px]' : 'min-w-[2000px]';

  return (
    <AdminPageSection
      id="membership-applications-heading"
      eyebrow="People"
      title="Membership applications"
      description={
        <>
          Table below is <strong className="font-semibold text-[#142218]/90">paginated</strong> for
          faster loading; <strong className="font-semibold text-[#142218]/90">Export CSV</strong>{' '}
          always includes <strong className="font-semibold text-[#142218]/90">every row and column</strong>{' '}
          (up to 10,000 applications). Portrait and receipt fields are{' '}
          <strong className="font-semibold text-[#142218]/90">storage paths</strong> in the{' '}
          <code className="rounded bg-[#142218]/06 px-1 py-0.5 text-[0.9em]">community-applications</code>{' '}
          bucket.
        </>
      }
      actions={headerActions}
    >
      {error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-poppins text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {toolbar}

      <div className="max-w-full overflow-hidden rounded-2xl border border-[#005D51]/12 bg-white shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <table className={`${tableMinW} w-full border-collapse text-left font-poppins`}>
            <thead>
              <tr>
                {visibleColumns.map((c) => (
                  <Th key={c.id} compactLayout={compactLayout}>
                    {c.label}
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-10 text-center text-[#5c6b5f]">
                    Loading…
                  </td>
                </tr>
              ) : !rows.length ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-10 text-center text-[#5c6b5f]">
                    {total === 0 ? 'No applications yet.' : 'No applications on this page.'}
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-[#142218]/06 last:border-0">
                    {visibleColumns.map((c) => (
                      <td
                        key={c.id}
                        className={cellClass({
                          compactLayout,
                          narrow: c.narrow,
                          mono: c.mono,
                          bold: c.id === 'name',
                        })}
                        title={c.title(r)}
                      >
                        {c.cell(r)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && total > 0 ? (
        <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[#005D51]/10 bg-[#fafcfb] px-4 py-4 font-poppins text-sm text-[#142218] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[#5c6b5f]">
            Showing{' '}
            <span className="font-semibold text-[#142218]">
              {total === 0 ? 0 : (page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, total)}
            </span>{' '}
            of <span className="font-semibold text-[#142218]">{total}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex min-h-9 min-w-18 items-center justify-center rounded-xl border border-[#005D51]/20 bg-white px-3 text-sm font-semibold text-[#005D51] transition hover:bg-[#005D51]/06 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 text-xs font-medium text-[#5c6b5f]">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex min-h-9 min-w-18 items-center justify-center rounded-xl border border-[#005D51]/20 bg-white px-3 text-sm font-semibold text-[#005D51] transition hover:bg-[#005D51]/06 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </AdminPageSection>
  );
}
