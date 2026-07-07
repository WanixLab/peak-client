'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * Application shell: full-height sidebar + a content column with its own
 * sticky header on top. The sidebar is a permanent drawer on desktop (with the
 * brand pinned to its top), so the content column — header included — flows
 * beside it and reflows automatically as the rail expands/collapses.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header />
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
