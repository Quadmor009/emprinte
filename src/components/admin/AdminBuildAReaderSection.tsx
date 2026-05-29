'use client';

import Image from 'next/image';
import { useCallback, useId, useState, type ChangeEvent } from 'react';
import { toast } from 'sonner';

import { BuildReaderSlideCropModal } from './BuildReaderSlideCropModal';
import { AdminSection } from './AdminSection';
import { FieldLabel } from './LabeledField';
import { FormStatusBanner } from './FormStatusBanner';
import { PrimarySubmitButton } from './PrimarySubmitButton';
import { adminFormPanel, adminInputPlain } from './admin-styles';
import { useAdminBuildAReader } from '@/hooks/admin/useAdminBuildAReader';
import {
  uploadImageToCloudinaryWithProgress,
  validateJpegPngUnder3Mb,
} from '@/lib/client-cloudinary-upload';

function RemoveSlideIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface AdminBuildAReaderSectionProps {
  /** When true, only the inner form is rendered (e.g. inside a modal). */
  embedded?: boolean;
}

export function AdminBuildAReaderSection({ embedded }: AdminBuildAReaderSectionProps) {
  const { data, updateField, appendSlideUrl, removeSlideAt, status, submit } =
    useAdminBuildAReader();
  const [pasteUrl, setPasteUrl] = useState('');
  const [slideUploadPercent, setSlideUploadPercent] = useState<number | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const addFileId = useId();
  const addUrlInputId = useId();

  const slideUploading = slideUploadPercent !== null;

  const closeCropModal = useCallback(() => {
    setCropModalOpen(false);
    setCropImageSrc((src) => {
      if (src) URL.revokeObjectURL(src);
      return null;
    });
  }, []);

  const uploadCroppedSlideFile = async (file: File): Promise<boolean> => {
    if (!data) return false;
    const sizeErr = validateJpegPngUnder3Mb(file);
    if (sizeErr) {
      toast.error(sizeErr);
      return false;
    }
    setSlideUploadPercent(0);
    try {
      const r = await uploadImageToCloudinaryWithProgress(file, setSlideUploadPercent);
      if (!r.ok) {
        toast.error(r.message);
        return false;
      }
      appendSlideUrl(r.url);
      toast.success('Slide added.');
      return true;
    } catch {
      toast.error('Upload failed.');
      return false;
    } finally {
      setSlideUploadPercent(null);
    }
  };

  const onAddSlideFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !data) return;
    if (data.slideshowUrls.length >= 5) {
      toast.message('You can add at most 5 images.');
      return;
    }
    const err = validateJpegPngUnder3Mb(file);
    if (err) {
      toast.error(err);
      return;
    }
    setCropImageSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setCropModalOpen(true);
  };

  const handleAddPasteUrl = () => {
    if (!data || data.slideshowUrls.length >= 5) {
      toast.message('You can add at most 5 images.');
      return;
    }
    const u = pasteUrl.trim();
    if (!/^https?:\/\//i.test(u)) {
      toast.error('Enter a full image URL (https://…).');
      return;
    }
    appendSlideUrl(u);
    setPasteUrl('');
    toast.success('Slide added.');
  };

  const inner =
    !data ? (
      <p className="text-gray-600">Loading…</p>
    ) : (
      <>
        <form onSubmit={submit} className={`${adminFormPanel} space-y-8`}>
        <div className="space-y-4">
          <FieldLabel label="Books collected">
            <input
              type="number"
              min={0}
              value={data.booksCollected}
              onChange={(e) =>
                updateField('booksCollected', parseInt(e.target.value, 10) || 0)
              }
              className={adminInputPlain}
            />
          </FieldLabel>
          <FieldLabel label="Total books (goal)">
            <input
              type="number"
              min={1}
              value={data.totalBooks}
              onChange={(e) =>
                updateField('totalBooks', parseInt(e.target.value, 10) || 1)
              }
              className={adminInputPlain}
            />
          </FieldLabel>
          <FieldLabel label="Price per book (NGN)">
            <input
              type="number"
              min={0}
              value={data.pricePerBook}
              onChange={(e) =>
                updateField('pricePerBook', parseInt(e.target.value, 10) || 0)
              }
              className={adminInputPlain}
            />
          </FieldLabel>
        </div>

        <div className="rounded-2xl border border-[#005D51]/12 bg-linear-to-b from-white to-[#f6faf9] p-5 shadow-[0_1px_0_rgba(0,93,81,0.06)] sm:p-6">
          <div className="flex flex-col gap-1 border-b border-[#005D51]/10 pb-4">
            <p className="font-lora text-base font-semibold text-[#142218] sm:text-lg">
              Hero slideshow
            </p>
            <p className="font-poppins text-xs leading-relaxed text-[#5c6b5f] sm:text-sm">
              Up to 5 images for the Build a Reader block. JPG or PNG, max 3 MB — file uploads open
              a crop step, then go to Cloudinary. You can still paste a full URL without cropping.
              Save when you are done to publish.
            </p>
            <p className="font-poppins text-[11px] font-medium uppercase tracking-wide text-[#005D51]/80">
              {data.slideshowUrls.length} / 5 in list
            </p>
          </div>

          {data.slideshowUrls.length > 0 ? (
            <ul className="mt-5 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
              {data.slideshowUrls.map((url, idx) => (
                <li key={`${url}-${idx}`} className="relative">
                  <div className="relative h-44 w-full overflow-hidden rounded-xl border border-[#142218]/10 bg-[#eef5f3] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-contain p-3"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSlideAt(idx)}
                    aria-label={`Remove slide ${idx + 1}`}
                    className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-[#142218]/80 text-white shadow-md backdrop-blur-sm transition hover:bg-[#0f1812] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005D51]"
                  >
                    <RemoveSlideIcon />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-xl border border-dashed border-[#005D51]/20 bg-white/60 px-4 py-8 text-center font-poppins text-sm text-[#5c6b5f]">
              No slides yet — add photos below or keep this empty for the default hero.
            </p>
          )}

          {data.slideshowUrls.length < 5 ? (
            <div className="mt-6 flex flex-col gap-5 border-t border-[#005D51]/10 pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    htmlFor={addFileId}
                    className={`inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#005D51] px-5 py-2.5 font-poppins text-sm font-semibold text-white shadow-[0_2px_8px_-2px_rgba(0,93,81,0.45)] transition hover:bg-[#004438] focus-within:ring-2 focus-within:ring-[#005D51] focus-within:ring-offset-2 ${
                      slideUploading ? 'pointer-events-none opacity-55' : ''
                    }`}
                  >
                    {slideUploading ? 'Uploading…' : 'Upload image'}
                  </label>
                  <input
                    id={addFileId}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="sr-only"
                    disabled={slideUploading || cropModalOpen}
                    onChange={onAddSlideFile}
                  />
                  <span className="font-poppins text-xs text-[#5c6b5f]">
                    JPG or PNG · max 3 MB · crop before upload
                  </span>
                </div>
              </div>

              {slideUploadPercent !== null ? (
                <div className="space-y-2 rounded-xl border border-[#005D51]/15 bg-white/90 px-4 py-3">
                  <div className="flex items-center justify-between font-poppins text-xs font-semibold text-[#142218]">
                    <span>Upload progress</span>
                    <span className="tabular-nums text-[#005D51]">{slideUploadPercent}%</span>
                  </div>
                  <div
                    className="h-2.5 overflow-hidden rounded-full bg-[#dfecea]"
                    role="progressbar"
                    aria-valuenow={slideUploadPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Image upload progress"
                  >
                    <div
                      className="h-full rounded-full bg-[#005D51] transition-[width] duration-150 ease-out"
                      style={{ width: `${slideUploadPercent}%` }}
                    />
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <FieldLabel label="Or paste image URL">
                    <input
                      id={addUrlInputId}
                      type="url"
                      value={pasteUrl}
                      onChange={(e) => setPasteUrl(e.target.value)}
                      placeholder="https://…"
                      className={adminInputPlain}
                      disabled={slideUploading}
                    />
                  </FieldLabel>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddPasteUrl()}
                  disabled={slideUploading}
                  className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#005D51]/25 bg-white px-5 font-poppins text-sm font-semibold text-[#005D51] transition hover:border-[#005D51]/45 hover:bg-[#005D51]/06 disabled:opacity-50"
                >
                  Add URL
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-6 rounded-lg bg-[#fff8f0] px-4 py-3 text-center font-poppins text-xs font-medium text-[#8a5a2b]">
              Maximum of 5 slides reached. Remove one to add another.
            </p>
          )}
        </div>

        <PrimarySubmitButton
          loading={status.type === 'loading'}
          idleLabel="Save Build a Reader"
          loadingLabel="Saving…"
        />
        <FormStatusBanner status={status} />
        </form>

        <BuildReaderSlideCropModal
          open={cropModalOpen}
          imageSrc={cropImageSrc}
          onClose={closeCropModal}
          onCropped={(file) => uploadCroppedSlideFile(file)}
        />
      </>
    );

  if (embedded) return inner;

  return (
    <AdminSection title="Edit Build a Reader">
      {inner}
    </AdminSection>
  );
}
