'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import type { SvgIconComponent } from '@mui/icons-material';
import { Box, Card, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export type KpiVariant = 'large' | 'compact';
export type KpiIconStyle = 'soft' | 'solid';

export interface KpiDelta {
  /** Signed change vs the previous period, e.g. 12 or -1.4. */
  value: number;
  /** Text after the delta, e.g. "From last month". */
  period?: string;
  /** Force a direction; otherwise inferred from the sign. */
  direction?: 'up' | 'down';
  /** Set true when a downward change is good (e.g. fewer overdue). */
  invertColor?: boolean;
}

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  icon: SvgIconComponent;
  /** Accent colour — use a value from `@/theme/accents`. Defaults to theme primary. */
  color?: string;
  /** `large` (hero figure, optional sparkline) or `compact` (dense row). */
  variant?: KpiVariant;
  /** Change vs the previous period. */
  delta?: KpiDelta;
  /** Muted subtitle under the value (large variant), e.g. "Higher than yesterday". */
  caption?: string;
  /** Mini area chart data — `large` variant only. */
  sparkline?: number[];
  /** Icon badge fill. Defaults to a soft tint. */
  iconStyle?: KpiIconStyle;
  /** Trailing slot pinned top-right (e.g. a menu button). */
  action?: ReactNode;
  onClick?: () => void;
}

/** Soft, self-contained SVG area sparkline. */
function Sparkline({
  data,
  color,
  width = 76,
  height = 34,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const gid = React.useId();
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, height - 2 - ((v - min) / span) * (height - 6)] as const);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${width} ${height} L0 ${height} Z`;

  return (
    <Box component="svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} sx={{ display: 'block', overflow: 'visible' }} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Box>
  );
}

/** Coloured delta with a trend arrow and optional period text. */
function DeltaLine({ delta, size = 'md' }: { delta: KpiDelta; size?: 'sm' | 'md' }) {
  const theme = useTheme();
  const up = delta.direction ? delta.direction === 'up' : delta.value >= 0;
  const good = delta.invertColor ? !up : up;
  const color = good ? theme.palette.success.main : theme.palette.error.main;
  const Arrow = up ? TrendingUpIcon : TrendingDownIcon;
  const sign = delta.value > 0 ? '+' : '';

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
      <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center', color, flexShrink: 0 }}>
        <Arrow sx={{ fontSize: size === 'sm' ? 15 : 17 }} />
        <Typography variant={size === 'sm' ? 'caption' : 'body2'} sx={{ fontWeight: 700, lineHeight: 1 }}>
          {sign}
          {delta.value}%
        </Typography>
      </Stack>
      {delta.period && (
        <Typography variant="caption" color="text.secondary" noWrap>
          {delta.period}
        </Typography>
      )}
    </Stack>
  );
}

const SHADOW = {
  base: '0 1px 3px rgba(15,23,42,0.06), 0 8px 24px -6px rgba(15,23,42,0.12)',
  hover: '0 14px 32px -8px rgba(15,23,42,0.20)',
  baseDark: '0 1px 3px rgba(0,0,0,0.5), 0 10px 26px -6px rgba(0,0,0,0.65)',
  hoverDark: '0 16px 36px -8px rgba(0,0,0,0.8)',
};

/**
 * The shared KPI card for the whole app, in two layouts:
 *
 * - `large` — an icon+label header, a hero value with an inline change delta,
 *   a muted caption and an optional area sparkline (mirrors the marketing-style
 *   summary tiles).
 * - `compact` — a dense row with a leading tinted icon tile and a stacked
 *   label/value, for tight grids.
 *
 * Both are data-driven (pass `delta` for period-over-period change, `sparkline`
 * for a trend, `action` for a trailing control) and read consistently in light
 * and dark mode. Colour comes from the per-card `color` accent.
 */
export default function KpiCard({
  label,
  value,
  icon: Icon,
  color,
  variant = 'large',
  delta,
  caption,
  sparkline,
  iconStyle = 'soft',
  action,
  onClick,
}: KpiCardProps) {
  const theme = useTheme();
  const accent = color ?? theme.palette.primary.main;
  const interactive = Boolean(onClick);

  const badgeSx =
    iconStyle === 'solid'
      ? { bgcolor: accent, color: theme.palette.getContrastText(accent) }
      : { bgcolor: alpha(accent, 0.12), color: accent };

  const cardSx = {
    height: '100%',
    position: 'relative' as const,
    borderRadius: 2,
    border: 'none',
    transition: 'box-shadow .2s ease, transform .2s ease',
    boxShadow: SHADOW.base,
    ...theme.applyStyles('dark', { boxShadow: SHADOW.baseDark }),
    ...(interactive && {
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: SHADOW.hover,
        ...theme.applyStyles('dark', { boxShadow: SHADOW.hoverDark }),
      },
      '&:focus-visible': { outline: `2px solid ${accent}`, outlineOffset: 2 },
    }),
  };

  const keyHandler = interactive
    ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }
    : undefined;

  // --- Compact layout ---
  if (variant === 'compact') {
    return (
      <Card
        onClick={onClick}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={keyHandler}
        sx={{ ...cardSx, p: 1.75 }}
      >
        {action && <Box sx={{ position: 'absolute', top: 6, right: 6 }}>{action}</Box>}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.75,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              ...badgeSx,
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ fontWeight: 500 }}>
              {label}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
                {value}
              </Typography>
              {delta && <DeltaLine delta={delta} size="sm" />}
            </Stack>
          </Box>
        </Stack>
      </Card>
    );
  }

  // --- Large layout ---
  return (
    <Card
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={keyHandler}
      sx={{ ...cardSx, p: 2.5 }}
    >
      {action && <Box sx={{ position: 'absolute', top: 8, right: 8 }}>{action}</Box>}

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', pr: action ? 4 : 0 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            ...badgeSx,
          }}
        >
          <Icon sx={{ fontSize: 20 }} />
        </Box>
        <Typography variant="body2" color="text.secondary" noWrap sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'baseline', flexWrap: 'wrap', mt: 1.5 }}>
        <Typography sx={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </Typography>
        {delta && <DeltaLine delta={delta} />}
      </Stack>

      <Stack direction="row" sx={{ alignItems: 'flex-end', justifyContent: 'space-between', gap: 1, mt: 0.75 }}>
        <Typography variant="body2" color="text.secondary" noWrap sx={{ minWidth: 0 }}>
          {caption ?? ''}
        </Typography>
        {sparkline && sparkline.length > 1 && (
          <Box sx={{ flexShrink: 0 }}>
            <Sparkline data={sparkline} color={accent} />
          </Box>
        )}
      </Stack>
    </Card>
  );
}
