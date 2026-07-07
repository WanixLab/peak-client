'use client';

import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

/**
 * Full-screen, centered error layout used by the 404 and 500 pages. Rendered
 * outside the app shell (no sidebar/header) — it only relies on the root
 * providers for MUI theming.
 */
export default function ErrorScreen({
  code,
  title,
  description,
  actions,
}: {
  code: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: 'background.default',
        textAlign: 'center',
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center', maxWidth: 480 }}>
        <Box
          component="img"
          src="/PEAK-icon.png"
          alt=""
          sx={{ width: 56, height: 56, mb: 1, maxWidth: 'none' }}
        />
        <Typography
          component="p"
          sx={{
            fontSize: { xs: 96, sm: 120 },
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: -3,
            backgroundImage: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #7c3aed 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {code}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
        {actions && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1, width: '100%', justifyContent: 'center' }}>
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
