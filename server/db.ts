/**
 * SQLite persistence layer for a2-prep.
 *
 * Tables:
 *   - questions: canonical question bank (seed + AI-generated)
 *   - explanations: cached AI explanations keyed by (question, selected option)
 *   - seen_questions: per-browser exclusion history for session freshness
 *   - question_flags: user-reported "this question is wrong" log; auto-disables
 *     a question once it accrues FLAG_DISABLE_THRESHOLD flags.
 *
 * Uses `bun:sqlite`, which is synchronous, embedded, and ships with the Bun
 * runtime, so we avoid a native build step.
 */

import { Database } from 'bun:sqlite';
import path from 'path';
import fs from 'fs';
import type { Question } from '../src/types';

/** Once a question receives this many flags it is auto-disabled. */
export const FLAG_DISABLE_THRESHOLD = 3;

/** Recently-seen window: a browser will not see the same question twice within this many days. */
export const SEEN_WINDOW_DAYS = 7;

/** Cap how many "recently seen" rows we exclude per browser so a power user eventually recycles. */
export const SEEN_EXCLUDE_CAP = 250;

export interface DbQuestion extends Question {
  source: 'seed' | 'official' | 'gemini' | 'fallback';
  flagged_count: number;
}

export interface QuizStartParams {
  browserId: string;
  mode: 'practice' | 'exam';
  examType: string;
  count: number;
}

export interface DbStats {
  totalQuestions: number;
  bySource: Record<string, number>;
  byExamType: Record<string, number>;
  totalFlags: number;
  disabledQuestions: number;
  cachedExplanations: number;
}

// Each statement runs individually via db.run() — bun:sqlite's prepared
// statements are single-statement, so we split out the DDL.
const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    exam_type TEXT NOT NULL,
    mode_hint TEXT NOT NULL DEFAULT 'both',
    category TEXT NOT NULL,
    section TEXT,
    question_text TEXT NOT NULL,
    question_text_norm TEXT NOT NULL UNIQUE,
    options_json TEXT NOT NULL,
    correct_index INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    context TEXT,
    image_url TEXT,
    option_images_json TEXT,
    source TEXT NOT NULL,
    flagged_count INTEGER NOT NULL DEFAULT 0,
    is_disabled INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_questions_exam_type ON questions(exam_type, is_disabled)`,
  `CREATE INDEX IF NOT EXISTS idx_questions_source ON questions(source)`,
  `CREATE TABLE IF NOT EXISTS explanations (
    question_id TEXT NOT NULL,
    selected_index INTEGER NOT NULL,
    body_markdown TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (question_id, selected_index)
  )`,
  `CREATE TABLE IF NOT EXISTS seen_questions (
    browser_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    seen_at INTEGER NOT NULL,
    PRIMARY KEY (browser_id, question_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_seen_browser_time ON seen_questions(browser_id, seen_at DESC)`,
  `CREATE TABLE IF NOT EXISTS question_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id TEXT NOT NULL,
    reason TEXT,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_flags_question ON question_flags(question_id)`,
];

function normalizeText(s: string): string {
  return (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Heuristic mapping from a question id/section to the exam_type bucket. */
function inferExamType(q: Question): string {
  const id = (q.id || '').toLowerCase();
  const section = (q.section || '').toLowerCase();
  if (id.includes('cils') || section.includes('cils')) return 'cils';
  if (id.includes('plida') || section.includes('plida')) return 'plida';
  return 'qcer_general';
}

export class AppDb {
  readonly db: Database;
  private readonly insertQuestion: ReturnType<Database['prepare']>;
  private readonly insertSeen: ReturnType<Database['prepare']>;
  private readonly recordFlag: ReturnType<Database['prepare']>;
  private readonly bumpFlagCount: ReturnType<Database['prepare']>;
  private readonly autoDisableIfThreshold: ReturnType<Database['prepare']>;
  private readonly upsertExplanation: ReturnType<Database['prepare']>;
  private readonly getExplanationStmt: ReturnType<Database['prepare']>;

  constructor(dbPath: string) {
    const dir = path.dirname(dbPath);
    if (dir && dir !== '.' && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.db = new Database(dbPath, { create: true });
    this.db.run('PRAGMA journal_mode = WAL');
    this.db.run('PRAGMA foreign_keys = ON');
    for (const stmt of SCHEMA_STATEMENTS) this.db.run(stmt);

    this.insertQuestion = this.db.prepare(`
      INSERT OR IGNORE INTO questions
        (id, exam_type, mode_hint, category, section, question_text, question_text_norm,
         options_json, correct_index, explanation, context, image_url, option_images_json,
         source, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    this.insertSeen = this.db.prepare(`
      INSERT INTO seen_questions (browser_id, question_id, seen_at)
      VALUES (?, ?, ?)
      ON CONFLICT(browser_id, question_id) DO UPDATE SET seen_at = excluded.seen_at
    `);
    this.recordFlag = this.db.prepare(`
      INSERT INTO question_flags (question_id, reason, created_at) VALUES (?, ?, ?)
    `);
    this.bumpFlagCount = this.db.prepare(`
      UPDATE questions SET flagged_count = flagged_count + 1 WHERE id = ?
    `);
    this.autoDisableIfThreshold = this.db.prepare(`
      UPDATE questions SET is_disabled = 1 WHERE id = ? AND flagged_count >= ?
    `);
    this.upsertExplanation = this.db.prepare(`
      INSERT INTO explanations (question_id, selected_index, body_markdown, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(question_id, selected_index) DO UPDATE SET
        body_markdown = excluded.body_markdown,
        created_at = excluded.created_at
    `);
    this.getExplanationStmt = this.db.prepare(`
      SELECT body_markdown FROM explanations WHERE question_id = ? AND selected_index = ?
    `);
  }

  /**
   * Idempotently insert questions. Dedupe key is the normalized question_text,
   * so re-running this with the same source data is safe.
   * Returns number of rows newly inserted.
   */
  insertQuestions(questions: Question[], source: DbQuestion['source']): number {
    const now = Date.now();
    let inserted = 0;
    const txn = this.db.transaction((items: Question[]) => {
      for (const q of items) {
        if (!q || !q.id || !q.questionText || !Array.isArray(q.options)) continue;
        if (
          !Number.isInteger(q.correctAnswerIndex) ||
          q.correctAnswerIndex < 0 ||
          q.correctAnswerIndex >= q.options.length
        ) {
          continue;
        }
        const result = this.insertQuestion.run(
          q.id,
          inferExamType(q),
          'both',
          q.category ?? 'Generale',
          q.section ?? null,
          q.questionText,
          normalizeText(q.questionText),
          JSON.stringify(q.options),
          q.correctAnswerIndex,
          q.explanation ?? '',
          q.context ?? null,
          q.imageUrl ?? null,
          q.optionImages ? JSON.stringify(q.optionImages) : null,
          source,
          now,
        );
        if (result.changes > 0) inserted++;
      }
    });
    txn(questions);
    return inserted;
  }

  /** True if the questions table is empty — used to decide whether to seed on boot. */
  isEmpty(): boolean {
    const row = this.db.prepare('SELECT COUNT(*) AS c FROM questions').get() as { c: number };
    return row.c === 0;
  }

  /**
   * Pick up to `count` enabled questions, excluding ones this browser has seen
   * recently. Records the chosen IDs into `seen_questions` so they won't be
   * picked again within the seen window.
   */
  fetchQuestionsForBrowser(params: QuizStartParams): DbQuestion[] {
    const { browserId, examType, count } = params;
    const sinceMs = Date.now() - SEEN_WINDOW_DAYS * 24 * 3600 * 1000;

    const seenRows = this.db.prepare(
      `SELECT question_id FROM seen_questions
         WHERE browser_id = ? AND seen_at >= ?
         ORDER BY seen_at DESC LIMIT ?`
    ).all(browserId, sinceMs, SEEN_EXCLUDE_CAP) as { question_id: string }[];
    const excludeIds = new Set(seenRows.map(r => r.question_id));

    const examFilter = examType === 'all' ? null : examType;
    const rows = (examFilter
      ? this.db.prepare(`SELECT * FROM questions WHERE is_disabled = 0 AND exam_type = ?`).all(examFilter)
      : this.db.prepare(`SELECT * FROM questions WHERE is_disabled = 0`).all()
    ) as any[];

    let pool = rows.filter(r => !excludeIds.has(r.id));

    if (pool.length < count && examFilter) {
      const allRows = this.db.prepare(`SELECT * FROM questions WHERE is_disabled = 0`).all() as any[];
      const allAvailable = allRows.filter(r => !excludeIds.has(r.id));
      const have = new Set(pool.map(r => r.id));
      for (const r of allAvailable) if (!have.has(r.id)) pool.push(r);
    }

    // If even after recycling the user has seen everything, ignore the exclusion list
    // (better to repeat than to hand back fewer than `count` questions).
    if (pool.length < count) pool = rows;

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const picked = pool.slice(0, count);

    const now = Date.now();
    const tx = this.db.transaction((items: any[]) => {
      for (const r of items) this.insertSeen.run(browserId, r.id, now);
    });
    tx(picked);

    return picked.map(rowToQuestion);
  }

  /**
   * Count enabled questions that this browser has NOT seen recently. Mirrors
   * the exclusion logic of `fetchQuestionsForBrowser` so the top-up trigger
   * can decide based on what the user actually has left — not on raw bank
   * size.
   */
  countUnseenForBrowser(browserId: string, examType: string): number {
    const sinceMs = Date.now() - SEEN_WINDOW_DAYS * 24 * 3600 * 1000;
    const examFilter = examType === 'all' ? null : examType;
    const sql = examFilter
      ? `SELECT COUNT(*) AS c FROM questions
           WHERE is_disabled = 0 AND exam_type = ?
             AND id NOT IN (
               SELECT question_id FROM seen_questions
                 WHERE browser_id = ? AND seen_at >= ?
                 ORDER BY seen_at DESC LIMIT ?
             )`
      : `SELECT COUNT(*) AS c FROM questions
           WHERE is_disabled = 0
             AND id NOT IN (
               SELECT question_id FROM seen_questions
                 WHERE browser_id = ? AND seen_at >= ?
                 ORDER BY seen_at DESC LIMIT ?
             )`;
    const row = (examFilter
      ? this.db.prepare(sql).get(examFilter, browserId, sinceMs, SEEN_EXCLUDE_CAP)
      : this.db.prepare(sql).get(browserId, sinceMs, SEEN_EXCLUDE_CAP)) as { c: number };
    return row.c;
  }

  /**
   * Return the most-recently-inserted question texts (normalized form would
   * lose punctuation cues for Gemini; we use the raw text). Used by the
   * top-up prompt as a "do not repeat these patterns" hint to push novelty.
   */
  recentQuestionTexts(examType: string, limit: number): string[] {
    const examFilter = examType === 'all' ? null : examType;
    // ORDER BY (created_at, rowid) so same-millisecond inserts have a
    // deterministic tiebreaker (rowid grows monotonically per insert).
    const rows = (examFilter
      ? this.db.prepare(
          `SELECT question_text FROM questions
             WHERE is_disabled = 0 AND exam_type = ?
             ORDER BY created_at DESC, rowid DESC LIMIT ?`
        ).all(examFilter, limit)
      : this.db.prepare(
          `SELECT question_text FROM questions
             WHERE is_disabled = 0
             ORDER BY created_at DESC, rowid DESC LIMIT ?`
        ).all(limit)
    ) as { question_text: string }[];
    return rows.map(r => r.question_text);
  }

  /** Look up a cached explanation for (question, selected option). */
  getCachedExplanation(questionId: string, selectedIndex: number): string | null {
    const row = this.getExplanationStmt.get(questionId, selectedIndex) as { body_markdown: string } | undefined;
    return row?.body_markdown ?? null;
  }

  /** Cache a generated AI explanation so the next hit is free. */
  saveExplanation(questionId: string, selectedIndex: number, bodyMarkdown: string): void {
    this.upsertExplanation.run(questionId, selectedIndex, bodyMarkdown, Date.now());
  }

  /**
   * Flag a question as broken. Always records the flag; bumps `flagged_count`;
   * auto-disables the question once it reaches FLAG_DISABLE_THRESHOLD.
   */
  flagQuestion(questionId: string, reason?: string): { flagged_count: number; is_disabled: boolean } {
    const exists = this.db.prepare('SELECT 1 FROM questions WHERE id = ?').get(questionId);
    if (!exists) {
      this.recordFlag.run(questionId, reason ?? null, Date.now());
      return { flagged_count: 0, is_disabled: false };
    }
    const tx = this.db.transaction(() => {
      this.recordFlag.run(questionId, reason ?? null, Date.now());
      this.bumpFlagCount.run(questionId);
      this.autoDisableIfThreshold.run(questionId, FLAG_DISABLE_THRESHOLD);
    });
    tx();
    const row = this.db.prepare(
      'SELECT flagged_count, is_disabled FROM questions WHERE id = ?'
    ).get(questionId) as { flagged_count: number; is_disabled: number };
    return { flagged_count: row.flagged_count, is_disabled: row.is_disabled === 1 };
  }

  /** Snapshot stats for observability. */
  stats(): DbStats {
    const total = (this.db.prepare('SELECT COUNT(*) AS c FROM questions').get() as { c: number }).c;
    const flags = (this.db.prepare('SELECT COUNT(*) AS c FROM question_flags').get() as { c: number }).c;
    const disabled = (this.db.prepare('SELECT COUNT(*) AS c FROM questions WHERE is_disabled = 1').get() as { c: number }).c;
    const expls = (this.db.prepare('SELECT COUNT(*) AS c FROM explanations').get() as { c: number }).c;
    const bySrc = this.db.prepare('SELECT source, COUNT(*) AS c FROM questions GROUP BY source').all() as { source: string; c: number }[];
    const byExam = this.db.prepare('SELECT exam_type, COUNT(*) AS c FROM questions GROUP BY exam_type').all() as { exam_type: string; c: number }[];
    return {
      totalQuestions: total,
      totalFlags: flags,
      disabledQuestions: disabled,
      cachedExplanations: expls,
      bySource: Object.fromEntries(bySrc.map(r => [r.source, r.c])),
      byExamType: Object.fromEntries(byExam.map(r => [r.exam_type, r.c])),
    };
  }

  /** For tests: purge everything. */
  reset(): void {
    this.db.run('DELETE FROM seen_questions');
    this.db.run('DELETE FROM question_flags');
    this.db.run('DELETE FROM explanations');
    this.db.run('DELETE FROM questions');
  }

  close(): void {
    this.db.close();
  }
}

function rowToQuestion(row: any): DbQuestion {
  return {
    id: row.id,
    category: row.category,
    section: row.section ?? '',
    questionText: row.question_text,
    options: JSON.parse(row.options_json),
    correctAnswerIndex: row.correct_index,
    explanation: row.explanation,
    difficulty: 'A2',
    context: row.context ?? undefined,
    imageUrl: row.image_url ?? undefined,
    optionImages: row.option_images_json ? JSON.parse(row.option_images_json) : undefined,
    source: row.source,
    flagged_count: row.flagged_count,
  };
}

let singleton: AppDb | null = null;

/** Open (or return the existing) singleton DB. Path comes from DB_PATH env var. */
export function getDb(): AppDb {
  if (!singleton) {
    const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'data/app.db');
    singleton = new AppDb(dbPath);
  }
  return singleton;
}

/** Test helper: replace the singleton with a fresh in-memory DB. */
export function _resetSingletonForTests(): AppDb {
  if (singleton) singleton.close();
  singleton = new AppDb(':memory:');
  return singleton;
}
