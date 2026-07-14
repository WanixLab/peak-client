'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import GradeIcon from '@mui/icons-material/Grade';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PageHeader from '@/components/common/PageHeader';
import StatTile from '@/components/common/StatTile';
import { ACCENT } from '@/theme/accents';

/** A single evaluation result. Replace this demo data with an API call. */
interface ScoreRow {
  id: number;
  member: string;
  subjectCode: string;
  subject: string;
  evaluator: string;
  term: string;
  score: number;
  status: 'Finalized' | 'In review' | 'Draft';
  date: string;
}

const PASS_MARK = 60;

const ROWS: ScoreRow[] = [
  { id: 1, member: 'Somchai Prasert', subjectCode: 'CS101', subject: 'Introduction to Programming', evaluator: 'Dr. Anong W.', term: '2569 / 1', score: 88, status: 'Finalized', date: '2026-06-28' },
  { id: 2, member: 'Kanya Sukjai', subjectCode: 'CS205', subject: 'Data Structures', evaluator: 'Dr. Anong W.', term: '2569 / 1', score: 76, status: 'Finalized', date: '2026-06-27' },
  { id: 3, member: 'Nattapong K.', subjectCode: 'MK310', subject: 'Marketing Research', evaluator: 'Aj. Prasit T.', term: '2569 / 1', score: 63, status: 'In review', date: '2026-06-30' },
  { id: 4, member: 'Ploy Chalermsuk', subjectCode: 'AC220', subject: 'Financial Accounting', evaluator: 'Aj. Suda M.', term: '2569 / 1', score: 54, status: 'In review', date: '2026-07-01' },
  { id: 5, member: 'Wichai Rungroj', subjectCode: 'CS101', subject: 'Introduction to Programming', evaluator: 'Dr. Anong W.', term: '2569 / 1', score: 91, status: 'Finalized', date: '2026-06-25' },
  { id: 6, member: 'Suda Meechai', subjectCode: 'PH150', subject: 'General Physics', evaluator: 'Dr. Kittset L.', term: '2568 / 2', score: 72, status: 'Finalized', date: '2026-03-14' },
  { id: 7, member: 'Anucha Boonme', subjectCode: 'MA200', subject: 'Calculus II', evaluator: 'Dr. Kittset L.', term: '2568 / 2', score: 48, status: 'Finalized', date: '2026-03-12' },
  { id: 8, member: 'Jiraporn N.', subjectCode: 'MK310', subject: 'Marketing Research', evaluator: 'Aj. Prasit T.', term: '2569 / 1', score: 84, status: 'Draft', date: '2026-07-05' },
  { id: 9, member: 'Thanawat S.', subjectCode: 'CS205', subject: 'Data Structures', evaluator: 'Dr. Anong W.', term: '2569 / 1', score: 69, status: 'In review', date: '2026-07-02' },
  { id: 10, member: 'Manee Rakdee', subjectCode: 'AC220', subject: 'Financial Accounting', evaluator: 'Aj. Suda M.', term: '2569 / 1', score: 79, status: 'Finalized', date: '2026-06-29' },
  { id: 11, member: 'Chai Watchara', subjectCode: 'PH150', subject: 'General Physics', evaluator: 'Dr. Kittset L.', term: '2568 / 2', score: 58, status: 'Finalized', date: '2026-03-10' },
  { id: 12, member: 'Pim Srisawat', subjectCode: 'CS101', subject: 'Introduction to Programming', evaluator: 'Dr. Anong W.', term: '2569 / 1', score: 95, status: 'Draft', date: '2026-07-06' },
];

const TERMS = ['2569 / 1', '2568 / 2'];
const SUBJECTS = Array.from(new Set(ROWS.map((r) => r.subject)));

/** Letter grade + chip colour derived from a numeric score. */
function gradeFor(score: number): { grade: string; color: 'success' | 'warning' | 'error' } {
  if (score >= 80) return { grade: 'A', color: 'success' };
  if (score >= 75) return { grade: 'B+', color: 'success' };
  if (score >= 70) return { grade: 'B', color: 'success' };
  if (score >= 65) return { grade: 'C+', color: 'warning' };
  if (score >= 60) return { grade: 'C', color: 'warning' };
  if (score >= 50) return { grade: 'D', color: 'error' };
  return { grade: 'F', color: 'error' };
}

const statusColor: Record<ScoreRow['status'], 'success' | 'info' | 'default'> = {
  Finalized: 'success',
  'In review': 'info',
  Draft: 'default',
};

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function ViewScoresPage() {
  const [term, setTerm] = React.useState('all');
  const [subject, setSubject] = React.useState('all');
  const [search, setSearch] = React.useState('');

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return ROWS.filter(
      (r) =>
        (term === 'all' || r.term === term) &&
        (subject === 'all' || r.subject === subject) &&
        (q === '' ||
          r.member.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.subjectCode.toLowerCase().includes(q) ||
          r.evaluator.toLowerCase().includes(q)),
    );
  }, [term, subject, search]);

  const summary = React.useMemo(() => {
    const count = rows.length;
    const avg = count ? rows.reduce((sum, r) => sum + r.score, 0) / count : 0;
    const passed = rows.filter((r) => r.score >= PASS_MARK).length;
    const finalized = rows.filter((r) => r.status === 'Finalized').length;
    return {
      avg: avg.toFixed(1),
      passRate: count ? Math.round((passed / count) * 100) : 0,
      finalized,
      pending: count - finalized,
    };
  }, [rows]);

  const columns = React.useMemo<GridColDef<ScoreRow>[]>(
    () => [
      { field: 'member', headerName: 'Member', flex: 1.2, minWidth: 160 },
      {
        field: 'subject',
        headerName: 'Subject',
        flex: 1.4,
        minWidth: 220,
        renderCell: (params: GridRenderCellParams<ScoreRow>) => (
          <Box sx={{ lineHeight: 1.3, py: 0.5 }}>
            <Typography variant="body2" noWrap>
              {params.row.subject}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.subjectCode}
            </Typography>
          </Box>
        ),
      },
      { field: 'evaluator', headerName: 'Evaluator', flex: 1, minWidth: 140 },
      { field: 'term', headerName: 'Term', width: 100 },
      {
        field: 'score',
        headerName: 'Score',
        width: 90,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<ScoreRow, number>) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: `${gradeFor(params.value ?? 0).color}.main` }}
          >
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'grade',
        headerName: 'Grade',
        width: 90,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        valueGetter: (_value, row) => gradeFor(row.score).grade,
        renderCell: (params: GridRenderCellParams<ScoreRow>) => {
          const g = gradeFor(params.row.score);
          return <Chip size="small" label={g.grade} color={g.color} variant="outlined" />;
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params: GridRenderCellParams<ScoreRow>) => (
          <Chip size="small" label={params.row.status} color={statusColor[params.row.status]} />
        ),
      },
      {
        field: 'date',
        headerName: 'Evaluated',
        width: 130,
        valueFormatter: (value: string) => dateFmt.format(new Date(value)),
      },
    ],
    [],
  );

  return (
    <Stack spacing={3}>
      <PageHeader title="View Scores" description="Browse and filter evaluation results." />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Average Score" value={summary.avg} icon={GradeIcon} color={ACCENT.violet} hint="Across shown results" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Pass Rate" value={`${summary.passRate}%`} icon={TrendingUpIcon} color={ACCENT.green} hint={`Pass mark ${PASS_MARK}`} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Finalized" value={summary.finalized} icon={CheckCircleIcon} color={ACCENT.blue} hint="Locked results" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Pending" value={summary.pending} icon={PendingActionsIcon} color={ACCENT.amber} hint="In review or draft" />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              select
              size="small"
              label="Term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">All terms</MenuItem>
              {TERMS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="all">All subjects</MenuItem>
              {SUBJECTS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ flexGrow: 1 }} />
            <TextField
              size="small"
              placeholder="Search member, subject, evaluator…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: { xs: '100%', md: 280 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <DataGrid<ScoreRow>
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
            sorting: { sortModel: [{ field: 'date', sort: 'desc' }] },
          }}
          sx={{ border: 0, minHeight: 420 }}
        />
      </Card>
    </Stack>
  );
}
