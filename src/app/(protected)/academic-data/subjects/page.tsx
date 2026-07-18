'use client';

import * as React from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import FilterBar from '@/components/common/FilterBar';
import Button from '@/components/common/Button';
import Chip from '@/components/common/Chip';
import { ACCENT } from '@/theme/accents';
import {
  DEPARTMENTS,
  EVAL_MODE_META,
  SUBJECTS,
  departmentName,
  evaluationsOfSubject,
  type EvaluationMode,
  type Subject,
} from '@/data/academicData';

type SubjectInput = Omit<Subject, 'id'>;
const EMPTY: SubjectInput = {
  code: '',
  name: '',
  credits: 3,
  departmentId: DEPARTMENTS[0].id,
  instructor: '',
  status: 'published',
  evaluationMode: 'individual',
};

/** กล่องเพิ่ม/แก้ไขวิชา — remount ใหม่ทุกครั้งที่เปิด (ผ่าน `key`) เพื่อ seed จาก `initial` */
function SubjectFormDialog({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: SubjectInput;
  onClose: () => void;
  onSubmit: (input: SubjectInput) => void;
}) {
  const [form, setForm] = React.useState<SubjectInput>(initial ?? EMPTY);
  const [touched, setTouched] = React.useState(false);

  const codeError = touched && !form.code.trim();
  const nameError = touched && !form.name.trim();

  const submit = () => {
    setTouched(true);
    if (form.code.trim() && form.name.trim()) {
      onSubmit({ ...form, code: form.code.trim().toUpperCase(), name: form.name.trim() });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? 'แก้ไขวิชา' : 'เพิ่มวิชา'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="รหัสวิชา"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              required
              error={codeError}
              helperText={codeError ? 'กรุณากรอกรหัสวิชา' : ' '}
              sx={{ maxWidth: { sm: 160 } }}
              fullWidth
              autoFocus
            />
            <TextField
              label="หน่วยกิต"
              type="number"
              value={form.credits}
              onChange={(e) => setForm((p) => ({ ...p, credits: Number(e.target.value) }))}
              sx={{ maxWidth: { sm: 120 } }}
              slotProps={{ htmlInput: { min: 0, max: 12 } }}
            />
          </Stack>
          <TextField
            label="ชื่อวิชา"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            error={nameError}
            helperText={nameError ? 'กรุณากรอกชื่อวิชา' : ' '}
            fullWidth
          />
          <TextField
            select
            label="สาขา"
            value={form.departmentId}
            onChange={(e) => setForm((p) => ({ ...p, departmentId: e.target.value }))}
            fullWidth
          >
            {DEPARTMENTS.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="ผู้สอน"
            value={form.instructor}
            onChange={(e) => setForm((p) => ({ ...p, instructor: e.target.value }))}
            fullWidth
          />
          <TextField
            select
            label="รูปแบบการประเมิน"
            value={form.evaluationMode}
            onChange={(e) => setForm((p) => ({ ...p, evaluationMode: e.target.value as EvaluationMode }))}
            helperText={EVAL_MODE_META[form.evaluationMode].description}
            fullWidth
          >
            {(Object.keys(EVAL_MODE_META) as EvaluationMode[]).map((m) => (
              <MenuItem key={m} value={m}>
                {EVAL_MODE_META[m].label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="สถานะ"
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as Subject['status'] }))}
            fullWidth
          >
            <MenuItem value="published">เผยแพร่แล้ว</MenuItem>
            <MenuItem value="draft">ฉบับร่าง</MenuItem>
          </TextField>
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

export default function SubjectsPage() {
  const [subjects, setSubjects] = React.useState<Subject[]>(SUBJECTS);
  const [search, setSearch] = React.useState('');
  const [dept, setDept] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [mode, setMode] = React.useState('all');

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Subject | null>(null);
  const [toDelete, setToDelete] = React.useState<Subject | null>(null);
  const [formKey, setFormKey] = React.useState(0);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return subjects.filter(
      (s) =>
        (dept === 'all' || s.departmentId === dept) &&
        (status === 'all' || s.status === status) &&
        (mode === 'all' || s.evaluationMode === mode) &&
        (q === '' ||
          s.code.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.instructor.toLowerCase().includes(q)),
    );
  }, [subjects, search, dept, status, mode]);

  const summary = React.useMemo(
    () => ({
      total: subjects.length,
      published: subjects.filter((s) => s.status === 'published').length,
      groupMode: subjects.filter((s) => s.evaluationMode !== 'individual').length,
      evaluations: subjects.reduce((sum, s) => sum + evaluationsOfSubject(s).length, 0),
    }),
    [subjects],
  );

  const openAdd = () => {
    setEditing(null);
    setFormKey((k) => k + 1);
    setDialogOpen(true);
  };
  const openEdit = (subject: Subject) => {
    setEditing(subject);
    setFormKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleSubmit = (input: SubjectInput) => {
    setSubjects((prev) =>
      editing
        ? prev.map((s) => (s.id === editing.id ? { ...s, ...input } : s))
        : [...prev, { ...input, id: `subj-${Date.now()}` }],
    );
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (toDelete) setSubjects((prev) => prev.filter((s) => s.id !== toDelete.id));
    setToDelete(null);
  };

  const columns = React.useMemo<GridColDef<Subject>[]>(
    () => [
      {
        field: 'code',
        headerName: 'รหัส',
        width: 110,
        renderCell: (params: GridRenderCellParams<Subject>) => (
          <Chip size="sm" label={params.row.code} variant="outlined" color={ACCENT.blue} />
        ),
      },
      { field: 'name', headerName: 'ชื่อวิชา', flex: 1.4, minWidth: 220 },
      { field: 'credits', headerName: 'หน่วยกิต', width: 90, type: 'number', align: 'center', headerAlign: 'center' },
      {
        field: 'departmentId',
        headerName: 'สาขา',
        flex: 1,
        minWidth: 170,
        valueGetter: (_, row) => departmentName(row.departmentId),
      },
      { field: 'instructor', headerName: 'ผู้สอน', flex: 1, minWidth: 150 },
      {
        field: 'evaluationMode',
        headerName: 'รูปแบบประเมิน',
        width: 140,
        renderCell: (params: GridRenderCellParams<Subject>) => {
          const meta = EVAL_MODE_META[params.row.evaluationMode];
          return <Chip size="sm" label={meta.label} color={meta.color} variant="soft" />;
        },
      },
      {
        field: 'evaluations',
        headerName: 'การประเมิน',
        width: 130,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<Subject>) => {
          const n = evaluationsOfSubject(params.row).length;
          return (
            <Chip
              size="sm"
              icon={AssignmentIndIcon}
              label={`${n} รายการ`}
              color={n > 0 ? ACCENT.green : ACCENT.pink}
              variant={n > 0 ? 'soft' : 'outlined'}
            />
          );
        },
      },
      {
        field: 'status',
        headerName: 'สถานะ',
        width: 120,
        renderCell: (params: GridRenderCellParams<Subject>) =>
          params.row.status === 'published' ? (
            <Chip size="sm" label="เผยแพร่แล้ว" color={ACCENT.green} variant="solid" />
          ) : (
            <Chip size="sm" label="ฉบับร่าง" color={ACCENT.amber} variant="outlined" />
          ),
      },
      {
        field: 'actions',
        headerName: 'จัดการ',
        width: 100,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params: GridRenderCellParams<Subject>) => (
          <Box>
            <Tooltip title="แก้ไข">
              <IconButton size="small" onClick={() => openEdit(params.row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="ลบ">
              <IconButton size="small" color="error" onClick={() => setToDelete(params.row)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [],
  );

  const filtersActive = dept !== 'all' || status !== 'all' || mode !== 'all' || search.trim() !== '';
  const resetFilters = () => {
    setDept('all');
    setStatus('all');
    setMode('all');
    setSearch('');
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="รายวิชา"
        description="ทะเบียนวิชาที่ใช้ทั่วระบบ — 1 วิชามีได้หลายการประเมิน และกำหนดได้ว่าประเมินรายบุคคลหรือเป็นกลุ่ม"
        actions={
          <Button variant="solid" startIcon={AddIcon} onClick={openAdd}>
            เพิ่มวิชา
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="วิชาทั้งหมด" value={summary.total} icon={MenuBookIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="เผยแพร่แล้ว" value={summary.published} icon={CheckCircleIcon} color={ACCENT.green} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="ประเมินเป็นกลุ่ม" value={summary.groupMode} icon={GroupsIcon} color={ACCENT.cyan} caption="รวมโหมด “ได้ทั้งสองแบบ”" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="การประเมินทั้งหมด" value={summary.evaluations} icon={AssignmentIndIcon} color={ACCENT.amber} caption="รวมทุกวิชา" />
        </Grid>
      </Grid>

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'ค้นหารหัส ชื่อวิชา ผู้สอน…' }}
        filters={[
          {
            key: 'dept',
            label: 'สาขา',
            value: dept,
            onChange: setDept,
            minWidth: 190,
            options: [{ value: 'all', label: 'ทุกสาขา' }, ...DEPARTMENTS.map((d) => ({ value: d.id, label: d.name }))],
          },
          {
            key: 'mode',
            label: 'รูปแบบประเมิน',
            value: mode,
            onChange: setMode,
            minWidth: 170,
            options: [
              { value: 'all', label: 'ทุกรูปแบบ' },
              ...(Object.keys(EVAL_MODE_META) as EvaluationMode[]).map((m) => ({ value: m, label: EVAL_MODE_META[m].label })),
            ],
          },
          {
            key: 'status',
            label: 'สถานะ',
            value: status,
            onChange: setStatus,
            minWidth: 150,
            options: [
              { value: 'all', label: 'ทุกสถานะ' },
              { value: 'published', label: 'เผยแพร่แล้ว' },
              { value: 'draft', label: 'ฉบับร่าง' },
            ],
          },
        ]}
        onReset={resetFilters}
        active={filtersActive}
      />

      <Card>
        <DataGrid<Subject>
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
            sorting: { sortModel: [{ field: 'code', sort: 'asc' }] },
          }}
          sx={{ border: 0, minHeight: 420 }}
        />
      </Card>

      <SubjectFormDialog
        key={formKey}
        open={dialogOpen}
        initial={
          editing
            ? {
                code: editing.code,
                name: editing.name,
                credits: editing.credits,
                departmentId: editing.departmentId,
                instructor: editing.instructor,
                status: editing.status,
                evaluationMode: editing.evaluationMode,
              }
            : undefined
        }
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>ลบวิชา</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ลบ <strong>{toDelete?.code}</strong> — {toDelete?.name}? การกระทำนี้ย้อนกลับไม่ได้
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
