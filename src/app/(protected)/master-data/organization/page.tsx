'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BusinessIcon from '@mui/icons-material/Business';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BadgeIcon from '@mui/icons-material/Badge';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PageHeader from '@/components/common/PageHeader';
import StatTile from '@/components/common/StatTile';
import { ACCENT } from '@/theme/accents';

interface OrgUnit {
  id: string;
  name: string;
  kind: 'faculty' | 'department';
  head?: string;
  members?: number;
  children?: OrgUnit[];
}

/** Demo organization tree. Replace with data from the backend. */
const ORG: OrgUnit[] = [
  {
    id: 'eng',
    name: 'Faculty of Engineering',
    kind: 'faculty',
    children: [
      { id: 'eng-cpe', name: 'Computer Engineering', kind: 'department', head: 'Dr. Anong W.', members: 42 },
      { id: 'eng-ee', name: 'Electrical Engineering', kind: 'department', head: 'Dr. Somsak R.', members: 35 },
      { id: 'eng-ce', name: 'Civil Engineering', kind: 'department', head: 'Aj. Prasit T.', members: 28 },
    ],
  },
  {
    id: 'sci',
    name: 'Faculty of Science',
    kind: 'faculty',
    children: [
      { id: 'sci-math', name: 'Mathematics', kind: 'department', head: 'Dr. Kittset L.', members: 22 },
      { id: 'sci-phy', name: 'Physics', kind: 'department', head: 'Dr. Malee S.', members: 19 },
      { id: 'sci-chem', name: 'Chemistry', kind: 'department', head: 'Aj. Wanida P.', members: 24 },
    ],
  },
  {
    id: 'bus',
    name: 'Faculty of Business',
    kind: 'faculty',
    children: [
      { id: 'bus-acc', name: 'Accounting', kind: 'department', head: 'Aj. Suda M.', members: 31 },
      { id: 'bus-mk', name: 'Marketing', kind: 'department', head: 'Aj. Prasit K.', members: 27 },
    ],
  },
];

const countMembers = (unit: OrgUnit): number =>
  (unit.members ?? 0) + (unit.children?.reduce((sum, c) => sum + countMembers(c), 0) ?? 0);

const flatten = (units: OrgUnit[]): OrgUnit[] =>
  units.flatMap((u) => [u, ...(u.children ? flatten(u.children) : [])]);

export default function OrganizationPage() {
  const all = flatten(ORG);
  const summary = {
    faculties: all.filter((u) => u.kind === 'faculty').length,
    departments: all.filter((u) => u.kind === 'department').length,
    members: ORG.reduce((sum, f) => sum + countMembers(f), 0),
    heads: all.filter((u) => u.head).length,
  };

  // Faculties start expanded so the whole structure is visible at a glance.
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set(ORG.map((f) => f.id)));
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const renderNode = (unit: OrgUnit, depth: number) => {
    const hasChildren = Boolean(unit.children?.length);
    const isOpen = expanded.has(unit.id);
    const isFaculty = unit.kind === 'faculty';
    const accent = isFaculty ? ACCENT.violet : ACCENT.blue;

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
              isOpen ? (
                <ExpandMoreIcon fontSize="small" />
              ) : (
                <ChevronRightIcon fontSize="small" />
              )
            ) : null}
          </Box>
          <Avatar
            variant="rounded"
            sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha(accent, 0.12), color: accent }}
          >
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
          <Chip
            size="small"
            variant="outlined"
            icon={<PeopleIcon />}
            label={countMembers(unit)}
            sx={{ '& .MuiChip-icon': { fontSize: 16 } }}
          />
          <Tooltip title="Edit unit">
            <IconButton size="small" onClick={(e) => e.stopPropagation()}>
              <EditIcon fontSize="small" />
            </IconButton>
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
        title="Organization Structure"
        description="Faculties, departments and their reporting lines."
        actions={
          <Button variant="contained" startIcon={<AddIcon />}>
            Add unit
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Faculties" value={summary.faculties} icon={BusinessIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Departments" value={summary.departments} icon={AccountTreeIcon} color={ACCENT.blue} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Total Members" value={summary.members} icon={PeopleIcon} color={ACCENT.green} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Unit Heads" value={summary.heads} icon={BadgeIcon} color={ACCENT.amber} />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Stack>{ORG.map((faculty) => renderNode(faculty, 0))}</Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
