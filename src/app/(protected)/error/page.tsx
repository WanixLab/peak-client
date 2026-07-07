'use client';

/**
 * Dashboard page — intentionally throws during render to demonstrate the 500
 * error page (src/app/error.tsx). The error bubbles up to the root error
 * boundary, which renders outside the app shell (no sidebar/header).
 */
export default function DashboardPage() {
  throw new Error('Dashboard failed to load (demo 500 error).');
}
