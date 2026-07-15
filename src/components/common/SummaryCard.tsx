'use client';

import type { ReactNode } from 'react';
import type { SvgIconComponent } from '@mui/icons-material';
import { Box, Card, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

/** Visual treatment of the whole card. */
export type SummaryCardVariant = 'soft' | 'plain' | 'filled' | 'accent';
/** How the leading icon badge is rendered. */
export type SummaryIconVariant = 'soft' | 'plain' | 'solid';
export type SummaryCardSize = 'sm' | 'md' | 'lg';

export interface SummaryTrend {
  /** Signed delta, e.g. 12 or -4. Sign drives the up/down arrow and colour. */
  value: number;
  /** Force a direction; otherwise inferred from the sign of `value`. */
  direction?: 'up' | 'down';
  /** Muted text shown after the delta, e.g. "vs last term". */
  label?: string;
  /** Set true when a downward delta is good (e.g. fewer overdue items). */
  invertColor?: boolean;
}

export interface SummaryCardProps {
  label: string;
  value: ReactNode;
  icon: SvgIconComponent;
  /** Accent colour — use a value from `@/theme/accents`. Defaults to theme primary. */
  color?: string;
  /** Small caption under the value (ignored if a `trend.label` is given). */
  hint?: string;
  /** Card treatment. */
  variant?: SummaryCardVariant;
  /** Icon badge treatment. Defaults to a value that matches `variant`. */
  iconVariant?: SummaryIconVariant;
  size?: SummaryCardSize;
  /** Optional trend delta shown under the value. */
  trend?: SummaryTrend;
  /** Optional thin progress bar (0–100) along the bottom. */
  progress?: number;
  /** Trailing slot, e.g. an icon button or menu. Pinned top-right. */
  action?: ReactNode;
  /** Makes the whole card interactive (subtle hover + pointer + keyboard). */
  onClick?: () => void;
  /** Extra content rendered under the value (chips, mini legend, …). */
  footer?: ReactNode;
}

const SIZES: Record<SummaryCardSize, { badge: number; icon: number; value: number; pad: number }> = {
  sm: { badge: 36, icon: 18, value: 24, pad: 2 },
  md: { badge: 40, icon: 20, value: 30, pad: 2.5 },
  lg: { badge: 48, icon: 24, value: 36, pad: 3 },
};

const DEFAULT_ICON_VARIANT: Record<SummaryCardVariant, SummaryIconVariant> = {
  soft: 'soft',
  plain: 'plain',
  filled: 'soft',
  accent: 'soft',
};

/**
 * The shared KPI / summary card for the whole app.
 *
 * A tinted icon badge and its label sit together on a header row; the value
 * then drops below as the hero figure, followed by an optional muted trend
 * line and progress bar. The surface is calm — hairline border, one soft
 * layered shadow, generous radius — with colour carried by the per-card
 * `color` accent. Four `variant`s and three `size`s cover the common
 * dashboard/list needs and stay consistent in light and dark mode. Prefer this
 * over ad-hoc stat markup; `StatTile` is a thin alias.
 */
export default function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  hint,
  variant = 'soft',
  iconVariant,
  size = 'md',
  trend,
  progress,
  action,
  onClick,
  footer,
}: SummaryCardProps) {
  const theme = useTheme();
  const accent = color ?? theme.palette.primary.main;
  const s = SIZES[size];
  const iconStyle = iconVariant ?? DEFAULT_ICON_VARIANT[variant];
  const interactive = Boolean(onClick);

  // --- Card surface per variant (kept subtle) ---
  const surfaceSx =
    variant === 'filled'
      ? { bgcolor: alpha(accent, 0.05), borderColor: alpha(accent, 0.16) }
      : variant === 'accent'
        ? { borderLeft: `3px solid ${accent}` }
        : null;

  // --- Icon badge per icon variant ---
  const badgeSx =
    iconStyle === 'plain'
      ? { bgcolor: 'transparent', color: accent }
      : iconStyle === 'solid'
        ? { bgcolor: accent, color: theme.palette.getContrastText(accent) }
        : { bgcolor: alpha(accent, 0.1), color: accent };

  // --- Trend delta ---
  const trendUp = trend ? (trend.direction ? trend.direction === 'up' : trend.value >= 0) : false;
  const trendGood = trend?.invertColor ? !trendUp : trendUp;
  const trendColor = trendGood ? theme.palette.success.main : theme.palette.error.main;
  const TrendArrow = trendUp ? ArrowUpwardIcon : ArrowDownwardIcon;
  const subLabel = trend?.label ?? hint;

  return (
    <Card
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      sx={{
        height: '100%',
        p: s.pad,
        position: 'relative',
        borderRadius: 2,
        borderColor: alpha(theme.palette.divider, 0.6),
        transition: 'box-shadow .2s ease, transform .2s ease, border-color .2s ease',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 6px 16px -8px rgba(15,23,42,0.14)',
        ...theme.applyStyles('dark', {
          boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 8px 20px -8px rgba(0,0,0,0.6)',
        }),
        ...surfaceSx,
        ...(interactive && {
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: alpha(accent, 0.4),
            boxShadow: '0 10px 28px -10px rgba(15,23,42,0.22)',
            ...theme.applyStyles('dark', {
              boxShadow: '0 12px 30px -10px rgba(0,0,0,0.75)',
            }),
          },
          '&:focus-visible': { outline: `2px solid ${accent}`, outlineOffset: 2 },
        }),
      }}
    >
      {action && <Box sx={{ position: 'absolute', top: 8, right: 8 }}>{action}</Box>}

      {/* Header: icon badge + label */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', pr: action ? 4 : 0 }}>
        <Box
          sx={{
            width: s.badge,
            height: s.badge,
            borderRadius: 1.5,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            ...badgeSx,
          }}
        >
          <Icon sx={{ fontSize: s.icon }} />
        </Box>
        <Typography variant="body2" color="text.secondary" noWrap sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      </Stack>

      {/* Hero value */}
      <Typography
        sx={{
          mt: 1.5,
          fontSize: s.value,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </Typography>

      {(trend || subLabel) && (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.75, minWidth: 0 }}>
          {trend && (
            <Stack direction="row" spacing={0.125} sx={{ alignItems: 'center', color: trendColor, flexShrink: 0 }}>
              <TrendArrow sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1 }}>
                {Math.abs(trend.value)}%
              </Typography>
            </Stack>
          )}
          {subLabel && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {subLabel}
            </Typography>
          )}
        </Stack>
      )}

      {footer && <Box sx={{ mt: 1.5 }}>{footer}</Box>}

      {typeof progress === 'number' && (
        <LinearProgress
          variant="determinate"
          value={Math.max(0, Math.min(100, progress))}
          sx={{
            mt: 2,
            height: 5,
            borderRadius: 5,
            bgcolor: alpha(accent, 0.12),
            '& .MuiLinearProgress-bar': { backgroundColor: accent, borderRadius: 5 },
          }}
        />
      )}
    </Card>
  );
}
