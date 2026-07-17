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
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import GradeIcon from '@mui/icons-material/Grade';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ReplayIcon from '@mui/icons-material/Replay';
import PeopleIcon from '@mui/icons-material/People';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import DonutChart from '@/components/charts/DonutChart';
import BarChart, { type BarDatum } from '@/components/charts/BarChart';
import TrendLineChart, { type TrendPoint } from '@/components/charts/TrendLineChart';
import { ACCENT } from '@/theme/accents';

// --- Demo data --------------------------------------------------------------
// Placeholder figures — wire these to the reporting API when the backend is
// ready. Everything on the page derives from `DEPARTMENTS` + the active filter.

interface SubjectProgress {
  name: string;
  total: number;
  completed: number;
}

interface Department {
  id: string;
  name: string;
  faculty: string;
  total: number;
  completed: number;
  inProgress: number;
  avgScore: number;
  subjects: SubjectProgress[];
}

const FACULTIES = ['Engineering', 'Business', 'Science'];
const TERMS = ['2026 / Semester 1', '2025 / Semester 2', '2025 / Semester 1'];

const DEPARTMENTS: Department[] = [
  {
    id: 'ce', name: 'Computer Eng.', faculty: 'Engineering', total: 120, completed: 86, inProgress: 20, avgScore: 84.2,
    subjects: [
      { name: 'CS101 Intro to Programming', total: 40, completed: 34 },
      { name: 'CS205 Data Structures', total: 44, completed: 30 },
      { name: 'CS310 Database Systems', total: 36, completed: 22 },
    ],
  },
  {
    id: 'ee', name: 'Electrical Eng.', faculty: 'Engineering', total: 90, completed: 54, inProgress: 18, avgScore: 79.5,
    subjects: [
      { name: 'EE110 Circuits', total: 48, completed: 30 },
      { name: 'EE220 Signals', total: 42, completed: 24 },
    ],
  },
  {
    id: 'mk', name: 'Marketing', faculty: 'Business', total: 75, completed: 60, inProgress: 8, avgScore: 81.0,
    subjects: [
      { name: 'MK310 Marketing Research', total: 40, completed: 33 },
      { name: 'MK220 Consumer Behavior', total: 35, completed: 27 },
    ],
  },
  {
    id: 'ac', name: 'Accounting', faculty: 'Business', total: 80, completed: 40, inProgress: 22, avgScore: 77.8,
    subjects: [
      { name: 'AC220 Financial Accounting', total: 44, completed: 24 },
      { name: 'AC330 Managerial Accounting', total: 36, completed: 16 },
    ],
  },
  {
    id: 'ph', name: 'Physics', faculty: 'Science', total: 60, completed: 51, inProgress: 5, avgScore: 88.1,
    subjects: [
      { name: 'PH150 General Physics', total: 34, completed: 30 },
      { name: 'PH240 Modern Physics', total: 26, completed: 21 },
    ],
  },
  {
    id: 'ma', name: 'Mathematics', faculty: 'Science', total: 70, completed: 35, inProgress: 15, avgScore: 75.4,
    subjects: [
      { name: 'MA200 Calculus II', total: 40, completed: 20 },
      { name: 'MA310 Linear Algebra', total: 30, completed: 15 },
    ],
  },
];

/** Average-score trend across evaluation rounds, keyed by faculty (+ "all"). */
const TREND: Record<string, TrendPoint[]> = {
  all: [
    { label: 'R1', value: 74 }, { label: 'R2', value: 76 }, { label: 'R3', value: 78 },
    { label: 'R4', value: 79 }, { label: 'R5', value: 81 }, { label: 'R6', value: 82 },
  ],
  Engineering: [
    { label: 'R1', value: 72 }, { label: 'R2', value: 74 }, { label: 'R3', value: 77 },
    { label: 'R4', value: 78 }, { label: 'R5', value: 80 }, { label: 'R6', value: 82 },
  ],
  Business: [
    { label: 'R1', value: 75 }, { label: 'R2', value: 76 }, { label: 'R3', value: 77 },
    { label: 'R4', value: 78 }, { label: 'R5', value: 79 }, { label: 'R6', value: 80 },
  ],
  Science: [
    { label: 'R1', value: 80 }, { label: 'R2', value: 81 }, { label: 'R3', value: 83 },
    { label: 'R4', value: 84 }, { label: 'R5', value: 86 }, { label: 'R6', value: 87 },
  ],
};

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/** A coloured legend dot + label + value row used beside the donut. */
function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      <Typography variant="body2" sx={{ flexGrow: 1 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Stack>
  );
}

export default function DashboardPage() {
  const [faculty, setFaculty] = React.useState('all');
  const [term, setTerm] = React.useState(TERMS[0]);
  const [selectedDept, setSelectedDept] = React.useState<string | null>(null);
  // Bumped by the Refresh button to restamp the "last updated" time.
  const [refreshedAt, setRefreshedAt] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setRefreshedAt(new Date());
  }, []);

  // Departments in scope for the active faculty filter.
  const depts = React.useMemo(
    () => (faculty === 'all' ? DEPARTMENTS : DEPARTMENTS.filter((d) => d.faculty === faculty)),
    [faculty],
  );

  // Aggregate KPIs across the filtered departments.
  const agg = React.useMemo(() => {
    const total = depts.reduce((s, d) => s + d.total, 0);
    const completed = depts.reduce((s, d) => s + d.completed, 0);
    const inProgress = depts.reduce((s, d) => s + d.inProgress, 0);
    const notStarted = Math.max(0, total - completed - inProgress);
    const avgScore =
      total > 0 ? depts.reduce((s, d) => s + d.avgScore * d.total, 0) / total : 0;
    return { total, completed, inProgress, notStarted, avgScore, progress: pct(completed, total) };
  }, [depts]);

  const donutSegments = React.useMemo(
    () => [
      { label: 'Completed', value: agg.completed, color: ACCENT.green },
      { label: 'In Progress', value: agg.inProgress, color: ACCENT.blue },
      { label: 'Not Started', value: agg.notStarted, color: ACCENT.amber },
    ],
    [agg],
  );

  const bars = React.useMemo<BarDatum[]>(
    () =>
      depts.map((d) => ({
        id: d.id,
        label: d.name,
        value: pct(d.completed, d.total),
        color: ACCENT.violet,
        caption: `${d.completed}/${d.total} completed · avg ${d.avgScore.toFixed(1)}`,
      })),
    [depts],
  );

  const trend = TREND[faculty] ?? TREND.all;
  const selected = depts.find((d) => d.id === selectedDept) ?? null;

  // Keep the selection valid when the faculty filter changes.
  React.useEffect(() => {
    if (selectedDept && !depts.some((d) => d.id === selectedDept)) setSelectedDept(null);
  }, [depts, selectedDept]);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Dashboard"
        description="Overview of evaluation progress and results across the organization."
        actions={
          <>
            <Chip
              size="small"
              color="success"
              variant="outlined"
              label={`Updated ${refreshedAt ? refreshedAt.toLocaleTimeString() : '—'}`}
            />
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<RefreshIcon />}
              onClick={() => setRefreshedAt(new Date())}
            >
              Refresh
            </Button>
          </>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
            <TextField
              select
              size="small"
              label="Faculty"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">All faculties</MenuItem>
              {FACULTIES.map((f) => (
                <MenuItem key={f} value={f}>
                  {f}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Academic Term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              {TERMS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {depts.length} department{depts.length === 1 ? '' : 's'} in view
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* KPI row — large cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Overall Progress"
            value={`${agg.progress}%`}
            icon={DonutLargeIcon}
            color={ACCENT.violet}
            caption={`${agg.completed} of ${agg.total} evaluations`}
            delta={{ value: 4, period: 'vs last term' }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Completed"
            value={agg.completed.toLocaleString()}
            icon={CheckCircleIcon}
            color={ACCENT.green}
            caption="Higher than last term"
            delta={{ value: 8, period: 'vs last term' }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Not Evaluated"
            value={agg.notStarted}
            icon={HourglassEmptyIcon}
            color={ACCENT.amber}
            caption="Awaiting evaluation"
            delta={{ value: -5, period: 'vs last term' }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Average Score"
            value={agg.avgScore.toFixed(1)}
            icon={GradeIcon}
            color={ACCENT.blue}
            caption="Weighted across departments"
            delta={{ value: 3, period: 'vs last term' }}
          />
        </Grid>
      </Grid>

      {/* KPI row — compact cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            variant="compact"
            label="In Progress"
            value={agg.inProgress}
            icon={EditNoteIcon}
            color={ACCENT.cyan}
            delta={{ value: 6 }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            variant="compact"
            label="Departments"
            value={depts.length}
            icon={ApartmentIcon}
            color={ACCENT.violet}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            variant="compact"
            label="Evaluation Rounds"
            value={trend.length}
            icon={ReplayIcon}
            color={ACCENT.pink}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            variant="compact"
            label="Total Evaluations"
            value={agg.total.toLocaleString()}
            icon={PeopleIcon}
            color={ACCENT.green}
          />
        </Grid>
      </Grid>

      {/* Status donut + score trend */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Evaluation Status
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                sx={{ alignItems: 'center' }}
              >
                <DonutChart
                  segments={donutSegments}
                  centerValue={`${agg.progress}%`}
                  centerLabel="complete"
                />
                <Stack spacing={1.5} sx={{ flexGrow: 1, width: '100%' }}>
                  <LegendRow color={ACCENT.green} label="Completed" value={String(agg.completed)} />
                  <LegendRow color={ACCENT.blue} label="In Progress" value={String(agg.inProgress)} />
                  <LegendRow color={ACCENT.amber} label="Not Started" value={String(agg.notStarted)} />
                  <Divider />
                  <LegendRow color="transparent" label="Total" value={String(agg.total)} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Average Score by Round
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {faculty === 'all' ? 'All faculties' : faculty}
                </Typography>
              </Stack>
              <TrendLineChart points={trend} color={ACCENT.violet} min={60} max={100} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Completion by department (drill-down) + detail panel */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Completion by Department
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <TouchAppIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Click a bar to drill down
                  </Typography>
                </Stack>
              </Stack>
              <BarChart
                data={bars}
                selectedId={selectedDept}
                onSelect={(id) => setSelectedDept((prev) => (prev === id ? null : id))}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              {selected ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      {selected.faculty}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {selected.name}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip size="small" label={`${pct(selected.completed, selected.total)}% done`} color="success" />
                      <Chip size="small" variant="outlined" label={`Avg ${selected.avgScore.toFixed(1)}`} />
                    </Stack>
                  </Box>
                  <Divider />
                  <Typography variant="subtitle2">Progress by subject</Typography>
                  <Stack spacing={1.5}>
                    {selected.subjects.map((s) => {
                      const p = pct(s.completed, s.total);
                      return (
                        <Box key={s.name}>
                          <Stack
                            direction="row"
                            sx={{ justifyContent: 'space-between', mb: 0.5 }}
                          >
                            <Typography variant="body2" noWrap sx={{ mr: 1 }}>
                              {s.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {s.completed}/{s.total}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={p}
                            sx={{
                              height: 8,
                              borderRadius: 5,
                              bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Department Ranking
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sorted by completion. Select a bar for a subject-level breakdown.
                  </Typography>
                  <Stack spacing={1.5} sx={{ mt: 0.5 }}>
                    {[...depts]
                      .sort((a, b) => pct(b.completed, b.total) - pct(a.completed, a.total))
                      .map((d, i) => {
                        const p = pct(d.completed, d.total);
                        return (
                          <Stack
                            key={d.id}
                            direction="row"
                            spacing={1.5}
                            sx={{ alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => setSelectedDept(d.id)}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                width: 22,
                                height: 22,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                fontWeight: 700,
                                flexShrink: 0,
                                bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                                color: 'primary.main',
                              }}
                            >
                              {i + 1}
                            </Typography>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                <Typography variant="body2" noWrap sx={{ mr: 1 }}>
                                  {d.name}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {p}%
                                </Typography>
                              </Stack>
                              <LinearProgress
                                variant="determinate"
                                value={p}
                                sx={{
                                  mt: 0.5,
                                  height: 6,
                                  borderRadius: 5,
                                  bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
                                }}
                              />
                            </Box>
                          </Stack>
                        );
                      })}
                  </Stack>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="caption" color="text.secondary">
        Figures are demo data for {term}. Connect the reporting API to show live results.
      </Typography>
    </Stack>
  );
}
