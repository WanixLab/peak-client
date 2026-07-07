'use client';

import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

/**
 * Simple, reusable page scaffold used by the example submenu pages: a title,
 * an optional description, and a card hinting where to edit. Swap the card body
 * for real content when building out a screen.
 */
export default function PagePlaceholder({
  title,
  description,
  icon: Icon,
  file,
}: {
  title: string;
  description?: string;
  icon?: SvgIconComponent;
  file?: string;
}) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>

      <Card>
        <CardContent>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            {Icon && <Icon color="primary" />}
            <Typography variant="body2" color="text.secondary">
              Example submenu page{file ? <> — edit it at <code>{file}</code></> : null}.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
