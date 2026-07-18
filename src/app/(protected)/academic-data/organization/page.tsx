'use client';

import * as React from 'react';
import { Avatar, Box, Card, CardContent, Collapse, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
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

export default function OrganizationPage() {
  const all = flattenOrg();
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
          <Chip size="sm" variant="outlined" icon={PeopleIcon} color={accent} label={`${countStudents(unit)} คน`} />
          <Button variant="ghost" color={ACCENT.violet} size="sm" iconOnly startIcon={EditIcon} aria-label="แก้ไข" onClick={(e) => e.stopPropagation()} />
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
          <Button variant="solid" startIcon={AddIcon}>
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
          <Stack>{ORGANIZATION.map((faculty) => renderNode(faculty, 0))}</Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
