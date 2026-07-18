/**
 * Team "Oral" evaluation — modeled from a real advisor scoring sheet.
 *
 * A team is evaluated across **4 rounds** (2 months each) on **8 fixed topics**,
 * each scored on a **1–5 rating scale** (half steps allowed) with a written
 * comment/evidence link. The distinctive rule: **3 advisors split the 8 topics
 * between them — each owns 2–4 topics, with no overlap** — so every topic has
 * exactly one owning advisor who scores it every round. A round's result is the
 * average of its 8 topic scores.
 *
 * This is the same Form → Rubric → Score idea, refined to *per-topic evaluator
 * ownership*: the 8 topics are the rubric criteria, and the assignment splits
 * them across evaluators.
 */

import { ACCENT } from '@/theme/accents';

// --- Rating scale (from the rubric sheet) -----------------------------------

export const SCALE_MAX = 5;

export interface RatingLevel {
  level: number;
  title: string;
  description: string;
}

export const RATING_LEVELS: RatingLevel[] = [
  { level: 1, title: 'ยังไม่ได้ดำเนินการ', description: 'ยังไม่มีการดำเนินการ หรือดำเนินการไม่เป็นไปตามเกณฑ์' },
  { level: 2, title: 'ยังไม่ครบถ้วน', description: 'ยังไม่ครบถ้วนที่จะทำให้ผ่าน แต่เริ่มมีการดำเนินการแล้ว' },
  { level: 3, title: 'ผ่านขั้นต่ำ', description: 'ผ่านตามเงื่อนไขขั้นต่ำ มีหลักฐานปรากฏชัดเจน' },
  { level: 4, title: 'ดีกว่าที่คาดหวัง', description: 'ผ่านในระดับดีกว่าที่คาดหวัง มีหลักฐานครบถ้วน' },
  { level: 5, title: 'เป็นแบบอย่าง (Best Practice)', description: 'เป็นแบบอย่างแนวปฏิบัติที่ควรได้รับการยกย่อง' },
];

// --- Topics (the 8 evaluation criteria) -------------------------------------

export interface Topic {
  id: string;
  no: number;
  name: string;
  short: string;
}

export const TOPICS: Topic[] = [
  { id: 'tp1', no: 1, name: 'การตั้งเป้าหมาย ตัวชี้วัดและผลการดำเนินงาน', short: 'การตั้งเป้าหมาย' },
  { id: 'tp2', no: 2, name: 'การวางแผน ความก้าวหน้าของงาน และผลการดำเนินงาน', short: 'การวางแผน' },
  { id: 'tp3', no: 3, name: 'การประชุมกับทีม ประชุมกับพี่โค้ช ประชุมกับลูกค้า', short: 'การประชุม' },
  { id: 'tp4', no: 4, name: 'การจัดทำเอกสารข้อกำหนดความต้องการ', short: 'เอกสารความต้องการ' },
  { id: 'tp5', no: 5, name: 'การออกแบบซอฟต์แวร์ ตามมาตรฐานการออกแบบ', short: 'การออกแบบซอฟต์แวร์' },
  { id: 'tp6', no: 6, name: 'การเขียนโปรแกรม ตามมาตรฐานการเขียนโปรแกรม', short: 'การเขียนโปรแกรม' },
  { id: 'tp7', no: 7, name: 'การทดสอบซอฟต์แวร์ และตรวจความเรียบร้อยของเอกสาร', short: 'การทดสอบซอฟต์แวร์' },
  { id: 'tp8', no: 8, name: 'การนำกลับมาใช้ใหม่ และการควบคุมการเปลี่ยนแปลง', short: 'การควบคุมการเปลี่ยนแปลง' },
];

// --- Advisors and their non-overlapping topic split -------------------------

export interface Advisor {
  id: string;
  name: string;
  title: string; // academic title, e.g. อ.ดร.
  color: string;
  /** The topics this advisor owns and scores every round (2–4, no overlap). */
  topicIds: string[];
}

export const ADVISORS: Advisor[] = [
  { id: 'adv1', name: 'อนงค์ วัฒนา', title: 'อ.ดร.', color: ACCENT.violet, topicIds: ['tp1', 'tp2', 'tp3'] },
  { id: 'adv2', name: 'กิตติเศรษฐ์ เลาหง', title: 'ผศ.', color: ACCENT.cyan, topicIds: ['tp4', 'tp5', 'tp6'] },
  { id: 'adv3', name: 'ประสิทธิ์ ทองดี', title: 'อ.', color: ACCENT.green, topicIds: ['tp7', 'tp8'] },
];

/** Which advisor owns a topic (there is exactly one). */
export const advisorOfTopic = (topicId: string) => ADVISORS.find((a) => a.topicIds.includes(topicId));

// --- Rounds (2 months each) + per-topic scores & comments -------------------

export type RoundStatus = 'done' | 'in_progress' | 'upcoming';

export interface TopicResult {
  /** 0–5 (half steps). `null` = not yet scored. */
  score: number | null;
  comment?: string;
  /** Evidence link (Google Drive etc.) if the advisor attached one. */
  evidence?: string;
}

export interface Round {
  id: string;
  no: number;
  label: string;
  period: string;
  status: RoundStatus;
  /** Keyed by topic id. */
  results: Record<string, TopicResult>;
}

export const ROUNDS: Round[] = [
  {
    id: 'r1',
    no: 1,
    label: 'วงรอบที่ 1',
    period: 'ก.ค. – ส.ค. 2569',
    status: 'done',
    results: {
      tp1: { score: 1.5, comment: 'Team goal เป้าหมายที่ 1 การประชุม ok; เป้าหมายอื่นยังไม่ชัดเจน ควรระบุตัวชี้วัด' },
      tp2: { score: 1.5, comment: 'Task ใน Notion มีแค่ Code — ควรครอบคลุมงานเอกสารและทดสอบด้วย', evidence: 'https://drive.google.com/…' },
      tp3: { score: 1.0, comment: 'หนังสือเชิญประชุม ok; วาระการประชุมและรายงานยังไม่ครบ' },
      tp4: { score: 1.0, comment: 'เอกสารข้อกำหนดความต้องการยังไม่ครบถ้วน', evidence: 'https://drive.google.com/…' },
      tp5: { score: 1.5, comment: 'เริ่มมีแบบการออกแบบ แต่ยังไม่ตามมาตรฐาน', evidence: 'https://drive.google.com/…' },
      tp6: { score: 1.0, comment: 'ข้อแนะนำ: เขียนแบ่ง backend และ next.js ให้ชัด และเพิ่ม coding standard' },
      tp7: { score: 1.0, comment: 'เอกสาร Test Plan มี Test Strategy อยู่ แต่ยังขาดรายละเอียด' },
      tp8: { score: 1.0, comment: 'ยังไม่มีการควบคุมเวอร์ชัน/การเปลี่ยนแปลงชัดเจน', evidence: 'https://drive.google.com/…' },
    },
  },
  {
    id: 'r2',
    no: 2,
    label: 'วงรอบที่ 2',
    period: 'ก.ย. – ต.ค. 2569',
    status: 'done',
    results: {
      tp1: { score: 1.5, comment: 'เป้า 2 ข้อมูลทั้งหมดยังไม่ตรงกับข้อกำหนด ควรทบทวน' },
      tp2: { score: 1.5, comment: 'มี MILESTONE แต่ทำเป็น Project timeline ควรเพิ่ม velocity/burndown' },
      tp3: { score: 3.0, comment: 'หนังสือเชิญประชุม ok; วาระ ok; รายงานการประชุมครบถ้วน' },
      tp4: { score: 2.0, comment: 'เอกสารความต้องการปรับปรุงดีขึ้น', evidence: 'https://drive.google.com/…' },
      tp5: { score: 1.5, comment: 'การออกแบบยังต้องปรับตามมาตรฐานเพิ่มเติม', evidence: 'https://drive.google.com/…' },
      tp6: { score: 2.0, comment: 'มี coding standard ปรับแก้ตามแนะนำแล้ว' },
      tp7: { score: 2.0, comment: 'Test Strategy กำลังดำเนินการ มี Test Case เพิ่มขึ้น' },
      tp8: { score: 1.5, comment: 'เริ่มมีการควบคุมการเปลี่ยนแปลง', evidence: 'https://drive.google.com/…' },
    },
  },
  {
    id: 'r3',
    no: 3,
    label: 'วงรอบที่ 3',
    period: 'พ.ย. – ธ.ค. 2569',
    status: 'done',
    results: {
      tp1: { score: 3.0, comment: 'Team goal ok; Role goal ok; Member goal ครบถ้วน' },
      tp2: { score: 2.0, comment: 'ควรทำเอกสาร Velocity / Burndown พร้อมคำอธิบายประกอบ' },
      tp3: { score: 3.0, comment: 'หนังสือเชิญประชุม/วาระ/รายงาน ครบถ้วนต่อเนื่อง' },
      tp4: { score: 3.0, comment: 'เอกสารความต้องการครบตามเกณฑ์', evidence: 'https://drive.google.com/…' },
      tp5: { score: 2.5, comment: 'การออกแบบดีขึ้น ใกล้เคียงมาตรฐาน', evidence: 'https://drive.google.com/…' },
      tp6: { score: 2.5, comment: 'เอกสารมาตรฐานการเขียนโปรแกรมเนื้อหาครบขึ้น' },
      tp7: { score: 2.0, comment: 'ปรับแก้เอกสารมาดี แต่ยังขาด summary report' },
      tp8: { score: 3.0, comment: 'มีการควบคุมการเปลี่ยนแปลงชัดเจน', evidence: 'https://drive.google.com/…' },
    },
  },
  {
    id: 'r4',
    no: 4,
    label: 'วงรอบที่ 4',
    period: 'ม.ค. – ก.พ. 2570',
    status: 'in_progress',
    results: {
      tp1: { score: null },
      tp2: { score: null },
      tp3: { score: null },
      tp4: { score: null },
      tp5: { score: null },
      tp6: { score: null },
      tp7: { score: null },
      tp8: { score: null },
    },
  },
];

// --- Additional teams (same advisors + same 8 topics, evaluated in parallel) -
//
// The advisors and their topic ownership are **shared across every team** — an
// advisor evaluates *their* topics for each team they're assigned. Only the
// scores/comments differ per team. T5 above keeps its verbose sheet-derived
// data; secondary teams use the compact builder below.

/** Build one round's results from a compact 8-score array (index 0 = topic 1). */
function makeRound(
  id: string,
  no: number,
  label: string,
  period: string,
  status: RoundStatus,
  scores: (number | null)[],
  comments: Record<number, string> = {},
): Round {
  return {
    id,
    no,
    label,
    period,
    status,
    results: Object.fromEntries(
      TOPICS.map((t, i) => [t.id, { score: scores[i] ?? null, comment: comments[i + 1] }]),
    ),
  };
}

const NULL8 = Array<number | null>(8).fill(null);

const T3_ROUNDS: Round[] = [
  makeRound('r1', 1, 'วงรอบที่ 1', 'ก.ค. – ส.ค. 2569', 'done', [2, 2, 2.5, 2, 2, 2, 1.5, 2]),
  makeRound('r2', 2, 'วงรอบที่ 2', 'ก.ย. – ต.ค. 2569', 'done', [2.5, 2.5, 3, 2.5, 2.5, 2.5, 2, 2.5]),
  makeRound('r3', 3, 'วงรอบที่ 3', 'พ.ย. – ธ.ค. 2569', 'done', [3, 3, 3.5, 3, 3, 3, 2.5, 3], {
    1: 'เป้าหมายและตัวชี้วัดชัดเจน ครบทุกบทบาท',
    4: 'เอกสารความต้องการครบถ้วน ตามมาตรฐาน',
    7: 'มี Test Plan แต่ยังขาด summary report',
  }),
  makeRound('r4', 4, 'วงรอบที่ 4', 'ม.ค. – ก.พ. 2570', 'in_progress', NULL8),
];

const T7_ROUNDS: Round[] = [
  makeRound('r1', 1, 'วงรอบที่ 1', 'ก.ค. – ส.ค. 2569', 'done', [1, 1.5, 1.5, 1, 1.5, 1, 1, 1]),
  makeRound('r2', 2, 'วงรอบที่ 2', 'ก.ย. – ต.ค. 2569', 'done', [2, 2, 2.5, 2, 2, 2, 1.5, 2]),
  makeRound('r3', 3, 'วงรอบที่ 3', 'พ.ย. – ธ.ค. 2569', 'done', [2.5, 2.5, 3, 2.5, 2.5, 2, 2, 2.5], {
    2: 'ควรเพิ่ม Velocity/Burndown พร้อมคำอธิบายแนวโน้ม',
    5: 'การออกแบบใกล้เคียงมาตรฐาน ยังต้องปรับบางส่วน',
    8: 'เริ่มมีการควบคุมการเปลี่ยนแปลงชัดเจนขึ้น',
  }),
  makeRound('r4', 4, 'วงรอบที่ 4', 'ม.ค. – ก.พ. 2570', 'in_progress', NULL8),
];

// --- Team + members ---------------------------------------------------------

export interface Member {
  code: string;
  name: string;
  role: string;
}

export const ROLE_LABEL: Record<string, string> = {
  TL: 'หัวหน้าทีม',
  PM: 'ผู้จัดการโปรเจกต์',
  PE: 'วิศวกรกระบวนการ',
  DM: 'ผู้จัดการออกแบบ',
  DE: 'นักพัฒนา',
  QM: 'ผู้จัดการคุณภาพ',
  QE: 'วิศวกรคุณภาพ',
  SM: 'ผู้จัดการซัพพอร์ต',
  SE: 'วิศวกรซอฟต์แวร์',
};

export interface Team {
  code: string;
  company: string;
  system: string;
  members: Member[];
  /** This team's 4 rounds of per-topic results. */
  rounds: Round[];
}

export const TEAMS: Team[] = [
  {
    code: 'T5',
    company: 'บริษัท TTT Brother',
    system: 'Automate Object Detection System',
    rounds: ROUNDS,
    members: [
      { code: '66160237', name: 'วนศาสตร์ เนียนทะศาสตร์', role: 'TL' },
      { code: '66160223', name: 'จิรัชญา โพธิ์ขาว', role: 'PM' },
      { code: '66160228', name: 'ธนากร ประเสริฐดีงาม', role: 'PE' },
      { code: '66160348', name: 'โชคชัย สุธรรมวิจิตร', role: 'DM' },
      { code: '66160093', name: 'ณภัทร์ บุญชุ่ม', role: 'DE' },
      { code: '66160383', name: 'อุดมศักดิ์ กอฟัก', role: 'DE' },
      { code: '66160367', name: 'ฟ้าใส จุฬาจารุพันธ์', role: 'QM' },
      { code: '66160343', name: 'จิรายุ สุขขี', role: 'QE' },
      { code: '66160364', name: 'เปรมสิริกุล เกตุแพร', role: 'SM' },
      { code: '66160236', name: 'วงศกร พรหมมา', role: 'SE' },
      { code: '66160341', name: 'กฤษกร ส่องแสงจันทร์', role: 'SE' },
    ],
  },
  {
    code: 'T3',
    company: 'บริษัท CodeCraft',
    system: 'ระบบจัดการคลังสินค้าอัจฉริยะ (Smart Warehouse)',
    rounds: T3_ROUNDS,
    members: [
      { code: '66160101', name: 'ธีรภัทร วงศ์ทอง', role: 'TL' },
      { code: '66160102', name: 'ศิริพร ใจงาม', role: 'PM' },
      { code: '66160103', name: 'อนุชา แก้วมณี', role: 'PE' },
      { code: '66160104', name: 'ปิยะพงษ์ ศรีสุข', role: 'DM' },
      { code: '66160105', name: 'กันตพงศ์ บุญมี', role: 'DE' },
      { code: '66160106', name: 'วรินทร ทองคำ', role: 'DE' },
      { code: '66160107', name: 'ณิชา พรหมชาติ', role: 'QM' },
      { code: '66160108', name: 'ภาณุพงศ์ ดวงแก้ว', role: 'QE' },
      { code: '66160109', name: 'ชนกันต์ อินทร์จันทร์', role: 'SE' },
    ],
  },
  {
    code: 'T7',
    company: 'บริษัท NovaSoft',
    system: 'แพลตฟอร์มจองคิวโรงพยาบาล (Hospital Queue Platform)',
    rounds: T7_ROUNDS,
    members: [
      { code: '66160201', name: 'พงศกร รัตนชัย', role: 'TL' },
      { code: '66160202', name: 'อารยา สุขสวัสดิ์', role: 'PM' },
      { code: '66160203', name: 'ธนวัฒน์ มั่นคง', role: 'PE' },
      { code: '66160204', name: 'กฤติน โพธิ์ทอง', role: 'DM' },
      { code: '66160205', name: 'สุทธิดา แสงทอง', role: 'DE' },
      { code: '66160206', name: 'นครินทร์ ชูเกียรติ', role: 'DE' },
      { code: '66160207', name: 'พิมพ์มาดา วังคำ', role: 'QM' },
      { code: '66160208', name: 'รัชชานนท์ เกียรติศักดิ์', role: 'QE' },
      { code: '66160209', name: 'อภิสิทธิ์ จันทร์เพ็ญ', role: 'SM' },
      { code: '66160210', name: 'ธัญชนก บุญรอด', role: 'SE' },
    ],
  },
];

/** Backward-compatible alias — the primary team (T5). */
export const TEAM: Team = TEAMS[0];

// --- Derived helpers --------------------------------------------------------

/** Average of the scored topics in a round (0 when none scored yet). */
export function roundAverage(round: Round): { avg: number; scored: number } {
  const scores = TOPICS.map((t) => round.results[t.id]?.score).filter((s): s is number => s != null);
  if (scores.length === 0) return { avg: 0, scored: 0 };
  return { avg: scores.reduce((a, b) => a + b, 0) / scores.length, scored: scores.length };
}

/** Per-advisor average within a round (only over the topics they own). */
export function advisorRoundAverage(round: Round, advisor: Advisor): number | null {
  const scores = advisor.topicIds.map((id) => round.results[id]?.score).filter((s): s is number => s != null);
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

// --- Assessment metadata (shared by the evaluator-facing screens) -----------

/**
 * The course/form/rubric context this evaluation lives in — the same values the
 * Form Management + Assignment screens use, kept here so the evaluator-facing
 * pages (My Evaluations, History) can render the header without re-importing the
 * whole form-management model.
 */
export const ORAL_META = {
  subjectCode: 'SE402',
  subject: 'โครงงานวิศวกรรมซอฟต์แวร์',
  formName: 'แบบประเมินความก้าวหน้าโครงงาน (Oral)',
  rubricName: 'เกณฑ์ประเมิน Oral 8 หัวข้อ (5 ระดับ)',
  /** Minimum score (of SCALE_MAX) counted as a pass — level 3 of 5 = 60%. */
  passScore: 3,
  passPercent: 60,
} as const;

/** Due date per round (ISO), used by the task inbox + history. */
export const ROUND_DUE: Record<string, string> = {
  r1: '2026-08-31',
  r2: '2026-10-31',
  r3: '2026-12-31',
  r4: '2027-02-28',
};

/** The rating-scale level (1–5) that a numeric score falls on. */
export const ratingLevelOf = (score: number | null | undefined): RatingLevel | undefined =>
  score == null ? undefined : RATING_LEVELS[Math.min(5, Math.max(1, Math.round(score))) - 1];

/** Convert a 0–SCALE_MAX score to a 0–100 percentage. */
export const scoreToPercent = (score: number) => Math.round((score / SCALE_MAX) * 100);
