'use client';

import { Box } from '@mui/material';

/**
 * Shared shell for the public auth screens (login, register).
 *
 * Renders an animated "mesh gradient" background: a deep base gradient with
 * several soft, slowly-drifting colour orbs and a subtle dot grid that fades
 * out toward the edges. The page's card is centered on top.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        background: `
          radial-gradient(1100px 700px at 12% 8%, rgba(37, 99, 235, 0.55), transparent 60%),
          radial-gradient(900px 700px at 88% 12%, rgba(124, 58, 237, 0.50), transparent 58%),
          radial-gradient(1000px 900px at 50% 110%, rgba(6, 182, 212, 0.45), transparent 55%),
          linear-gradient(160deg, #070b1c 0%, #0a1230 55%, #070b1c 100%)
        `,
        '@keyframes authFloatA': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(40px, -30px) scale(1.08)' },
        },
        '@keyframes authFloatB': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-35px, 25px) scale(1.12)' },
        },
        '@keyframes authFloatC': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(28px, 34px)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '& .auth-orb': { animation: 'none' },
        },
      }}
    >
      {/* Drifting colour orbs for depth and motion. */}
      <Box
        className="auth-orb"
        aria-hidden
        sx={{
          position: 'absolute',
          top: '-12%',
          left: '-8%',
          width: 440,
          height: 440,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 30% 30%, rgba(96, 165, 250, 0.9), rgba(37, 99, 235, 0.15) 60%, transparent 72%)',
          filter: 'blur(70px)',
          willChange: 'transform',
          animation: 'authFloatA 16s ease-in-out infinite',
        }}
      />
      <Box
        className="auth-orb"
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: '-14%',
          right: '-6%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 60% 40%, rgba(167, 139, 250, 0.85), rgba(124, 58, 237, 0.15) 60%, transparent 72%)',
          filter: 'blur(80px)',
          willChange: 'transform',
          animation: 'authFloatB 22s ease-in-out infinite',
        }}
      />
      <Box
        className="auth-orb"
        aria-hidden
        sx={{
          position: 'absolute',
          top: '38%',
          left: '52%',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.7), rgba(6, 182, 212, 0.12) 60%, transparent 72%)',
          filter: 'blur(75px)',
          willChange: 'transform',
          animation: 'authFloatC 19s ease-in-out infinite',
        }}
      />

      {/* Fine dot grid, faded toward the edges with a radial mask. */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.14) 1px, transparent 1.4px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at center, black 28%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 28%, transparent 78%)',
          opacity: 0.5,
        }}
      />

      {/* Soft highlight behind the card so it lifts off the background. */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(620px 420px at 50% 42%, rgba(255, 255, 255, 0.07), transparent 70%)',
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
