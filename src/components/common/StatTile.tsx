'use client';

import type { ReactNode } from 'react';
import type { SvgIconComponent } from '@mui/icons-material';
import { Avatar, Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

export interface StatTileProps {
  label: string;
  value: ReactNode;
  icon: SvgIconComponent;
  /** Accent colour for the icon badge — use a value from `@/theme/accents`. */
  color: string;
  /** Optional caption under the value (e.g. "+5 this week"). */
  hint?: string;
}

/**
 * A compact KPI card: label, a large value, and a rounded, tinted icon badge.
 * Reused across the dashboards and list pages for a consistent summary row.
 */
export default function StatTile({ label, value, icon: Icon, color, hint }: StatTileProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" noWrap>
              {label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, lineHeight: 1.2 }}>
              {value}
            </Typography>
            {hint && (
              <Typography variant="caption" color="text.secondary">
                {hint}
              </Typography>
            )}
          </Box>
          <Avatar
            variant="rounded"
            sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: alpha(color, 0.12), color }}
          >
            <Icon fontSize="small" />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
