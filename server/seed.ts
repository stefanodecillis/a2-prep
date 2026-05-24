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

import { curatedQuestions } from '../src/data/questions';
import { officialSamples } from '../src/data/officialSamples';
import { getDb } from './db';

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
  return { wasEmpty, insertedSeed, insertedOfficial, total };
}
