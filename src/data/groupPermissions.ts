/**
 * Domain model for **Group Permission** — a named role/group that bundles:
 *
 *  - which menus (and submenus) its members can *see* and at what level
 *    (view-only vs. manage); a menu with neither is hidden entirely,
 *  - who belongs to it — specific users and/or whole user *types*
 *    (student / teacher / mentor …),
 *  - the organizational scope it may reach (faculties / departments) — members
 *    only ever see the faculties & departments selected here.
 *
 * The menu tree is the single source of truth from `@/config` (`menuItems`), so
 * new pages automatically show up in the permission editor.
 */

import { menuItems } from '@/config';
import { ACCENT } from '@/theme/accents';

// --- Access levels ----------------------------------------------------------

export type PermLevel = 'none' | 'view' | 'manage';

export const PERM_META: Record<Exclude<PermLevel, 'none'>, { label: string; color: string }> = {
  view: { label: 'ดูได้อย่างเดียว', color: ACCENT.blue },
  manage: { label: 'จัดการได้', color: ACCENT.green },
};

// --- User types (for the "add by group" tab) --------------------------------

export interface UserType {
  id: string;
  label: string;
  description: string;
  color: string;
}

export const USER_TYPES: UserType[] = [
  { id: 'student', label: 'นักศึกษา', description: 'ผู้ใช้ทุกคนที่เป็นนักศึกษา', color: ACCENT.blue },
  { id: 'teacher', label: 'อาจารย์', description: 'ผู้ใช้ทุกคนที่เป็นอาจารย์', color: ACCENT.violet },
  { id: 'mentor', label: 'พี่เลี้ยง', description: 'พี่โค้ช/พี่เลี้ยงประจำทีม', color: ACCENT.cyan },
  { id: 'staff', label: 'เจ้าหน้าที่', description: 'เจ้าหน้าที่ฝ่ายทะเบียน/ธุรการ', color: ACCENT.amber },
  { id: 'admin', label: 'ผู้ดูแลระบบ', description: 'ผู้ดูแลระบบทั้งหมด', color: ACCENT.pink },
];

export const userTypeMeta = (id: string) => USER_TYPES.find((t) => t.id === id);

// --- People in the system (for the "add individuals" tab) -------------------

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  type: string; // one of USER_TYPES ids
}

export const SYSTEM_USERS: SystemUser[] = [
  { id: 'u-anong', name: 'อ.ดร.อนงค์ วัฒนา', email: 'anong.w@peak.ac.th', type: 'teacher' },
  { id: 'u-kittset', name: 'ผศ.กิตติเศรษฐ์ เลาหง', email: 'kittset.l@peak.ac.th', type: 'teacher' },
  { id: 'u-prasit', name: 'อ.ประสิทธิ์ ทองดี', email: 'prasit.t@peak.ac.th', type: 'teacher' },
  { id: 'u-rungroj', name: 'อ.รุ่งโรจน์ ประเสริฐ', email: 'rungroj.p@peak.ac.th', type: 'teacher' },
  { id: 'u-malee', name: 'อ.มาลี สุขใจ', email: 'malee.s@peak.ac.th', type: 'teacher' },
  { id: 'u-suda', name: 'อ.สุดา มีสุข', email: 'suda.m@peak.ac.th', type: 'teacher' },
  { id: 'u-coach-ek', name: 'พี่เอก (โค้ชทีม)', email: 'ek.coach@peak.ac.th', type: 'mentor' },
  { id: 'u-coach-nat', name: 'พี่นัท (โค้ชทีม)', email: 'nat.coach@peak.ac.th', type: 'mentor' },
  { id: 'u-wanasart', name: 'วนศาสตร์ เนียนทะศาสตร์', email: '66160237@peak.ac.th', type: 'student' },
  { id: 'u-jiratchaya', name: 'จิรัชญา โพธิ์ขาว', email: '66160223@peak.ac.th', type: 'student' },
  { id: 'u-thanakorn', name: 'ธนากร ประเสริฐดีงาม', email: '66160228@peak.ac.th', type: 'student' },
  { id: 'u-wanida', name: 'วนิดา แก้วกล้า', email: 'wanida.k@peak.ac.th', type: 'staff' },
  { id: 'u-somchai', name: 'สมชาย บุญมี', email: 'somchai.b@peak.ac.th', type: 'admin' },
];

export const systemUser = (id: string) => SYSTEM_USERS.find((u) => u.id === id);

// --- Menu permission tree (derived from the app menu) -----------------------

export interface MenuLeaf {
  id: string;
  title: string;
}
export interface MenuNode {
  id: string;
  title: string;
  /** Submenu leaves, or `null` when the node is itself a page. */
  children: MenuLeaf[] | null;
}

/** The menu as permission nodes: top-level groups with their leaf submenus. */
export const MENU_NODES: MenuNode[] = menuItems.map((m) => ({
  id: m.id,
  title: m.title,
  children: m.children?.map((c) => ({ id: c.id, title: c.title })) ?? null,
}));

/** Every page-level id a permission can target (leaf top-levels + all submenus). */
export const MENU_LEAF_IDS: string[] = MENU_NODES.flatMap((n) =>
  n.children ? n.children.map((c) => c.id) : [n.id],
);

// --- Group Permission record ------------------------------------------------

export interface GroupPermission {
  id: string;
  name: string;
  description: string;
  /** Individual member user ids. */
  userIds: string[];
  /** Whole user types included as members. */
  types: string[];
  /** menu/submenu id → access level (missing key = 'none'). */
  permissions: Record<string, PermLevel>;
  /** When true, the group reaches every faculty & department. */
  allScope: boolean;
  facultyIds: string[];
  departmentIds: string[];
}

/** Small helper to author seed permission maps compactly. */
const perm = (entries: Record<string, PermLevel>): Record<string, PermLevel> => entries;

const allManage = (): Record<string, PermLevel> =>
  Object.fromEntries(MENU_LEAF_IDS.map((id) => [id, 'manage']));

export const GROUP_PERMISSIONS: GroupPermission[] = [
  {
    id: 'gp-admin',
    name: 'ผู้ดูแลระบบ',
    description: 'เข้าถึงและจัดการได้ทุกเมนู ทุกคณะ ทุกสาขา',
    userIds: ['u-somchai'],
    types: ['admin'],
    permissions: allManage(),
    allScope: true,
    facultyIds: [],
    departmentIds: [],
  },
  {
    id: 'gp-committee',
    name: 'กรรมการประเมิน',
    description: 'อาจารย์ผู้ทำหน้าที่ประเมิน ดูแดชบอร์ดและจัดการงานประเมินของตน',
    userIds: ['u-anong', 'u-kittset', 'u-prasit'],
    types: ['teacher'],
    permissions: perm({
      dashboard: 'view',
      'evaluation-tasks': 'manage',
      'evaluation-history': 'view',
      assignment: 'view',
      'scores-view': 'view',
      'scores-export': 'view',
    }),
    allScope: false,
    facultyIds: ['eng'],
    departmentIds: [],
  },
  {
    id: 'gp-student',
    name: 'นักศึกษา',
    description: 'ดูคะแนนของตนเองและทำแบบประเมินที่ได้รับมอบหมาย',
    userIds: [],
    types: ['student'],
    permissions: perm({
      home: 'view',
      'evaluation-tasks': 'manage',
      'scores-me': 'view',
      courses: 'view',
    }),
    allScope: false,
    facultyIds: [],
    departmentIds: ['eng-cpe'],
  },
  {
    id: 'gp-staff',
    name: 'เจ้าหน้าที่ทะเบียน',
    description: 'จัดการข้อมูลวิชาการ (คณะ/สาขา/วิชา/นักศึกษา/กลุ่ม)',
    userIds: ['u-wanida'],
    types: ['staff'],
    permissions: perm({
      dashboard: 'view',
      organization: 'manage',
      'academic-term': 'manage',
      courses: 'manage',
      students: 'manage',
      groups: 'manage',
    }),
    allScope: false,
    facultyIds: ['eng', 'sci'],
    departmentIds: [],
  },
];

// --- Derived counts (for the list cards) ------------------------------------

export const accessibleCount = (p: GroupPermission) =>
  Object.values(p.permissions).filter((l) => l !== 'none').length;

export const manageCount = (p: GroupPermission) =>
  Object.values(p.permissions).filter((l) => l === 'manage').length;

/** A fresh, empty group for the "add" flow. */
export const emptyGroupPermission = (): Omit<GroupPermission, 'id'> => ({
  name: '',
  description: '',
  userIds: [],
  types: [],
  permissions: {},
  allScope: false,
  facultyIds: [],
  departmentIds: [],
});
