/**
 * Image-bearing question generator.
 *
 * Gemini's text and image models live in different price tiers — text is
 * cheap, images are expensive. So we treat image questions as a rare extra:
 *   - opt-in via IMAGE_GEN_ENABLED=true (default off)
 *   - default IMAGE_GEN_BATCH_SIZE=2, IMAGE_GEN_PROBABILITY=0.1
 *   - triggered probabilistically from `backgroundTopUp` in server.ts
 *
 * Each call:
 *   1. Asks Gemini text for `count` short vocabulary-style questions, each
 *      with a structured `image_prompt` field describing what to draw.
 *   2. For each, calls Gemini image-gen, saves the PNG to
 *      `<DB_PATH parent>/generated_images/<uuid>.png`.
 *   3. Sets `imageUrl: '/generated-images/<uuid>.png'` on the question and
 *      persists it to the DB with source='gemini'.
 *
 * The image directory is exposed via Express static middleware in server.ts.
 */

import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { getDb } from './db';
import { isWellFormedQuestion } from './validate';
import type { Question } from '../src/types';

/** Resolve the images directory from DB_PATH so it sits alongside the SQLite file. */
export function getImagesDir(): string {
  const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'data/app.db');
  return path.join(path.dirname(dbPath), 'generated_images');
}

/** Image-gen feature flag — defaults to off so deploys don't surprise-spend credits. */
export function isImageGenEnabled(): boolean {
  return (process.env.IMAGE_GEN_ENABLED || '').toLowerCase() === 'true';
}

/** Per-top-up trigger probability. 0.10 = ~1-in-10 background top-ups also runs an image batch. */
export function imageGenProbability(): number {
  const raw = Number(process.env.IMAGE_GEN_PROBABILITY);
  if (!Number.isFinite(raw) || raw < 0 || raw > 1) return 0.1;
  return raw;
}

/** How many image-bearing questions to make per batch. Keep tiny — each image is a paid call. */
export function imageGenBatchSize(): number {
  const raw = Number(process.env.IMAGE_GEN_BATCH_SIZE);
  if (!Number.isInteger(raw) || raw < 1 || raw > 10) return 2;
  return raw;
}

const TEXT_MODEL = 'gemini-3.5-flash';
const IMAGE_MODEL = process.env.IMAGE_GEN_MODEL || 'imagen-3.0-fast-generate-001';

interface ImageQuestionDraft {
  category: string;
  section: string;
  context?: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  imagePrompt: string;
}

/** Ask Gemini text for a small batch of image-bearing question drafts. */
async function draftImageQuestions(ai: GoogleGenAI, count: number, examType: string): Promise<ImageQuestionDraft[]> {
  const prompt = `Generate a JSON array of ${count} Italian A2 multiple-choice questions where the question refers to an image the student will see.

Each question must:
- Be appropriate for QCER A2 level (everyday objects, common situations, simple scenes).
- Ask either "Cosa vedi nell'immagine?", "Che cosa sta facendo questa persona?", "Dove si trova questa scena?", or similar.
- Have 4 plausible options where exactly one matches the imagined image.
- Include an "imagePrompt" field — an English description of a simple, clean illustration in a neutral style (no text, no logos, no copyrighted characters). Example: "A simple illustration of a person riding a bicycle in a park, daytime, flat color style, no text".

Format per item:
- category: one of 'Vocabolario', 'Situazioni', 'Immagini'
- section: a topic like 'Oggetti quotidiani', 'Azioni', 'Luoghi'
- questionText: the Italian question
- options: array of 4 short Italian strings
- correctAnswerIndex: integer 0-3
- explanation: brief grammar/vocabulary note in Italian
- imagePrompt: English illustration prompt

This is for examType="${examType}". Avoid stereotypes; favor everyday scenes.`;

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
            category: { type: Type.STRING },
            section: { type: Type.STRING },
            questionText: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswerIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
          },
          required: ['category', 'section', 'questionText', 'options', 'correctAnswerIndex', 'explanation', 'imagePrompt'],
        },
      },
    },
  });
  const text = response.text || '[]';
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : [];
}

/** Call Gemini image-gen for one prompt, returning the PNG bytes (or null on failure). */
async function generateOneImage(ai: GoogleGenAI, imagePrompt: string): Promise<Buffer | null> {
  try {
    const result = await ai.models.generateImages({
      model: IMAGE_MODEL,
      prompt: imagePrompt,
      config: { numberOfImages: 1, aspectRatio: '1:1' as any },
    });
    const generated = (result as any)?.generatedImages?.[0];
    const bytes = generated?.image?.imageBytes;
    if (!bytes) return null;
    return Buffer.from(bytes, 'base64');
  } catch (err: any) {
    console.warn('[image-gen] generateImages failed:', err?.message);
    return null;
  }
}

/**
 * Generate `count` image-bearing questions, persist their images to disk and
 * their records to the DB. Returns the inserted-count.
 *
 * Caller decides whether to block on this — typically fire-and-forget.
 */
export async function generateImageQuestions(ai: GoogleGenAI, count: number, examType: string): Promise<number> {
  if (!isImageGenEnabled()) {
    console.log('[image-gen] disabled via env (IMAGE_GEN_ENABLED!=true) — skipping');
    return 0;
  }
  const safeCount = Math.max(1, Math.min(5, count));
  console.log(`[image-gen] requesting ${safeCount} image questions for examType=${examType}`);
  let drafts: ImageQuestionDraft[];
  try {
    drafts = await draftImageQuestions(ai, safeCount, examType);
  } catch (err: any) {
    console.warn('[image-gen] draft step failed:', err?.message);
    return 0;
  }
  if (drafts.length === 0) return 0;

  const dir = getImagesDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const finalQuestions: Question[] = [];
  for (const draft of drafts) {
    const png = await generateOneImage(ai, draft.imagePrompt);
    if (!png) continue;
    const fileName = `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
    const absPath = path.join(dir, fileName);
    try {
      fs.writeFileSync(absPath, png);
    } catch (err: any) {
      console.warn('[image-gen] write failed:', err?.message);
      continue;
    }
    const q: Question = {
      id: `gen_img_${examType}_${fileName.replace('.png', '')}`,
      category: draft.category as any,
      section: draft.section,
      context: draft.context,
      questionText: draft.questionText,
      options: draft.options,
      correctAnswerIndex: draft.correctAnswerIndex,
      explanation: draft.explanation,
      difficulty: 'A2',
      imageUrl: `/generated-images/${fileName}`,
    };
    if (isWellFormedQuestion(q)) finalQuestions.push(q);
  }
  if (finalQuestions.length === 0) return 0;
  const inserted = getDb().insertQuestions(finalQuestions, 'gemini');
  console.log(`[image-gen] inserted ${inserted} image-bearing questions (of ${finalQuestions.length} generated)`);
  return inserted;
}
