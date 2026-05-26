/**
 * Cached Italian audio generator for Ascolto questions.
 *
 * For the Simulazione Prefettura, the Ascolto section should sound like the
 * real exam — pre-recorded native-quality audio, not browser TTS. We mirror
 * the image-generation pipeline (`server/images.ts`):
 *
 *   - opt-in via AUDIO_GEN_ENABLED=true (default off)
 *   - daily spend cap via AUDIO_GEN_MAX_PER_DAY (default 50 syntheses/day)
 *   - one MP3 per question, content-hashed filename so future voice upgrades
 *     bust the immutable static cache cleanly
 *   - PERSISTENT files at `<DB_PATH parent>/generated_audio/<hash>.mp3`,
 *     served by Express static middleware in server.ts
 *
 * Provider: Google Cloud Text-to-Speech (Neural2 it-IT). Called via raw
 * `fetch` so we don't add an SDK dep — works natively in Bun on Alpine
 * multi-arch, no native bindings, no ffmpeg.
 *
 * Auth: GOOGLE_TTS_API_KEY (preferred) or GEMINI_API_KEY (fallback) — same
 * Google Cloud project key, just needs the Text-to-Speech API enabled in
 * https://console.cloud.google.com/apis/library/texttospeech.googleapis.com
 *
 * Unlike images.ts this pipeline UPDATES existing Ascolto rows in place
 * (sets `audio_url`) rather than inserting new questions.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getDb } from './db';

/** Audio directory sits alongside the SQLite file, like generated_images/. */
export function getAudioDir(): string {
  const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'data/app.db');
  return path.join(path.dirname(dbPath), 'generated_audio');
}

/** Master feature flag — defaults to off so deploys can't surprise-spend. */
export function isAudioGenEnabled(): boolean {
  return (process.env.AUDIO_GEN_ENABLED || '').toLowerCase() === 'true';
}

/** Per-trigger batch size. Each item is one TTS API call (~$0.001 / call on Neural2). */
export function audioGenBatchSize(): number {
  const raw = Number(process.env.AUDIO_GEN_BATCH_SIZE);
  if (!Number.isInteger(raw) || raw < 1 || raw > 20) return 3;
  return raw;
}

/** Hard daily cap to bound the worst case if a trigger storms. */
export function audioGenMaxPerDay(): number {
  const raw = Number(process.env.AUDIO_GEN_MAX_PER_DAY);
  if (!Number.isInteger(raw) || raw < 1) return 50;
  return raw;
}

/** Italian voice to use. Google publishes several Neural2 / Chirp voices for it-IT. */
function ttsVoiceName(): string {
  return process.env.AUDIO_GEN_VOICE || 'it-IT-Neural2-A';
}

/** Audio encoding for the cached file. MP3 has universal browser support. */
function ttsAudioEncoding(): 'MP3' | 'OGG_OPUS' {
  const enc = (process.env.AUDIO_GEN_ENCODING || 'MP3').toUpperCase();
  return enc === 'OGG_OPUS' ? 'OGG_OPUS' : 'MP3';
}

/** Returns the file extension for the configured audio encoding. */
function audioFileExt(): string {
  return ttsAudioEncoding() === 'OGG_OPUS' ? 'ogg' : 'mp3';
}

/**
 * Resolve the auth key. Prefer a dedicated TTS key over the Gemini key —
 * AI-Studio-issued Gemini keys are typically scoped to the Gemini API only
 * and will 403 against Cloud Text-to-Speech. Both `GOOGLE_TTS_API_KEY` and
 * `GOOGLE_TTS_KEY` are accepted (the latter is shorter and easier to type).
 */
function ttsApiKey(): string | null {
  return process.env.GOOGLE_TTS_API_KEY
    || process.env.GOOGLE_TTS_KEY
    || process.env.GEMINI_API_KEY
    || null;
}

// In-memory daily counter. Resets when the day (UTC) rolls over. Container
// restarts also reset it, which is fine — the daily cap is a safety net for
// the bursty case, not a hard accounting figure.
let counterDay: string = '';
let counterValue: number = 0;
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
function bumpDailyCounter(): number {
  const today = todayKey();
  if (today !== counterDay) {
    counterDay = today;
    counterValue = 0;
  }
  counterValue += 1;
  return counterValue;
}
function dailyCounterValue(): number {
  if (todayKey() !== counterDay) return 0;
  return counterValue;
}

/**
 * Same sanitization as the in-app TTS, so the audio matches what the user
 * would have heard if they tapped the speaker icon — without the CILS slot
 * markers, blank-underscores, or markdown that the LLM sometimes leaves in.
 */
function sanitizeForTts(text: string): string {
  return text
    .replace(/\[\d+\]/g, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/_+/g, ' ... ')
    .replace(/[*#`]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** SHA-256 prefix of the sanitized text + voice + encoding — gives us cache-busting on voice upgrades. */
function audioFilenameFor(text: string): string {
  const key = `${ttsVoiceName()}::${ttsAudioEncoding()}::${sanitizeForTts(text)}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex').slice(0, 24);
  return `audio_${hash}.${audioFileExt()}`;
}

/**
 * Synthesize one snippet of Italian text into a Buffer (MP3 by default).
 * Returns null on any failure (caller decides whether to retry).
 */
async function synthesizeItalian(text: string): Promise<Buffer | null> {
  const apiKey = ttsApiKey();
  if (!apiKey) {
    console.warn('[audio-gen] no API key (set GOOGLE_TTS_API_KEY or GEMINI_API_KEY)');
    return null;
  }
  const cleaned = sanitizeForTts(text);
  if (!cleaned) return null;

  const body = {
    input: { text: cleaned },
    voice: { languageCode: 'it-IT', name: ttsVoiceName() },
    audioConfig: { audioEncoding: ttsAudioEncoding(), speakingRate: 0.95 },
  };

  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) {
      const errBody = await res.text();
      // Print the full Google error body so the operator can see exactly what
      // needs unblocking (API not enabled vs key restrictions vs quota).
      console.warn(`[audio-gen] TTS HTTP ${res.status}: ${errBody}`);
      return null;
    }
    const data = (await res.json()) as { audioContent?: string };
    if (!data.audioContent) return null;
    return Buffer.from(data.audioContent, 'base64');
  } catch (err: any) {
    console.warn('[audio-gen] TTS request failed:', err?.message);
    return null;
  }
}

/**
 * Top up the Ascolto audio bank: pick `count` Ascolto questions that don't
 * yet have an `audio_url`, synthesize each, persist the file, and update the
 * row. Returns the number of audio files actually generated.
 *
 * Caller-side gating: check `isAudioGenEnabled()` first.
 */
export async function generateAudioForPendingAscolto(count: number): Promise<number> {
  if (!isAudioGenEnabled()) {
    console.log('[audio-gen] disabled via env (AUDIO_GEN_ENABLED!=true) — skipping');
    return 0;
  }
  if (!ttsApiKey()) {
    console.warn('[audio-gen] no API key — skipping (set GOOGLE_TTS_API_KEY or GEMINI_API_KEY)');
    return 0;
  }
  const safeCount = Math.max(1, Math.min(audioGenBatchSize(), count));
  const db = getDb();
  const pending = db.findAscoltoMissingAudio(safeCount);
  if (pending.length === 0) {
    console.log('[audio-gen] no Ascolto items missing audio — skipping');
    return 0;
  }

  const dir = getAudioDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const maxPerDay = audioGenMaxPerDay();
  let generated = 0;
  for (const q of pending) {
    if (dailyCounterValue() >= maxPerDay) {
      console.log(`[audio-gen] daily cap (${maxPerDay}) reached — stopping`);
      break;
    }
    // Prefer `context` (the listening passage) if present; otherwise the
    // question text itself — same fallback the in-app TTS uses.
    const sourceText = (q.context && q.context.trim().length > 0) ? q.context : q.questionText;
    const fileName = audioFilenameFor(sourceText);
    const absPath = path.join(dir, fileName);

    // If a hashing collision means we already have this file (e.g. another
    // question shares the exact same audible text), skip synthesis and
    // reuse the existing file.
    let bytes: Buffer | null = null;
    if (fs.existsSync(absPath)) {
      console.log(`[audio-gen] cache hit for ${q.id} → ${fileName}`);
    } else {
      bytes = await synthesizeItalian(sourceText);
      bumpDailyCounter();
      if (!bytes) continue;
      try {
        fs.writeFileSync(absPath, bytes);
      } catch (err: any) {
        console.warn('[audio-gen] write failed:', err?.message);
        continue;
      }
    }
    db.setQuestionAudioUrl(q.id, `/generated-audio/${fileName}`);
    generated += 1;
  }
  console.log(`[audio-gen] attached audio to ${generated}/${pending.length} Ascolto items (daily counter: ${dailyCounterValue()}/${maxPerDay})`);
  return generated;
}
