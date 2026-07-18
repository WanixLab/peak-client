'use client';

import * as React from 'react';
import { Box, Card, CardContent, Divider, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SchoolIcon from '@mui/icons-material/School';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import Button from '@/components/common/Button';
import Chip from '@/components/common/Chip';
import { ACCENT } from '@/theme/accents';
import { softCard } from '@/theme/surfaces';
import { ACADEMIC_YEARS, ACTIVE_SEMESTER_ID, ALL_SEMESTERS, yearOfSemester, type Semester } from '@/data/academicData';

const dateFmt = new Intl.DateTimeFormat('th-TH-u-ca-gregory', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AcademicTermPage() {
  // เทอมที่ใช้งานอยู่ — เลือกได้ทีละหนึ่งเทอม เป็นแค่แท็กเบา ๆ บอกว่าคะแนนเป็นของรอบเรียนไหน
  const [activeId, setActiveId] = React.useState(ACTIVE_SEMESTER_ID);

  const active = ALL_SEMESTERS.find((s) => s.id === activeId);
  const activeYear = yearOfSemester(activeId);

  // สถานะอิงจากวันเริ่มของเทอมที่ใช้งานอยู่ — เทอมก่อนหน้าปิดแล้ว เทอมหลังจากนั้นยังไม่ถึง
  const statusOf = (semester: Semester): 'active' | 'closed' | 'upcoming' => {
    if (semester.id === activeId) return 'active';
    if (!active) return 'upcoming';
    return semester.start < active.start ? 'closed' : 'upcoming';
  };
  const STATUS_META = {
    active: { label: 'กำลังใช้งาน', color: ACCENT.green },
    closed: { label: 'ปิดแล้ว', color: ACCENT.violet },
    upcoming: { label: 'กำลังจะถึง', color: ACCENT.blue },
  } as const;

  const summary = {
    years: ACADEMIC_YEARS.length,
    semesters: ALL_SEMESTERS.length,
    activeTerm: activeYear && active ? `${activeYear} / ${active.label.replace('ภาคเรียนที่ ', '')}` : '—',
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="ปีการศึกษา / ภาคเรียน"
        description="กำหนดปีการศึกษาและตั้งภาคเรียนที่ใช้งานอยู่ — ใช้เป็นแท็กบอกว่าคะแนนเป็นของรอบเรียนไหน ไม่ผูกกับข้อมูลอื่นลึก"
        actions={
          <Button variant="solid" startIcon={CalendarMonthIcon}>
            เพิ่มปีการศึกษา
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard label="ปีการศึกษาทั้งหมด" value={summary.years} icon={SchoolIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard label="ภาคเรียนทั้งหมด" value={summary.semesters} icon={DateRangeIcon} color={ACCENT.blue} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard label="เทอมที่ใช้งานอยู่" value={summary.activeTerm} icon={EventAvailableIcon} color={ACCENT.green} caption="ใช้กับการประเมินที่สร้างใหม่" />
        </Grid>
      </Grid>

      <Stack spacing={2}>
        {ACADEMIC_YEARS.map((y) => {
          const hasActive = y.semesters.some((s) => s.id === activeId);
          return (
            <Card key={y.year} sx={softCard}>
              <CardContent>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    ปีการศึกษา {y.year}
                  </Typography>
                  {hasActive && <Chip size="sm" variant="solid" color={ACCENT.green} label="ปีปัจจุบัน" />}
                  <Box sx={{ flexGrow: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    {y.semesters.length} ภาคเรียน
                  </Typography>
                </Stack>
                <Divider />
                <Stack divider={<Divider flexItem />}>
                  {y.semesters.map((s) => {
                    const status = statusOf(s);
                    const isActive = status === 'active';
                    const meta = STATUS_META[status];
                    return (
                      <Stack
                        key={s.id}
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        sx={{
                          alignItems: { sm: 'center' },
                          py: 1.5,
                          px: 1.5,
                          mx: -1.5,
                          borderRadius: 2,
                          borderLeft: '3px solid',
                          borderLeftColor: isActive ? ACCENT.green : 'transparent',
                          bgcolor: isActive ? (t) => alpha(t.palette.success.main, 0.08) : 'transparent',
                        }}
                      >
                        <Box sx={{ minWidth: 140 }}>
                          <Typography sx={{ fontWeight: 600 }}>{s.label}</Typography>
                        </Box>
                        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexGrow: 1 }}>
                          <DateRangeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {dateFmt.format(new Date(s.start))} – {dateFmt.format(new Date(s.end))}
                          </Typography>
                        </Stack>
                        <Chip size="sm" variant={status === 'closed' ? 'outlined' : 'soft'} color={meta.color} label={meta.label} />
                        <Button
                          size="sm"
                          variant={isActive ? 'solid' : 'outlined'}
                          color={isActive ? ACCENT.green : ACCENT.violet}
                          startIcon={isActive ? CheckCircleIcon : RadioButtonUncheckedIcon}
                          onClick={() => setActiveId(s.id)}
                          disabled={isActive}
                          style={{ minWidth: 130 }}
                        >
                          {isActive ? 'ใช้งานอยู่' : 'ตั้งเป็นเทอมนี้'}
                        </Button>
                      </Stack>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
}
