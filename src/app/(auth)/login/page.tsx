'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginStart, loginSuccess, loginFailure, type User } from '@/redux/slices/authSlice';
import { saveSession } from '@/lib/authStorage';
import { appConfig } from '@/config';

const loginSchema = z.object({
  email: z.string().min(1, 'Please enter your email').email('Enter a valid email address'),
  password: z.string().min(1, 'Please enter your password'),
  remember: z.boolean(),
});

type LoginForm = z.infer<typeof loginSchema>;

/** The 4-colour Google "G" logo. */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden focusable="false">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.5 29.3 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c11 0 19.5-8 19.5-19.5 0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.5 29.3 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39 16.2 43.5 24 43.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

/** Build a demo session. Replace with a real API response in production. */
function createDemoSession(email: string, name = 'Administrator'): { token: string; user: User } {
  return {
    token: `demo-token-${Date.now()}`,
    user: { id: '1', name, username: email, role: 'admin' },
  };
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { hydrated, isAuthenticated, error, status } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  });

  // If already logged in, skip the login screen.
  React.useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace(appConfig.routes.afterLogin);
    }
  }, [hydrated, isAuthenticated, router]);

  /** Persist (only when "remember me") + set the session and go home. */
  const completeLogin = (session: { token: string; user: User }, remember: boolean) => {
    if (remember) saveSession(session);
    dispatch(loginSuccess(session));
    router.replace(appConfig.routes.afterLogin);
  };

  const onSubmit = (data: LoginForm) => {
    dispatch(loginStart());

    // Demo auth — replace with a real API call.
    const { demo } = appConfig.auth;
    if (data.email === demo.username && data.password === demo.password) {
      completeLogin(createDemoSession(data.email), data.remember);
    } else {
      dispatch(loginFailure('Invalid email or password'));
    }
  };

  // Placeholder for real OAuth — signs in the demo user for now.
  const handleGoogleLogin = () => {
    dispatch(loginStart());
    completeLogin(createDemoSession('demo.user@gmail.com', 'Google User'), true);
  };

  return (
    <Card
      variant="elevation"
      sx={{
        width: '100%',
        maxWidth: 440,
        borderRadius: 3,
        boxShadow: '0 24px 60px -12px rgba(2, 8, 40, 0.45)',
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={1} sx={{ mb: 3, textAlign: 'center', alignItems: 'center' }}>
          <Box
            component="img"
            src="/PEAK-icon.png"
            alt={appConfig.name}
            sx={{ width: 64, height: 64, mb: 1 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your {appConfig.name} account
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Email"
              type="email"
              fullWidth
              autoFocus
              autoComplete="email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register('email')}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              autoComplete="current-password"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              {...register('password')}
            />

            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <FormControlLabel
                control={<Checkbox defaultChecked size="small" {...register('remember')} />}
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <MuiLink href="#" variant="body2" underline="hover">
                Forgot password?
              </MuiLink>
            </Stack>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={status === 'loading'}
            >
              Sign in
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              Demo: {appConfig.auth.demo.username} / {appConfig.auth.demo.password}
            </Typography>

            <Divider sx={{ my: 2.5, color: 'text.secondary', fontSize: 13 }}>OR</Divider>

            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={status === 'loading'}
              sx={{ color: 'text.primary', borderColor: 'divider' }}
            >
              Continue with Google
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <MuiLink component={Link} href="/register" underline="hover" sx={{ fontWeight: 600 }}>
            Sign up
          </MuiLink>
        </Typography>
      </CardContent>
    </Card>
  );
}
