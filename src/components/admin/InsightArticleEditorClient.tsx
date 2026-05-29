'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { FieldLabel, LabeledInput, LabeledTextarea } from '@/components/admin/LabeledField';
import { InsightArticleBodyEditor } from '@/components/admin/InsightArticleBodyEditor';
import { PrimarySubmitButton } from '@/components/admin/PrimarySubmitButton';
import { ArticleHeroCropModal } from '@/components/admin/ArticleHeroCropModal';
import { FormStatusBanner } from '@/components/admin/FormStatusBanner';
import { useAdminInsights } from '@/hooks/admin/useAdminInsights';
import {
  uploadImageToCloudinary,
  validateJpegPngUnder3Mb,
} from '@/lib/client-cloudinary-upload';
import { validateArticleImageUrl } from '@/lib/article-image-url';
import { slugifyTitle } from '@/lib/insight-slug';
import { getSameOriginApiUrl } from '@/lib/api';
import type { InsightArticle } from '@/types';

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png']);

function validateImageFileClient(file: File): string | null {
  if (file.type && !ALLOWED_IMAGE_MIME.has(file.type)) {
    return 'Only JPG and PNG files are allowed.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'File must be 3 MB or smaller.';
  }
  return null;
}

export function InsightArticleEditorClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(Boolean(editId));
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const {
    cancelEdit,
    editingId,
    startEdit,
    setField,
    status,
    submit,
    form,
  } = useAdminInsights();

  useEffect(() => {
    if (!editId) {
      cancelEdit();
      setLoadingArticle(false);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    setLoadingArticle(true);
    setLoadError(null);

    (async () => {
      try {
        const res = await fetch(
          getSameOriginApiUrl(`insights/${encodeURIComponent(editId)}`),
          { credentials: 'include', cache: 'no-store' },
        );
        const data: unknown = await res.json().catch(() => null);
        if (!res.ok || !data || typeof data !== 'object' || !('id' in data)) {
          if (!cancelled) {
            setLoadError('Could not load this post.');
            toast.error('Post not found or you may need to sign in again.');
          }
          return;
        }
        if (!cancelled) startEdit(data as InsightArticle);
      } catch {
        if (!cancelled) setLoadError('Request failed.');
      } finally {
        if (!cancelled) setLoadingArticle(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editId, cancelEdit, startEdit]);

  const closeCropModal = () => {
    setCropModalOpen(false);
    if (cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
      setCropImageSrc(null);
    }
  };

  const uploadCroppedHeroFile = async (file: File): Promise<boolean> => {
    setUploadingImage(true);
    setUploadError(null);
    try {
      const err = validateImageFileClient(file);
      if (err) {
        setUploadError(err);
        return false;
      }
      const result = await uploadImageToCloudinary(file);
      if (!result.ok) {
        setUploadError(result.message);
        return false;
      }
      setField('image', result.url);
      toast.success('Hero image updated.');
      return true;
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed.');
      return false;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleHeroImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const err = validateImageFileClient(file);
    if (err) {
      setUploadError(err);
      return;
    }
    setUploadError(null);
    setCropImageSrc(URL.createObjectURL(file));
    setCropModalOpen(true);
  };

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      await submit(e);
    },
    [submit],
  );

  useEffect(() => {
    if (status.type !== 'success') return;
    const msg = status.message ?? '';
    if (msg === 'Article updated.' || msg === 'Article created.') {
      router.push('/admin/blog');
      router.refresh();
    }
  }, [status, router]);

  const suggestedSlug = slugifyTitle(form.title);
  const imageUrlWarning = form.image ? validateArticleImageUrl(form.image) : null;

  if (editId && loadingArticle) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center font-poppins text-sm text-[#5a6570]">
        Loading editor…
      </div>
    );
  }

  if (editId && loadError) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50/80 px-6 py-8 text-center">
        <p className="font-poppins text-sm font-medium text-red-800">{loadError}</p>
        <Link
          href="/admin/blog"
          className="mt-4 inline-block font-poppins text-sm font-semibold text-[#005D51] underline"
        >
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="sticky top-0 z-10 border-b border-[#005D51]/10 bg-[#f4faf8]/95 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[860px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/blog"
              className="font-poppins text-xs font-semibold text-[#005D51] hover:text-[#004438]"
            >
              ← All posts
            </Link>
            <h1 className="mt-1 font-lora text-xl font-bold text-[#142218] sm:text-2xl">
              {editingId ? 'Edit story' : 'New story'}
            </h1>
            <p className="mt-0.5 max-w-md font-poppins text-xs text-[#5a6570] sm:text-sm">
              Calm, full-width editor—title, excerpt, rich body, hero image, and a
              clean public URL.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-[860px] flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10"
      >
        <LabeledInput
          label="Title"
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          required
        />

        <LabeledTextarea
          label="Short excerpt"
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          rows={3}
          required
        />

        <div>
          <FieldLabel label="URL slug (optional)">
            <p className="mb-2 font-poppins text-xs text-[#5a6570]">
              Leave blank to auto-build from the title (
              <span className="font-mono text-[#142218]">{suggestedSlug || '…'}</span>
              ). Lowercase letters, numbers, and hyphens only.
            </p>
            <input
              type="text"
              value={form.slug}
              onChange={(e) =>
                setField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
              }
              placeholder={suggestedSlug}
              maxLength={96}
              className="w-full rounded-xl border border-[#005D51]/15 bg-white px-4 py-3 font-mono text-sm text-[#142218] outline-none transition focus:border-[#005D51]/40"
            />
          </FieldLabel>
        </div>

        <div>
          <FieldLabel label="Story body">
            <p className="mb-2 font-poppins text-xs text-[#5a6570]">
              Rich text: headings, lists, quotes, bold, italic, and links.
            </p>
            <InsightArticleBodyEditor
              key={editingId ?? 'new'}
              value={form.body}
              onChange={(html) => setField('body', html)}
              disabled={status.type === 'loading'}
            />
          </FieldLabel>
        </div>

        <LabeledInput
          label="Publication date"
          type="date"
          value={form.date}
          onChange={(e) => setField('date', e.target.value)}
          required
        />

        <div className="rounded-xl border border-[#005D51]/10 bg-[#fafcfb] px-4 py-4 sm:px-5">
          <p className="font-poppins text-sm font-semibold text-[#142218]">
            Author byline
          </p>
          <p className="mt-1 font-poppins text-xs leading-relaxed text-[#5a6570]">
            Optional. Shown at the bottom of the public article.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <LabeledInput
              label="Author name"
              value={form.authorName}
              onChange={(e) => setField('authorName', e.target.value)}
              placeholder="e.g. Olalekan Owolabi"
              maxLength={120}
            />
            <LabeledInput
              label="Role or title"
              value={form.authorRole}
              onChange={(e) => setField('authorRole', e.target.value)}
              placeholder="e.g. Director, Emprinte Readers Hub"
              maxLength={200}
            />
          </div>
        </div>

        <div className="space-y-3">
          <FieldLabel label="Hero image">
            <input
              ref={imageFileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
              className="sr-only"
              aria-label="Upload hero image"
              onChange={handleHeroImageFile}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => imageFileInputRef.current?.click()}
                className="inline-flex items-center justify-center rounded-xl border-2 border-[#005D51] bg-white px-4 py-2.5 font-poppins text-sm font-semibold text-[#005D51] transition hover:border-[#004438] hover:bg-[#005D51]/08 disabled:opacity-50"
              >
                {uploadingImage ? 'Uploading…' : 'Upload image'}
              </button>
              <span className="font-poppins text-xs font-medium text-[#5a6570]">
                JPG or PNG, up to 3 MB. A crop step matches the wide cover on the
                public article (2:1), or paste any image URL below.
              </span>
            </div>
            {form.image ? (
              <div className="relative mt-2 aspect-2/1 w-full max-w-md overflow-hidden rounded-xl border border-[#005D51]/12 bg-[#dfecea]">
                <Image
                  src={form.image}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : null}
            {uploadError ? (
              <p className="font-poppins text-sm font-medium text-red-700" role="alert">
                {uploadError}
              </p>
            ) : null}
          </FieldLabel>

          <LabeledInput
            label="Image URL"
            type="url"
            value={form.image}
            onChange={(e) => {
              setField('image', e.target.value);
              setUploadError(null);
            }}
            placeholder="Filled automatically after upload"
            required
          />
          {imageUrlWarning ? (
            <p className="font-poppins text-sm font-medium text-amber-800" role="status">
              {imageUrlWarning}
            </p>
          ) : null}
        </div>

        <LabeledInput
          label="External link (optional)"
          type="url"
          value={form.href}
          onChange={(e) => setField('href', e.target.value)}
          placeholder="If the full story lives elsewhere"
        />

        <div className="flex flex-wrap items-center gap-3 border-t border-[#005D51]/10 pt-6">
          <PrimarySubmitButton
            loading={status.type === 'loading'}
            idleLabel={editingId ? 'Save changes' : 'Publish'}
            loadingLabel={editingId ? 'Saving…' : 'Publishing…'}
          />
          <Link
            href="/admin/blog"
            className="inline-flex items-center rounded-xl border border-[#005D51]/20 px-4 py-2.5 font-poppins text-sm font-semibold text-[#005D51] hover:bg-[#005D51]/08"
          >
            Cancel
          </Link>
        </div>
        <FormStatusBanner status={status} />
      </form>

      <ArticleHeroCropModal
        open={cropModalOpen}
        imageSrc={cropImageSrc}
        onClose={closeCropModal}
        onCropped={(file) => uploadCroppedHeroFile(file)}
      />
    </div>
  );
}
