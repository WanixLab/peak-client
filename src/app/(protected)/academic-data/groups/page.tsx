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
  Grid,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import Button from '@/components/common/Button';
import Chip from '@/components/common/Chip';
import { ACCENT } from '@/theme/accents';
import { softCard, softCardHover } from '@/theme/surfaces';
import {
  EVAL_MODE_META,
  GROUPS as SEED_GROUPS,
  STUDENTS,
  SUBJECTS,
  membersOf,
  type Group,
  type Student,
  type Subject,
} from '@/data/academicData';

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

// เฉพาะวิชาที่เปิดให้ประเมินเป็นกลุ่ม (group หรือ both) เท่านั้นที่จัดกลุ่มได้
const GROUPABLE_SUBJECTS = SUBJECTS.filter((s) => s.evaluationMode !== 'individual');

interface GroupInput {
  code: string;
  name: string;
  memberIds: string[];
}
const emptyInput = (): GroupInput => ({ code: '', name: '', memberIds: [] });

/** กล่องเพิ่ม/แก้ไขกลุ่ม — remount ใหม่ทุกครั้งที่เปิด (ผ่าน `key`) เพื่อ seed จาก `initial` */
function GroupFormDialog({
  open,
  subject,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  subject: Subject | null;
  initial?: GroupInput;
  onClose: () => void;
  onSubmit: (input: GroupInput) => void;
}) {
  const [form, setForm] = React.useState<GroupInput>(initial ?? emptyInput());
  const [touched, setTouched] = React.useState(false);

  const codeError = touched && !form.code.trim();
  const nameError = touched && !form.name.trim();
  const selectedStudents = form.memberIds.map((id) => STUDENTS.find((s) => s.id === id)).filter((s): s is Student => Boolean(s));

  const submit = () => {
    setTouched(true);
    if (form.code.trim() && form.name.trim()) {
      onSubmit({ ...form, code: form.code.trim(), name: form.name.trim() });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initial ? 'แก้ไขกลุ่ม' : 'เพิ่มกลุ่ม'}
        {subject && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 400 }}>
            วิชา {subject.code} — {subject.name}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="รหัสกลุ่ม"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              required
              error={codeError}
              helperText={codeError ? 'กรุณากรอกรหัสกลุ่ม' : ' '}
              sx={{ maxWidth: { sm: 160 } }}
              fullWidth
              autoFocus
            />
            <TextField
              label="ชื่อกลุ่ม / หัวข้อโปรเจกต์"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              error={nameError}
              helperText={nameError ? 'กรุณากรอกชื่อกลุ่ม' : ' '}
              fullWidth
            />
          </Stack>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              สมาชิก
            </Typography>
            <Autocomplete
              multiple
              options={STUDENTS}
              value={selectedStudents}
              getOptionLabel={(s) => `${s.name} (${s.code})`}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              onChange={(_, v) => setForm((p) => ({ ...p, memberIds: v.map((s) => s.id) }))}
              renderInput={(params) => <TextField {...params} size="small" placeholder="เพิ่มสมาชิก…" />}
            />
            <Typography variant="caption" color="text.secondary">
              {form.memberIds.length} คนในกลุ่มนี้
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="ghost" color={ACCENT.violet} onClick={onClose}>
          ยกเลิก
        </Button>
        <Button variant="solid" onClick={submit}>
          บันทึก
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function GroupCard({ group, onEdit, onDelete }: { group: Group; onEdit: () => void; onDelete: () => void }) {
  const members = membersOf(group);
  return (
    <Card sx={[softCardHover, { height: '100%' }]}>
      <CardContent>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 1.5 }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(ACCENT.violet, 0.14), color: ACCENT.violet, width: 40, height: 40, borderRadius: 2 }}>
            <GroupsIcon />
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.25 }} noWrap>
              {group.code}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {group.name}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.25}>
            <Tooltip title="แก้ไข">
              <Box>
                <Button variant="ghost" color={ACCENT.violet} size="sm" iconOnly startIcon={EditIcon} aria-label="แก้ไข" onClick={onEdit} />
              </Box>
            </Tooltip>
            <Tooltip title="ลบ">
              <Box>
                <Button variant="ghost" color={ACCENT.pink} size="sm" iconOnly startIcon={DeleteIcon} aria-label="ลบ" onClick={onDelete} />
              </Box>
            </Tooltip>
          </Stack>
        </Stack>

        <AvatarGroup max={6} sx={{ justifyContent: 'flex-end', mb: 1, '& .MuiAvatar-root': { width: 30, height: 30, fontSize: 12 } }}>
          {members.map((m) => (
            <Tooltip key={m.id} title={`${m.name} (${m.code})`}>
              <Avatar sx={{ bgcolor: alpha(ACCENT.blue, 0.16), color: ACCENT.blue }}>{initials(m.name)}</Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>

        <Chip size="sm" variant="soft" icon={PeopleIcon} color={ACCENT.blue} label={`${members.length} คน`} />
      </CardContent>
    </Card>
  );
}

export default function GroupsPage() {
  const [groups, setGroups] = React.useState<Group[]>(SEED_GROUPS);
  const [subjectId, setSubjectId] = React.useState<string>(GROUPABLE_SUBJECTS[0]?.id ?? '');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Group | null>(null);
  const [toDelete, setToDelete] = React.useState<Group | null>(null);
  const [formKey, setFormKey] = React.useState(0);

  const subject = SUBJECTS.find((s) => s.id === subjectId) ?? null;
  const subjectGroups = React.useMemo(
    () => groups.filter((g) => g.subjectId === subjectId),
    [groups, subjectId],
  );

  const summary = React.useMemo(() => {
    const groupedStudentIds = new Set(groups.flatMap((g) => g.memberIds));
    const sizes = groups.map((g) => g.memberIds.length);
    return {
      totalGroups: groups.length,
      groupableSubjects: GROUPABLE_SUBJECTS.length,
      studentsGrouped: groupedStudentIds.size,
      avgSize: sizes.length === 0 ? 0 : Math.round((sizes.reduce((a, b) => a + b, 0) / sizes.length) * 10) / 10,
    };
  }, [groups]);

  const openAdd = () => {
    setEditing(null);
    setFormKey((k) => k + 1);
    setDialogOpen(true);
  };
  const openEdit = (group: Group) => {
    setEditing(group);
    setFormKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleSubmit = (input: GroupInput) => {
    setGroups((prev) =>
      editing
        ? prev.map((g) => (g.id === editing.id ? { ...g, ...input } : g))
        : [...prev, { ...input, id: `grp-${Date.now()}`, subjectId }],
    );
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (toDelete) setGroups((prev) => prev.filter((g) => g.id !== toDelete.id));
    setToDelete(null);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="กลุ่ม / ทีม"
        description="จัดกลุ่มนักศึกษารายวิชา — เฉพาะวิชาที่เปิดให้ประเมินเป็นกลุ่มเท่านั้นที่จัดกลุ่มได้ที่นี่"
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="กลุ่มทั้งหมด" value={summary.totalGroups} icon={GroupsIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="วิชาที่ใช้กลุ่ม" value={summary.groupableSubjects} icon={MenuBookIcon} color={ACCENT.cyan} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="นักศึกษาที่อยู่ในกลุ่ม" value={summary.studentsGrouped} icon={PeopleIcon} color={ACCENT.green} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="ขนาดกลุ่มเฉลี่ย" value={summary.avgSize} icon={BarChartIcon} color={ACCENT.amber} caption="คน / กลุ่ม" />
        </Grid>
      </Grid>

      <Card sx={softCard}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.25 }}>
            เลือกวิชา
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {GROUPABLE_SUBJECTS.map((s) => (
              <Chip
                key={s.id}
                label={`${s.code} — ${s.name}`}
                color={ACCENT.violet}
                variant={s.id === subjectId ? 'solid' : 'outlined'}
                selected={s.id === subjectId}
                onClick={() => setSubjectId(s.id)}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      {subject && (
        <>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {subject.code} — {subject.name}
            </Typography>
            <Chip label={EVAL_MODE_META[subject.evaluationMode].label} color={EVAL_MODE_META[subject.evaluationMode].color} variant="soft" size="sm" />
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="solid" startIcon={AddIcon} onClick={openAdd}>
              เพิ่มกลุ่ม
            </Button>
          </Stack>

          {subjectGroups.length === 0 ? (
            <Alert severity="info" icon={<GroupsIcon fontSize="inherit" />}>
              วิชานี้ยังไม่มีกลุ่ม — กด “เพิ่มกลุ่ม” เพื่อเริ่มจัดนักศึกษาเป็นทีม
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {subjectGroups.map((g) => (
                <Grid key={g.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <GroupCard group={g} onEdit={() => openEdit(g)} onDelete={() => setToDelete(g)} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <GroupFormDialog
        key={formKey}
        open={dialogOpen}
        subject={subject}
        initial={editing ? { code: editing.code, name: editing.name, memberIds: editing.memberIds } : undefined}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>ลบกลุ่ม</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            ลบกลุ่ม <strong>{toDelete?.code}</strong> — {toDelete?.name}? การกระทำนี้ย้อนกลับไม่ได้
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="ghost" color={ACCENT.violet} onClick={() => setToDelete(null)}>
            ยกเลิก
          </Button>
          <Button variant="solid" color={ACCENT.pink} onClick={handleDelete}>
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
