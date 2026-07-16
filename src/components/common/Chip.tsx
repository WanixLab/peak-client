'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import type { SvgIconComponent } from '@mui/icons-material';
import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Visual treatment of the chip. All four are driven by a single `color`:
 *
 * - `outlined` — coloured border + text on a transparent surface, rounded rect.
 * - `soft`     — faded tint fill + coloured text, hairline tinted border.
 * - `plain`    — the `soft` tint fill + coloured text, but with no border.
 * - `solid`    — full colour fill with contrast text.
 * - `smooth`   — pill-shaped with a soft top-to-bottom colour fade + border.
 */
export type ChipVariant = 'outlined' | 'soft' | 'plain' | 'solid' | 'smooth';
export type ChipSize = 'sm' | 'md';

export interface ChipProps {
  label: ReactNode;
  /**
   * A single accent colour (hex/rgb/theme colour). The background, border and
   * text tints are all derived from it automatically — pass one colour and the
   * fade is handled for you. Defaults to the theme primary.
   */
  color?: string;
  variant?: ChipVariant;
  size?: ChipSize;
  /** Leading icon — an MUI icon component or any node. */
  icon?: SvgIconComponent | ReactNode;
  /** Renders a trailing "×" that calls this when clicked. */
  onDelete?: () => void;
  /** Makes the whole chip clickable (adds hover + pointer + keyboard). */
  onClick?: () => void;
  /** Selected/active state — deepens the fill for outlined/soft/smooth. */
  selected?: boolean;
  disabled?: boolean;
}

const SIZES: Record<ChipSize, { height: number; px: number; gap: number; font: number; icon: number; radius: number }> = {
  sm: { height: 24, px: 0.875, gap: 0.5, font: 12, icon: 14, radius: 1.25 },
  md: { height: 30, px: 1.125, gap: 0.625, font: 13, icon: 16, radius: 1.5 },
};

function isIconComponent(icon: ChipProps['icon']): icon is SvgIconComponent {
  return typeof icon === 'function' || typeof icon === 'object';
}

/**
 * A compact, colour-driven chip in four styles (outlined / soft / solid /
 * smooth). Everything is derived from a single `color`, so a caller only picks
 * one hue and the surface, border and text fades come for free. Supports a
 * leading icon, an optional delete affordance, and click/selected states, and
 * reads consistently in light and dark mode.
 */
export default function Chip({
  label,
  color,
  variant = 'soft',
  size = 'md',
  icon,
  onDelete,
  onClick,
  selected = false,
  disabled = false,
}: ChipProps) {
  const theme = useTheme();
  const accent = color ?? theme.palette.primary.main;
  const s = SIZES[size];
  const clickable = Boolean(onClick) && !disabled;

  // --- Derive the whole palette from the single accent colour ---------------
  const contrast = theme.palette.getContrastText(accent);

  let bg: string;
  let border: string;
  let fg: string;
  let hoverBg: string;

  switch (variant) {
    case 'solid':
      bg = accent;
      border = accent;
      fg = contrast;
      hoverBg = alpha(accent, 0.88);
      break;
    case 'outlined':
      bg = selected ? alpha(accent, 0.1) : 'transparent';
      border = alpha(accent, selected ? 0.7 : 0.45);
      fg = accent;
      hoverBg = alpha(accent, 0.08);
      break;
    case 'smooth':
      // Soft vertical colour fade — the signature "smooth" look.
      bg = `linear-gradient(180deg, ${alpha(accent, selected ? 0.2 : 0.08)}, ${alpha(accent, selected ? 0.32 : 0.16)})`;
      border = alpha(accent, 0.4);
      fg = accent;
      hoverBg = `linear-gradient(180deg, ${alpha(accent, 0.16)}, ${alpha(accent, 0.26)})`;
      break;
    case 'plain':
      // Same tint fill as `soft`, but borderless.
      bg = alpha(accent, selected ? 0.22 : 0.12);
      border = 'transparent';
      fg = accent;
      hoverBg = alpha(accent, 0.2);
      break;
    case 'soft':
    default:
      bg = alpha(accent, selected ? 0.22 : 0.12);
      border = alpha(accent, selected ? 0.32 : 0.18);
      fg = accent;
      hoverBg = alpha(accent, 0.2);
      break;
  }

  const IconEl = icon
    ? isIconComponent(icon)
      ? React.createElement(icon as SvgIconComponent, { sx: { fontSize: s.icon } })
      : icon
    : null;

  return (
    <Box
      component="span"
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        height: s.height,
        px: s.px,
        maxWidth: '100%',
        borderRadius: variant === 'smooth' ? 999 : s.radius,
        background: bg,
        border: '1px solid',
        borderColor: border,
        color: fg,
        fontSize: s.font,
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        verticalAlign: 'middle',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        transition: 'background .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease',
        ...(clickable && {
          cursor: 'pointer',
          '&:hover': { background: hoverBg, transform: 'translateY(-1px)' },
          '&:focus-visible': { outline: `2px solid ${alpha(accent, 0.6)}`, outlineOffset: 2 },
        }),
      }}
    >
      {IconEl && (
        <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0, ml: -0.125 }}>
          {IconEl}
        </Box>
      )}
      <Box
        component="span"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}
      >
        {label}
      </Box>
      {onDelete && !disabled && (
        <Box
          component="span"
          role="button"
          aria-label="Remove"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }
          }}
          sx={{
            display: 'inline-flex',
            flexShrink: 0,
            ml: 0.125,
            mr: -0.375,
            borderRadius: '50%',
            cursor: 'pointer',
            color: 'inherit',
            opacity: 0.7,
            transition: 'opacity .15s ease, background .15s ease',
            '&:hover': {
              opacity: 1,
              background: variant === 'solid' ? alpha(contrast, 0.22) : alpha(accent, 0.18),
            },
          }}
        >
          <CloseIcon sx={{ fontSize: s.icon - 1 }} />
        </Box>
      )}
    </Box>
  );
}
