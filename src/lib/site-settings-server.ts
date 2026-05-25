import { cache } from 'react';

import { getDefaultSiteSettings } from '@/constants/data';
import { siteSettings } from '@/lib/site-settings-store';
import type { SiteSettings } from '@/types';

/** Server-only site settings (same source as `GET /api/settings`). */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const defaults = getDefaultSiteSettings();
  return {
    ...defaults,
    navigationLinks: siteSettings.navigationLinks,
    footerNavigation: siteSettings.footerNavigation,
    socialMediaLinks: siteSettings.socialMediaLinks,
    contactInfo: {
      ...defaults.contactInfo,
      ...siteSettings.contactInfo,
      phone:
        Array.isArray(siteSettings.contactInfo.phone) &&
        siteSettings.contactInfo.phone.length > 0
          ? siteSettings.contactInfo.phone
          : defaults.contactInfo.phone,
    },
    stats: siteSettings.stats,
  };
});
