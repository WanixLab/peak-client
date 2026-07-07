'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAppDispatch } from '@/redux/hooks';
import { loginSuccess, type User } from '@/redux/slices/authSlice';
import { saveSession } from '@/lib/authStorage';
import { appConfig } from '@/config';

const registerSchema = z
  .object({
    name: z.string().min(1, 'Please enter your name'),
    email: z.string().min(1, 'Please enter your email').email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

/** Build a demo session for the newly registered user. Replace with a real API call. */
function createRegistrationSession(name: string, email: string): { token: string; user: User } {
  return {
    token: `demo-token-${Date.now()}`,
    user: { id: '1', name, username: email, role: 'user' },
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = (data: RegisterForm) => {
    // Demo registration — replace with a real API call.
    const session = createRegistrationSession(data.name, data.email);
    saveSession(session);
    dispatch(loginSuccess(session));
    router.replace(appConfig.routes.afterLogin);
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
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Get started with {appConfig.name}
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Full name"
              fullWidth
              autoFocus
              autoComplete="name"
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register('name')}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              autoComplete="email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register('email')}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              autoComplete="new-password"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              {...register('password')}
            />
            <TextField
              label="Confirm password"
              type="password"
              fullWidth
              autoComplete="new-password"
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting}>
              Create account
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          Already have an account?{' '}
          <MuiLink component={Link} href="/login" underline="hover" sx={{ fontWeight: 600 }}>
            Sign in
          </MuiLink>
        </Typography>
      </CardContent>
    </Card>
  );
}
