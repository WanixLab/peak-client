import { appConfig } from '@/config';
import type { User } from '@/redux/slices/authSlice';

/**
 * Tiny wrapper around localStorage for persisting the auth session.
 * All functions are safe to call on the server (they no-op without `window`).
 */

export interface StoredSession {
  user: User;
  token: string;
}

export function saveSession(session: StoredSession): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(appConfig.auth.tokenStorageKey, session.token);
  window.localStorage.setItem(appConfig.auth.userStorageKey, JSON.stringify(session.user));
}

export function loadSession(): StoredSession | null {
  if (typeof window === 'undefined') return null;
  const token = window.localStorage.getItem(appConfig.auth.tokenStorageKey);
  const rawUser = window.localStorage.getItem(appConfig.auth.userStorageKey);
  if (!token || !rawUser) return null;
  try {
    return { token, user: JSON.parse(rawUser) as User };
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(appConfig.auth.tokenStorageKey);
  window.localStorage.removeItem(appConfig.auth.userStorageKey);
}
