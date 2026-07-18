'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import BadgeIcon from '@mui/icons-material/Badge';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import FilterBar from '@/components/common/FilterBar';
import Button from '@/components/common/Button';
import Chip from '@/components/common/Chip';
import { ACCENT } from '@/theme/accents';
import { ORGANIZATION } from '@/data/academicData';
import {
  GROUP_PERMISSIONS,
  MENU_NODES,
  SYSTEM_USERS,
  USER_TYPES,
  PERM_META,
  accessibleCount,
  manageCount,
  emptyGroupPermission,
  userTypeMeta,
  systemUser,
  type GroupPermission,
  type PermLevel,
} from '@/data/groupPermissions';

type GroupInput = Omit<GroupPermission, 'id'>;
type Section = 'detail' | 'menus' | 'members' | 'scope';

const initials = (name: string) =>
  name.replace(/^(อ\.|ผศ\.|รศ\.|ดร\.|นาย|นาง|นางสาว)+/g, '').trim().charAt(0) || name.charAt(0);

// ---------------------------------------------------------------------------
// Menu permission tree
// ---------------------------------------------------------------------------

/** One page row with the two access checkboxes (view / manage). */
function PermRow({
  title,
  level,
  onChange,
  indent = false,
}: {
  title: string;
  level: PermLevel;
  onChange: (next: PermLevel) => void;
  indent?: boolean;
}) {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', py: 0.25, pl: indent ? 3 : 0, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
    >
      <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0 }} noWrap>
        {title}
      </Typography>
      <FormControlLabel
        sx={{ mr: 1 }}
        control={
          <Checkbox
            size="small"
            checked={level !== 'none'}
            onChange={() => onChange(level === 'none' ? 'view' : 'none')}
          />
        }
        label={<Typography variant="caption">{PERM_META.view.label}</Typography>}
      />
      <FormControlLabel
        sx={{ mr: 0, width: 108 }}
        control={
          <Checkbox
            size="small"
            checked={level === 'manage'}
            onChange={() => onChange(level === 'manage' ? 'view' : 'manage')}
          />
        }
        label={<Typography variant="caption">{PERM_META.manage.label}</Typography>}
      />
    </Stack>
  );
}

function MenuPermissionTree({
  permissions,
  onChange,
}: {
  permissions: Record<string, PermLevel>;
  onChange: (id: string, level: PermLevel) => void;
}) {
  const levelOf = (id: string): PermLevel => permissions[id] ?? 'none';

  /** Set every leaf id in `ids` to a level (with keep-highest semantics for view). */
  const setMany = (ids: string[], next: PermLevel) => ids.forEach((id) => onChange(id, next));

  return (
    <Stack spacing={1.5}>
      <Typography variant="caption" color="text.secondary">
        ติ๊ก “ดูได้อย่างเดียว” เพื่อดูอย่างเดียว, “จัดการได้” เพื่อเพิ่ม/แก้/ลบ — ถ้าไม่ติ๊กทั้งสอง กลุ่มนี้จะไม่เห็นเมนูนั้น
      </Typography>
      {MENU_NODES.map((node) => {
        if (!node.children) {
          return <PermRow key={node.id} title={node.title} level={levelOf(node.id)} onChange={(l) => onChange(node.id, l)} />;
        }
        const childIds = node.children.map((c) => c.id);
        const allView = childIds.every((id) => levelOf(id) !== 'none');
        const allManage = childIds.every((id) => levelOf(id) === 'manage');
        return (
          <Box key={node.id}>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Typography variant="subtitle2" sx={{ flexGrow: 1, fontWeight: 700 }}>
                {node.title}
              </Typography>
              <FormControlLabel
                sx={{ mr: 1 }}
                control={
                  <Checkbox
                    size="small"
                    checked={allView}
                    indeterminate={!allView && childIds.some((id) => levelOf(id) !== 'none')}
                    onChange={() => setMany(childIds, allView ? 'none' : 'view')}
                  />
                }
                label={<Typography variant="caption" color="text.secondary">ทั้งหมด</Typography>}
              />
              <FormControlLabel
                sx={{ mr: 0, width: 108 }}
                control={
                  <Checkbox
                    size="small"
                    checked={allManage}
                    indeterminate={!allManage && childIds.some((id) => levelOf(id) === 'manage')}
                    onChange={() => setMany(childIds, allManage ? 'view' : 'manage')}
                  />
                }
                label={<Typography variant="caption" color="text.secondary">จัดการ</Typography>}
              />
            </Stack>
            {node.children.map((c) => (
              <PermRow key={c.id} title={c.title} level={levelOf(c.id)} onChange={(l) => onChange(c.id, l)} indent />
            ))}
          </Box>
        );
      })}
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Members picker (2 tabs)
// ---------------------------------------------------------------------------

function MembersPicker({
  userIds,
  types,
  onToggleUser,
  onToggleType,
}: {
  userIds: string[];
  types: string[];
  onToggleUser: (id: string) => void;
  onToggleType: (id: string) => void;
}) {
  const [tab, setTab] = React.useState(0);
  const [search, setSearch] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return SYSTEM_USERS.filter(
      (u) => q === '' || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, minHeight: 40 }}>
        <Tab label={`รายบุคคล (${userIds.length})`} sx={{ minHeight: 40, textTransform: 'none' }} />
        <Tab label={`ตามประเภท (${types.length})`} sx={{ minHeight: 40, textTransform: 'none' }} />
      </Tabs>

      {tab === 0 ? (
        <Stack spacing={1.5}>
          <TextField
            size="small"
            placeholder="ค้นหาชื่อหรืออีเมล…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          <Stack spacing={0.5} sx={{ maxHeight: 300, overflowY: 'auto', pr: 0.5 }}>
            {filtered.map((u) => {
              const meta = userTypeMeta(u.type);
              const checked = userIds.includes(u.id);
              return (
                <Stack
                  key={u.id}
                  direction="row"
                  spacing={1.5}
                  onClick={() => onToggleUser(u.id)}
                  sx={{
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    bgcolor: checked ? alpha(ACCENT.violet, 0.08) : 'transparent',
                    '&:hover': { bgcolor: checked ? alpha(ACCENT.violet, 0.12) : 'action.hover' },
                  }}
                >
                  <Checkbox size="small" checked={checked} sx={{ p: 0 }} />
                  <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: alpha(meta?.color ?? ACCENT.blue, 0.15), color: meta?.color }}>
                    {initials(u.name)}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                      {u.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {u.email}
                    </Typography>
                  </Box>
                  {meta && <Chip size="sm" variant="soft" color={meta.color} label={meta.label} />}
                </Stack>
              );
            })}
            {filtered.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                ไม่พบผู้ใช้
              </Typography>
            )}
          </Stack>
        </Stack>
      ) : (
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            เพิ่มทั้งประเภท — ผู้ใช้ใหม่ที่เป็นประเภทนี้จะได้รับสิทธิ์นี้โดยอัตโนมัติ
          </Typography>
          {USER_TYPES.map((t) => {
            const checked = types.includes(t.id);
            return (
              <Stack
                key={t.id}
                direction="row"
                spacing={1.5}
                onClick={() => onToggleType(t.id)}
                sx={{
                  alignItems: 'center',
                  p: 1.25,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: checked ? t.color : 'divider',
                  bgcolor: checked ? alpha(t.color, 0.06) : 'transparent',
                }}
              >
                <Checkbox size="small" checked={checked} sx={{ p: 0 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Chip size="sm" variant="soft" color={t.color} label={t.label} />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {t.description}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Faculty / department scope picker
// ---------------------------------------------------------------------------

function ScopePicker({
  allScope,
  facultyIds,
  departmentIds,
  onToggleAll,
  onToggleFaculty,
  onToggleDepartment,
}: {
  allScope: boolean;
  facultyIds: string[];
  departmentIds: string[];
  onToggleAll: (v: boolean) => void;
  onToggleFaculty: (id: string) => void;
  onToggleDepartment: (id: string) => void;
}) {
  return (
    <Stack spacing={1.5}>
      <FormControlLabel
        control={<Checkbox checked={allScope} onChange={(e) => onToggleAll(e.target.checked)} />}
        label={<Typography variant="body2" sx={{ fontWeight: 600 }}>เข้าถึงได้ทุกคณะ / ทุกสาขา</Typography>}
      />
      {!allScope && (
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            เลือกคณะ (ครอบคลุมทุกสาขาในคณะนั้น) หรือเลือกเฉพาะบางสาขา — สมาชิกจะเห็นเฉพาะที่เลือก
          </Typography>
          {ORGANIZATION.map((fac) => {
            const facChecked = facultyIds.includes(fac.id);
            return (
              <Box key={fac.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1 }}>
                <FormControlLabel
                  control={<Checkbox size="small" checked={facChecked} onChange={() => onToggleFaculty(fac.id)} />}
                  label={<Typography variant="body2" sx={{ fontWeight: 700 }}>{fac.name}</Typography>}
                />
                <Stack sx={{ pl: 3 }}>
                  {fac.children?.map((dep) => (
                    <FormControlLabel
                      key={dep.id}
                      control={
                        <Checkbox
                          size="small"
                          checked={facChecked || departmentIds.includes(dep.id)}
                          disabled={facChecked}
                          onChange={() => onToggleDepartment(dep.id)}
                        />
                      }
                      label={<Typography variant="body2">{dep.name}</Typography>}
                    />
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Editor dialog
// ---------------------------------------------------------------------------

const SECTION_META: { id: Section; label: string; icon: typeof BadgeIcon }[] = [
  { id: 'detail', label: 'ข้อมูลกลุ่ม', icon: BadgeIcon },
  { id: 'menus', label: 'เมนูที่เข้าถึงได้', icon: MenuOpenIcon },
  { id: 'members', label: 'สมาชิกในกลุ่ม', icon: PeopleIcon },
  { id: 'scope', label: 'ขอบเขตการเข้าถึง (คณะ/สาขา)', icon: AccountTreeIcon },
];

function PermissionEditorDialog({
  open,
  initial,
  initialSection,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: GroupInput;
  initialSection: Section;
  onClose: () => void;
  onSubmit: (input: GroupInput) => void;
}) {
  const [form, setForm] = React.useState<GroupInput>(initial ?? emptyGroupPermission());
  const [touched, setTouched] = React.useState(false);
  const [expanded, setExpanded] = React.useState<Section[]>(
    initialSection === 'detail' ? ['detail'] : ['detail', initialSection],
  );

  const nameError = touched && !form.name.trim();
  const togglePanel = (id: Section) =>
    setExpanded((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const toggleInArray = (key: 'userIds' | 'types' | 'facultyIds' | 'departmentIds', id: string) =>
    setForm((p) => ({
      ...p,
      [key]: p[key].includes(id) ? p[key].filter((x) => x !== id) : [...p[key], id],
    }));

  const setPermission = (menuId: string, level: PermLevel) =>
    setForm((p) => {
      const next = { ...p.permissions };
      if (level === 'none') delete next[menuId];
      else next[menuId] = level;
      return { ...p, permissions: next };
    });

  const submit = () => {
    setTouched(true);
    if (form.name.trim()) onSubmit({ ...form, name: form.name.trim(), description: form.description.trim() });
  };

  const summary = (id: Section): string => {
    switch (id) {
      case 'detail':
        return form.name || 'ยังไม่ตั้งชื่อ';
      case 'menus':
        return `${Object.values(form.permissions).filter((l) => l !== 'none').length} เมนู`;
      case 'members':
        return `${form.userIds.length} คน · ${form.types.length} ประเภท`;
      case 'scope':
        return form.allScope ? 'ทุกคณะ/สาขา' : `${form.facultyIds.length} คณะ · ${form.departmentIds.length} สาขา`;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{initial ? 'แก้ไขกลุ่มสิทธิ์' : 'เพิ่มกลุ่มสิทธิ์'}</DialogTitle>
      <DialogContent dividers sx={{ bgcolor: (t) => alpha(t.palette.text.primary, 0.015) }}>
        <Stack spacing={1.5}>
          {SECTION_META.map(({ id, label, icon: Icon }) => (
            <Accordion
              key={id}
              expanded={expanded.includes(id)}
              onChange={() => togglePanel(id)}
              disableGutters
              elevation={0}
              sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' }, overflow: 'hidden' }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
                  <Icon fontSize="small" sx={{ color: 'primary.main' }} />
                  <Typography sx={{ fontWeight: 700 }}>{label}</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ mr: 1 }}>
                    {summary(id)}
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                {id === 'detail' && (
                  <Stack spacing={2} sx={{ pt: 0.5 }}>
                    <TextField
                      label="ชื่อกลุ่มสิทธิ์"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      required
                      error={nameError}
                      helperText={nameError ? 'กรุณากรอกชื่อกลุ่ม' : ' '}
                      fullWidth
                      autoFocus
                    />
                    <TextField
                      label="รายละเอียด"
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      fullWidth
                      multiline
                      minRows={2}
                    />
                  </Stack>
                )}
                {id === 'menus' && (
                  <MenuPermissionTree permissions={form.permissions} onChange={setPermission} />
                )}
                {id === 'members' && (
                  <MembersPicker
                    userIds={form.userIds}
                    types={form.types}
                    onToggleUser={(uid) => toggleInArray('userIds', uid)}
                    onToggleType={(tid) => toggleInArray('types', tid)}
                  />
                )}
                {id === 'scope' && (
                  <ScopePicker
                    allScope={form.allScope}
                    facultyIds={form.facultyIds}
                    departmentIds={form.departmentIds}
                    onToggleAll={(v) => setForm((p) => ({ ...p, allScope: v }))}
                    onToggleFaculty={(fid) => toggleInArray('facultyIds', fid)}
                    onToggleDepartment={(did) => toggleInArray('departmentIds', did)}
                  />
                )}
              </AccordionDetails>
            </Accordion>
          ))}
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

// ---------------------------------------------------------------------------
// List card
// ---------------------------------------------------------------------------

function GroupCard({
  group,
  onAddPeople,
  onEdit,
  onDelete,
}: {
  group: GroupPermission;
  onAddPeople: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const scopeLabel = group.allScope
    ? 'ทุกคณะ/สาขา'
    : `${group.facultyIds.length} คณะ · ${group.departmentIds.length} สาขา`;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={1.5} sx={{ height: '100%' }}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                {group.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {group.description || '—'}
              </Typography>
            </Box>
            <Tooltip title="ลบ">
              <IconButton size="small" color="error" onClick={onDelete}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Chip size="sm" variant="soft" color={ACCENT.violet} icon={MenuOpenIcon} label={`${accessibleCount(group)} เมนู`} />
            <Chip size="sm" variant="soft" color={ACCENT.green} label={`จัดการ ${manageCount(group)}`} />
            <Chip size="sm" variant="soft" color={ACCENT.blue} icon={PeopleIcon} label={`${group.userIds.length} คน · ${group.types.length} ประเภท`} />
            <Chip size="sm" variant="soft" color={ACCENT.cyan} icon={AccountTreeIcon} label={scopeLabel} />
          </Stack>

          {/* Member type + individual avatars preview */}
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
            {group.types.map((t) => {
              const meta = userTypeMeta(t);
              return meta ? <Chip key={t} size="sm" variant="outlined" color={meta.color} label={meta.label} /> : null;
            })}
            {group.userIds.slice(0, 5).map((uid) => {
              const u = systemUser(uid);
              return u ? (
                <Tooltip key={uid} title={u.name}>
                  <Avatar sx={{ width: 26, height: 26, fontSize: 12, bgcolor: alpha(ACCENT.violet, 0.14), color: ACCENT.violet }}>
                    {initials(u.name)}
                  </Avatar>
                </Tooltip>
              ) : null;
            })}
            {group.userIds.length > 5 && (
              <Typography variant="caption" color="text.secondary">
                +{group.userIds.length - 5}
              </Typography>
            )}
          </Stack>

          <Box sx={{ flexGrow: 1 }} />
          <Divider />
          <Stack direction="row" spacing={1}>
            <Button variant="soft" color={ACCENT.blue} startIcon={PersonAddIcon} onClick={onAddPeople}>
              เพิ่มคน
            </Button>
            <Button variant="outlined" color={ACCENT.violet} startIcon={EditIcon} onClick={onEdit}>
              แก้ไข
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function GroupPermissionPage() {
  const theme = useTheme();
  const [groups, setGroups] = React.useState<GroupPermission[]>(GROUP_PERMISSIONS);
  const [search, setSearch] = React.useState('');

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GroupPermission | null>(null);
  const [section, setSection] = React.useState<Section>('detail');
  const [formKey, setFormKey] = React.useState(0);
  const [toDelete, setToDelete] = React.useState<GroupPermission | null>(null);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return groups.filter((g) => q === '' || g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
  }, [groups, search]);

  const summary = React.useMemo(
    () => ({
      total: groups.length,
      users: new Set(groups.flatMap((g) => g.userIds)).size,
      types: new Set(groups.flatMap((g) => g.types)).size,
      allScope: groups.filter((g) => g.allScope).length,
    }),
    [groups],
  );

  const openAdd = () => {
    setEditing(null);
    setSection('detail');
    setFormKey((k) => k + 1);
    setDialogOpen(true);
  };
  const openEdit = (group: GroupPermission, sec: Section) => {
    setEditing(group);
    setSection(sec);
    setFormKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleSubmit = (input: GroupInput) => {
    setGroups((prev) =>
      editing
        ? prev.map((g) => (g.id === editing.id ? { ...g, ...input } : g))
        : [...prev, { ...input, id: `gp-${Date.now()}` }],
    );
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (toDelete) setGroups((prev) => prev.filter((g) => g.id !== toDelete.id));
    setToDelete(null);
  };

  const { id: _omit, ...editingInput } = editing ?? ({ id: '' } as GroupPermission);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="สิทธิ์กลุ่มผู้ใช้"
        description="กำหนดกลุ่มสิทธิ์ — เมนูที่เข้าถึงได้ สมาชิกในกลุ่ม และขอบเขตคณะ/สาขาที่มองเห็น"
        actions={
          <Button variant="solid" startIcon={AddIcon} onClick={openAdd}>
            เพิ่มกลุ่มสิทธิ์
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="กลุ่มสิทธิ์ทั้งหมด" value={summary.total} icon={AdminPanelSettingsIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="ผู้ใช้ที่กำหนดรายคน" value={summary.users} icon={PeopleIcon} color={ACCENT.blue} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="ประเภทผู้ใช้ที่ผูก" value={summary.types} icon={GroupsIcon} color={ACCENT.cyan} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="เข้าถึงทุกคณะ" value={summary.allScope} icon={AccountTreeIcon} color={ACCENT.amber} />
        </Grid>
      </Grid>

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'ค้นหาชื่อกลุ่มสิทธิ์…' }}
        active={search.trim() !== ''}
        onReset={() => setSearch('')}
      />

      {rows.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center', border: 'none', boxShadow: 'none', bgcolor: alpha(theme.palette.text.primary, 0.03) }}>
          <InfoOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            ไม่พบกลุ่มสิทธิ์
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {rows.map((g) => (
            <Grid key={g.id} size={{ xs: 12, md: 6 }}>
              <GroupCard
                group={g}
                onAddPeople={() => openEdit(g, 'members')}
                onEdit={() => openEdit(g, 'detail')}
                onDelete={() => setToDelete(g)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <PermissionEditorDialog
        key={formKey}
        open={dialogOpen}
        initial={editing ? editingInput : undefined}
        initialSection={section}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>ลบกลุ่มสิทธิ์</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ลบกลุ่ม <strong>{toDelete?.name}</strong>? สมาชิกจะไม่ได้รับสิทธิ์จากกลุ่มนี้อีก การกระทำนี้ย้อนกลับไม่ได้
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
