/**
 * Simulazione Prefettura — faithful simulation of the official Italian A2 test
 * administered by the Prefettura for the *permesso di soggiorno UE per
 * soggiornanti di lungo periodo* (D.M. 4 giugno 2010).
 *
 * Three sections, fixed weights and durations, single-attempt:
 *
 *   Ascolto    30 pt   25 min   10 items × 3 pt    listening MCQ
 *   Lettura    35 pt   25 min   10 items × 3.5 pt  reading MCQ
 *   Scrittura  35 pt   10 min   1 short message    AI-graded 0–20 → ×1.75
 *
 * Passing threshold: 80 / 100. No oral section. No standalone grammar.
 *
 * State machine: loading → intro → (section-intro → in-section)×3 → submitting → results.
 * Per-section countdown auto-advances when it hits 0 (matches the real test).
 */

import React, { useState, useEffect, useRef } from 'react';
import { Landmark, Clock, Volume2, VolumeX, ArrowRight, Award, X, AlertTriangle, Headphones, BookOpen, Edit3 } from 'lucide-react';
import type { Question } from '../types';
import type { WritingPrompt } from '../data/writingPrompts';
import { getBrowserId } from '../lib/browserId';

// ============================================================================
// Types — match the /api/quiz/start prefettura payload
// ============================================================================

interface MCSection {
  id: 'ascolto' | 'lettura';
  label: string;
  durationSec: number;
  pointsPerItem: number;
  questions: Question[];
}

interface WritingSection {
  id: 'scrittura';
  label: string;
  durationSec: number;
  points: number;
  prompt: WritingPrompt;
}

type Section = MCSection | WritingSection;

interface PrefetturaPayload {
  success: true;
  mode: 'prefettura';
  sections: Section[];
  totalPoints: number;
  passingPoints: number;
  bankCounts: { ascolto: number; lettura: number };
}

interface WritingEvaluation {
  score: number;
  passed: boolean;
  wordCount: number;
  errors: { original: string; correction: string; category: string; explanation: string }[];
  perfectVersion: string;
  coachingReport: string;
}

interface ScoreBreakdown {
  ascolto: { correct: number; total: number; points: number; maxPoints: number };
  lettura: { correct: number; total: number; points: number; maxPoints: number };
  scrittura: { rawScore: number; weightedPoints: number; maxPoints: number; evaluation: WritingEvaluation | null };
  totalPoints: number;
  passingPoints: number;
  passed: boolean;
}

type Phase =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'intro'; payload: PrefetturaPayload }
  | { kind: 'section-intro'; payload: PrefetturaPayload; sectionIdx: number }
  | { kind: 'in-section'; payload: PrefetturaPayload; sectionIdx: number; deadlineAt: number }
  | { kind: 'submitting-writing'; payload: PrefetturaPayload }
  | { kind: 'results'; payload: PrefetturaPayload; breakdown: ScoreBreakdown };

interface Props {
  onExit: () => void;
}

// ============================================================================
// Minimal TTS — Phase 4 will replace this with a cached MP3 branch
// ============================================================================

function speakItalian(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const cleaned = text
    .replace(/\[\d+\]/g, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/_+/g, ' ... ')
    .replace(/[*#`]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = 'it-IT';
  const voices = window.speechSynthesis.getVoices();
  const it = voices.find(v => v.lang.toLowerCase().includes('it'));
  if (it) utterance.voice = it;
  utterance.rate = 0.8;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

function stopTts() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

function formatClock(secs: number): string {
  if (secs < 0) secs = 0;
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ============================================================================
// Component
// ============================================================================

export function SimulazionePrefettura({ onExit }: Props) {
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' });
  const [mcAnswers, setMcAnswers] = useState<Record<string, number>>({});
  const [questionIdx, setQuestionIdx] = useState(0);
  const [writingText, setWritingText] = useState('');
  // Used when the writing prompt is a form-filling modulo. Keyed by field id.
  const [writingFields, setWritingFields] = useState<Record<string, string>>({});
  const [now, setNow] = useState(() => Date.now());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load the simulation payload on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/quiz/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ browserId: getBrowserId(), mode: 'prefettura' }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!data?.success || !Array.isArray(data.sections) || data.sections.length !== 3) {
          setPhase({ kind: 'error', message: data?.error || 'Risposta inattesa dal server.' });
          return;
        }
        // Surface a friendly error if either MC bank is empty — the simulation isn't useful otherwise.
        const ascSec = data.sections.find((s: Section) => s.id === 'ascolto') as MCSection | undefined;
        const letSec = data.sections.find((s: Section) => s.id === 'lettura') as MCSection | undefined;
        if (!ascSec?.questions.length || !letSec?.questions.length) {
          setPhase({
            kind: 'error',
            message: 'Banca domande incompleta per la simulazione (servono almeno alcune domande di Ascolto e Lettura). Riprova fra qualche minuto: il banco si arricchisce automaticamente.',
          });
          return;
        }
        setPhase({ kind: 'intro', payload: data as PrefetturaPayload });
      } catch (err: any) {
        if (cancelled) return;
        setPhase({ kind: 'error', message: err?.message || 'Errore di rete.' });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Tick the clock while a section is active.
  useEffect(() => {
    if (phase.kind !== 'in-section') {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }
    tickRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [phase.kind]);

  // Auto-advance when a section's timer hits 0.
  useEffect(() => {
    if (phase.kind !== 'in-section') return;
    if (now < phase.deadlineAt) return;
    advanceSection();
    // advanceSection updates `phase`; effect re-fires harmlessly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.kind, now]);

  // --------------------------------------------------------------------------
  // Transitions
  // --------------------------------------------------------------------------

  function startSection(sectionIdx: number) {
    if (phase.kind !== 'section-intro' && phase.kind !== 'intro') return;
    const payload = (phase as any).payload as PrefetturaPayload;
    const section = payload.sections[sectionIdx];
    setQuestionIdx(0);
    stopTts();
    setPhase({
      kind: 'in-section',
      payload,
      sectionIdx,
      deadlineAt: Date.now() + section.durationSec * 1000,
    });
  }

  function gotoSectionIntro(sectionIdx: number) {
    if (phase.kind === 'loading' || phase.kind === 'error') return;
    const payload = (phase as any).payload as PrefetturaPayload;
    stopTts();
    setPhase({ kind: 'section-intro', payload, sectionIdx });
  }

  function advanceSection() {
    if (phase.kind !== 'in-section') return;
    const { payload, sectionIdx } = phase;
    stopTts();
    if (sectionIdx < 2) {
      setPhase({ kind: 'section-intro', payload, sectionIdx: sectionIdx + 1 });
    } else {
      // After scrittura's timer or submit: evaluate writing then results.
      submitAndScore(payload);
    }
  }

  async function submitAndScore(payload: PrefetturaPayload) {
    setPhase({ kind: 'submitting-writing', payload });
    const writingSec = payload.sections.find(s => s.id === 'scrittura') as WritingSection;
    const isModulo = writingSec.prompt.kind === 'modulo';
    let evaluation: WritingEvaluation | null = null;

    // Build the payload depending on whether this is a form or free text.
    let hasContent = false;
    let body: any = {
      promptTitle: writingSec.prompt.title,
      promptText: writingSec.prompt.promptText,
      promptGuidelines: writingSec.prompt.guidelines || [],
      promptTheme: writingSec.prompt.theme || null,
      mode: 'prefettura',
      kind: writingSec.prompt.kind,
    };
    if (isModulo && writingSec.prompt.fields) {
      const fields = writingSec.prompt.fields.map(f => ({
        label: f.label,
        value: (writingFields[f.id] || '').trim(),
      }));
      hasContent = fields.some(f => f.value.length > 0);
      body.studentFields = fields;
    } else {
      hasContent = writingText.trim().length > 0;
      body.studentText = writingText;
    }

    if (hasContent) {
      try {
        const res = await fetch('/api/evaluate-writing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data?.success && data.evaluation) evaluation = data.evaluation as WritingEvaluation;
      } catch (e) {
        console.warn('[Prefettura] writing eval failed; defaulting to 0', e);
      }
    }
    setPhase({ kind: 'results', payload, breakdown: computeBreakdown(payload, mcAnswers, evaluation) });
  }

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  if (phase.kind === 'loading') return <LoadingScreen onExit={onExit} />;
  if (phase.kind === 'error') return <ErrorScreen message={phase.message} onExit={onExit} />;
  if (phase.kind === 'intro') return <IntroScreen payload={phase.payload} onBegin={() => startSection(0)} onExit={onExit} />;
  if (phase.kind === 'section-intro') {
    return (
      <SectionIntro
        payload={phase.payload}
        sectionIdx={phase.sectionIdx}
        onBegin={() => startSection(phase.sectionIdx)}
        onExit={onExit}
      />
    );
  }
  if (phase.kind === 'submitting-writing') return <SubmittingScreen />;
  if (phase.kind === 'results') return <ResultsScreen breakdown={phase.breakdown} payload={phase.payload} onExit={onExit} />;

  // in-section
  const section = phase.payload.sections[phase.sectionIdx];
  const secondsLeft = Math.max(0, Math.floor((phase.deadlineAt - now) / 1000));

  if (section.id === 'scrittura') {
    return (
      <ScritturaSection
        prompt={section.prompt}
        secondsLeft={secondsLeft}
        value={writingText}
        onChange={setWritingText}
        fieldValues={writingFields}
        onChangeField={(id, v) => setWritingFields(prev => ({ ...prev, [id]: v }))}
        onSubmit={() => submitAndScore(phase.payload)}
      />
    );
  }

  const mc = section as MCSection;
  const q = mc.questions[questionIdx];
  return (
    <MCQuestionScreen
      sectionIcon={mc.id === 'ascolto' ? <Headphones className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
      sectionLabel={mc.label}
      sectionId={mc.id}
      questionNum={questionIdx + 1}
      questionTotal={mc.questions.length}
      secondsLeft={secondsLeft}
      question={q}
      selectedIdx={q ? mcAnswers[q.id] : undefined}
      onSelect={idx => {
        if (!q) return;
        setMcAnswers(prev => ({ ...prev, [q.id]: idx }));
      }}
      onNext={() => {
        if (questionIdx + 1 < mc.questions.length) {
          setQuestionIdx(questionIdx + 1);
        } else {
          advanceSection();
        }
      }}
      onPrev={questionIdx > 0 ? () => setQuestionIdx(questionIdx - 1) : undefined}
    />
  );
}

// ============================================================================
// Scoring
// ============================================================================

function computeBreakdown(
  payload: PrefetturaPayload,
  mcAnswers: Record<string, number>,
  writingEval: WritingEvaluation | null,
): ScoreBreakdown {
  const ascSec = payload.sections.find(s => s.id === 'ascolto') as MCSection;
  const letSec = payload.sections.find(s => s.id === 'lettura') as MCSection;
  const wrSec = payload.sections.find(s => s.id === 'scrittura') as WritingSection;

  const score = (sec: MCSection) => {
    let correct = 0;
    for (const q of sec.questions) {
      if (mcAnswers[q.id] === q.correctAnswerIndex) correct++;
    }
    const maxPoints = sec.questions.length * sec.pointsPerItem;
    return { correct, total: sec.questions.length, points: correct * sec.pointsPerItem, maxPoints };
  };

  const ascolto = score(ascSec);
  const lettura = score(letSec);
  const rawScore = writingEval?.score ?? 0;
  // 0–20 raw on the writing evaluator → scale to the 35-point section.
  const weightedPoints = (rawScore / 20) * wrSec.points;
  const scrittura = { rawScore, weightedPoints, maxPoints: wrSec.points, evaluation: writingEval };

  const totalPoints = ascolto.points + lettura.points + weightedPoints;
  const passed = totalPoints >= payload.passingPoints;
  return { ascolto, lettura, scrittura, totalPoints, passingPoints: payload.passingPoints, passed };
}

// ============================================================================
// Screens
// ============================================================================

function ShellHeader({ onExit, hideExit }: { onExit: () => void; hideExit?: boolean }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-red-500 text-white rounded-2xl flex items-center justify-center">
          <Landmark className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Test A2 ufficiale</p>
          <h2 className="text-lg font-extrabold text-slate-900 leading-tight">Simulazione Prefettura</h2>
        </div>
      </div>
      {!hideExit && (
        <button
          type="button"
          onClick={onExit}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" /> Esci
        </button>
      )}
    </div>
  );
}

function CenteredCard({ children, maxW = 'max-w-2xl' }: { children: React.ReactNode; maxW?: string }) {
  return (
    <main className={`${maxW} mx-auto px-6 py-12`}>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10">{children}</div>
    </main>
  );
}

function LoadingScreen({ onExit }: { onExit: () => void }) {
  return (
    <CenteredCard>
      <ShellHeader onExit={onExit} />
      <div className="text-center py-8">
        <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Preparazione della simulazione…</p>
      </div>
    </CenteredCard>
  );
}

function ErrorScreen({ message, onExit }: { message: string; onExit: () => void }) {
  return (
    <CenteredCard>
      <ShellHeader onExit={onExit} />
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-extrabold text-red-900 text-sm mb-1">Non posso avviare la simulazione</h3>
          <p className="text-xs text-red-800 font-semibold leading-relaxed">{message}</p>
        </div>
      </div>
      <button
        onClick={onExit}
        className="mt-6 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-2xl text-sm cursor-pointer"
      >
        Torna alla home
      </button>
    </CenteredCard>
  );
}

function IntroScreen({ payload, onBegin, onExit }: { payload: PrefetturaPayload; onBegin: () => void; onExit: () => void }) {
  return (
    <CenteredCard>
      <ShellHeader onExit={onExit} />
      <h3 className="text-2xl font-black text-slate-900 mb-3">Pronto a iniziare la simulazione?</h3>
      <p className="text-sm text-slate-600 font-semibold leading-relaxed mb-6">
        Affronterai tre sezioni consecutive come al test reale della Prefettura. <strong>Una volta avviato il timer di una sezione non si può mettere in pausa.</strong> Al termine vedrai il punteggio ponderato su 100 punti.
      </p>
      <div className="space-y-3 mb-8">
        {payload.sections.map((s, i) => (
          <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700">
                {s.id === 'ascolto' ? <Headphones className="w-4 h-4" /> : s.id === 'lettura' ? <BookOpen className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Sezione {i + 1}</p>
                <h4 className="font-extrabold text-slate-900 text-sm">{s.label}</h4>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-700">{s.durationSec / 60} min</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {s.id === 'scrittura' ? `${(s as WritingSection).points} pt` : `${(s as MCSection).questions.length} × ${(s as MCSection).pointsPerItem.toFixed(2)} pt`}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 text-xs font-semibold text-emerald-900 leading-relaxed">
        Soglia di promozione: <strong>{payload.passingPoints} / {payload.totalPoints}</strong>. Nessuna sezione orale.
      </div>
      <button
        onClick={onBegin}
        className="w-full bg-gradient-to-r from-emerald-600 to-red-600 hover:from-emerald-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-2xl text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
      >
        Inizia Sezione 1: Ascolto <ArrowRight className="w-4 h-4" />
      </button>
    </CenteredCard>
  );
}

function SectionIntro({
  payload,
  sectionIdx,
  onBegin,
  onExit,
}: {
  payload: PrefetturaPayload;
  sectionIdx: number;
  onBegin: () => void;
  onExit: () => void;
}) {
  const section = payload.sections[sectionIdx];
  const descriptions: Record<string, string> = {
    ascolto: 'Ascolta ogni brano cliccando sull\'icona dell\'altoparlante e rispondi alla domanda. Una volta avviato il timer, le domande non si possono mettere in pausa.',
    lettura: 'Leggi i testi e rispondi alle domande. I testi sono brevi e riferiti alla vita quotidiana e ai servizi pubblici.',
    scrittura: 'Scrivi una breve risposta seguendo la traccia indicata. Hai 10 minuti.',
  };
  const Icon = section.id === 'ascolto' ? Headphones : section.id === 'lettura' ? BookOpen : Edit3;
  return (
    <CenteredCard>
      <ShellHeader onExit={onExit} />
      <div className="text-center py-2">
        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
          Sezione {sectionIdx + 1} di 3
        </div>
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-50 to-red-50 rounded-2xl flex items-center justify-center text-slate-800 mb-4 border border-slate-200">
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">{section.label}</h3>
        <p className="text-sm text-slate-600 font-semibold leading-relaxed mb-6 max-w-lg mx-auto">{descriptions[section.id]}</p>
        <div className="inline-flex gap-3 mb-8">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold px-3 py-1.5 rounded-full">⏱ {section.durationSec / 60} minuti</span>
          <span className="bg-slate-100 text-slate-800 border border-slate-200 text-xs font-extrabold px-3 py-1.5 rounded-full">
            {section.id === 'scrittura' ? `${(section as WritingSection).points} pt` : `${(section as MCSection).questions.length} × ${(section as MCSection).pointsPerItem.toFixed(2)} pt`}
          </span>
        </div>
      </div>
      <button
        onClick={onBegin}
        className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
      >
        Avvia il timer e inizia <ArrowRight className="w-4 h-4" />
      </button>
    </CenteredCard>
  );
}

function TimerBadge({ secondsLeft }: { secondsLeft: number }) {
  const warning = secondsLeft <= 60;
  return (
    <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 font-mono text-sm font-bold ${warning ? 'bg-red-50 border-red-200 text-red-700 animate-pulse' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
      <Clock className={`w-4 h-4 ${warning ? 'text-red-600' : 'text-emerald-600'}`} /> {formatClock(secondsLeft)}
    </div>
  );
}

function MCQuestionScreen({
  sectionIcon,
  sectionLabel,
  sectionId,
  questionNum,
  questionTotal,
  secondsLeft,
  question,
  selectedIdx,
  onSelect,
  onNext,
  onPrev,
}: {
  sectionIcon: React.ReactNode;
  sectionLabel: string;
  sectionId: 'ascolto' | 'lettura';
  questionNum: number;
  questionTotal: number;
  secondsLeft: number;
  question: Question;
  selectedIdx?: number;
  onSelect: (idx: number) => void;
  onNext: () => void;
  onPrev?: () => void;
}) {
  const [speaking, setSpeaking] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop any in-flight playback when the question changes — otherwise an
  // ascolto MP3 from the previous question would keep playing into the next.
  useEffect(() => {
    stopTts();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setSpeaking(null);
  }, [question.id]);

  /**
   * Three-way playback:
   *   1. If the question has a cached audio URL (Phase 4 pipeline), play
   *      that MP3 via HTML5 <audio>. Realistic, exam-like.
   *   2. Otherwise, fall back to browser Web Speech API (Phase 2 behavior).
   *   3. iOS Safari requires playback to originate from a user gesture — our
   *      speaker button satisfies that. We catch the play() promise so a
   *      rejection (e.g. blocked autoplay) doesn't crash the component.
   */
  const handleSpeak = (text: string) => {
    if (question.audioUrl) {
      const el = audioRef.current;
      if (!el) return;
      if (speaking === text) {
        el.pause();
        el.currentTime = 0;
        setSpeaking(null);
        return;
      }
      el.currentTime = 0;
      el.play()
        .then(() => setSpeaking(text))
        .catch(err => {
          console.warn('[ascolto] audio.play() rejected:', err?.message);
          setSpeaking(null);
        });
      return;
    }
    if (speaking === text) {
      stopTts();
      setSpeaking(null);
      return;
    }
    setSpeaking(text);
    speakItalian(text, () => setSpeaking(null));
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-3xl border border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">{sectionIcon}</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Simulazione Prefettura</p>
            <p className="text-sm font-extrabold text-slate-900">{sectionLabel} · Domanda {questionNum} di {questionTotal}</p>
          </div>
        </div>
        <TimerBadge secondsLeft={secondsLeft} />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        {/* Audio prompt for Ascolto: render context (or question text if no context) as a speaker button */}
        {sectionId === 'ascolto' && (
          <div className="mb-5 bg-gradient-to-r from-emerald-50 to-emerald-50/30 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSpeak(question.context || question.questionText)}
              className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Ascolta"
            >
              {speaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <p className="text-xs text-emerald-900 font-bold leading-relaxed">
              {question.audioUrl
                ? 'Premi per ascoltare la registrazione. Puoi riascoltare se serve, poi rispondi alla domanda sotto.'
                : "Premi per ascoltare il brano (sintesi vocale; le registrazioni reali si aggiungono in background quando AUDIO_GEN_ENABLED è attivo)."}
            </p>
            {/* Cached MP3 audio element — only mounted when an audio URL exists.
                preload="metadata" keeps the page light; load happens on first play. */}
            {question.audioUrl && (
              <audio
                ref={audioRef}
                src={question.audioUrl}
                preload="metadata"
                onEnded={() => setSpeaking(null)}
                onError={() => setSpeaking(null)}
              />
            )}
          </div>
        )}

        {/* Lettura context block */}
        {sectionId === 'lettura' && question.context && (
          <div className="mb-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
            {question.context}
          </div>
        )}

        <h3 className="text-lg md:text-xl font-extrabold text-slate-900 mb-5 leading-snug whitespace-pre-line">{question.questionText}</h3>

        <div className="space-y-2.5 mb-6">
          {question.options.map((opt, i) => {
            const isSelected = selectedIdx === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(i)}
                className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold text-sm transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 mr-3 text-xs font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={!onPrev}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            ← Precedente
          </button>
          <button
            type="button"
            onClick={onNext}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-2xl text-sm cursor-pointer flex items-center gap-2"
          >
            {questionNum < questionTotal ? 'Avanti' : 'Concludi sezione'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
}

function ScritturaSection({
  prompt,
  secondsLeft,
  value,
  onChange,
  fieldValues,
  onChangeField,
  onSubmit,
}: {
  prompt: WritingPrompt;
  secondsLeft: number;
  value: string;
  onChange: (v: string) => void;
  fieldValues: Record<string, string>;
  onChangeField: (id: string, v: string) => void;
  onSubmit: () => void;
}) {
  const isModulo = prompt.kind === 'modulo' && prompt.fields && prompt.fields.length > 0;
  const wordCount = isModulo
    ? Object.values(fieldValues).join(' ').trim().split(/\s+/).filter(Boolean).length
    : value.trim().split(/\s+/).filter(Boolean).length;
  const filledFields = isModulo
    ? (prompt.fields || []).filter(f => (fieldValues[f.id] || '').trim().length > 0).length
    : 0;
  const totalFields = isModulo ? (prompt.fields || []).length : 0;
  const hasContent = isModulo ? filledFields > 0 : value.trim().length > 0;

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6 bg-white rounded-3xl border border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Simulazione Prefettura</p>
            <p className="text-sm font-extrabold text-slate-900">Scrittura · {isModulo ? 'Compilazione modulo' : 'Produzione scritta'}</p>
          </div>
        </div>
        <TimerBadge secondsLeft={secondsLeft} />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1">Traccia</p>
          <h3 className="text-lg font-extrabold text-slate-900 mb-2">{prompt.title}</h3>
          <p className="text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 border border-slate-200 rounded-2xl p-4">
            {prompt.promptText}
          </p>
          <p className="text-[11px] text-slate-500 font-bold mt-2">
            {isModulo ? `${filledFields} / ${totalFields} campi compilati` : `Lunghezza suggerita: ${prompt.targetWordCount}`}
          </p>
        </div>

        {isModulo ? (
          <div className="space-y-3">
            {(prompt.fields || []).map(field => {
              const v = fieldValues[field.id] || '';
              return (
                <div key={field.id}>
                  <label htmlFor={`pref_field_${field.id}`} className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    {field.label}
                  </label>
                  {field.type === 'longtext' ? (
                    <textarea
                      id={`pref_field_${field.id}`}
                      value={v}
                      onChange={e => onChangeField(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full resize-none bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 text-slate-800 placeholder-slate-400 font-semibold text-sm rounded-2xl p-3.5 focus:outline-none focus:ring-4 focus:ring-emerald-100/50"
                    />
                  ) : (
                    <input
                      id={`pref_field_${field.id}`}
                      type="text"
                      value={v}
                      onChange={e => onChangeField(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 text-slate-800 placeholder-slate-400 font-semibold text-sm rounded-2xl px-3.5 py-3 focus:outline-none focus:ring-4 focus:ring-emerald-100/50"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative">
            <textarea
              value={value}
              onChange={e => onChange(e.target.value)}
              rows={10}
              placeholder="Scrivi qui il tuo testo in italiano…"
              className="w-full resize-none bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 text-slate-800 placeholder-slate-400 font-semibold text-sm rounded-2xl p-5 focus:outline-none focus:ring-4 focus:ring-emerald-100/50"
            />
            <div className="absolute bottom-4 right-4 bg-slate-900/80 text-white font-mono text-[10px] font-black px-3 py-1 rounded-full">
              {wordCount} parole
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onSubmit}
          disabled={!hasContent}
          className="w-full bg-gradient-to-r from-emerald-600 to-red-600 hover:from-emerald-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          Consegna ed esci dalla simulazione <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </main>
  );
}

function SubmittingScreen() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="inline-block w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-5" />
      <h3 className="text-xl font-extrabold text-slate-900 mb-1">Il Professore sta correggendo l'elaborato…</h3>
      <p className="text-sm text-slate-600 font-semibold">Calcolo del punteggio finale su 100.</p>
    </main>
  );
}

function ResultsScreen({ breakdown, payload, onExit }: { breakdown: ScoreBreakdown; payload: PrefetturaPayload; onExit: () => void }) {
  const pct = (breakdown.totalPoints / payload.totalPoints) * 100;
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <ShellHeader onExit={onExit} hideExit />
      <section className="text-center mb-10">
        <div className={`inline-flex items-center gap-1.5 ${breakdown.passed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'} font-bold text-xs px-4 py-1.5 rounded-full mb-4 border`}>
          <Award className="w-4 h-4" /> {breakdown.passed ? 'PROMOSSO' : 'NON PROMOSSO'}
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
          {breakdown.totalPoints.toFixed(1)} <span className="text-slate-400 font-medium text-2xl">/ {payload.totalPoints}</span>
        </h2>
        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
          Soglia ufficiale: {payload.passingPoints} / {payload.totalPoints} ({Math.round((payload.passingPoints / payload.totalPoints) * 100)}%)
        </p>
        <div className="mt-6 max-w-md mx-auto">
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className={`h-full ${breakdown.passed ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{pct.toFixed(1)}%</p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <SectionScoreCard label="Ascolto" icon={<Headphones className="w-4 h-4" />} points={breakdown.ascolto.points} max={breakdown.ascolto.maxPoints} sub={`${breakdown.ascolto.correct} / ${breakdown.ascolto.total} corrette`} />
        <SectionScoreCard label="Lettura" icon={<BookOpen className="w-4 h-4" />} points={breakdown.lettura.points} max={breakdown.lettura.maxPoints} sub={`${breakdown.lettura.correct} / ${breakdown.lettura.total} corrette`} />
        <SectionScoreCard label="Scrittura" icon={<Edit3 className="w-4 h-4" />} points={breakdown.scrittura.weightedPoints} max={breakdown.scrittura.maxPoints} sub={`${breakdown.scrittura.rawScore} / 20 (grezzo)`} />
      </div>

      {breakdown.scrittura.evaluation && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Feedback Scrittura</h3>
          <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">{breakdown.scrittura.evaluation.coachingReport}</p>
          {breakdown.scrittura.evaluation.errors && breakdown.scrittura.evaluation.errors.length > 0 && (
            <div className="mt-4 space-y-2">
              {breakdown.scrittura.evaluation.errors.map((e, idx) => (
                <div key={idx} className="text-xs bg-red-50 border border-red-100 rounded-xl p-3">
                  <span className="line-through text-slate-400 font-bold">{e.original}</span>
                  <span className="text-slate-400 mx-2">→</span>
                  <span className="text-emerald-700 font-black">{e.correction}</span>
                  <span className="ml-2 bg-red-100 text-red-800 text-[8px] font-black uppercase px-2 py-0.5 rounded">{e.category}</span>
                  <p className="text-slate-600 mt-1 italic">{e.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={onExit}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl text-sm cursor-pointer flex items-center justify-center gap-2"
      >
        Torna alla home <ArrowRight className="w-4 h-4" />
      </button>
    </main>
  );
}

function SectionScoreCard({ label, icon, points, max, sub }: { label: string; icon: React.ReactNode; points: number; max: number; sub: string }) {
  const pct = max === 0 ? 0 : (points / max) * 100;
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-slate-700">
          {icon}
          <span className="text-xs font-black uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-[10px] font-bold text-slate-400">{sub}</span>
      </div>
      <p className="text-3xl font-black text-slate-900 mb-2">
        {points.toFixed(1)} <span className="text-base text-slate-400 font-medium">/ {max}</span>
      </p>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}
