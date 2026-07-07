'use client';

import DescriptionIcon from '@mui/icons-material/Description';
import PagePlaceholder from '@/components/common/PagePlaceholder';

export default function DocumentsPage() {
  return (
    <PagePlaceholder
      title="Documents"
      description="Browse and organize documents."
      icon={DescriptionIcon}
      file="src/app/(protected)/management/documents/page.tsx"
    />
  );
}
