'use client';

import * as React from 'react';
import {
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
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SchoolIcon from '@mui/icons-material/School';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PageHeader from '@/components/common/PageHeader';
import StatTile from '@/components/common/StatTile';
import { ACCENT } from '@/theme/accents';

interface Semester {
  id: string;
  label: string;
  /** ISO start/end used for display and chronological status. */
  start: string;
  end: string;
}

interface AcademicYear {
  year: string;
  semesters: Semester[];
}

/** Demo terms (Thai B.E. years). Replace with data from the backend. */
const YEARS: AcademicYear[] = [
  {
    year: '2569',
    semesters: [
      { id: '2569-1', label: 'Semester 1', start: '2026-06-01', end: '2026-10-31' },
      { id: '2569-2', label: 'Semester 2', start: '2026-11-01', end: '2027-03-31' },
    ],
  },
  {
    year: '2568',
    semesters: [
      { id: '2568-1', label: 'Semester 1', start: '2025-06-01', end: '2025-10-31' },
      { id: '2568-2', label: 'Semester 2', start: '2025-11-01', end: '2026-03-31' },
      { id: '2568-S', label: 'Summer', start: '2026-04-01', end: '2026-05-31' },
    ],
  },
  {
    year: '2567',
    semesters: [
      { id: '2567-1', label: 'Semester 1', start: '2024-06-01', end: '2024-10-31' },
      { id: '2567-2', label: 'Semester 2', start: '2024-11-01', end: '2025-03-31' },
    ],
  },
];

const ALL_SEMESTERS = YEARS.flatMap((y) => y.semesters);
const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AcademicTermPage() {
  // The currently active term. Only one can be active at a time.
  const [activeId, setActiveId] = React.useState('2569-1');

  const active = ALL_SEMESTERS.find((s) => s.id === activeId);
  const activeYear = YEARS.find((y) => y.semesters.some((s) => s.id === activeId))?.year;

  // Status is derived from the active term's start date: earlier terms are
  // closed, later ones are upcoming, so the whole timeline stays consistent.
  const statusOf = (semester: Semester): 'Active' | 'Closed' | 'Upcoming' => {
    if (semester.id === activeId) return 'Active';
    if (!active) return 'Upcoming';
    return semester.start < active.start ? 'Closed' : 'Upcoming';
  };

  const summary = {
    years: YEARS.length,
    semesters: ALL_SEMESTERS.length,
    activeTerm: activeYear && active ? `${activeYear} / ${active.label.replace('Semester ', '')}` : '—',
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Academic Year / Semester"
        description="Define academic years and set the active evaluation term."
        actions={
          <Button variant="contained" startIcon={<CalendarMonthIcon />}>
            Add academic year
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatTile label="Academic Years" value={summary.years} icon={SchoolIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatTile label="Total Semesters" value={summary.semesters} icon={DateRangeIcon} color={ACCENT.blue} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatTile label="Active Term" value={summary.activeTerm} icon={EventAvailableIcon} color={ACCENT.green} hint="Used for new evaluations" />
        </Grid>
      </Grid>

      <Stack spacing={2}>
        {YEARS.map((y) => {
          const hasActive = y.semesters.some((s) => s.id === activeId);
          return (
            <Card key={y.year}>
              <CardContent>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', mb: 1.5 }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Academic Year {y.year}
                  </Typography>
                  {hasActive && <Chip size="small" color="success" label="Current" />}
                  <Box sx={{ flexGrow: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    {y.semesters.length} semesters
                  </Typography>
                </Stack>
                <Divider />
                <Stack divider={<Divider flexItem />}>
                  {y.semesters.map((s) => {
                    const status = statusOf(s);
                    const isActive = status === 'Active';
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
                          borderLeftColor: isActive ? 'success.main' : 'transparent',
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
                        <Chip
                          size="small"
                          label={status}
                          color={status === 'Active' ? 'success' : status === 'Upcoming' ? 'info' : 'default'}
                          variant={status === 'Closed' ? 'outlined' : 'filled'}
                        />
                        <Button
                          size="small"
                          variant={isActive ? 'contained' : 'outlined'}
                          color={isActive ? 'success' : 'inherit'}
                          startIcon={isActive ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                          onClick={() => setActiveId(s.id)}
                          disabled={isActive}
                          sx={{ minWidth: 130 }}
                        >
                          {isActive ? 'Active' : 'Set active'}
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
