'use client';

import * as React from 'react';
import { Box, Card, CardContent, Divider, Grid, IconButton, Stack, Typography } from '@mui/material';
// Component showcase icons
import PushPinIcon from '@mui/icons-material/PushPin';
import ShieldIcon from '@mui/icons-material/Shield';
import BoltIcon from '@mui/icons-material/Bolt';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StarIcon from '@mui/icons-material/Star';
import BugReportIcon from '@mui/icons-material/BugReport';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ScoreIcon from '@mui/icons-material/Score';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import PeopleIcon from '@mui/icons-material/People';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import GradeIcon from '@mui/icons-material/Grade';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ApartmentIcon from '@mui/icons-material/Apartment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GroupIcon from '@mui/icons-material/Group';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DescriptionIcon from '@mui/icons-material/Description';
// Status-example icons (matching the reference mock)
import CropFreeIcon from '@mui/icons-material/CropFree';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import CancelIcon from '@mui/icons-material/Cancel';
import BuildIcon from '@mui/icons-material/Build';
import HandymanIcon from '@mui/icons-material/Handyman';
import FactCheckIcon from '@mui/icons-material/FactCheck';
// Components under showcase
import PageHeader from '@/components/common/PageHeader';
import AppChip, { type ChipVariant } from '@/components/common/Chip';
import AppButton, { type ButtonVariant, type ButtonSize } from '@/components/common/Button';
import SummaryCard, { type SummaryCardVariant } from '@/components/common/SummaryCard';
import StatTile from '@/components/common/StatTile';
import KpiCard from '@/components/common/KpiCard';
import QuickActions from '@/components/common/QuickActions';
import SearchField from '@/components/common/SearchField';
import FilterBar from '@/components/common/FilterBar';
import { ACCENT } from '@/theme/accents';

/** A titled showcase card with an optional muted caption on the right. */
function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {caption && (
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
              {caption}
            </Typography>
          )}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

/** A small overline label above a row of examples. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        {children}
      </Stack>
    </Box>
  );
}

/** A card-corner overflow menu button — demo affordance for KpiCard's `action` slot. */
function CardMenu() {
  return (
    <IconButton size="small" aria-label="More" onClick={(e) => e.stopPropagation()}>
      <MoreVertIcon fontSize="small" />
    </IconButton>
  );
}

/**
 * A saturated status palette for the "soft / tonal" examples — deliberately
 * NOT pastel: the fills are light tints, but each hue stays vivid so the label
 * text reads strongly on top (green = ok, red = problem, blue = info, …).
 */
const HUE = {
  violet: '#7C3AED',
  red: '#DC2626',
  rose: '#E11D48',
  orange: '#EA580C',
  green: '#16A34A',
  teal: '#0D9488',
  blue: '#2563EB',
};

const ROLE_OPTIONS = [
  { value: 'all', label: 'All roles' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'staff', label: 'Staff' },
];
const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];
const DEPARTMENT_OPTIONS = [
  { value: 'science', label: 'Science' },
  { value: 'math', label: 'Mathematics' },
  { value: 'thai', label: 'Thai' },
  { value: 'english', label: 'English' },
  { value: 'social', label: 'Social Studies' },
  { value: 'arts', label: 'Arts' },
];

export default function ComponentsPlaygroundPage() {
  // Interactive state for the search / filter demos.
  const [search, setSearch] = React.useState('');
  const [barSearch, setBarSearch] = React.useState('');
  const [role, setRole] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [departments, setDepartments] = React.useState<string[]>([]);
  const [date, setDate] = React.useState('');
  const [range, setRange] = React.useState({ from: '', to: '' });
  const filtersActive =
    barSearch !== '' ||
    role !== 'all' ||
    status !== 'all' ||
    departments.length > 0 ||
    date !== '' ||
    range.from !== '' ||
    range.to !== '';

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Components"
        description="A living gallery of the shared UI kit — every reusable component in one place, with its variants, sizes and states. Charts live on the Dashboard."
      />

      {/* ---------------- Buttons ---------------- */}
      <Section title="Button" caption="One colour in — fill, border & text fades out">
        <Stack spacing={2.5}>
          {(
            [
              { variant: 'solid', title: 'Solid (primary action)' },
              { variant: 'soft', title: 'Soft' },
              { variant: 'outlined', title: 'Outlined' },
              { variant: 'smooth', title: 'Smooth (gradient fade)' },
              { variant: 'ghost', title: 'Ghost (hover-only fill)' },
              { variant: 'link', title: 'Link' },
            ] as { variant: ButtonVariant; title: string }[]
          ).map(({ variant, title }) => (
            <Row key={variant} label={title}>
              <AppButton variant={variant} color={ACCENT.violet} startIcon={AddIcon}>
                Create
              </AppButton>
              <AppButton variant={variant} color={ACCENT.blue} startIcon={DownloadIcon}>
                Export
              </AppButton>
              <AppButton variant={variant} color={ACCENT.green} endIcon={ArrowForwardIcon}>
                Continue
              </AppButton>
              <AppButton variant={variant} color={ACCENT.pink} startIcon={DeleteOutlineIcon}>
                Delete
              </AppButton>
              <AppButton variant={variant} color={ACCENT.amber}>
                Plain
              </AppButton>
            </Row>
          ))}

          <Divider />

          <Row label="Sizes">
            {(['sm', 'md', 'lg'] as ButtonSize[]).map((sz) => (
              <AppButton key={sz} size={sz} color={ACCENT.violet} startIcon={AddIcon}>
                {sz === 'sm' ? 'Small' : sz === 'md' ? 'Medium' : 'Large'}
              </AppButton>
            ))}
          </Row>

          <Row label="States & layout">
            <AppButton color={ACCENT.blue} loading>
              Saving…
            </AppButton>
            <AppButton color={ACCENT.blue} disabled>
              Disabled
            </AppButton>
            <AppButton variant="soft" color={ACCENT.cyan} iconOnly startIcon={SettingsIcon} aria-label="Settings" />
            <AppButton variant="outlined" color={ACCENT.violet} iconOnly startIcon={AddIcon} aria-label="Add" />
          </Row>
          <Box sx={{ maxWidth: 320 }}>
            <AppButton variant="solid" color={ACCENT.violet} startIcon={AddIcon} fullWidth>
              Full-width action
            </AppButton>
          </Box>
        </Stack>
      </Section>

      {/* ---------------- Chips ---------------- */}
      <Section title="Chip" caption="One colour in — background, border & text fades out">
        <Stack spacing={2.5}>
          {(
            [
              { variant: 'outlined', title: 'Outlined' },
              { variant: 'soft', title: 'Soft' },
              { variant: 'plain', title: 'Plain (soft, no border)' },
              { variant: 'solid', title: 'Solid' },
              { variant: 'smooth', title: 'Smooth (pill + fade)' },
            ] as { variant: ChipVariant; title: string }[]
          ).map(({ variant, title }) => (
            <Row key={variant} label={title}>
              <AppChip variant={variant} color={ACCENT.blue} icon={PushPinIcon} label="Pin" />
              <AppChip variant={variant} color={ACCENT.green} icon={ShieldIcon} label="Shield" />
              <AppChip variant={variant} color={ACCENT.violet} icon={BoltIcon} label="Activity" />
              <AppChip variant={variant} color={ACCENT.amber} icon={StarIcon} label="Featured" />
              <AppChip variant={variant} color={ACCENT.pink} icon={FavoriteIcon} label="Likeable" />
              <AppChip variant={variant} color={ACCENT.cyan} icon={LocalOfferIcon} label="Tag" />
              <AppChip variant={variant} color={ACCENT.amber} label="No icon" />
              <AppChip variant={variant} color={ACCENT.pink} icon={BugReportIcon} label="Deletable" onDelete={() => {}} />
            </Row>
          ))}

          <Divider />

          <Row label="Sizes & states">
            <AppChip size="sm" variant="soft" color={ACCENT.violet} icon={StarIcon} label="Small" />
            <AppChip size="md" variant="soft" color={ACCENT.violet} icon={StarIcon} label="Medium" />
            <AppChip variant="smooth" color={ACCENT.green} label="Selected" selected onClick={() => {}} />
            <AppChip variant="outlined" color={ACCENT.blue} label="Clickable" onClick={() => {}} />
            <AppChip variant="solid" color={ACCENT.amber} label="Disabled" disabled />
          </Row>
        </Stack>
      </Section>

      {/* ---------------- KPI cards ---------------- */}
      <Section title="KPI Card" caption="By type — large on top, compact below, plus a hero row">
        <Stack spacing={3}>
          {/* --- Large zone --- */}
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Large — soft &amp; solid icon, up / down delta, plain, and interactive + menu
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <KpiCard
                  label="Overall Progress"
                  value="66%"
                  icon={DonutLargeIcon}
                  color={ACCENT.violet}
                  caption="326 of 495 evaluations"
                  delta={{ value: 4, period: 'vs last term' }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <KpiCard
                  label="Average Score"
                  value="81.1"
                  icon={GradeIcon}
                  color={ACCENT.blue}
                  iconStyle="solid"
                  caption="Solid icon badge"
                  delta={{ value: 3, period: 'vs last term' }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <KpiCard
                  label="Overdue Reviews"
                  value={12}
                  icon={WarningAmberIcon}
                  color={ACCENT.amber}
                  caption="Needs attention"
                  delta={{ value: -8, period: 'vs last term' }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <KpiCard
                  label="Active Users"
                  value="1,204"
                  icon={GroupIcon}
                  color={ACCENT.green}
                  caption="Signed in this week"
                  onClick={() => {}}
                  action={<CardMenu />}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* --- Compact zone --- */}
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Compact — dense rows: up / down delta, no delta, solid icon, and interactive + menu
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <KpiCard variant="compact" label="Completed" value={326} icon={CheckCircleIcon} color={ACCENT.green} delta={{ value: 8, period: 'vs last term' }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <KpiCard variant="compact" label="Pending" value={81} icon={HourglassEmptyIcon} color={ACCENT.amber} delta={{ value: -3 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <KpiCard variant="compact" label="Evaluators" value={42} icon={PeopleIcon} color={ACCENT.pink} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <KpiCard variant="compact" label="Departments" value={6} icon={ApartmentIcon} color={ACCENT.violet} iconStyle="solid" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <KpiCard variant="compact" label="In Progress" value={88} icon={EditNoteIcon} color={ACCENT.cyan} delta={{ value: 6 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <KpiCard variant="compact" label="Templates" value={14} icon={DescriptionIcon} color={ACCENT.blue} onClick={() => {}} action={<CardMenu />} />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* --- Hero row --- */}
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              KPI row — one large card + a stack of compact cards
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 5 }}>
                <KpiCard
                  label="Overall Progress"
                  value="66%"
                  icon={DonutLargeIcon}
                  color={ACCENT.violet}
                  caption="326 of 495 evaluations"
                  delta={{ value: 4, period: 'vs last term' }}
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 7 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <KpiCard variant="compact" label="Completed" value={326} icon={CheckCircleIcon} color={ACCENT.green} delta={{ value: 8, period: 'vs last term' }} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <KpiCard variant="compact" label="In Progress" value={88} icon={EditNoteIcon} color={ACCENT.cyan} delta={{ value: 6 }} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <KpiCard variant="compact" label="Pending" value={81} icon={HourglassEmptyIcon} color={ACCENT.amber} delta={{ value: -3 }} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <KpiCard variant="compact" label="Evaluators" value={42} icon={PeopleIcon} color={ACCENT.pink} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Section>

      {/* ---------------- Quick actions ---------------- */}
      <Section title="Quick Actions" caption="Sum-card style shortcut grid">
        <QuickActions
          title={null}
          columns={{ xs: 1, sm: 2, lg: 3 }}
          actions={[
            { id: 'evaluate', title: 'New Evaluation', description: 'Start an evaluation round', href: '/evaluation/tasks', icon: RateReviewIcon, color: ACCENT.violet },
            { id: 'scores', title: 'View Scores', description: 'Browse submitted results', href: '/scores/view', icon: ScoreIcon, color: ACCENT.green },
            { id: 'export', title: 'Export Report', description: 'Download the score report', href: '/scores/export', icon: DownloadIcon, color: ACCENT.blue },
            { id: 'assign', title: 'Assignment', description: 'Assign evaluators', href: '/assignment', icon: AssignmentIndIcon, color: ACCENT.cyan },
            { id: 'members', title: 'Members', description: 'Manage user accounts', href: '/users/members', icon: PeopleIcon, color: ACCENT.pink },
            { id: 'forms', title: 'Form Builder', description: 'Create evaluation forms', href: '/forms/builder', icon: DynamicFormIcon, color: ACCENT.amber },
          ]}
        />
      </Section>

      {/* ---------------- Search & Filters ---------------- */}
      <Section title="Search & Filters" caption="System-wide list controls">
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              FilterBar — search + single-select, multi-select, date & date-range
            </Typography>
            <FilterBar
              filters={[
                { key: 'role', label: 'Role', value: role, onChange: setRole, minWidth: 150, options: ROLE_OPTIONS },
                { key: 'status', label: 'Status', value: status, onChange: setStatus, minWidth: 150, options: STATUS_OPTIONS },
                {
                  key: 'departments',
                  type: 'multiselect',
                  label: 'Departments',
                  value: departments,
                  onChange: setDepartments,
                  minWidth: 180,
                  options: DEPARTMENT_OPTIONS,
                },
                { key: 'date', type: 'date', label: 'Due date', value: date, onChange: setDate },
                { key: 'range', type: 'daterange', label: 'Date range', value: range, onChange: setRange },
              ]}
              search={{ value: barSearch, onChange: setBarSearch, placeholder: 'Search…' }}
              active={filtersActive}
              onReset={() => {
                setBarSearch('');
                setRole('all');
                setStatus('all');
                setDepartments([]);
                setDate('');
                setRange({ from: '', to: '' });
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Active:{' '}
              {filtersActive
                ? `role=${role}, status=${status}, depts=[${departments.join(', ') || '—'}], ` +
                  `date=${date || '—'}, range=${range.from || '…'}→${range.to || '…'}, q=“${barSearch}”`
                : 'none'}
            </Typography>
          </Box>
        </Stack>
      </Section>
    </Stack>
  );
}
