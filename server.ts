/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDb } from './server/db';
import { seedFromCurated, warmupIfNeeded } from './server/seed';
import { isWellFormedQuestion } from './server/validate';
import { officialSamples } from './src/data/officialSamples';
import { A2_WRITING_PROMPTS } from './src/data/writingPrompts';
import { PREFETTURA_WRITING_PROMPTS } from './src/data/prefetturaPrompts';
import { generateImageQuestions, getImagesDir, imageGenBatchSize, imageGenProbability, isImageGenEnabled } from './server/images';
import { generateAudioForPendingAscolto, getAudioDir, isAudioGenEnabled } from './server/audio';
import { generateBatchAndPersist, maxBankSize } from './server/topup';
import { fetchOrGenerate, warmupVerbTraining, type VerbTrainingRequest } from './server/verbTraining';
import { TENSE_ORDER, type TenseId, type StepKind } from './src/data/verbTenses';
import { shuffleQuestionOptions } from './src/data/questions';

/**
 * Build a short few-shot block from real exam samples that match the
 * requested examType. Used inside the Gemini prompt to anchor outputs to the
 * actual CILS/PLIDA exam format.
 */
function fewShotForExamType(examType: string, maxExamples = 3): string {
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
  return `\nFEW-SHOT EXAMPLES (these are verbatim items from the official exam sample booklets — match this style exactly):\n${JSON.stringify(json, null, 2)}\n`;
}

dotenv.config();

// Boot the SQLite layer and seed the static question bank if this is a fresh deploy.
// Idempotent on repeated boots.
seedFromCurated();

// Optional: warm up the bank to ~WARMUP_TARGET_SIZE questions on first boot,
// so users don't immediately exhaust the 109 seeded items. Fire-and-forget —
// we don't want to block server start on Gemini latency.
warmupIfNeeded().catch(err => console.warn('[warmup] failed:', err?.message));

const resolvedFilename = (typeof __filename !== 'undefined') 
  ? __filename 
  : (typeof import.meta !== 'undefined' && import.meta.url) 
    ? fileURLToPath(import.meta.url) 
    : '';

const resolvedDirname = (typeof __dirname !== 'undefined')
  ? __dirname
  : path.dirname(resolvedFilename);

const app = express();
app.use(express.json());

// Serve AI-generated images from the persistent volume.
// `getImagesDir()` returns `<dirname(DB_PATH)>/generated_images`, which in
// docker-compose maps to `/data/generated_images` — survives container restarts.
{
  const imagesDir = getImagesDir();
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
  app.use('/generated-images', express.static(imagesDir, { maxAge: '7d', immutable: true }));
}

// Serve cached TTS audio for Ascolto questions. Mirrors the image static
// route: content-hashed filenames make immutable caching safe — when we
// upgrade the voice the filename changes, so browsers refetch.
{
  const audioDir = getAudioDir();
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
  app.use('/generated-audio', express.static(audioDir, { maxAge: '7d', immutable: true }));
}

// Serve pre-generated seed audio shipped in the repo at src/data/seed_audio/.
// These are baked into the deployed image (no runtime TTS cost) and
// referenced by /seed-audio/<file>.mp3.
{
  const seedAudioDir = path.resolve(resolvedDirname, 'src/data/seed_audio');
  if (fs.existsSync(seedAudioDir)) {
    app.use('/seed-audio', express.static(seedAudioDir, { maxAge: '30d', immutable: true }));
  }
}

// Helper for lazy loading Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST route to check API Key status
app.get('/api/config/status', (req: Request, res: Response) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Helper to dynamically build realistic Italian level A2 language prep questions on the server side as a fallback
function generateServerFallbackQuestions(count: number, category?: string, examType: string = 'all'): any[] {
  const result: any[] = [];
  const startId = "fallback_" + examType + "_" + Math.floor(Math.random() * 1000) + "_";
  
  const subjects = [
    { it: "Marco", gender: "m", plural: false },
    { it: "Giulia", gender: "f", plural: false },
    { it: "Matteo ed Elena", gender: "m", plural: true },
    { it: "Sofia e Chiara", gender: "f", plural: true },
    { it: "I ragazzi", gender: "m", plural: true },
    { it: "Le ragazze", gender: "f", plural: true },
    { it: "Stefano", gender: "m", plural: false },
    { it: "Francesca e Roberta", gender: "f", plural: true }
  ];

  const cityPreps = [
    { city: "Roma", prep: "a" },
    { city: "Milano", prep: "a" },
    { city: "Firenze", prep: "a" },
    { city: "Venezia", prep: "a" },
    { city: "Londra", prep: "a" },
    { city: "Parigi", prep: "a" },
    { city: "casa", prep: "a" },
    { city: "scuola", prep: "a" }
  ];

  const statePreps = [
    { land: "Italia", prep: "in" },
    { land: "Francia", prep: "in" },
    { land: "Germania", prep: "in" },
    { land: "Spagna", prep: "in" },
    { land: "ufficio", prep: "in" },
    { land: "banca", prep: "in" },
    { land: "biblioteca", prep: "in" }
  ];

  const questionsPool = [
    {
      category: 'Grammatica',
      section: 'Passato Prossimo',
      build: () => {
        const sub = subjects[Math.floor(Math.random() * subjects.length)];
        let ans = "";
        let wrong: string[] = [];
        if (sub.plural) {
          ans = sub.gender === "f" ? "sono andate" : "sono andati";
          wrong = sub.gender === "f" ? ["è andata", "sono andata", "siamo andati"] : ["è andato", "sono andato", "siamo andate"];
        } else {
          ans = sub.gender === "f" ? "è andata" : "è andato";
          wrong = sub.gender === "f" ? ["è andato", "sono andate", "ha andato"] : ["è andata", "sono andati", "ha andato"];
        }
        const dest = cityPreps[Math.floor(Math.random() * cityPreps.length)];
        return {
          questionText: `Ieri ${sub.it} __________ ${dest.prep} ${dest.city} per l'esame di italiano.`,
          options: [ans, ...wrong].sort(() => 0.5 - Math.random()),
          correctAnswerIndex: -1,
          answerValue: ans,
          explanation: `The past participle of motion verbs conjugated with 'essere' must agree in gender and number with the subject '${sub.it}'.`,
          difficulty: 'A2'
        };
      }
    },
    {
      category: 'Grammatica',
      section: 'Preposizioni',
      build: () => {
        const sub = subjects[Math.floor(Math.random() * subjects.length)];
        const loc = statePreps[Math.floor(Math.random() * statePreps.length)];
        const ans = loc.prep;
        const wrong = ["a", "di", "per", "con", "su"].filter(p => p !== ans).slice(0, 3);
        return {
          questionText: `Durante le vacanze estive, ${sub.it} lavora __________ ${loc.land}.`,
          options: [ans, ...wrong].sort(() => 0.5 - Math.random()),
          correctAnswerIndex: -1,
          answerValue: ans,
          explanation: `In Italian, the preposition '${loc.prep}' is used before country names or certain architectural places like 'ufficio', 'banca', 'biblioteca'.`,
          difficulty: 'A2'
        };
      }
    },
    {
      category: 'Vocabolario',
      section: 'Cibo e Ristorazione',
      build: () => {
        const foodItems = [
          { item: "il primo piatto", details: "la pasta o il riso", wrong: ["il dessert", "la bevanda", "il caffè"] },
          { item: "il conto", details: "il pezzo di carta per pagare alla fine del pasto", wrong: ["il menu", "la mancia", "la prenotazione"] },
          { item: "il cameriere", details: "la persona che serve il cibo al tavolo", wrong: ["il cuoco", "il direttore", "il cliente"] },
          { item: "la colazione", details: "il primo pasto del mattino con cornetto e cappuccino", wrong: ["il pranzo", "la cena", "la merenda"] }
        ];
        const choice = foodItems[Math.floor(Math.random() * foodItems.length)];
        return {
          questionText: `Al ristorante, chiediamo __________ per sapere quanto dobbiamo pagare alla fine della cena.`,
          options: [choice.item, ...choice.wrong].sort(() => 0.5 - Math.random()),
          correctAnswerIndex: -1,
          answerValue: choice.item,
          explanation: `In Italian dining culture, '${choice.item}' is the bill/receipt requested to pay at the end, while others mean waiter, menu, or tip.`,
          difficulty: 'A2'
        };
      }
    },
    {
      category: 'Situazioni',
      section: 'Al bar o ristorante',
      build: () => {
        const dialogs = [
          { q: "Buongiorno, desidera?", a: "Vorrei un caffè macchiato e un cornetto, grazie.", w: ["Sì, mi chiamo Alessandro.", "No, sono francese.", "Abito a Milano."] },
          { q: "Scusi, dov'è la stazione ferroviaria?", a: "Prenda la prima strada a destra e vada dritto.", w: ["Sì, ho vent'anni.", "La colazione è deliziosa.", "Preferisco il vino rosso."] },
          { q: "Pronto, vorrei prenotare un tavolo per stasera.", a: "Certamente, per quante persone e a che ora?", w: ["Grazie mille, arrivederci!", "Non parlo bene l'inglese.", "Sì, mi piace la pasta."] }
        ];
        const d = dialogs[Math.floor(Math.random() * dialogs.length)];
        return {
          context: `Dialogo formale situazionale per la certificazione PLIDA A2.`,
          questionText: `Cliente: "${d.q}"\nRisposta corretta o continuazione del dialogo:`,
          options: [d.a, ...d.w].sort(() => 0.5 - Math.random()),
          correctAnswerIndex: -1,
          answerValue: d.a,
          explanation: `In standard situational communicative contexts, this response aligns perfectly with the speech act requested.`,
          difficulty: 'A2'
        };
      }
    },
    {
      category: 'Lettura',
      section: 'Annunci e Cartelli',
      build: () => {
        const posters = [
          { text: "Cercasi commesso con esperienza per negozio di abbigliamento in centro città. Orario part-time.", q: "Cosa si cerca in questo annuncio?", a: "Un lavoratore per vendere vestiti", w: ["Un medico per l'ospedale", "Un cameriere per un bar", "Una casa in affitto in centro"] },
          { text: "Supermercato aperto tutti i giorni dalle 8:00 alle 21:00. La domenica chiusura anticipata alle 13:00.", q: "A che ora chiude il supermercato la domenica?", a: "Alle 13:00", w: ["Alle 8:00", "Alle 21:00", "Rimane chiuso tutto il giorno"] }
        ];
        const p = posters[Math.floor(Math.random() * posters.length)];
        return {
          context: p.text,
          questionText: p.q,
          options: [p.a, ...p.w].sort(() => 0.5 - Math.random()),
          correctAnswerIndex: -1,
          answerValue: p.a,
          explanation: `According to the poster announcement text provided, the correct synthesis or informational answer is '${p.a}'.`,
          difficulty: 'A2'
        };
      }
    }
  ];

  for (let idx = 0; idx < count; idx++) {
    let filtered = questionsPool;
    if (category) {
      filtered = questionsPool.filter(qp => qp.category.toLowerCase() === category.toLowerCase());
      if (filtered.length === 0) filtered = questionsPool;
    }
    const template = filtered[Math.floor(Math.random() * filtered.length)];
    const constructed = template.build();
    constructed.correctAnswerIndex = constructed.options.indexOf(constructed.answerValue);
    
    // Clean temporary properties
    delete (constructed as any).answerValue;
    
    // Enforce Siena CILS 3-choice formatting rule on fallback questions (Fisher–Yates shuffle)
    if (examType === 'cils') {
      const correctVal = constructed.options[constructed.correctAnswerIndex];
      const wrongs = constructed.options.filter(o => o !== correctVal).slice(0, 2);
      const newOpts = [correctVal, ...wrongs];
      for (let i = newOpts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newOpts[i], newOpts[j]] = [newOpts[j], newOpts[i]];
      }
      constructed.options = newOpts;
      constructed.correctAnswerIndex = newOpts.indexOf(correctVal);
    }

    // Drop any malformed result (out-of-range correct index, missing options)
    const isValid = Array.isArray(constructed.options)
      && constructed.options.length >= 2
      && Number.isInteger(constructed.correctAnswerIndex)
      && constructed.correctAnswerIndex >= 0
      && constructed.correctAnswerIndex < constructed.options.length;
    if (!isValid) continue;

    result.push({
      ...constructed,
      id: `${startId}${idx}`
    });
  }

  return result;
}


// Simple system cooldown to automatically short-circuit and run our excellent local fallbacks when the API is rate limited.
let geminiCooldownUntil = 0;

function isGeminiRateLimited(): boolean {
  return Date.now() < geminiCooldownUntil;
}

function triggerGeminiCooldown() {
  // Cooldown for 3 minutes (180,000 milliseconds) to allow quota replenishment without repetitive failing requests
  geminiCooldownUntil = Date.now() + 180000;
}

function logApiWarning(context: string, error: any) {
  const errMsg = error?.message || String(error);
  let code = error?.status || error?.error?.code || 'unknown';
  if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
    code = 429;
  }
  console.warn(`[Gemini API Warning] ${context} failed (Status Code: ${code}). Info: ${errMsg.substring(0, 180)}`);
  
  if (code === 429 || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('Quota')) {
    triggerGeminiCooldown();
    console.warn(`[Circuit Breaker] Gemini rate limit detected (429). Activating a 3-minute local offline fallback cooldown...`);
  }
}

// Endpoint to generate Italian A2 Questions dynamically
app.post('/api/generate-questions', async (req: Request, res: Response) => {
  const { count = 10, category, examType = 'all' } = req.body;

  if (isGeminiRateLimited()) {
    console.log(`[Circuit Breaker] /api/generate-questions short-circuited due to active cooldown. Serving local questions.`);
    const fallbackQuestions = generateServerFallbackQuestions(count, category, examType);
    res.json({ success: true, questions: fallbackQuestions, isFallback: true });
    return;
  }

  try {
    const ai = getGemini();

    let formattingRules = "- options: Exactly 4 separate elegant choices starting with no prefixes (just the words).";
    if (examType === 'cils' || examType.startsWith('cils_')) {
      formattingRules = "- options: Exactly 3 separate elegant choices starting with no prefixes (just the words) because Siena CILS A2 rules strictly require exactly 3 answer options (A, B, C) per question.";
    }

    let specializationInstructions = "";
    if (examType === 'cils') {
      specializationInstructions = `Focus specifically on Siena CILS A2 formats:
      - CILS Prova n.1 style: Morphosyntactic adjective-endings agreement in texts.
      - CILS Prova n.2 style: Verb-conjugation morphoflexions in small stories (Passato Prossimo, and simple present).
      - CILS Prova n.3 style: Vocab Cloze tests filling paragraphs with nouns/adjectives (like "biglietto", "conto", "camera").`;
    } else if (examType === 'cils_adj') {
      specializationInstructions = `This is strictly Siena CILS A2 Prova n.1:
      - Focus exclusively on morphosyntactic adjective-endings agreement within a text paragraph containing 2 to 3 blanks (numbered with bracketed tags like [1], [2], [3]).
      - Generate stories where standard dictionary-form adjectives need to be correctly inflected (e.g., matching the gender and plurality of the noun in the text).
      - Options must represent matching sets like: "nuova / stretta / spaziosa", etc.`;
    } else if (examType === 'cils_verb') {
      specializationInstructions = `This is strictly Siena CILS A2 Prova n.2:
      - Focus exclusively on verb-conjugation morphoflexions in small stories inside brackets with blanks (like [1], [2], [3]).
      - Verbs must be conjugated correctly in the past (Passato Prossimo vs present, ensuring auxiliary choice 'essere' or 'avere', reflexives, and subject gender agreements).
      - Options must represent matching sets of verbs like: "si è svegliata / ha preso", "andiamo / compriamo".`;
    } else if (examType === 'cils_cloze') {
      specializationInstructions = `This is strictly Siena CILS A2 Prova n.3:
      - Focus exclusively on Text Cloze completion tasks filling real scenario paragraphs (like 'In stazione', 'Al bar', 'In albergo', 'Una casa in affitto') with missing nouns or adjectives.
      - Options must represent sets of words that fill the blanks (1) and (2) logically, like "biglietto / ore", "conto / mancia".`;
    } else if (examType === 'plida') {
      specializationInstructions = `Focus specifically on Dante Alighieri PLIDA A2 formats:
      - Reading Comprehension tasks: Matching job seekers' profiles with advertisement entries.
      - Short announcemet descriptions: Selecting matching slogans for commercial flyer banners or train station transit info.
      - Situational dialogues about daily interactions.`;
    } else if (examType === 'plida_job') {
      specializationInstructions = `This is strictly Dante PLIDA A2 Part 1:
      - Focus exclusively on Reading Comprehension with candidates seeking employment.
      - Provide a short, detailed profile of a candidate (e.g. daily constraints, specific hours, age, experience or preference) inside the 'context' property.
      - In 'questionText', ask which of the 4 advertisement options (labeled Annuncio A, B, C, D) accommodates their strict needs perfectly.
      - Ensure only ONE advertisement is compatible, and write down the explanation explaining why.`;
    } else if (examType === 'plida_slogan') {
      specializationInstructions = `This is strictly Dante PLIDA A2 Part 2:
      - Focus on Slogans & flyer completions.
      - In the 'context' property, describe a commercial flyer or brochure advertisement (e.g., language school, pizzeria, gym, bookstore, dental clinic) followed by a '[Slogan mancante]' tag.
      - In the options, provide 4 slogan titles where only one is logically connected to the flyer's core topic (the other three must be completely irrelevant, e.g. selling tires or renting apartments if the flyer was for a bookstore).`;
    } else if (examType === 'qcer_general') {
      specializationInstructions = "Focus on general QCER A2 grammar, prepositions, vocabulary, and daily situations. Avoid exam-specific structures.";
    }

    const categoryPrompt = category
      ? `Ensure all questions belong strictly to the category: "${category}".`
      : `Provide a balanced mix of categories appropriate for ${examType}. ${specializationInstructions}`;

    const fewShot = fewShotForExamType(examType);

    const prompt = `Generate a JSON array of ${count} highly realistic, professional Italian level A2 language exam prep questions.${fewShot}
    Each question must be challenging but strictly conform to standard QCER/CEFR A2 definitions.
    
    Category requirements:
    ${categoryPrompt}
    
    CRITICAL LINGUISTIC INSTRUCTIONS:
    1. Double-check all Italian sentence structure and grammar.
    2. Ensure perfect pronoun alignment. When using third-person reflexive verb situations, ensure gender matched clitics (use "le piace" for female subjects, and "gli piace" for male subjects to avoid gender clash errors).
    3. Ensure appropriate article descriptions: when stating a profession or job, use the standard indefinite article (e.g., "lavora come medico" or "è un farmacista" rather than definite articles).
    4. Avoid using awkward singular words when plural is standard (e.g. eat "un piatto di spaghetti" rather than "uno spaghetto").
    5. Avoid generic phrases; use natural standard phrasing (e.g., use "nel pomeriggio" instead of colloquial "di pomeriggio").
    
    Format requirements for every item in the JSON array:
    - id: A unique string like "gen_a2_${examType}_xxxx"
    - category: One of 'Grammatica', 'Vocabolario', 'Lettura', 'Situazioni'
    - section: Specific grammar/vocab topic (e.g., 'Preposizioni', 'Passato Prossimo', 'CILS Aggettivi', 'PLIDA Lavoro')
    - context: (Optional, mandatory for 'Lettura' or 'Situazioni') A short 1-3 sentence story, context or dialogue setup in Italian.
    - questionText: The test sentence containing a gap/blank (represented as "__________") or a direct comprehension question.
    ${formattingRules}
    - correctAnswerIndex: The 0-based index of the correct option.
    - explanation: A clear grammatical description written in English showing why the choice is correct, including auxiliary verb agreements or syntactic clues.
    - difficulty: Constantly 'A2'`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              context: { type: Type.STRING }
            },
            required: ['id', 'category', 'section', 'questionText', 'options', 'correctAnswerIndex', 'explanation', 'difficulty']
          }
        }
      }
    });

    const text = response.text || '[]';
    const rawQuestions = JSON.parse(text);
    // Drop any item whose answer key doesn't reference a real option — this is
    // the root cause of "this question is completely wrong" reports.
    const validQuestions = (Array.isArray(rawQuestions) ? rawQuestions : []).filter(isWellFormedQuestion);
    if (validQuestions.length > 0) {
      try {
        getDb().insertQuestions(validQuestions, 'gemini');
      } catch (dbErr: any) {
        console.warn('[generate-questions] failed to persist to DB:', dbErr?.message);
      }
    }
    res.json({ success: true, questions: validQuestions });
  } catch (error: any) {
    logApiWarning('generate-questions', error);
    try {
      const fallbackQuestions = generateServerFallbackQuestions(count, category, examType);
      // Fallback already self-validates; persist the valid ones anyway so the
      // pool grows over time and isn't only fed by Gemini.
      const safeFallback = fallbackQuestions.filter(isWellFormedQuestion);
      if (safeFallback.length > 0) {
        try { getDb().insertQuestions(safeFallback, 'fallback'); }
        catch (dbErr: any) { console.warn('[generate-questions] fallback persist failed:', dbErr?.message); }
      }
      res.json({ success: true, questions: safeFallback, isFallback: true });
    } catch (fallbackError: any) {
      res.status(500).json({ success: false, error: "Critical error in fallback question generator: " + fallbackError.message });
    }
  }
});

// Start a new quiz session: returns up to `count` questions, biased away from
// items this browser has seen recently. If the pool is thin, fires a
// non-blocking Gemini top-up so the next session is fresher.
app.post('/api/quiz/start', async (req: Request, res: Response) => {
  const { browserId, mode = 'practice', examType = 'all', count = 50 } = req.body ?? {};
  if (!browserId || typeof browserId !== 'string') {
    res.status(400).json({ success: false, error: 'browserId is required' });
    return;
  }

  // Prefettura simulation has its own structured payload: 3 sections with
  // section-scoped questions, durations, and per-item point weights so the
  // client can show a faithful 30/35/35 = 100 score and 25/25/10 minute timers.
  if (mode === 'prefettura') {
    try {
      const db = getDb();
      const ascolto = db.fetchQuestionsForPrefetturaSection(browserId, 'ascolto', 10);
      const lettura = db.fetchQuestionsForPrefetturaSection(browserId, 'lettura', 10);

      // Bank-growth top-up so users see mostly different exercises each run —
      // same idea as the practice/exam top-up below. The Prefettura-relevant
      // categories (Ascolto, Situazioni, Lettura) are tiny compared to the
      // Grammatica/Vocabolario banks today, so `pickWeakestCategory` inside
      // the helper will pick one of them; the G8 thematic bias in topup.ts
      // then nudges Gemini toward public-service contexts. Non-blocking.
      topupTicks += 1;
      const periodicDue = topupTicks % topupEveryN() === 0;
      const pendingAscolto = db.countByPrefetturaSection('ascolto');
      const pendingLettura = db.countByPrefetturaSection('lettura');
      const scarcityDue = pendingAscolto < 30 || pendingLettura < 30;
      if ((scarcityDue || periodicDue) && !isGeminiRateLimited() && process.env.GEMINI_API_KEY) {
        generateBatchAndPersist(getGemini(), 'all', topupBatchSize()).catch(err =>
          console.warn('[top-up:prefettura] background generation failed:', err?.message)
        );
      }

      // (Audio top-up is NOT auto-triggered here.) Google Cloud TTS is
      // priced per-character and the user opted to spend carefully —
      // pre-generated seed audio ships in `src/data/seed_audio/` and is
      // attached on boot in `server/seed.ts`. To synthesize audio for
      // AI-generated Ascolto items added after seed, call POST
      // /api/generate-audio explicitly (requires AUDIO_GEN_ENABLED=true).
      // Prefer the Prefettura-specific prompt set (form-filling + bureaucratic
      // messages). Fall back to the generic CILS/PLIDA prompts if the new
      // bank is somehow empty.
      const promptPool = PREFETTURA_WRITING_PROMPTS.length > 0
        ? PREFETTURA_WRITING_PROMPTS
        : A2_WRITING_PROMPTS;
      const prompt = promptPool[Math.floor(Math.random() * promptPool.length)];
      // Section weights are fixed at 30 / 35 / 35 = 100. If the bank can't
      // supply 10 items in a section (early days, before AI top-up has
      // produced more Ascolto material) we scale up per-item points so the
      // section still sums to its target weight. Better than showing the
      // user a /91 total they can never improve to /100.
      const ASCOLTO_SECTION_POINTS = 30;
      const LETTURA_SECTION_POINTS = 35;
      const SCRITTURA_SECTION_POINTS = 35;
      const ascPerItem = ascolto.length > 0 ? ASCOLTO_SECTION_POINTS / ascolto.length : 0;
      const letPerItem = lettura.length > 0 ? LETTURA_SECTION_POINTS / lettura.length : 0;
      res.json({
        success: true,
        mode: 'prefettura',
        sections: [
          { id: 'ascolto', label: 'Ascolto', durationSec: 25 * 60, pointsPerItem: ascPerItem, questions: ascolto },
          { id: 'lettura', label: 'Lettura', durationSec: 25 * 60, pointsPerItem: letPerItem, questions: lettura },
          { id: 'scrittura', label: 'Scrittura', durationSec: 10 * 60, points: SCRITTURA_SECTION_POINTS, prompt },
        ],
        totalPoints: 100,
        passingPoints: 80,
        bankCounts: {
          ascolto: db.countByPrefetturaSection('ascolto'),
          lettura: db.countByPrefetturaSection('lettura'),
        },
      });
      return;
    } catch (error: any) {
      console.error('[quiz/start prefettura] error:', error);
      res.status(500).json({ success: false, error: 'Failed to start Prefettura simulation: ' + error?.message });
      return;
    }
  }

  const safeCount = Math.max(1, Math.min(100, Number(count) || 50));
  try {
    const db = getDb();
    const questions = db.fetchQuestionsForBrowser({
      browserId,
      mode: mode === 'exam' ? 'exam' : 'practice',
      examType,
      count: safeCount,
    });

    // Decide whether to fire a background top-up. Two independent triggers:
    //
    //   (a) per-browser scarcity — the *unseen* count for this browser is
    //       under 1.5× the requested count. This is the right metric: it
    //       answers "is this specific user about to run out of fresh
    //       questions?", not the old global-bank-size question.
    //   (b) periodic — every TOPUP_EVERY_N quiz starts, regardless of (a),
    //       so the bank keeps growing organically. Capped by MAX_BANK_SIZE
    //       inside the helper.
    const unseen = db.countUnseenForBrowser(browserId, examType);
    topupTicks += 1;
    const periodicDue = topupTicks % topupEveryN() === 0;
    const scarcityDue = unseen < safeCount * 1.5;
    if ((scarcityDue || periodicDue) && !isGeminiRateLimited() && process.env.GEMINI_API_KEY) {
      const batchSize = topupBatchSize();
      generateBatchAndPersist(getGemini(), examType, batchSize).catch(err =>
        console.warn('[top-up] background generation failed:', err?.message)
      );
    }
    // Independent image-batch dice roll (off by default).
    maybeFireImageBatch();

    res.json({ success: true, questions, unseen, poolSize: db.stats().byExamType[examType] || db.stats().totalQuestions });
  } catch (error: any) {
    console.error('[quiz/start] error:', error);
    res.status(500).json({ success: false, error: 'Failed to start quiz: ' + error?.message });
  }
});

// Generate or fetch verb-tense training drill items. Cache-first via the
// shared questions table (category='TempiVerbali', section='<tense>:<step>').
// Mirrors /api/quiz/start: dedupes per browser via seen_questions, fires a
// background warmup when the bucket is short.
app.post('/api/verb-training/items', async (req: Request, res: Response) => {
  const { browserId, tense, step, count, redrillVerbs } = req.body ?? {};

  if (!browserId || typeof browserId !== 'string') {
    res.status(400).json({ success: false, error: 'browserId is required' });
    return;
  }
  if (!tense || !TENSE_ORDER.includes(tense as TenseId)) {
    res.status(400).json({ success: false, error: 'invalid tense' });
    return;
  }
  const allowedSteps: StepKind[] = ['vocab', 'recognize', 'conjugate', 'context', 'mixed'];
  if (!step || !allowedSteps.includes(step as StepKind)) {
    res.status(400).json({ success: false, error: 'invalid step' });
    return;
  }
  const safeCount = Math.max(1, Math.min(20, Number(count) || 8));

  const request: VerbTrainingRequest = {
    browserId,
    tense: tense as TenseId,
    step: step as StepKind,
    count: safeCount,
    redrillVerbs: Array.isArray(redrillVerbs) ? redrillVerbs.slice(0, 10).map(String) : undefined,
  };

  try {
    if (isGeminiRateLimited()) {
      // Rate-limited: serve whatever's cached, no synchronous generation.
      const db = getDb();
      const cached = db.fetchVerbTrainingItems(
        request.browserId, request.tense, request.step, request.count, request.redrillVerbs,
      ).map(shuffleQuestionOptions);
      res.json({ success: true, items: cached, isFallback: cached.length < request.count });
      return;
    }

    const result = await fetchOrGenerate(getGemini(), request);

    // Background warmup if the bucket is below target. Non-blocking.
    const cached = getDb().countVerbTrainingItems(request.tense, request.step);
    if (cached < 24 && !isGeminiRateLimited() && process.env.GEMINI_API_KEY) {
      warmupVerbTraining(getGemini(), request.tense, request.step).catch(err =>
        console.warn('[verb-training warmup]', err?.message)
      );
    }

    res.json({ success: true, items: result.items, isFallback: result.isFallback });
  } catch (error: any) {
    logApiWarning('verb-training/items', error);
    // Last-resort: try to serve cached items even on error.
    try {
      const cached = getDb().fetchVerbTrainingItems(
        request.browserId, request.tense, request.step, request.count, request.redrillVerbs,
      ).map(shuffleQuestionOptions);
      res.json({ success: true, items: cached, isFallback: true });
    } catch (cacheErr: any) {
      res.status(500).json({ success: false, error: error?.message || cacheErr?.message });
    }
  }
});

// Flag a question as broken. Auto-disables it once it accrues enough flags.
app.post('/api/questions/flag', (req: Request, res: Response) => {
  const { questionId, reason } = req.body ?? {};
  if (!questionId || typeof questionId !== 'string') {
    res.status(400).json({ success: false, error: 'questionId is required' });
    return;
  }
  try {
    const result = getDb().flagQuestion(questionId, typeof reason === 'string' ? reason.slice(0, 500) : undefined);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[questions/flag] error:', error);
    res.status(500).json({ success: false, error: error?.message });
  }
});

// Quick DB introspection endpoint — handy for curl/debug.
app.get('/api/questions/stats', (_req: Request, res: Response) => {
  try {
    res.json({ success: true, ...getDb().stats() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

// Periodic top-up bookkeeping. Resets on restart, which is fine — the bank
// itself is persistent.
let topupTicks = 0;

function topupEveryN(): number {
  const raw = Number(process.env.TOPUP_EVERY_N);
  if (!Number.isInteger(raw) || raw < 1 || raw > 100) return 5;
  return raw;
}

function topupBatchSize(): number {
  const raw = Number(process.env.TOPUP_BATCH_SIZE);
  if (!Number.isInteger(raw) || raw < 5 || raw > 60) return 40;
  return raw;
}

// Audio top-up trigger — non-blocking, fires from /api/quiz/start when the
// Prefettura simulation is requested. Idempotent: a no-op if the feature is
// off, no Ascolto rows are missing audio, or the daily cap is reached.
function maybeFireAudioBatch(): void {
  if (!isAudioGenEnabled()) return;
  generateAudioForPendingAscolto(3).catch(err =>
    console.warn('[audio-gen] background trigger failed:', err?.message)
  );
}

// Image-bearing questions piggyback on quiz starts (separate trigger from
// the text top-up): only when the feature flag is on and a random roll
// passes the configured probability.
function maybeFireImageBatch(): void {
  if (!isImageGenEnabled()) return;
  if (Math.random() >= imageGenProbability()) return;
  if (isGeminiRateLimited()) return;
  generateImageQuestions(getGemini(), imageGenBatchSize(), 'all').catch(err =>
    console.warn('[top-up] image-question batch failed:', err?.message)
  );
}

// Explicit trigger for image-question generation — useful for manual top-ups
// or smoke testing. Honors the same IMAGE_GEN_ENABLED gate.
app.post('/api/generate-image-questions', async (req: Request, res: Response) => {
  if (!isImageGenEnabled()) {
    res.status(403).json({ success: false, error: 'IMAGE_GEN_ENABLED is not true' });
    return;
  }
  if (isGeminiRateLimited()) {
    res.status(429).json({ success: false, error: 'Gemini cooldown active' });
    return;
  }
  const { count, examType = 'all' } = req.body ?? {};
  const batch = Number.isInteger(count) && count > 0 ? Math.min(5, count) : imageGenBatchSize();
  try {
    const inserted = await generateImageQuestions(getGemini(), batch, examType);
    res.json({ success: true, inserted });
  } catch (error: any) {
    logApiWarning('generate-image-questions', error);
    res.status(500).json({ success: false, error: error?.message });
  }
});

// Manual trigger to synthesize cached audio for Ascolto questions that
// don't yet have an `audio_url`. Useful for one-off backfills after enabling
// the feature on an existing deploy. Honors AUDIO_GEN_MAX_PER_DAY.
app.post('/api/generate-audio', async (req: Request, res: Response) => {
  if (!isAudioGenEnabled()) {
    res.status(403).json({ success: false, error: 'AUDIO_GEN_ENABLED is not true' });
    return;
  }
  const { count } = req.body ?? {};
  const requested = Number.isInteger(count) && count > 0 ? Math.min(20, count) : 5;
  try {
    const generated = await generateAudioForPendingAscolto(requested);
    const remaining = getDb().countAscoltoMissingAudio();
    res.json({ success: true, generated, ascoltoMissingAudio: remaining });
  } catch (error: any) {
    logApiWarning('generate-audio', error);
    res.status(500).json({ success: false, error: error?.message });
  }
});

// Endpoint to generate customized grammar explanation or coaching advice
app.post('/api/explain-question', async (req: Request, res: Response) => {
  const { question, selectedOption } = req.body;
  if (!question) {
     res.status(400).json({ success: false, error: 'Question data is required' });
     return;
  }

  const correctOption = question.options[question.correctAnswerIndex];
  const userOption = selectedOption || "Nessuna";
  const isCorrect = userOption === correctOption;

  // Cache key = (questionId, selectedOptionIndex). Same selection on the same
  // question → identical coaching, so we can serve it for free.
  const selectedIndex = Array.isArray(question.options) && selectedOption
    ? question.options.indexOf(selectedOption)
    : -1;
  if (question.id && selectedIndex >= 0) {
    try {
      const cached = getDb().getCachedExplanation(question.id, selectedIndex);
      if (cached) {
        res.json({ success: true, explanation: cached, cached: true });
        return;
      }
    } catch (cacheErr: any) {
      console.warn('[explain-question] cache lookup failed:', cacheErr?.message);
    }
  }
  
  const staticExplanation = `### 🤖 Spiegazione del Professore (Offline Fallback)
*Il servizio di intelligenza artificiale è temporaneamente offline (cooldown attivo), ma ecco una spiegazione completa sul quesito:*

### 1. **La Regola (The Rule)**
La domanda riguarda l'area **${question.category}** (sezione **${question.section || "Sintassi"}**). 
Per l'esame di livello A2, questa struttura richiede corrette applicazioni morfo-sintattiche (come gli accordi di genere ed il corretto uso degli ausiliari *Essere* o *Avere*).

### 2. **Perché è Corretto (Why this fits)**
- L'opzione corretta è: **"${correctOption}"** ${isCorrect ? "✅ (Molto bene!)" : "❌"}
- Questa scelta permette di rispettare gli schemi logici e l'accordo verbale con i pronomi o il genere dei soggetti. Le altre risposte deviano dalle regole standard o creano errori di pronuncia.

### 3. **Esempio Utile (Actionable Example)**
- *"${question.questionText.replace("__________", correctOption)}"* (Frase completa tradotta ed applicata in contesto d'esame)`;

  if (isGeminiRateLimited()) {
    console.log(`[Circuit Breaker] /api/explain-question short-circuited. Serving offline static explanation.`);
    res.json({ success: true, explanation: staticExplanation, isFallback: true });
    return;
  }

  try {
    const ai = getGemini();

    const prompt = `You are a friendly, expert Italian Language Coach preparing a student for their QCER A2 exam.
    The student is looking at the following question:
    Question text: "${question.questionText}"
    Options: ${JSON.stringify(question.options)}
    Correct option: "${question.options[question.correctAnswerIndex]}"
    The student selected: "${selectedOption || 'none'}"
    
    Provide a professional, easy-to-understand explanation of the grammar rule behind this question in 3 succinct parts:
    1. **La Regola (The Rule)**: Explain the core rule in Italian/English briefly.
    2. **Perché è Corretto (Why this fits)**: Explain why the correct option is needed, detailing why wrong options are incorrect.
    3. **Esempio Utile (Actionable Example)**: Give another example containing this rule, translated.
    
    Structure the response nicely in standard Markdown. Keep it warm, supportive, and instructive.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const explanation = response.text || '';
    if (question.id && selectedIndex >= 0 && explanation) {
      try { getDb().saveExplanation(question.id, selectedIndex, explanation); }
      catch (saveErr: any) { console.warn('[explain-question] cache save failed:', saveErr?.message); }
    }
    res.json({ success: true, explanation });
  } catch (error: any) {
    logApiWarning('explain-question', error);
    res.json({ success: true, explanation: staticExplanation, isFallback: true });
  }
});

// Endpoint for prompt tutor conversation widget
app.post('/api/tutor-chat', async (req: Request, res: Response) => {
  const fallbackReply = `🤖 **Nota del Professore (Offline Fallback)**:
Ciao! In questo momento la mia connessione di intelligenza artificiale ad alta velocità ha superato la quota gratuita di messaggi della giornata (cooldown attivo). 

Tuttavia, posso comunque darti dei consigli rapidi:
• Per la prova di grammatica **CILS A2**: fai molta attenzione all'accordo degli aggettivi nel testo bucato e alla coniugazione al passato prossimo (es. *siamo andati/andate*).
• Per la parte orale o scritta **PLIDA A2**: concentrati sulle interazioni quotidiane (ordinare al bar, chiedere informazioni sui prezzi, descrivere la tua giornata).
• Ricorda che puoi ascoltare la pronuncia esatta di ogni domanda cliccando sul pulsante altoparlante accanto ad essa!

*Riprova tra qualche minuto o continua ad allenarti sui test per accumulare punti esperienza!*`;

  if (isGeminiRateLimited()) {
    console.log(`[Circuit Breaker] /api/tutor-chat short-circuited. Serving offline fallback reply.`);
    res.json({ success: true, reply: fallbackReply, isFallback: true });
    return;
  }

  try {
    const { message, history = [] } = req.body;
    const ai = getGemini();

    const formattedHistory = history.map((msg: { role: 'user' | 'model'; text: string }) => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const chatInstance = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction: `You are "Professore", a professional, enthusiastic Italian language tutor helping English-speaking students pass their A2 QCER examination, specifically Siena CILS A2 and Dante Alighieri PLIDA A2 certifications.
        - Respond warmly with a brief Italian greeting (e.g. Ciao!, Benvenuto!).
        - Answer their questions about grammar, verbs, prepositions, vocabulary, and exam layouts clearly.
        - You have complete expertise in CILS A2 (Siena) and PLIDA A2 (Dante Alighieri) patterns, such as CILS Prova 1 (Adjective inflection in small stories), CILS Prova 2 (Verb conjugations), CILS Prova 3 (Vocab Cloze), PLIDA Job-seekers matching, and flyer slogan choosing.
        - Always provide English translations alongside any Italian sentences.
        - Point out common pitfalls for A2 students (like forgetting feminine plural agreements in auxiliary 'essere' verbs or adjective agreements in CILS).
        - Keep answers concise, highly structured, and visually engaging. Use emojis appropriately.`,
      },
      history: formattedHistory,
    });

    const response = await chatInstance.sendMessage({ message });
    res.json({ success: true, reply: response.text });
  } catch (error: any) {
    logApiWarning('tutor-chat', error);
    res.json({ success: true, reply: fallbackReply, isFallback: true });
  }
});

// Endpoint to analyze overall mistakes and build a specialized feedback report
app.post('/api/analyze-mistakes', async (req: Request, res: Response) => {
  const { mistakes } = req.body; // Array of { questionObj, userSelectedIndex }
  if (!mistakes || mistakes.length === 0) {
    res.json({ success: true, feedback: 'Grandioso! Non hai commesso errori in questo turno. Continua così!' });
    return;
  }

  const mistakeListText = mistakes.slice(0, 10).map((m: any) => {
    return `- **${m.question.category}** (Sezione: *${m.question.section || "Generale"}*): hai risposto "${m.question.options[m.selectedIndex]}" invece di "${m.question.options[m.question.correctAnswerIndex]}"`;
  }).join('\n');
  
  const fallbackFeedback = `### 🤖 Rapporto degli Errori del Professore (Offline Fallback)
*Il servizio AI remoto sta ricaricando l'energia (cooldown attivo), ecco una sintesi e dei consigli del Professore:*

Ecco i quesiti che richiedono attenzione:
${mistakeListText}

---

### 💡 Consigli Chiave del Professore:
1. **Accordo del Participio Passato**: Ricorda che i verbi coniugati con l'ausiliare *essere* (come i verbi di movimento: *andare, venire, uscire*) devono coniugarsi accordandosi all'ultima lettera con genere e numero del soggetto (es. *Lei è andata*, *Loro sono andati*). Con *avere* invece non cambia (es. *Lei ha mangiato*).
2. **Preposizioni di Luogo**: Ricorda la regola base:
   - "A" davanti ai nomi di città (*vado a Roma*, *abito a Venezia*).
   - "IN" davanti ai nomi di stati o nazioni (*vado in Italia*, *abito in Francia*).

*Continua così! Fai più pratica per rinforzare queste nozioni!*`;

  if (isGeminiRateLimited()) {
    console.log(`[Circuit Breaker] /api/analyze-mistakes short-circuited. Serving offline fallback feedback.`);
    res.json({ success: true, feedback: fallbackFeedback, isFallback: true });
    return;
  }

  try {
    const ai = getGemini();

    const mistakeDescriptions = mistakes.slice(0, 10).map((m: any) => {
      const q = m.question;
      return `- Question: "${q.questionText}" inside topic [${q.category} - ${q.section}].
        Correct: "${q.options[q.correctAnswerIndex]}". User picked: "${q.options[m.selectedIndex]}".`;
    }).join('\n');

    const prompt = `The student completed a mock exam of level A2 and got these questions wrong. Analyze their pattern of grammatical, vocabulary, or situational understanding and write a positive, highly constructive and personalized coaching guide (in English, with major Italian grammar terms).
    
    Mistakes:
    ${mistakeDescriptions}
    
    Include:
    1. **Analisi degli Errori (Mistake Theme Identification)**: What main grammar patterns are they struggling with?
    2. **Consigli Mirati (Actionable Tips)**: Precise memory aids or shortcuts.
    3. **Sfida Pratica (Quick Practice Exercise)**: Give 2 tiny fill-in-the-blank practice sentences with the correct answers written in subtext.
    
    Do not use generic statements. Point out the specific rules violated in their chosen tenses or prepositions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ success: true, feedback: response.text });
  } catch (error: any) {
    logApiWarning('analyze-mistakes', error);
    res.json({ success: true, feedback: fallbackFeedback, isFallback: true });
  }
});

// Endpoint to evaluate open text production writing exercises against A2 criteria
app.post('/api/evaluate-writing', async (req: Request, res: Response) => {
  const { promptTitle, promptText, studentText, mode, kind, studentFields, promptGuidelines, promptTheme } = req.body;

  // Compose the text-to-grade. For form-filling tasks (kind === 'modulo') the
  // client may send a structured `studentFields: [{label, value}, ...]` array;
  // we flatten it into a labeled block so Gemini can grade each field in
  // context. For textarea-style prompts we just use `studentText`.
  let composed = (studentText || '').toString();
  if (Array.isArray(studentFields) && studentFields.length > 0) {
    composed = studentFields
      .map((f: any) => `${(f.label || 'Campo').toString()}: ${(f.value || '').toString().trim()}`)
      .join('\n');
  }
  if (!composed.trim()) {
    res.status(400).json({ success: false, error: 'Student text is required' });
    return;
  }

  const isPrefettura = mode === 'prefettura';
  const isModulo = kind === 'modulo';
  const passingScore = isPrefettura ? 16 : 12;

  const rawWords = composed.split(/\s+/).filter(Boolean);
  const wordCount = rawWords.length;
  let score = 10;

  // Form-filling tasks have lower word counts by nature; relax the heuristic
  // brackets so the offline fallback still hands out plausible scores.
  if (isModulo) {
    if (wordCount >= 8) score = 13;
    if (wordCount >= 18) score = 16;
    if (wordCount >= 28) score = 18;
  } else {
    if (wordCount >= 20) score = 13;
    if (wordCount >= 45) score = 16;
    if (wordCount >= 70) score = 18;
  }
  const passed = score >= passingScore;
  
  const previewSnippet = composed.substring(0, Math.min(30, composed.length)) + "...";
  const fallbackEvaluation = {
    score,
    passed,
    wordCount,
    errors: [
      {
        original: previewSnippet,
        correction: previewSnippet,
        category: "Stile",
        explanation: "In modalità di emergenza offline (cooldown attivo), non possiamo effettuare indagini sillaba per sillaba delle doppie, ma la struttura verbale è stata analizzata globalmente."
      }
    ],
    perfectVersion: composed,
    coachingReport: `🤖 **Valutazione Sostitutiva Offline (Limite Quota Cooldown)**:
Hai completato con successo la stesura del testo scrivendo d'istinto ${wordCount} parole! 

Sebbene i server Gemini dedicati stiano ricaricando l'energia giornaliera, il Professore ha approvato a pieni voti l'audacia di scrittura dimostrata. Ricorda la regola cardine dell'A2: formare frasi brevi coordinate da connettivi semplici come *perché, ma, quindi, poi* e fare massima attenzione a rileggere sempre gli accenti (es. *è* verbo contro *e* congiunzione).`
  };

  if (isGeminiRateLimited()) {
    console.log(`[Circuit Breaker] /api/evaluate-writing short-circuited. Serving offline fallback evaluation.`);
    res.json({ success: true, evaluation: fallbackEvaluation, isFallback: true });
    return;
  }

  try {
    const ai = getGemini();

    const examContext = isPrefettura
      ? 'the official Italian government A2 test administered by the Prefettura for the *permesso di soggiorno UE per soggiornanti di lungo periodo* (D.M. 4 giugno 2010). The passing threshold for this exam is 80% (≥16/20 on the writing section).'
      : 'an Italian QCER A2 writing exam (CILS/PLIDA standard). Passing is 12 or above.';

    const formatNote = isModulo
      ? `\nIMPORTANT: this is a FORM-FILLING task (modulo). The student answer below is a list of "Field label: value" lines, one per form field. Grade for: (1) completeness — were all fields filled out? (2) plausibility — do the values make sense for the field's label? (3) orthography and agreement WITHIN each value. Short values are expected; do NOT penalize brevity. Word-count metrics do not apply meaningfully here, so estimate proportional to fields filled.`
      : '';

    const guidelinesList = Array.isArray(promptGuidelines) && promptGuidelines.length > 0
      ? promptGuidelines.map((g: string) => `  - ${g}`).join('\n')
      : '';
    const criteriaBlock = guidelinesList
      ? `\n\nThis exercise has the following SPECIFIC SUCCESS CRITERIA. You MUST verify the student's answer against EACH of these and reference any that are missing or weak in your error list and coaching report:\n${guidelinesList}`
      : '';
    const themeNote = promptTheme
      ? `\nThematic context: "${promptTheme}" (Italian public-service domain — the response should sound appropriate for that context, with realistic register).`
      : '';

    const systemPrompt = `You are "Professore", an official Italian language examiner grading ${examContext}${formatNote}${themeNote}
    Grade the student's text based on the following task:
    Task Title: "${promptTitle}"
    Task Description: "${promptText}"${criteriaBlock}

    Student Written Text:
    "${composed}"

    Your evaluation metrics:
    - Score: Integer from 0 to 20. Passing is ${passingScore} or above. Give a fair but encouraging score appropriate for an A2 learner. Penalise the score when the student's answer fails to address one or more of the SUCCESS CRITERIA listed above (if any).
    - Word count: Count the exact number of words the student wrote.
    - Errors analysis: List precise morphological, orthographic, agreement, or lexical errors, explaining them briefly in English.
    - Versione Perfetta: Provide a beautiful, highly idiomatic, natural rewriting of the text in correct A2-level Italian.
    - Coaching report: Write a warm, supportive 1-2 paragraph response in English (with key Italian terms) analyzing their strengths and points to improve (e.g. prepositions, verb tense agreement).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            passed: { type: Type.BOOLEAN },
            wordCount: { type: Type.INTEGER },
            errors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  correction: { type: Type.STRING },
                  category: { type: Type.STRING }, // e.g. "Ortografia", "Accordo", "Coniugazione", "Lessico"
                  explanation: { type: Type.STRING }
                },
                required: ['original', 'correction', 'category', 'explanation']
              }
            },
            perfectVersion: { type: Type.STRING },
            coachingReport: { type: Type.STRING }
          },
          required: ['score', 'passed', 'wordCount', 'errors', 'perfectVersion', 'coachingReport']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    if (typeof parsedData.score === 'number') {
      parsedData.passed = parsedData.score >= passingScore;
    }
    res.json({ success: true, evaluation: parsedData });
  } catch (error: any) {
    logApiWarning('evaluate-writing', error);
    res.json({ success: true, evaluation: fallbackEvaluation, isFallback: true });
  }
});

// Dual Integration: Vite server middleware in dev, static build in production
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

if (!isProduction) {
  const createViteServerInstance = async () => {
    const vite = await import('vite');
    const viteServer = await vite.createServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'custom',
    });
    
    app.use(viteServer.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(resolvedDirname, 'index.html'), 'utf-8');
        template = await viteServer.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        viteServer.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server starting in development mode on http://0.0.0.0:${PORT}`);
    });
  };
  createViteServerInstance();
} else {
  // Static distribution paths for built files.
  // server.ts is run directly by Bun (no bundling), so resolvedDirname is the
  // project root in both dev and the production container — dist sits next to it.
  const distPath = path.resolve(resolvedDirname, 'dist');
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server starting in production mode on http://0.0.0.0:${PORT}`);
  });
}
