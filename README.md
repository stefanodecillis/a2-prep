# a2-prep — Italian A2 Exam Prep

Prep app for the Italian government **A2 language test** that foreigners take at
the Prefettura to obtain the *permesso di soggiorno UE per soggiornanti di lungo
periodo* (long-stay EU residence permit, D.M. 4 giugno 2010). Three modes from
one home screen:

1. **Allenamento con Assistenza** — free practice with the Tutor AI, vocab
   flashcards, pronunciation simulator, and instant grammar explanations.
2. **Simulazione Esame Generica** — 50-question timed mock test in the
   CILS/PLIDA style, with end-of-session error analysis (60% passing).
3. **Simulazione Prefettura** — calibrated to the real Prefettura test: three
   sections (Ascolto 30 pt · Lettura 35 pt · Scrittura 35 pt), 60 minutes total,
   **80/100 passing threshold**, no oral section, no standalone grammar.

React 19 + Vite frontend, Express + Bun backend, SQLite for persistence, Gemini
for AI question generation, explanations, and writing evaluation.

## Run locally

**Prerequisites:** [Bun](https://bun.sh) ≥ 1.3.

1. `cp .env.example .env` and set `GEMINI_API_KEY`.
2. `bun install`
3. `bun run dev` — opens on http://localhost:3000

On first boot the static question bank is seeded into `./data/app.db`. The DB
accumulates AI-generated questions over time so sessions stay fresh.

## Tests

```
bun test
```

## Architecture

- `src/App.tsx` — React app (single-file).
- `src/data/questions.ts` — static curated question bank; canonical source of
  truth in git. The server seeds it into SQLite on first boot.
- `server.ts` — Express app: routes for quiz start, flag, stats, explain,
  tutor chat, mistakes, writing.
- `server/db.ts` — `bun:sqlite` persistence layer.
- `server/seed.ts` — idempotent seeder from the static bank.
- `server/validate.ts` — answer-key sanity check for AI / fallback output.

### Endpoints (selected)

| Method | Path                       | Purpose                                                |
| ------ | -------------------------- | ------------------------------------------------------ |
| POST   | `/api/quiz/start`          | Per-browser deck; excludes recently-seen IDs           |
| POST   | `/api/questions/flag`      | Report a broken question; auto-disables at 3 flags     |
| GET    | `/api/questions/stats`     | Counts by source/exam_type, flags, cached explanations |
| POST   | `/api/explain-question`    | Cached AI grammar coaching                             |
| POST   | `/api/generate-questions`  | Ad-hoc AI batch; persists valid items to DB            |
| POST   | `/api/tutor-chat`          | Multi-turn tutor                                       |
| POST   | `/api/analyze-mistakes`    | End-of-session feedback                                |
| POST   | `/api/evaluate-writing`    | Grades writing prompts                                 |

### Database

SQLite via `bun:sqlite`, file at `$DB_PATH` (default `./data/app.db`,
`/data/app.db` in Docker). Tables: `questions`, `explanations`,
`seen_questions`, `question_flags`. See `server/db.ts` for the schema.

## Docker / VM deployment

The container image is published by CI to GitHub Container Registry on every
push to `main`: `ghcr.io/stefanodecillis/a2-prep:latest` (multi-arch, amd64 +
arm64).

On the VM, no source needed — just `docker-compose.yml` and a `.env`:

```sh
# 1. Drop docker-compose.yml on the VM
curl -O https://raw.githubusercontent.com/stefanodecillis/a2-prep/main/docker-compose.yml

# 2. Create the env file
cat > .env <<'EOF'
GEMINI_API_KEY=sk-...
# Optional — opt in to occasional image-bearing questions (costs $$ per call):
# IMAGE_GEN_ENABLED=true
EOF

# 3. Boot it
docker compose pull
docker compose up -d
```

Then http://&lt;vm-ip&gt;:3000. The SQLite DB and AI-generated images live in
`./data/` on the host, so they survive `docker compose down && up` and image
upgrades.

Updates happen automatically: the Watchtower sidecar polls GHCR every 5
minutes (override via `WATCHTOWER_POLL_INTERVAL` in `.env`) and swaps the
a2-prep container in when a new image lands on `:latest`. Manual upgrades
still work too:

```sh
docker compose pull && docker compose up -d
```

To build locally instead of pulling (uncomment the `build:` block in
`docker-compose.yml`):

```sh
git clone https://github.com/stefanodecillis/a2-prep && cd a2-prep
docker compose up -d --build
```

To inspect the DB on the host:

```sh
sqlite3 ./data/app.db 'select count(*), source from questions group by source'
```

No auth, no CSRF, no TLS termination in the app itself — reverse proxy /
subdomain / TLS are out of scope.

### Environment reference

| Var | Required | Default | Purpose |
|---|---|---|---|
| `GEMINI_API_KEY` | yes | — | Google AI Studio key |
| `PORT` | no | 3000 | HTTP listen port |
| `DB_PATH` | no | `/data/app.db` | SQLite file location |
| `IMAGE_GEN_ENABLED` | no | `false` | Allow occasional AI image questions |
| `IMAGE_GEN_PROBABILITY` | no | `0.1` | Per-top-up trigger probability (0..1) |
| `IMAGE_GEN_BATCH_SIZE` | no | `2` | Images per batch (each costs a paid call) |
| `IMAGE_GEN_MODEL` | no | `imagen-3.0-fast-generate-001` | Image model override |
| `AUDIO_GEN_ENABLED` | no | `false` | Cache native-quality MP3s for Ascolto via Google Cloud TTS |
| `GOOGLE_TTS_API_KEY` / `GOOGLE_TTS_KEY` | no | reuses `GEMINI_API_KEY` | Dedicated key for Cloud Text-to-Speech. Either name is accepted. Use this when your `GEMINI_API_KEY` is an AI Studio key (those don't have TTS access — needs a Cloud Console key). |
| `AUDIO_GEN_BATCH_SIZE` | no | `3` | Ascolto items synthesized per quiz-start trigger |
| `AUDIO_GEN_MAX_PER_DAY` | no | `50` | Hard daily cap on TTS calls (per container, resets at UTC midnight) |
| `AUDIO_GEN_VOICE` | no | `it-IT-Neural2-A` | Google TTS voice name (any `it-IT-*` voice works) |
| `AUDIO_GEN_ENCODING` | no | `MP3` | `MP3` or `OGG_OPUS` |

### Cost-careful audio strategy

Google Cloud TTS is priced per character (~$16/M chars on Neural2). The default deploy makes **zero TTS API calls at runtime** — instead:

1. **Pre-generated seed audio.** A one-shot CLI script synthesises audio for the curated Ascolto bank on your dev machine, then commits the MP3s into the repo at `src/data/seed_audio/` (~120 KB per item). At boot, `server/seed.ts` reads `src/data/seed_audio/manifest.json` and attaches the matching `audio_url` to each question. No env vars required at runtime — the MP3s are served by Express at `/seed-audio/<file>.mp3`.

2. **Opt-in runtime synthesis** for AI-generated Ascolto items (added later by the periodic top-up). Off by default. To enable, set `AUDIO_GEN_ENABLED=true` and POST `/api/generate-audio` explicitly when you want to grow the audio bank. The runtime never auto-fires — there's no per-quiz-start trigger.

### Regenerating seed audio

```sh
# 1. Enable the Cloud Text-to-Speech API on your Google Cloud project:
#    https://console.cloud.google.com/apis/library/texttospeech.googleapis.com
# 2. Make sure your GEMINI_API_KEY (or a dedicated GOOGLE_TTS_API_KEY) has
#    no API restrictions or has the TTS API allowed in Credentials.
AUDIO_GEN_ENABLED=true bun scripts/prefetch-seed-audio.ts

# 3. Commit the resulting files:
git add src/data/seed_audio/
git commit -m "Ship pre-generated Ascolto audio"
```

The script is idempotent: re-running synthesises audio only for Ascolto items not yet in the manifest, so new curated additions or AI top-ups can be incrementally backed by audio without re-burning the TTS budget for existing items.
