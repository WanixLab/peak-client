import type { Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

/**
 * Soft, layered card shadow shared across the app so raised surfaces read the
 * same in light and dark mode. Mirrors the treatment used on the home page.
 */
export const SHADOW = {
  base: '0 1px 3px rgba(15,23,42,0.06), 0 8px 24px -6px rgba(15,23,42,0.12)',
  baseDark: '0 1px 3px rgba(0,0,0,0.5), 0 10px 26px -6px rgba(0,0,0,0.65)',
  hover: '0 14px 32px -8px rgba(15,23,42,0.20)',
  hoverDark: '0 16px 36px -8px rgba(0,0,0,0.8)',
} as const;

/**
 * Borderless card with the shared soft shadow — the standard "home style"
 * surface. Pass directly as a `Card`'s `sx` (it's a theme callback):
 * `sx={softCard}`.
 */
export const softCard = (theme: Theme): SystemStyleObject<Theme> => ({
  border: 'none',
  borderRadius: 2,
  boxShadow: SHADOW.base,
  ...theme.applyStyles('dark', { boxShadow: SHADOW.baseDark }),
});

/**
 * Interactive variant of {@link softCard}: lifts and deepens its shadow on
 * hover. Use for clickable cards or list rows — `sx={softCardHover}`.
 */
export const softCardHover = (theme: Theme): SystemStyleObject<Theme> => ({
  ...softCard(theme),
  transition: 'box-shadow .2s ease, transform .2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: SHADOW.hover,
    ...theme.applyStyles('dark', { boxShadow: SHADOW.hoverDark }),
  },
});
