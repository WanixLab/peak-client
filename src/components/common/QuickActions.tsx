'use client';

import * as React from 'react';
import Link from 'next/link';
import type { SvgIconComponent } from '@mui/icons-material';
import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import type { GridSize } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: SvgIconComponent;
  /** Accent colour — use a value from `@/theme/accents`. Defaults to theme primary. */
  color?: string;
  /** Navigates here when clicked (rendered as a Next.js link). */
  href?: string;
  /** Click handler — use instead of, or alongside, `href`. */
  onClick?: () => void;
}

export interface QuickActionsProps {
  actions: QuickActionItem[];
  /** Section heading. Pass `null` to render the grid with no header. */
  title?: React.ReactNode;
  /** Muted text on the right of the header. */
  caption?: React.ReactNode;
  /** Responsive columns per row. Defaults to 1 (xs) / 2 (sm+). */
  columns?: { xs?: number; sm?: number; md?: number; lg?: number };
}

const COLS_TO_SIZE = (n: number): GridSize => Math.max(1, Math.round(12 / n)) as GridSize;

/** Layered shadows shared with {@link KpiCard} so the two surfaces match. */
const SHADOW = {
  base: '0 1px 3px rgba(15,23,42,0.06), 0 8px 24px -6px rgba(15,23,42,0.12)',
  hover: '0 14px 32px -8px rgba(15,23,42,0.20)',
  baseDark: '0 1px 3px rgba(0,0,0,0.5), 0 10px 26px -6px rgba(0,0,0,0.65)',
  hoverDark: '0 16px 36px -8px rgba(0,0,0,0.8)',
};

/** A single action card — mirrors the {@link KpiCard} surface (borderless, one
 *  soft layered shadow, generous radius) with a hover lift. */
function ActionCard({ action }: { action: QuickActionItem }) {
  const theme = useTheme();
  const accent = action.color ?? theme.palette.primary.main;
  const Icon = action.icon;
  const interactive = Boolean(action.href || action.onClick);

  const linkProps = action.href
    ? { component: Link, href: action.href }
    : action.onClick
      ? {
          component: 'button' as const,
          type: 'button' as const,
          onClick: action.onClick,
        }
      : {};

  return (
    <Card
      {...linkProps}
      sx={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        font: 'inherit',
        cursor: interactive ? 'pointer' : 'default',
        textDecoration: 'none',
        height: '100%',
        p: 2.25,
        borderRadius: 2,
        border: 'none',
        transition: 'box-shadow .2s ease, transform .2s ease',
        boxShadow: SHADOW.base,
        ...theme.applyStyles('dark', { boxShadow: SHADOW.baseDark }),
        ...(interactive && {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: SHADOW.hover,
            ...theme.applyStyles('dark', { boxShadow: SHADOW.hoverDark }),
          },
          '&:hover .qa-arrow': { transform: 'translateX(2px)', color: accent },
          '&:focus-visible': { outline: `2px solid ${accent}`, outlineOffset: 2 },
        }),
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.75,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(accent, 0.1),
            color: accent,
          }}
        >
          <Icon sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>
            {action.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {action.description}
          </Typography>
        </Box>
        <ArrowForwardIcon
          className="qa-arrow"
          fontSize="small"
          sx={{ color: 'text.secondary', flexShrink: 0, transition: 'transform .2s ease, color .2s ease' }}
        />
      </Stack>
    </Card>
  );
}

/**
 * A grid of quick-action shortcut cards for the home page (and anywhere a set of
 * "jump to…" links makes sense). Each card carries a tinted icon badge, a
 * title/description and a trailing arrow, on the same calm surface as
 * {@link SummaryCard} — hairline border, one soft layered shadow, a hover lift —
 * so the two read as one family. Data-driven: pass an `actions` array where each
 * item links via `href` or fires an `onClick`.
 */
export default function QuickActions({
  actions,
  title = 'Quick actions',
  caption,
  columns,
}: QuickActionsProps) {
  const size = {
    xs: COLS_TO_SIZE(columns?.xs ?? 1),
    sm: COLS_TO_SIZE(columns?.sm ?? 2),
    ...(columns?.md ? { md: COLS_TO_SIZE(columns.md) } : {}),
    ...(columns?.lg ? { lg: COLS_TO_SIZE(columns.lg) } : {}),
  };

  return (
    <Stack spacing={1.5}>
      {(title || caption) && (
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}
        >
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
          )}
          {caption && (
            <Typography variant="caption" color="text.secondary">
              {caption}
            </Typography>
          )}
        </Stack>
      )}
      <Grid container spacing={2}>
        {actions.map((action) => (
          <Grid key={action.id} size={size}>
            <ActionCard action={action} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
