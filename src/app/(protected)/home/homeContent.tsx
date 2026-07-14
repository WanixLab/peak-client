import type { SvgIconComponent } from '@mui/icons-material';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import RateReviewIcon from '@mui/icons-material/RateReview';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GradeIcon from '@mui/icons-material/Grade';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SummarizeIcon from '@mui/icons-material/Summarize';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BuildIcon from '@mui/icons-material/Build';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HistoryIcon from '@mui/icons-material/History';
import ScoreIcon from '@mui/icons-material/Score';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { ACCENT } from '@/theme/accents';

/**
 * Role-aware content for the home page.
 *
 * Everything the dashboard renders (hero copy, KPI cards, quick-action
 * shortcuts and the activity feed) is defined here per role, so adding or
 * tweaking a role never touches the page markup. This mirrors how the sidebar
 * is driven by `menu.config.json` + `getMenuForRole` — one data source, one
 * resolver, and a sensible fallback for roles we don't have a preset for.
 *
 * The numbers below are placeholder demo data; wire `getHomeContent` (or the
 * individual sections) to your API when the backend is ready.
 */

export type Trend = 'up' | 'down' | 'flat';

/** A single KPI tile. */
export interface HomeStat {
  id: string;
  label: string;
  value: string;
  /** Short delta caption, e.g. "+12% vs last term". Omit to hide the trend row. */
  delta?: string;
  trend?: Trend;
  icon: SvgIconComponent;
  color: string;
}

/** A shortcut card linking to a page the current role can access. */
export interface HomeAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: SvgIconComponent;
  color: string;
}

/** An entry in the recent-activity feed. */
export interface HomeActivity {
  id: string;
  title: string;
  time: string;
  icon: SvgIconComponent;
  color: string;
}

/** Everything the home page needs for one role. */
export interface HomeContent {
  /** Hero subtitle describing what this role can do here. */
  tagline: string;
  /** Primary call-to-action shown in the hero. */
  cta: { label: string; href: string };
  stats: HomeStat[];
  actions: HomeAction[];
  activity: HomeActivity[];
}

/** Display metadata for a role (chip label + accent colour). */
export interface RoleMeta {
  label: string;
  color: string;
}

// --- Per-role presets -------------------------------------------------------

const admin: HomeContent = {
  tagline:
    'You have full access to manage evaluations, forms, members, and system settings across the organization.',
  cta: { label: 'Manage members', href: '/users/members' },
  stats: [
    { id: 'users', label: 'Total Users', value: '1,204', delta: '+8% this term', trend: 'up', icon: GroupsIcon, color: ACCENT.violet },
    { id: 'active', label: 'Active Evaluations', value: '342', delta: '+12% this week', trend: 'up', icon: RateReviewIcon, color: ACCENT.blue },
    { id: 'forms', label: 'Published Forms', value: '28', delta: '3 drafts pending', trend: 'flat', icon: DynamicFormIcon, color: ACCENT.cyan },
    { id: 'approvals', label: 'Pending Approvals', value: '17', delta: 'Needs attention', trend: 'down', icon: PendingActionsIcon, color: ACCENT.amber },
  ],
  actions: [
    { id: 'members', title: 'Members', description: 'Add, edit and deactivate users', href: '/users/members', icon: PeopleIcon, color: ACCENT.violet },
    { id: 'permissions', title: 'Group Permission', description: 'Configure role access', href: '/users/group-permission', icon: AdminPanelSettingsIcon, color: ACCENT.blue },
    { id: 'builder', title: 'Form Builder', description: 'Create evaluation forms', href: '/forms/builder', icon: BuildIcon, color: ACCENT.cyan },
    { id: 'audit', title: 'Audit Log', description: 'Review system activity', href: '/system/audit-log', icon: FactCheckIcon, color: ACCENT.green },
    { id: 'org', title: 'Organization', description: 'Manage the structure', href: '/master-data/organization', icon: AccountTreeIcon, color: ACCENT.amber },
    { id: 'export', title: 'Export Report', description: 'Download score reports', href: '/scores/export', icon: FileDownloadIcon, color: ACCENT.pink },
  ],
  activity: [
    { id: 'a1', title: 'New member “Somchai P.” was added', time: '5 minutes ago', icon: PersonAddAlt1Icon, color: ACCENT.violet },
    { id: 'a2', title: 'Evaluation form “Q3 Review” was published', time: '1 hour ago', icon: DynamicFormIcon, color: ACCENT.cyan },
    { id: 'a3', title: 'Group permission “Reviewers” updated', time: '3 hours ago', icon: AdminPanelSettingsIcon, color: ACCENT.blue },
    { id: 'a4', title: 'Audit log exported by system', time: 'Yesterday', icon: FactCheckIcon, color: ACCENT.green },
  ],
};

const evaluator: HomeContent = {
  tagline:
    'Review the evaluations assigned to you and submit scores before each deadline.',
  cta: { label: 'Start evaluating', href: '/evaluation/tasks' },
  stats: [
    { id: 'pending', label: 'Pending Evaluations', value: '8', delta: 'Assigned to you', trend: 'flat', icon: PendingActionsIcon, color: ACCENT.amber },
    { id: 'done', label: 'Completed This Term', value: '46', delta: '+5 this week', trend: 'up', icon: CheckCircleIcon, color: ACCENT.green },
    { id: 'avg', label: 'Avg Score Given', value: '82.4', delta: 'Across 46 reviews', trend: 'flat', icon: GradeIcon, color: ACCENT.violet },
    { id: 'due', label: 'Due This Week', value: '3', delta: 'Closes Friday', trend: 'down', icon: ScheduleIcon, color: ACCENT.pink },
  ],
  actions: [
    { id: 'tasks', title: 'My Evaluations', description: 'Open assigned tasks', href: '/evaluation/tasks', icon: AssignmentTurnedInIcon, color: ACCENT.violet },
    { id: 'history', title: 'Evaluation History', description: 'Revisit past reviews', href: '/evaluation/history', icon: HistoryIcon, color: ACCENT.blue },
    { id: 'assign', title: 'Assignment', description: 'See who you evaluate', href: '/assignment', icon: AssignmentIndIcon, color: ACCENT.cyan },
    { id: 'scores', title: 'View Scores', description: 'Check submitted scores', href: '/scores/view', icon: ScoreIcon, color: ACCENT.green },
  ],
  activity: [
    { id: 'e1', title: 'You submitted an evaluation for “Project Alpha”', time: '20 minutes ago', icon: TaskAltIcon, color: ACCENT.green },
    { id: 'e2', title: 'New assignment: “Team B — Semester Review”', time: '2 hours ago', icon: AssignmentIndIcon, color: ACCENT.cyan },
    { id: 'e3', title: 'Reminder: 3 evaluations close this Friday', time: '5 hours ago', icon: ScheduleIcon, color: ACCENT.amber },
    { id: 'e4', title: 'Rubric “Teaching Quality” was updated', time: 'Yesterday', icon: RateReviewIcon, color: ACCENT.violet },
  ],
};

const evaluatee: HomeContent = {
  tagline:
    'Track the evaluations you have received and complete any pending self-assessments.',
  cta: { label: 'View my scores', href: '/scores/view' },
  stats: [
    { id: 'avg', label: 'My Average Score', value: '88.6', delta: '+2.1 vs last term', trend: 'up', icon: GradeIcon, color: ACCENT.green },
    { id: 'received', label: 'Evaluations Received', value: '12', delta: 'This academic year', trend: 'flat', icon: RateReviewIcon, color: ACCENT.blue },
    { id: 'todo', label: 'Forms To Complete', value: '2', delta: 'Self-assessment due', trend: 'down', icon: DynamicFormIcon, color: ACCENT.amber },
    { id: 'rank', label: 'Rank In Department', value: '#4', delta: 'of 24 members', trend: 'up', icon: EmojiEventsIcon, color: ACCENT.violet },
  ],
  actions: [
    { id: 'scores', title: 'View Scores', description: 'See your results', href: '/scores/view', icon: ScoreIcon, color: ACCENT.green },
    { id: 'tasks', title: 'My Evaluations', description: 'Complete self-assessments', href: '/evaluation/tasks', icon: AssignmentTurnedInIcon, color: ACCENT.violet },
    { id: 'subjects', title: 'Subjects', description: 'Browse your subjects', href: '/master-data/subjects', icon: MenuBookIcon, color: ACCENT.cyan },
    { id: 'notify', title: 'Notifications', description: 'Manage your alerts', href: '/system/notifications', icon: NotificationsActiveIcon, color: ACCENT.blue },
  ],
  activity: [
    { id: 'v1', title: 'You received a new evaluation result', time: '1 hour ago', icon: GradeIcon, color: ACCENT.green },
    { id: 'v2', title: 'Self-assessment “Semester 1” is due in 3 days', time: '4 hours ago', icon: ScheduleIcon, color: ACCENT.amber },
    { id: 'v3', title: 'Your score report for Q2 is ready', time: 'Yesterday', icon: SummarizeIcon, color: ACCENT.blue },
    { id: 'v4', title: 'You moved up to rank #4 in your department', time: '2 days ago', icon: EmojiEventsIcon, color: ACCENT.violet },
  ],
};

const manager: HomeContent = {
  tagline:
    "Monitor your team's evaluation progress and review department-level results.",
  cta: { label: 'View team scores', href: '/scores/view' },
  stats: [
    { id: 'team', label: 'Team Members', value: '24', delta: 'Across 3 subjects', trend: 'flat', icon: GroupsIcon, color: ACCENT.violet },
    { id: 'avg', label: 'Team Avg Score', value: '85.1', delta: '+2.3 vs last term', trend: 'up', icon: GradeIcon, color: ACCENT.green },
    { id: 'progress', label: 'Evaluations In Progress', value: '19', delta: '61% complete', trend: 'flat', icon: RateReviewIcon, color: ACCENT.blue },
    { id: 'reports', label: 'Reports Ready', value: '5', delta: 'Ready to export', trend: 'up', icon: SummarizeIcon, color: ACCENT.amber },
  ],
  actions: [
    { id: 'scores', title: 'View Scores', description: 'Team & individual results', href: '/scores/view', icon: ScoreIcon, color: ACCENT.green },
    { id: 'export', title: 'Export Report', description: 'Download summaries', href: '/scores/export', icon: FileDownloadIcon, color: ACCENT.amber },
    { id: 'assign', title: 'Assignment', description: 'Assign evaluators', href: '/assignment', icon: AssignmentIndIcon, color: ACCENT.cyan },
    { id: 'org', title: 'Organization', description: 'View team structure', href: '/master-data/organization', icon: AccountTreeIcon, color: ACCENT.violet },
  ],
  activity: [
    { id: 'm1', title: 'Team completed 19 of 31 evaluations', time: '30 minutes ago', icon: CheckCircleIcon, color: ACCENT.green },
    { id: 'm2', title: 'Q3 department report is ready to export', time: '2 hours ago', icon: SummarizeIcon, color: ACCENT.amber },
    { id: 'm3', title: 'You assigned “Nattapong K.” as an evaluator', time: 'Yesterday', icon: AssignmentIndIcon, color: ACCENT.cyan },
    { id: 'm4', title: 'Team average rose to 85.1 this term', time: '2 days ago', icon: TrendingUpIcon, color: ACCENT.blue },
  ],
};

/** Generic content for any role we don't have a dedicated preset for. */
const fallback: HomeContent = {
  tagline: "Welcome to PEAK. Here's a quick overview to help you get started.",
  cta: { label: 'Open dashboard', href: '/dashboard' },
  stats: [
    { id: 'tasks', label: 'Pending Tasks', value: '17', delta: 'Awaiting action', trend: 'flat', icon: PendingActionsIcon, color: ACCENT.amber },
    { id: 'evals', label: 'Evaluations', value: '12', delta: 'This term', trend: 'flat', icon: RateReviewIcon, color: ACCENT.blue },
    { id: 'docs', label: 'Documents', value: '328', delta: 'In your library', trend: 'flat', icon: DescriptionIcon, color: ACCENT.cyan },
    { id: 'notify', label: 'Notifications', value: '4', delta: 'Unread', trend: 'up', icon: NotificationsActiveIcon, color: ACCENT.violet },
  ],
  actions: [
    { id: 'dashboard', title: 'Dashboard', description: 'See your overview', href: '/dashboard', icon: DashboardIcon, color: ACCENT.violet },
    { id: 'tasks', title: 'My Evaluations', description: 'Open your tasks', href: '/evaluation/tasks', icon: AssignmentTurnedInIcon, color: ACCENT.blue },
    { id: 'scores', title: 'View Scores', description: 'Check results', href: '/scores/view', icon: ScoreIcon, color: ACCENT.green },
    { id: 'notify', title: 'Notifications', description: 'Manage your alerts', href: '/system/notifications', icon: NotificationsActiveIcon, color: ACCENT.amber },
  ],
  activity: [
    { id: 'f1', title: 'Welcome to PEAK — complete your profile to get started', time: 'Just now', icon: TaskAltIcon, color: ACCENT.violet },
    { id: 'f2', title: 'You have 2 unread notifications', time: '1 hour ago', icon: NotificationsActiveIcon, color: ACCENT.amber },
    { id: 'f3', title: 'A new evaluation form is available', time: 'Yesterday', icon: DynamicFormIcon, color: ACCENT.cyan },
  ],
};

// --- Resolvers --------------------------------------------------------------

const contentByRole: Record<string, HomeContent> = {
  admin,
  evaluator,
  evaluatee,
  manager,
};

const roleMeta: Record<string, RoleMeta> = {
  admin: { label: 'Administrator', color: ACCENT.violet },
  evaluator: { label: 'Evaluator', color: ACCENT.blue },
  evaluatee: { label: 'Evaluatee', color: ACCENT.green },
  manager: { label: 'Manager', color: ACCENT.amber },
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** Resolve the home content for a role, falling back to a generic preset. */
export function getHomeContent(role?: string): HomeContent {
  return (role && contentByRole[role]) || fallback;
}

/** Resolve a role's chip label and accent colour (derives a label if unknown). */
export function getRoleMeta(role?: string): RoleMeta {
  if (role && roleMeta[role]) return roleMeta[role];
  return { label: role ? capitalize(role) : 'Member', color: ACCENT.violet };
}
