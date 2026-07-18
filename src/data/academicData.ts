/**
 * Shared "Academic Data" model (formerly "Master Data").
 *
 * The reference data every other module hangs off:
 *
 *   Organization (faculty → department)
 *          ▲
 *          └── Subject (รายวิชา) ── evaluationMode: individual | group | both
 *                     │                       │
 *                     │                       └── Group (เฉพาะวิชาที่ประเมินเป็นกลุ่ม)
 *                     │                                  │
 *                     └── Evaluation (= Assignment ใน formManagement.ts, 1 วิชามีได้หลายอัน)
 *                                                         └── Student (สมาชิกกลุ่ม/ผู้ถูกประเมินรายคน)
 *
 * Design notes (จากที่คุยกันไว้):
 * - Academic Year/Semester เป็นแค่ tag เบา ๆ บอกว่าเป็นคะแนนของรอบเรียนไหน ไม่ผูกลึก
 * - "วงรอบ" (round) ไม่ใช่ทุกวิชาใช้ จึงไม่ใช่ตารางกลางที่นี่ — มันเป็นแอตทริบิวต์ของ
 *   evaluation แต่ละอัน (ดูตัวอย่างที่ทำไปแล้วใน teamOralEvaluation.ts / assignment wizard)
 * - Group ผูกกับ "วิชา" ไม่ใช่ผูกกับ evaluation ตรง ๆ เพราะกลุ่มเดิมอาจถูกประเมินซ้ำหลายรอบ
 * - Subject ↔ Evaluation เป็น 1-ต่อ-กลุ่ม: อ้างอิงจริงจาก `ASSIGNMENTS` ใน formManagement.ts
 *   ผ่าน `subjectCode` เพื่อนับว่าวิชานี้มีกี่การประเมินแล้ว โดยไม่ต้องผูกซ้ำซ้อน
 */

import { ACCENT } from '@/theme/accents';
import { ASSIGNMENTS } from '@/data/formManagement';

// --- Organization: คณะ → สาขา ------------------------------------------------

export interface OrgUnit {
  id: string;
  name: string;
  kind: 'faculty' | 'department';
  head?: string;
  children?: OrgUnit[];
}

export const ORGANIZATION: OrgUnit[] = [
  {
    id: 'eng',
    name: 'คณะวิศวกรรมศาสตร์',
    kind: 'faculty',
    children: [
      { id: 'eng-cpe', name: 'วิศวกรรมคอมพิวเตอร์', kind: 'department', head: 'อ.ดร.อนงค์ วัฒนา' },
      { id: 'eng-ee', name: 'วิศวกรรมไฟฟ้า', kind: 'department', head: 'ผศ.สมศักดิ์ รุ่งเรือง' },
      { id: 'eng-ce', name: 'วิศวกรรมโยธา', kind: 'department', head: 'อ.ประสิทธิ์ ทองดี' },
    ],
  },
  {
    id: 'sci',
    name: 'คณะวิทยาศาสตร์',
    kind: 'faculty',
    children: [
      { id: 'sci-math', name: 'คณิตศาสตร์', kind: 'department', head: 'ผศ.กิตติเศรษฐ์ เลาหง' },
      { id: 'sci-phy', name: 'ฟิสิกส์', kind: 'department', head: 'อ.มาลี สุขใจ' },
    ],
  },
  {
    id: 'biz',
    name: 'คณะบริหารธุรกิจ',
    kind: 'faculty',
    children: [
      { id: 'biz-acc', name: 'บัญชี', kind: 'department', head: 'อ.สุดา มีสุข' },
      { id: 'biz-mk', name: 'การตลาด', kind: 'department', head: 'อ.ประสิทธิ์ คงดี' },
    ],
  },
];

export const flattenOrg = (units: OrgUnit[] = ORGANIZATION): OrgUnit[] =>
  units.flatMap((u) => [u, ...(u.children ? flattenOrg(u.children) : [])]);

export const DEPARTMENTS = flattenOrg().filter((u) => u.kind === 'department');

export const departmentName = (id: string) => flattenOrg().find((u) => u.id === id)?.name ?? '—';

export const facultyOfDepartment = (departmentId: string) =>
  ORGANIZATION.find((f) => f.children?.some((d) => d.id === departmentId));

// --- Academic Year / Semester (แท็กเบา ๆ) ------------------------------------

export interface Semester {
  id: string;
  label: string;
  start: string; // ISO
  end: string; // ISO
}

export interface AcademicYear {
  /** ปี พ.ศ. */
  year: string;
  semesters: Semester[];
}

export const ACADEMIC_YEARS: AcademicYear[] = [
  {
    year: '2569',
    semesters: [
      { id: '2569-1', label: 'ภาคเรียนที่ 1', start: '2026-06-01', end: '2026-10-31' },
      { id: '2569-2', label: 'ภาคเรียนที่ 2', start: '2026-11-01', end: '2027-03-31' },
    ],
  },
  {
    year: '2568',
    semesters: [
      { id: '2568-1', label: 'ภาคเรียนที่ 1', start: '2025-06-01', end: '2025-10-31' },
      { id: '2568-2', label: 'ภาคเรียนที่ 2', start: '2025-11-01', end: '2026-03-31' },
      { id: '2568-S', label: 'ภาคฤดูร้อน', start: '2026-04-01', end: '2026-05-31' },
    ],
  },
  {
    year: '2567',
    semesters: [
      { id: '2567-1', label: 'ภาคเรียนที่ 1', start: '2024-06-01', end: '2024-10-31' },
      { id: '2567-2', label: 'ภาคเรียนที่ 2', start: '2024-11-01', end: '2025-03-31' },
    ],
  },
];

export const ALL_SEMESTERS = ACADEMIC_YEARS.flatMap((y) => y.semesters);

/** เทอมปัจจุบัน — สอดคล้องกับ "วันนี้" ที่ใช้จำลองในโมดูลประเมิน Oral (ก.พ. 2570). */
export const ACTIVE_SEMESTER_ID = '2569-2';

export const activeSemester = () => ALL_SEMESTERS.find((s) => s.id === ACTIVE_SEMESTER_ID);
export const yearOfSemester = (semesterId: string) =>
  ACADEMIC_YEARS.find((y) => y.semesters.some((s) => s.id === semesterId))?.year;

// --- Subject (รายวิชา) -------------------------------------------------------

/** วิชาเปิดให้ประเมินแบบไหน — กำหนดว่าตอนสร้าง evaluation ควรเลือกเป้าหมายจาก Student หรือ Group */
export type EvaluationMode = 'individual' | 'group' | 'both';

export const EVAL_MODE_META: Record<EvaluationMode, { label: string; description: string; color: string }> = {
  individual: { label: 'รายบุคคล', description: 'ประเมินนักศึกษาทีละคน', color: ACCENT.blue },
  group: { label: 'เป็นกลุ่ม', description: 'แบ่งนักศึกษาเป็นกลุ่ม/ทีม แล้วประเมินทั้งกลุ่ม', color: ACCENT.violet },
  both: { label: 'ได้ทั้งสองแบบ', description: 'เลือกได้ทั้งรายบุคคลและเป็นกลุ่ม ตามแต่ละการประเมิน', color: ACCENT.cyan },
};

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  departmentId: string;
  instructor: string;
  status: 'published' | 'draft';
  evaluationMode: EvaluationMode;
}

export const SUBJECTS: Subject[] = [
  { id: 'subj-se402', code: 'SE402', name: 'โครงงานวิศวกรรมซอฟต์แวร์', credits: 3, departmentId: 'eng-cpe', instructor: 'อ.ดร.อนงค์ วัฒนา', status: 'published', evaluationMode: 'group' },
  { id: 'subj-cs499', code: 'CS499', name: 'โปรเจกต์จบ', credits: 3, departmentId: 'eng-cpe', instructor: 'อ.ประสิทธิ์ ทองดี', status: 'published', evaluationMode: 'group' },
  { id: 'subj-cs205', code: 'CS205', name: 'โครงสร้างข้อมูล', credits: 3, departmentId: 'eng-cpe', instructor: 'อ.ดร.อนงค์ วัฒนา', status: 'published', evaluationMode: 'individual' },
  { id: 'subj-cs310', code: 'CS310', name: 'ระบบฐานข้อมูล', credits: 3, departmentId: 'eng-cpe', instructor: 'อ.รุ่งโรจน์ ประเสริฐ', status: 'published', evaluationMode: 'individual' },
  { id: 'subj-cs101', code: 'CS101', name: 'การเขียนโปรแกรมเบื้องต้น', credits: 3, departmentId: 'eng-cpe', instructor: 'อ.ดร.อนงค์ วัฒนา', status: 'published', evaluationMode: 'individual' },
  { id: 'subj-en101', code: 'EN101', name: 'การเป็นผู้ประกอบการ', credits: 2, departmentId: 'biz-mk', instructor: 'อ.ประสิทธิ์ คงดี', status: 'draft', evaluationMode: 'group' },
  { id: 'subj-mk310', code: 'MK310', name: 'การวิจัยการตลาด', credits: 3, departmentId: 'biz-mk', instructor: 'อ.ประสิทธิ์ คงดี', status: 'published', evaluationMode: 'both' },
  { id: 'subj-ac220', code: 'AC220', name: 'การบัญชีการเงิน', credits: 4, departmentId: 'biz-acc', instructor: 'อ.สุดา มีสุข', status: 'published', evaluationMode: 'individual' },
  { id: 'subj-ph150', code: 'PH150', name: 'ฟิสิกส์ทั่วไป', credits: 4, departmentId: 'sci-phy', instructor: 'อ.มาลี สุขใจ', status: 'published', evaluationMode: 'individual' },
  { id: 'subj-ma200', code: 'MA200', name: 'แคลคูลัส 2', credits: 3, departmentId: 'sci-math', instructor: 'ผศ.กิตติเศรษฐ์ เลาหง', status: 'draft', evaluationMode: 'individual' },
];

export const subjectByCode = (code: string) => SUBJECTS.find((s) => s.code === code);

/** จำนวนการประเมิน (Assignment) ที่ผูกกับวิชานี้ — 1 วิชามีได้หลายการประเมิน */
export const evaluationsOfSubject = (subject: Subject) =>
  ASSIGNMENTS.filter((a) => a.subjectCode === subject.code);

// --- Student (นักศึกษา) ------------------------------------------------------

export interface Student {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  /** ปี พ.ศ. ที่เข้าศึกษา — ใช้แค่บอกว่าคะแนนนี้เป็นของรุ่นไหน */
  enrollYear: string;
}

// นักศึกษาในทีม Oral (T5/T3/T7) — สอดคล้องกับ src/data/teamOralEvaluation.ts เพื่อให้
// Academic Data เป็น "ต้นทาง" ของกลุ่มที่ใช้ในเคส Oral จริง ๆ
const T5_STUDENTS: Student[] = [
  { id: 'st-66160237', code: '66160237', name: 'วนศาสตร์ เนียนทะศาสตร์', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160223', code: '66160223', name: 'จิรัชญา โพธิ์ขาว', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160228', code: '66160228', name: 'ธนากร ประเสริฐดีงาม', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160348', code: '66160348', name: 'โชคชัย สุธรรมวิจิตร', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160093', code: '66160093', name: 'ณภัทร์ บุญชุ่ม', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160383', code: '66160383', name: 'อุดมศักดิ์ กอฟัก', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160367', code: '66160367', name: 'ฟ้าใส จุฬาจารุพันธ์', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160343', code: '66160343', name: 'จิรายุ สุขขี', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160364', code: '66160364', name: 'เปรมสิริกุล เกตุแพร', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160236', code: '66160236', name: 'วงศกร พรหมมา', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160341', code: '66160341', name: 'กฤษกร ส่องแสงจันทร์', departmentId: 'eng-cpe', enrollYear: '2566' },
];

const T3_STUDENTS: Student[] = [
  { id: 'st-66160101', code: '66160101', name: 'ธีรภัทร วงศ์ทอง', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160102', code: '66160102', name: 'ศิริพร ใจงาม', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160103', code: '66160103', name: 'อนุชา แก้วมณี', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160104', code: '66160104', name: 'ปิยะพงษ์ ศรีสุข', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160105', code: '66160105', name: 'กันตพงศ์ บุญมี', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160106', code: '66160106', name: 'วรินทร ทองคำ', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160107', code: '66160107', name: 'ณิชา พรหมชาติ', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160108', code: '66160108', name: 'ภาณุพงศ์ ดวงแก้ว', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160109', code: '66160109', name: 'ชนกันต์ อินทร์จันทร์', departmentId: 'eng-cpe', enrollYear: '2566' },
];

const T7_STUDENTS: Student[] = [
  { id: 'st-66160201', code: '66160201', name: 'พงศกร รัตนชัย', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160202', code: '66160202', name: 'อารยา สุขสวัสดิ์', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160203', code: '66160203', name: 'ธนวัฒน์ มั่นคง', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160204', code: '66160204', name: 'กฤติน โพธิ์ทอง', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160205', code: '66160205', name: 'สุทธิดา แสงทอง', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160206', code: '66160206', name: 'นครินทร์ ชูเกียรติ', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160207', code: '66160207', name: 'พิมพ์มาดา วังคำ', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160208', code: '66160208', name: 'รัชชานนท์ เกียรติศักดิ์', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160209', code: '66160209', name: 'อภิสิทธิ์ จันทร์เพ็ญ', departmentId: 'eng-cpe', enrollYear: '2566' },
  { id: 'st-66160210', code: '66160210', name: 'ธัญชนก บุญรอด', departmentId: 'eng-cpe', enrollYear: '2566' },
];

// นักศึกษาที่ประเมินแบบรายบุคคล (เพื่อนประเมิน CS205/CS310) — สอดคล้องกับ formManagement.ts
const PEER_STUDENTS: Student[] = [
  { id: 'st-66160401', code: '66160401', name: 'ณัฐพงษ์ ศรีสาย', departmentId: 'eng-cpe', enrollYear: '2567' },
  { id: 'st-66160402', code: '66160402', name: 'พลอย ชัยพฤกษ์', departmentId: 'eng-cpe', enrollYear: '2567' },
  { id: 'st-66160403', code: '66160403', name: 'ธนกร ใจดี', departmentId: 'eng-cpe', enrollYear: '2567' },
  { id: 'st-66160404', code: '66160404', name: 'สุดา มีสุข', departmentId: 'eng-cpe', enrollYear: '2567' },
];

export const STUDENTS: Student[] = [...T5_STUDENTS, ...T3_STUDENTS, ...T7_STUDENTS, ...PEER_STUDENTS];

export const studentById = (id: string) => STUDENTS.find((s) => s.id === id);
export const studentName = (id: string) => studentById(id)?.name ?? '—';

// --- Group (กลุ่ม/ทีม รายวิชา) ------------------------------------------------

export interface Group {
  id: string;
  subjectId: string;
  /** รหัสสั้นของทีม เช่น "T5" */
  code: string;
  name: string;
  memberIds: string[];
}

const ids = (students: Student[]) => students.map((s) => s.id);

export const GROUPS: Group[] = [
  // SE402 — สอดคล้องกับทีม T5/T3/T7 ใน teamOralEvaluation.ts เป๊ะ ๆ
  { id: 'grp-t5', subjectId: 'subj-se402', code: 'T5', name: 'TTT Brother — Automate Object Detection System', memberIds: ids(T5_STUDENTS) },
  { id: 'grp-t3', subjectId: 'subj-se402', code: 'T3', name: 'CodeCraft — Smart Warehouse', memberIds: ids(T3_STUDENTS) },
  { id: 'grp-t7', subjectId: 'subj-se402', code: 'T7', name: 'NovaSoft — Hospital Queue Platform', memberIds: ids(T7_STUDENTS) },
  // CS499 — คนละทีมกับ SE402 แม้ใช้นักศึกษาคนเดิมบางส่วน (ลงเรียนพร้อมกันได้)
  { id: 'grp-a', subjectId: 'subj-cs499', code: 'ทีม A', name: 'ทีม A', memberIds: ['st-66160237', 'st-66160223', 'st-66160228'] },
  { id: 'grp-b', subjectId: 'subj-cs499', code: 'ทีม B', name: 'ทีม B', memberIds: ['st-66160101', 'st-66160102', 'st-66160103'] },
  { id: 'grp-c', subjectId: 'subj-cs499', code: 'ทีม C', name: 'ทีม C', memberIds: ['st-66160201', 'st-66160202', 'st-66160203'] },
  { id: 'grp-d', subjectId: 'subj-cs499', code: 'ทีม D', name: 'ทีม D', memberIds: ['st-66160348', 'st-66160093', 'st-66160383'] },
  { id: 'grp-e', subjectId: 'subj-cs499', code: 'ทีม E', name: 'ทีม E', memberIds: ['st-66160104', 'st-66160105', 'st-66160106'] },
];

export const groupsForSubject = (subjectId: string) => GROUPS.filter((g) => g.subjectId === subjectId);
export const membersOf = (group: Group): Student[] => group.memberIds.map(studentById).filter((s): s is Student => Boolean(s));
