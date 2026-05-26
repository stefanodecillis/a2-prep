/**
 * Seed the SQLite question bank with:
 *   1. `curatedQuestions` — hand-written A2 bank in src/data/questions.ts
 *   2. `officialSamples` — verbatim MC questions extracted from the CILS and
 *      PLIDA official sample exam booklets (source='official', shown first
 *      to users as the ground-truth reference).
 *
 * Idempotent — the UNIQUE(question_text_norm) constraint means re-running is
 * always safe. Called from server.ts at boot.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { curatedQuestions } from '../src/data/questions';
import { officialSamples } from '../src/data/officialSamples';
import { getDb } from './db';
import { generateBatchAndPersist } from './topup';

const seedDirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_AUDIO_DIR = path.resolve(seedDirname, '../src/data/seed_audio');
const SEED_AUDIO_MANIFEST = path.join(SEED_AUDIO_DIR, 'manifest.json');

/**
 * Attach pre-generated audio (shipped in the repo at `src/data/seed_audio/`)
 * to matching questions. Driven by a small manifest file mapping question id
 * → MP3 filename, so we don't depend on hash matching at runtime.
 *
 * Cost-careful design choice: TTS calls happen at the dev box via
 * `scripts/prefetch-seed-audio.ts`, never at runtime in default deploys.
 * The audio files are served from `/seed-audio/<file>.mp3` (registered in
 * server.ts) so the URLs survive container restarts and image upgrades.
 */
function attachSeedAudio(): { attached: number; missing: number } {
  if (!fs.existsSync(SEED_AUDIO_MANIFEST)) {
    return { attached: 0, missing: 0 };
  }
  let manifest: Record<string, string>;
  try {
    manifest = JSON.parse(fs.readFileSync(SEED_AUDIO_MANIFEST, 'utf8'));
  } catch (err: any) {
    console.warn('[seed-audio] manifest unreadable:', err?.message);
    return { attached: 0, missing: 0 };
  }
  const db = getDb();
  const has = db.db.prepare('SELECT id, audio_url FROM questions WHERE id = ?');
  let attached = 0;
  let missing = 0;
  for (const [questionId, filename] of Object.entries(manifest)) {
    const filePath = path.join(SEED_AUDIO_DIR, filename);
    if (!fs.existsSync(filePath)) {
      missing += 1;
      continue;
    }
    const row = has.get(questionId) as { id: string; audio_url: string | null } | undefined;
    if (!row) continue;
    const desired = `/seed-audio/${filename}`;
    if (row.audio_url !== desired) {
      db.setQuestionAudioUrl(questionId, desired);
      attached += 1;
    }
  }
  return { attached, missing };
}

export function seedFromCurated(): {
  wasEmpty: boolean;
  insertedSeed: number;
  insertedOfficial: number;
  total: number;
} {
  const db = getDb();
  const wasEmpty = db.isEmpty();
  // Official samples go in first so re-seeding never demotes them to 'seed'
  // (the UNIQUE constraint blocks duplicates after the first wins).
  const insertedOfficial = db.insertQuestions(officialSamples, 'official');
  const insertedSeed = db.insertQuestions(curatedQuestions, 'seed');
  const total = db.stats().totalQuestions;
  if (wasEmpty || insertedSeed + insertedOfficial > 0) {
    console.log(
      `[seed] Inserted ${insertedOfficial} official + ${insertedSeed} curated questions (total now ${total}, wasEmpty=${wasEmpty})`,
    );
  } else {
    console.log(`[seed] DB already populated (${total} questions) — skipping seed`);
  }
  // Attach any pre-generated audio shipped with the repo to matching items.
  // Idempotent: re-running is cheap and only updates rows whose audio_url
  // doesn't already match the manifest entry.
  const audioReport = attachSeedAudio();
  if (audioReport.attached > 0 || audioReport.missing > 0) {
    console.log(
      `[seed-audio] attached ${audioReport.attached} pre-generated audio file(s)` +
      (audioReport.missing > 0 ? ` (skipped ${audioReport.missing} manifest entries with missing files)` : ''),
    );
  }
  return { wasEmpty, insertedSeed, insertedOfficial, total };
}

/** WARMUP_TARGET_SIZE clamp — keep deploys sane. */
function warmupTargetSize(): number {
  const raw = Number(process.env.WARMUP_TARGET_SIZE);
  if (!Number.isInteger(raw) || raw < 50 || raw > 2000) return 300;
  return raw;
}

/**
 * On a fresh deploy the bank is just 109 questions, which gets exhausted in
 * 2-3 quizzes per user. If `WARMUP_ON_BOOT=true` and `GEMINI_API_KEY` is set,
 * fire a small sequence of Gemini batches in the background until the bank
 * reaches `WARMUP_TARGET_SIZE`.
 *
 * Fire-and-forget by design — we don't want to block server boot on Gemini
 * latency. Each batch logs its progress so you can `docker compose logs -f`
 * and watch the bank grow.
 *
 * Idempotent: if the bank is already at/above the target this returns
 * immediately, so it's safe to call on every boot.
 */
export async function warmupIfNeeded(): Promise<void> {
  if ((process.env.WARMUP_ON_BOOT || '').toLowerCase() !== 'true') return;
  if (!process.env.GEMINI_API_KEY) {
    console.log('[warmup] WARMUP_ON_BOOT=true but GEMINI_API_KEY is unset — skipping');
    return;
  }
  const target = warmupTargetSize();
  const total = getDb().stats().totalQuestions;
  if (total >= target) {
    console.log(`[warmup] bank already at ${total}/${target} — skipping`);
    return;
  }
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
  console.log(`[warmup] starting — bank ${total} → target ${target}`);
  // Spread the warmup across the main examTypes so the bank is balanced.
  const targets = ['qcer_general', 'cils', 'plida'];
  let cursor = 0;
  while (getDb().stats().totalQuestions < target) {
    const examType = targets[cursor % targets.length];
    cursor += 1;
    try {
      const inserted = await generateBatchAndPersist(ai, examType, 40);
      if (inserted === 0) {
        console.warn('[warmup] batch returned 0 inserts — stopping to avoid burning quota');
        break;
      }
    } catch (err: any) {
      console.warn('[warmup] batch failed:', err?.message);
      break;
    }
  }
  console.log(`[warmup] done — bank now ${getDb().stats().totalQuestions}`);
}
