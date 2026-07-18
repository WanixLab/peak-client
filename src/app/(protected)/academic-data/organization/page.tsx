'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BadgeIcon from '@mui/icons-material/Badge';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import Button from '@/components/common/Button';
import Chip from '@/components/common/Chip';
import { ACCENT } from '@/theme/accents';
import { softCard } from '@/theme/surfaces';
import { ORGANIZATION, STUDENTS, SUBJECTS, flattenOrg, type OrgUnit } from '@/data/academicData';

const studentCount = (departmentId: string) => STUDENTS.filter((s) => s.departmentId === departmentId).length;
const subjectCount = (departmentId: string) => SUBJECTS.filter((s) => s.departmentId === departmentId).length;

const countStudents = (unit: OrgUnit): number =>
  (unit.kind === 'department' ? studentCount(unit.id) : 0) +
  (unit.children?.reduce((sum, c) => sum + countStudents(c), 0) ?? 0);

// --- ยูทิลปรับต้นไม้แบบ immutable (คณะ → สาขา) --------------------------------

/** ใส่ node ใหม่ — ถ้ามี parentId จะเพิ่มเป็นลูกของ parent นั้น ไม่งั้นเพิ่มเป็นคณะระดับบน */
const insertNode = (tree: OrgUnit[], node: OrgUnit, parentId?: string): OrgUnit[] => {
  if (!parentId) return [...tree, node];
  return tree.map((u) =>
    u.id === parentId
      ? { ...u, children: [...(u.children ?? []), node] }
      : u.children
        ? { ...u, children: insertNode(u.children, node, parentId) }
        : u,
  );
};

/** อัปเดตฟิลด์ของ node ตาม id (ชื่อ/หัวหน้า) */
const updateNode = (tree: OrgUnit[], id: string, patch: Partial<OrgUnit>): OrgUnit[] =>
  tree.map((u) =>
    u.id === id
      ? { ...u, ...patch }
      : u.children
        ? { ...u, children: updateNode(u.children, id, patch) }
        : u,
  );

/** ลบ node ตาม id (พร้อมลูกทั้งหมด) */
const removeNode = (tree: OrgUnit[], id: string): OrgUnit[] =>
  tree
    .filter((u) => u.id !== id)
    .map((u) => (u.children ? { ...u, children: removeNode(u.children, id) } : u));

// --- กล่องเพิ่ม/แก้ไขหน่วยงาน -------------------------------------------------

interface UnitDraft {
  name: string;
  kind: OrgUnit['kind'];
  head: string;
  parentId: string; // '' = คณะระดับบน
}

function UnitFormDialog({
  open,
  mode,
  initial,
  faculties,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: 'add' | 'edit';
  initial: UnitDraft;
  /** คณะที่เลือกเป็นสังกัดได้ (ตอนเพิ่มสาขา) */
  faculties: OrgUnit[];
  onClose: () => void;
  onSubmit: (draft: UnitDraft) => void;
}) {
  const [form, setForm] = React.useState<UnitDraft>(initial);
  const [touched, setTouched] = React.useState(false);

  const nameError = touched && !form.name.trim();
  const isDepartment = form.kind === 'department';

  const submit = () => {
    setTouched(true);
    if (form.name.trim()) onSubmit({ ...form, name: form.name.trim(), head: form.head.trim() });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'edit' ? 'แก้ไขหน่วยงาน' : 'เพิ่มหน่วยงาน'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {mode === 'add' && (
            <TextField
              select
              label="ประเภท"
              value={form.kind}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  kind: e.target.value as OrgUnit['kind'],
                  // คณะไม่มีสังกัด, สาขาต้องเลือกคณะ
                  parentId: e.target.value === 'faculty' ? '' : p.parentId || faculties[0]?.id || '',
                }))
              }
              fullWidth
            >
              <MenuItem value="faculty">คณะ</MenuItem>
              <MenuItem value="department" disabled={faculties.length === 0}>
                สาขา
              </MenuItem>
            </TextField>
          )}

          {isDepartment && mode === 'add' && (
            <TextField
              select
              label="สังกัดคณะ"
              value={form.parentId}
              onChange={(e) => setForm((p) => ({ ...p, parentId: e.target.value }))}
              fullWidth
            >
              {faculties.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label={isDepartment ? 'ชื่อสาขา' : 'ชื่อคณะ'}
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            error={nameError}
            helperText={nameError ? 'กรุณากรอกชื่อหน่วยงาน' : ' '}
            fullWidth
            autoFocus
          />

          <TextField
            label={isDepartment ? 'หัวหน้าสาขา' : 'คณบดี'}
            value={form.head}
            onChange={(e) => setForm((p) => ({ ...p, head: e.target.value }))}
            fullWidth
          />
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

export default function OrganizationPage() {
  const [organization, setOrganization] = React.useState<OrgUnit[]>(ORGANIZATION);

  const all = React.useMemo(() => flattenOrg(organization), [organization]);
  const faculties = React.useMemo(() => organization.filter((u) => u.kind === 'faculty'), [organization]);
  const summary = {
    faculties: all.filter((u) => u.kind === 'faculty').length,
    departments: all.filter((u) => u.kind === 'department').length,
    students: STUDENTS.length,
    subjects: SUBJECTS.length,
  };

  // คณะเปิดไว้เป็นค่าเริ่มต้น ให้เห็นโครงสร้างทั้งหมดตั้งแต่แรก
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set(ORGANIZATION.map((f) => f.id)));
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // dialog เพิ่ม/แก้ไข
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<'add' | 'edit'>('add');
  const [editing, setEditing] = React.useState<OrgUnit | null>(null);
  const [draft, setDraft] = React.useState<UnitDraft>({ name: '', kind: 'faculty', head: '', parentId: '' });
  const [formKey, setFormKey] = React.useState(0);
  const [toDelete, setToDelete] = React.useState<OrgUnit | null>(null);

  const openAdd = () => {
    setDialogMode('add');
    setEditing(null);
    setDraft({
      name: '',
      kind: faculties.length === 0 ? 'faculty' : 'faculty',
      head: '',
      parentId: '',
    });
    setFormKey((k) => k + 1);
    setDialogOpen(true);
  };

  const openEdit = (unit: OrgUnit) => {
    setDialogMode('edit');
    setEditing(unit);
    setDraft({ name: unit.name, kind: unit.kind, head: unit.head ?? '', parentId: '' });
    setFormKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleSubmit = (d: UnitDraft) => {
    if (dialogMode === 'edit' && editing) {
      setOrganization((prev) => updateNode(prev, editing.id, { name: d.name, head: d.head || undefined }));
    } else {
      const node: OrgUnit = {
        id: `org-${Date.now()}`,
        name: d.name,
        kind: d.kind,
        head: d.head || undefined,
        ...(d.kind === 'faculty' ? { children: [] } : {}),
      };
      const parentId = d.kind === 'department' ? d.parentId : undefined;
      setOrganization((prev) => insertNode(prev, node, parentId));
      if (parentId) setExpanded((prev) => new Set(prev).add(parentId));
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (toDelete) setOrganization((prev) => removeNode(prev, toDelete.id));
    setToDelete(null);
  };

  const renderNode = (unit: OrgUnit, depth: number) => {
    const hasChildren = Boolean(unit.children?.length);
    const isOpen = expanded.has(unit.id);
    const isFaculty = unit.kind === 'faculty';
    const accent = isFaculty ? ACCENT.violet : ACCENT.blue;
    const childCount = countStudents(unit);

    return (
      <Box key={unit.id}>
        <Stack
          direction="row"
          spacing={1.5}
          onClick={hasChildren ? () => toggle(unit.id) : undefined}
          sx={{
            alignItems: 'center',
            py: 1,
            pr: 1,
            pl: 1 + depth * 3,
            borderRadius: 2,
            cursor: hasChildren ? 'pointer' : 'default',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Box sx={{ width: 24, display: 'flex', justifyContent: 'center', color: 'text.secondary' }}>
            {hasChildren ? (
              isOpen ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />
            ) : null}
          </Box>
          <Avatar variant="rounded" sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha(accent, 0.12), color: accent }}>
            {isFaculty ? <BusinessIcon fontSize="small" /> : <GroupsIcon fontSize="small" />}
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography sx={{ fontWeight: isFaculty ? 700 : 600 }} noWrap>
              {unit.name}
            </Typography>
            {unit.head && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                <BadgeIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption">{unit.head}</Typography>
              </Stack>
            )}
          </Box>
          {!isFaculty && (
            <Chip size="sm" variant="outlined" icon={MenuBookIcon} color={ACCENT.cyan} label={`${subjectCount(unit.id)} วิชา`} />
          )}
          <Chip size="sm" variant="outlined" icon={PeopleIcon} color={accent} label={`${childCount} คน`} />
          <Tooltip title="แก้ไข">
            <span>
              <Button
                variant="ghost"
                color={ACCENT.violet}
                size="sm"
                iconOnly
                startIcon={EditIcon}
                aria-label="แก้ไข"
                onClick={(e) => {
                  e.stopPropagation();
                  openEdit(unit);
                }}
              />
            </span>
          </Tooltip>
          <Tooltip title="ลบ">
            <span>
              <Button
                variant="ghost"
                color={ACCENT.pink}
                size="sm"
                iconOnly
                startIcon={DeleteIcon}
                aria-label="ลบ"
                onClick={(e) => {
                  e.stopPropagation();
                  setToDelete(unit);
                }}
              />
            </span>
          </Tooltip>
        </Stack>

        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            {unit.children!.map((child) => renderNode(child, depth + 1))}
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="โครงสร้างองค์กร"
        description="คณะ สาขา และผู้รับผิดชอบ — ใช้เป็นฐานอ้างอิงสำหรับวิชาและนักศึกษาทั้งระบบ"
        actions={
          <Button variant="solid" startIcon={AddIcon} onClick={openAdd}>
            เพิ่มหน่วยงาน
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="คณะ" value={summary.faculties} icon={BusinessIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="สาขา" value={summary.departments} icon={AccountTreeIcon} color={ACCENT.blue} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="นักศึกษาทั้งหมด" value={summary.students} icon={PeopleIcon} color={ACCENT.green} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="วิชาทั้งหมด" value={summary.subjects} icon={MenuBookIcon} color={ACCENT.amber} />
        </Grid>
      </Grid>

      <Card sx={softCard}>
        <CardContent>
          {organization.length > 0 ? (
            <Stack>{organization.map((faculty) => renderNode(faculty, 0))}</Stack>
          ) : (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              ยังไม่มีหน่วยงาน — กด “เพิ่มหน่วยงาน” เพื่อเริ่มต้น
            </Typography>
          )}
        </CardContent>
      </Card>

      <UnitFormDialog
        key={formKey}
        open={dialogOpen}
        mode={dialogMode}
        initial={draft}
        faculties={faculties}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>ลบหน่วยงาน</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ลบ <strong>{toDelete?.name}</strong>
            {toDelete?.children?.length ? ` พร้อมสาขาย่อยอีก ${toDelete.children.length} รายการ` : ''}? การกระทำนี้ย้อนกลับไม่ได้
          </DialogContentText>
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
