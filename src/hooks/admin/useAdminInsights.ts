'use client';

import { toast } from 'sonner';
import { type FormEvent, useCallback, useEffect, useState } from 'react';

import { createDefaultInsightForm } from '@/constants/admin';
import { getApiErrorMessage } from '@/lib/api-errors';
import {
  getSameOriginApiUrl,
  getSameOriginApiUrlWithQuery,
  adminJsonHeaders,
} from '@/lib/api';
import { validateArticleImageUrl } from '@/lib/article-image-url';
import {
  insightDateFromInputValue,
  insightDateToInputValue,
} from '@/lib/insight-date';
import type {
  FormSubmitStatus,
  InsightFormInput,
  InsightArticle,
} from '@/types';

async function fetchInsightsList(): Promise<InsightArticle[]> {
  const res = await fetch(getSameOriginApiUrl('insights'), { cache: 'no-store' });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export function useAdminInsights() {
  const [form, setForm] = useState<InsightFormInput>(createDefaultInsightForm);
  const [status, setStatus] = useState<FormSubmitStatus>({ type: 'idle' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [list, setList] = useState<InsightArticle[]>([]);
  const [listLoading, setListLoading] = useState(true);

  const refresh = useCallback(async () => {
    setList(await fetchInsightsList());
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchInsightsList()
      .then((rows) => {
        if (!cancelled) setList(rows);
      })
      .catch(() => {
        if (!cancelled) setList([]);
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = useCallback(
    <K extends keyof InsightFormInput>(key: K, value: InsightFormInput[K]) => {
      setForm((f) => ({ ...f, [key]: value }));
    },
    [],
  );

  const startEdit = useCallback((item: InsightArticle) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      body: item.body ?? '',
      date: insightDateToInputValue(item.date),
      image: item.image,
      href: item.href ?? '',
      authorName: item.authorName ?? '',
      authorRole: item.authorRole ?? '',
      slug: item.slug ?? '',
    });
    setStatus({ type: 'idle' });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setForm(createDefaultInsightForm());
    setStatus({ type: 'idle' });
  }, []);

  const submit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();

      const imageError = validateArticleImageUrl(form.image);
      if (imageError) {
        setStatus({ type: 'error', message: imageError });
        toast.error(imageError);
        return;
      }

      setStatus({ type: 'loading' });

      const wasEditing = editingId !== null;
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        body: form.body.trim() ? form.body.trim() : undefined,
        date: insightDateFromInputValue(form.date),
        image: form.image,
        href: form.href?.trim() ? form.href : undefined,
      };
      const an = form.authorName.trim();
      const ar = form.authorRole.trim();
      if (an) payload.authorName = an;
      if (ar) payload.authorRole = ar;
      const slugTrim = form.slug.trim().toLowerCase();
      if (slugTrim) payload.slug = slugTrim;

      try {
        if (editingId) {
          const res = await fetch(getSameOriginApiUrl(`insights/${editingId}`), {
            method: 'PATCH',
            credentials: 'include',
            headers: adminJsonHeaders(),
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!res.ok) {
            setStatus({
              type: 'error',
              message: getApiErrorMessage(data, 'Failed to update'),
            });
            return;
          }
        } else {
          const res = await fetch(getSameOriginApiUrl('insights'), {
            method: 'POST',
            credentials: 'include',
            headers: adminJsonHeaders(),
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!res.ok) {
            setStatus({
              type: 'error',
              message: getApiErrorMessage(data, 'Failed to create post'),
            });
            return;
          }
        }

        await refresh();
        setEditingId(null);
        setForm(createDefaultInsightForm());
        const successMessage = wasEditing
          ? 'Article updated.'
          : 'Article created.';
        toast.success(successMessage);
        setStatus({ type: 'success', message: successMessage });
      } catch {
        setStatus({ type: 'error', message: 'Request failed.' });
      }
    },
    [form, editingId, refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!globalThis.confirm('Delete this article from the database?')) return;
      setStatus({ type: 'loading' });
      try {
        const res = await fetch(getSameOriginApiUrlWithQuery('insights', { id }), {
          method: 'DELETE',
          credentials: 'include',
          headers: adminJsonHeaders(),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setStatus({
            type: 'error',
            message: getApiErrorMessage(data, 'Failed to delete'),
          });
          return;
        }
        if (editingId === id) {
          setEditingId(null);
          setForm(createDefaultInsightForm());
        }
        await refresh();
        toast.success('Article deleted.');
        setStatus({ type: 'success', message: 'Article deleted.' });
      } catch {
        setStatus({ type: 'error', message: 'Request failed.' });
      }
    },
    [refresh, editingId],
  );

  return {
    listLoading,
    editingId,
    cancelEdit,
    startEdit,
    setField,
    refresh,
    status,
    submit,
    remove,
    list,
    form,
  };
}
