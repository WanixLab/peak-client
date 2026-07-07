'use client';

import * as React from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { sessionRestored } from '@/redux/slices/authSlice';
import { loadSession } from '@/lib/authStorage';

/**
 * Restores a persisted session from localStorage into Redux on first mount,
 * then marks auth as hydrated so route guards can render.
 */
export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(sessionRestored(loadSession()));
  }, [dispatch]);

  return <>{children}</>;
}
