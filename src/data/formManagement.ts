/**
 * Shared domain model for the Form Management pipeline.
 *
 * This is the single source of truth that ties three screens together:
 *
 *   Form (fields)  ──►  Rubric (weights + formula)  ──►  Score
 *          ▲                        │
 *          └──── Assignment (who evaluates whom, when) ────► Evaluation task
 *
 * A **Form** defines the questionnaire. Some of its fields are *scorable*
 * (rating scales); those are the only ones a rubric can weigh. A **Rubric**
 * binds each of its criteria to one scorable field and adds a weight + formula,
 * turning raw answers into a normalized 0–100 score. An **Assignment** hands a
 * form + rubric to a set of evaluators against a set of targets with a due
 * date, which is what produces the individual evaluation tasks.
 *
 * Keeping this here (rather than re-seeding each page) is what makes the link
 * real: the Rubric editor picks fields from the *actual* form, and the
 * Assignment wizard only offers rubrics that belong to the chosen form.
 */

import { ACCENT } from '@/theme/accents';

// --- Forms ------------------------------------------------------------------

export type FormCategory =
  | 'Project Evaluation'
  | 'Self-Assessment'
  | 'Peer Review'
  | 'Advisor Review'
  | 'Survey';

/** A field a rubric can attach a weighted criterion to. */
export interface ScorableField {
  id: string;
  label: string;
  /** Upper bound of the rating scale for this field. */
  scaleMax: number;
}

export interface FormSummary {
  id: string;
  name: string;
  category: FormCategory;
  sections: number;
  /** Total number of fields (scorable + informational). */
  totalFields: number;
  /** The subset of fields a rubric can score. */
  scorableFields: ScorableField[];
  status: 'published' | 'draft';
}

export const FORMS: FormSummary[] = [
  {
    id: 'form-capstone',
    name: 'แบบประเมินโปรเจกต์จบ',
    category: 'Project Evaluation',
    sections: 4,
    totalFields: 18,
    status: 'published',
    scorableFields: [
      { id: 'cap-originality', label: 'ความคิดริเริ่ม & นวัตกรรม', scaleMax: 5 },
      { id: 'cap-technical', label: 'การดำเนินการทางเทคนิค', scaleMax: 5 },
      { id: 'cap-presentation', label: 'การนำเสนอ', scaleMax: 5 },
      { id: 'cap-documentation', label: 'เอกสาร', scaleMax: 5 },
    ],
  },
  {
    id: 'form-peer',
    name: 'แบบประเมินการมีส่วนร่วมของเพื่อน',
    category: 'Peer Review',
    sections: 2,
    totalFields: 9,
    status: 'published',
    scorableFields: [
      { id: 'peer-collaboration', label: 'การทำงานร่วมกัน', scaleMax: 5 },
      { id: 'peer-reliability', label: 'ความน่าเชื่อถือ', scaleMax: 5 },
      { id: 'peer-contribution', label: 'การมีส่วนร่วม', scaleMax: 5 },
    ],
  },
  {
    id: 'form-advisor',
    name: 'แบบอนุมัติขั้นสุดท้ายโดยที่ปรึกษา',
    category: 'Advisor Review',
    sections: 3,
    totalFields: 14,
    status: 'published',
    scorableFields: [
      { id: 'adv-objectives', label: 'บรรลุวัตถุประสงค์', scaleMax: 10 },
      { id: 'adv-methodology', label: 'ระเบียบวิธี', scaleMax: 10 },
      { id: 'adv-impact', label: 'ผลกระทบ', scaleMax: 10 },
    ],
  },
  {
    id: 'form-pitch',
    name: 'แบบให้คะแนนพิตช์นวัตกรรม',
    category: 'Project Evaluation',
    sections: 2,
    totalFields: 8,
    status: 'draft',
    scorableFields: [
      { id: 'pitch-fit', label: 'ความเหมาะกับปัญหา', scaleMax: 5 },
      { id: 'pitch-market', label: 'ศักยภาพตลาด', scaleMax: 5 },
    ],
  },
  {
    // แบบประเมินความก้าวหน้าโครงงาน (Oral) — 8 หัวข้อคงที่ ให้คะแนน 5 ระดับ
    // ใช้กับเคสทีม T5: อาจารย์ 3 ท่านแบ่งหัวข้อกันประเมินทุกวงรอบ (ดู /evaluation/team)
    id: 'form-oral',
    name: 'แบบประเมินความก้าวหน้าโครงงาน (Oral)',
    category: 'Advisor Review',
    sections: 8,
    totalFields: 17,
    status: 'published',
    scorableFields: [
      { id: 'oral-tp1', label: '1. การตั้งเป้าหมาย ตัวชี้วัดและผลการดำเนินงาน', scaleMax: 5 },
      { id: 'oral-tp2', label: '2. การวางแผน ความก้าวหน้าของงาน และผลการดำเนินงาน', scaleMax: 5 },
      { id: 'oral-tp3', label: '3. การประชุมกับทีม พี่โค้ช และลูกค้า', scaleMax: 5 },
      { id: 'oral-tp4', label: '4. การจัดทำเอกสารข้อกำหนดความต้องการ', scaleMax: 5 },
      { id: 'oral-tp5', label: '5. การออกแบบซอฟต์แวร์ ตามมาตรฐานการออกแบบ', scaleMax: 5 },
      { id: 'oral-tp6', label: '6. การเขียนโปรแกรม ตามมาตรฐานการเขียนโปรแกรม', scaleMax: 5 },
      { id: 'oral-tp7', label: '7. การทดสอบซอฟต์แวร์ และตรวจความเรียบร้อยของเอกสาร', scaleMax: 5 },
      { id: 'oral-tp8', label: '8. การนำกลับมาใช้ใหม่ และการควบคุมการเปลี่ยนแปลง', scaleMax: 5 },
    ],
  },
];

// --- Rubrics ----------------------------------------------------------------

export type Formula = 'weighted' | 'average' | 'sum';
export type RubricStatus = 'active' | 'draft';

export const FORMULA_META: Record<Formula, { label: string; description: string }> = {
  weighted: { label: 'ค่าเฉลี่ยถ่วงน้ำหนัก', description: 'แต่ละเกณฑ์มีผลต่อคะแนนตามสัดส่วนน้ำหนักของตัวเอง' },
  average: { label: 'ค่าเฉลี่ยธรรมดา', description: 'เฉลี่ยทุกเกณฑ์เท่ากัน ไม่คิดน้ำหนัก' },
  sum: { label: 'ผลรวมทั้งหมด', description: 'รวมคะแนนดิบของทุกเกณฑ์' },
};

/**
 * A single scored line in a rubric. `fieldId` is the link into the form: it
 * points at one of the linked form's {@link ScorableField}s. A criterion with
 * no `fieldId` is *unmapped* and cannot contribute to the score yet.
 */
export interface RubricCriterion {
  id: string;
  label: string;
  weight: number;
  /** The scorable form field this criterion reads its value from. */
  fieldId?: string;
}

export interface Rubric {
  id: string;
  name: string;
  /** The form this rubric scores — its scorable fields feed the criteria. */
  formId: string;
  formula: Formula;
  passThreshold: number; // percentage 0–100
  status: RubricStatus;
  criteria: RubricCriterion[];
}

export const RUBRICS: Rubric[] = [
  {
    id: 'rubric-capstone',
    name: 'เกณฑ์ให้คะแนนโปรเจกต์จบ',
    formId: 'form-capstone',
    formula: 'weighted',
    passThreshold: 60,
    status: 'active',
    criteria: [
      { id: 'rc1', label: 'ความคิดริเริ่ม & นวัตกรรม', weight: 30, fieldId: 'cap-originality' },
      { id: 'rc2', label: 'การดำเนินการทางเทคนิค', weight: 30, fieldId: 'cap-technical' },
      { id: 'rc3', label: 'การนำเสนอ', weight: 20, fieldId: 'cap-presentation' },
      { id: 'rc4', label: 'เอกสาร', weight: 20, fieldId: 'cap-documentation' },
    ],
  },
  {
    id: 'rubric-peer',
    name: 'น้ำหนักการมีส่วนร่วมของเพื่อน',
    formId: 'form-peer',
    formula: 'average',
    passThreshold: 50,
    status: 'active',
    criteria: [
      { id: 'rc1', label: 'การทำงานร่วมกัน', weight: 25, fieldId: 'peer-collaboration' },
      { id: 'rc2', label: 'ความน่าเชื่อถือ', weight: 25, fieldId: 'peer-reliability' },
      { id: 'rc3', label: 'การมีส่วนร่วม', weight: 50, fieldId: 'peer-contribution' },
    ],
  },
  {
    id: 'rubric-advisor',
    name: 'คะแนนสรุปโดยที่ปรึกษา',
    formId: 'form-advisor',
    formula: 'weighted',
    passThreshold: 70,
    status: 'active',
    criteria: [
      { id: 'rc1', label: 'บรรลุวัตถุประสงค์', weight: 40, fieldId: 'adv-objectives' },
      { id: 'rc2', label: 'ระเบียบวิธี', weight: 35, fieldId: 'adv-methodology' },
      { id: 'rc3', label: 'ผลกระทบ', weight: 25, fieldId: 'adv-impact' },
    ],
  },
  {
    id: 'rubric-pitch',
    name: 'เกณฑ์ให้คะแนนพิตช์แบบเร็ว',
    formId: 'form-pitch',
    formula: 'sum',
    passThreshold: 60,
    status: 'draft',
    criteria: [
      { id: 'rc1', label: 'ความเหมาะกับปัญหา', weight: 50, fieldId: 'pitch-fit' },
      { id: 'rc2', label: 'ศักยภาพตลาด', weight: 50, fieldId: 'pitch-market' },
    ],
  },
  {
    // 8 หัวข้อ ให้คะแนน 5 ระดับ คิดคะแนนวงรอบเป็นค่าเฉลี่ยของทั้ง 8 หัวข้อ
    // ผ่านที่ระดับ 3 จาก 5 (60%)
    id: 'rubric-oral',
    name: 'เกณฑ์ประเมิน Oral 8 หัวข้อ (5 ระดับ)',
    formId: 'form-oral',
    formula: 'average',
    passThreshold: 60,
    status: 'active',
    criteria: [
      { id: 'rc1', label: 'การตั้งเป้าหมาย', weight: 13, fieldId: 'oral-tp1' },
      { id: 'rc2', label: 'การวางแผน', weight: 12, fieldId: 'oral-tp2' },
      { id: 'rc3', label: 'การประชุม', weight: 13, fieldId: 'oral-tp3' },
      { id: 'rc4', label: 'เอกสารความต้องการ', weight: 12, fieldId: 'oral-tp4' },
      { id: 'rc5', label: 'การออกแบบซอฟต์แวร์', weight: 13, fieldId: 'oral-tp5' },
      { id: 'rc6', label: 'การเขียนโปรแกรม', weight: 12, fieldId: 'oral-tp6' },
      { id: 'rc7', label: 'การทดสอบซอฟต์แวร์', weight: 13, fieldId: 'oral-tp7' },
      { id: 'rc8', label: 'การควบคุมการเปลี่ยนแปลง', weight: 12, fieldId: 'oral-tp8' },
    ],
  },
];

// --- Assignments ------------------------------------------------------------

export type EvalType = 'self' | 'peer' | 'advisor' | 'committee';
export type AssignmentStatus = 'scheduled' | 'active' | 'closed';

export const EVAL_TYPE_META: Record<EvalType, { label: string; color: string }> = {
  self: { label: 'ประเมินตนเอง', color: ACCENT.violet },
  peer: { label: 'เพื่อนประเมิน', color: ACCENT.blue },
  advisor: { label: 'ที่ปรึกษา', color: ACCENT.cyan },
  committee: { label: 'กรรมการ', color: ACCENT.green },
};

export const ASSIGNMENT_STATUS_META: Record<
  AssignmentStatus,
  { label: string; color: string }
> = {
  scheduled: { label: 'ตั้งเวลาไว้', color: ACCENT.blue },
  active: { label: 'กำลังดำเนินการ', color: ACCENT.green },
  closed: { label: 'ปิดแล้ว', color: ACCENT.violet },
};

/**
 * An assignment fans a form + rubric out to `evaluators × targets`, producing
 * `evaluators.length × targets.length` evaluation tasks. `submitted` tracks how
 * many of those tasks have been turned in.
 */
/**
 * How the scored fields are split between evaluators, with **no overlap** — each
 * evaluator owns a disjoint subset of the form's criteria and only scores those.
 * Optional: most assignments have every evaluator score the whole form; the Oral
 * team-review case (3 advisors dividing 8 topics) is the one that uses it.
 */
export interface EvaluatorSplit {
  evaluator: string;
  /** Human-readable labels of the criteria this evaluator owns. */
  topics: string[];
}

export interface Assignment {
  id: string;
  title: string;
  formId: string;
  rubricId: string;
  type: EvalType;
  subjectCode: string;
  subject: string;
  evaluators: string[];
  targets: string[];
  assignedDate: string; // ISO
  dueDate: string; // ISO
  status: AssignmentStatus;
  /** Number of the generated tasks that have been submitted. */
  submitted: number;
  /** Present when evaluators divide the criteria between them (no overlap). */
  topicSplit?: EvaluatorSplit[];
}

/** Total tasks generated by an assignment. */
export const taskCount = (a: Assignment) => a.evaluators.length * a.targets.length;

export const ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    title: 'สอบป้องกันโปรเจกต์จบ — รอบกรรมการ',
    formId: 'form-capstone',
    rubricId: 'rubric-capstone',
    type: 'committee',
    subjectCode: 'CS499',
    subject: 'โปรเจกต์จบ',
    evaluators: ['อนงค์ วัฒนา', 'กิตติเศรษฐ์ เลาหง', 'ประสิทธิ์ ทองดี'],
    targets: ['ทีม A', 'ทีม B', 'ทีม D', 'ทีม E'],
    assignedDate: '2026-07-08',
    dueDate: '2026-07-20',
    status: 'active',
    submitted: 7,
  },
  {
    id: 'asg-2',
    title: 'CS205 เพื่อนประเมินการมีส่วนร่วม — สปรินต์ 3',
    formId: 'form-peer',
    rubricId: 'rubric-peer',
    type: 'peer',
    subjectCode: 'CS205',
    subject: 'โครงสร้างข้อมูล',
    evaluators: ['ณัฐพงษ์ ศรีสาย', 'พลอย ชัยพฤกษ์', 'ธนกร ใจดี', 'สุดา มีสุข'],
    targets: ['ณัฐพงษ์ ศรีสาย', 'พลอย ชัยพฤกษ์', 'ธนกร ใจดี', 'สุดา มีสุข'],
    assignedDate: '2026-07-10',
    dueDate: '2026-07-17',
    status: 'active',
    submitted: 11,
  },
  {
    id: 'asg-3',
    title: 'ที่ปรึกษาอนุมัติขั้นสุดท้าย — ภาคเรียนที่ 1',
    formId: 'form-advisor',
    rubricId: 'rubric-advisor',
    type: 'advisor',
    subjectCode: 'CS499',
    subject: 'โปรเจกต์จบ',
    evaluators: ['รุ่งโรจน์ ประเสริฐ'],
    targets: ['ทีม A', 'ทีม B', 'ทีม C'],
    assignedDate: '2026-07-12',
    dueDate: '2026-07-28',
    status: 'active',
    submitted: 1,
  },
  {
    id: 'asg-4',
    title: 'พิตช์นวัตกรรม — รอบที่ 1',
    formId: 'form-pitch',
    rubricId: 'rubric-pitch',
    type: 'committee',
    subjectCode: 'EN101',
    subject: 'การเป็นผู้ประกอบการ',
    evaluators: ['อนงค์ วัฒนา', 'ประสิทธิ์ ทองดี'],
    targets: ['สตาร์ทอัพ: NestGrid', 'สตาร์ทอัพ: MediSync', 'สตาร์ทอัพ: FarmLink'],
    assignedDate: '2026-07-22',
    dueDate: '2026-07-30',
    status: 'scheduled',
    submitted: 0,
  },
  {
    // เคสทีม T5 (TTT Brother) — วงรอบที่ 4 กำลังดำเนินการ
    // อาจารย์ 3 ท่านแบ่งหัวข้อกันประเมิน ไม่ทับกัน (ดูรายละเอียดที่ /evaluation/team)
    id: 'asg-oral',
    title: 'ประเมินความก้าวหน้าโครงงาน (Oral) — 3 ทีม · วงรอบที่ 4',
    formId: 'form-oral',
    rubricId: 'rubric-oral',
    type: 'advisor',
    subjectCode: 'SE402',
    subject: 'โครงงานวิศวกรรมซอฟต์แวร์',
    evaluators: ['อนงค์ วัฒนา', 'กิตติเศรษฐ์ เลาหง', 'ประสิทธิ์ ทองดี'],
    targets: ['ทีม T5 — TTT Brother', 'ทีม T3 — CodeCraft', 'ทีม T7 — NovaSoft'],
    assignedDate: '2027-01-05',
    dueDate: '2027-02-28',
    status: 'active',
    submitted: 0,
    topicSplit: [
      { evaluator: 'อนงค์ วัฒนา', topics: ['1. การตั้งเป้าหมาย', '2. การวางแผน', '3. การประชุม'] },
      { evaluator: 'กิตติเศรษฐ์ เลาหง', topics: ['4. เอกสารความต้องการ', '5. การออกแบบซอฟต์แวร์', '6. การเขียนโปรแกรม'] },
      { evaluator: 'ประสิทธิ์ ทองดี', topics: ['7. การทดสอบซอฟต์แวร์', '8. การควบคุมการเปลี่ยนแปลง'] },
    ],
  },
  {
    id: 'asg-5',
    title: 'CS310 เพื่อนประเมิน — กลางภาค',
    formId: 'form-peer',
    rubricId: 'rubric-peer',
    type: 'peer',
    subjectCode: 'CS310',
    subject: 'ระบบฐานข้อมูล',
    evaluators: ['ณัฐพงษ์ ศรีสาย', 'พลอย ชัยพฤกษ์', 'ธนกร ใจดี', 'สุดา มีสุข', 'อนงค์ วัฒนา', 'รุ่งโรจน์ ประเสริฐ'],
    targets: ['ณัฐพงษ์ ศรีสาย', 'พลอย ชัยพฤกษ์', 'ธนกร ใจดี', 'สุดา มีสุข', 'อนงค์ วัฒนา', 'รุ่งโรจน์ ประเสริฐ'],
    assignedDate: '2026-06-01',
    dueDate: '2026-06-14',
    status: 'closed',
    submitted: 34,
  },
];

// --- Lookups ----------------------------------------------------------------

export const getForm = (id: string) => FORMS.find((f) => f.id === id);
export const getRubric = (id: string) => RUBRICS.find((r) => r.id === id);
export const rubricsForForm = (formId: string) => RUBRICS.filter((r) => r.formId === formId);
export const getScorableField = (form: FormSummary | undefined, fieldId?: string) =>
  fieldId ? form?.scorableFields.find((f) => f.id === fieldId) : undefined;

// --- Scoring engine ---------------------------------------------------------

export interface ScoreResult {
  /** Normalized 0–100 percentage. */
  percent: number;
  /** Raw value in the formula's own units (avg score, or total). */
  raw: number;
  /** Criteria that have no form field mapped and were skipped. */
  unmapped: number;
}

/**
 * Turn a set of per-field answers into a rubric score.
 *
 * `answers` is keyed by **form field id** — the same ids stored on a form's
 * {@link ScorableField}s and referenced by each criterion's `fieldId`. Each
 * criterion reads its field's value, normalizes it against that field's own
 * `scaleMax`, and the formula combines them:
 *
 *  - `weighted` — Σ(normalized × weight) / Σweight
 *  - `average`  — mean of normalized values (weights ignored)
 *  - `sum`      — raw point total over the max attainable
 *
 * Criteria with no mapped field (or no answer) are ignored, and reported back
 * via `unmapped` so the UI can warn.
 */
export function computeScore(
  rubric: Rubric,
  form: FormSummary | undefined,
  answers: Record<string, number>,
): ScoreResult {
  const mapped = rubric.criteria.filter((c) => c.fieldId && getScorableField(form, c.fieldId));
  const unmapped = rubric.criteria.length - mapped.length;
  if (mapped.length === 0) return { percent: 0, raw: 0, unmapped };

  const scaleOf = (c: RubricCriterion) => getScorableField(form, c.fieldId)?.scaleMax ?? 5;
  const valueOf = (c: RubricCriterion) => answers[c.fieldId as string] ?? 0;

  if (rubric.formula === 'sum') {
    const raw = mapped.reduce((s, c) => s + valueOf(c), 0);
    const max = mapped.reduce((s, c) => s + scaleOf(c), 0);
    return { percent: max === 0 ? 0 : (raw / max) * 100, raw, unmapped };
  }

  if (rubric.formula === 'average') {
    const normalized = mapped.reduce((s, c) => s + valueOf(c) / scaleOf(c), 0) / mapped.length;
    return { percent: normalized * 100, raw: normalized, unmapped };
  }

  // weighted
  const totalWeight = mapped.reduce((s, c) => s + c.weight, 0) || 1;
  const normalized = mapped.reduce((s, c) => s + (valueOf(c) / scaleOf(c)) * c.weight, 0) / totalWeight;
  return { percent: normalized * 100, raw: normalized, unmapped };
}
