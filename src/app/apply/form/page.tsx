import { Suspense } from 'react';

import { CommunityApplicationWizard } from '@/components/apply/CommunityApplicationWizard';

export default function ApplyFormPage() {
  return (
    <Suspense fallback={null}>
      <CommunityApplicationWizard />
    </Suspense>
  );
}
