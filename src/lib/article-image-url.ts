/** Returns an error message, or null when the URL can be used as an <img src>. */
export function validateArticleImageUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return 'Hero image URL is required.';
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return 'Image must be a valid https URL.';
  }

  if (parsed.protocol !== 'https:') {
    return 'Image URL must use https.';
  }

  const host = parsed.hostname.toLowerCase();

  if (host.includes('drive.google.com') || host.includes('docs.google.com')) {
    return 'Google Drive links cannot be used as hero images. Use Upload image, or paste a direct Cloudinary / .jpg / .png URL.';
  }

  if (host === 'res.cloudinary.com') {
    return null;
  }

  const trustedImageHosts = ['images.unsplash.com', 'picsum.photos'];
  if (trustedImageHosts.includes(host)) {
    return null;
  }

  if (/\.(jpe?g|png|webp|gif)(\?|#|$)/i.test(parsed.pathname)) {
    return null;
  }

  return 'Use Upload image, or paste a direct link to a .jpg or .png file (not a folder or sharing page).';
}
