'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
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
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import SchoolIcon from '@mui/icons-material/School';
import LockResetIcon from '@mui/icons-material/LockReset';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PageHeader from '@/components/common/PageHeader';
import StatTile from '@/components/common/StatTile';
import FilterBar from '@/components/common/FilterBar';
import { ACCENT } from '@/theme/accents';

type MemberRole = 'student' | 'teacher' | 'staff' | 'admin';
type MemberStatus = 'active' | 'inactive' | 'suspended';

interface Member {
  id: string;
  name: string;
  email: string;
  username: string;
  role: MemberRole;
  department: string;
  group: string;
  status: MemberStatus;
}

const DEPARTMENTS = [
  'Computer Engineering',
  'Marketing',
  'Accounting',
  'Physics',
  'Mathematics',
  'Administration',
];

const GROUPS = ['Administrators', 'Evaluators', 'Instructors', 'Students', 'Staff'];

const ROLE_META: Record<MemberRole, { label: string; color: string }> = {
  student: { label: 'Student', color: ACCENT.blue },
  teacher: { label: 'Teacher', color: ACCENT.violet },
  staff: { label: 'Staff', color: ACCENT.cyan },
  admin: { label: 'Admin', color: ACCENT.pink },
};

const STATUS_META: Record<MemberStatus, { label: string; color: 'success' | 'default' | 'warning' }> = {
  active: { label: 'Active', color: 'success' },
  inactive: { label: 'Inactive', color: 'default' },
  suspended: { label: 'Suspended', color: 'warning' },
};

/** Seed data — swap for an API-backed store when the backend is ready. */
const SEED: Member[] = [
  { id: 'm1', name: 'Anong Wattana', email: 'anong.w@peak.ac.th', username: 'anong.w', role: 'teacher', department: 'Computer Engineering', group: 'Instructors', status: 'active' },
  { id: 'm2', name: 'Rungroj Prasert', email: 'rungroj.p@peak.ac.th', username: 'rungroj.p', role: 'teacher', department: 'Computer Engineering', group: 'Instructors', status: 'active' },
  { id: 'm3', name: 'Suda Meesuk', email: 'suda.m@peak.ac.th', username: 'suda.m', role: 'staff', department: 'Accounting', group: 'Staff', status: 'active' },
  { id: 'm4', name: 'Kittset Laohong', email: 'kittset.l@peak.ac.th', username: 'kittset.l', role: 'teacher', department: 'Physics', group: 'Evaluators', status: 'inactive' },
  { id: 'm5', name: 'Prasit Thongdee', email: 'prasit.t@peak.ac.th', username: 'prasit.t', role: 'teacher', department: 'Marketing', group: 'Instructors', status: 'active' },
  { id: 'm6', name: 'Napat Srisai', email: 'napat.s@peak.ac.th', username: 'napat.s', role: 'student', department: 'Computer Engineering', group: 'Students', status: 'active' },
  { id: 'm7', name: 'Ploy Chaiyaphruek', email: 'ploy.c@peak.ac.th', username: 'ploy.c', role: 'student', department: 'Marketing', group: 'Students', status: 'suspended' },
  { id: 'm8', name: 'Somchai Boonmee', email: 'somchai.b@peak.ac.th', username: 'somchai.b', role: 'admin', department: 'Administration', group: 'Administrators', status: 'active' },
  { id: 'm9', name: 'Wanida Kaewkla', email: 'wanida.k@peak.ac.th', username: 'wanida.k', role: 'staff', department: 'Administration', group: 'Staff', status: 'active' },
  { id: 'm10', name: 'Thanakorn Jaidee', email: 'thanakorn.j@peak.ac.th', username: 'thanakorn.j', role: 'student', department: 'Physics', group: 'Students', status: 'inactive' },
];

type MemberInput = Omit<Member, 'id'>;
const EMPTY: MemberInput = {
  name: '',
  email: '',
  username: '',
  role: 'student',
  department: DEPARTMENTS[0],
  group: GROUPS[3],
  status: 'active',
};

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** Create/edit dialog. Remounted per open (via `key`) so it seeds from `initial`. */
function MemberFormDialog({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: MemberInput;
  onClose: () => void;
  onSubmit: (input: MemberInput) => void;
}) {
  const [form, setForm] = React.useState<MemberInput>(initial ?? EMPTY);
  const [touched, setTouched] = React.useState(false);

  const nameError = touched && !form.name.trim();
  const emailError = touched && !isEmail(form.email);
  const usernameError = touched && !form.username.trim();

  const set =
    (key: keyof MemberInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = () => {
    setTouched(true);
    if (form.name.trim() && isEmail(form.email) && form.username.trim()) {
      onSubmit({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        username: form.username.trim(),
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? 'Edit member' : 'Add member'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Full name"
            value={form.name}
            onChange={set('name')}
            required
            error={nameError}
            helperText={nameError ? 'Name is required' : ' '}
            fullWidth
            autoFocus
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Email"
              value={form.email}
              onChange={set('email')}
              required
              error={emailError}
              helperText={emailError ? 'Enter a valid email' : ' '}
              fullWidth
            />
            <TextField
              label="Username"
              value={form.username}
              onChange={set('username')}
              required
              error={usernameError}
              helperText={usernameError ? 'Username is required' : ' '}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Role" value={form.role} onChange={set('role')} fullWidth>
              {(Object.keys(ROLE_META) as MemberRole[]).map((r) => (
                <MenuItem key={r} value={r}>
                  {ROLE_META[r].label}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Status" value={form.status} onChange={set('status')} fullWidth>
              {(Object.keys(STATUS_META) as MemberStatus[]).map((s) => (
                <MenuItem key={s} value={s}>
                  {STATUS_META[s].label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField
            select
            label="Department / Organization"
            value={form.department}
            onChange={set('department')}
            fullWidth
          >
            {DEPARTMENTS.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Group Permission"
            value={form.group}
            onChange={set('group')}
            fullWidth
          >
            {GROUPS.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
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

export default function MembersPage() {
  const [members, setMembers] = React.useState<Member[]>(SEED);
  const [search, setSearch] = React.useState('');
  const [role, setRole] = React.useState('all');
  const [group, setGroup] = React.useState('all');
  const [status, setStatus] = React.useState('all');

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Member | null>(null);
  const [toDelete, setToDelete] = React.useState<Member | null>(null);
  const [toReset, setToReset] = React.useState<Member | null>(null);
  const [formKey, setFormKey] = React.useState(0);

  // Row action menu (reset / suspend / delete).
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = React.useState<Member | null>(null);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter(
      (m) =>
        (role === 'all' || m.role === role) &&
        (group === 'all' || m.group === group) &&
        (status === 'all' || m.status === status) &&
        (q === '' ||
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.username.toLowerCase().includes(q)),
    );
  }, [members, search, role, group, status]);

  const summary = React.useMemo(
    () => ({
      total: members.length,
      active: members.filter((m) => m.status === 'active').length,
      suspended: members.filter((m) => m.status === 'suspended').length,
      teachers: members.filter((m) => m.role === 'teacher').length,
    }),
    [members],
  );

  const openAdd = () => {
    setEditing(null);
    setFormKey((k) => k + 1);
    setDialogOpen(true);
  };
  const openEdit = (member: Member) => {
    setEditing(member);
    setFormKey((k) => k + 1);
    setDialogOpen(true);
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, row: Member) => {
    setMenuAnchor(e.currentTarget);
    setMenuRow(row);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };

  const handleSubmit = (input: MemberInput) => {
    setMembers((prev) =>
      editing
        ? prev.map((m) => (m.id === editing.id ? { ...m, ...input } : m))
        : [...prev, { ...input, id: `m${Date.now()}` }],
    );
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (toDelete) setMembers((prev) => prev.filter((m) => m.id !== toDelete.id));
    setToDelete(null);
  };

  const toggleSuspend = (member: Member) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === member.id
          ? { ...m, status: m.status === 'suspended' ? 'active' : 'suspended' }
          : m,
      ),
    );
    closeMenu();
  };

  const columns = React.useMemo<GridColDef<Member>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Member',
        flex: 1.6,
        minWidth: 240,
        renderCell: (params: GridRenderCellParams<Member>) => {
          const meta = ROLE_META[params.row.role];
          return (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', height: '100%' }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  fontSize: 14,
                  bgcolor: alpha(meta.color, 0.14),
                  color: meta.color,
                }}
              >
                {initials(params.row.name)}
              </Avatar>
              <Box
                sx={{
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>
                  {params.row.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ lineHeight: 1.3 }}
                  noWrap
                >
                  {params.row.email}
                </Typography>
              </Box>
            </Stack>
          );
        },
      },
      { field: 'username', headerName: 'Username', flex: 0.9, minWidth: 130 },
      {
        field: 'role',
        headerName: 'Role',
        width: 120,
        renderCell: (params: GridRenderCellParams<Member>) => {
          const meta = ROLE_META[params.row.role];
          return (
            <Chip
              size="small"
              label={meta.label}
              sx={{
                bgcolor: alpha(meta.color, 0.12),
                color: meta.color,
                fontWeight: 600,
                border: `1px solid ${alpha(meta.color, 0.3)}`,
              }}
            />
          );
        },
      },
      { field: 'department', headerName: 'Department', flex: 1.2, minWidth: 170 },
      { field: 'group', headerName: 'Group Permission', flex: 1, minWidth: 150 },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params: GridRenderCellParams<Member>) => {
          const meta = STATUS_META[params.row.status];
          return <Chip size="small" label={meta.label} color={meta.color} />;
        },
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
        renderCell: (params: GridRenderCellParams<Member>) => (
          <Box>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => openEdit(params.row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="More">
              <IconButton size="small" onClick={(e) => openMenu(e, params.row)}>
                <MoreVertIcon fontSize="small" />
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
        title="Members"
        description="Manage user accounts, roles, and group permissions."
        actions={
          <>
            <Button variant="outlined" color="inherit" startIcon={<UploadFileIcon />}>
              Import
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
              Add member
            </Button>
          </>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Total Members" value={summary.total} icon={PeopleIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Active" value={summary.active} icon={CheckCircleIcon} color={ACCENT.green} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Suspended" value={summary.suspended} icon={BlockIcon} color={ACCENT.amber} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Teachers" value={summary.teachers} icon={SchoolIcon} color={ACCENT.blue} />
        </Grid>
      </Grid>

      <FilterBar
        filters={[
          {
            key: 'role',
            label: 'Role',
            value: role,
            onChange: setRole,
            minWidth: 150,
            options: [
              { value: 'all', label: 'All roles' },
              ...(Object.keys(ROLE_META) as MemberRole[]).map((r) => ({
                value: r,
                label: ROLE_META[r].label,
              })),
            ],
          },
          {
            key: 'group',
            label: 'Group Permission',
            value: group,
            onChange: setGroup,
            minWidth: 180,
            options: [
              { value: 'all', label: 'All groups' },
              ...GROUPS.map((g) => ({ value: g, label: g })),
            ],
          },
          {
            key: 'status',
            label: 'Status',
            value: status,
            onChange: setStatus,
            minWidth: 140,
            options: [
              { value: 'all', label: 'All' },
              ...(Object.keys(STATUS_META) as MemberStatus[]).map((s) => ({
                value: s,
                label: STATUS_META[s].label,
              })),
            ],
          },
        ]}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search name, email, username…',
        }}
        active={search !== '' || role !== 'all' || group !== 'all' || status !== 'all'}
        onReset={() => {
          setSearch('');
          setRole('all');
          setGroup('all');
          setStatus('all');
        }}
      />

      <Card>
        <DataGrid<Member>
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          rowHeight={60}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
            sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
          }}
          sx={{ border: 0, minHeight: 440 }}
        />
      </Card>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (menuRow) setToReset(menuRow);
            closeMenu();
          }}
        >
          <ListItemIcon>
            <LockResetIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reset password</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => menuRow && toggleSuspend(menuRow)}>
          <ListItemIcon>
            {menuRow?.status === 'suspended' ? (
              <PlayCircleIcon fontSize="small" />
            ) : (
              <PauseCircleIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>{menuRow?.status === 'suspended' ? 'Reactivate' : 'Suspend'}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRow) setToDelete(menuRow);
            closeMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <MemberFormDialog
        key={formKey}
        open={dialogOpen}
        initial={
          editing
            ? {
                name: editing.name,
                email: editing.email,
                username: editing.username,
                role: editing.role,
                department: editing.department,
                group: editing.group,
                status: editing.status,
              }
            : undefined
        }
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete <strong>{toDelete?.name}</strong>? This action can’t be undone.
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

      <Dialog open={Boolean(toReset)} onClose={() => setToReset(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Reset password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Send a password reset link to <strong>{toReset?.email}</strong>? The member will be
            prompted to set a new password on next sign-in.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToReset(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={() => setToReset(null)} variant="contained">
            Send link
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
