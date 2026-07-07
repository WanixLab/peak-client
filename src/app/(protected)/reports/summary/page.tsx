'use client';

import SummarizeIcon from '@mui/icons-material/Summarize';
import PagePlaceholder from '@/components/common/PagePlaceholder';

export default function ReportsSummaryPage() {
  return (
    <PagePlaceholder
      title="Summary"
      description="High-level report of key metrics."
      icon={SummarizeIcon}
      file="src/app/(protected)/reports/summary/page.tsx"
    />
  );
}
