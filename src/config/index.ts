import type { Breakpoint } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SummarizeIcon from '@mui/icons-material/Summarize';
import TimelineIcon from '@mui/icons-material/Timeline';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HistoryIcon from '@mui/icons-material/History';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import GradeIcon from '@mui/icons-material/Grade';
import ScoreIcon from '@mui/icons-material/Score';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import BuildIcon from '@mui/icons-material/Build';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import RuleIcon from '@mui/icons-material/Rule';
import StorageIcon from '@mui/icons-material/Storage';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import WidgetsIcon from '@mui/icons-material/Widgets';
import PaletteIcon from '@mui/icons-material/Palette';
import GroupsIcon from '@mui/icons-material/Groups';

import appConfigJson from './app.config.json';
import layoutConfigJson from './layout.config.json';
import menuConfigJson from './menu.config.json';

/**
 * Configuration loader.
 *
 * All editable settings live in the sibling `*.config.json` files so they can
 * be changed without touching code. This module just types that data and adds
 * the small bits JSON can't express (env overrides, icon components, helpers).
 */

// --- App config -----------------------------------------------------------

export const appConfig = {
  ...appConfigJson,
  api: {
    ...appConfigJson.api,
    // Allow an env override while keeping the JSON value as the default.
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? appConfigJson.api.baseUrl,
  },
};

export type AppConfig = typeof appConfig;

// --- Layout config --------------------------------------------------------

export interface LayoutConfig {
  drawerWidth: number;
  miniDrawerWidth: number;
  headerHeight: number;
  permanentDrawerBreakpoint: Breakpoint;
  sidebarDefaultOpen: boolean;
}

export const layoutConfig = layoutConfigJson as LayoutConfig;

// --- Menu config ----------------------------------------------------------

/** Maps the icon names used in `menu.config.json` to MUI icon components. */
const iconMap: Record<string, SvgIconComponent> = {
  Home: HomeIcon,
  Dashboard: DashboardIcon,
  People: PeopleIcon,
  Description: DescriptionIcon,
  Settings: SettingsIcon,
  ManageAccounts: ManageAccountsIcon,
  Assessment: AssessmentIcon,
  Summarize: SummarizeIcon,
  Timeline: TimelineIcon,
  NotificationsActive: NotificationsActiveIcon,
  RateReview: RateReviewIcon,
  AssignmentTurnedIn: AssignmentTurnedInIcon,
  History: HistoryIcon,
  AssignmentInd: AssignmentIndIcon,
  Grade: GradeIcon,
  Score: ScoreIcon,
  FileDownload: FileDownloadIcon,
  DynamicForm: DynamicFormIcon,
  Build: BuildIcon,
  LibraryBooks: LibraryBooksIcon,
  Rule: RuleIcon,
  Storage: StorageIcon,
  AccountTree: AccountTreeIcon,
  CalendarMonth: CalendarMonthIcon,
  MenuBook: MenuBookIcon,
  AdminPanelSettings: AdminPanelSettingsIcon,
  FactCheck: FactCheckIcon,
  Widgets: WidgetsIcon,
  Palette: PaletteIcon,
  Groups: GroupsIcon,
};

/** A single navigation entry, with its icon resolved to a component. */
export interface MenuItem {
  id: string;
  title: string;
  /** Route to navigate to. Optional for parents that only group `children`. */
  path?: string;
  icon: SvgIconComponent;
  /** Optional group label used to bucket items under a sidebar heading. */
  section?: string;
  roles?: string[];
  /** Nested items rendered as a collapsible submenu. */
  children?: MenuItem[];
}

interface RawMenuItem {
  id: string;
  title: string;
  path?: string;
  icon: string;
  section?: string;
  roles?: string[];
  children?: RawMenuItem[];
}

/** Resolve a raw config entry (and its children) into a typed `MenuItem`. */
function resolveItem(item: RawMenuItem): MenuItem {
  return {
    id: item.id,
    title: item.title,
    path: item.path,
    section: item.section,
    roles: item.roles,
    icon: iconMap[item.icon] ?? HomeIcon,
    children: item.children?.map(resolveItem),
  };
}

/** Primary navigation shown in the sidebar (single source of truth). */
export const menuItems: MenuItem[] = (menuConfigJson.items as RawMenuItem[]).map(resolveItem);

/** Items without a `roles` list are visible to everyone. */
function isVisibleForRole(item: MenuItem, role?: string): boolean {
  return !item.roles || item.roles.length === 0 || (role != null && item.roles.includes(role));
}

/**
 * Filter the menu tree by the current user's role. Children are filtered too,
 * and a parent whose children all get filtered out is dropped (it would
 * otherwise render as an empty submenu).
 */
export function getMenuForRole(role?: string): MenuItem[] {
  const walk = (items: MenuItem[]): MenuItem[] => {
    const out: MenuItem[] = [];
    for (const item of items) {
      if (!isVisibleForRole(item, role)) continue;
      if (item.children && item.children.length > 0) {
        const children = walk(item.children);
        if (children.length === 0) continue;
        out.push({ ...item, children });
      } else {
        out.push(item);
      }
    }
    return out;
  };
  return walk(menuItems);
}

/** A run of consecutive menu items sharing a section heading. */
export interface MenuGroup {
  section?: string;
  items: MenuItem[];
}

/**
 * Bucket the role-filtered menu into ordered sections for the sidebar.
 * Items keep their config order; consecutive items with the same `section`
 * are grouped under one heading. Items without a section fall into an
 * unlabeled leading group.
 */
export function getMenuGroupsForRole(role?: string): MenuGroup[] {
  const groups: MenuGroup[] = [];
  for (const item of getMenuForRole(role)) {
    const last = groups[groups.length - 1];
    if (last && last.section === item.section) {
      last.items.push(item);
    } else {
      groups.push({ section: item.section, items: [item] });
    }
  }
  return groups;
}
