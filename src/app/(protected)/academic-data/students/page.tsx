'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import FilterBar from '@/components/common/FilterBar';
import Button from '@/components/common/Button';
import Chip from '@/components/common/Chip';
import { ACCENT } from '@/theme/accents';
import { DEPARTMENTS, GROUPS, STUDENTS, departmentName, type Student } from '@/data/academicData';

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const ENROLL_YEARS = Array.from(new Set(STUDENTS.map((s) => s.enrollYear))).sort().reverse();
const groupsOfStudent = (studentId: string) => GROUPS.filter((g) => g.memberIds.includes(studentId));

type StudentInput = Omit<Student, 'id'>;
const EMPTY: StudentInput = { code: '', name: '', departmentId: DEPARTMENTS[0].id, enrollYear: ENROLL_YEARS[0] ?? '2569' };

/** กล่องเพิ่ม/แก้ไขนักศึกษา — remount ใหม่ทุกครั้งที่เปิด (ผ่าน `key`) เพื่อ seed จาก `initial` */
function StudentFormDialog({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: StudentInput;
  onClose: () => void;
  onSubmit: (input: StudentInput) => void;
}) {
  const [form, setForm] = React.useState<StudentInput>(initial ?? EMPTY);
  const [touched, setTouched] = React.useState(false);

  const codeError = touched && !form.code.trim();
  const nameError = touched && !form.name.trim();

  const submit = () => {
    setTouched(true);
    if (form.code.trim() && form.name.trim()) {
      onSubmit({ ...form, code: form.code.trim(), name: form.name.trim() });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? 'แก้ไขนักศึกษา' : 'เพิ่มนักศึกษา'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="รหัสนักศึกษา"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              required
              error={codeError}
              helperText={codeError ? 'กรุณากรอกรหัสนักศึกษา' : ' '}
              fullWidth
              autoFocus
            />
            <TextField
              select
              label="ปีที่เข้าศึกษา"
              value={form.enrollYear}
              onChange={(e) => setForm((p) => ({ ...p, enrollYear: e.target.value }))}
              sx={{ maxWidth: { sm: 160 } }}
              fullWidth
            >
              {ENROLL_YEARS.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField
            label="ชื่อ-นามสกุล"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            error={nameError}
            helperText={nameError ? 'กรุณากรอกชื่อ-นามสกุล' : ' '}
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

export default function StudentsPage() {
  const [students, setStudents] = React.useState<Student[]>(STUDENTS);
  const [search, setSearch] = React.useState('');
  const [dept, setDept] = React.useState('all');
  const [year, setYear] = React.useState('all');

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Student | null>(null);
  const [toDelete, setToDelete] = React.useState<Student | null>(null);
  const [formKey, setFormKey] = React.useState(0);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter(
      (s) =>
        (dept === 'all' || s.departmentId === dept) &&
        (year === 'all' || s.enrollYear === year) &&
        (q === '' || s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)),
    );
  }, [students, search, dept, year]);

  const summary = React.useMemo(() => {
    const groupedIds = new Set(GROUPS.flatMap((g) => g.memberIds));
    return {
      total: students.length,
      departments: new Set(students.map((s) => s.departmentId)).size,
      grouped: students.filter((s) => groupedIds.has(s.id)).length,
      ungrouped: students.filter((s) => !groupedIds.has(s.id)).length,
    };
  }, [students]);

  const openAdd = () => {
    setEditing(null);
    setFormKey((k) => k + 1);
    setDialogOpen(true);
  };
  const openEdit = (student: Student) => {
    setEditing(student);
    setFormKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleSubmit = (input: StudentInput) => {
    setStudents((prev) =>
      editing
        ? prev.map((s) => (s.id === editing.id ? { ...s, ...input } : s))
        : [...prev, { ...input, id: `st-${Date.now()}` }],
    );
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (toDelete) setStudents((prev) => prev.filter((s) => s.id !== toDelete.id));
    setToDelete(null);
  };

  const columns = React.useMemo<GridColDef<Student>[]>(
    () => [
      {
        field: 'name',
        headerName: 'นักศึกษา',
        flex: 1.5,
        minWidth: 230,
        renderCell: (params: GridRenderCellParams<Student>) => (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', height: '100%' }}>
            <Avatar sx={{ width: 34, height: 34, fontSize: 13, bgcolor: alpha(ACCENT.blue, 0.14), color: ACCENT.blue }}>
              {initials(params.row.name)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>
                {params.row.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }} noWrap>
                {params.row.code}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: 'departmentId',
        headerName: 'สาขา',
        flex: 1,
        minWidth: 170,
        valueGetter: (_, row) => departmentName(row.departmentId),
      },
      { field: 'enrollYear', headerName: 'ปีที่เข้าศึกษา', width: 120, align: 'center', headerAlign: 'center' },
      {
        field: 'groups',
        headerName: 'สังกัดกลุ่ม',
        width: 150,
        sortable: false,
        renderCell: (params: GridRenderCellParams<Student>) => {
          const groups = groupsOfStudent(params.row.id);
          return groups.length === 0 ? (
            <Chip size="sm" variant="outlined" color={ACCENT.pink} label="ยังไม่มีกลุ่ม" />
          ) : (
            <Chip size="sm" variant="soft" icon={GroupsIcon} color={ACCENT.violet} label={`${groups.length} กลุ่ม`} />
          );
        },
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
        renderCell: (params: GridRenderCellParams<Student>) => (
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

  const filtersActive = dept !== 'all' || year !== 'all' || search.trim() !== '';
  const resetFilters = () => {
    setDept('all');
    setYear('all');
    setSearch('');
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="นักศึกษา"
        description="ทะเบียนนักศึกษากลาง — ใช้เป็นคลังรายชื่อสำหรับทั้งการจัดกลุ่มรายวิชา และการเลือกผู้ถูกประเมินรายบุคคล"
        actions={
          <Button variant="solid" startIcon={AddIcon} onClick={openAdd}>
            เพิ่มนักศึกษา
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="นักศึกษาทั้งหมด" value={summary.total} icon={PeopleIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="สาขาที่มีนักศึกษา" value={summary.departments} icon={AccountTreeIcon} color={ACCENT.blue} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="สังกัดกลุ่มแล้ว" value={summary.grouped} icon={GroupsIcon} color={ACCENT.green} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="ยังไม่มีกลุ่ม" value={summary.ungrouped} icon={PersonOffIcon} color={ACCENT.amber} />
        </Grid>
      </Grid>

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'ค้นหารหัส หรือชื่อนักศึกษา…' }}
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
            key: 'year',
            label: 'ปีที่เข้าศึกษา',
            value: year,
            onChange: setYear,
            minWidth: 150,
            options: [{ value: 'all', label: 'ทุกปี' }, ...ENROLL_YEARS.map((y) => ({ value: y, label: y }))],
          },
        ]}
        onReset={resetFilters}
        active={filtersActive}
      />

      <Card>
        <DataGrid<Student>
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          rowHeight={58}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
            sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
          }}
          sx={{ border: 0, minHeight: 440 }}
        />
      </Card>

      <StudentFormDialog
        key={formKey}
        open={dialogOpen}
        initial={
          editing
            ? { code: editing.code, name: editing.name, departmentId: editing.departmentId, enrollYear: editing.enrollYear }
            : undefined
        }
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>ลบนักศึกษา</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ลบ <strong>{toDelete?.name}</strong> ({toDelete?.code})? การกระทำนี้ย้อนกลับไม่ได้
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
