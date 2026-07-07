'use client';

import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useAppSelector } from '@/redux/hooks';
import { appConfig } from '@/config';

const stats = [
  { label: 'Total Users', value: '1,204' },
  { label: 'Documents', value: '328' },
  { label: 'Pending Tasks', value: '17' },
  { label: 'Notifications', value: '4' },
];

export default function HomePage() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Welcome back, {user?.name ?? 'User'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is the home page of {appConfig.name}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            Getting started
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Edit the menu in <code>src/config/menu.config.json</code>, tweak the theme in{' '}
            <code>src/app/theme/theme.ts</code>, and configure the app in{' '}
            <code>src/config/app.config.json</code>.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
