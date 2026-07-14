/**
 * Accent colours for KPI tiles, icon badges and status highlights.
 *
 * Kept separate from the MUI theme palette (which only defines the brand
 * primary) so any screen can reach for a small, consistent set of hues that
 * read well in both light and dark mode.
 */
export const ACCENT = {
  violet: '#6D28D9',
  blue: '#2563EB',
  green: '#059669',
  amber: '#D97706',
  pink: '#DB2777',
  cyan: '#0891B2',
} as const;

export type AccentColor = (typeof ACCENT)[keyof typeof ACCENT];
