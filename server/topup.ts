/**
 * Shared question-generation helper used by:
 *   - the /api/quiz/start background top-up trigger
 *   - the boot-time `warmupIfNeeded` in server/seed.ts
 *   - the periodic top-up tick
 *
 * Centralizing the prompt + schema avoids drift between the three call sites.
 * The helper builds a Gemini Flash text-gen request enriched with:
 *   - a category-bias hint (target whichever category has the fewest items)
 *   - a "do not repeat these recent texts" novelty hint
 *   - examType-specific few-shot examples from the official exam booklets
 */

import { GoogleGenAI, Type } from '@google/genai';
import { getDb } from './db';
import { isWellFormedQuestion } from './validate';
import { officialSamples } from '../src/data/officialSamples';

const TEXT_MODEL = 'gemini-3.5-flash';

/** Max total bank size before periodic top-ups stop firing. Configurable via env. */
export function maxBankSize(): number {
  const raw = Number(process.env.MAX_BANK_SIZE);
  if (!Number.isInteger(raw) || raw < 100) return 2000;
  return raw;
}

/** Few-shot block for a given examType — same logic as the prompt builder in server.ts. */
function fewShotBlock(examType: string, maxExamples = 3): string {
  const matchers: Record<string, (q: typeof officialSamples[number]) => boolean> = {
    cils:        q => q.id.startsWith('off_cils_'),
    cils_adj:    q => q.section === 'CILS Aggettivi',
    cils_verb:   q => q.section === 'CILS Verbi',
    cils_cloze:  q => q.section === 'CILS Cloze',
    plida:       q => q.id.startsWith('off_plida_'),
    plida_job:   q => q.section === 'PLIDA Lavoro',
    plida_slogan:q => q.section === 'PLIDA Slogan',
  };
  const filter = matchers[examType] || (() => false);
  const picks = officialSamples.filter(filter).slice(0, maxExamples);
  if (picks.length === 0) return '';
  const json = picks.map(q => ({
    category: q.category,
    section: q.section,
    context: q.context,
    questionText: q.questionText,
    options: q.options,
    correctAnswerIndex: q.correctAnswerIndex,
    explanation: q.explanation,
  }));
  return `\nFEW-SHOT EXAMPLES (verbatim from the official CILS/PLIDA sample booklets — match this style):\n${JSON.stringify(json, null, 2)}\n`;
}

/** Pick the category with the smallest count *within this examType* so top-ups self-balance. */
function pickWeakestCategory(examType: string): string | null {
  const db = getDb();
  const examFilter = examType === 'all' ? null : examType;
  const rows = (examFilter
    ? db.db.prepare(
        `SELECT category, COUNT(*) AS c FROM questions
           WHERE is_disabled = 0 AND exam_type = ?
           GROUP BY category ORDER BY c ASC LIMIT 1`
      ).all(examFilter)
    : db.db.prepare(
        `SELECT category, COUNT(*) AS c FROM questions
           WHERE is_disabled = 0
           GROUP BY category ORDER BY c ASC LIMIT 1`
      ).all()
  ) as { category: string; c: number }[];
  return rows[0]?.category ?? null;
}

/**
 * Generate `n` fresh A2 questions via Gemini text-gen, validate, persist.
 * Returns the number of new rows inserted (text-norm dedupe means
 * duplicates against the existing bank are dropped silently).
 *
 * Caller is responsible for the rate-limit / cooldown check.
 */
export async function generateBatchAndPersist(ai: GoogleGenAI, examType: string, n: number): Promise<number> {
  // Respect the bank cap so periodic top-ups can't grow forever.
  const currentTotal = getDb().stats().totalQuestions;
  if (currentTotal >= maxBankSize()) {
    console.log(`[top-up] bank at ${currentTotal} >= MAX_BANK_SIZE — skipping batch`);
    return 0;
  }

  const safeN = Math.max(5, Math.min(60, n));
  const optionCount = examType === 'cils' || examType.startsWith('cils_') ? 3 : 4;

  const weakest = pickWeakestCategory(examType);
  const biasHint = weakest
    ? `Bias the batch toward category "${weakest}" (currently underrepresented in the bank).`
    : '';

  // "Do not repeat these recent question patterns" — cheapest novelty lever
  // we have. Trim each text to first 80 chars so the prompt stays compact.
  const recentTexts = getDb().recentQuestionTexts(examType, 20)
    .map(t => '- ' + t.replace(/\s+/g, ' ').slice(0, 80))
    .join('\n');
  const novelty = recentTexts
    ? `\nDO NOT generate questions that re-use any of these recent patterns; pick fresh scenarios, vocabulary, and grammatical points:\n${recentTexts}\n`
    : '';

  const prompt = `Generate a JSON array of ${safeN} fresh Italian QCER A2 exam questions for examType="${examType}".
Each item: { id (unique string starting with "gen_a2_${examType}_"), category ('Grammatica'|'Vocabolario'|'Lettura'|'Situazioni'), section, questionText (use "__________" as the blank), options (array of ${optionCount} strings), correctAnswerIndex (0-based, must point to a valid option), explanation, difficulty:"A2", optional context }.
Strictly valid A2 Italian grammar; no duplicates within the batch.
${biasHint}${novelty}${fewShotBlock(examType)}`;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING },
              section: { type: Type.STRING },
              questionText: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              context: { type: Type.STRING },
            },
            required: ['id', 'category', 'section', 'questionText', 'options', 'correctAnswerIndex', 'explanation', 'difficulty'],
          },
        },
      },
    });
    const items = JSON.parse(response.text || '[]');
    const valid = (Array.isArray(items) ? items : []).filter(isWellFormedQuestion);
    if (valid.length === 0) return 0;
    const inserted = getDb().insertQuestions(valid, 'gemini');
    console.log(`[top-up] examType=${examType} inserted ${inserted}/${valid.length} (bank now ${getDb().stats().totalQuestions})`);
    return inserted;
  } catch (err: any) {
    console.warn(`[top-up] examType=${examType} failed: ${err?.message}`);
    return 0;
  }
}
