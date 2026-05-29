import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

import { requireLandingAdminApiAuth } from '@/lib/supabase-api-auth';

const MAX_BYTES = 3 * 1024 * 1024;

function detectImageKind(buf: Buffer): 'jpeg' | 'png' | null {
  if (buf.length < 8) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return 'png';
  }
  return null;
}

export async function POST(request: Request) {
  const denied = await requireLandingAdminApiAuth();
  if (!denied.ok) return denied.response;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error: 'Cloudinary is not configured',
        message:
          'Image upload is not configured on the server. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel (see DEPLOY.md), or paste an image URL in the form instead.',
      },
      { status: 503 },
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Expected a file field named "file"' },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'File must be 3 MB or smaller' },
      { status: 400 },
    );
  }

  const allowedMime = new Set(['image/jpeg', 'image/jpg', 'image/png']);
  if (file.type && !allowedMime.has(file.type)) {
    return NextResponse.json(
      { error: 'Only JPG and PNG images are allowed' },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = detectImageKind(buffer);
  if (!kind) {
    return NextResponse.json(
      { error: 'File is not a valid JPG or PNG image' },
      { status: 400 },
    );
  }

  const mime = kind === 'jpeg' ? 'image/jpeg' : 'image/png';
  const dataUri = `data:${mime};base64,${buffer.toString('base64')}`;

  const folder =
    process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || 'emprinte/blog';

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: 'image',
    });
    const url = result.secure_url;
    if (!url) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 502 });
    }
    return NextResponse.json({ url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Upload failed';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
