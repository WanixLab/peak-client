'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import LayersIcon from '@mui/icons-material/Layers';
import GradeIcon from '@mui/icons-material/Grade';
import RuleIcon from '@mui/icons-material/Rule';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import GroupsIcon from '@mui/icons-material/Groups';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import FilterBar from '@/components/common/FilterBar';
import Button from '@/components/common/Button';
import Chip from '@/components/common/Chip';
import { ACCENT } from '@/theme/accents';
import { softCard, softCardHover } from '@/theme/surfaces';
import {
  ASSIGNMENT_STATUS_META,
  EVAL_TYPE_META,
  FORMS,
  formUsage,
  getRubric,
  rubricsForForm,
  taskCount,
  type Assignment,
  type FormCategory,
  type FormSummary,
} from '@/data/formManagement';

const dateFmt = new Intl.DateTimeFormat('th-TH-u-ca-gregory', { day: 'numeric', month: 'short', year: 'numeric' });

const CATEGORY_LABEL: Record<FormCategory, string> = {
  'Project Evaluation': 'ประเมินโปรเจกต์',
  'Self-Assessment': 'ประเมินตนเอง',
  'Peer Review': 'เพื่อนประเมิน',
  'Advisor Review': 'ที่ปรึกษาประเมิน',
  Survey: 'แบบสำรวจ',
};

const CATEGORY_COLOR: Record<FormCategory, string> = {
  'Project Evaluation': ACCENT.violet,
  'Self-Assessment': ACCENT.cyan,
  'Peer Review': ACCENT.blue,
  'Advisor Review': ACCENT.green,
  Survey: ACCENT.amber,
};

/** เขียว = ครบ, ส้ม = กำลังตอบ, ชมพู = ยังไม่มีใครตอบ */
const rateColor = (rate: number, hasTasks: boolean) =>
  !hasTasks ? ACCENT.violet : rate >= 100 ? ACCENT.green : rate > 0 ? ACCENT.amber : ACCENT.pink;

// --- แถบความคืบหน้าการตอบ ----------------------------------------------------

function ResponseBar({ submitted, total }: { submitted: number; total: number }) {
  const rate = total === 0 ? 0 : Math.round((submitted / total) * 100);
  const color = rateColor(rate, total > 0);
  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5, alignItems: 'baseline' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
          ความคืบหน้าการตอบ
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, color }}>
          {total === 0 ? 'ยังไม่มีการมอบหมาย' : `${submitted}/${total} · ${rate}%`}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={total === 0 ? 0 : rate}
        sx={{
          height: 8,
          borderRadius: 5,
          bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 5 },
        }}
      />
    </Box>
  );
}

// --- การ์ดฟอร์ม -------------------------------------------------------------

function FormCard({ form, onDetails }: { form: FormSummary; onDetails: () => void }) {
  const usage = formUsage(form.id);
  const rubricCount = rubricsForForm(form.id).length;
  const catColor = CATEGORY_COLOR[form.category];

  return (
    <Card sx={[softCardHover, { height: '100%', display: 'flex', flexDirection: 'column' }]}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 1.5 }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(catColor, 0.14), color: catColor, width: 44, height: 44, borderRadius: 2 }}>
            <DynamicFormIcon />
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.25 }}>{form.name}</Typography>
            <Chip label={CATEGORY_LABEL[form.category]} color={catColor} variant="plain" size="sm" />
          </Box>
          <Chip
            label={form.status === 'published' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
            color={form.status === 'published' ? ACCENT.green : ACCENT.violet}
            variant={form.status === 'published' ? 'solid' : 'soft'}
            size="sm"
          />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip icon={ViewAgendaIcon} label={`${form.sections} ส่วน`} color={ACCENT.violet} variant="outlined" size="sm" />
          <Chip icon={LayersIcon} label={`${form.totalFields} ช่อง`} color={ACCENT.blue} variant="outlined" size="sm" />
          <Chip icon={GradeIcon} label={`${form.scorableFields.length} ช่องคะแนน`} color={ACCENT.amber} variant="outlined" size="sm" />
          <Chip icon={RuleIcon} label={`${rubricCount} เกณฑ์`} color={ACCENT.cyan} variant="outlined" size="sm" />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
          <AssignmentIndIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            ใช้ใน <strong>{usage.assignments.length}</strong> การมอบหมาย
          </Typography>
          {usage.activeAssignments > 0 && (
            <Chip label={`${usage.activeAssignments} กำลังทำงาน`} color={ACCENT.green} variant="soft" size="sm" />
          )}
        </Stack>

        <ResponseBar submitted={usage.submitted} total={usage.totalTasks} />

        <Box sx={{ flexGrow: 1, minHeight: 12 }} />

        <Divider sx={{ mb: 1.5 }} />
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button variant="solid" color={catColor} startIcon={VisibilityIcon} onClick={onDetails} fullWidth>
            ดูรายละเอียด
          </Button>
          <Tooltip title="แก้ไขในตัวสร้างฟอร์ม">
            <Box component={Link} href="/forms/builder" sx={{ display: 'inline-flex', textDecoration: 'none' }}>
              <Button variant="ghost" color={ACCENT.violet} iconOnly aria-label="แก้ไข">
                <EditIcon sx={{ fontSize: 18 }} />
              </Button>
            </Box>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}

// --- แถวการมอบหมายในกล่องรายละเอียด ------------------------------------------

function AssignmentRow({ assignment }: { assignment: Assignment }) {
  const total = taskCount(assignment);
  const rate = total === 0 ? 0 : Math.round((assignment.submitted / total) * 100);
  const statusMeta = ASSIGNMENT_STATUS_META[assignment.status];
  const typeMeta = EVAL_TYPE_META[assignment.type];
  const color = rateColor(rate, total > 0);

  return (
    <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' }, mb: 1.5 }}>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>{assignment.title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {assignment.subjectCode} · {assignment.subject}
          </Typography>
        </Box>
        <Chip label={typeMeta.label} color={typeMeta.color} variant="soft" size="sm" />
        <Chip label={statusMeta.label} color={statusMeta.color} variant="outlined" size="sm" />
      </Stack>

      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1, mb: 1.5, color: 'text.secondary' }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <HowToRegIcon sx={{ fontSize: 15 }} />
          <Typography variant="caption">ผู้ประเมิน {assignment.evaluators.length}</Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <GroupsIcon sx={{ fontSize: 15 }} />
          <Typography variant="caption">เป้าหมาย {assignment.targets.length}</Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <EventIcon sx={{ fontSize: 15 }} />
          <Typography variant="caption">กำหนดส่ง {dateFmt.format(new Date(assignment.dueDate))}</Typography>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <LinearProgress
          variant="determinate"
          value={total === 0 ? 0 : rate}
          sx={{
            flexGrow: 1,
            height: 7,
            borderRadius: 5,
            bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
            '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 5 },
          }}
        />
        <Typography variant="caption" sx={{ fontWeight: 700, color, whiteSpace: 'nowrap' }}>
          {assignment.submitted}/{total} · {rate}%
        </Typography>
      </Stack>
    </Box>
  );
}

// --- กล่องรายละเอียดฟอร์ม ----------------------------------------------------

function FormDetailsDialog({ form, onClose }: { form: FormSummary | null; onClose: () => void }) {
  const open = Boolean(form);
  const usage = form ? formUsage(form.id) : null;
  const rubrics = form ? rubricsForForm(form.id) : [];
  const catColor = form ? CATEGORY_COLOR[form.category] : ACCENT.violet;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper" slotProps={{ paper: { sx: { borderRadius: 3, overflow: 'hidden' } } }}>
      {form && usage && (
        <>
          <Box sx={{ position: 'relative', px: 3, py: 2.5, color: 'common.white', background: `linear-gradient(135deg, ${catColor}, ${alpha(catColor, 0.8)})` }}>
            <IconButton onClick={onClose} aria-label="ปิด" size="small" sx={{ position: 'absolute', top: 12, right: 12, color: alpha('#fff', 0.9), '&:hover': { bgcolor: alpha('#fff', 0.15) } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Avatar variant="rounded" sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff', width: 46, height: 46, borderRadius: 2 }}>
                <DynamicFormIcon />
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{form.name}</Typography>
                <Typography variant="caption" sx={{ color: alpha('#fff', 0.92) }}>
                  {CATEGORY_LABEL[form.category]} · {form.sections} ส่วน · {form.totalFields} ช่อง · {form.status === 'published' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={2} sx={{ mb: 1 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Stack sx={{ alignItems: 'center', py: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{usage.assignments.length}</Typography>
                  <Typography variant="caption" color="text.secondary">การมอบหมาย</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Stack sx={{ alignItems: 'center', py: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: ACCENT.green }}>{usage.activeAssignments}</Typography>
                  <Typography variant="caption" color="text.secondary">กำลังทำงาน</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Stack sx={{ alignItems: 'center', py: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{usage.submitted}/{usage.totalTasks}</Typography>
                  <Typography variant="caption" color="text.secondary">ตอบแล้ว/ทั้งหมด</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Stack sx={{ alignItems: 'center', py: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: rateColor(usage.responseRate, usage.totalTasks > 0) }}>
                    {usage.responseRate}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">อัตราการตอบ</Typography>
                </Stack>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* ช่องที่ให้คะแนน + เกณฑ์ที่ผูก */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>ช่องที่ให้คะแนนได้ ({form.scorableFields.length})</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
              {form.scorableFields.length === 0 ? (
                <Typography variant="body2" color="text.disabled">ไม่มีช่องให้คะแนนในฟอร์มนี้</Typography>
              ) : (
                form.scorableFields.map((f) => (
                  <Chip key={f.id} icon={GradeIcon} label={`${f.label} · 1–${f.scaleMax}`} color={ACCENT.amber} variant="soft" size="sm" />
                ))
              )}
            </Stack>
            {rubrics.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', fontWeight: 700 }}>เกณฑ์ที่ผูก:</Typography>
                {rubrics.map((r) => (
                  <Chip key={r.id} icon={RuleIcon} label={r.name} color={r.status === 'active' ? ACCENT.green : ACCENT.violet} variant="outlined" size="sm" />
                ))}
              </Stack>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              การมอบหมายที่ใช้ฟอร์มนี้ ({usage.assignments.length})
            </Typography>
            {usage.assignments.length === 0 ? (
              <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, py: 4, textAlign: 'center', color: 'text.secondary' }}>
                <AssignmentIndIcon sx={{ fontSize: 36, opacity: 0.4 }} />
                <Typography variant="body2" sx={{ mt: 0.5 }}>ยังไม่ถูกนำไปใช้ในการมอบหมายใด</Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {usage.assignments.map((a) => (
                  <AssignmentRow key={a.id} assignment={a} />
                ))}
              </Stack>
            )}
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}

// --- หน้าเพจ -----------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'ทุกสถานะ' },
  { value: 'published', label: 'เผยแพร่แล้ว' },
  { value: 'draft', label: 'ฉบับร่าง' },
];

export default function FormListPage() {
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [details, setDetails] = React.useState<FormSummary | null>(null);

  const summary = React.useMemo(() => {
    const totals = FORMS.reduce(
      (acc, f) => {
        const u = formUsage(f.id);
        acc.submitted += u.submitted;
        acc.tasks += u.totalTasks;
        acc.active += u.activeAssignments;
        return acc;
      },
      { submitted: 0, tasks: 0, active: 0 },
    );
    return {
      total: FORMS.length,
      published: FORMS.filter((f) => f.status === 'published').length,
      active: totals.active,
      responseRate: totals.tasks === 0 ? 0 : Math.round((totals.submitted / totals.tasks) * 100),
    };
  }, []);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return FORMS.filter(
      (f) =>
        (category === 'all' || f.category === category) &&
        (status === 'all' || f.status === status) &&
        (q === '' || f.name.toLowerCase().includes(q) || CATEGORY_LABEL[f.category].includes(q)),
    );
  }, [search, category, status]);

  const filtersActive = category !== 'all' || status !== 'all' || search.trim() !== '';
  const resetFilters = () => {
    setCategory('all');
    setStatus('all');
    setSearch('');
  };

  const CATEGORY_OPTIONS = [
    { value: 'all', label: 'ทุกหมวด' },
    ...(Object.keys(CATEGORY_LABEL) as FormCategory[]).map((c) => ({ value: c, label: CATEGORY_LABEL[c] })),
  ];

  return (
    <Stack spacing={3}>
      <PageHeader
        title="รายการฟอร์ม"
        description="ดูภาพรวมว่าฟอร์มไหนกำลังใช้งาน มีใครตอบครบแล้วบ้าง และเจาะดูรายละเอียดการมอบหมายของแต่ละฟอร์ม"
        actions={
          <Box component={Link} href="/forms/builder" sx={{ textDecoration: 'none' }}>
            <Button variant="solid" color={ACCENT.violet} startIcon={AddIcon}>
              สร้างแบบฟอร์ม
            </Button>
          </Box>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="ฟอร์มทั้งหมด" value={summary.total} icon={DynamicFormIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="เผยแพร่แล้ว" value={summary.published} icon={CheckCircleIcon} color={ACCENT.green} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="การมอบหมายที่ทำงานอยู่" value={summary.active} icon={PlayCircleIcon} color={ACCENT.blue} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="อัตราการตอบรวม" value={`${summary.responseRate}%`} icon={HowToRegIcon} color={ACCENT.amber} caption="ทุกฟอร์มรวมกัน" />
        </Grid>
      </Grid>

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'ค้นหาชื่อฟอร์ม…' }}
        filters={[
          { key: 'category', label: 'หมวด', value: category, onChange: setCategory, options: CATEGORY_OPTIONS, minWidth: 190 },
          { key: 'status', label: 'สถานะ', value: status, onChange: setStatus, options: STATUS_OPTIONS },
        ]}
        onReset={resetFilters}
        active={filtersActive}
      />

      {filtered.length === 0 ? (
        <Card sx={softCard}>
          <CardContent>
            <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
              <DynamicFormIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography variant="h6">ไม่พบฟอร์มที่ตรงกับตัวกรอง</Typography>
              <Typography variant="body2" color="text.secondary">ปรับตัวกรองด้านบน หรือสร้างแบบฟอร์มใหม่</Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((form) => (
            <Grid key={form.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <FormCard form={form} onDetails={() => setDetails(form)} />
            </Grid>
          ))}
        </Grid>
      )}

      <FormDetailsDialog form={details} onClose={() => setDetails(null)} />
    </Stack>
  );
}
