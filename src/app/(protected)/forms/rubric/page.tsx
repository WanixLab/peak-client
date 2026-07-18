'use client';

import * as React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
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
import RuleIcon from '@mui/icons-material/Rule';
import FunctionsIcon from '@mui/icons-material/Functions';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScienceIcon from '@mui/icons-material/Science';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import GradeIcon from '@mui/icons-material/Grade';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import FilterBar from '@/components/common/FilterBar';
import Button from '@/components/common/Button';
import Chip from '@/components/common/Chip';
import { ACCENT } from '@/theme/accents';
import { softCard, softCardHover } from '@/theme/surfaces';
import {
  FORMS,
  FORMULA_META,
  RUBRICS,
  computeScore,
  getForm,
  getScorableField,
  type Formula,
  type Rubric,
  type RubricCriterion,
} from '@/data/formManagement';

let seq = 100;
const uid = (p: string) => `${p}${(seq += 1)}`;

// --- การ์ดเกณฑ์ -------------------------------------------------------------

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
  const form = getForm(rubric.formId);
  const totalWeight = rubric.criteria.reduce((s, c) => s + c.weight, 0);
  const weightOk = rubric.formula !== 'weighted' || totalWeight === 100;
  const unmapped = rubric.criteria.filter((c) => !getScorableField(form, c.fieldId)).length;

  return (
    <Card sx={[softCardHover, { height: '100%', display: 'flex', flexDirection: 'column' }]}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 1.5 }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(ACCENT.violet, 0.14), color: ACCENT.violet, width: 44, height: 44, borderRadius: 2 }}>
            <RuleIcon />
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.25 }}>{rubric.name}</Typography>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.25, color: 'text.secondary' }}>
              <DynamicFormIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" noWrap>{form?.name ?? 'ยังไม่ผูกแบบฟอร์ม'}</Typography>
            </Stack>
          </Box>
          <Chip
            label={rubric.status === 'active' ? 'ใช้งาน' : 'ฉบับร่าง'}
            color={rubric.status === 'active' ? ACCENT.green : ACCENT.violet}
            variant={rubric.status === 'active' ? 'solid' : 'soft'}
            size="sm"
          />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip icon={FunctionsIcon} label={FORMULA_META[rubric.formula].label} color={ACCENT.blue} variant="outlined" size="sm" />
          <Chip icon={CheckCircleIcon} label={`ผ่าน ≥ ${rubric.passThreshold}%`} color={ACCENT.green} variant="outlined" size="sm" />
          {unmapped > 0 && (
            <Chip icon={LinkOffIcon} label={`ยังไม่ผูก ${unmapped}`} color={ACCENT.amber} variant="soft" size="sm" />
          )}
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
          {rubric.criteria.length} เกณฑ์ → ช่อง
        </Typography>
        <Stack spacing={0.75} sx={{ mt: 1, mb: 2 }}>
          {rubric.criteria.map((c) => {
            const field = getScorableField(form, c.fieldId);
            return (
              <Box key={c.id}>
                <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'space-between', mb: 0.25, alignItems: 'center' }}>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                    <Typography variant="caption" noWrap sx={{ maxWidth: 140 }}>{c.label}</Typography>
                    {field ? (
                      <Tooltip title={`อ่านค่าจาก "${field.label}" (สเกล 1–${field.scaleMax})`}>
                        <LinkIcon sx={{ fontSize: 13, color: 'success.main', flexShrink: 0 }} />
                      </Tooltip>
                    ) : (
                      <Tooltip title="ยังไม่ผูกช่องในแบบฟอร์ม — ไม่ถูกนำมาคิดคะแนน">
                        <LinkOffIcon sx={{ fontSize: 13, color: 'warning.main', flexShrink: 0 }} />
                      </Tooltip>
                    )}
                  </Stack>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{c.weight}%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={c.weight} sx={{ height: 5, borderRadius: 5 }} />
              </Box>
            );
          })}
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        {rubric.formula === 'weighted' && (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 1.5 }}>
            <Typography variant="caption" color={weightOk ? 'text.secondary' : 'error.main'} sx={{ fontWeight: 600 }}>
              น้ำหนักรวม: {totalWeight}%
            </Typography>
            {!weightOk && <Typography variant="caption" color="error.main">(ควรเป็น 100%)</Typography>}
          </Stack>
        )}

        <Divider sx={{ mb: 1.5 }} />
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button variant="solid" color={ACCENT.violet} startIcon={EditIcon} onClick={onEdit} fullWidth>
            ตั้งค่า
          </Button>
          <Tooltip title="ทำสำเนา">
            <Button variant="ghost" color={ACCENT.violet} iconOnly onClick={onDuplicate}><ContentCopyIcon sx={{ fontSize: 18 }} /></Button>
          </Tooltip>
          <Tooltip title="ลบ">
            <Button variant="ghost" color={ACCENT.pink} iconOnly onClick={onDelete}><DeleteOutlineIcon sx={{ fontSize: 18 }} /></Button>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}

// --- ตัวแก้ไขเกณฑ์ พร้อมพรีวิวสด --------------------------------------------

const makeEmptyRubric = (): Rubric => ({
  id: '',
  name: '',
  formId: FORMS[0].id,
  formula: 'weighted',
  passThreshold: 60,
  status: 'draft',
  criteria: [],
});

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
  const [draft, setDraft] = React.useState<Rubric>(initial ?? makeEmptyRubric());
  const form = getForm(draft.formId);
  // คำตอบตัวอย่าง คีย์ด้วย field id — ป้อนเข้าการคำนวณสด
  const [sample, setSample] = React.useState<Record<string, number>>(() => {
    const f = getForm((initial ?? makeEmptyRubric()).formId);
    return Object.fromEntries((f?.scorableFields ?? []).map((sf) => [sf.id, sf.scaleMax]));
  });

  const totalWeight = draft.criteria.reduce((s, c) => s + c.weight, 0);
  const weightOk = draft.formula !== 'weighted' || totalWeight === 100;
  const result = computeScore(draft, form, sample);
  const passed = result.percent >= draft.passThreshold;

  const setField = <K extends keyof Rubric>(key: K, value: Rubric[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const setCriterion = (id: string, patch: Partial<RubricCriterion>) =>
    setDraft((d) => ({ ...d, criteria: d.criteria.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));

  // เปลี่ยนแบบฟอร์มทำให้การผูกช่องเดิมใช้ไม่ได้ — ล้างการผูก
  const chooseForm = (formId: string) => {
    setDraft((d) => ({ ...d, formId, criteria: d.criteria.map((c) => ({ ...c, fieldId: undefined })) }));
    const f = getForm(formId);
    setSample(Object.fromEntries((f?.scorableFields ?? []).map((sf) => [sf.id, sf.scaleMax])));
  };

  const addCriterion = () => {
    setDraft((d) => ({ ...d, criteria: [...d.criteria, { id: uid('rc'), label: `เกณฑ์ ${d.criteria.length + 1}`, weight: 0 }] }));
  };

  const removeCriterion = (id: string) =>
    setDraft((d) => ({ ...d, criteria: d.criteria.filter((c) => c.id !== id) }));

  // สร้างเกณฑ์ 1 ข้อต่อ 1 ช่องที่ให้คะแนนได้ พร้อมผูกช่องและแบ่งน้ำหนักเท่ากัน
  const generateFromFields = () => {
    const fields = form?.scorableFields ?? [];
    if (fields.length === 0) return;
    const base = Math.floor(100 / fields.length);
    const remainder = 100 - base * fields.length;
    setDraft((d) => ({
      ...d,
      criteria: fields.map((f, i) => ({
        id: uid('rc'),
        label: f.label,
        weight: base + (i < remainder ? 1 : 0),
        fieldId: f.id,
      })),
    }));
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
          <Avatar variant="rounded" sx={{ bgcolor: alpha(ACCENT.violet, 0.14), color: ACCENT.violet, borderRadius: 2 }}>
            <RuleIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {initial ? 'ตั้งค่าเกณฑ์' : 'เกณฑ์ใหม่'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ผูกแต่ละเกณฑ์กับช่องในแบบฟอร์ม กำหนดน้ำหนักและสูตร แล้วดูคะแนนคำนวณสด
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* ตั้งค่า + เกณฑ์ */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2}>
              <TextField label="ชื่อเกณฑ์" size="small" fullWidth value={draft.name} onChange={(e) => setField('name', e.target.value)} placeholder="เช่น เกณฑ์ให้คะแนนโปรเจกต์จบ" />

              <TextField
                select
                label="แบบฟอร์มที่ผูก"
                size="small"
                fullWidth
                value={draft.formId}
                onChange={(e) => chooseForm(e.target.value)}
                helperText={form ? `มี ${form.scorableFields.length} ช่องที่ให้คะแนนได้ให้ผูก` : undefined}
              >
                {FORMS.map((f) => (
                  <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
                ))}
              </TextField>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField select label="สูตรคำนวณ" size="small" fullWidth value={draft.formula} onChange={(e) => setField('formula', e.target.value as Formula)} helperText={FORMULA_META[draft.formula].description}>
                  {(Object.keys(FORMULA_META) as Formula[]).map((f) => (
                    <MenuItem key={f} value={f}>{FORMULA_META[f].label}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="เกณฑ์ผ่าน"
                  size="small"
                  type="number"
                  fullWidth
                  value={draft.passThreshold}
                  onChange={(e) => setField('passThreshold', Math.max(0, Math.min(100, Number(e.target.value))))}
                  slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                  helperText="คะแนนขั้นต่ำที่ถือว่าผ่าน"
                />
              </Stack>

              <Divider />

              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>เกณฑ์ → ช่องในแบบฟอร์ม</Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="sm" variant="soft" color={ACCENT.violet} startIcon={AutoAwesomeIcon} onClick={generateFromFields}>สร้างจากช่อง</Button>
                  {draft.formula === 'weighted' && (
                    <Button size="sm" variant="ghost" color={ACCENT.violet} onClick={distributeEvenly}>กระจายน้ำหนัก</Button>
                  )}
                  <Button size="sm" variant="ghost" color={ACCENT.violet} startIcon={AddIcon} onClick={addCriterion}>เพิ่ม</Button>
                </Stack>
              </Stack>

              {draft.criteria.length === 0 ? (
                <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, py: 3, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body2">
                    ยังไม่มีเกณฑ์ — กด “สร้างจากช่อง” เพื่อสร้าง 1 เกณฑ์ต่อ 1 ช่องอัตโนมัติ
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {draft.criteria.map((c) => {
                    const mappedField = getScorableField(form, c.fieldId);
                    return (
                      <Stack key={c.id} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
                        <TextField size="small" fullWidth label="เกณฑ์" value={c.label} onChange={(e) => setCriterion(c.id, { label: e.target.value })} />
                        <TextField
                          select
                          size="small"
                          label="ผูกกับช่อง"
                          value={c.fieldId ?? ''}
                          onChange={(e) => setCriterion(c.id, { fieldId: e.target.value || undefined })}
                          sx={{ minWidth: { sm: 190 }, width: { xs: '100%', sm: 'auto' } }}
                          error={!mappedField}
                        >
                          <MenuItem value=""><em>— ยังไม่ผูก —</em></MenuItem>
                          {(form?.scorableFields ?? []).map((f) => (
                            <MenuItem key={f.id} value={f.id}>{f.label}</MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          size="small"
                          type="number"
                          label="น้ำหนัก"
                          value={c.weight}
                          onChange={(e) => setCriterion(c.id, { weight: Math.max(0, Number(e.target.value)) })}
                          disabled={draft.formula === 'average'}
                          sx={{ width: { xs: '100%', sm: 110 } }}
                          slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                        />
                        <Tooltip title="ลบเกณฑ์">
                          <Button variant="ghost" color={ACCENT.pink} iconOnly onClick={() => removeCriterion(c.id)}>
                            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                          </Button>
                        </Tooltip>
                      </Stack>
                    );
                  })}
                </Stack>
              )}

              {draft.formula === 'weighted' && draft.criteria.length > 0 && !weightOk && (
                <Alert severity="warning" sx={{ py: 0.25 }}>
                  น้ำหนักรวม {totalWeight}% — ปรับให้ครบ 100% ก่อนบันทึก
                </Alert>
              )}
              {result.unmapped > 0 && (
                <Alert severity="info" icon={<LinkOffIcon fontSize="inherit" />} sx={{ py: 0.25 }}>
                  มี {result.unmapped} เกณฑ์ที่ยังไม่ผูกช่อง จะไม่ถูกนำมาคิดคะแนน
                </Alert>
              )}
            </Stack>
          </Grid>

          {/* พรีวิวการคำนวณสด */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card variant="outlined" sx={{ position: { md: 'sticky' }, top: { md: 0 }, bgcolor: (t) => alpha(t.palette.primary.main, 0.03) }}>
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                  <ScienceIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>ตัวอย่างการคำนวณสด</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                  <DynamicFormIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption">{form?.name}</Typography>
                  <ArrowForwardIcon sx={{ fontSize: 13 }} />
                  <GradeIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption">คะแนน</Typography>
                </Stack>

                <Stack spacing={2.5}>
                  {(form?.scorableFields ?? []).map((f) => {
                    const usedBy = draft.criteria.filter((c) => c.fieldId === f.id);
                    return (
                      <Box key={f.id} sx={{ opacity: usedBy.length ? 1 : 0.5 }}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }}>{f.label}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {sample[f.id] ?? 0}<Box component="span" sx={{ color: 'text.disabled' }}>/{f.scaleMax}</Box>
                          </Typography>
                        </Stack>
                        <Slider
                          size="small"
                          min={0}
                          max={f.scaleMax}
                          step={f.scaleMax > 10 ? 5 : 1}
                          value={sample[f.id] ?? 0}
                          onChange={(_, v) => setSample((s) => ({ ...s, [f.id]: v as number }))}
                          valueLabelDisplay="auto"
                        />
                      </Box>
                    );
                  })}
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
                  <Typography variant="caption" color="text.secondary">คะแนนที่คำนวณได้</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.1, color: passed ? 'success.main' : 'error.main' }}>
                    {result.percent.toFixed(1)}%
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', alignItems: 'center', mt: 0.5 }}>
                    {passed ? <CheckCircleIcon fontSize="small" color="success" /> : <CancelIcon fontSize="small" color="error" />}
                    <Typography variant="body2" sx={{ fontWeight: 700, color: passed ? 'success.main' : 'error.main' }}>
                      {passed ? 'ผ่าน' : 'ไม่ผ่าน'} · เกณฑ์ {draft.passThreshold}%
                    </Typography>
                  </Stack>
                  {draft.formula === 'sum' && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      ผลรวมดิบ: {result.raw}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="ghost" color={ACCENT.violet} onClick={onClose}>ยกเลิก</Button>
        <Button variant="solid" color={ACCENT.violet} disabled={!canSave} onClick={() => onSave({ ...draft, id: draft.id || uid('rubric-') })}>
          บันทึกเกณฑ์
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// --- หน้าเพจ -----------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'ทุกสถานะ' },
  { value: 'active', label: 'ใช้งาน' },
  { value: 'draft', label: 'ฉบับร่าง' },
];

export default function RubricConfigPage() {
  const [rubrics, setRubrics] = React.useState<Rubric[]>(RUBRICS);
  const [search, setSearch] = React.useState('');
  const [formFilter, setFormFilter] = React.useState('all');
  const [status, setStatus] = React.useState('all');

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Rubric | null>(null);
  const [editorKey, setEditorKey] = React.useState(0);
  const [toDelete, setToDelete] = React.useState<Rubric | null>(null);

  const summary = React.useMemo(() => {
    const totalCriteria = rubrics.reduce((s, r) => s + r.criteria.length, 0);
    const mapped = rubrics.reduce(
      (s, r) => s + r.criteria.filter((c) => getScorableField(getForm(r.formId), c.fieldId)).length,
      0,
    );
    return {
      total: rubrics.length,
      coverage: totalCriteria ? Math.round((mapped / totalCriteria) * 100) : 0,
      linkedForms: new Set(rubrics.map((r) => r.formId)).size,
      active: rubrics.filter((r) => r.status === 'active').length,
    };
  }, [rubrics]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rubrics.filter(
      (r) =>
        (formFilter === 'all' || r.formId === formFilter) &&
        (status === 'all' || r.status === status) &&
        (q === '' || r.name.toLowerCase().includes(q) || (getForm(r.formId)?.name ?? '').toLowerCase().includes(q)),
    );
  }, [rubrics, search, formFilter, status]);

  const filtersActive = formFilter !== 'all' || status !== 'all' || search.trim() !== '';
  const resetFilters = () => {
    setFormFilter('all');
    setStatus('all');
    setSearch('');
  };

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
    setRubrics((prev) => [...prev, { ...r, id: uid('rubric-'), name: `${r.name} (สำเนา)`, status: 'draft' }]);

  const handleDelete = () => {
    if (toDelete) setRubrics((prev) => prev.filter((r) => r.id !== toDelete.id));
    setToDelete(null);
  };

  const FORM_OPTIONS = [
    { value: 'all', label: 'ทุกแบบฟอร์ม' },
    ...FORMS.map((f) => ({ value: f.id, label: f.name })),
  ];

  return (
    <Stack spacing={3}>
      <PageHeader
        title="เกณฑ์ให้คะแนน"
        description="ผูกช่องในแบบฟอร์มกับเกณฑ์ที่ถ่วงน้ำหนัก เลือกสูตรและเกณฑ์ผ่าน — นี่คือสิ่งที่เปลี่ยนคำตอบให้เป็นคะแนน"
        actions={
          <Button variant="solid" color={ACCENT.violet} startIcon={AddIcon} onClick={openNew}>
            เกณฑ์ใหม่
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="เกณฑ์ทั้งหมด" value={summary.total} icon={RuleIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="ความครอบคลุมช่อง" value={`${summary.coverage}%`} icon={LinkIcon} color={ACCENT.blue} caption="เกณฑ์ที่ผูกช่องแล้ว" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="แบบฟอร์มที่ผูก" value={summary.linkedForms} icon={DynamicFormIcon} color={ACCENT.cyan} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="ใช้งานอยู่" value={summary.active} icon={CheckCircleIcon} color={ACCENT.green} />
        </Grid>
      </Grid>

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'ค้นหาเกณฑ์…' }}
        filters={[
          { key: 'form', label: 'แบบฟอร์ม', value: formFilter, onChange: setFormFilter, options: FORM_OPTIONS, minWidth: 200 },
          { key: 'status', label: 'สถานะ', value: status, onChange: setStatus, options: STATUS_OPTIONS },
        ]}
        onReset={resetFilters}
        active={filtersActive}
      />

      {filtered.length === 0 ? (
        <Card sx={softCard}>
          <CardContent>
            <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
              <RuleIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography variant="h6">ไม่พบเกณฑ์ที่ตรงกับตัวกรอง</Typography>
              <Typography variant="body2" color="text.secondary">
                สร้างเกณฑ์ใหม่ หรือปรับตัวกรองด้านบน
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
        <DialogTitle>ลบเกณฑ์</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ต้องการลบ <strong>{toDelete?.name}</strong> หรือไม่? การมอบหมายที่ใช้เกณฑ์นี้จะกลับไปใช้
            การถ่วงน้ำหนักเท่ากันเป็นค่าเริ่มต้นจนกว่าจะผูกเกณฑ์ใหม่
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="ghost" color={ACCENT.violet} onClick={() => setToDelete(null)}>ยกเลิก</Button>
          <Button variant="solid" color={ACCENT.pink} onClick={handleDelete}>ลบ</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
