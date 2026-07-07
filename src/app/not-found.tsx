'use client';

import Link from 'next/link';
import { Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ErrorScreen from '@/components/common/ErrorScreen';

/**
 * 404 page. Lives at the app root, so it renders outside the protected app
 * shell (no sidebar/header).
 */
export default function NotFound() {
  return (
    <ErrorScreen
      code="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or may have been moved."
      actions={
        <Button component={Link} href="/home" variant="contained" startIcon={<HomeIcon />}>
          Back to home
        </Button>
      }
    />
  );
}
