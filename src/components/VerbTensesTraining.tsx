/**
 * VerbTensesTraining — guided drill through the six A2 Italian verb tenses.
 *
 * Flow per tense:
 *   1. Rules (static)            — read the formation rules + examples
 *   2. Vocab teaching cards      — flip through VocabCards (no scoring)
 *   3. Vocab matching drill      — step 2, 6 items
 *   4. Recognize infinitive      — step 3, 8 items
 *   5. Conjugate                 — step 4, 10 items
 *   6. Use in context            — step 5, 8 items
 *   7. Mixed mini-quiz           — step 6, 10 items
 *   → tense-report → unlock next tense
 *
 * After all six tenses: grand-report with worst tense + missed verbs.
 *
 * Score gate: every drill needs ≥70% to advance. Below that we re-fetch
 * fresh items biased to the missed verbs (`redrillVerbs`) — up to 3 attempts,
 * after which the user can opt to push through anyway.
 *
 * Persistence: progress is mirrored to localStorage (debounced 200ms) so a
 * tab close or reload keeps the user on the same (tense, step). Mid-drill
 * item state is intentionally NOT restored — on resume we re-fetch a fresh
 * batch for that (tense, step), so the user keeps position but not partials.
 * (A full mid-drill restore would need a /verb-training/items?ids=… endpoint
 * which we don't have. Acceptable trade-off for now.)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen, BrainCircuit, Sparkles, CheckCircle, XCircle,
  ArrowRight, ArrowLeft, RotateCcw, Award, Lightbulb, Lock,
  Unlock, Trophy, ChevronRight, X, AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { TenseId, StepKind, VocabCard } from '../data/verbTenses';
import { TENSE_ORDER, TENSES } from '../data/verbTenses';
import type { Question } from '../types';
import { getBrowserId } from '../lib/browserId';

// ============================================================================
// Types
// ============================================================================

type StepNum = 2 | 3 | 4 | 5 | 6;

type Phase =
  | { kind: 'overview' }
  | { kind: 'rules'; tense: TenseId }
  | { kind: 'vocab-intro'; tense: TenseId; cardIdx: number }
  | { kind: 'loading'; tense: TenseId; step: StepNum }
  | {
      kind: 'drill';
      tense: TenseId;
      step: StepNum;
      items: Question[];
      idx: number;
      answers: Record<number, number>;
      revealed: Record<number, boolean>;
      redrillAttempt: number;
    }
  | { kind: 'tense-report'; tense: TenseId; result: TenseResult }
  | { kind: 'grand-report'; aggregate: GrandReport }
  | { kind: 'error'; reason: string; retry?: () => void };

interface PerStepScore {
  correct: number;
  total: number;
  missedVerbs: string[];
}

interface TenseResult {
  perStep: Partial<Record<StepNum, PerStepScore>>;
  weakVerbs: string[];
  auxiliaryErrors?: { essere: number; avere: number };
  startedAt: number;
  completedAt: number;
}

interface GrandReport {
  bestTense: TenseId;
  worstTense: TenseId;
  topMissedVerbs: { infinitive: string; misses: number }[];
  auxiliaryErrors: { essere: number; avere: number };
  recommendedNext: TenseId;
  completedAt: number;
}

interface PersistedProgress {
  schemaVersion: 1;
  completedTenses: TenseId[];
  currentTense: TenseId | null;
  currentStep: 1 | 2 | 3 | 4 | 5 | 6 | null;
  inFlight?: {
    tense: TenseId;
    step: StepNum;
    itemIds: string[];
    idx: number;
    answers: Record<number, number>;
    revealed: Record<number, boolean>;
    redrillAttempt: number;
  };
  tenseResults: Partial<Record<TenseId, TenseResult>>;
  grand?: GrandReport;
  updatedAt: number;
}

interface Props {
  onExit: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'a2prep:verbTrainingProgress:v1';
const PASS_THRESHOLD = 0.7;
const MAX_REDRILL_ATTEMPTS = 3;

const ITEM_COUNTS: Record<StepNum, number> = {
  2: 6,   // vocab matching
  3: 8,   // recognize infinitive
  4: 10,  // conjugate
  5: 8,   // use in context
  6: 10,  // mixed mini-quiz
};

const STEP_TO_KIND: Record<StepNum, StepKind> = {
  2: 'vocab',
  3: 'recognize',
  4: 'conjugate',
  5: 'context',
  6: 'mixed',
};

const STEP_LABEL: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: 'Regole',
  2: 'Vocabolario',
  3: 'Riconosci l\'infinito',
  4: 'Coniuga',
  5: 'Usa nel contesto',
  6: 'Quiz finale',
};

const STEP_SHORT: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: 'Regole',
  2: 'Vocab',
  3: 'Riconosci',
  4: 'Coniuga',
  5: 'Contesto',
  6: 'Mix',
};

// ============================================================================
// Persistence
// ============================================================================

function loadProgress(): PersistedProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedProgress;
    if (!parsed || parsed.schemaVersion !== 1) return null;
    if (!Array.isArray(parsed.completedTenses)) return null;
    if (!parsed.tenseResults || typeof parsed.tenseResults !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveProgress(p: PersistedProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // localStorage unavailable (private mode, quota) — silently skip
  }
}

function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ============================================================================
// Tense unlock logic
// ============================================================================

function isTenseUnlocked(tense: TenseId, completed: TenseId[]): boolean {
  const idx = TENSE_ORDER.indexOf(tense);
  if (idx <= 0) return true; // first tense always unlocked
  const prev = TENSE_ORDER[idx - 1];
  return completed.includes(prev);
}

function isTenseCompleted(tense: TenseId, completed: TenseId[]): boolean {
  return completed.includes(tense);
}

function nextTenseAfter(tense: TenseId): TenseId | null {
  const idx = TENSE_ORDER.indexOf(tense);
  if (idx < 0 || idx >= TENSE_ORDER.length - 1) return null;
  return TENSE_ORDER[idx + 1];
}

// ============================================================================
// API
// ============================================================================

async function fetchItems(
  tense: TenseId,
  step: StepNum,
  redrillVerbs?: string[],
): Promise<Question[]> {
  const res = await fetch('/api/verb-training/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      browserId: getBrowserId(),
      tense,
      step: STEP_TO_KIND[step],
      count: ITEM_COUNTS[step],
      redrillVerbs: redrillVerbs && redrillVerbs.length > 0 ? redrillVerbs : undefined,
    }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  if (!data?.success || !Array.isArray(data.items)) {
    throw new Error(data?.error || 'Risposta inattesa dal server.');
  }
  if (data.items.length === 0) {
    throw new Error('Nessun esercizio disponibile per questo tempo.');
  }
  return data.items as Question[];
}

// ============================================================================
// Markdown-ish renderer (bold, bullets, paragraphs)
// ============================================================================

function renderRulesBlock(rules: string): React.ReactNode {
  // Split into paragraphs on blank lines.
  const paragraphs = rules.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

  const renderInline = (text: string, keyBase: string): React.ReactNode => {
    // Split on **bold** preserving the bold markers.
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`${keyBase}-${i}`} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return <React.Fragment key={`${keyBase}-${i}`}>{part}</React.Fragment>;
    });
  };

  return paragraphs.map((para, pi) => {
    const lines = para.split('\n');
    const allBullets = lines.every(l => l.trim().startsWith('- '));
    if (allBullets) {
      return (
        <ul key={pi} className="list-disc pl-5 space-y-1.5 text-sm text-slate-700 font-medium leading-relaxed">
          {lines.map((l, li) => (
            <li key={li}>{renderInline(l.trim().slice(2), `${pi}-${li}`)}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={pi} className="text-sm text-slate-700 font-medium leading-relaxed">
        {renderInline(para, `p${pi}`)}
      </p>
    );
  });
}

// ============================================================================
// Scoring helpers
// ============================================================================

function scoreDrill(items: Question[], answers: Record<number, number>): PerStepScore {
  let correct = 0;
  const missedVerbs: string[] = [];
  items.forEach((it, i) => {
    const ans = answers[i];
    if (ans === it.correctAnswerIndex) {
      correct++;
    } else if (it.verbInfinitive) {
      missedVerbs.push(it.verbInfinitive);
    }
  });
  return { correct, total: items.length, missedVerbs };
}

function computeWeakVerbs(perStep: Partial<Record<StepNum, PerStepScore>>): string[] {
  const tally = new Map<string, number>();
  for (const s of Object.values(perStep)) {
    if (!s) continue;
    for (const v of s.missedVerbs) {
      tally.set(v, (tally.get(v) || 0) + 1);
    }
  }
  return [...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([v]) => v);
}

function computeGrandReport(results: Partial<Record<TenseId, TenseResult>>): GrandReport {
  const tensePcts: { tense: TenseId; pct: number }[] = [];
  const allMissed = new Map<string, number>();
  let totalEssere = 0;
  let totalAvere = 0;

  for (const tense of TENSE_ORDER) {
    const r = results[tense];
    if (!r) continue;
    let correct = 0;
    let total = 0;
    for (const s of Object.values(r.perStep)) {
      if (!s) continue;
      correct += s.correct;
      total += s.total;
      for (const v of s.missedVerbs) allMissed.set(v, (allMissed.get(v) || 0) + 1);
    }
    if (total > 0) tensePcts.push({ tense, pct: correct / total });
    if (r.auxiliaryErrors) {
      totalEssere += r.auxiliaryErrors.essere;
      totalAvere += r.auxiliaryErrors.avere;
    }
  }

  tensePcts.sort((a, b) => b.pct - a.pct);
  const bestTense = tensePcts[0]?.tense ?? TENSE_ORDER[0];
  const worstTense = tensePcts[tensePcts.length - 1]?.tense ?? TENSE_ORDER[0];

  const topMissedVerbs = [...allMissed.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([infinitive, misses]) => ({ infinitive, misses }));

  return {
    bestTense,
    worstTense,
    topMissedVerbs,
    auxiliaryErrors: { essere: totalEssere, avere: totalAvere },
    recommendedNext: worstTense,
    completedAt: Date.now(),
  };
}

// ============================================================================
// Component
// ============================================================================

export function VerbTensesTraining({ onExit }: Props): React.ReactElement {
  // Hydrate persisted progress synchronously so the first render is correct.
  const initial = (() => {
    const p = loadProgress();
    if (!p) {
      return {
        phase: { kind: 'overview' as const },
        completedTenses: [] as TenseId[],
        tenseResults: {} as Partial<Record<TenseId, TenseResult>>,
        grand: undefined as GrandReport | undefined,
        startedAt: Date.now(),
      };
    }
    // Resume at the appropriate spot. We deliberately ignore inFlight item
    // state (see header comment) and re-enter the (tense, step) fresh.
    let phase: Phase = { kind: 'overview' };
    if (p.grand) {
      phase = { kind: 'grand-report', aggregate: p.grand };
    } else if (p.inFlight) {
      phase = { kind: 'loading', tense: p.inFlight.tense, step: p.inFlight.step };
    } else if (p.currentTense && p.currentStep) {
      const t = p.currentTense;
      if (p.currentStep === 1) phase = { kind: 'rules', tense: t };
      else if (p.currentStep === 2) phase = { kind: 'vocab-intro', tense: t, cardIdx: 0 };
      else phase = { kind: 'loading', tense: t, step: p.currentStep };
    }
    return {
      phase,
      completedTenses: p.completedTenses,
      tenseResults: p.tenseResults,
      grand: p.grand,
      startedAt: Date.now(),
    };
  })();

  const [phase, setPhase] = useState<Phase>(initial.phase);
  const [completedTenses, setCompletedTenses] = useState<TenseId[]>(initial.completedTenses);
  const [tenseResults, setTenseResults] = useState<Partial<Record<TenseId, TenseResult>>>(initial.tenseResults);
  const [grand, setGrand] = useState<GrandReport | undefined>(initial.grand);
  // Per-tense start times for accurate tenseResult.startedAt tracking.
  const tenseStartRef = useRef<Partial<Record<TenseId, number>>>({});
  // Banner shown when API falls back to a generated batch despite redrill cap.
  const [pushThroughWarn, setPushThroughWarn] = useState(false);

  // ---------------------------------------------------------------------------
  // Persistence — debounced save on relevant state changes.
  // ---------------------------------------------------------------------------
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      let currentTense: TenseId | null = null;
      let currentStep: 1 | 2 | 3 | 4 | 5 | 6 | null = null;
      let inFlight: PersistedProgress['inFlight'];

      if (phase.kind === 'rules') {
        currentTense = phase.tense;
        currentStep = 1;
      } else if (phase.kind === 'vocab-intro') {
        currentTense = phase.tense;
        currentStep = 2;
      } else if (phase.kind === 'loading') {
        currentTense = phase.tense;
        currentStep = phase.step;
      } else if (phase.kind === 'drill') {
        currentTense = phase.tense;
        currentStep = phase.step;
        inFlight = {
          tense: phase.tense,
          step: phase.step,
          itemIds: phase.items.map(i => i.id),
          idx: phase.idx,
          answers: phase.answers,
          revealed: phase.revealed,
          redrillAttempt: phase.redrillAttempt,
        };
      } else if (phase.kind === 'tense-report') {
        currentTense = phase.tense;
        currentStep = 6;
      }

      const payload: PersistedProgress = {
        schemaVersion: 1,
        completedTenses,
        currentTense,
        currentStep,
        inFlight,
        tenseResults,
        grand,
        updatedAt: Date.now(),
      };
      saveProgress(payload);
    }, 200);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [phase, completedTenses, tenseResults, grand]);

  // ---------------------------------------------------------------------------
  // Transitions
  // ---------------------------------------------------------------------------

  function startTense(tense: TenseId) {
    if (!tenseStartRef.current[tense]) {
      tenseStartRef.current[tense] = Date.now();
    }
    setPushThroughWarn(false);
    setPhase({ kind: 'rules', tense });
  }

  function gotoVocabIntro(tense: TenseId) {
    setPhase({ kind: 'vocab-intro', tense, cardIdx: 0 });
  }

  async function loadStep(tense: TenseId, step: StepNum, redrillVerbs?: string[], redrillAttempt = 0) {
    setPhase({ kind: 'loading', tense, step });
    try {
      const items = await fetchItems(tense, step, redrillVerbs);
      setPhase({
        kind: 'drill',
        tense,
        step,
        items,
        idx: 0,
        answers: {},
        revealed: {},
        redrillAttempt,
      });
    } catch (err: any) {
      setPhase({
        kind: 'error',
        reason: err?.message || 'Errore di rete durante il caricamento degli esercizi.',
        retry: () => loadStep(tense, step, redrillVerbs, redrillAttempt),
      });
    }
  }

  function advanceAfterDrill(passed: boolean) {
    if (phase.kind !== 'drill') return;
    const { tense, step, items, answers, redrillAttempt } = phase;

    // Tally this step's score into the current tense's tenseResults entry.
    const stepScore = scoreDrill(items, answers);
    const existing = tenseResults[tense];
    const prevPerStep: Partial<Record<StepNum, PerStepScore>> = existing?.perStep ?? {};
    const mergedPerStep: Partial<Record<StepNum, PerStepScore>> = {
      ...prevPerStep,
      [step]: stepScore,
    };

    // Auxiliary error tally (compound tenses only). We don't have a clean
    // way to infer aux per item, so we just bucket all misses on compound
    // tenses into "essere+avere combined" — split is best-effort.
    let auxErrors = existing?.auxiliaryErrors;
    const tenseDef: any = (TENSES as any)[tense];
    if (tenseDef?.isCompound) {
      const wrongCount = stepScore.total - stepScore.correct;
      const prevEss = auxErrors?.essere ?? 0;
      const prevAve = auxErrors?.avere ?? 0;
      // Naive split: count items whose verbInfinitive is in the tense's
      // essere-list (if exposed), else attribute to avere. The data file's
      // shape may not expose this, so we just attribute all to "avere" as a
      // harmless default — the grand report still surfaces the total.
      auxErrors = { essere: prevEss, avere: prevAve + wrongCount };
    }

    if (!passed) {
      // Redrill same step, biased to missed verbs.
      if (redrillAttempt + 1 >= MAX_REDRILL_ATTEMPTS) {
        setPushThroughWarn(true);
        // Still persist progress so far.
        setTenseResults(prev => ({
          ...prev,
          [tense]: {
            perStep: mergedPerStep,
            weakVerbs: computeWeakVerbs(mergedPerStep),
            auxiliaryErrors: auxErrors,
            startedAt: existing?.startedAt ?? tenseStartRef.current[tense] ?? Date.now(),
            completedAt: Date.now(),
          },
        }));
        // Force-advance path: surface a banner + advance buttons in DrillView
        // — handled in render. We re-enter the same drill state with revealed
        // for all items so the user sees the explanations.
        setPhase({
          ...phase,
          revealed: items.reduce((acc, _, i) => ({ ...acc, [i]: true }), {} as Record<number, boolean>),
        });
        return;
      }
      const redrillVerbs = stepScore.missedVerbs;
      setTenseResults(prev => ({
        ...prev,
        [tense]: {
          perStep: mergedPerStep,
          weakVerbs: computeWeakVerbs(mergedPerStep),
          auxiliaryErrors: auxErrors,
          startedAt: existing?.startedAt ?? tenseStartRef.current[tense] ?? Date.now(),
          completedAt: Date.now(),
        },
      }));
      loadStep(tense, step, redrillVerbs, redrillAttempt + 1);
      return;
    }

    // Passed. Save partial result.
    setTenseResults(prev => ({
      ...prev,
      [tense]: {
        perStep: mergedPerStep,
        weakVerbs: computeWeakVerbs(mergedPerStep),
        auxiliaryErrors: auxErrors,
        startedAt: existing?.startedAt ?? tenseStartRef.current[tense] ?? Date.now(),
        completedAt: Date.now(),
      },
    }));

    if (step < 6) {
      const nextStep = (step + 1) as StepNum;
      loadStep(tense, nextStep);
    } else {
      // End of tense — show tense report.
      const finalResult: TenseResult = {
        perStep: mergedPerStep,
        weakVerbs: computeWeakVerbs(mergedPerStep),
        auxiliaryErrors: auxErrors,
        startedAt: existing?.startedAt ?? tenseStartRef.current[tense] ?? Date.now(),
        completedAt: Date.now(),
      };
      if (!completedTenses.includes(tense)) {
        setCompletedTenses(prev => [...prev, tense]);
      }
      setPhase({ kind: 'tense-report', tense, result: finalResult });
    }
  }

  function forceAdvance() {
    if (phase.kind !== 'drill') return;
    const { tense, step } = phase;
    setPushThroughWarn(false);
    if (step < 6) {
      loadStep(tense, (step + 1) as StepNum);
    } else {
      const existing = tenseResults[tense];
      const finalResult: TenseResult = existing ?? {
        perStep: {},
        weakVerbs: [],
        startedAt: tenseStartRef.current[tense] ?? Date.now(),
        completedAt: Date.now(),
      };
      if (!completedTenses.includes(tense)) {
        setCompletedTenses(prev => [...prev, tense]);
      }
      setPhase({ kind: 'tense-report', tense, result: finalResult });
    }
  }

  function continueFromTenseReport(currentTense: TenseId) {
    const next = nextTenseAfter(currentTense);
    if (!next) {
      // Done with all six — compute grand.
      const allResults = { ...tenseResults };
      const g = computeGrandReport(allResults);
      setGrand(g);
      setPhase({ kind: 'grand-report', aggregate: g });
    } else {
      setPhase({ kind: 'overview' });
    }
  }

  function resetEverything() {
    clearProgress();
    setCompletedTenses([]);
    setTenseResults({});
    setGrand(undefined);
    tenseStartRef.current = {};
    setPushThroughWarn(false);
    setPhase({ kind: 'overview' });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <BreadcrumbHeader phase={phase} onExit={onExit} />

      {phase.kind === 'overview' && (
        <OverviewView
          completedTenses={completedTenses}
          tenseResults={tenseResults}
          onStart={startTense}
          onReset={() => {
            if (typeof window !== 'undefined' && window.confirm('Resettare tutto il progresso? Questa azione non è reversibile.')) {
              resetEverything();
            }
          }}
        />
      )}

      {phase.kind === 'rules' && (
        <RulesView
          tense={phase.tense}
          onContinue={() => gotoVocabIntro(phase.tense)}
          onBack={() => setPhase({ kind: 'overview' })}
        />
      )}

      {phase.kind === 'vocab-intro' && (
        <VocabIntroView
          tense={phase.tense}
          cardIdx={phase.cardIdx}
          onPrev={() =>
            setPhase({
              kind: 'vocab-intro',
              tense: phase.tense,
              cardIdx: Math.max(0, phase.cardIdx - 1),
            })
          }
          onNext={() => {
            const cards: VocabCard[] = ((TENSES as any)[phase.tense]?.vocabulary ?? []) as VocabCard[];
            if (phase.cardIdx + 1 >= cards.length) {
              loadStep(phase.tense, 2);
            } else {
              setPhase({
                kind: 'vocab-intro',
                tense: phase.tense,
                cardIdx: phase.cardIdx + 1,
              });
            }
          }}
          onBack={() => setPhase({ kind: 'rules', tense: phase.tense })}
        />
      )}

      {phase.kind === 'loading' && <LoadingView step={phase.step} />}

      {phase.kind === 'drill' && (
        <DrillView
          tense={phase.tense}
          step={phase.step}
          items={phase.items}
          idx={phase.idx}
          answers={phase.answers}
          revealed={phase.revealed}
          redrillAttempt={phase.redrillAttempt}
          pushThroughWarn={pushThroughWarn}
          onSelect={(optionIdx) => {
            // Lock in the answer + reveal feedback. Don't allow changing.
            if (phase.revealed[phase.idx]) return;
            setPhase({
              ...phase,
              answers: { ...phase.answers, [phase.idx]: optionIdx },
              revealed: { ...phase.revealed, [phase.idx]: true },
            });
          }}
          onNext={() => {
            if (phase.idx + 1 < phase.items.length) {
              setPhase({ ...phase, idx: phase.idx + 1 });
            } else {
              const { correct, total } = scoreDrill(phase.items, phase.answers);
              const pct = total === 0 ? 0 : correct / total;
              advanceAfterDrill(pct >= PASS_THRESHOLD);
            }
          }}
          onPrev={
            phase.idx > 0
              ? () => setPhase({ ...phase, idx: phase.idx - 1 })
              : undefined
          }
          onForceAdvance={forceAdvance}
        />
      )}

      {phase.kind === 'tense-report' && (
        <TenseReportView
          tense={phase.tense}
          result={phase.result}
          isLastTense={nextTenseAfter(phase.tense) === null}
          onContinue={() => continueFromTenseReport(phase.tense)}
        />
      )}

      {phase.kind === 'grand-report' && (
        <GrandReportView
          report={phase.aggregate}
          onReset={resetEverything}
          onExit={onExit}
        />
      )}

      {phase.kind === 'error' && (
        <ErrorView
          reason={phase.reason}
          onRetry={phase.retry}
          onBack={() => setPhase({ kind: 'overview' })}
        />
      )}
    </main>
  );
}

// ============================================================================
// Breadcrumb header
// ============================================================================

function BreadcrumbHeader({ phase, onExit }: { phase: Phase; onExit: () => void }) {
  let tenseLabel = '';
  let stepLabel = '';
  let stepNum: number | null = null;

  if (phase.kind === 'rules') {
    tenseLabel = TENSES[phase.tense]?.labelIt ?? phase.tense;
    stepLabel = STEP_LABEL[1];
    stepNum = 1;
  } else if (phase.kind === 'vocab-intro') {
    tenseLabel = TENSES[phase.tense]?.labelIt ?? phase.tense;
    stepLabel = 'Vocabolario (intro)';
    stepNum = 2;
  } else if (phase.kind === 'loading' || phase.kind === 'drill') {
    tenseLabel = TENSES[phase.tense]?.labelIt ?? phase.tense;
    stepLabel = STEP_LABEL[phase.step];
    stepNum = phase.step;
  } else if (phase.kind === 'tense-report') {
    tenseLabel = TENSES[phase.tense]?.labelIt ?? phase.tense;
    stepLabel = 'Rapporto';
  } else if (phase.kind === 'grand-report') {
    tenseLabel = 'Rapporto finale';
  }

  return (
    <div className="flex items-center justify-between mb-5 md:mb-6 bg-white rounded-3xl border border-slate-200 px-4 md:px-6 py-3 md:py-4 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl flex items-center justify-center shrink-0">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Allenamento A2</p>
          <p className="text-sm md:text-base font-extrabold text-slate-900 leading-tight truncate">
            Tempi Verbali
            {tenseLabel && (
              <>
                <span className="text-slate-300 mx-1.5 font-bold">/</span>
                <span className="text-emerald-700">{tenseLabel}</span>
              </>
            )}
            {stepLabel && (
              <>
                <span className="text-slate-300 mx-1.5 font-bold">/</span>
                <span className="text-slate-600 font-bold">{stepLabel}</span>
                {stepNum !== null && (
                  <span className="text-[10px] text-slate-400 font-bold ml-1.5">({stepNum}/6)</span>
                )}
              </>
            )}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onExit}
        className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer flex items-center gap-1 shrink-0 ml-3"
      >
        <X className="w-3.5 h-3.5" /> Esci
      </button>
    </div>
  );
}

// ============================================================================
// Overview
// ============================================================================

function OverviewView({
  completedTenses,
  tenseResults,
  onStart,
  onReset,
}: {
  completedTenses: TenseId[];
  tenseResults: Partial<Record<TenseId, TenseResult>>;
  onStart: (t: TenseId) => void;
  onReset: () => void;
}) {
  const allDone = completedTenses.length === TENSE_ORDER.length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 min-h-[480px]">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-emerald-600" />
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Sei tempi · Sei tappe</p>
      </div>
      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Padroneggia i Tempi Verbali</h2>
      <p className="text-sm text-slate-600 font-semibold leading-relaxed mb-6 max-w-2xl">
        Affronta i sei tempi più frequenti del livello A2 in ordine. Ogni tempo si sblocca quando completi il precedente. Per ognuno: regole, vocabolario, e cinque mini-quiz con soglia del 70%.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {TENSE_ORDER.map((tense, i) => {
          const unlocked = isTenseUnlocked(tense, completedTenses);
          const completed = isTenseCompleted(tense, completedTenses);
          const def: any = (TENSES as any)[tense] ?? {};
          const result = tenseResults[tense];
          let scorePct: number | null = null;
          if (result) {
            let c = 0;
            let t = 0;
            for (const s of Object.values(result.perStep)) {
              if (!s) continue;
              c += s.correct;
              t += s.total;
            }
            if (t > 0) scorePct = Math.round((c / t) * 100);
          }
          return (
            <motion.div
              key={tense}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`relative rounded-2xl border p-4 flex flex-col gap-2 ${
                completed
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : unlocked
                  ? 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm transition'
                  : 'bg-slate-50 border-slate-200 opacity-70'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black">
                  {i + 1}
                </span>
                <h3 className={`font-extrabold text-sm flex-1 ${unlocked ? 'text-slate-900' : 'text-slate-500'}`}>
                  {def.labelIt ?? tense}
                </h3>
                {completed ? (
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-100 text-emerald-700 rounded-full p-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </motion.div>
                ) : unlocked ? (
                  <motion.div
                    initial={{ rotate: -45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    className="text-emerald-600"
                  >
                    <Unlock className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Lock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <p className={`text-xs font-semibold leading-snug ${unlocked ? 'text-slate-600' : 'text-slate-400'}`}>
                {def.labelEn ?? ''}
              </p>
              {scorePct !== null && (
                <p className="text-[11px] font-black text-emerald-700">Ultimo punteggio: {scorePct}%</p>
              )}
              <button
                type="button"
                disabled={!unlocked}
                onClick={() => onStart(tense)}
                className={`mt-1 w-full text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
                  !unlocked
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : completed
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer'
                    : 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
                }`}
              >
                {!unlocked ? 'Bloccato' : completed ? 'Rivedi' : 'Inizia'}
                {unlocked && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </motion.div>
          );
        })}
      </div>

      {allDone && (
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-300 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-extrabold text-emerald-900">
            Hai completato tutti i sei tempi! Apri il rapporto finale per vedere i tuoi punti deboli.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs">
        <p className="text-slate-500 font-semibold">
          Progresso: {completedTenses.length}/{TENSE_ORDER.length}
        </p>
        {completedTenses.length > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-slate-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Rules
// ============================================================================

function RulesView({
  tense,
  onContinue,
  onBack,
}: {
  tense: TenseId;
  onContinue: () => void;
  onBack: () => void;
}) {
  const def: any = (TENSES as any)[tense] ?? {};
  const formationExamples: { it: string; en?: string; verb?: string }[] = Array.isArray(def.formationExamples)
    ? def.formationExamples
    : [];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 min-h-[480px]">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen className="w-4 h-4 text-emerald-600" />
        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
          Step 1 di 6 · Regole
        </span>
      </div>
      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-3 mb-2">{def.labelIt ?? tense}</h2>
      {def.labelEn && (
        <p className="text-sm text-slate-600 font-semibold leading-relaxed mb-6">{def.labelEn}</p>
      )}

      <div className="space-y-3 mb-6">
        {typeof def.rules === 'string' && def.rules.trim().length > 0 ? (
          renderRulesBlock(def.rules)
        ) : (
          <p className="text-sm text-slate-500 italic">Nessuna regola disponibile per questo tempo.</p>
        )}
      </div>

      {formationExamples.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5 mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Esempi di formazione</p>
          <ul className="space-y-2">
            {formationExamples.map((ex, i) => (
              <li key={i} className="text-sm">
                <span className="font-extrabold text-slate-900">{ex.it}</span>
                {ex.en && <span className="text-slate-500 font-medium"> — {ex.en}</span>}
                {ex.verb && <span className="text-emerald-700 font-bold text-[10px] uppercase tracking-wider ml-2">{ex.verb}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Indietro
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-2xl text-sm cursor-pointer flex items-center gap-2"
        >
          Vai al vocabolario <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Vocab intro (teaching cards)
// ============================================================================

function VocabIntroView({
  tense,
  cardIdx,
  onPrev,
  onNext,
  onBack,
}: {
  tense: TenseId;
  cardIdx: number;
  onPrev: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const def: any = (TENSES as any)[tense] ?? {};
  const cards: VocabCard[] = Array.isArray(def.vocabulary) ? (def.vocabulary as VocabCard[]) : [];
  const card = cards[cardIdx];

  if (!card) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 min-h-[480px]">
        <div className="text-center py-12">
          <p className="text-sm text-slate-500 font-semibold mb-4">Nessun vocabolario per questo tempo.</p>
          <button
            type="button"
            onClick={onNext}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-2xl text-sm cursor-pointer flex items-center gap-2 mx-auto"
          >
            Vai agli esercizi <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const isLast = cardIdx + 1 >= cards.length;
  const kindBadge = card.kind === 'verb' ? 'verbo' : card.kind === 'term' ? 'parola' : null;
  const term = card.term ?? (card as any).italian ?? '';
  const english = card.english ?? '';
  const exampleIt = card.exampleIt ?? (card as any).exampleItalian ?? (card as any).example ?? '';
  const exampleEn = card.exampleEn ?? (card as any).exampleEnglish ?? '';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 min-h-[480px]">
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb className="w-4 h-4 text-emerald-600" />
        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
          Vocabolario · Carta {cardIdx + 1} di {cards.length}
        </span>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-3">Impara prima — poi metti in pratica</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={cardIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
          className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-6 md:p-8 mt-4 mb-6"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{term}</h3>
            {kindBadge && (
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                kindBadge === 'verbo'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {kindBadge}
              </span>
            )}
          </div>
          {english && <p className="text-sm font-bold text-slate-500 italic mb-4">{english}</p>}
          {exampleIt && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Esempio</p>
              <p className="text-sm text-slate-800 font-semibold leading-relaxed">{exampleIt}</p>
              {exampleEn && <p className="text-xs text-slate-500 font-medium italic mt-1">{exampleEn}</p>}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={cardIdx === 0 ? onBack : onPrev}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> {cardIdx === 0 ? 'Regole' : 'Precedente'}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-2xl text-sm cursor-pointer flex items-center gap-2"
        >
          {isLast ? 'Inizia gli esercizi' : 'Prossima'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Loading
// ============================================================================

function LoadingView({ step }: { step: StepNum }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 min-h-[480px] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-5" />
        <h3 className="text-lg font-extrabold text-slate-900 mb-1">Generiamo gli esercizi…</h3>
        <p className="text-sm text-slate-500 font-semibold">Step {step}: {STEP_LABEL[step]}</p>
      </div>
    </div>
  );
}

// ============================================================================
// Drill
// ============================================================================

function DrillView({
  tense,
  step,
  items,
  idx,
  answers,
  revealed,
  redrillAttempt,
  pushThroughWarn,
  onSelect,
  onNext,
  onPrev,
  onForceAdvance,
}: {
  tense: TenseId;
  step: StepNum;
  items: Question[];
  idx: number;
  answers: Record<number, number>;
  revealed: Record<number, boolean>;
  redrillAttempt: number;
  pushThroughWarn: boolean;
  onSelect: (optionIdx: number) => void;
  onNext: () => void;
  onPrev?: () => void;
  onForceAdvance: () => void;
}) {
  const q = items[idx];
  if (!q) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 min-h-[480px]">
        <p className="text-sm text-slate-500">Nessun esercizio disponibile.</p>
      </div>
    );
  }
  const def: any = (TENSES as any)[tense] ?? {};
  const isRevealed = !!revealed[idx];
  const selected = answers[idx];
  const isCorrect = selected === q.correctAnswerIndex;
  const isLast = idx + 1 >= items.length;
  const progressPct = ((idx + 1) / items.length) * 100;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 min-h-[480px]">
      {/* Step + redrill indicator */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
            Step {step}/6 · {STEP_SHORT[step]}
          </span>
          {redrillAttempt > 0 && (
            <span className="bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Ripasso #{redrillAttempt}
            </span>
          )}
        </div>
        <p className="text-[11px] font-bold text-slate-400">
          Item {idx + 1} di {items.length}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-5">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Force-advance warning */}
      {pushThroughWarn && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-extrabold text-amber-900 mb-1">Hai raggiunto il limite di tentativi.</p>
            <p className="text-[11px] font-semibold text-amber-800 leading-relaxed mb-3">
              Puoi continuare comunque al prossimo step, ma ti consigliamo di rileggere le regole per <strong>{def.label ?? tense}</strong>.
            </p>
            <button
              type="button"
              onClick={onForceAdvance}
              className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
            >
              Continua comunque
            </button>
          </div>
        </div>
      )}

      {/* Context */}
      {q.context && (
        <div className="mb-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
          {q.context}
        </div>
      )}

      <h3 className="text-lg md:text-xl font-extrabold text-slate-900 mb-5 leading-snug whitespace-pre-line">
        {q.questionText}
      </h3>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {q.options.map((opt, i) => {
          const chosen = selected === i;
          const correct = q.correctAnswerIndex === i;
          let cls = 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-50';
          if (isRevealed) {
            if (correct) cls = 'bg-emerald-50 border-emerald-300 text-emerald-900';
            else if (chosen) cls = 'bg-rose-50 border-rose-300 text-rose-900';
            else cls = 'bg-white text-slate-500 border-slate-200 opacity-60';
          } else if (chosen) {
            cls = 'bg-slate-900 text-white border-slate-900';
          }
          return (
            <button
              key={i}
              type="button"
              disabled={isRevealed}
              onClick={() => onSelect(i)}
              className={`w-full text-left px-5 py-3.5 rounded-2xl border-2 font-semibold text-sm transition-all ${cls} ${
                isRevealed ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 text-xs font-black ${
                  isRevealed && correct
                    ? 'bg-emerald-200 text-emerald-800'
                    : isRevealed && chosen
                    ? 'bg-rose-200 text-rose-800'
                    : chosen
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isRevealed && correct ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : isRevealed && chosen ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {isRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-4 mb-5 ${
            isCorrect
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <p className="text-xs font-black uppercase tracking-widest mb-1">
            {isCorrect ? 'Corretto!' : 'Risposta sbagliata'}
          </p>
          {q.explanation && (
            <p className="text-sm font-semibold leading-relaxed">{q.explanation}</p>
          )}
          {q.verbInfinitive && (
            <p className="text-[10px] font-bold uppercase tracking-wider mt-2 opacity-70">
              Verbo: {q.verbInfinitive}
            </p>
          )}
        </motion.div>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={!onPrev}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Indietro
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isRevealed}
          className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-2xl text-sm cursor-pointer flex items-center gap-2"
        >
          {isLast ? 'Concludi' : 'Avanti'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Tense report
// ============================================================================

function TenseReportView({
  tense,
  result,
  isLastTense,
  onContinue,
}: {
  tense: TenseId;
  result: TenseResult;
  isLastTense: boolean;
  onContinue: () => void;
}) {
  const def: any = (TENSES as any)[tense] ?? {};
  const isCompound = !!def.isCompound;

  let totalCorrect = 0;
  let totalItems = 0;
  for (const s of Object.values(result.perStep)) {
    if (!s) continue;
    totalCorrect += s.correct;
    totalItems += s.total;
  }
  const overallPct = totalItems === 0 ? 0 : Math.round((totalCorrect / totalItems) * 100);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 min-h-[480px]">
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl mb-3"
        >
          <Award className="w-7 h-7" />
        </motion.div>
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1">Rapporto</p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">{def.label ?? tense}</h2>
        <p className="text-3xl font-black text-slate-900">
          {overallPct}% <span className="text-base text-slate-400 font-medium">({totalCorrect}/{totalItems})</span>
        </p>
      </div>

      <div className="space-y-2.5 mb-6">
        {([2, 3, 4, 5, 6] as StepNum[]).map(stepNum => {
          const s = result.perStep[stepNum];
          if (!s) return null;
          const pct = s.total === 0 ? 0 : (s.correct / s.total) * 100;
          const passed = pct >= PASS_THRESHOLD * 100;
          return (
            <div key={stepNum} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-extrabold text-slate-700">
                  Step {stepNum}: {STEP_LABEL[stepNum]}
                </p>
                <p className={`text-[11px] font-black ${passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {s.correct}/{s.total} · {Math.round(pct)}%
                </p>
              </div>
              <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full ${passed ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {result.weakVerbs.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-700 mb-2">Verbi da ripassare</p>
          <ul className="flex flex-wrap gap-2">
            {result.weakVerbs.map(v => (
              <li
                key={v}
                className="bg-white border border-rose-200 text-rose-900 px-3 py-1 rounded-full text-xs font-bold"
              >
                {v}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isCompound && result.auxiliaryErrors && (result.auxiliaryErrors.essere + result.auxiliaryErrors.avere > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 mb-1">Errori in tempi composti</p>
          <p className="text-sm font-bold text-amber-900">
            Totale: {result.auxiliaryErrors.essere + result.auxiliaryErrors.avere}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onContinue}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl text-sm cursor-pointer flex items-center justify-center gap-2"
      >
        {isLastTense ? 'Vai al rapporto finale' : 'Prossimo tempo'} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================================================
// Grand report
// ============================================================================

function GrandReportView({
  report,
  onReset,
  onExit,
}: {
  report: GrandReport;
  onReset: () => void;
  onExit: () => void;
}) {
  const bestDef: any = (TENSES as any)[report.bestTense] ?? {};
  const worstDef: any = (TENSES as any)[report.worstTense] ?? {};
  const recDef: any = (TENSES as any)[report.recommendedNext] ?? {};

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 min-h-[480px]">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.6, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-3xl mb-4 shadow-md"
        >
          <Trophy className="w-9 h-9" />
        </motion.div>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1">Allenamento completato</p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Tempi Verbali</h2>
        <p className="text-sm text-slate-600 font-semibold max-w-xl mx-auto">
          Ecco il tuo rapporto finale su tutti i sei tempi. Usa i suggerimenti per concentrarti sui tuoi punti deboli.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1">Tempo più forte</p>
          <p className="text-lg font-extrabold text-emerald-900">{bestDef.label ?? report.bestTense}</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-700 mb-1">Tempo da rinforzare</p>
          <p className="text-lg font-extrabold text-rose-900">{worstDef.label ?? report.worstTense}</p>
        </div>
      </div>

      {report.topMissedVerbs.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Verbi sbagliati più spesso</p>
          <ul className="space-y-1.5">
            {report.topMissedVerbs.map(v => (
              <li key={v.infinitive} className="flex items-center justify-between text-sm">
                <span className="font-extrabold text-slate-900">{v.infinitive}</span>
                <span className="text-[11px] font-bold text-rose-700">{v.misses} {v.misses === 1 ? 'errore' : 'errori'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(report.auxiliaryErrors.essere + report.auxiliaryErrors.avere) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 mb-1">Errori totali sui tempi composti</p>
          <p className="text-sm font-bold text-amber-900">
            {report.auxiliaryErrors.essere + report.auxiliaryErrors.avere} errori
          </p>
        </div>
      )}

      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-300 rounded-2xl p-5 mb-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1">Prossimo passo</p>
        <p className="text-sm font-extrabold text-emerald-900">
          Ripassa il <strong>{recDef.label ?? report.recommendedNext}</strong> per consolidare le basi.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-400 text-slate-800 font-bold py-3 px-6 rounded-2xl text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Ricomincia
        </button>
        <button
          type="button"
          onClick={onExit}
          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-2xl text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          Esci <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Error view
// ============================================================================

function ErrorView({
  reason,
  onRetry,
  onBack,
}: {
  reason: string;
  onRetry?: () => void;
  onBack: () => void;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 min-h-[480px]">
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-3 mb-5">
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-extrabold text-rose-900 text-sm mb-1">Qualcosa è andato storto</h3>
          <p className="text-xs text-rose-800 font-semibold leading-relaxed">{reason}</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-2xl text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Riprova
          </button>
        )}
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-400 text-slate-800 font-bold py-3 px-6 rounded-2xl text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          Torna alla panoramica
        </button>
      </div>
    </div>
  );
}
