# a2-prep — Italian A2 Exam Prep

Italian QCER A2 exam prep app: customizable 50-question quizzes (CILS, PLIDA,
QCER variants), AI explanations, vocab/flashcard tooling, dynamic question
generation. React 19 + Vite frontend, Express + Bun backend, SQLite for
persistence, Gemini for AI.

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

To update when a new image is published:

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
