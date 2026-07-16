'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useAppSelector } from '@/redux/hooks';
import { appConfig } from '@/config';
import QuickActions from '@/components/common/QuickActions';
import {
  getHomeContent,
  getRoleMeta,
  type HomeActivity,
  type HomeStat,
  type Trend,
} from './homeContent';

const noop = () => () => {};

/**
 * Time-of-day greeting. Read via `useSyncExternalStore` so the server always
 * renders a neutral value and the client swaps in the local-time greeting after
 * hydration — no mismatch, and no setState-in-effect.
 */
function useGreeting() {
  return React.useSyncExternalStore(
    noop,
    () => {
      const hour = new Date().getHours();
      return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    },
    () => 'Welcome back',
  );
}

const trendIcon: Record<Trend, typeof TrendingUpIcon> = {
  up: TrendingUpIcon,
  down: TrendingDownIcon,
  flat: TrendingFlatIcon,
};
const trendColor: Record<Trend, string> = {
  up: 'success.main',
  down: 'warning.main',
  flat: 'text.secondary',
};

/** A rounded, tinted icon badge reused by every tile. */
function IconBadge({ icon: Icon, color, size = 44 }: { icon: HomeStat['icon']; color: string; size?: number }) {
  return (
    <Avatar
      variant="rounded"
      sx={{ width: size, height: size, bgcolor: alpha(color, 0.12), color, borderRadius: 2 }}
    >
      <Icon fontSize="small" />
    </Avatar>
  );
}

/** A KPI card: label, big value, tinted icon, and an optional trend caption. */
function StatCard({ stat }: { stat: HomeStat }) {
  const TrendIcon = stat.trend ? trendIcon[stat.trend] : null;
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" noWrap>
              {stat.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, lineHeight: 1.2 }}>
              {stat.value}
            </Typography>
          </Box>
          <IconBadge icon={stat.icon} color={stat.color} />
        </Stack>
        {stat.delta && (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 1.5 }}>
            {TrendIcon && stat.trend && (
              <TrendIcon fontSize="small" sx={{ color: trendColor[stat.trend] }} />
            )}
            <Typography variant="caption" sx={{ color: stat.trend ? trendColor[stat.trend] : 'text.secondary' }}>
              {stat.delta}
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

/** A single row in the recent-activity feed. */
function ActivityRow({ item, divider }: { item: HomeActivity; divider: boolean }) {
  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', py: 1.5 }}>
        <IconBadge icon={item.icon} color={item.color} size={36} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {item.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.time}
          </Typography>
        </Box>
      </Stack>
      {divider && <Divider />}
    </>
  );
}

export default function HomePage() {
  const user = useAppSelector((state) => state.auth.user);
  const greeting = useGreeting();

  const role = user?.role;
  const content = getHomeContent(role);
  const roleMeta = getRoleMeta(role);

  return (
    <Stack spacing={3}>
      {/* Hero: role-aware greeting, role chip, tagline and primary CTA. */}
      <Card
        sx={{
          border: 0,
          color: 'common.white',
          overflow: 'hidden',
          position: 'relative',
          background: `linear-gradient(120deg, #5B21B6 0%, ${roleMeta.color} 55%, #7C3AED 100%)`,
        }}
      >
        {/* Soft decorative glow in the top-right corner. */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: -80,
            right: -40,
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%)',
          }}
        />
        <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Chip
                icon={<VerifiedUserIcon sx={{ color: 'inherit !important' }} />}
                label={roleMeta.label}
                size="small"
                sx={{
                  color: 'common.white',
                  bgcolor: 'rgba(255,255,255,0.18)',
                  fontWeight: 600,
                  mb: 1.5,
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {greeting}, {user?.name ?? 'User'}
              </Typography>
              <Typography sx={{ mt: 1, maxWidth: 620, opacity: 0.9 }}>{content.tagline}</Typography>
              <Button
                component={Link}
                href={content.cta.href}
                variant="contained"
                endIcon={<ArrowOutwardIcon />}
                sx={{
                  mt: 2.5,
                  bgcolor: 'common.white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.88)' },
                }}
              >
                {content.cta.label}
              </Button>
            </Box>

            {/* Large watermark icon (hidden on small screens). */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexShrink: 0, opacity: 0.9 }}>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'common.white',
                }}
              >
                <VerifiedUserIcon sx={{ fontSize: 48 }} />
              </Avatar>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* KPI row — metrics relevant to the current role. */}
      <Grid container spacing={2}>
        {content.stats.map((stat) => (
          <Grid key={stat.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard stat={stat} />
          </Grid>
        ))}
      </Grid>

      {/* Quick actions + recent activity. */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <QuickActions actions={content.actions} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={1.5}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Recent activity
            </Typography>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ py: 0.5 }}>
                {content.activity.map((item, index) => (
                  <ActivityRow
                    key={item.id}
                    item={item}
                    divider={index < content.activity.length - 1}
                  />
                ))}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Typography variant="caption" color="text.secondary">
        Showing the {roleMeta.label} view of {appConfig.shortName}. Content adapts to each
        user&apos;s role.
      </Typography>
    </Stack>
  );
}
