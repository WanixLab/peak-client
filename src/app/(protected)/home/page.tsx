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
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, useTheme, type SxProps, type Theme } from '@mui/material/styles';
import type { SvgIconComponent } from '@mui/icons-material';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import ScienceIcon from '@mui/icons-material/Science';
import { useAppSelector } from '@/redux/hooks';
import { appConfig } from '@/config';
import QuickActions from '@/components/common/QuickActions';
import KpiCard from '@/components/common/KpiCard';
import {
  getHomeContent,
  getRoleIcon,
  getRoleMeta,
  PREVIEW_ROLES,
  type HomeActivity,
  type HomeStat,
} from './homeContent';

const noop = () => () => {};

/** เงาแบบซ้อนชั้น ใช้ร่วมกับการ์ด KpiCard/QuickActions ให้พื้นผิวเข้ากัน */
const SHADOW = {
  base: '0 1px 3px rgba(15,23,42,0.06), 0 8px 24px -6px rgba(15,23,42,0.12)',
  baseDark: '0 1px 3px rgba(0,0,0,0.5), 0 10px 26px -6px rgba(0,0,0,0.65)',
};

/**
 * คำทักทายตามช่วงเวลา อ่านผ่าน `useSyncExternalStore` เพื่อให้ฝั่งเซิร์ฟเวอร์
 * เรนเดอร์ค่ากลาง ๆ เสมอ แล้วฝั่งไคลเอนต์ค่อยสลับเป็นคำทักทายตามเวลาท้องถิ่นหลัง
 * hydration — ไม่มี mismatch และไม่มีการ setState ใน effect
 */
function useGreeting() {
  return React.useSyncExternalStore(
    noop,
    () => {
      const hour = new Date().getHours();
      return hour < 12 ? 'สวัสดีตอนเช้า' : hour < 18 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';
    },
    () => 'ยินดีต้อนรับกลับมา',
  );
}

/** รวบรวมทุกบทบาทที่ผู้ใช้คนนี้สามารถดูหน้าแรกผ่านมุมมองนั้นได้ */
function useUserRoles(): string[] {
  const user = useAppSelector((state) => state.auth.user);
  return React.useMemo(() => {
    const list = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];
    // ตัดค่าซ้ำโดยคงลำดับไว้ (บทบาทหลักอยู่ต้นสุดเสมอ)
    return Array.from(new Set(list));
  }, [user]);
}

/**
 * เรนเดอร์ไอคอนของบทบาท โดยรับตัวคอมโพเนนต์ไอคอนผ่าน prop (ไม่ได้สร้างจากการ
 * เรียกฟังก์ชันภายใน render) เพื่อให้ผ่านกฎ lint ของ compiler
 */
function RoleGlyph({ icon: Icon, sx }: { icon: SvgIconComponent; sx?: SxProps<Theme> }) {
  return <Icon sx={sx} />;
}

/** ตราไอคอนแบบมุมมน มีพื้นหลังสีอ่อน ใช้ซ้ำในฟีดกิจกรรม */
function IconBadge({ icon: Icon, color, size = 36 }: { icon: HomeStat['icon']; color: string; size?: number }) {
  return (
    <Avatar
      variant="rounded"
      sx={{ width: size, height: size, bgcolor: alpha(color, 0.12), color, borderRadius: 2 }}
    >
      <Icon fontSize="small" />
    </Avatar>
  );
}

/** หนึ่งแถวในฟีดกิจกรรมล่าสุด */
function ActivityRow({ item }: { item: HomeActivity }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: 'flex-start',
        px: 1,
        py: 1.25,
        borderRadius: 2,
        transition: 'background-color .15s ease',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <IconBadge icon={item.icon} color={item.color} />
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {item.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {item.time}
        </Typography>
      </Box>
    </Stack>
  );
}

/**
 * ชิปสลับมุมมองในส่วนหัว จะแสดงเมื่อผู้ใช้มีมากกว่าหนึ่งบทบาท
 * การเลือกบทบาทจะเรนเดอร์แดชบอร์ดทั้งหน้าใหม่ผ่านมุมมองของบทบาทนั้น
 */
function RoleSwitcher({
  roles,
  active,
  onChange,
}: {
  roles: string[];
  active: string | undefined;
  onChange: (role: string) => void;
}) {
  return (
    <Box
      role="tablist"
      aria-label="สลับมุมมองบทบาท"
      sx={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: 0.5,
        p: 0.5,
        mb: 2,
        borderRadius: 999,
        bgcolor: 'rgba(255,255,255,0.16)',
      }}
    >
      {roles.map((role) => {
        const meta = getRoleMeta(role);
        const selected = role === active;
        return (
          <Box
            key={role}
            component="button"
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(role)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.75,
              border: 0,
              borderRadius: 999,
              cursor: 'pointer',
              font: 'inherit',
              fontSize: 13,
              fontWeight: 600,
              transition: 'background-color .2s ease, color .2s ease',
              color: selected ? meta.color : 'common.white',
              bgcolor: selected ? 'common.white' : 'transparent',
              '&:hover': { bgcolor: selected ? 'common.white' : 'rgba(255,255,255,0.14)' },
              '&:focus-visible': { outline: '2px solid rgba(255,255,255,0.9)', outlineOffset: 2 },
            }}
          >
            <RoleGlyph icon={getRoleIcon(role)} sx={{ fontSize: 16 }} />
            {meta.label}
          </Box>
        );
      })}
    </Box>
  );
}

/**
 * แถบทดลอง (สำหรับสาธิต) ให้กดดูมุมมองของทุกบทบาทได้ ไม่ว่าผู้ใช้ที่ล็อกอินอยู่
 * จะมีสิทธิ์บทบาทนั้นจริงหรือไม่ — สะดวกต่อการตรวจดูชุดข้อมูลของแต่ละบทบาท
 */
function RolePreviewBar({
  roles,
  active,
  onSelect,
}: {
  roles: readonly string[];
  active: string | undefined;
  onSelect: (role: string) => void;
}) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        p: 1.5,
        border: 'none',
        borderRadius: 2,
        boxShadow: SHADOW.base,
        ...theme.applyStyles('dark', { boxShadow: SHADOW.baseDark }),
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mr: 1 }}>
          <ScienceIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            ทดลองมุมมองตามบทบาท
          </Typography>
        </Stack>
        {roles.map((role) => {
          const meta = getRoleMeta(role);
          const selected = role === active;
          return (
            <Button
              key={role}
              size="small"
              disableElevation
              onClick={() => onSelect(role)}
              variant={selected ? 'contained' : 'outlined'}
              startIcon={<RoleGlyph icon={getRoleIcon(role)} sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: 999,
                textTransform: 'none',
                ...(selected
                  ? { bgcolor: meta.color, '&:hover': { bgcolor: meta.color } }
                  : { color: 'text.primary', borderColor: 'divider' }),
              }}
            >
              {meta.label}
            </Button>
          );
        })}
      </Stack>
    </Card>
  );
}

export default function HomePage() {
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);
  const greeting = useGreeting();
  const roles = useUserRoles();

  // มุมมองบทบาทที่กำลังแสดง เก็บ "ตัวที่ถูกเลือก" ไว้ใน state แล้วอนุมานบทบาทที่
  // ใช้งานระหว่าง render — ค่าเริ่มต้นคือบทบาทหลัก และเมื่อยังไม่เลือกก็ใช้บทบาทแรก
  // (การล็อกอินใหม่จะ remount หน้านี้ ทำให้ค่ารีเซ็ตเองโดยไม่ต้องใช้ effect)
  const [viewRole, setViewRole] = React.useState<string | null>(null);
  const activeRole = viewRole ?? roles[0];

  const multiRole = roles.length > 1;
  const content = getHomeContent(activeRole);
  const roleMeta = getRoleMeta(activeRole);
  const roleIcon = getRoleIcon(activeRole);

  return (
    <Stack spacing={3}>
      {/* ส่วนหัว: คำทักทายตามบทบาท, ตัวสลับมุมมอง, ข้อความบรรยาย และปุ่มหลัก */}
      <Card
        sx={{
          border: 0,
          color: 'common.white',
          overflow: 'hidden',
          position: 'relative',
          background: `linear-gradient(120deg, #5B21B6 0%, ${roleMeta.color} 58%, #7C3AED 100%)`,
        }}
      >
        {/* แสงตกแต่งนุ่ม ๆ ที่มุมขวาบน */}
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
              {multiRole ? (
                <RoleSwitcher roles={roles} active={activeRole} onChange={setViewRole} />
              ) : (
                <Chip
                  icon={<RoleGlyph icon={roleIcon} sx={{ color: 'inherit !important' }} />}
                  label={roleMeta.label}
                  size="small"
                  sx={{
                    color: 'common.white',
                    bgcolor: 'rgba(255,255,255,0.18)',
                    fontWeight: 600,
                    mb: 1.5,
                  }}
                />
              )}
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {greeting}, {user?.name ?? 'ผู้ใช้'}
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

            {/* สัญลักษณ์บทบาทขนาดใหญ่ (ซ่อนบนจอเล็ก) */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexShrink: 0, opacity: 0.95 }}>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'common.white',
                }}
              >
                <RoleGlyph icon={roleIcon} sx={{ fontSize: 48 }} />
              </Avatar>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* แถบทดลองมุมมองตามบทบาท (สำหรับสาธิต) */}
      <RolePreviewBar roles={PREVIEW_ROLES} active={activeRole} onSelect={setViewRole} />

      {/* แถว KPI — ตัวชี้วัดที่เกี่ยวข้องกับบทบาทที่กำลังแสดง */}
      <Box>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            ภาพรวม
          </Typography>
          <Typography variant="caption" color="text.secondary">
            มุมมอง{roleMeta.label}
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          {content.stats.map((stat) => (
            <Grid key={stat.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                delta={stat.delta}
                caption={stat.caption}
                variant="large"
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ทางลัด + กิจกรรมล่าสุด */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <QuickActions actions={content.actions} title="ทางลัด" />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={1.5} sx={{ height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              กิจกรรมล่าสุด
            </Typography>
            <Card
              sx={{
                flexGrow: 1,
                border: 'none',
                borderRadius: 2,
                boxShadow: SHADOW.base,
                ...theme.applyStyles('dark', { boxShadow: SHADOW.baseDark }),
              }}
            >
              <CardContent sx={{ p: 1 }}>
                <Stack spacing={0.25}>
                  {content.activity.map((item) => (
                    <ActivityRow key={item.id} item={item} />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Typography variant="caption" color="text.secondary">
        {multiRole
          ? `คุณมี ${roles.length} บทบาท — สลับมุมมองได้จากปุ่มในส่วนหัว `
          : ''}
        กำลังแสดงมุมมอง{roleMeta.label}ของ {appConfig.shortName} เนื้อหาจะปรับตามสิทธิ์ของผู้ใช้แต่ละคน
      </Typography>
    </Stack>
  );
}
