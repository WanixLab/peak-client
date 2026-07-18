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
import SchoolIcon from '@mui/icons-material/School';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import ForumIcon from '@mui/icons-material/Forum';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { ACCENT } from '@/theme/accents';

/**
 * เนื้อหาหน้าแรกแบบแยกตามบทบาท (role-aware).
 *
 * ทุกอย่างที่แดชบอร์ดแสดง (ข้อความหัวเรื่อง, การ์ด KPI, ทางลัด และฟีดกิจกรรม)
 * ถูกกำหนดไว้ที่นี่แยกตามบทบาท เพื่อให้การเพิ่มหรือปรับบทบาทไม่ต้องแก้ที่หน้าเพจ
 * เลย เหมือนกับที่แถบเมนูถูกขับเคลื่อนด้วย `menu.config.json` + `getMenuForRole`
 * คือมีแหล่งข้อมูลเดียว ตัวแปลงเดียว และมีค่าเริ่มต้นสำรองสำหรับบทบาทที่ไม่มีชุด
 * ข้อมูลเฉพาะ
 *
 * ตัวเลขด้านล่างเป็นข้อมูลตัวอย่างสำหรับสาธิต ให้เชื่อม `getHomeContent`
 * (หรือแต่ละส่วน) เข้ากับ API เมื่อฝั่งเซิร์ฟเวอร์พร้อมใช้งาน
 */

/** การ์ด KPI หนึ่งใบ (map ตรงกับ props ของ `KpiCard`). */
export interface HomeStat {
  id: string;
  label: string;
  value: string;
  icon: SvgIconComponent;
  color: string;
  /** เปอร์เซ็นต์การเปลี่ยนแปลงเทียบกับช่วงก่อนหน้า — แสดงลูกศร + % ให้อัตโนมัติ */
  delta?: { value: number; period?: string };
  /** คำอธิบายสั้นใต้ค่า สำหรับบริบทที่ไม่ใช่เปอร์เซ็นต์ */
  caption?: string;
}

/** การ์ดทางลัดที่ลิงก์ไปยังหน้าที่บทบาทปัจจุบันเข้าถึงได้ */
export interface HomeAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: SvgIconComponent;
  color: string;
}

/** รายการหนึ่งในฟีดกิจกรรมล่าสุด */
export interface HomeActivity {
  id: string;
  title: string;
  time: string;
  icon: SvgIconComponent;
  color: string;
}

/** ทุกอย่างที่หน้าแรกต้องใช้สำหรับหนึ่งบทบาท */
export interface HomeContent {
  /** ข้อความบรรยายใต้หัวเรื่องว่าบทบาทนี้ทำอะไรได้บ้าง */
  tagline: string;
  /** ปุ่มการกระทำหลักที่แสดงในส่วนหัว */
  cta: { label: string; href: string };
  stats: HomeStat[];
  actions: HomeAction[];
  activity: HomeActivity[];
}

/** ข้อมูลแสดงผลของบทบาท (ป้ายชื่อ + สีเน้น) */
export interface RoleMeta {
  label: string;
  color: string;
}

// --- ชุดข้อมูลแยกตามบทบาท ----------------------------------------------------

// บทบาทหลักสามอย่างของระบบ: นักเรียน, อาจารย์, พี่เลี้ยง

const student: HomeContent = {
  tagline:
    'ดูผลการประเมินที่คุณได้รับ ทำแบบประเมินตนเองที่ค้างอยู่ให้เสร็จ และติดตามพัฒนาการของคุณในเทอมนี้',
  cta: { label: 'ดูคะแนนของฉัน', href: '/scores/me' },
  stats: [
    { id: 'avg', label: 'คะแนนเฉลี่ยของฉัน', value: '87.2', caption: 'สูงขึ้น +1.8 จากเทอมก่อน', icon: GradeIcon, color: ACCENT.green },
    { id: 'received', label: 'ผลประเมินที่ได้รับ', value: '9', caption: 'ในปีการศึกษานี้', icon: RateReviewIcon, color: ACCENT.blue },
    { id: 'todo', label: 'แบบประเมินตนเองที่ต้องทำ', value: '2', caption: 'ครบกำหนดสัปดาห์นี้', icon: DynamicFormIcon, color: ACCENT.amber },
    { id: 'subjects', label: 'วิชาที่ลงทะเบียน', value: '6', caption: 'ภาคเรียนนี้', icon: MenuBookIcon, color: ACCENT.violet },
  ],
  actions: [
    { id: 'tasks', title: 'การประเมินของฉัน', description: 'ทำแบบประเมินตนเอง', href: '/evaluation/tasks', icon: AssignmentTurnedInIcon, color: ACCENT.violet },
    { id: 'scores', title: 'ดูคะแนน', description: 'ดูผลลัพธ์ของคุณ', href: '/scores/me', icon: ScoreIcon, color: ACCENT.green },
    { id: 'subjects', title: 'รายวิชา', description: 'ดูวิชาของคุณ', href: '/academic-data/courses', icon: MenuBookIcon, color: ACCENT.cyan },
    { id: 'notify', title: 'การแจ้งเตือน', description: 'จัดการการแจ้งเตือนของคุณ', href: '/system/notifications', icon: NotificationsActiveIcon, color: ACCENT.blue },
  ],
  activity: [
    { id: 's1', title: 'คุณได้รับผลการประเมินใหม่', time: '1 ชั่วโมงที่แล้ว', icon: GradeIcon, color: ACCENT.green },
    { id: 's2', title: 'แบบประเมินตนเอง “ภาคเรียนที่ 1” ครบกำหนดในอีก 3 วัน', time: '4 ชั่วโมงที่แล้ว', icon: ScheduleIcon, color: ACCENT.amber },
    { id: 's3', title: 'พี่เลี้ยงของคุณให้ความเห็นใน “โปรเจกต์ Beta”', time: 'เมื่อวาน', icon: ForumIcon, color: ACCENT.cyan },
    { id: 's4', title: 'รายงานคะแนนไตรมาส 2 ของคุณพร้อมแล้ว', time: '2 วันก่อน', icon: SummarizeIcon, color: ACCENT.blue },
  ],
};

const teacher: HomeContent = {
  tagline:
    'ตรวจนักเรียนที่ได้รับมอบหมาย ส่งคะแนนให้ทันกำหนด และดูแลแบบฟอร์มการประเมินให้เป็นปัจจุบัน',
  cta: { label: 'เริ่มประเมิน', href: '/evaluation/tasks' },
  stats: [
    { id: 'pending', label: 'การประเมินที่รอดำเนินการ', value: '11', caption: 'ที่มอบหมายให้คุณ', icon: PendingActionsIcon, color: ACCENT.amber },
    { id: 'students', label: 'นักเรียน', value: '38', caption: 'ครอบคลุม 3 รายวิชา', icon: GroupsIcon, color: ACCENT.violet },
    { id: 'done', label: 'เสร็จแล้วในเทอมนี้', value: '52', delta: { value: 16, period: 'เทียบสัปดาห์ก่อน' }, icon: CheckCircleIcon, color: ACCENT.green },
    { id: 'due', label: 'ครบกำหนดสัปดาห์นี้', value: '4', caption: 'ปิดวันศุกร์', icon: ScheduleIcon, color: ACCENT.pink },
  ],
  actions: [
    { id: 'tasks', title: 'การประเมินของฉัน', description: 'เปิดงานที่ได้รับมอบหมาย', href: '/evaluation/tasks', icon: AssignmentTurnedInIcon, color: ACCENT.violet },
    { id: 'builder', title: 'สร้างแบบฟอร์ม', description: 'สร้างแบบฟอร์มการประเมิน', href: '/forms/builder', icon: BuildIcon, color: ACCENT.cyan },
    { id: 'assign', title: 'การมอบหมาย', description: 'ดูว่าคุณต้องประเมินใคร', href: '/assignment', icon: AssignmentIndIcon, color: ACCENT.blue },
    { id: 'scores', title: 'ดูคะแนน', description: 'ตรวจสอบคะแนนที่ส่งแล้ว', href: '/scores/view', icon: ScoreIcon, color: ACCENT.green },
  ],
  activity: [
    { id: 't1', title: 'คุณส่งการประเมินสำหรับ “ณัฐพงษ์ ก.”', time: '25 นาทีที่แล้ว', icon: TaskAltIcon, color: ACCENT.green },
    { id: 't2', title: 'งานใหม่: “ห้อง 4/2 — รีวิวประจำภาค”', time: '2 ชั่วโมงที่แล้ว', icon: AssignmentIndIcon, color: ACCENT.cyan },
    { id: 't3', title: 'เตือน: มี 4 การประเมินจะปิดวันศุกร์นี้', time: '5 ชั่วโมงที่แล้ว', icon: ScheduleIcon, color: ACCENT.amber },
    { id: 't4', title: 'อัปเดตเกณฑ์ “คุณภาพการสอน”', time: 'เมื่อวาน', icon: RateReviewIcon, color: ACCENT.violet },
  ],
};

const mentor: HomeContent = {
  tagline:
    'ดูแลน้องในความรับผิดชอบ ติดตามความคืบหน้าการประเมิน และให้คำแนะนำในจุดที่สำคัญที่สุด',
  cta: { label: 'ดูคะแนนของน้อง', href: '/scores/view' },
  stats: [
    { id: 'mentees', label: 'น้องในความดูแล', value: '12', caption: 'ที่คุณดูแลอยู่', icon: Diversity3Icon, color: ACCENT.violet },
    { id: 'avg', label: 'คะแนนเฉลี่ยของน้อง', value: '84.3', caption: 'สูงขึ้น +2.6 จากเทอมก่อน', icon: GradeIcon, color: ACCENT.green },
    { id: 'progress', label: 'การประเมินที่กำลังดำเนินอยู่', value: '15', caption: 'เสร็จแล้ว 58%', icon: RateReviewIcon, color: ACCENT.blue },
    { id: 'attention', label: 'ต้องการการดูแล', value: '3', caption: 'ต่ำกว่าเป้าหมาย', icon: PendingActionsIcon, color: ACCENT.amber },
  ],
  actions: [
    { id: 'scores', title: 'ดูคะแนน', description: 'ผลของน้องและกลุ่ม', href: '/scores/view', icon: ScoreIcon, color: ACCENT.green },
    { id: 'assign', title: 'การมอบหมาย', description: 'ดูกลุ่มน้องของคุณ', href: '/assignment', icon: AssignmentIndIcon, color: ACCENT.cyan },
    { id: 'history', title: 'ประวัติการประเมิน', description: 'ย้อนดูการประเมินที่ผ่านมา', href: '/evaluation/history', icon: HistoryIcon, color: ACCENT.blue },
    { id: 'export', title: 'ส่งออกรายงาน', description: 'ดาวน์โหลดสรุปผล', href: '/scores/export', icon: FileDownloadIcon, color: ACCENT.amber },
  ],
  activity: [
    { id: 'me1', title: '“สมชาย พ.” ทำแบบประเมินตนเองเสร็จแล้ว', time: '40 นาทีที่แล้ว', icon: CheckCircleIcon, color: ACCENT.green },
    { id: 'me2', title: 'คุณให้ความเห็นสำหรับ “โปรเจกต์ Beta”', time: '2 ชั่วโมงที่แล้ว', icon: ForumIcon, color: ACCENT.cyan },
    { id: 'me3', title: 'มีน้อง 3 คนมีแนวโน้มต่ำกว่าเป้าหมายในเทอมนี้', time: 'เมื่อวาน', icon: SupervisorAccountIcon, color: ACCENT.amber },
    { id: 'me4', title: 'คะแนนเฉลี่ยของน้องขึ้นเป็น 84.3 ในเทอมนี้', time: '2 วันก่อน', icon: TrendingUpIcon, color: ACCENT.blue },
  ],
};

const admin: HomeContent = {
  tagline:
    'คุณมีสิทธิ์เต็มในการจัดการการประเมิน แบบฟอร์ม สมาชิก และการตั้งค่าระบบทั้งหมดขององค์กร',
  cta: { label: 'จัดการสมาชิก', href: '/users/members' },
  stats: [
    { id: 'users', label: 'ผู้ใช้ทั้งหมด', value: '1,204', delta: { value: 8, period: 'เทอมนี้' }, icon: GroupsIcon, color: ACCENT.violet },
    { id: 'active', label: 'การประเมินที่ดำเนินอยู่', value: '342', delta: { value: 12, period: 'สัปดาห์นี้' }, icon: RateReviewIcon, color: ACCENT.blue },
    { id: 'forms', label: 'แบบฟอร์มที่เผยแพร่', value: '28', caption: 'มีฉบับร่าง 3 รายการรอดำเนินการ', icon: DynamicFormIcon, color: ACCENT.cyan },
    { id: 'approvals', label: 'รออนุมัติ', value: '17', caption: 'ต้องการการดูแล', icon: PendingActionsIcon, color: ACCENT.amber },
  ],
  actions: [
    { id: 'members', title: 'สมาชิก', description: 'เพิ่ม แก้ไข และปิดการใช้งานผู้ใช้', href: '/users/members', icon: PeopleIcon, color: ACCENT.violet },
    { id: 'permissions', title: 'สิทธิ์ตามกลุ่ม', description: 'กำหนดสิทธิ์การเข้าถึงของบทบาท', href: '/users/group-permission', icon: AdminPanelSettingsIcon, color: ACCENT.blue },
    { id: 'builder', title: 'สร้างแบบฟอร์ม', description: 'สร้างแบบฟอร์มการประเมิน', href: '/forms/builder', icon: BuildIcon, color: ACCENT.cyan },
    { id: 'audit', title: 'บันทึกการใช้งาน', description: 'ตรวจสอบกิจกรรมของระบบ', href: '/system/audit-log', icon: FactCheckIcon, color: ACCENT.green },
    { id: 'org', title: 'โครงสร้างองค์กร', description: 'จัดการโครงสร้าง', href: '/academic-data/organization', icon: AccountTreeIcon, color: ACCENT.amber },
    { id: 'export', title: 'ส่งออกรายงาน', description: 'ดาวน์โหลดรายงานคะแนน', href: '/scores/export', icon: FileDownloadIcon, color: ACCENT.pink },
  ],
  activity: [
    { id: 'a1', title: 'เพิ่มสมาชิกใหม่ “สมชาย พ.”', time: '5 นาทีที่แล้ว', icon: PersonAddAlt1Icon, color: ACCENT.violet },
    { id: 'a2', title: 'เผยแพร่แบบฟอร์มประเมิน “รีวิวไตรมาส 3”', time: '1 ชั่วโมงที่แล้ว', icon: DynamicFormIcon, color: ACCENT.cyan },
    { id: 'a3', title: 'อัปเดตสิทธิ์กลุ่ม “ผู้ประเมิน”', time: '3 ชั่วโมงที่แล้ว', icon: AdminPanelSettingsIcon, color: ACCENT.blue },
    { id: 'a4', title: 'ระบบส่งออกบันทึกการใช้งาน', time: 'เมื่อวาน', icon: FactCheckIcon, color: ACCENT.green },
  ],
};

const evaluator: HomeContent = {
  tagline: 'ตรวจการประเมินที่ได้รับมอบหมาย และส่งคะแนนให้ทันกำหนดของแต่ละงาน',
  cta: { label: 'เริ่มประเมิน', href: '/evaluation/tasks' },
  stats: [
    { id: 'pending', label: 'การประเมินที่รอดำเนินการ', value: '8', caption: 'ที่มอบหมายให้คุณ', icon: PendingActionsIcon, color: ACCENT.amber },
    { id: 'done', label: 'เสร็จแล้วในเทอมนี้', value: '46', caption: 'เพิ่มขึ้น 5 รายการสัปดาห์นี้', icon: CheckCircleIcon, color: ACCENT.green },
    { id: 'avg', label: 'คะแนนเฉลี่ยที่ให้', value: '82.4', caption: 'จาก 46 การประเมิน', icon: GradeIcon, color: ACCENT.violet },
    { id: 'due', label: 'ครบกำหนดสัปดาห์นี้', value: '3', caption: 'ปิดวันศุกร์', icon: ScheduleIcon, color: ACCENT.pink },
  ],
  actions: [
    { id: 'tasks', title: 'การประเมินของฉัน', description: 'เปิดงานที่ได้รับมอบหมาย', href: '/evaluation/tasks', icon: AssignmentTurnedInIcon, color: ACCENT.violet },
    { id: 'history', title: 'ประวัติการประเมิน', description: 'ย้อนดูการประเมินที่ผ่านมา', href: '/evaluation/history', icon: HistoryIcon, color: ACCENT.blue },
    { id: 'assign', title: 'การมอบหมาย', description: 'ดูว่าคุณต้องประเมินใคร', href: '/assignment', icon: AssignmentIndIcon, color: ACCENT.cyan },
    { id: 'scores', title: 'ดูคะแนน', description: 'ตรวจสอบคะแนนที่ส่งแล้ว', href: '/scores/view', icon: ScoreIcon, color: ACCENT.green },
  ],
  activity: [
    { id: 'e1', title: 'คุณส่งการประเมินสำหรับ “โปรเจกต์ Alpha”', time: '20 นาทีที่แล้ว', icon: TaskAltIcon, color: ACCENT.green },
    { id: 'e2', title: 'งานใหม่: “ทีม B — รีวิวประจำภาค”', time: '2 ชั่วโมงที่แล้ว', icon: AssignmentIndIcon, color: ACCENT.cyan },
    { id: 'e3', title: 'เตือน: มี 3 การประเมินจะปิดวันศุกร์นี้', time: '5 ชั่วโมงที่แล้ว', icon: ScheduleIcon, color: ACCENT.amber },
    { id: 'e4', title: 'อัปเดตเกณฑ์ “คุณภาพการสอน”', time: 'เมื่อวาน', icon: RateReviewIcon, color: ACCENT.violet },
  ],
};

const evaluatee: HomeContent = {
  tagline: 'ติดตามผลการประเมินที่คุณได้รับ และทำแบบประเมินตนเองที่ค้างอยู่ให้เสร็จ',
  cta: { label: 'ดูคะแนนของฉัน', href: '/scores/me' },
  stats: [
    { id: 'avg', label: 'คะแนนเฉลี่ยของฉัน', value: '88.6', caption: 'สูงขึ้น +2.1 จากเทอมก่อน', icon: GradeIcon, color: ACCENT.green },
    { id: 'received', label: 'ผลประเมินที่ได้รับ', value: '12', caption: 'ในปีการศึกษานี้', icon: RateReviewIcon, color: ACCENT.blue },
    { id: 'todo', label: 'แบบฟอร์มที่ต้องทำ', value: '2', caption: 'ครบกำหนดประเมินตนเอง', icon: DynamicFormIcon, color: ACCENT.amber },
    { id: 'rank', label: 'อันดับในหน่วยงาน', value: '#4', caption: 'จากทั้งหมด 24 คน', icon: EmojiEventsIcon, color: ACCENT.violet },
  ],
  actions: [
    { id: 'scores', title: 'ดูคะแนน', description: 'ดูผลลัพธ์ของคุณ', href: '/scores/me', icon: ScoreIcon, color: ACCENT.green },
    { id: 'tasks', title: 'การประเมินของฉัน', description: 'ทำแบบประเมินตนเอง', href: '/evaluation/tasks', icon: AssignmentTurnedInIcon, color: ACCENT.violet },
    { id: 'subjects', title: 'รายวิชา', description: 'ดูวิชาของคุณ', href: '/academic-data/courses', icon: MenuBookIcon, color: ACCENT.cyan },
    { id: 'notify', title: 'การแจ้งเตือน', description: 'จัดการการแจ้งเตือนของคุณ', href: '/system/notifications', icon: NotificationsActiveIcon, color: ACCENT.blue },
  ],
  activity: [
    { id: 'v1', title: 'คุณได้รับผลการประเมินใหม่', time: '1 ชั่วโมงที่แล้ว', icon: GradeIcon, color: ACCENT.green },
    { id: 'v2', title: 'แบบประเมินตนเอง “ภาคเรียนที่ 1” ครบกำหนดในอีก 3 วัน', time: '4 ชั่วโมงที่แล้ว', icon: ScheduleIcon, color: ACCENT.amber },
    { id: 'v3', title: 'รายงานคะแนนไตรมาส 2 ของคุณพร้อมแล้ว', time: 'เมื่อวาน', icon: SummarizeIcon, color: ACCENT.blue },
    { id: 'v4', title: 'คุณขยับขึ้นเป็นอันดับ #4 ในหน่วยงาน', time: '2 วันก่อน', icon: EmojiEventsIcon, color: ACCENT.violet },
  ],
};

const manager: HomeContent = {
  tagline: 'ติดตามความคืบหน้าการประเมินของทีม และดูผลลัพธ์ระดับหน่วยงาน',
  cta: { label: 'ดูคะแนนของทีม', href: '/scores/view' },
  stats: [
    { id: 'team', label: 'สมาชิกในทีม', value: '24', caption: 'ครอบคลุม 3 รายวิชา', icon: GroupsIcon, color: ACCENT.violet },
    { id: 'avg', label: 'คะแนนเฉลี่ยของทีม', value: '85.1', caption: 'สูงขึ้น +2.3 จากเทอมก่อน', icon: GradeIcon, color: ACCENT.green },
    { id: 'progress', label: 'การประเมินที่กำลังดำเนินอยู่', value: '19', caption: 'เสร็จแล้ว 61%', icon: RateReviewIcon, color: ACCENT.blue },
    { id: 'reports', label: 'รายงานที่พร้อมแล้ว', value: '5', caption: 'พร้อมส่งออก', icon: SummarizeIcon, color: ACCENT.amber },
  ],
  actions: [
    { id: 'scores', title: 'ดูคะแนน', description: 'ผลของทีมและรายบุคคล', href: '/scores/view', icon: ScoreIcon, color: ACCENT.green },
    { id: 'export', title: 'ส่งออกรายงาน', description: 'ดาวน์โหลดสรุปผล', href: '/scores/export', icon: FileDownloadIcon, color: ACCENT.amber },
    { id: 'assign', title: 'การมอบหมาย', description: 'มอบหมายผู้ประเมิน', href: '/assignment', icon: AssignmentIndIcon, color: ACCENT.cyan },
    { id: 'org', title: 'โครงสร้างองค์กร', description: 'ดูโครงสร้างทีม', href: '/academic-data/organization', icon: AccountTreeIcon, color: ACCENT.violet },
  ],
  activity: [
    { id: 'm1', title: 'ทีมทำการประเมินเสร็จ 19 จาก 31 รายการ', time: '30 นาทีที่แล้ว', icon: CheckCircleIcon, color: ACCENT.green },
    { id: 'm2', title: 'รายงานหน่วยงานไตรมาส 3 พร้อมส่งออก', time: '2 ชั่วโมงที่แล้ว', icon: SummarizeIcon, color: ACCENT.amber },
    { id: 'm3', title: 'คุณมอบหมาย “ณัฐพงษ์ ก.” เป็นผู้ประเมิน', time: 'เมื่อวาน', icon: AssignmentIndIcon, color: ACCENT.cyan },
    { id: 'm4', title: 'คะแนนเฉลี่ยทีมขึ้นเป็น 85.1 ในเทอมนี้', time: '2 วันก่อน', icon: TrendingUpIcon, color: ACCENT.blue },
  ],
};

/** เนื้อหาทั่วไปสำหรับบทบาทที่ไม่มีชุดข้อมูลเฉพาะ */
const fallback: HomeContent = {
  tagline: 'ยินดีต้อนรับสู่ PEAK นี่คือภาพรวมสั้น ๆ เพื่อช่วยให้คุณเริ่มต้นใช้งาน',
  cta: { label: 'เปิดแดชบอร์ด', href: '/dashboard' },
  stats: [
    { id: 'tasks', label: 'งานที่รอดำเนินการ', value: '17', caption: 'รอการดำเนินการ', icon: PendingActionsIcon, color: ACCENT.amber },
    { id: 'evals', label: 'การประเมิน', value: '12', caption: 'เทอมนี้', icon: RateReviewIcon, color: ACCENT.blue },
    { id: 'docs', label: 'เอกสาร', value: '328', caption: 'ในคลังของคุณ', icon: DescriptionIcon, color: ACCENT.cyan },
    { id: 'notify', label: 'การแจ้งเตือน', value: '4', caption: 'ยังไม่ได้อ่าน', icon: NotificationsActiveIcon, color: ACCENT.violet },
  ],
  actions: [
    { id: 'dashboard', title: 'แดชบอร์ด', description: 'ดูภาพรวมของคุณ', href: '/dashboard', icon: DashboardIcon, color: ACCENT.violet },
    { id: 'tasks', title: 'การประเมินของฉัน', description: 'เปิดงานของคุณ', href: '/evaluation/tasks', icon: AssignmentTurnedInIcon, color: ACCENT.blue },
    { id: 'scores', title: 'ดูคะแนน', description: 'ตรวจสอบผลลัพธ์', href: '/scores/view', icon: ScoreIcon, color: ACCENT.green },
    { id: 'notify', title: 'การแจ้งเตือน', description: 'จัดการการแจ้งเตือนของคุณ', href: '/system/notifications', icon: NotificationsActiveIcon, color: ACCENT.amber },
  ],
  activity: [
    { id: 'f1', title: 'ยินดีต้อนรับสู่ PEAK — กรอกโปรไฟล์ให้ครบเพื่อเริ่มต้นใช้งาน', time: 'เมื่อสักครู่', icon: TaskAltIcon, color: ACCENT.violet },
    { id: 'f2', title: 'คุณมีการแจ้งเตือนที่ยังไม่ได้อ่าน 2 รายการ', time: '1 ชั่วโมงที่แล้ว', icon: NotificationsActiveIcon, color: ACCENT.amber },
    { id: 'f3', title: 'มีแบบฟอร์มการประเมินใหม่ให้ใช้งาน', time: 'เมื่อวาน', icon: DynamicFormIcon, color: ACCENT.cyan },
  ],
};

// --- ตัวแปลง (Resolvers) -----------------------------------------------------

const contentByRole: Record<string, HomeContent> = {
  student,
  teacher,
  mentor,
  admin,
  evaluator,
  evaluatee,
  manager,
};

const roleMeta: Record<string, RoleMeta> = {
  student: { label: 'นักเรียน', color: ACCENT.violet },
  teacher: { label: 'อาจารย์', color: ACCENT.blue },
  mentor: { label: 'พี่เลี้ยง', color: ACCENT.cyan },
  admin: { label: 'ผู้ดูแลระบบ', color: ACCENT.pink },
  evaluator: { label: 'ผู้ประเมิน', color: ACCENT.blue },
  evaluatee: { label: 'ผู้ถูกประเมิน', color: ACCENT.green },
  manager: { label: 'ผู้จัดการ', color: ACCENT.amber },
};

/** ไอคอนที่แสดงบนชิป/อวาตาร์ของบทบาทในส่วนหัว */
const roleIcon: Record<string, SvgIconComponent> = {
  student: SchoolIcon,
  teacher: MenuBookIcon,
  mentor: Diversity3Icon,
  admin: AdminPanelSettingsIcon,
  evaluator: RateReviewIcon,
  evaluatee: GradeIcon,
  manager: GroupsIcon,
};

/**
 * บทบาททั้งหมดที่มีชุดข้อมูลสาธิต เรียงจากบทบาทหลัก (นักเรียน/อาจารย์/พี่เลี้ยง)
 * ไปยังบทบาทอื่น ใช้เป็นตัวเลือกในแถบ "ทดลองมุมมองตามบทบาท" บนหน้าแรก
 */
export const PREVIEW_ROLES = [
  'student',
  'teacher',
  'mentor',
  'evaluator',
  'evaluatee',
  'manager',
  'admin',
] as const;

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** คืนค่าเนื้อหาหน้าแรกของบทบาท โดยใช้ค่าสำรองแบบทั่วไปเมื่อไม่พบ */
export function getHomeContent(role?: string): HomeContent {
  return (role && contentByRole[role]) || fallback;
}

/** คืนค่าป้ายชื่อและสีเน้นของบทบาท (สร้างป้ายชื่อให้เองหากไม่รู้จัก) */
export function getRoleMeta(role?: string): RoleMeta {
  if (role && roleMeta[role]) return roleMeta[role];
  return { label: role ? capitalize(role) : 'สมาชิก', color: ACCENT.violet };
}

/** คืนค่าไอคอนของบทบาท พร้อมค่าเริ่มต้นที่เหมาะสมสำหรับบทบาทที่ไม่รู้จัก */
export function getRoleIcon(role?: string): SvgIconComponent {
  return (role && roleIcon[role]) || VerifiedUserIcon;
}
