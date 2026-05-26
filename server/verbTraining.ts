/**
 * AI item generator for the verb-tense training feature.
 *
 * Responsibilities:
 *   - Build a Gemini prompt tailored to (tense, stepKind), with rules
 *     embedded, A2-anchored few-shot examples, and a "do not repeat" hint
 *     drawn from recently generated items.
 *   - Call Gemini with a strict JSON response schema, validate items
 *     before persisting (4 unique options, in-range answer key, sensible
 *     ending for regular conjugations when we can predict it).
 *   - Persist via the shared SQLite layer using the (category, section)
 *     convention: category='TempiVerbali', section=`${tense}:${step}`.
 *   - Provide a cache-first `fetchOrGenerate` that mirrors the
 *     /api/quiz/start "serve from bank, top up on the side" pattern.
 *
 * This module is purposefully side-effect free at load time: no top-level
 * Gemini calls, no DB writes. The endpoint owns scheduling.
 */

import { type GoogleGenAI, Type } from '@google/genai';
import { getDb } from './db';
import type { Question } from '../src/types';
import { rulesPromptBlock, type TenseId, type StepKind } from '../src/data/verbTenses';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface VerbTrainingRequest {
  browserId: string;
  tense: TenseId;
  step: StepKind;
  count: number;
  redrillVerbs?: string[];
}

export interface VerbTrainingResult {
  items: Question[];
  isFallback?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEXT_MODEL = 'gemini-3.5-flash';

/** Default warm-cache target per (tense, step) bucket. */
const DEFAULT_WARMUP_TARGET = 24;

/** Minimum batch size when we have to synchronously top up to satisfy a request. */
const MIN_SYNC_BATCH = 8;

/** Maximum items we'll ask Gemini for in a single call. */
const MAX_BATCH_SIZE = 16;

// ---------------------------------------------------------------------------
// Few-shot examples — A2-correct hand-written anchors, 3 per step kind.
// These are the single biggest lever on output quality, so they are
// intentionally hand-tuned. The model should mimic this style.
// ---------------------------------------------------------------------------

interface FewShotItem {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  verbInfinitive: string;
}

const FEW_SHOT: Record<StepKind, FewShotItem[]> = {
  vocab: [
    {
      questionText: 'Quale verbo significa "to speak"?',
      options: ['parlare', 'partire', 'pagare', 'portare'],
      correctAnswerIndex: 0,
      explanation: '"Parlare" significa "to speak" o "to talk". Gli altri sono "to leave", "to pay", "to bring".',
      verbInfinitive: 'parlare',
    },
    {
      questionText: 'Che cosa significa "mangiare"?',
      options: ['to eat', 'to drink', 'to sleep', 'to walk'],
      correctAnswerIndex: 0,
      explanation: '"Mangiare" vuol dire "to eat". "Bere" è "to drink", "dormire" è "to sleep", "camminare" è "to walk".',
      verbInfinitive: 'mangiare',
    },
    {
      questionText: 'Quale verbo significa "to go out / to leave"?',
      options: ['uscire', 'entrare', 'salire', 'scendere'],
      correctAnswerIndex: 0,
      explanation: '"Uscire" significa "to go out". "Entrare" è "to enter", "salire" "to go up", "scendere" "to go down".',
      verbInfinitive: 'uscire',
    },
  ],
  recognize: [
    {
      questionText: "Qual è l'infinito di \"parliamo\"?",
      options: ['parlare', 'parlere', 'parlire', 'parlere'],
      correctAnswerIndex: 0,
      explanation: '"Parliamo" è la prima persona plurale (noi) del presente indicativo di "parlare" (1ª coniugazione).',
      verbInfinitive: 'parlare',
    },
    {
      questionText: "Qual è l'infinito di \"hanno finito\"?",
      options: ['finire', 'finare', 'fenire', 'fenere'],
      correctAnswerIndex: 0,
      explanation: '"Hanno finito" è il passato prossimo di "finire" (3ª coniugazione, in -isc-): participio passato "finito".',
      verbInfinitive: 'finire',
    },
    {
      questionText: "Qual è l'infinito di \"è andata\"?",
      options: ['andare', 'venire', 'stare', 'essere'],
      correctAnswerIndex: 0,
      explanation: '"È andata" è il passato prossimo di "andare" (verbo di movimento, ausiliare "essere", participio "andato/a").',
      verbInfinitive: 'andare',
    },
  ],
  conjugate: [
    {
      questionText: 'Coniuga "parlare" (noi) al presente indicativo.',
      options: ['parliamo', 'parlate', 'parlano', 'parlamo'],
      correctAnswerIndex: 0,
      explanation: 'Al presente indicativo di "parlare", la prima persona plurale (noi) prende la desinenza -iamo: "parliamo".',
      verbInfinitive: 'parlare',
    },
    {
      questionText: 'Coniuga "andare" (io) al passato prossimo.',
      options: ['sono andato', 'ho andato', 'sono andata', 'ero andato'],
      correctAnswerIndex: 0,
      explanation: '"Andare" è un verbo di movimento e vuole l\'ausiliare "essere". Per un soggetto maschile: "sono andato".',
      verbInfinitive: 'andare',
    },
    {
      questionText: 'Coniuga "mangiare" (voi) al presente indicativo.',
      options: ['mangiate', 'mangiamo', 'mangiano', 'mangete'],
      correctAnswerIndex: 0,
      explanation: 'Al presente, la seconda persona plurale (voi) di "mangiare" è "mangiate" (desinenza -ate della 1ª coniugazione).',
      verbInfinitive: 'mangiare',
    },
  ],
  context: [
    {
      questionText: 'Ogni mattina io ___ il caffè al bar. (prendere)',
      options: ['prendo', 'prendi', 'prende', 'prendiamo'],
      correctAnswerIndex: 0,
      explanation: 'Il soggetto è "io" e l\'azione è abituale → presente indicativo di "prendere" → "prendo".',
      verbInfinitive: 'prendere',
    },
    {
      questionText: 'Ieri Maria ___ al cinema con un\'amica. (andare)',
      options: ['è andata', 'ha andato', 'è andato', 'andava'],
      correctAnswerIndex: 0,
      explanation: '"Ieri" indica un\'azione conclusa nel passato → passato prossimo. "Andare" vuole "essere"; soggetto femminile → "è andata".',
      verbInfinitive: 'andare',
    },
    {
      questionText: 'Noi ___ una pizza per cena stasera. (mangiare)',
      options: ['mangiamo', 'mangiano', 'mangiate', 'mangia'],
      correctAnswerIndex: 0,
      explanation: 'Soggetto "noi" al presente indicativo: la 1ª persona plurale di "mangiare" è "mangiamo".',
      verbInfinitive: 'mangiare',
    },
  ],
  mixed: [
    {
      questionText: 'Che cosa significa "dormire"?',
      options: ['to sleep', 'to eat', 'to read', 'to write'],
      correctAnswerIndex: 0,
      explanation: '"Dormire" significa "to sleep" (3ª coniugazione, regolare).',
      verbInfinitive: 'dormire',
    },
    {
      questionText: "Qual è l'infinito di \"siamo partiti\"?",
      options: ['partire', 'partare', 'parture', 'pertire'],
      correctAnswerIndex: 0,
      explanation: '"Siamo partiti" è il passato prossimo di "partire": ausiliare "essere", participio "partito".',
      verbInfinitive: 'partire',
    },
    {
      questionText: 'Coniuga "leggere" (tu) al presente indicativo.',
      options: ['leggi', 'leggo', 'legge', 'leggete'],
      correctAnswerIndex: 0,
      explanation: 'Al presente di "leggere" (2ª coniugazione), la seconda persona singolare (tu) è "leggi".',
      verbInfinitive: 'leggere',
    },
  ],
};

// ---------------------------------------------------------------------------
// Regular-ending predictor — used only as a sanity check on 'conjugate'.
// If we can't safely predict the ending (irregular root, unknown tense), we
// return null and skip the check rather than reject a possibly-correct item.
// ---------------------------------------------------------------------------

type Pronoun = 'io' | 'tu' | 'lui' | 'lei' | 'noi' | 'voi' | 'loro';

const REGULAR_ENDINGS: Record<string, Record<string, Record<Pronoun, string>>> = {
  // Each tense → conjugation class (-are/-ere/-ire/-ire-isc) → pronoun → ending suffix.
  presente: {
    are:    { io: 'o',  tu: 'i',  lui: 'a',  lei: 'a',  noi: 'iamo', voi: 'ate',  loro: 'ano' },
    ere:    { io: 'o',  tu: 'i',  lui: 'e',  lei: 'e',  noi: 'iamo', voi: 'ete',  loro: 'ono' },
    ire:    { io: 'o',  tu: 'i',  lui: 'e',  lei: 'e',  noi: 'iamo', voi: 'ite',  loro: 'ono' },
    ireisc: { io: 'isco', tu: 'isci', lui: 'isce', lei: 'isce', noi: 'iamo', voi: 'ite', loro: 'iscono' },
  },
  imperfetto: {
    are:    { io: 'avo', tu: 'avi', lui: 'ava', lei: 'ava', noi: 'avamo', voi: 'avate', loro: 'avano' },
    ere:    { io: 'evo', tu: 'evi', lui: 'eva', lei: 'eva', noi: 'evamo', voi: 'evate', loro: 'evano' },
    ire:    { io: 'ivo', tu: 'ivi', lui: 'iva', lei: 'iva', noi: 'ivamo', voi: 'ivate', loro: 'ivano' },
    ireisc: { io: 'ivo', tu: 'ivi', lui: 'iva', lei: 'iva', noi: 'ivamo', voi: 'ivate', loro: 'ivano' },
  },
  futuro: {
    are:    { io: 'erò',  tu: 'erai',  lui: 'erà',  lei: 'erà',  noi: 'eremo',  voi: 'erete',  loro: 'eranno' },
    ere:    { io: 'erò',  tu: 'erai',  lui: 'erà',  lei: 'erà',  noi: 'eremo',  voi: 'erete',  loro: 'eranno' },
    ire:    { io: 'irò',  tu: 'irai',  lui: 'irà',  lei: 'irà',  noi: 'iremo',  voi: 'irete',  loro: 'iranno' },
    ireisc: { io: 'irò',  tu: 'irai',  lui: 'irà',  lei: 'irà',  noi: 'iremo',  voi: 'irete',  loro: 'iranno' },
  },
};

/**
 * Return the expected ending suffix for a regular verb in a given tense+pronoun,
 * or null if we can't safely predict it (irregular verb, compound tense,
 * unknown tense). Caller uses this as a soft sanity check only.
 *
 * Exported for tests.
 */
export function expectedRegularEnding(
  verb: string,
  pronoun: Pronoun | string,
  tense: string,
): string | null {
  if (!verb || !pronoun || !tense) return null;
  const lower = verb.toLowerCase().trim();

  // Compound tenses use auxiliary + participle; ending-of-form is the
  // participle agreement, which depends on aux choice and gender. Too
  // ambiguous to enforce here.
  if (tense === 'passato_prossimo' || tense === 'trapassato_prossimo' || tense.includes('composto')) {
    return null;
  }

  // Known small set of high-frequency irregulars at A2 — skip the check.
  const A2_IRREGULARS = new Set([
    'essere', 'avere', 'andare', 'venire', 'stare', 'dare', 'fare',
    'dire', 'sapere', 'potere', 'volere', 'dovere', 'uscire', 'bere',
    'rimanere', 'tenere', 'salire', 'morire', 'piacere',
  ]);
  if (A2_IRREGULARS.has(lower)) return null;

  let cls: string | null = null;
  let stem: string | null = null;
  if (lower.endsWith('are')) { cls = 'are'; stem = lower.slice(0, -3); }
  else if (lower.endsWith('ere')) { cls = 'ere'; stem = lower.slice(0, -3); }
  else if (lower.endsWith('ire')) {
    // Best-effort -isc detection: many common A2 verbs (finire, capire,
    // preferire, pulire, spedire) take -isc-; we can't know for sure
    // without a lexicon, so we accept either form by returning the plain
    // -ire ending and letting the validator match a suffix family.
    cls = 'ire';
    stem = lower.slice(0, -3);
  } else {
    return null;
  }

  const tenseTable = REGULAR_ENDINGS[tense];
  if (!tenseTable) return null;
  const classTable = tenseTable[cls];
  if (!classTable) return null;
  const suffix = classTable[pronoun as Pronoun];
  if (!suffix) return null;

  return stem + suffix;
}

// ---------------------------------------------------------------------------
// Prompt construction
// ---------------------------------------------------------------------------

interface BuildPromptOpts {
  recentTexts?: string[];
  redrillVerbs?: string[];
}

/**
 * Compose the Gemini prompt for a (tense, step, count) request. Embeds:
 *   - the canonical tense rule sheet from src/data/verbTenses.ts
 *   - 3 hand-tuned few-shot items for the step kind
 *   - a "don't repeat these texts" anti-duplication hint
 *   - an optional redrill bias
 *
 * Exported for tests / debug logging.
 */
export function buildPrompt(
  tense: TenseId,
  step: StepKind,
  count: number,
  opts: BuildPromptOpts = {},
): string {
  const rules = safeRulesBlock(tense);
  const fewShot = FEW_SHOT[step] ?? FEW_SHOT.mixed;
  const fewShotJson = JSON.stringify(
    fewShot.map(f => ({
      questionText: f.questionText,
      options: f.options,
      correctAnswerIndex: f.correctAnswerIndex,
      explanation: f.explanation,
      verbInfinitive: f.verbInfinitive,
    })),
    null,
    2,
  );

  const stepInstructions = stepInstructionsBlock(step);

  const recent = (opts.recentTexts ?? [])
    .map(t => '- ' + (t || '').replace(/\s+/g, ' ').slice(0, 90))
    .join('\n');
  const noveltyBlock = recent
    ? `\nDO NOT repeat any of these recent question texts — generate fresh stems, fresh verbs, fresh scenarios:\n${recent}\n`
    : '';

  const redrillBlock = (opts.redrillVerbs && opts.redrillVerbs.length > 0)
    ? `\nREDRILL BIAS: focus this batch on these specific infinitives the learner got wrong recently: ${opts.redrillVerbs.join(', ')}. Each item should test one of these verbs (set "verbInfinitive" accordingly).\n`
    : '';

  return [
    `You are an A2-level Italian language teacher writing exam-prep drill items for the tense "${tense}" using the step format "${step}".`,
    `Generate a JSON array of exactly ${count} items, each a focused A2 multiple-choice question.`,
    '',
    'CANONICAL RULES FOR THIS TENSE (must be respected in every item):',
    rules,
    '',
    'STEP-SPECIFIC INSTRUCTIONS:',
    stepInstructions,
    '',
    'GLOBAL FORMAT REQUIREMENTS (every item):',
    '- questionText: short, A2-appropriate, Italian (use English only when the step is "vocab" and you need a gloss).',
    '- options: exactly 4 strings, all distinct, no leading bullets or labels (no "A)", no "1.").',
    '- correctAnswerIndex: 0-based integer pointing to the correct option.',
    '- explanation: 1-2 sentences in Italian explaining the grammar (cite the rule).',
    '- verbInfinitive: the lowercase infinitive form of the verb the item is about (e.g., "parlare", "andare"). Must always be present.',
    '- Strictly valid A2 Italian: standard orthography, correct agreement, no archaic forms.',
    '- Distractors must be plausible: wrong pronoun ending, wrong auxiliary, wrong participle agreement, or a close-but-wrong infinitive — never random unrelated words.',
    '',
    'FEW-SHOT EXAMPLES (match this style exactly):',
    fewShotJson,
    redrillBlock,
    noveltyBlock,
  ].join('\n');
}

/** Safe wrapper around rulesPromptBlock — degrades gracefully if the module isn't loadable. */
function safeRulesBlock(tense: TenseId): string {
  try {
    const block = rulesPromptBlock(tense);
    return typeof block === 'string' && block.trim().length > 0
      ? block
      : `(No rule sheet available for tense "${tense}".)`;
  } catch {
    return `(No rule sheet available for tense "${tense}".)`;
  }
}

function stepInstructionsBlock(step: StepKind): string {
  switch (step) {
    case 'vocab':
      return [
        'This is a "match the meaning" / vocabulary step.',
        '- Stem is either "Quale verbo significa \\"...\\"?" or "Che cosa significa \\"...\\"?"',
        '- Options are short Italian infinitives OR short English glosses, never full sentences.',
        '- Distractors should be other A2 verbs from a similar semantic field (e.g., movement, food, daily routine).',
      ].join('\n');
    case 'recognize':
      return [
        'This is an "identify the infinitive" step.',
        "- Stem is \"Qual è l'infinito di '<form>'?\" where <form> is a single conjugated verb form (e.g., \"parliamo\", \"è andata\", \"hanno finito\").",
        '- The 4 options are plausible infinitives, including 1 correct and 3 near-misses (wrong conjugation class, similar spelling, fake -ere/-are swap).',
        '- Cover regular AND a few common irregular A2 verbs (essere, avere, andare, fare, stare, venire).',
      ].join('\n');
    case 'conjugate':
      return [
        'This is a "conjugate this verb" production step.',
        '- Stem like: "Coniuga \\"parlare\\" (noi) al presente indicativo."',
        '- Always state both the infinitive (in quotes) and the pronoun (in parentheses).',
        '- Options are 4 conjugated forms: 1 correct + 3 distractors that test predictable mistakes:',
        '  · wrong pronoun ending (e.g., "parlate" instead of "parliamo")',
        '  · wrong auxiliary for compound tenses (e.g., "ho andato" instead of "sono andato")',
        '  · wrong participle gender agreement when "essere" is the aux (e.g., "sono andato" for a feminine subject)',
        '  · wrong conjugation-class ending (e.g., "parlono" instead of "parlano")',
      ].join('\n');
    case 'context':
      return [
        'This is a "fill in the blank in context" step.',
        '- Stem is a complete short Italian sentence with one blank "___" and the infinitive hint in parentheses at the end, e.g., "Ieri Maria ___ al cinema. (andare)".',
        '- The surrounding sentence must disambiguate the right tense (time markers like "ieri", "ogni giorno", "domani", "mentre", "di solito").',
        '- Options are 4 conjugated forms with the same distractor logic as the "conjugate" step.',
      ].join('\n');
    case 'mixed':
      return [
        'This is a MIXED step — produce a roughly even random blend of the four sub-types (vocab, recognize, conjugate, context).',
        'Each item should pick one sub-type and follow its rules exactly.',
        'Aim for variety: do not stack 3 identical sub-types in a row.',
      ].join('\n');
    default:
      return '(Unknown step kind — fall back to a context-fill format.)';
  }
}

// ---------------------------------------------------------------------------
// Gemini response schema — mirrors server.ts /api/generate-questions shape.
// ---------------------------------------------------------------------------

const RESPONSE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      questionText: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswerIndex: { type: Type.INTEGER },
      explanation: { type: Type.STRING },
      verbInfinitive: { type: Type.STRING },
    },
    required: ['questionText', 'options', 'correctAnswerIndex', 'explanation', 'verbInfinitive'],
  },
} as const;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

interface RawItem {
  questionText?: unknown;
  options?: unknown;
  correctAnswerIndex?: unknown;
  explanation?: unknown;
  verbInfinitive?: unknown;
}

/** Returns true iff `raw` is a structurally well-formed verb-training item. */
function isValidRaw(raw: RawItem, tense: TenseId, step: StepKind): boolean {
  if (!raw || typeof raw !== 'object') return false;
  const qt = raw.questionText;
  const opts = raw.options;
  const idx = raw.correctAnswerIndex;
  const expl = raw.explanation;
  const vi = raw.verbInfinitive;

  if (typeof qt !== 'string' || qt.trim().length === 0) return false;
  if (!Array.isArray(opts) || opts.length !== 4) return false;
  if (!opts.every(o => typeof o === 'string' && o.trim().length > 0)) return false;
  const lowered = opts.map(o => (o as string).trim().toLowerCase());
  if (new Set(lowered).size !== 4) return false; // dedupe
  if (!Number.isInteger(idx) || (idx as number) < 0 || (idx as number) > 3) return false;
  if (typeof expl !== 'string' || expl.trim().length === 0) return false;
  if (typeof vi !== 'string' || vi.trim().length === 0) return false;

  // Soft conjugation-ending check: only for 'conjugate' step, only when we
  // can predict the ending for a regular verb. Otherwise skip.
  if (step === 'conjugate') {
    const stem = (raw.questionText as string);
    // Extract pronoun like "(noi)" / "(voi)" / "(io)" etc.
    const pronounMatch = stem.match(/\(\s*(io|tu|lui|lei|noi|voi|loro)\s*\)/i);
    if (pronounMatch) {
      const pronoun = pronounMatch[1].toLowerCase() as Pronoun;
      const expected = expectedRegularEnding((vi as string).trim().toLowerCase(), pronoun, tense);
      if (expected) {
        const chosen = ((opts as string[])[idx as number] || '').trim().toLowerCase();
        // Accept exact match OR -isc-form variant for -ire verbs (since we
        // don't know lexically whether the verb is -isc or not).
        const matches =
          chosen === expected ||
          (expected.endsWith('o') || expected.endsWith('i') || expected.endsWith('e') || expected.endsWith('iamo') || expected.endsWith('ite') || expected.endsWith('ono')
            ? chosen.endsWith(expected) || chosen.endsWith('isc' + expected.slice(expected.length - 1))
            : chosen.endsWith(expected));
        if (!matches) {
          // Soft reject: log but allow through if the chosen form at least
          // looks like a plausible Italian conjugation (ends in a vowel
          // or known compound). This avoids killing legitimate irregulars
          // the predictor mishandles.
          if (!/[aeiouàèéìòù]$/.test(chosen) && !chosen.includes(' ')) {
            return false;
          }
        }
      }
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

interface GenerateBatchOptions {
  redrillVerbs?: string[];
}

/**
 * Call Gemini once for a (tense, step, count) batch. Validates and persists
 * accepted items. Returns the inserted Question objects (with assigned ids).
 *
 * On any Gemini error, returns an empty array and logs to console — the
 * caller decides how to fall back. Does NOT throw.
 */
async function generateAndPersistBatch(
  ai: GoogleGenAI,
  tense: TenseId,
  step: StepKind,
  count: number,
  opts: GenerateBatchOptions = {},
): Promise<Question[]> {
  const safeCount = Math.max(1, Math.min(MAX_BATCH_SIZE, count));
  const recentTexts = safeRecentTexts(tense, step, 20);
  const prompt = buildPrompt(tense, step, safeCount, {
    recentTexts,
    redrillVerbs: opts.redrillVerbs,
  });

  let response;
  try {
    response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[verb-training] Gemini call failed (tense=${tense} step=${step}): ${msg}`);
    return [];
  }

  let raw: unknown;
  try {
    raw = JSON.parse(response.text || '[]');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[verb-training] Failed to parse Gemini JSON (tense=${tense} step=${step}): ${msg}`);
    return [];
  }

  if (!Array.isArray(raw)) {
    console.warn(`[verb-training] Gemini returned non-array (tense=${tense} step=${step})`);
    return [];
  }

  const sectionKey = `${tense}:${step}`;
  const questions: Question[] = [];
  let dropped = 0;
  for (const item of raw as RawItem[]) {
    if (!isValidRaw(item, tense, step)) {
      dropped++;
      continue;
    }
    questions.push({
      id: makeId(tense, step),
      category: 'TempiVerbali',
      section: sectionKey,
      questionText: String(item.questionText).trim(),
      options: (item.options as string[]).map(o => String(o).trim()),
      correctAnswerIndex: item.correctAnswerIndex as number,
      explanation: String(item.explanation).trim(),
      difficulty: 'A2',
      verbInfinitive: String(item.verbInfinitive).trim().toLowerCase(),
    });
  }

  if (dropped > 0) {
    console.warn(`[verb-training] dropped ${dropped}/${(raw as unknown[]).length} malformed items (tense=${tense} step=${step})`);
  }

  if (questions.length === 0) return [];

  try {
    const inserted = getDb().insertQuestions(questions, 'gemini');
    console.log(`[verb-training] inserted ${inserted}/${questions.length} (tense=${tense} step=${step})`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[verb-training] DB insert failed (tense=${tense} step=${step}): ${msg}`);
    return [];
  }

  return questions;
}

function makeId(tense: TenseId, step: StepKind): string {
  // crypto.randomUUID is available in modern Node/Bun runtimes.
  const rand =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `vt_${tense}_${step}_${rand}`;
}

function safeRecentTexts(tense: TenseId, step: StepKind, limit: number): string[] {
  try {
    return getDb().recentVerbTrainingTexts(tense, step, limit);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[verb-training] recentVerbTrainingTexts failed: ${msg}`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Cache-first item resolution: try the DB pool first, and only call Gemini
 * synchronously if we're short. Mirrors the /api/quiz/start pattern.
 *
 * Never throws — if Gemini fails or is slow, returns whatever was already
 * in cache with `isFallback: true`.
 */
export async function fetchOrGenerate(
  ai: GoogleGenAI,
  req: VerbTrainingRequest,
): Promise<VerbTrainingResult> {
  const { browserId, tense, step, count, redrillVerbs } = req;
  const db = getDb();

  // First attempt: serve from cache, biased away from recently-seen items
  // for this browser, with optional redrill weighting.
  let items = db.fetchVerbTrainingItems(browserId, tense, step, count, redrillVerbs);
  if (items.length >= count) {
    return { items: items.slice(0, count) };
  }

  // Short — synchronously generate at least MIN_SYNC_BATCH new items.
  const need = Math.max(count - items.length, MIN_SYNC_BATCH);
  const generated = await generateAndPersistBatch(ai, tense, step, need, { redrillVerbs });

  if (generated.length === 0) {
    // Gemini unavailable. Return whatever the cache had; mark as fallback so
    // the client can show a soft warning if it wants.
    return { items, isFallback: true };
  }

  // Re-fetch from the DB so the response goes through the same shape (with
  // source, flagged_count, normalized rowToQuestion mapping). The newly
  // inserted items haven't been recorded in seen_questions yet, so the
  // second fetch will preferentially pick them up.
  items = db.fetchVerbTrainingItems(browserId, tense, step, count, redrillVerbs);

  if (items.length === 0) {
    // Pathological: DB fetch returned nothing even after a successful
    // insert. Fall back to the generated batch directly so the user gets
    // something usable.
    return { items: generated.slice(0, count) };
  }

  return { items: items.slice(0, count) };
}

/**
 * Main entry point used by the /api/verb-training/items endpoint.
 *
 * `options.warmupOnly` = true skips the user-facing fetch and only performs
 * a warm-up generation if the cache is below target. Useful for a "wake up
 * the bank" cron-style call from the client.
 */
export async function generateVerbTrainingItems(
  ai: GoogleGenAI,
  req: VerbTrainingRequest,
  options?: { warmupOnly?: boolean },
): Promise<VerbTrainingResult> {
  if (options?.warmupOnly) {
    const inserted = await warmupVerbTraining(ai, req.tense, req.step);
    return { items: [], isFallback: inserted === 0 };
  }
  return fetchOrGenerate(ai, req);
}

/**
 * Non-blocking warm-up helper: if the (tense, step) cache is below
 * `targetSize`, generate one batch of ~12 items and persist them.
 * Callers should fire-and-forget this from the endpoint.
 *
 * Returns the number of items inserted (0 if the bank was already warm
 * or Gemini failed).
 */
export async function warmupVerbTraining(
  ai: GoogleGenAI,
  tense: TenseId,
  step: StepKind,
  targetSize: number = DEFAULT_WARMUP_TARGET,
): Promise<number> {
  let have = 0;
  try {
    have = getDb().countVerbTrainingItems(tense, step);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[verb-training:warmup] count failed (tense=${tense} step=${step}): ${msg}`);
    return 0;
  }

  if (have >= targetSize) return 0;

  // Aim for ~12 items, but don't overshoot the cap by much.
  const need = Math.min(12, Math.max(MIN_SYNC_BATCH, targetSize - have));
  const generated = await generateAndPersistBatch(ai, tense, step, need);
  return generated.length;
}
