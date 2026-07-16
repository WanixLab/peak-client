'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import type { SvgIconComponent } from '@mui/icons-material';
import { Box, CircularProgress } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * Visual treatment of the button. All are driven by a single `color`, mirroring
 * the {@link Chip} component so the two read as one family:
 *
 * - `solid`    — full colour fill with contrast text. The primary call-to-action.
 * - `soft`     — faded tint fill + coloured text, hairline tinted border.
 * - `outlined` — coloured border + text on a transparent surface.
 * - `smooth`   — a soft top-to-bottom colour fade + border, slightly glossier.
 * - `ghost`    — no fill until hover; coloured text. For low-emphasis actions.
 * - `link`     — text-only with an underline on hover.
 */
export type ButtonVariant = 'solid' | 'soft' | 'outlined' | 'smooth' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  children?: ReactNode;
  /**
   * A single accent colour (hex/rgb/theme colour). The fill, border and text
   * tints are all derived from it automatically. Defaults to the theme primary.
   */
  color?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon — an MUI icon component or any node. */
  startIcon?: SvgIconComponent | ReactNode;
  /** Trailing icon — an MUI icon component or any node. */
  endIcon?: SvgIconComponent | ReactNode;
  /** Shows a spinner and blocks clicks while a request is in flight. */
  loading?: boolean;
  /** Stretches the button to the full width of its container. */
  fullWidth?: boolean;
  /** Square icon-only button — pass a single icon as `children` or `startIcon`. */
  iconOnly?: boolean;
}

const SIZES: Record<
  ButtonSize,
  { height: number; px: number; gap: number; font: number; icon: number; radius: number }
> = {
  sm: { height: 32, px: 1.5, gap: 0.625, font: 13, icon: 16, radius: 1.25 },
  md: { height: 40, px: 2, gap: 0.75, font: 14, icon: 18, radius: 1.5 },
  lg: { height: 48, px: 2.75, gap: 0.875, font: 15, icon: 20, radius: 1.75 },
};

function isIconComponent(icon: AppButtonProps['startIcon']): icon is SvgIconComponent {
  return typeof icon === 'function' || (typeof icon === 'object' && icon !== null && !React.isValidElement(icon));
}

function renderIcon(icon: AppButtonProps['startIcon'], fontSize: number): ReactNode {
  if (!icon) return null;
  if (isIconComponent(icon)) {
    return React.createElement(icon as SvgIconComponent, { sx: { fontSize } });
  }
  return icon;
}

/**
 * The shared button for the whole app, in six colour-driven styles
 * (solid / soft / outlined / smooth / ghost / link). Everything is derived from
 * a single `color`, so a caller picks one hue and the fill, border and text
 * fades come for free — the same model as {@link Chip}.
 *
 * Supports leading/trailing icons, a `loading` spinner, `fullWidth`, and an
 * `iconOnly` square layout, and reads consistently in light and dark mode.
 */
export default function Button({
  children,
  color,
  variant = 'solid',
  size = 'md',
  startIcon,
  endIcon,
  loading = false,
  fullWidth = false,
  iconOnly = false,
  disabled = false,
  type = 'button',
  ...rest
}: AppButtonProps) {
  const theme = useTheme();
  const accent = color ?? theme.palette.primary.main;
  const s = SIZES[size];
  const isDisabled = disabled || loading;

  const contrast = theme.palette.getContrastText(accent);

  let bg: string;
  let border: string;
  let fg: string;
  let hoverBg: string;
  let hoverBorder: string;
  let shadow = 'none';
  let hoverShadow = 'none';

  switch (variant) {
    case 'solid':
      bg = accent;
      border = accent;
      fg = contrast;
      hoverBg = alpha(accent, 0.88);
      hoverBorder = alpha(accent, 0.88);
      shadow = `0 1px 2px ${alpha(accent, 0.4)}, 0 6px 16px -6px ${alpha(accent, 0.5)}`;
      hoverShadow = `0 2px 4px ${alpha(accent, 0.4)}, 0 10px 22px -6px ${alpha(accent, 0.55)}`;
      break;
    case 'soft':
      bg = alpha(accent, 0.12);
      border = alpha(accent, 0.18);
      fg = accent;
      hoverBg = alpha(accent, 0.2);
      hoverBorder = alpha(accent, 0.28);
      break;
    case 'outlined':
      bg = 'transparent';
      border = alpha(accent, 0.45);
      fg = accent;
      hoverBg = alpha(accent, 0.08);
      hoverBorder = alpha(accent, 0.7);
      break;
    case 'smooth':
      bg = `linear-gradient(180deg, ${alpha(accent, 0.14)}, ${alpha(accent, 0.24)})`;
      border = alpha(accent, 0.4);
      fg = accent;
      hoverBg = `linear-gradient(180deg, ${alpha(accent, 0.22)}, ${alpha(accent, 0.34)})`;
      hoverBorder = alpha(accent, 0.55);
      break;
    case 'ghost':
      bg = 'transparent';
      border = 'transparent';
      fg = accent;
      hoverBg = alpha(accent, 0.1);
      hoverBorder = 'transparent';
      break;
    case 'link':
    default:
      bg = 'transparent';
      border = 'transparent';
      fg = accent;
      hoverBg = 'transparent';
      hoverBorder = 'transparent';
      break;
  }

  const isLink = variant === 'link';

  return (
    <Box
      component="button"
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        height: iconOnly ? s.height : s.height,
        width: fullWidth ? '100%' : iconOnly ? s.height : 'auto',
        px: iconOnly || isLink ? 0 : s.px,
        maxWidth: '100%',
        borderRadius: isLink ? 0.5 : s.radius,
        background: bg,
        border: '1px solid',
        borderColor: border,
        color: fg,
        fontSize: s.font,
        fontWeight: 600,
        fontFamily: 'inherit',
        lineHeight: 1,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        cursor: isDisabled ? 'default' : 'pointer',
        userSelect: 'none',
        verticalAlign: 'middle',
        appearance: 'none',
        textDecoration: 'none',
        boxShadow: shadow,
        opacity: isDisabled ? 0.5 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto',
        transition:
          'background .18s ease, border-color .18s ease, box-shadow .18s ease, transform .1s ease, color .18s ease',
        '&:hover': {
          background: hoverBg,
          borderColor: hoverBorder,
          boxShadow: hoverShadow,
          ...(isLink && { textDecoration: 'underline', textUnderlineOffset: 3 }),
        },
        '&:active': { transform: isLink ? 'none' : 'translateY(1px)' },
        '&:focus-visible': {
          outline: `2px solid ${alpha(accent, 0.6)}`,
          outlineOffset: 2,
        },
      }}
      {...rest}
    >
      {/* Contents fade out under the spinner so the button keeps its width. */}
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: s.gap,
          opacity: loading ? 0 : 1,
          transition: 'opacity .15s ease',
        }}
      >
        {startIcon && (
          <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0, ml: iconOnly ? 0 : -0.25 }}>
            {renderIcon(startIcon, s.icon)}
          </Box>
        )}
        {iconOnly ? renderIcon(children as AppButtonProps['startIcon'], s.icon) : children}
        {endIcon && (
          <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0, mr: -0.25 }}>
            {renderIcon(endIcon, s.icon)}
          </Box>
        )}
      </Box>

      {loading && (
        <Box
          component="span"
          sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}
        >
          <CircularProgress size={s.icon} thickness={5} sx={{ color: fg }} />
        </Box>
      )}
    </Box>
  );
}
