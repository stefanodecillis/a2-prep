import { describe, it, expect, beforeEach } from 'bun:test';
import { AppDb, FLAG_DISABLE_THRESHOLD } from '../server/db';
import type { Question } from '../src/types';

function makeQ(over: Partial<Question> & { id: string }): Question {
  return {
    category: 'Grammatica',
    section: 'Preposizioni',
    questionText: `Question ${over.id}`,
    options: ['a', 'b', 'c', 'd'],
    correctAnswerIndex: 1,
    explanation: 'Because.',
    difficulty: 'A2',
    ...over,
  };
}

let db: AppDb;

beforeEach(() => {
  db = new AppDb(':memory:');
});

describe('AppDb.insertQuestions', () => {
  it('inserts valid questions and reports an accurate count', () => {
    const inserted = db.insertQuestions(
      [makeQ({ id: 'q1' }), makeQ({ id: 'q2' })],
      'seed',
    );
    expect(inserted).toBe(2);
    expect(db.stats().totalQuestions).toBe(2);
  });

  it('is idempotent on the same input (text-norm dedupe)', () => {
    const items = [makeQ({ id: 'q1' }), makeQ({ id: 'q2' })];
    db.insertQuestions(items, 'seed');
    const second = db.insertQuestions(items, 'seed');
    expect(second).toBe(0);
    expect(db.stats().totalQuestions).toBe(2);
  });

  it('drops items with out-of-range correctAnswerIndex', () => {
    const inserted = db.insertQuestions(
      [
        makeQ({ id: 'good' }),
        makeQ({ id: 'bad', correctAnswerIndex: 99 }),
        makeQ({ id: 'also-bad', correctAnswerIndex: -1 }),
      ],
      'gemini',
    );
    expect(inserted).toBe(1);
    expect(db.stats().totalQuestions).toBe(1);
  });

  it('dedupes by normalized question_text across different ids', () => {
    db.insertQuestions(
      [makeQ({ id: 'a', questionText: 'Hello   World' })],
      'seed',
    );
    const inserted = db.insertQuestions(
      [makeQ({ id: 'b', questionText: ' hello world ' })],
      'gemini',
    );
    expect(inserted).toBe(0);
    expect(db.stats().totalQuestions).toBe(1);
  });
});

describe('AppDb.fetchQuestionsForBrowser', () => {
  beforeEach(() => {
    const seeds = Array.from({ length: 20 }, (_, i) =>
      makeQ({ id: `q${i}`, questionText: `q text ${i}` }),
    );
    db.insertQuestions(seeds, 'seed');
  });

  it('returns up to `count` questions', () => {
    const got = db.fetchQuestionsForBrowser({
      browserId: 'b1',
      mode: 'practice',
      examType: 'all',
      count: 5,
    });
    expect(got.length).toBe(5);
  });

  it('records seen IDs and excludes them on the next call', () => {
    const first = db.fetchQuestionsForBrowser({
      browserId: 'b1',
      mode: 'practice',
      examType: 'all',
      count: 10,
    });
    const firstIds = new Set(first.map(q => q.id));

    const second = db.fetchQuestionsForBrowser({
      browserId: 'b1',
      mode: 'practice',
      examType: 'all',
      count: 10,
    });
    // None of the second batch should be in the first batch (we have 20 total, so 10 fresh exist)
    const overlap = second.filter(q => firstIds.has(q.id));
    expect(overlap.length).toBe(0);
  });

  it('falls back to recycling when the user has seen everything', () => {
    // Burn through the pool
    db.fetchQuestionsForBrowser({ browserId: 'b1', mode: 'practice', examType: 'all', count: 20 });
    // Next call must still return 5 — recycling is acceptable when the bank is exhausted
    const got = db.fetchQuestionsForBrowser({
      browserId: 'b1',
      mode: 'practice',
      examType: 'all',
      count: 5,
    });
    expect(got.length).toBe(5);
  });

  it('isolates seen state between different browserIds', () => {
    db.fetchQuestionsForBrowser({ browserId: 'b1', mode: 'practice', examType: 'all', count: 20 });
    const otherBrowser = db.fetchQuestionsForBrowser({
      browserId: 'b2',
      mode: 'practice',
      examType: 'all',
      count: 5,
    });
    // b2 has seen nothing, so b2 gets a fresh selection
    expect(otherBrowser.length).toBe(5);
  });
});

describe('AppDb.countUnseenForBrowser', () => {
  beforeEach(() => {
    const seeds = Array.from({ length: 12 }, (_, i) =>
      makeQ({ id: `u${i}`, questionText: `unseen-test ${i}` }),
    );
    db.insertQuestions(seeds, 'seed');
  });

  it('returns total enabled count for a brand-new browser', () => {
    expect(db.countUnseenForBrowser('newcomer', 'all')).toBe(12);
  });

  it('decreases after each fetch', () => {
    const before = db.countUnseenForBrowser('b1', 'all');
    db.fetchQuestionsForBrowser({ browserId: 'b1', mode: 'practice', examType: 'all', count: 5 });
    const after = db.countUnseenForBrowser('b1', 'all');
    expect(after).toBe(before - 5);
  });

  it('isolates state between browsers', () => {
    db.fetchQuestionsForBrowser({ browserId: 'alice', mode: 'practice', examType: 'all', count: 8 });
    expect(db.countUnseenForBrowser('alice', 'all')).toBe(4);
    expect(db.countUnseenForBrowser('bob', 'all')).toBe(12);
  });

  it('grows again when fresh questions are inserted', () => {
    db.fetchQuestionsForBrowser({ browserId: 'b1', mode: 'practice', examType: 'all', count: 10 });
    expect(db.countUnseenForBrowser('b1', 'all')).toBe(2);
    db.insertQuestions(
      [makeQ({ id: 'fresh1', questionText: 'fresh-1' }), makeQ({ id: 'fresh2', questionText: 'fresh-2' })],
      'gemini',
    );
    expect(db.countUnseenForBrowser('b1', 'all')).toBe(4);
  });

  it('excludes disabled questions from the count', () => {
    // Flag one until it auto-disables (3 flags by default)
    for (let i = 0; i < 3; i++) db.flagQuestion('u0');
    expect(db.countUnseenForBrowser('fresh-browser', 'all')).toBe(11);
  });
});

describe('AppDb.recentQuestionTexts', () => {
  it('returns the N most-recently-inserted question texts (rowid-tiebroken)', () => {
    db.insertQuestions([makeQ({ id: 'r1', questionText: 'oldest' })], 'seed');
    db.insertQuestions([makeQ({ id: 'r2', questionText: 'middle' })], 'gemini');
    db.insertQuestions([makeQ({ id: 'r3', questionText: 'newest' })], 'gemini');
    const recent = db.recentQuestionTexts('all', 2);
    expect(recent.length).toBe(2);
    // Order is created_at DESC, rowid DESC — newest insert wins, "oldest" never appears
    expect(recent).not.toContain('oldest');
  });

  it('respects the limit', () => {
    for (let i = 0; i < 10; i++) {
      db.insertQuestions([makeQ({ id: `rl${i}`, questionText: `limit-${i}` })], 'gemini');
    }
    expect(db.recentQuestionTexts('all', 3).length).toBe(3);
  });
});

describe('AppDb.flagQuestion', () => {
  beforeEach(() => {
    db.insertQuestions([makeQ({ id: 'q1' })], 'seed');
  });

  it('increments the flag count', () => {
    const r1 = db.flagQuestion('q1');
    expect(r1.flagged_count).toBe(1);
    expect(r1.is_disabled).toBe(false);
  });

  it(`auto-disables once flagged_count reaches ${FLAG_DISABLE_THRESHOLD}`, () => {
    for (let i = 1; i < FLAG_DISABLE_THRESHOLD; i++) {
      const r = db.flagQuestion('q1');
      expect(r.is_disabled).toBe(false);
    }
    const final = db.flagQuestion('q1');
    expect(final.flagged_count).toBe(FLAG_DISABLE_THRESHOLD);
    expect(final.is_disabled).toBe(true);
  });

  it('disabled questions are excluded from fetch', () => {
    for (let i = 0; i < FLAG_DISABLE_THRESHOLD; i++) db.flagQuestion('q1');
    const got = db.fetchQuestionsForBrowser({
      browserId: 'b1',
      mode: 'practice',
      examType: 'all',
      count: 5,
    });
    expect(got.find(q => q.id === 'q1')).toBeUndefined();
  });

  it('does not crash when flagging an unknown question id', () => {
    const r = db.flagQuestion('nope');
    expect(r.flagged_count).toBe(0);
    expect(r.is_disabled).toBe(false);
    // The flag is still logged for forensics
    expect(db.stats().totalFlags).toBe(1);
  });
});

describe('AppDb explanation cache', () => {
  beforeEach(() => {
    db.insertQuestions([makeQ({ id: 'q1' })], 'seed');
  });

  it('returns null on a miss', () => {
    expect(db.getCachedExplanation('q1', 0)).toBeNull();
  });

  it('round-trips a saved explanation', () => {
    db.saveExplanation('q1', 2, '## hello');
    expect(db.getCachedExplanation('q1', 2)).toBe('## hello');
  });

  it('keys cache separately per selected option', () => {
    db.saveExplanation('q1', 0, 'A');
    db.saveExplanation('q1', 1, 'B');
    expect(db.getCachedExplanation('q1', 0)).toBe('A');
    expect(db.getCachedExplanation('q1', 1)).toBe('B');
    expect(db.getCachedExplanation('q1', 2)).toBeNull();
  });

  it('overwrites on conflict', () => {
    db.saveExplanation('q1', 0, 'first');
    db.saveExplanation('q1', 0, 'second');
    expect(db.getCachedExplanation('q1', 0)).toBe('second');
  });
});

describe('AppDb.stats', () => {
  it('counts by source and exam_type', () => {
    db.insertQuestions([makeQ({ id: 'cils_1', section: 'CILS A1' })], 'seed');
    db.insertQuestions([makeQ({ id: 'gen_1' })], 'gemini');
    const s = db.stats();
    expect(s.totalQuestions).toBe(2);
    expect(s.bySource.seed).toBe(1);
    expect(s.bySource.gemini).toBe(1);
    expect(s.byExamType.cils).toBe(1);
    expect(s.byExamType.qcer_general).toBe(1);
  });
});
