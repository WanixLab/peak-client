'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import HistoryIcon from '@mui/icons-material/History';
import GradeIcon from '@mui/icons-material/Grade';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PageHeader from '@/components/common/PageHeader';
import StatTile from '@/components/common/StatTile';
import { ACCENT } from '@/theme/accents';

// --- Domain model -----------------------------------------------------------

type EvalType = 'self' | 'peer' | 'advisor';

interface Criterion {
  id: string;
  label: string;
}
interface Section {
  id: string;
  title: string;
  criteria: Criterion[];
}
interface HistoryRecord {
  id: string;
  target: string;
  subjectCode: string;
  subject: string;
  form: string;
  type: EvalType;
  term: string;
  submittedAt: string; // ISO
  score: number; // percentage
  ratings: Record<string, number>; // criterionId -> 1..5
  comment: string;
}

const SCALE_MAX = 5;

/** Rubric mirrored from the evaluation form so the read-only detail can render. */
const SECTIONS: Section[] = [
  {
    id: 'content',
    title: 'Content & Knowledge',
    criteria: [
      { id: 'c1', label: 'Clarity of objectives' },
      { id: 'c2', label: 'Depth of content' },
      { id: 'c3', label: 'Accuracy' },
    ],
  },
  {
    id: 'delivery',
    title: 'Presentation & Delivery',
    criteria: [
      { id: 'd1', label: 'Delivery & confidence' },
      { id: 'd2', label: 'Visual aids' },
      { id: 'd3', label: 'Time management' },
    ],
  },
  {
    id: 'qa',
    title: 'Discussion',
    criteria: [{ id: 'q1', label: 'Answering questions' }],
  },
];

const TYPE_META: Record<EvalType, { label: string; color: string; icon: typeof PersonIcon }> = {
  self: { label: 'Self', color: ACCENT.violet, icon: PersonIcon },
  peer: { label: 'Peer', color: ACCENT.blue, icon: GroupsIcon },
  advisor: { label: 'Advisor', color: ACCENT.cyan, icon: SupervisorAccountIcon },
};

const TERMS = ['2569 / 1', '2568 / 2'];
const CURRENT_TERM = TERMS[0];

/** Letter grade + chip colour from a percentage score (shared style with Scores). */
function gradeFor(score: number): { grade: string; color: 'success' | 'warning' | 'error' } {
  if (score >= 80) return { grade: 'A', color: 'success' };
  if (score >= 70) return { grade: 'B', color: 'success' };
  if (score >= 65) return { grade: 'C+', color: 'warning' };
  if (score >= 60) return { grade: 'C', color: 'warning' };
  if (score >= 50) return { grade: 'D', color: 'error' };
  return { grade: 'F', color: 'error' };
}

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// --- Seed data --------------------------------------------------------------

const SEED: HistoryRecord[] = [
  { id: 'h1', target: 'Ploy Chaiyaphruek', subjectCode: 'MK310', subject: 'Marketing Research', form: 'Project Evaluation Form', type: 'peer', term: '2569 / 1', submittedAt: '2026-07-10', score: 89, ratings: { c1: 5, c2: 4, c3: 5, d1: 4, d2: 4, d3: 5, q1: 4 }, comment: 'Excellent research depth and delivery.' },
  { id: 'h2', target: 'Wichai Rungroj', subjectCode: 'CS101', subject: 'Introduction to Programming', form: 'Project Evaluation Form', type: 'advisor', term: '2569 / 1', submittedAt: '2026-07-08', score: 82, ratings: { c1: 4, c2: 4, c3: 5, d1: 4, d2: 4, d3: 4, q1: 4 }, comment: 'Solid understanding, clear presentation.' },
  { id: 'h3', target: 'My Self-Assessment', subjectCode: 'CS205', subject: 'Data Structures', form: 'Self-Assessment Form', type: 'self', term: '2569 / 1', submittedAt: '2026-07-05', score: 76, ratings: { c1: 4, c2: 3, c3: 4, d1: 4, d2: 3, d3: 4, q1: 4 }, comment: 'Confident with theory, want to improve on complexity analysis.' },
  { id: 'h4', target: 'Nattapong Kittisak', subjectCode: 'MK310', subject: 'Marketing Research', form: 'Project Evaluation Form', type: 'peer', term: '2569 / 1', submittedAt: '2026-07-02', score: 68, ratings: { c1: 3, c2: 3, c3: 4, d1: 3, d2: 3, d3: 4, q1: 4 }, comment: 'Good effort; needs stronger data support.' },
  { id: 'h5', target: 'Kanya Sukjai', subjectCode: 'CS205', subject: 'Data Structures', form: 'Project Evaluation Form', type: 'advisor', term: '2569 / 1', submittedAt: '2026-06-28', score: 91, ratings: { c1: 5, c2: 5, c3: 5, d1: 4, d2: 5, d3: 4, q1: 4 }, comment: 'Outstanding work across the board.' },
  { id: 'h6', target: 'Somchai Prasert', subjectCode: 'CS101', subject: 'Introduction to Programming', form: 'Project Evaluation Form', type: 'peer', term: '2569 / 1', submittedAt: '2026-06-25', score: 74, ratings: { c1: 4, c2: 3, c3: 4, d1: 4, d2: 3, d3: 3, q1: 4 }, comment: 'Well structured, could improve timing.' },
  { id: 'h7', target: 'Team A — Prototype Demo', subjectCode: 'CS310', subject: 'Database Systems', form: 'Project Evaluation Form', type: 'advisor', term: '2568 / 2', submittedAt: '2026-03-14', score: 85, ratings: { c1: 5, c2: 4, c3: 4, d1: 4, d2: 5, d3: 4, q1: 4 }, comment: 'Impressive prototype and schema design.' },
  { id: 'h8', target: 'Manee Rakdee', subjectCode: 'AC220', subject: 'Financial Accounting', form: 'Project Evaluation Form', type: 'peer', term: '2568 / 2', submittedAt: '2026-03-12', score: 79, ratings: { c1: 4, c2: 4, c3: 4, d1: 4, d2: 3, d3: 4, q1: 4 }, comment: 'Accurate and well presented.' },
  { id: 'h9', target: 'My Self-Assessment', subjectCode: 'PH150', subject: 'General Physics', form: 'Self-Assessment Form', type: 'self', term: '2568 / 2', submittedAt: '2026-03-10', score: 63, ratings: { c1: 3, c2: 3, c3: 3, d1: 3, d2: 3, d3: 4, q1: 4 }, comment: 'Fair grasp; need more practice with problem sets.' },
  { id: 'h10', target: 'Anucha Boonme', subjectCode: 'MA200', subject: 'Calculus II', form: 'Project Evaluation Form', type: 'advisor', term: '2568 / 2', submittedAt: '2026-03-08', score: 57, ratings: { c1: 3, c2: 2, c3: 3, d1: 3, d2: 3, d3: 3, q1: 3 }, comment: 'Needs to strengthen fundamentals.' },
  { id: 'h11', target: 'Jiraporn Nakorn', subjectCode: 'MK310', subject: 'Marketing Research', form: 'Project Evaluation Form', type: 'peer', term: '2568 / 2', submittedAt: '2026-03-05', score: 88, ratings: { c1: 5, c2: 4, c3: 4, d1: 5, d2: 4, d3: 5, q1: 4 }, comment: 'Creative approach, engaging delivery.' },
];

// --- Score dots (read-only rating display) ---------------------------------

function ScoreDots({ value }: { value: number }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      {Array.from({ length: SCALE_MAX }, (_, i) => i + 1).map((n) => (
        <Box
          key={n}
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: n <= value ? 'primary.main' : 'transparent',
            border: '1.5px solid',
            borderColor: n <= value ? 'primary.main' : 'divider',
          }}
        />
      ))}
      <Typography variant="caption" sx={{ fontWeight: 700, ml: 0.5, minWidth: 24 }}>
        {value}/{SCALE_MAX}
      </Typography>
    </Stack>
  );
}

// --- Detail dialog (read-only) ---------------------------------------------

function DetailDialog({ record, onClose }: { record: HistoryRecord | null; onClose: () => void }) {
  const typeMeta = record ? TYPE_META[record.type] : null;
  const grade = record ? gradeFor(record.score) : null;

  return (
    <Dialog open={Boolean(record)} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      {record && typeMeta && grade && (
        <>
          <DialogTitle sx={{ pb: 1.5 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Avatar variant="rounded" sx={{ bgcolor: alpha(typeMeta.color, 0.14), color: typeMeta.color }}>
                <typeMeta.icon />
              </Avatar>
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                  {record.target}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {record.subjectCode} · {record.subject} · {record.form}
                </Typography>
              </Box>
              <Stack sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: `${grade.color}.main`, lineHeight: 1 }}>
                  {record.score}%
                </Typography>
                <Chip size="small" label={`Grade ${grade.grade}`} color={grade.color} variant="outlined" sx={{ mt: 0.5 }} />
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
              <Chip size="small" icon={<LockIcon sx={{ fontSize: 15 }} />} label="Locked" />
              <Chip size="small" variant="outlined" label={`Term ${record.term}`} />
              <Chip size="small" variant="outlined" label={`Submitted ${dateFmt.format(new Date(record.submittedAt))}`} />
              <Chip size="small" sx={{ bgcolor: alpha(typeMeta.color, 0.12), color: typeMeta.color, fontWeight: 600 }} label={`${typeMeta.label} evaluation`} />
            </Stack>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={3}>
              {SECTIONS.map((section) => (
                <Box key={section.id}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                    {section.title}
                  </Typography>
                  <Stack spacing={1.5}>
                    {section.criteria.map((c) => (
                      <Stack
                        key={c.id}
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <Typography variant="body2">{c.label}</Typography>
                        <ScoreDots value={record.ratings[c.id] ?? 0} />
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              ))}

              <Divider />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Overall comment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {record.comment || '—'}
                </Typography>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={onClose} variant="contained">
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

// --- Page -------------------------------------------------------------------

export default function EvaluationHistoryPage() {
  const [term, setTerm] = React.useState('all');
  const [type, setType] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [active, setActive] = React.useState<HistoryRecord | null>(null);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return SEED.filter(
      (r) =>
        (term === 'all' || r.term === term) &&
        (type === 'all' || r.type === type) &&
        (q === '' ||
          r.target.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.subjectCode.toLowerCase().includes(q)),
    );
  }, [term, type, search]);

  const summary = React.useMemo(() => {
    const count = rows.length;
    const avg = count ? rows.reduce((s, r) => s + r.score, 0) / count : 0;
    const thisTerm = rows.filter((r) => r.term === CURRENT_TERM).length;
    const subjects = new Set(rows.map((r) => r.subject)).size;
    return { count, avg: avg.toFixed(1), thisTerm, subjects };
  }, [rows]);

  const columns = React.useMemo<GridColDef<HistoryRecord>[]>(
    () => [
      {
        field: 'target',
        headerName: 'Evaluated',
        flex: 1.5,
        minWidth: 220,
        renderCell: (params: GridRenderCellParams<HistoryRecord>) => {
          const meta = TYPE_META[params.row.type];
          return (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', height: '100%' }}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: alpha(meta.color, 0.14), color: meta.color }}>
                <meta.icon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>
                  {params.row.target}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }} noWrap>
                  {params.row.subjectCode} · {params.row.subject}
                </Typography>
              </Box>
            </Stack>
          );
        },
      },
      {
        field: 'type',
        headerName: 'Type',
        width: 110,
        renderCell: (params: GridRenderCellParams<HistoryRecord>) => {
          const meta = TYPE_META[params.row.type];
          return (
            <Chip
              size="small"
              label={meta.label}
              sx={{ bgcolor: alpha(meta.color, 0.12), color: meta.color, fontWeight: 600 }}
            />
          );
        },
      },
      { field: 'term', headerName: 'Term', width: 100 },
      {
        field: 'submittedAt',
        headerName: 'Submitted',
        width: 130,
        valueFormatter: (value: string) => dateFmt.format(new Date(value)),
      },
      {
        field: 'score',
        headerName: 'Score',
        width: 90,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<HistoryRecord, number>) => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: `${gradeFor(params.value ?? 0).color}.main` }}>
              {params.value}%
            </Typography>
          </Box>
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
        renderCell: (params: GridRenderCellParams<HistoryRecord>) => {
          const g = gradeFor(params.row.score);
          return <Chip size="small" label={g.grade} color={g.color} variant="outlined" />;
        },
      },
      {
        field: 'actions',
        headerName: '',
        width: 110,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params: GridRenderCellParams<HistoryRecord>) => (
          <Button size="small" startIcon={<VisibilityIcon />} onClick={() => setActive(params.row)}>
            View
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Evaluation History"
        description="A record of the evaluations you have submitted."
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Total Evaluations" value={summary.count} icon={HistoryIcon} color={ACCENT.violet} hint="Across shown records" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Avg Score Given" value={summary.avg} icon={GradeIcon} color={ACCENT.green} hint="Mean of shown records" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="This Term" value={summary.thisTerm} icon={CalendarMonthIcon} color={ACCENT.blue} hint={CURRENT_TERM} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Subjects" value={summary.subjects} icon={MenuBookIcon} color={ACCENT.amber} hint="Distinct subjects" />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField select size="small" label="Term" value={term} onChange={(e) => setTerm(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="all">All terms</MenuItem>
              {TERMS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Type" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="all">All types</MenuItem>
              {(Object.keys(TYPE_META) as EvalType[]).map((t) => (
                <MenuItem key={t} value={t}>
                  {TYPE_META[t].label}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ flexGrow: 1 }} />
            <TextField
              size="small"
              placeholder="Search target, subject…"
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
        <DataGrid<HistoryRecord>
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          rowHeight={58}
          pageSizeOptions={[10, 25, 50]}
          onRowClick={(params) => setActive(params.row)}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
            sorting: { sortModel: [{ field: 'submittedAt', sort: 'desc' }] },
          }}
          sx={{ border: 0, minHeight: 420, '& .MuiDataGrid-row': { cursor: 'pointer' } }}
        />
      </Card>

      <DetailDialog record={active} onClose={() => setActive(null)} />
    </Stack>
  );
}
