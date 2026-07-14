'use client';

import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

/**
 * Standard page header: a title, an optional description, and an optional
 * cluster of action controls pinned to the right (buttons stack below the text
 * on narrow screens). Shared by the feature pages so headings stay consistent.
 */
export default function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
