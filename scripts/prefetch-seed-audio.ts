/**
 * One-shot CLI to pre-generate cached Italian audio for the Ascolto seed bank
 * and copy the resulting MP3s into `src/data/seed_audio/` so they ship with
 * the repo. Designed to keep TTS costs bounded: we generate **once**, on the
 * developer's machine, with a known list of questions — and commit the
 * output. No runtime TTS calls in default deploys.
 *
 * Usage:
 *   AUDIO_GEN_ENABLED=true GEMINI_API_KEY=… bun scripts/prefetch-seed-audio.ts
 *
 * Flow:
 *   1. Open the SQLite DB (seeded with curated Ascolto items).
 *   2. Find Ascolto questions whose `audio_url` is empty (or which aren't
 *      already in the manifest).
 *   3. Call the audio pipeline (`generateAudioForPendingAscolto`) — it
 *      writes MP3s into `./data/generated_audio/`.
 *   4. Copy the new MP3s into `./src/data/seed_audio/` and update
 *      `src/data/seed_audio/manifest.json` with `{ questionId: filename }`.
 *   5. Print a "next steps" hint so the dev can `git add` and commit.
 *
 * Re-runnable: the manifest is merged, not overwritten. Re-running after
 * adding more curated Ascolto items synthesises only the missing ones.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Same path resolution the runtime uses.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

// Pull in side-effects: opening DB, seeding, then run the audio pipeline.
async function main() {
  if (!process.env.AUDIO_GEN_ENABLED) process.env.AUDIO_GEN_ENABLED = 'true';
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_TTS_API_KEY) {
    console.error('error: set GEMINI_API_KEY (or GOOGLE_TTS_API_KEY) before running this script.');
    process.exit(1);
  }

  // Lazy import so getDb() / paths resolve relative to repoRoot
  const { getDb } = await import('../server/db');
  const { seedFromCurated } = await import('../server/seed');
  const { generateAudioForPendingAscolto, getAudioDir } = await import('../server/audio');

  // Make sure the DB is seeded before we pick Ascolto items.
  seedFromCurated();
  const db = getDb();

  const targetDir = path.join(repoRoot, 'src/data/seed_audio');
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  const manifestPath = path.join(targetDir, 'manifest.json');

  // Read existing manifest so re-runs only add NEW entries.
  let manifest: Record<string, string> = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (err: any) {
      console.warn('warn: existing manifest is unreadable, starting fresh:', err?.message);
      manifest = {};
    }
  }

  const before = db.countAscoltoMissingAudio();
  console.log(`Ascolto items missing audio (before): ${before}`);
  if (before === 0) {
    console.log('Nothing to synthesize. Done.');
    return;
  }

  // Synthesize in batches until done — generateAudioForPendingAscolto honors
  // AUDIO_GEN_BATCH_SIZE per call, and we want everything in one script run.
  let totalGenerated = 0;
  while (db.countAscoltoMissingAudio() > 0) {
    const n = await generateAudioForPendingAscolto(50);
    if (n === 0) {
      console.log('Pipeline returned 0 — stopping (probably hit daily cap or API error).');
      break;
    }
    totalGenerated += n;
  }
  console.log(`Generated ${totalGenerated} audio files.`);

  // Copy newly-generated files from data/generated_audio/ into src/data/seed_audio/
  // and update the manifest with questionId → filename.
  const generatedDir = getAudioDir();
  const updatedAscoltoRows = db.db.prepare(
    `SELECT id, audio_url FROM questions WHERE prefettura_section = 'ascolto' AND audio_url IS NOT NULL AND audio_url != ''`
  ).all() as { id: string; audio_url: string }[];

  let copied = 0;
  for (const row of updatedAscoltoRows) {
    // audio_url is like '/generated-audio/audio_<hash>.mp3'
    const filename = row.audio_url.split('/').pop();
    if (!filename) continue;
    const src = path.join(generatedDir, filename);
    const dst = path.join(targetDir, filename);
    if (!fs.existsSync(src)) {
      // Was already attached on a previous run; nothing to copy.
      continue;
    }
    if (!fs.existsSync(dst)) {
      fs.copyFileSync(src, dst);
      copied += 1;
    }
    manifest[row.id] = filename;
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Copied ${copied} new file(s) into src/data/seed_audio/.`);
  console.log(`Manifest now has ${Object.keys(manifest).length} entries — ${manifestPath}`);
  console.log('');
  console.log('Next steps:');
  console.log('  git add src/data/seed_audio/');
  console.log('  git commit -m "Ship pre-generated Ascolto audio"');
}

main().catch(err => {
  console.error('prefetch-seed-audio failed:', err);
  process.exit(1);
});
