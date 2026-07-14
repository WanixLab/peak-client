'use client';

import * as React from 'react';
import {
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
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import StarsIcon from '@mui/icons-material/Stars';
import PageHeader from '@/components/common/PageHeader';
import StatTile from '@/components/common/StatTile';
import { ACCENT } from '@/theme/accents';

interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  department: string;
  instructor: string;
  active: boolean;
}

const DEPARTMENTS = [
  'Computer Engineering',
  'Marketing',
  'Accounting',
  'Physics',
  'Mathematics',
];

/** Seed data — swap for an API-backed store when the backend is ready. */
const SEED: Subject[] = [
  { id: 's1', code: 'CS101', name: 'Introduction to Programming', credits: 3, department: 'Computer Engineering', instructor: 'Dr. Anong W.', active: true },
  { id: 's2', code: 'CS205', name: 'Data Structures', credits: 3, department: 'Computer Engineering', instructor: 'Dr. Anong W.', active: true },
  { id: 's3', code: 'CS310', name: 'Database Systems', credits: 3, department: 'Computer Engineering', instructor: 'Aj. Rungroj P.', active: false },
  { id: 's4', code: 'MK310', name: 'Marketing Research', credits: 3, department: 'Marketing', instructor: 'Aj. Prasit T.', active: true },
  { id: 's5', code: 'AC220', name: 'Financial Accounting', credits: 4, department: 'Accounting', instructor: 'Aj. Suda M.', active: true },
  { id: 's6', code: 'PH150', name: 'General Physics', credits: 4, department: 'Physics', instructor: 'Dr. Kittset L.', active: true },
  { id: 's7', code: 'MA200', name: 'Calculus II', credits: 3, department: 'Mathematics', instructor: 'Dr. Kittset L.', active: false },
];

type SubjectInput = Omit<Subject, 'id'>;
const EMPTY: SubjectInput = { code: '', name: '', credits: 3, department: DEPARTMENTS[0], instructor: '', active: true };

/** Create/edit dialog. Remounted per open (via `key`) so it seeds from `initial`. */
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
      <DialogTitle>{initial ? 'Edit subject' : 'Add subject'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Code"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              required
              error={codeError}
              helperText={codeError ? 'Code is required' : ' '}
              sx={{ maxWidth: { sm: 160 } }}
              fullWidth
              autoFocus
            />
            <TextField
              label="Credits"
              type="number"
              value={form.credits}
              onChange={(e) => setForm((p) => ({ ...p, credits: Number(e.target.value) }))}
              sx={{ maxWidth: { sm: 120 } }}
              slotProps={{ htmlInput: { min: 0, max: 12 } }}
            />
          </Stack>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            error={nameError}
            helperText={nameError ? 'Name is required' : ' '}
            fullWidth
          />
          <TextField
            select
            label="Department"
            value={form.department}
            onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
            fullWidth
          >
            {DEPARTMENTS.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Instructor"
            value={form.instructor}
            onChange={(e) => setForm((p) => ({ ...p, instructor: e.target.value }))}
            fullWidth
          />
          <TextField
            select
            label="Status"
            value={form.active ? 'active' : 'inactive'}
            onChange={(e) => setForm((p) => ({ ...p, active: e.target.value === 'active' }))}
            fullWidth
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={submit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = React.useState<Subject[]>(SEED);
  const [search, setSearch] = React.useState('');
  const [dept, setDept] = React.useState('all');
  const [status, setStatus] = React.useState('all');

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Subject | null>(null);
  const [toDelete, setToDelete] = React.useState<Subject | null>(null);
  const [formKey, setFormKey] = React.useState(0);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return subjects.filter(
      (s) =>
        (dept === 'all' || s.department === dept) &&
        (status === 'all' || (status === 'active') === s.active) &&
        (q === '' ||
          s.code.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.instructor.toLowerCase().includes(q)),
    );
  }, [subjects, search, dept, status]);

  const summary = React.useMemo(
    () => ({
      total: subjects.length,
      active: subjects.filter((s) => s.active).length,
      departments: new Set(subjects.map((s) => s.department)).size,
      credits: subjects.reduce((sum, s) => sum + s.credits, 0),
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
        : [...prev, { ...input, id: `s${Date.now()}` }],
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
        headerName: 'Code',
        width: 100,
        renderCell: (params: GridRenderCellParams<Subject>) => (
          <Chip size="small" label={params.row.code} variant="outlined" />
        ),
      },
      { field: 'name', headerName: 'Subject', flex: 1.4, minWidth: 200 },
      { field: 'credits', headerName: 'Credits', width: 90, type: 'number', align: 'center', headerAlign: 'center' },
      { field: 'department', headerName: 'Department', flex: 1, minWidth: 170 },
      { field: 'instructor', headerName: 'Instructor', flex: 1, minWidth: 140 },
      {
        field: 'active',
        headerName: 'Status',
        width: 120,
        renderCell: (params: GridRenderCellParams<Subject>) =>
          params.row.active ? (
            <Chip size="small" label="Active" color="success" />
          ) : (
            <Chip size="small" label="Inactive" />
          ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 110,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params: GridRenderCellParams<Subject>) => (
          <Box>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => openEdit(params.row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
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

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Subjects"
        description="Manage the subject catalog used across evaluations."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
            Add subject
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Total Subjects" value={summary.total} icon={MenuBookIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Active" value={summary.active} icon={CheckCircleIcon} color={ACCENT.green} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Departments" value={summary.departments} icon={AccountTreeIcon} color={ACCENT.blue} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Total Credits" value={summary.credits} icon={StarsIcon} color={ACCENT.amber} />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              select
              size="small"
              label="Department"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">All departments</MenuItem>
              {DEPARTMENTS.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
            <Box sx={{ flexGrow: 1 }} />
            <TextField
              size="small"
              placeholder="Search code, name, instructor…"
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
                department: editing.department,
                instructor: editing.instructor,
                active: editing.active,
              }
            : undefined
        }
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete subject</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete <strong>{toDelete?.code}</strong> — {toDelete?.name}? This can’t be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
