'use client';

import * as React from 'react';
import StoreProvider from '@/redux/StoreProvider';
import ThemeRegistry from '@/theme/ThemeRegistry';
import { AlertProvider } from '@/components/alert/AlertProvider';
import AuthInitializer from './AuthInitializer';

/**
 * Root client providers, composed in order:
 *   Redux store -> MUI/emotion theme -> session restore -> global alert dialog.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ThemeRegistry>
        <AuthInitializer>
          <AlertProvider>{children}</AlertProvider>
        </AuthInitializer>
      </ThemeRegistry>
    </StoreProvider>
  );
}
