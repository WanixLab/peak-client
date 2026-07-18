/**
 * Score entries for the **Scores** module.
 *
 * Mirrors the `evaluation_tasks` table in the schema (peak/schema/tables):
 * one row = **one evaluator × one target** of an assignment — the cartesian
 * fan-out described in the SQL comments. Each carries the same shape the DB
 * stores: a `status` (pending / submitted), a normalized `score_percent`
 * (NULL until submitted) and a `submitted_at` timestamp.
 *
 *   assignments ──► assignment_evaluators ─┐
 *                                          ├─► evaluation_tasks (this file)
 *               ──► assignment_targets ────┘        │
 *                                                    ├─ score_percent  (rubric.pass_threshold decides pass/fail)
 *                                                    └─ status         (submitted_at IS NOT NULL ⇒ submitted)
 *
 * Rather than re-seed numbers by hand, we derive the rows from the shared
 * {@link ASSIGNMENTS} (evaluators × targets, with `submitted` telling us how
 * many tasks are turned in) and stamp a deterministic score on the submitted
 * ones — so the Scores screen stays in sync with Assignment / Form Management.
 */

import {
  ASSIGNMENTS,
  EVAL_TYPE_META,
  getRubric,
  taskCount,
  type Assignment,
  type EvalType,
  type Formula,
} from '@/data/formManagement';
import { ALL_SEMESTERS, ACTIVE_SEMESTER_ID, yearOfSemester } from '@/data/academicData';

export type ScoreStatus = 'pending' | 'submitted';
export type TargetKind = 'student' | 'group';

export interface ScoreEntry {
  /** evaluation_tasks.id */
  id: string;
  assignmentId: string;
  /** Assignment title this task belongs to. */
  title: string;
  subjectCode: string;
  subject: string;
  evalType: EvalType;
  /** Who did the evaluating (a user, not a student). */
  evaluator: string;
  /** Who / what was evaluated. */
  target: string;
  targetKind: TargetKind;
  rubricId: string;
  formula: Formula;
  /** Rubric pass mark as a 0–100 percentage. */
  passThreshold: number;
  status: ScoreStatus;
  /** Normalized 0–100 score; `null` while the task is still pending. */
  scorePercent: number | null;
  /** ISO date the task was submitted; `null` while pending. */
  submittedAt: string | null;
  /** Academic term tag, e.g. `"2569 / 2"`. */
  term: string;
}

/** Stable 32-bit hash of a string — lets us stamp reproducible demo scores. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A team/group target vs. an individual student — inferred from the label. */
function targetKindOf(target: string): TargetKind {
  return /ทีม|team|กลุ่ม|สตาร์ทอัพ|startup|^T\d/i.test(target) ? 'group' : 'student';
}

/** Human term tag for the semester an ISO date falls into (falls back to active). */
function termOf(iso: string): string {
  const t = new Date(iso).getTime();
  const sem =
    ALL_SEMESTERS.find((s) => t >= new Date(s.start).getTime() && t <= new Date(s.end).getTime()) ??
    ALL_SEMESTERS.find((s) => s.id === ACTIVE_SEMESTER_ID);
  if (!sem) return '—';
  return `${yearOfSemester(sem.id) ?? ''} / ${sem.id.split('-')[1]}`;
}

/** Add `days` to an ISO date, returning a fresh ISO `yyyy-mm-dd`. */
function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Expand one assignment into its evaluator × target tasks. */
function tasksFor(a: Assignment): ScoreEntry[] {
  const rubric = getRubric(a.rubricId);
  const passThreshold = rubric?.passThreshold ?? 60;
  const formula = rubric?.formula ?? 'weighted';
  const total = taskCount(a);
  const term = termOf(a.assignedDate);

  const entries: ScoreEntry[] = [];
  let index = 0;
  for (const evaluator of a.evaluators) {
    for (const target of a.targets) {
      const id = `${a.id}-e${a.evaluators.indexOf(evaluator)}-t${a.targets.indexOf(target)}`;
      // The first `a.submitted` tasks (row-major) count as turned in — matches
      // how the assignment tracks its submitted total.
      const submitted = index < a.submitted;
      const r = (hash(id) % 1000) / 1000; // reproducible 0–1
      const scorePercent = submitted ? Math.round((55 + r * 42) * 10) / 10 : null; // 55.0–97.0
      const submittedAt = submitted ? addDays(a.assignedDate, 1 + (hash(id) % 10)) : null;

      entries.push({
        id,
        assignmentId: a.id,
        title: a.title,
        subjectCode: a.subjectCode,
        subject: a.subject,
        evalType: a.type,
        evaluator,
        target,
        targetKind: targetKindOf(target),
        rubricId: a.rubricId,
        formula,
        passThreshold,
        status: submitted ? 'submitted' : 'pending',
        scorePercent,
        submittedAt,
        term,
      });
      index++;
      if (index >= total) break;
    }
  }
  return entries;
}

export const SCORE_ENTRIES: ScoreEntry[] = ASSIGNMENTS.flatMap(tasksFor);

// --- Derived lookups for filters -------------------------------------------

export const SCORE_TERMS = Array.from(new Set(SCORE_ENTRIES.map((s) => s.term))).sort().reverse();

export const SCORE_SUBJECTS = Array.from(
  new Map(SCORE_ENTRIES.map((s) => [s.subjectCode, s.subject])).entries(),
).map(([code, name]) => ({ code, name }));

export { EVAL_TYPE_META };
export type { EvalType };

// --- Grade helper -----------------------------------------------------------

import { ACCENT } from '@/theme/accents';

/** Letter grade + accent colour derived from a 0–100 score. */
export function gradeFor(percent: number): { grade: string; color: string } {
  if (percent >= 80) return { grade: 'A', color: ACCENT.green };
  if (percent >= 75) return { grade: 'B+', color: ACCENT.green };
  if (percent >= 70) return { grade: 'B', color: ACCENT.cyan };
  if (percent >= 65) return { grade: 'C+', color: ACCENT.amber };
  if (percent >= 60) return { grade: 'C', color: ACCENT.amber };
  if (percent >= 50) return { grade: 'D', color: ACCENT.pink };
  return { grade: 'F', color: ACCENT.pink };
}

// --- Evaluatee identity (for the personal "My Scores" view) ----------------

export interface Evaluatee {
  name: string;
  kind: TargetKind;
  /** How many evaluation tasks target this person/team. */
  tasks: number;
}

/**
 * Everyone who has *been evaluated* — the distinct set of targets across all
 * tasks, each tagged individual vs. group. Drives the "view as" picker so the
 * personal page works for any evaluatee, not just students.
 */
export const EVALUATEES: Evaluatee[] = Array.from(
  SCORE_ENTRIES.reduce((map, e) => {
    const prev = map.get(e.target);
    map.set(e.target, { name: e.target, kind: e.targetKind, tasks: (prev?.tasks ?? 0) + 1 });
    return map;
  }, new Map<string, Evaluatee>()).values(),
).sort((a, b) => a.name.localeCompare(b.name, 'th'));

/** All evaluation tasks whose target is `name`. */
export const entriesForTarget = (name: string): ScoreEntry[] =>
  SCORE_ENTRIES.filter((e) => e.target === name);

/**
 * Resolve which evaluatee to show for a logged-in user. Prefers an exact name
 * match (a real student/teacher who is themselves a target); otherwise falls
 * back to the first evaluatee so the page always has something to show.
 */
export const resolveEvaluatee = (userName?: string): Evaluatee | undefined =>
  (userName && EVALUATEES.find((e) => e.name === userName)) || EVALUATEES[0];

// --- CSV export -------------------------------------------------------------

type Cell = string | number | null | undefined;

/** Build a CSV string (RFC-4180 quoting) with a UTF-8 BOM so Excel reads Thai. */
export function toCsv(headers: string[], rows: Cell[][]): string {
  const esc = (c: Cell) => `"${String(c ?? '').replace(/"/g, '""')}"`;
  const body = [headers, ...rows].map((line) => line.map(esc).join(',')).join('\r\n');
  return '﻿' + body;
}

/** Trigger a client-side download of `content` as a file named `filename`. */
export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
