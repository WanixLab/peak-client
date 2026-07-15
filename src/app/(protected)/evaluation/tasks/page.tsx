'use client';

import * as React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
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
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import LockIcon from '@mui/icons-material/Lock';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PageHeader from '@/components/common/PageHeader';
import StatTile from '@/components/common/StatTile';
import { ACCENT } from '@/theme/accents';

// --- Domain model -----------------------------------------------------------

type EvalType = 'self' | 'peer' | 'advisor';
type EvalStatus = 'not_started' | 'in_progress' | 'submitted';

interface Criterion {
  id: string;
  label: string;
  hint: string;
}
interface Section {
  id: string;
  title: string;
  criteria: Criterion[];
}
interface EvalTask {
  id: string;
  target: string;
  subjectCode: string;
  subject: string;
  form: string;
  type: EvalType;
  dueDate: string; // ISO
  status: EvalStatus;
  scores: Record<string, number>;
  comment: string;
  /** Final percentage, set once submitted. */
  finalScore?: number;
}

const SCALE_MAX = 5;
const SCALE_LABELS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

/** Shared rubric used by every task's form (a real app would vary per form). */
const SECTIONS: Section[] = [
  {
    id: 'content',
    title: 'Content & Knowledge',
    criteria: [
      { id: 'c1', label: 'Clarity of objectives', hint: 'Goals are well-defined and understood.' },
      { id: 'c2', label: 'Depth of content', hint: 'Demonstrates thorough understanding.' },
      { id: 'c3', label: 'Accuracy', hint: 'Information is correct and well-sourced.' },
    ],
  },
  {
    id: 'delivery',
    title: 'Presentation & Delivery',
    criteria: [
      { id: 'd1', label: 'Delivery & confidence', hint: 'Clear, engaging communication.' },
      { id: 'd2', label: 'Visual aids', hint: 'Supporting materials are effective.' },
      { id: 'd3', label: 'Time management', hint: 'Kept to the allotted time.' },
    ],
  },
  {
    id: 'qa',
    title: 'Discussion',
    criteria: [{ id: 'q1', label: 'Answering questions', hint: 'Responds thoughtfully and accurately.' }],
  },
];

const ALL_CRITERIA = SECTIONS.flatMap((s) => s.criteria);
const TOTAL_CRITERIA = ALL_CRITERIA.length;

const TYPE_META: Record<EvalType, { label: string; color: string; icon: typeof PersonIcon }> = {
  self: { label: 'Self', color: ACCENT.violet, icon: PersonIcon },
  peer: { label: 'Peer', color: ACCENT.blue, icon: GroupsIcon },
  advisor: { label: 'Advisor', color: ACCENT.cyan, icon: SupervisorAccountIcon },
};

const STATUS_META: Record<
  EvalStatus,
  { label: string; color: 'default' | 'warning' | 'success'; icon: typeof PersonIcon }
> = {
  not_started: { label: 'Not started', color: 'default', icon: PendingActionsIcon },
  in_progress: { label: 'In progress', color: 'warning', icon: EditNoteIcon },
  submitted: { label: 'Submitted', color: 'success', icon: CheckCircleIcon },
};

// --- Seed data (today = 2026-07-15) ----------------------------------------

const SEED: EvalTask[] = [
  { id: 't1', target: 'Napat Srisai', subjectCode: 'CS101', subject: 'Introduction to Programming', form: 'Project Evaluation Form', type: 'peer', dueDate: '2026-07-18', status: 'not_started', scores: {}, comment: '' },
  { id: 't2', target: 'Team B — Final Presentation', subjectCode: 'CS205', subject: 'Data Structures', form: 'Project Evaluation Form', type: 'advisor', dueDate: '2026-07-16', status: 'in_progress', scores: { c1: 4, c2: 3, d1: 4 }, comment: 'Strong start, needs clearer visuals.' },
  { id: 't3', target: 'My Self-Assessment', subjectCode: 'CS310', subject: 'Database Systems', form: 'Self-Assessment Form', type: 'self', dueDate: '2026-07-20', status: 'not_started', scores: {}, comment: '' },
  { id: 't4', target: 'Marketing Group 3', subjectCode: 'MK310', subject: 'Marketing Research', form: 'Project Evaluation Form', type: 'peer', dueDate: '2026-07-14', status: 'not_started', scores: {}, comment: '' },
  { id: 't5', target: 'Thanakorn Jaidee', subjectCode: 'PH150', subject: 'General Physics', form: 'Project Evaluation Form', type: 'advisor', dueDate: '2026-07-22', status: 'in_progress', scores: { c1: 5, c2: 4, c3: 4, d1: 4, d2: 3 }, comment: '' },
  { id: 't6', target: 'Ploy Chaiyaphruek', subjectCode: 'MK310', subject: 'Marketing Research', form: 'Project Evaluation Form', type: 'peer', dueDate: '2026-07-10', status: 'submitted', scores: { c1: 5, c2: 4, c3: 5, d1: 4, d2: 4, d3: 5, q1: 4 }, comment: 'Excellent research depth and delivery.', finalScore: 89 },
];

const TODAY = new Date('2026-07-15');
const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const progressOf = (task: EvalTask) =>
  Math.round((Object.keys(task.scores).length / TOTAL_CRITERIA) * 100);

const scoreToPct = (scores: Record<string, number>) => {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  return Math.round((avg / SCALE_MAX) * 100);
};

/** Days until due (negative = overdue), and a display bucket. */
function dueInfo(dueDate: string) {
  const days = Math.ceil((new Date(dueDate).getTime() - TODAY.getTime()) / 86_400_000);
  if (days < 0) return { days, label: `Overdue by ${-days}d`, color: 'error.main' as const };
  if (days === 0) return { days, label: 'Due today', color: 'error.main' as const };
  if (days <= 3) return { days, label: `Due in ${days}d`, color: 'warning.main' as const };
  return { days, label: `Due ${dateFmt.format(new Date(dueDate))}`, color: 'text.secondary' as const };
}

// --- Rating input -----------------------------------------------------------

function RatingScale({
  value,
  onChange,
  readOnly,
}: {
  value?: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
}) {
  return (
    <Stack direction="row" spacing={0.75}>
      {Array.from({ length: SCALE_MAX }, (_, i) => i + 1).map((n) => {
        const active = value === n;
        return (
          <Tooltip key={n} title={SCALE_LABELS[n - 1]} arrow disableInteractive>
            <Box
              component={readOnly ? 'div' : 'button'}
              type={readOnly ? undefined : 'button'}
              onClick={readOnly ? undefined : () => onChange?.(n)}
              aria-label={`${n} — ${SCALE_LABELS[n - 1]}`}
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                cursor: readOnly ? 'default' : 'pointer',
                border: '1px solid',
                borderColor: active ? 'primary.main' : 'divider',
                bgcolor: active ? 'primary.main' : 'transparent',
                color: active ? 'primary.contrastText' : 'text.secondary',
                transition: 'all .15s',
                '&:hover': readOnly
                  ? undefined
                  : { borderColor: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, active ? 1 : 0.08) },
              }}
            >
              {n}
            </Box>
          </Tooltip>
        );
      })}
    </Stack>
  );
}

// --- Evaluation dialog ------------------------------------------------------

function EvaluationDialog({
  task,
  open,
  onClose,
  onSaveDraft,
  onSubmit,
}: {
  task: EvalTask | null;
  open: boolean;
  onClose: () => void;
  onSaveDraft: (scores: Record<string, number>, comment: string) => void;
  onSubmit: (scores: Record<string, number>, comment: string) => void;
}) {
  const readOnly = task?.status === 'submitted';
  const [scores, setScores] = React.useState<Record<string, number>>(task?.scores ?? {});
  const [comment, setComment] = React.useState(task?.comment ?? '');
  const [showErrors, setShowErrors] = React.useState(false);

  if (!task) return null;

  const answered = Object.keys(scores).length;
  const progress = Math.round((answered / TOTAL_CRITERIA) * 100);
  const missing = ALL_CRITERIA.filter((c) => scores[c.id] == null).map((c) => c.id);
  const typeMeta = TYPE_META[task.type];

  const setScore = (id: string, v: number) => setScores((prev) => ({ ...prev, [id]: v }));

  const handleSubmit = () => {
    if (missing.length > 0) {
      setShowErrors(true);
      return;
    }
    onSubmit(scores, comment);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(typeMeta.color, 0.14), color: typeMeta.color }}>
            <typeMeta.icon />
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
              {task.target}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {task.subjectCode} · {task.subject} · {task.form}
            </Typography>
          </Box>
          <Chip size="small" label={`${typeMeta.label} evaluation`} sx={{ bgcolor: alpha(typeMeta.color, 0.12), color: typeMeta.color, fontWeight: 600 }} />
        </Stack>
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {readOnly ? 'Submitted' : `Progress · ${answered}/${TOTAL_CRITERIA} criteria`}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {readOnly && task.finalScore != null ? `Score ${task.finalScore}%` : `${progress}%`}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={readOnly ? 100 : progress}
            color={readOnly ? 'success' : 'primary'}
            sx={{ height: 8, borderRadius: 5 }}
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {readOnly && (
          <Alert severity="success" icon={<LockIcon fontSize="inherit" />} sx={{ mb: 2 }}>
            This evaluation has been submitted and is locked. You can review it below.
          </Alert>
        )}
        {showErrors && missing.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Please rate all criteria before submitting — {missing.length} remaining.
          </Alert>
        )}

        <Stack spacing={3}>
          {SECTIONS.map((section) => (
            <Box key={section.id}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                {section.title}
              </Typography>
              <Stack spacing={1.5}>
                {section.criteria.map((c) => {
                  const isMissing = showErrors && scores[c.id] == null;
                  return (
                    <Stack
                      key={c.id}
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.5}
                      sx={{
                        alignItems: { sm: 'center' },
                        justifyContent: 'space-between',
                        p: 1.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: isMissing ? 'error.main' : 'divider',
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {c.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.hint}
                        </Typography>
                      </Box>
                      <RatingScale
                        value={scores[c.id]}
                        onChange={(v) => setScore(c.id, v)}
                        readOnly={readOnly}
                      />
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          ))}

          <Divider />
          <TextField
            label="Overall comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
            minRows={3}
            fullWidth
            placeholder="Summarize your feedback…"
            disabled={readOnly}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          {readOnly ? 'Close' : 'Cancel'}
        </Button>
        {!readOnly && (
          <>
            <Button variant="outlined" onClick={() => onSaveDraft(scores, comment)}>
              Save draft
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

// --- Task card --------------------------------------------------------------

function TaskCard({ task, onOpen }: { task: EvalTask; onOpen: (t: EvalTask) => void }) {
  const typeMeta = TYPE_META[task.type];
  const statusMeta = STATUS_META[task.status];
  const due = dueInfo(task.dueDate);
  const progress = progressOf(task);
  const submitted = task.status === 'submitted';

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(typeMeta.color, 0.14), color: typeMeta.color, width: 48, height: 48 }}>
            <typeMeta.icon />
          </Avatar>

          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                {task.target}
              </Typography>
              <Chip size="small" label={typeMeta.label} sx={{ bgcolor: alpha(typeMeta.color, 0.12), color: typeMeta.color, fontWeight: 600, height: 20 }} />
            </Stack>
            <Typography variant="body2" color="text.secondary" noWrap>
              {task.subjectCode} · {task.subject} · {task.form}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.75 }}>
              <EventIcon sx={{ fontSize: 15, color: due.color }} />
              <Typography variant="caption" sx={{ color: due.color, fontWeight: 600 }}>
                {due.label}
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ width: { xs: '100%', md: 180 }, flexShrink: 0 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
              <Chip
                size="small"
                icon={<statusMeta.icon sx={{ fontSize: 16 }} />}
                label={statusMeta.label}
                color={statusMeta.color}
                variant={task.status === 'not_started' ? 'outlined' : 'filled'}
              />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {submitted && task.finalScore != null ? `${task.finalScore}%` : `${progress}%`}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={submitted ? 100 : progress}
              color={submitted ? 'success' : 'primary'}
              sx={{ height: 6, borderRadius: 5 }}
            />
          </Box>

          <Button
            variant={submitted ? 'outlined' : 'contained'}
            color={submitted ? 'inherit' : 'primary'}
            startIcon={submitted ? <VisibilityIcon /> : task.status === 'in_progress' ? <EditNoteIcon /> : <PlayArrowIcon />}
            onClick={() => onOpen(task)}
            sx={{ flexShrink: 0, minWidth: { md: 120 } }}
          >
            {submitted ? 'View' : task.status === 'in_progress' ? 'Continue' : 'Start'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

// --- Page -------------------------------------------------------------------

export default function MyEvaluationsPage() {
  const [tasks, setTasks] = React.useState<EvalTask[]>(SEED);
  const [statusFilter, setStatusFilter] = React.useState<'all' | EvalStatus>('all');
  const [typeFilter, setTypeFilter] = React.useState<'all' | EvalType>('all');
  const [search, setSearch] = React.useState('');

  const [active, setActive] = React.useState<EvalTask | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogKey, setDialogKey] = React.useState(0);

  const summary = React.useMemo(
    () => ({
      pending: tasks.filter((t) => t.status === 'not_started').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      submitted: tasks.filter((t) => t.status === 'submitted').length,
      dueSoon: tasks.filter((t) => t.status !== 'submitted' && dueInfo(t.dueDate).days <= 3).length,
    }),
    [tasks],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter(
      (t) =>
        (statusFilter === 'all' || t.status === statusFilter) &&
        (typeFilter === 'all' || t.type === typeFilter) &&
        (q === '' ||
          t.target.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.subjectCode.toLowerCase().includes(q)),
    );
  }, [tasks, statusFilter, typeFilter, search]);

  // Keep `active` set while the dialog animates closed (open toggles separately)
  // so the exit transition still has content to render — clearing it here would
  // orphan MUI's modal portal mid-close.
  const openTask = (task: EvalTask) => {
    setActive(task);
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };
  const closeDialog = () => setDialogOpen(false);

  const saveDraft = (scores: Record<string, number>, comment: string) => {
    if (!active) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? {
              ...t,
              scores,
              comment,
              status: t.status === 'submitted' ? t.status : Object.keys(scores).length > 0 ? 'in_progress' : 'not_started',
            }
          : t,
      ),
    );
    setDialogOpen(false);
  };

  const submit = (scores: Record<string, number>, comment: string) => {
    if (!active) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? { ...t, scores, comment, status: 'submitted', finalScore: scoreToPct(scores) }
          : t,
      ),
    );
    setDialogOpen(false);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="My Evaluations"
        description="Evaluations assigned to you — rate each criterion and submit before the deadline."
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="To Do" value={summary.pending} icon={PendingActionsIcon} color={ACCENT.amber} hint="Not started" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="In Progress" value={summary.inProgress} icon={EditNoteIcon} color={ACCENT.blue} hint="Drafts saved" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Submitted" value={summary.submitted} icon={CheckCircleIcon} color={ACCENT.green} hint="Completed" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Due Soon" value={summary.dueSoon} icon={EventIcon} color={ACCENT.pink} hint="Within 3 days" />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} sx={{ minWidth: 160 }}>
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="not_started">Not started</MenuItem>
              <MenuItem value="in_progress">In progress</MenuItem>
              <MenuItem value="submitted">Submitted</MenuItem>
            </TextField>
            <TextField select size="small" label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)} sx={{ minWidth: 150 }}>
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

      {filtered.length === 0 ? (
        <Card>
          <CardContent>
            <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography variant="h6">No evaluations match your filters</Typography>
              <Typography variant="body2" color="text.secondary">
                Try clearing the filters or search.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={openTask} />
          ))}
        </Stack>
      )}

      <EvaluationDialog
        key={dialogKey}
        task={active}
        open={dialogOpen}
        onClose={closeDialog}
        onSaveDraft={saveDraft}
        onSubmit={submit}
      />
    </Stack>
  );
}
