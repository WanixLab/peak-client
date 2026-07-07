import { createTheme } from '@mui/material/styles';

/** Brand colors used across both color schemes. */
const PRIMARY = '#6D28D9';
const SECONDARY = '#7c3aed';

/**
 * System theme configuration.
 *
 * Uses MUI's CSS-variables engine with light/dark color schemes so the
 * app can switch modes without a flash and without re-rendering the tree.
 * `colorSchemeSelector: 'class'` means the active scheme is toggled via a
 * class on <html> (set by `InitColorSchemeScript` + `useColorScheme`).
 *
 * Adjust brand colors, radius and typography here to reskin the whole app.
 */
export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: PRIMARY, contrastText: '#ffffff' },
        background: { default: '#f8fafc', paper: '#ffffff' },
        divider: 'rgba(15, 23, 42, 0.08)',
        text: { primary: '#0f172a', secondary: '#64748b' },
      },
    },
    dark: {
      palette: {
        primary: { main: PRIMARY, contrastText: '#ffffff' },
        background: { default: '#0b0f1a', paper: '#111827' },
        divider: 'rgba(148, 163, 184, 0.14)',
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    // Nunito covers Latin; Thai characters (which Nunito lacks) fall through to
    // "Google Sans" — self-host it via `public/fonts` (see globals.css) or it
    // resolves if installed on the device — then to system Thai fallbacks.
    fontFamily: [
      'var(--font-nunito)',
      '"Google Sans"',
      '"Google Sans Thai"',
      '"Noto Sans Thai"',
      '"Leelawadee UI"',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(', '),
    button: { textTransform: 'none', fontWeight: 600 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiAppBar: {
      defaultProps: { color: 'default', elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.vars.palette.background.paper,
          backgroundImage: 'none',
        }),
      },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});
