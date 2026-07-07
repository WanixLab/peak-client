'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorScreen from '@/components/common/ErrorScreen';

/**
 * Runtime error page (the App Router equivalent of a 500). Catches errors from
 * the route tree below the root layout and renders in place of it — so the
 * app shell (sidebar/header) is not shown. `reset` retries the failed render.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with a real error-reporting service (Sentry, etc.) in production.
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      code="500"
      title="Something went wrong"
      description="An unexpected error occurred. You can try again, or head back home."
      actions={
        <>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={() => reset()}>
            Try again
          </Button>
          <Button component={Link} href="/home" variant="outlined" startIcon={<HomeIcon />}>
            Back to home
          </Button>
        </>
      }
    />
  );
}
