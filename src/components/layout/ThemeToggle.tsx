'use client';

import { IconButton, Tooltip } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

/**
 * Toggles between light and dark color schemes via MUI's CSS-variables engine.
 */
export default function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();

  // `mode` is undefined during SSR and on the first client render (matching,
  // so no hydration mismatch), then resolves once mounted.
  const resolved = mode === 'system' ? systemMode : mode;
  const isDark = resolved === 'dark';

  // Until the scheme is known, render a disabled placeholder.
  if (!mode) {
    return (
      <IconButton color="inherit" aria-label="toggle theme" disabled>
        <DarkModeIcon />
      </IconButton>
    );
  }

  return (
    <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
      <IconButton
        color="inherit"
        aria-label="toggle theme"
        onClick={() => setMode(isDark ? 'light' : 'dark')}
      >
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
