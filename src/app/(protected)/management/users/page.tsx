'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  selectUsers,
  selectUsersStatus,
  selectUsersError,
  selectUsersSaving,
} from '@/redux/slices/usersSlice';
import type { User, UserInput } from '@/services/usersService';

const EMPTY: UserInput = { name: '', email: '', phone: '', website: '' };
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** Create/edit dialog with minimal inline validation. */
function UserFormDialog({
  open,
  initial,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: UserInput;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: UserInput) => void;
}) {
  // The parent remounts this dialog on each open (via `key`), so initializing
  // from `initial` here is enough — no reset effect needed.
  const [form, setForm] = React.useState<UserInput>(initial ?? EMPTY);
  const [touched, setTouched] = React.useState(false);

  const nameError = touched && !form.name.trim();
  const emailError = touched && !isEmail(form.email);
  const field =
    (key: keyof UserInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = () => {
    setTouched(true);
    if (form.name.trim() && isEmail(form.email)) onSubmit({ ...form, name: form.name.trim() });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? 'Edit user' : 'Add user'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            value={form.name}
            onChange={field('name')}
            required
            error={nameError}
            helperText={nameError ? 'Name is required' : ' '}
            fullWidth
            autoFocus
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={field('email')}
            required
            error={emailError}
            helperText={emailError ? 'Enter a valid email' : ' '}
            fullWidth
          />
          <TextField label="Phone" value={form.phone ?? ''} onChange={field('phone')} fullWidth />
          <TextField label="Website" value={form.website ?? ''} onChange={field('website')} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={submit} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const status = useAppSelector(selectUsersStatus);
  const error = useAppSelector(selectUsersError);
  const saving = useAppSelector(selectUsersSaving);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<User | null>(null);
  const [toDelete, setToDelete] = React.useState<User | null>(null);
  // Bumped on each open so the form dialog remounts fresh from `initial`.
  const [formKey, setFormKey] = React.useState(0);

  // Load once on mount.
  React.useEffect(() => {
    if (status === 'idle') dispatch(fetchUsers());
  }, [status, dispatch]);

  const initial = React.useMemo<UserInput | undefined>(
    () =>
      editing
        ? {
            name: editing.name,
            email: editing.email,
            phone: editing.phone ?? '',
            website: editing.website ?? '',
          }
        : undefined,
    [editing],
  );

  const openAdd = () => {
    setEditing(null);
    setFormKey((k) => k + 1);
    setDialogOpen(true);
  };
  const openEdit = (user: User) => {
    setEditing(user);
    setFormKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleSubmit = async (input: UserInput) => {
    try {
      if (editing) await dispatch(updateUser({ id: editing.id, input })).unwrap();
      else await dispatch(createUser(input)).unwrap();
      setDialogOpen(false);
    } catch {
      // Error is surfaced via the slice's `error` state (Alert below).
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await dispatch(deleteUser(toDelete.id)).unwrap();
    } catch {
      // Error surfaced via the Alert.
    }
    setToDelete(null);
  };

  const loading = status === 'loading';

  const columns = React.useMemo<GridColDef<User>[]>(
    () => [
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
      { field: 'email', headerName: 'Email', flex: 1.4, minWidth: 200 },
      {
        field: 'phone',
        headerName: 'Phone',
        flex: 1,
        minWidth: 140,
        valueGetter: (value) => value ?? '',
        renderCell: (params: GridRenderCellParams<User>) => params.value || '—',
      },
      {
        field: 'company',
        headerName: 'Company',
        flex: 1,
        minWidth: 140,
        valueGetter: (_value, row) => row.company?.name ?? '',
        renderCell: (params: GridRenderCellParams<User>) => params.value || '—',
      },
      {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'right',
        headerAlign: 'right',
        width: 110,
        renderCell: (params: GridRenderCellParams<User>) => (
          <Box>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => openEdit(params.row)} disabled={saving}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => setToDelete(params.row)}
                disabled={saving}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [saving],
  );

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Users
          </Typography>
          <Typography variant="body1" color="text.secondary">
            CRUD example wired through service → slice → store.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RefreshIcon />}
            onClick={() => dispatch(fetchUsers())}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
            Add user
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <DataGrid<User>
          rows={users}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          showToolbar
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
            sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
          }}
          sx={{ border: 0, minHeight: 400 }}
        />
      </Card>

      <UserFormDialog
        key={formKey}
        open={dialogOpen}
        initial={initial}
        saving={saving}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete user</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete <strong>{toDelete?.name}</strong>? This action can’t be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)} disabled={saving} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} disabled={saving} color="error" variant="contained">
            {saving ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
