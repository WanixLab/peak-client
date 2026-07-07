'use client';

import TimelineIcon from '@mui/icons-material/Timeline';
import PagePlaceholder from '@/components/common/PagePlaceholder';

export default function ReportsActivityPage() {
  return (
    <PagePlaceholder
      title="Activity"
      description="Recent activity and event timeline."
      icon={TimelineIcon}
      file="src/app/(protected)/reports/activity/page.tsx"
    />
  );
}
