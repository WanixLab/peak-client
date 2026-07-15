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
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import RuleIcon from '@mui/icons-material/Rule';
import FunctionsIcon from '@mui/icons-material/Functions';
import LinkIcon from '@mui/icons-material/Link';
import StraightenIcon from '@mui/icons-material/Straighten';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScienceIcon from '@mui/icons-material/Science';
import PageHeader from '@/components/common/PageHeader';
import StatTile from '@/components/common/StatTile';
import { ACCENT } from '@/theme/accents';

// --- Domain model -----------------------------------------------------------

type Formula = 'weighted' | 'average' | 'sum';
type RubricStatus = 'active' | 'draft';

interface Criterion {
  id: string;
  label: string;
  weight: number;
}

interface Rubric {
  id: string;
  name: string;
  linkedForm: string;
  scaleMax: number;
  formula: Formula;
  passThreshold: number; // percentage 0–100
  status: RubricStatus;
  criteria: Criterion[];
}

const FORMULA_META: Record<Formula, { label: string; description: string }> = {
  weighted: { label: 'Weighted average', description: 'Each criterion contributes proportionally to its weight.' },
  average: { label: 'Simple average', description: 'Mean of all criteria, weights ignored.' },
  sum: { label: 'Total sum', description: 'Raw total of all criterion scores.' },
};

const FORMS = [
  'Capstone Project Evaluation',
  'Peer Contribution Review',
  'Advisor Final Sign-off',
  'Innovation Pitch Scoring',
];

let seq = 100;
const uid = (p: string) => `${p}${(seq += 1)}`;

// --- Seed data --------------------------------------------------------------

const SEED: Rubric[] = [
  {
    id: 'r1',
    name: 'Capstone Scoring Rubric',
    linkedForm: 'Capstone Project Evaluation',
    scaleMax: 5,
    formula: 'weighted',
    passThreshold: 60,
    status: 'active',
    criteria: [
      { id: 'c1', label: 'Originality & innovation', weight: 30 },
      { id: 'c2', label: 'Technical execution', weight: 30 },
      { id: 'c3', label: 'Presentation & delivery', weight: 20 },
      { id: 'c4', label: 'Documentation', weight: 20 },
    ],
  },
  {
    id: 'r2',
    name: 'Peer Contribution Weights',
    linkedForm: 'Peer Contribution Review',
    scaleMax: 5,
    formula: 'average',
    passThreshold: 50,
    status: 'active',
    criteria: [
      { id: 'c1', label: 'Collaboration', weight: 25 },
      { id: 'c2', label: 'Reliability', weight: 25 },
      { id: 'c3', label: 'Contribution', weight: 50 },
    ],
  },
  {
    id: 'r3',
    name: 'Advisor Final Score',
    linkedForm: 'Advisor Final Sign-off',
    scaleMax: 10,
    formula: 'weighted',
    passThreshold: 70,
    status: 'active',
    criteria: [
      { id: 'c1', label: 'Objectives met', weight: 40 },
      { id: 'c2', label: 'Methodology', weight: 35 },
      { id: 'c3', label: 'Impact', weight: 25 },
    ],
  },
  {
    id: 'r4',
    name: 'Pitch Quick-score',
    linkedForm: 'Innovation Pitch Scoring',
    scaleMax: 5,
    formula: 'sum',
    passThreshold: 60,
    status: 'draft',
    criteria: [
      { id: 'c1', label: 'Problem–solution fit', weight: 50 },
      { id: 'c2', label: 'Market potential', weight: 50 },
    ],
  },
];

// --- Scoring engine ---------------------------------------------------------

/** Returns a normalized 0–100 percentage plus the raw value for a rubric + scores. */
function computeScore(rubric: Rubric, scores: Record<string, number>) {
  const { criteria, scaleMax, formula } = rubric;
  if (criteria.length === 0) return { percent: 0, raw: 0 };
  const valueOf = (c: Criterion) => scores[c.id] ?? 0;

  if (formula === 'sum') {
    const raw = criteria.reduce((s, c) => s + valueOf(c), 0);
    const max = criteria.length * scaleMax;
    return { percent: max === 0 ? 0 : (raw / max) * 100, raw };
  }
  if (formula === 'average') {
    const avg = criteria.reduce((s, c) => s + valueOf(c), 0) / criteria.length;
    return { percent: (avg / scaleMax) * 100, raw: avg };
  }
  // weighted
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0) || 1;
  const weighted = criteria.reduce((s, c) => s + (valueOf(c) / scaleMax) * c.weight, 0) / totalWeight;
  return { percent: weighted * 100, raw: weighted * scaleMax };
}

// --- Rubric card ------------------------------------------------------------

function RubricCard({
  rubric,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  rubric: Rubric;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const totalWeight = rubric.criteria.reduce((s, c) => s + c.weight, 0);
  const weightOk = rubric.formula !== 'weighted' || totalWeight === 100;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { borderColor: 'primary.main' }, transition: 'border-color .15s' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 1.5 }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(ACCENT.violet, 0.14), color: ACCENT.violet, width: 44, height: 44 }}>
            <RuleIcon />
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.25 }}>{rubric.name}</Typography>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.25, color: 'text.secondary' }}>
              <LinkIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" noWrap>{rubric.linkedForm}</Typography>
            </Stack>
          </Box>
          <Chip
            size="small"
            label={rubric.status === 'active' ? 'Active' : 'Draft'}
            color={rubric.status === 'active' ? 'success' : 'default'}
            variant={rubric.status === 'active' ? 'filled' : 'outlined'}
          />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip size="small" icon={<StraightenIcon sx={{ fontSize: 15 }} />} label={`Scale 1–${rubric.scaleMax}`} variant="outlined" />
          <Chip size="small" icon={<FunctionsIcon sx={{ fontSize: 15 }} />} label={FORMULA_META[rubric.formula].label} variant="outlined" />
          <Chip size="small" icon={<CheckCircleIcon sx={{ fontSize: 15 }} />} label={`Pass ≥ ${rubric.passThreshold}%`} variant="outlined" />
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
          {rubric.criteria.length} CRITERIA
        </Typography>
        <Stack spacing={0.75} sx={{ mt: 1, mb: 2 }}>
          {rubric.criteria.map((c) => (
            <Box key={c.id}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.25 }}>
                <Typography variant="caption" noWrap sx={{ maxWidth: '75%' }}>{c.label}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{c.weight}%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={c.weight} sx={{ height: 5, borderRadius: 5 }} />
            </Box>
          ))}
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        {rubric.formula === 'weighted' && (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 1.5 }}>
            <Typography variant="caption" color={weightOk ? 'text.secondary' : 'error.main'} sx={{ fontWeight: 600 }}>
              Total weight: {totalWeight}%
            </Typography>
            {!weightOk && <Typography variant="caption" color="error.main">(should be 100%)</Typography>}
          </Stack>
        )}

        <Divider sx={{ mb: 1.5 }} />
        <Stack direction="row" spacing={1}>
          <Button fullWidth variant="contained" size="small" startIcon={<EditIcon />} onClick={onEdit}>
            Configure
          </Button>
          <Tooltip title="Duplicate">
            <IconButton size="small" onClick={onDuplicate}><ContentCopyIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={onDelete}><DeleteOutlineIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}

// --- Rubric editor with live preview ---------------------------------------

const EMPTY_RUBRIC: Rubric = {
  id: '',
  name: '',
  linkedForm: FORMS[0],
  scaleMax: 5,
  formula: 'weighted',
  passThreshold: 60,
  status: 'draft',
  criteria: [
    { id: 'c1', label: 'Criterion 1', weight: 50 },
    { id: 'c2', label: 'Criterion 2', weight: 50 },
  ],
};

function RubricEditor({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Rubric | null;
  onClose: () => void;
  onSave: (rubric: Rubric) => void;
}) {
  const [draft, setDraft] = React.useState<Rubric>(initial ?? EMPTY_RUBRIC);
  const [sample, setSample] = React.useState<Record<string, number>>(() =>
    Object.fromEntries((initial ?? EMPTY_RUBRIC).criteria.map((c) => [c.id, (initial ?? EMPTY_RUBRIC).scaleMax])),
  );

  const totalWeight = draft.criteria.reduce((s, c) => s + c.weight, 0);
  const weightOk = draft.formula !== 'weighted' || totalWeight === 100;
  const result = computeScore(draft, sample);
  const passed = result.percent >= draft.passThreshold;

  const setField = <K extends keyof Rubric>(key: K, value: Rubric[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const setCriterion = (id: string, patch: Partial<Criterion>) =>
    setDraft((d) => ({ ...d, criteria: d.criteria.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));

  const addCriterion = () => {
    const id = uid('c');
    setDraft((d) => ({ ...d, criteria: [...d.criteria, { id, label: `Criterion ${d.criteria.length + 1}`, weight: 0 }] }));
    setSample((s) => ({ ...s, [id]: draft.scaleMax }));
  };

  const removeCriterion = (id: string) => {
    setDraft((d) => ({ ...d, criteria: d.criteria.filter((c) => c.id !== id) }));
    setSample((s) => {
      const next = { ...s };
      delete next[id];
      return next;
    });
  };

  const distributeEvenly = () => {
    const n = draft.criteria.length;
    if (n === 0) return;
    const base = Math.floor(100 / n);
    const remainder = 100 - base * n;
    setDraft((d) => ({
      ...d,
      criteria: d.criteria.map((c, i) => ({ ...c, weight: base + (i < remainder ? 1 : 0) })),
    }));
  };

  const canSave = draft.name.trim() !== '' && draft.criteria.length > 0 && weightOk;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(ACCENT.violet, 0.14), color: ACCENT.violet }}>
            <RuleIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {initial ? 'Configure rubric' : 'New rubric'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Set criteria, weights, scoring formula and the pass threshold.
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Config + criteria */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2}>
              <TextField label="Rubric name" size="small" fullWidth value={draft.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Capstone Scoring Rubric" />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField select label="Linked form" size="small" fullWidth value={draft.linkedForm} onChange={(e) => setField('linkedForm', e.target.value)}>
                  {FORMS.map((f) => (
                    <MenuItem key={f} value={f}>{f}</MenuItem>
                  ))}
                </TextField>
                <TextField select label="Score scale" size="small" fullWidth value={draft.scaleMax} onChange={(e) => setField('scaleMax', Number(e.target.value))}>
                  <MenuItem value={3}>1 – 3</MenuItem>
                  <MenuItem value={5}>1 – 5</MenuItem>
                  <MenuItem value={10}>1 – 10</MenuItem>
                  <MenuItem value={100}>0 – 100</MenuItem>
                </TextField>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField select label="Formula" size="small" fullWidth value={draft.formula} onChange={(e) => setField('formula', e.target.value as Formula)} helperText={FORMULA_META[draft.formula].description}>
                  {(Object.keys(FORMULA_META) as Formula[]).map((f) => (
                    <MenuItem key={f} value={f}>{FORMULA_META[f].label}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Pass threshold"
                  size="small"
                  type="number"
                  fullWidth
                  value={draft.passThreshold}
                  onChange={(e) => setField('passThreshold', Math.max(0, Math.min(100, Number(e.target.value))))}
                  slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                  helperText="Minimum score to pass."
                />
              </Stack>

              <Divider />

              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Criteria</Typography>
                <Stack direction="row" spacing={1}>
                  {draft.formula === 'weighted' && (
                    <Button size="small" color="inherit" onClick={distributeEvenly}>Distribute evenly</Button>
                  )}
                  <Button size="small" startIcon={<AddIcon />} onClick={addCriterion}>Add criterion</Button>
                </Stack>
              </Stack>

              <Stack spacing={1}>
                {draft.criteria.map((c) => (
                  <Stack key={c.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <TextField size="small" fullWidth value={c.label} onChange={(e) => setCriterion(c.id, { label: e.target.value })} />
                    <TextField
                      size="small"
                      type="number"
                      value={c.weight}
                      onChange={(e) => setCriterion(c.id, { weight: Math.max(0, Number(e.target.value)) })}
                      disabled={draft.formula === 'average'}
                      sx={{ width: 110 }}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                    />
                    <IconButton size="small" disabled={draft.criteria.length <= 1} onClick={() => removeCriterion(c.id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>

              {draft.formula === 'weighted' && !weightOk && (
                <Alert severity="warning" sx={{ py: 0.25 }}>
                  Weights total {totalWeight}% — adjust to exactly 100% before saving.
                </Alert>
              )}
            </Stack>
          </Grid>

          {/* Live preview */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card variant="outlined" sx={{ position: { md: 'sticky' }, top: { md: 0 }, bgcolor: (t) => alpha(t.palette.primary.main, 0.03) }}>
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                  <ScienceIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Live calculation preview</Typography>
                </Stack>

                <Stack spacing={2.5}>
                  {draft.criteria.map((c) => (
                    <Box key={c.id}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }}>{c.label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {sample[c.id] ?? 0}<Box component="span" sx={{ color: 'text.disabled' }}>/{draft.scaleMax}</Box>
                        </Typography>
                      </Stack>
                      <Slider
                        size="small"
                        min={0}
                        max={draft.scaleMax}
                        step={draft.scaleMax > 10 ? 5 : 1}
                        value={sample[c.id] ?? 0}
                        onChange={(_, v) => setSample((s) => ({ ...s, [c.id]: v as number }))}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  ))}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    textAlign: 'center',
                    bgcolor: (t) => alpha(passed ? t.palette.success.main : t.palette.error.main, 0.1),
                    border: '1px solid',
                    borderColor: passed ? 'success.main' : 'error.main',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">Computed score</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.1, color: passed ? 'success.main' : 'error.main' }}>
                    {result.percent.toFixed(1)}%
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', alignItems: 'center', mt: 0.5 }}>
                    {passed ? <CheckCircleIcon fontSize="small" color="success" /> : <CancelIcon fontSize="small" color="error" />}
                    <Typography variant="body2" sx={{ fontWeight: 700, color: passed ? 'success.main' : 'error.main' }}>
                      {passed ? 'Pass' : 'Fail'} · threshold {draft.passThreshold}%
                    </Typography>
                  </Stack>
                  {draft.formula === 'sum' && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Raw total: {result.raw} / {draft.criteria.length * draft.scaleMax}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button color="inherit" onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!canSave} onClick={() => onSave({ ...draft, id: draft.id || uid('r') })}>
          Save rubric
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// --- Page -------------------------------------------------------------------

export default function RubricConfigPage() {
  const [rubrics, setRubrics] = React.useState<Rubric[]>(SEED);
  const [search, setSearch] = React.useState('');
  const [formFilter, setFormFilter] = React.useState('all');
  const [status, setStatus] = React.useState('all');

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Rubric | null>(null);
  const [editorKey, setEditorKey] = React.useState(0);
  const [toDelete, setToDelete] = React.useState<Rubric | null>(null);

  const summary = React.useMemo(() => {
    const totalCriteria = rubrics.reduce((s, r) => s + r.criteria.length, 0);
    return {
      total: rubrics.length,
      avgCriteria: rubrics.length ? (totalCriteria / rubrics.length).toFixed(1) : '0',
      linkedForms: new Set(rubrics.map((r) => r.linkedForm)).size,
      active: rubrics.filter((r) => r.status === 'active').length,
    };
  }, [rubrics]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rubrics.filter(
      (r) =>
        (formFilter === 'all' || r.linkedForm === formFilter) &&
        (status === 'all' || r.status === status) &&
        (q === '' || r.name.toLowerCase().includes(q) || r.linkedForm.toLowerCase().includes(q)),
    );
  }, [rubrics, search, formFilter, status]);

  const openNew = () => {
    setEditing(null);
    setEditorKey((k) => k + 1);
    setEditorOpen(true);
  };
  const openEdit = (r: Rubric) => {
    setEditing(r);
    setEditorKey((k) => k + 1);
    setEditorOpen(true);
  };

  const handleSave = (rubric: Rubric) => {
    setRubrics((prev) => (prev.some((r) => r.id === rubric.id) ? prev.map((r) => (r.id === rubric.id ? rubric : r)) : [...prev, rubric]));
    setEditorOpen(false);
  };

  const duplicate = (r: Rubric) =>
    setRubrics((prev) => [...prev, { ...r, id: uid('r'), name: `${r.name} (copy)`, status: 'draft' }]);

  const handleDelete = () => {
    if (toDelete) setRubrics((prev) => prev.filter((r) => r.id !== toDelete.id));
    setToDelete(null);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Rubric Config"
        description="Define scoring criteria, weights, formulas and pass thresholds, then link them to forms."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
            New rubric
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Rubrics" value={summary.total} icon={RuleIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Avg. Criteria" value={summary.avgCriteria} icon={StraightenIcon} color={ACCENT.blue} hint="Per rubric" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Linked Forms" value={summary.linkedForms} icon={LinkIcon} color={ACCENT.cyan} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Active" value={summary.active} icon={CheckCircleIcon} color={ACCENT.green} />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField select size="small" label="Linked form" value={formFilter} onChange={(e) => setFormFilter(e.target.value)} sx={{ minWidth: 220 }}>
              <MenuItem value="all">All forms</MenuItem>
              {FORMS.map((f) => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
            </TextField>
            <Box sx={{ flexGrow: 1 }} />
            <TextField
              size="small"
              placeholder="Search rubric…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: { xs: '100%', md: 260 } }}
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
              <RuleIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography variant="h6">No rubrics match your filters</Typography>
              <Typography variant="body2" color="text.secondary">
                Create a rubric or adjust the filters above.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((r) => (
            <Grid key={r.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <RubricCard
                rubric={r}
                onEdit={() => openEdit(r)}
                onDuplicate={() => duplicate(r)}
                onDelete={() => setToDelete(r)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <RubricEditor
        key={editorKey}
        open={editorOpen}
        initial={editing}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete rubric</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete <strong>{toDelete?.name}</strong>? Forms using it will fall back to an equal-weight
            default until a new rubric is linked.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
