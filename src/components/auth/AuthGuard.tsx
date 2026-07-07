'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAppSelector } from '@/redux/hooks';
import { appConfig } from '@/config';

/**
 * Client-side route guard. Waits for the session to hydrate, then redirects
 * unauthenticated users to the login page. Renders a loader until it knows.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hydrated } = useAppSelector((state) => state.auth);

  React.useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace(appConfig.routes.login);
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
