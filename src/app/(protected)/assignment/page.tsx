'use client';

import * as React from 'react';
import {
  Alert,
  Autocomplete,
  Avatar,
  AvatarGroup,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Switch,
  Step,
  StepLabel,
  Stepper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import RuleIcon from '@mui/icons-material/Rule';
import GradeIcon from '@mui/icons-material/Grade';
import GroupsIcon from '@mui/icons-material/Groups';
import FlagIcon from '@mui/icons-material/Flag';
import EventIcon from '@mui/icons-material/Event';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LinkIcon from '@mui/icons-material/Link';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import FilterBar from '@/components/common/FilterBar';
import Button from '@/components/common/Button';
import Chip from '@/components/common/Chip';
import { ACCENT } from '@/theme/accents';
import { softCard, softCardHover } from '@/theme/surfaces';
import {
  ASSIGNMENTS,
  ASSIGNMENT_STATUS_META,
  EVAL_TYPE_META,
  FORMS,
  FORMULA_META,
  getForm,
  getRubric,
  rubricsForForm,
  taskCount,
  type Assignment,
  type EvalType,
  type AssignmentStatus,
  type EvaluatorSplit,
} from '@/data/formManagement';

const TODAY = new Date('2026-07-18');
const dateFmt = new Intl.DateTimeFormat('th-TH-u-ca-gregory', { day: 'numeric', month: 'short', year: 'numeric' });

let seq = 100;
const uid = (p: string) => `${p}${(seq += 1)}`;

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

/** จำนวนวันจนถึงกำหนด (ติดลบ = เกินกำหนด) พร้อมป้ายและสีแสดงผล */
function dueInfo(dueDate: string) {
  const days = Math.ceil((new Date(dueDate).getTime() - TODAY.getTime()) / 86_400_000);
  if (days < 0) return { label: `เกินกำหนด ${-days} วัน`, color: 'error.main' as const };
  if (days === 0) return { label: 'ครบกำหนดวันนี้', color: 'error.main' as const };
  if (days <= 3) return { label: `อีก ${days} วัน`, color: 'warning.main' as const };
  return { label: `ครบกำหนด ${dateFmt.format(new Date(dueDate))}`, color: 'text.secondary' as const };
}

// รายชื่อสำหรับ suggestion ในตัวช่วยสร้าง ดึงมาจากข้อมูลที่มีอยู่
const PEOPLE_POOL = Array.from(
  new Set(ASSIGNMENTS.flatMap((a) => [...a.evaluators, ...a.targets])),
).sort();

// --- แถบอธิบายกระบวนการ: แบบฟอร์ม → เกณฑ์ → คะแนน ---------------------------

function PipelineNode({ icon: Icon, color, title, subtitle }: {
  icon: typeof DynamicFormIcon;
  color: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
      <Avatar variant="rounded" sx={{ bgcolor: alpha(color, 0.14), color, width: 40, height: 40, borderRadius: 2 }}>
        <Icon />
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  );
}

function PipelineArrow() {
  return (
    <ArrowForwardIcon
      sx={{ color: 'text.disabled', flexShrink: 0, transform: { xs: 'rotate(90deg)', md: 'none' } }}
    />
  );
}

function PipelineStrip() {
  return (
    <Card sx={[softCard, { bgcolor: (t) => alpha(t.palette.primary.main, 0.03) }]}>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
          <LinkIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            คะแนนถูกสร้างขึ้นอย่างไร
          </Typography>
        </Stack>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between' }}
        >
          <PipelineNode icon={DynamicFormIcon} color={ACCENT.blue} title="แบบฟอร์ม" subtitle="ผู้ประเมินกรอกช่องให้คะแนน" />
          <PipelineArrow />
          <PipelineNode icon={AssignmentIndIcon} color={ACCENT.violet} title="การมอบหมาย" subtitle="จับคู่ฟอร์ม+เกณฑ์ กระจายเป็นงาน" />
          <PipelineArrow />
          <PipelineNode icon={RuleIcon} color={ACCENT.cyan} title="เกณฑ์ให้คะแนน" subtitle="ถ่วงน้ำหนักแต่ละช่อง + สูตรคำนวณ" />
          <PipelineArrow />
          <PipelineNode icon={GradeIcon} color={ACCENT.green} title="คะแนน" subtitle="ปรับเป็น 0–100% + ผ่าน/ไม่ผ่าน" />
        </Stack>
      </CardContent>
    </Card>
  );
}

// --- การ์ดการมอบหมาย --------------------------------------------------------

function AssignmentCard({ a, onView }: { a: Assignment; onView: (a: Assignment) => void }) {
  const form = getForm(a.formId);
  const rubric = getRubric(a.rubricId);
  const typeMeta = EVAL_TYPE_META[a.type];
  const statusMeta = ASSIGNMENT_STATUS_META[a.status];
  const total = taskCount(a);
  const pct = total === 0 ? 0 : Math.round((a.submitted / total) * 100);
  const due = dueInfo(a.dueDate);

  return (
    <Card sx={[softCardHover, { height: '100%', display: 'flex', flexDirection: 'column' }]}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 1.5 }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(typeMeta.color, 0.14), color: typeMeta.color, width: 44, height: 44, borderRadius: 2 }}>
            <AssignmentIndIcon />
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
              {a.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {a.subjectCode} · {a.subject}
            </Typography>
          </Box>
          <Chip label={statusMeta.label} color={statusMeta.color} variant={a.status === 'closed' ? 'soft' : 'solid'} size="sm" />
        </Stack>

        {/* การเชื่อม แบบฟอร์ม → เกณฑ์ */}
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75, mb: 2, alignItems: 'center' }}>
          <Chip icon={DynamicFormIcon} label={form?.name ?? 'แบบฟอร์ม'} color={ACCENT.blue} variant="outlined" size="sm" />
          <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
          <Chip
            icon={RuleIcon}
            label={rubric ? rubric.name : 'ยังไม่มีเกณฑ์'}
            color={rubric ? ACCENT.cyan : ACCENT.amber}
            variant="outlined"
            size="sm"
          />
        </Stack>

        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid size={6}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <GroupsIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1 }}>{a.evaluators.length}</Typography>
                <Typography variant="caption" color="text.secondary">ผู้ประเมิน</Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid size={6}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <FlagIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1 }}>{a.targets.length}</Typography>
                <Typography variant="caption" color="text.secondary">ผู้ถูกประเมิน</Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            ส่งแล้ว {a.submitted}/{total} งาน
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{pct}%</Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={pct}
          color={a.status === 'closed' ? 'success' : 'primary'}
          sx={{ height: 6, borderRadius: 5, mb: 1.5 }}
        />

        <Divider sx={{ mb: 1.5 }} />

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 26, height: 26, fontSize: 11 } }}>
            {a.evaluators.map((e) => (
              <Tooltip key={e} title={e}>
                <Avatar sx={{ bgcolor: alpha(typeMeta.color, 0.16), color: typeMeta.color }}>{initials(e)}</Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <EventIcon sx={{ fontSize: 15, color: due.color }} />
            <Typography variant="caption" sx={{ color: due.color, fontWeight: 600 }}>{due.label}</Typography>
          </Stack>
        </Stack>

        <Button variant="soft" color={typeMeta.color} onClick={() => onView(a)} fullWidth style={{ marginTop: 14 }}>
          ดูรายละเอียด
        </Button>
      </CardContent>
    </Card>
  );
}

// --- ตัวช่วยสร้าง (Wizard) ---------------------------------------------------

const STEPS = ['แบบฟอร์ม & เกณฑ์', 'ผู้ประเมิน & ผู้ถูกประเมิน', 'แบ่งหัวข้อการให้คะแนน', 'กำหนดการ & ตรวจสอบ'];

interface Draft {
  title: string;
  formId: string;
  rubricId: string;
  type: EvalType;
  subjectCode: string;
  subject: string;
  evaluators: string[];
  targets: string[];
  /** เปิดใช้เมื่อผู้ประเมินแบ่งหัวข้อกัน (แต่ละคนดูแลหัวข้อของตัวเอง ไม่ทับกัน) */
  splitByTopic: boolean;
  /** map จากชื่อหัวข้อ (เกณฑ์) → ชื่อผู้ประเมินที่ดูแลหัวข้อนั้น */
  topicOwner: Record<string, string>;
  assignedDate: string;
  dueDate: string;
}

const EMPTY_DRAFT: Draft = {
  title: '',
  formId: '',
  rubricId: '',
  type: 'committee',
  subjectCode: '',
  subject: '',
  evaluators: [],
  targets: [],
  splitByTopic: false,
  topicOwner: {},
  assignedDate: '2026-07-18',
  dueDate: '2026-07-25',
};

function CreateWizard({ open, onClose, onCreate }: {
  open: boolean;
  onClose: () => void;
  onCreate: (a: Assignment) => void;
}) {
  const [step, setStep] = React.useState(0);
  const [draft, setDraft] = React.useState<Draft>(EMPTY_DRAFT);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const form = getForm(draft.formId);
  const rubricOptions = draft.formId ? rubricsForForm(draft.formId) : [];
  const rubric = getRubric(draft.rubricId);
  const mappedCriteria = rubric ? rubric.criteria.filter((c) => c.fieldId).length : 0;
  const generated = draft.evaluators.length * draft.targets.length;

  // หัวข้อให้คะแนน = เกณฑ์ในรูบริกที่เลือก
  const criteria = rubric?.criteria ?? [];
  // ทุกหัวข้อถูกมอบให้ผู้ประเมินที่ยังอยู่ในรายชื่อครบหรือยัง
  const allTopicsOwned =
    criteria.length > 0 &&
    criteria.every((c) => draft.topicOwner[c.label] && draft.evaluators.includes(draft.topicOwner[c.label]));
  // สรุปการแบ่งตามผู้ประเมิน (ไม่ทับกัน) — ตัดผู้ที่ไม่ได้หัวข้อออก
  const splitPreview: EvaluatorSplit[] = draft.evaluators
    .map((ev) => ({
      evaluator: ev,
      topics: criteria.filter((c) => draft.topicOwner[c.label] === ev).map((c) => c.label),
    }))
    .filter((s) => s.topics.length > 0);

  const stepValid = [
    Boolean(draft.formId && draft.rubricId && draft.title.trim()),
    draft.evaluators.length > 0 && draft.targets.length > 0,
    !draft.splitByTopic || allTopicsOwned,
    Boolean(draft.assignedDate && draft.dueDate),
  ];

  // เมื่อเปลี่ยนแบบฟอร์ม ให้เลือกเกณฑ์แรกของแบบฟอร์มนั้นเป็นค่าเริ่มต้น และล้างการแบ่งหัวข้อเดิม
  const chooseForm = (formId: string) => {
    const rubrics = rubricsForForm(formId);
    setDraft((d) => ({ ...d, formId, rubricId: rubrics[0]?.id ?? '', topicOwner: {} }));
  };

  // มอบหัวข้อให้ผู้ประเมินแบบวนรอบให้เท่า ๆ กัน
  const autoDistribute = () => {
    if (draft.evaluators.length === 0) return;
    const map: Record<string, string> = {};
    criteria.forEach((c, i) => {
      map[c.label] = draft.evaluators[i % draft.evaluators.length];
    });
    setDraft((d) => ({ ...d, topicOwner: map }));
  };

  const setTopicOwner = (label: string, evaluator: string) =>
    setDraft((d) => ({ ...d, topicOwner: { ...d.topicOwner, [label]: evaluator } }));

  const handleCreate = () => {
    onCreate({
      id: uid('asg-'),
      title: draft.title.trim(),
      formId: draft.formId,
      rubricId: draft.rubricId,
      type: draft.type,
      subjectCode: draft.subjectCode.trim() || '—',
      subject: draft.subject.trim() || 'ไม่ระบุ',
      evaluators: draft.evaluators,
      targets: draft.targets,
      assignedDate: draft.assignedDate,
      dueDate: draft.dueDate,
      status: new Date(draft.assignedDate) > TODAY ? 'scheduled' : 'active',
      submitted: 0,
      topicSplit: draft.splitByTopic && splitPreview.length > 0 ? splitPreview : undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(ACCENT.violet, 0.14), color: ACCENT.violet, borderRadius: 2 }}>
            <AssignmentIndIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>มอบหมายงานประเมินใหม่</Typography>
            <Typography variant="caption" color="text.secondary">
              จับคู่แบบฟอร์ม + เกณฑ์ให้ผู้ประเมิน แล้วระบบจะสร้างงานให้อัตโนมัติ
            </Typography>
          </Box>
        </Stack>
        <Stepper activeStep={step} sx={{ mt: 2.5 }}>
          {STEPS.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent dividers>
        {/* ขั้นที่ 1 — แบบฟอร์ม & เกณฑ์ */}
        {step === 0 && (
          <Stack spacing={2.5}>
            <TextField
              label="ชื่อการมอบหมาย"
              size="small"
              fullWidth
              value={draft.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="เช่น สอบป้องกันโปรเจกต์ — รอบกรรมการ"
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField select label="แบบฟอร์ม" size="small" fullWidth value={draft.formId} onChange={(e) => chooseForm(e.target.value)}>
                {FORMS.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="เกณฑ์ให้คะแนน"
                size="small"
                fullWidth
                value={draft.rubricId}
                onChange={(e) => set('rubricId', e.target.value)}
                disabled={!draft.formId}
                helperText={draft.formId ? `มี ${rubricOptions.length} เกณฑ์ที่ผูกกับแบบฟอร์มนี้` : 'เลือกแบบฟอร์มก่อน'}
              >
                {rubricOptions.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </TextField>
            </Stack>

            {form && rubric && (
              <Alert severity="info" icon={<LinkIcon fontSize="inherit" />}>
                <strong>{rubric.name}</strong> ผูก <strong>{mappedCriteria}</strong> จาก{' '}
                {form.scorableFields.length} ช่องที่ให้คะแนนได้บน <strong>{form.name}</strong> คำนวณด้วย{' '}
                <strong>{FORMULA_META[rubric.formula].label}</strong> ผ่านที่ ≥ {rubric.passThreshold}%
              </Alert>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField select label="ประเภทการประเมิน" size="small" fullWidth value={draft.type} onChange={(e) => set('type', e.target.value as EvalType)}>
                {(Object.keys(EVAL_TYPE_META) as EvalType[]).map((t) => (
                  <MenuItem key={t} value={t}>{EVAL_TYPE_META[t].label}</MenuItem>
                ))}
              </TextField>
              <TextField label="รหัสวิชา" size="small" fullWidth value={draft.subjectCode} onChange={(e) => set('subjectCode', e.target.value)} placeholder="เช่น CS499" />
              <TextField label="ชื่อวิชา" size="small" fullWidth value={draft.subject} onChange={(e) => set('subject', e.target.value)} placeholder="เช่น โปรเจกต์จบ" />
            </Stack>
          </Stack>
        )}

        {/* ขั้นที่ 2 — ผู้ประเมิน & ผู้ถูกประเมิน */}
        {step === 1 && (
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>ผู้ประเมิน</Typography>
              <Autocomplete
                multiple
                freeSolo
                options={PEOPLE_POOL}
                value={draft.evaluators}
                onChange={(_, v) => set('evaluators', v as string[])}
                renderInput={(params) => <TextField {...params} size="small" placeholder="เพิ่มผู้ประเมิน…" />}
              />
              <Typography variant="caption" color="text.secondary">ผู้ที่ทำหน้าที่กรอกแบบฟอร์ม</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>ผู้ถูกประเมิน</Typography>
              <Autocomplete
                multiple
                freeSolo
                options={PEOPLE_POOL}
                value={draft.targets}
                onChange={(_, v) => set('targets', v as string[])}
                renderInput={(params) => <TextField {...params} size="small" placeholder="เพิ่มผู้ถูกประเมิน (บุคคลหรือทีม)…" />}
              />
              <Typography variant="caption" color="text.secondary">ผู้ที่ถูกประเมิน</Typography>
            </Box>

            <Alert severity={generated > 0 ? 'success' : 'warning'} icon={<PlaylistAddCheckIcon fontSize="inherit" />}>
              {generated > 0
                ? <>จะสร้างงานประเมิน <strong>{generated}</strong> งาน ({draft.evaluators.length} ผู้ประเมิน × {draft.targets.length} ผู้ถูกประเมิน)</>
                : 'เพิ่มผู้ประเมินและผู้ถูกประเมินอย่างน้อยฝั่งละ 1 คนเพื่อสร้างงาน'}
            </Alert>
          </Stack>
        )}

        {/* ขั้นที่ 3 — แบ่งหัวข้อการให้คะแนน */}
        {step === 2 && (
          <Stack spacing={2.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={draft.splitByTopic}
                  onChange={(e) => set('splitByTopic', e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>แบ่งหัวข้อระหว่างผู้ประเมิน</Typography>
                  <Typography variant="caption" color="text.secondary">
                    แต่ละคนดูแลเฉพาะหัวข้อของตัวเอง ไม่ทับกัน (เช่น เคส Oral: อาจารย์ 3 ท่านแบ่ง 8 หัวข้อ)
                  </Typography>
                </Box>
              }
            />

            {!draft.splitByTopic ? (
              <Alert severity="info" icon={<GroupsIcon fontSize="inherit" />}>
                ผู้ประเมินทุกคนจะให้คะแนน <strong>ครบทั้ง {criteria.length} หัวข้อ</strong> ของ{' '}
                <strong>{rubric?.name ?? 'เกณฑ์ที่เลือก'}</strong> — เปิดสวิตช์ด้านบนหากต้องการให้แต่ละคนรับผิดชอบคนละหัวข้อ
              </Alert>
            ) : (
              <>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    มอบผู้ประเมินให้แต่ละหัวข้อ ({criteria.length} หัวข้อ · {draft.evaluators.length} ผู้ประเมิน)
                  </Typography>
                  <Button variant="ghost" color={ACCENT.violet} onClick={autoDistribute}>
                    แบ่งอัตโนมัติ
                  </Button>
                </Stack>

                <Stack spacing={1.25}>
                  {criteria.map((c, i) => (
                    <Stack
                      key={c.id}
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.5}
                      sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
                    >
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
                        <Avatar variant="rounded" sx={{ width: 26, height: 26, fontSize: 12, fontWeight: 700, bgcolor: alpha(ACCENT.cyan, 0.16), color: ACCENT.cyan, borderRadius: 1.5 }}>
                          {i + 1}
                        </Avatar>
                        <Typography variant="body2" noWrap sx={{ minWidth: 0 }}>{c.label}</Typography>
                      </Stack>
                      <TextField
                        select
                        size="small"
                        label="ผู้ประเมิน"
                        value={draft.evaluators.includes(draft.topicOwner[c.label]) ? draft.topicOwner[c.label] : ''}
                        onChange={(e) => setTopicOwner(c.label, e.target.value)}
                        sx={{ minWidth: { xs: '100%', sm: 200 } }}
                      >
                        {draft.evaluators.map((ev) => (
                          <MenuItem key={ev} value={ev}>{ev}</MenuItem>
                        ))}
                      </TextField>
                    </Stack>
                  ))}
                </Stack>

                <Divider />

                {splitPreview.length > 0 && (
                  <Stack spacing={1}>
                    {splitPreview.map((s) => (
                      <Stack key={s.evaluator} direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                        <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: alpha(ACCENT.violet, 0.16), color: ACCENT.violet }}>
                          {initials(s.evaluator)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600, mr: 0.5 }}>{s.evaluator}</Typography>
                        <Chip label={`${s.topics.length} หัวข้อ`} color={ACCENT.violet} variant="soft" size="sm" />
                      </Stack>
                    ))}
                  </Stack>
                )}

                <Alert severity={allTopicsOwned ? 'success' : 'warning'} icon={<RuleIcon fontSize="inherit" />}>
                  {allTopicsOwned
                    ? <>มอบครบทั้ง {criteria.length} หัวข้อแล้ว — แต่ละหัวข้อมีผู้ประเมินเจ้าของเพียงคนเดียว</>
                    : 'ยังมีหัวข้อที่ยังไม่ได้มอบผู้ประเมิน — กด “แบ่งอัตโนมัติ” หรือเลือกให้ครบทุกหัวข้อ'}
                </Alert>
              </>
            )}
          </Stack>
        )}

        {/* ขั้นที่ 4 — กำหนดการ & ตรวจสอบ */}
        {step === 3 && (
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="วันที่มอบหมาย"
                type="date"
                size="small"
                fullWidth
                value={draft.assignedDate}
                onChange={(e) => set('assignedDate', e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="วันครบกำหนด"
                type="date"
                size="small"
                fullWidth
                value={draft.dueDate}
                onChange={(e) => set('dueDate', e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>

            <Card variant="outlined" sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.03) }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>ตรวจสอบ</Typography>
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
                    <Chip icon={DynamicFormIcon} label={form?.name ?? '—'} color={ACCENT.blue} variant="outlined" size="sm" />
                    <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                    <Chip icon={RuleIcon} label={rubric?.name ?? '—'} color={ACCENT.cyan} variant="outlined" size="sm" />
                    <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                    <Chip icon={GradeIcon} label={`คะแนน (${rubric ? FORMULA_META[rubric.formula].label : '—'})`} color={ACCENT.green} variant="soft" size="sm" />
                  </Stack>
                  <Divider />
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{draft.evaluators.length}</Typography>
                      <Typography variant="caption" color="text.secondary">ผู้ประเมิน</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{draft.targets.length}</Typography>
                      <Typography variant="caption" color="text.secondary">ผู้ถูกประเมิน</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{generated}</Typography>
                      <Typography variant="caption" color="text.secondary">งานที่จะสร้าง</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{mappedCriteria}</Typography>
                      <Typography variant="caption" color="text.secondary">เกณฑ์ที่ให้คะแนน</Typography>
                    </Grid>
                  </Grid>

                  {draft.splitByTopic && splitPreview.length > 0 && (
                    <>
                      <Divider />
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        <RuleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                          แบ่งหัวข้อระหว่างผู้ประเมิน (ไม่ทับกัน)
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                        {splitPreview.map((s) => (
                          <Chip
                            key={s.evaluator}
                            label={`${s.evaluator} · ${s.topics.length} หัวข้อ`}
                            color={ACCENT.violet}
                            variant="soft"
                            size="sm"
                          />
                        ))}
                      </Stack>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="ghost" color={ACCENT.violet} onClick={onClose}>ยกเลิก</Button>
        <Box sx={{ flexGrow: 1 }} />
        {step > 0 && <Button variant="outlined" color={ACCENT.violet} onClick={() => setStep((s) => s - 1)}>ย้อนกลับ</Button>}
        {step < STEPS.length - 1 ? (
          <Button variant="solid" disabled={!stepValid[step]} onClick={() => setStep((s) => s + 1)}>ถัดไป</Button>
        ) : (
          <Button variant="solid" disabled={!stepValid[3] || generated === 0} onClick={handleCreate}>
            สร้างการมอบหมาย
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// --- กล่องรายละเอียด --------------------------------------------------------

function DetailDialog({ a, onClose }: { a: Assignment | null; onClose: () => void }) {
  if (!a) return null;
  const form = getForm(a.formId);
  const rubric = getRubric(a.rubricId);
  const typeMeta = EVAL_TYPE_META[a.type];
  const total = taskCount(a);
  const pct = total === 0 ? 0 : Math.round((a.submitted / total) * 100);

  return (
    <Dialog open={Boolean(a)} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(typeMeta.color, 0.14), color: typeMeta.color, borderRadius: 2 }}>
            <AssignmentIndIcon />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{a.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {a.subjectCode} · {a.subject} · ประเภท{typeMeta.label}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ลำดับการให้คะแนน</Typography>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75, mt: 0.75, alignItems: 'center' }}>
              <Chip icon={DynamicFormIcon} label={form?.name ?? '—'} color={ACCENT.blue} variant="outlined" size="sm" />
              <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              <Chip icon={RuleIcon} label={rubric?.name ?? '—'} color={ACCENT.cyan} variant="outlined" size="sm" />
              <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              <Chip icon={GradeIcon} label={rubric ? `${FORMULA_META[rubric.formula].label} · ผ่าน ≥ ${rubric.passThreshold}%` : '—'} color={ACCENT.green} variant="soft" size="sm" />
            </Stack>
          </Box>

          <Box>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">ความคืบหน้า · {a.submitted}/{total} งาน</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>{pct}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 5 }} />
          </Box>

          <Grid container spacing={2}>
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                ผู้ประเมิน ({a.evaluators.length})
              </Typography>
              <Stack spacing={0.5} sx={{ mt: 0.75 }}>
                {a.evaluators.map((e) => (
                  <Stack key={e} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 10, bgcolor: alpha(typeMeta.color, 0.16), color: typeMeta.color }}>{initials(e)}</Avatar>
                    <Typography variant="body2" noWrap>{e}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                ผู้ถูกประเมิน ({a.targets.length})
              </Typography>
              <Stack spacing={0.5} sx={{ mt: 0.75 }}>
                {a.targets.map((t) => (
                  <Stack key={t} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <FlagIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                    <Typography variant="body2" noWrap>{t}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>

          {a.topicSplit && a.topicSplit.length > 0 && (
            <>
              <Divider />
              <Box>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 1 }}>
                  <RuleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    การแบ่งหัวข้อระหว่างผู้ประเมิน (ไม่ทับกัน)
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {a.topicSplit.map((s) => (
                    <Box key={s.evaluator}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                        <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: alpha(typeMeta.color, 0.16), color: typeMeta.color }}>
                          {initials(s.evaluator)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{s.evaluator}</Typography>
                        <Chip label={`${s.topics.length} หัวข้อ`} color={typeMeta.color} variant="soft" size="sm" />
                      </Stack>
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, pl: 3.75 }}>
                        {s.topics.map((t) => (
                          <Chip key={t} label={t} color={ACCENT.cyan} variant="outlined" size="sm" />
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </>
          )}

          <Divider />
          <Stack direction="row" spacing={2}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <EventIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">มอบหมาย {dateFmt.format(new Date(a.assignedDate))}</Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <PendingActionsIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">ครบกำหนด {dateFmt.format(new Date(a.dueDate))}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="ghost" color={ACCENT.violet} onClick={onClose}>ปิด</Button>
      </DialogActions>
    </Dialog>
  );
}

// --- หน้าเพจ -----------------------------------------------------------------

const TYPE_OPTIONS = [
  { value: 'all', label: 'ทุกประเภท' },
  ...(Object.keys(EVAL_TYPE_META) as EvalType[]).map((t) => ({ value: t, label: EVAL_TYPE_META[t].label })),
];
const STATUS_OPTIONS = [
  { value: 'all', label: 'ทุกสถานะ' },
  ...(Object.keys(ASSIGNMENT_STATUS_META) as AssignmentStatus[]).map((s) => ({ value: s, label: ASSIGNMENT_STATUS_META[s].label })),
];

export default function AssignmentPage() {
  const [assignments, setAssignments] = React.useState<Assignment[]>(ASSIGNMENTS);
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<'all' | EvalType>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | AssignmentStatus>('all');
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [wizardKey, setWizardKey] = React.useState(0);
  const [detail, setDetail] = React.useState<Assignment | null>(null);

  const openWizard = () => {
    setWizardKey((k) => k + 1);
    setWizardOpen(true);
  };

  const summary = React.useMemo(() => {
    const totalTasks = assignments.reduce((s, a) => s + taskCount(a), 0);
    const submitted = assignments.reduce((s, a) => s + a.submitted, 0);
    return {
      total: assignments.length,
      active: assignments.filter((a) => a.status === 'active').length,
      totalTasks,
      submitted,
      completion: totalTasks === 0 ? 0 : Math.round((submitted / totalTasks) * 100),
    };
  }, [assignments]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return assignments.filter(
      (a) =>
        (typeFilter === 'all' || a.type === typeFilter) &&
        (statusFilter === 'all' || a.status === statusFilter) &&
        (q === '' ||
          a.title.toLowerCase().includes(q) ||
          a.subject.toLowerCase().includes(q) ||
          a.subjectCode.toLowerCase().includes(q)),
    );
  }, [assignments, search, typeFilter, statusFilter]);

  const filtersActive = typeFilter !== 'all' || statusFilter !== 'all' || search.trim() !== '';
  const resetFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setSearch('');
  };

  const handleCreate = (a: Assignment) => {
    setAssignments((prev) => [a, ...prev]);
    setWizardOpen(false);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="การมอบหมายงานประเมิน"
        description="มอบหมายแบบฟอร์มและเกณฑ์ให้ผู้ประเมิน สร้างงานประเมินอัตโนมัติ และติดตามความคืบหน้า"
        actions={
          <Button variant="solid" startIcon={AddIcon} onClick={openWizard}>
            มอบหมายใหม่
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="การมอบหมายทั้งหมด" value={summary.total} icon={AssignmentIndIcon} color={ACCENT.violet} caption="ทุกสถานะ" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="กำลังดำเนินการ" value={summary.active} icon={PendingActionsIcon} color={ACCENT.blue} caption="ยังเปิดรับการประเมิน" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="งานที่สร้างทั้งหมด" value={summary.totalTasks} icon={PlaylistAddCheckIcon} color={ACCENT.cyan} caption={`ส่งแล้ว ${summary.submitted} งาน`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="ความคืบหน้าโดยรวม" value={`${summary.completion}%`} icon={TaskAltIcon} color={ACCENT.green} caption="งานที่ส่งต่องานทั้งหมด" />
        </Grid>
      </Grid>

      <PipelineStrip />

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'ค้นหาชื่อ, วิชา…' }}
        filters={[
          { key: 'type', label: 'ประเภท', value: typeFilter, onChange: (v) => setTypeFilter(v as typeof typeFilter), options: TYPE_OPTIONS },
          { key: 'status', label: 'สถานะ', value: statusFilter, onChange: (v) => setStatusFilter(v as typeof statusFilter), options: STATUS_OPTIONS },
        ]}
        onReset={resetFilters}
        active={filtersActive}
      />

      {filtered.length === 0 ? (
        <Card sx={softCard}>
          <CardContent>
            <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
              <AssignmentIndIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography variant="h6">ไม่พบการมอบหมายที่ตรงกับตัวกรอง</Typography>
              <Typography variant="body2" color="text.secondary">
                ลองสร้างการมอบหมายใหม่ หรือปรับตัวกรองด้านบน
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((a) => (
            <Grid key={a.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <AssignmentCard a={a} onView={setDetail} />
            </Grid>
          ))}
        </Grid>
      )}

      <CreateWizard key={wizardKey} open={wizardOpen} onClose={() => setWizardOpen(false)} onCreate={handleCreate} />
      <DetailDialog a={detail} onClose={() => setDetail(null)} />
    </Stack>
  );
}
