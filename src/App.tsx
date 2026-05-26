/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Award, 
  RotateCcw, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Compass, 
  HelpCircle, 
  Send, 
  MessageSquare, 
  Clock, 
  ArrowRight, 
  Home, 
  BookMarked,
  Check, 
  ChevronRight, 
  Info, 
  BrainCircuit,
  Settings,
  AlertTriangle,
  Lightbulb,
  Layers,
  FileText,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Heart,
  Flame,
  Edit3,
  Landmark,
  X
} from 'lucide-react';
import { Question, QuizSession, StudyCard, CategoryStats } from './types';
import { curatedQuestions, getQuestionsForQuiz, shuffleArray } from './data/questions';
import { A2_WRITING_PROMPTS } from './data/writingPrompts';
import { getBrowserId } from './lib/browserId';
import { SimulazionePrefettura } from './components/SimulazionePrefettura';

// QCER A2 Practice Sentences for correct voice pronunciation exercises
const A2_PRONUNCIATION_CARDS = [
  {
    sentence: "Buongiorno, vorrei un cornetto alla crema e un cappuccino tiepido.",
    english: "Good morning, I would like a cream croissant and a lukewarm cappuccino.",
    tips: "Remember that 'cappuccino' has double 'p' and double 'c', and 'cornetto' has double 't'. Pronounce with Italian flow! 🥐"
  },
  {
    sentence: "Scusi, per andare alla stazione centrale devo girare a destra o a sinistra?",
    english: "Excuse me, to go to the central station do I have to turn right or left?",
    tips: "Pronounce 'stazione' cleanly as 'stat-zi-o-ne' and end 'sinistra' with clean crisp Italian vowels."
  },
  {
    sentence: "Oggi il tempo è bellissimo, c'è un sole meraviglioso e fa molto caldo.",
    english: "Today the weather is beautiful, there is a wonderful sun and it is very warm.",
    tips: "Sound out 'meraviglioso' with the Italian 'gli' glide (similar to the 'lli' sound in million)."
  },
  {
    sentence: "Mi fa male la testa da ieri sera, penso che prenderò un'aspirina.",
    english: "My head has been hurting since yesterday evening, I think I will take an aspirin.",
    tips: "Focus on double 's' in 'testa' and state 'ieri' with light initial sliding vowels."
  },
  {
    sentence: "Vorrei prenotare una camera singola con bagno per due notti, grazie.",
    english: "I would like to book a single room with private bathroom for two nights, thank you.",
    tips: "Pronounce the hard 'c' sound in 'camera' and soften the 'gn' sound in 'bagno' (similar to canyon)."
  },
  {
    sentence: "Sabato prossimo vado al mare in treno con la mia famiglia per riposare.",
    english: "Next Saturday I am going to the seaside by train with my family to relax.",
    tips: "Keep your pronunciation of 'famiglia' soft and clicky on the double 'g-l-i' glide."
  }
];

// QCER A2 Difficult/Crucial Vocabulary Dictionary with English Translations
const A2_DICTIONARY: Record<string, string> = {
  "postale": "related to post office / mail",
  "ufficio postale": "post office",
  "medico": "doctor",
  "giardino": "garden",
  "binario": "platform / track",
  "biblioteca": "library",
  "comunale": "municipal / public",
  "stati uniti": "United States",
  "spese": "shopping / groceries",
  "spesa": "shopping / expense",
  "scorso": "last / past",
  "ieri": "yesterday",
  "mentre": "while / whereas",
  "preparavo": "was preparing / making",
  "sentiva": "felt / was feeling",
  "stanca": "tired (feminine)",
  "stanco": "tired (masculine)",
  "da piccolo": "as a child",
  "vacanze": "holidays / vacations",
  "vacanza": "holiday / vacation",
  "estive": "summer (plural, feminine)",
  "puglia": "Apulia (region in Italy)",
  "chiave": "key",
  "sciopero": "strike",
  "biglietteria": "ticket office",
  "biglietto": "ticket",
  "biglietti": "tickets",
  "prenotare": "to book / reserve",
  "svegliarsi": "to wake up / awaken",
  "svegliata": "woken up (feminine)",
  "alloggio": "accommodation / lodging",
  "orario": "schedule / timetable",
  "passeggiata": "walk / stroll",
  "spiaggia": "beach",
  "metropolitana": "subway / metro / underground",
  "ritardo": "delay",
  "cancellato": "cancelled",
  "all'aperto": "outdoors / open-air",
  "consigliare": "to recommend / advise",
  "spiegare": "to explain",
  "dispiace": "sorry / standard apology",
  "allora": "then / at that time",
  "sconto": "discount",
  "portata": "course / dish",
  "antipasto": "appetizer",
  "contorno": "side dish",
  "mancia": "tip / gratuity",
  "conto": "bill / check / account",
  "prenotazione": "reservation / booking",
  "volo": "flight",
  "bagaglio": "baggage / luggage",
  "coppia": "couple / pair",
  "parcheggio": "parking / parking lot",
  "noleggiare": "to rent (car, bike, etc.)",
  "affittare": "to rent (apartment, house)",
  "comprare": "to buy / purchase",
  "trovare": "to find",
  "cercare": "to look for / search",
  "mostra": "exhibition / show",
  "spettacolo": "show / performance / spectacle",
  "museo": "museum",
  "ristorante": "restaurant",
  "cameriere": "waiter",
  "piatto": "dish & plate",
  "acqua frizzante": "sparkling water",
  "farmacia": "pharmacy / drugstore",
  "aeroportuale": "related to airport",
  "all'incrocio": "at the intersection / crossing",
  "voltare": "to turn",
  "girare": "to turn / rotate",
  "semaforo": "traffic light",
  "girare a destra": "turn right",
  "girare a sinistra": "turn left",
  "stazione": "station",
  "fermata": "bus/train stop",
  "chiesa": "church",
  "sindaco": "mayor",
  "piscina": "swimming pool",
  "autostop": "hitchhiking",
  "negozio": "shop / store",
  "pasticceria": "pastry shop / bakery",
  "panificio": "bakery",
  "macelleria": "butcher shop",
  "scarpe": "shoes",
  "vestito": "dress / suit",
  "saldi": "sales / clearance",
  "camicia": "shirt",
  "pantaloni": "pants / trousers",
  "giacca": "jacket",
  "prenotato": "booked / reserved",
  "scusami": "excuse me (informal)",
  "mi dispiace": "I'm sorry",
  "ho mal di testa": "I have a headache",
  "ingegnere": "engineer",
  "lavora": "works / is working",
  "laurea": "degree / graduation",
  "studente": "student",
  "viaggio": "trip / journey",
  "partenza": "departure",
  "arrivo": "arrival",
  "valigia": "suitcase",
  "passaporto": "passport",
  "compleanno": "birthday",
  "regalo": "gift / present",
  "festa": "party / celebration",
  "invitato": "guest / invited person",
  "auguri": "best wishes / congratulations",
  "capodanno": "New Year's Eve / New Year",
  "natale": "Christmas",
  "fegato": "liver / courage",
  "polmone": "lung",
  "stomaco": "stomach",
  "ricetta": "prescription / recipe / formula",
  "sciroppo": "syrup (cough syrup)",
  "pastiglia": "tablet / pill",
  "febbre": "fever",
  "raffreddore": "cold (illness)",
  "influenza": "flu / influence",
  "tosse": "cough",
  "starnutire": "to sneeze",
  "guarire": "to heal / recover",
  "malato": "sick / ill",
  "salute": "health / cheers!",
  "buon appetito": "enjoy your meal",
  "grazie mille": "thank you very much",
  "prego": "you're welcome / please",
  "per favore": "please",
  "per cortesia": "please (polite)",
  "buongiorno": "good morning / good day",
  "buonasera": "good evening",
  "buonanotte": "good night",
  "arrivederci": "goodbye (formal)",
  "ciao": "hello / hi / bye",
  "come stai": "how are you (informal)",
  "come sta": "how are you (formal)"
};

// Sort dictionary keys by length in descending order to match multi-word phrases first
const SORTED_A2_KEYS = Object.keys(A2_DICTIONARY).sort((a, b) => b.length - a.length);

function highlightDifficultWords(text: string): React.ReactNode {
  if (!text) return '';
  if (!/[a-zA-Z]/.test(text)) return text;

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const pattern = SORTED_A2_KEYS.map(key => {
    const escaped = escapeRegExp(key);
    if (escaped.includes("'") || escaped.includes("’")) {
      return escaped.replace(/['’]/g, "['’]");
    }
    return escaped;
  }).join('|');

  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');
  const parts = text.split(regex);
  if (parts.length === 1) return text;

  let keyCounter = 0;
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      const lowerPart = part.toLowerCase().replace(/’/g, "'");
      const matchedKey = SORTED_A2_KEYS.find(key => key.toLowerCase() === lowerPart);

      if (matchedKey) {
        const translation = A2_DICTIONARY[matchedKey];
        return (
          <span 
            key={`tooltip-${index}-${keyCounter++}`} 
            className="relative group inline-block cursor-help border-b-2 border-dotted border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-slate-950 font-bold px-1 rounded transition-all duration-150"
          >
            {part}
            <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-950 border border-slate-800 text-white text-[10px] md:text-xs rounded-xl shadow-2xl font-semibold tracking-wide z-50 pointer-events-none transform scale-95 group-hover:scale-100 transition-all duration-150 flex flex-col items-center gap-1">
              <span className="font-bold text-[8px] uppercase tracking-wider text-emerald-400">TRADUZIONE A2</span>
              <span className="whitespace-nowrap text-white font-sans">{translation}</span>
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950" />
            </span>
          </span>
        );
      }
    }
    return part;
  });
}

const parseInlineMarkdown = (inlineText: string, mode: 'light' | 'dark' | undefined = 'dark'): React.ReactNode => {
  if (!inlineText) return '';

  const boldParts = inlineText.split(/\*\*([^*]+)\*\*/g);

  return boldParts.map((boldPart, bIdx) => {
    const isBold = bIdx % 2 === 1;

    const codeParts = boldPart.split(/`([^`]+)`/g);
    const renderedParts = codeParts.map((codePart, cIdx) => {
      const isCode = cIdx % 2 === 1;
      if (isCode) {
        return (
          <code key={cIdx} className={`px-1.5 py-0.5 font-mono text-[11px] rounded-md ${mode === 'light' ? 'bg-white/10 text-emerald-100 border border-white/5' : 'bg-slate-100 text-slate-850 border border-slate-200'}`}>
            {codePart}
          </code>
        );
      }
      return highlightDifficultWords(codePart);
    });

    if (isBold) {
      return (
        <strong key={bIdx} className={`font-black ${mode === 'light' ? 'text-white underline decoration-emerald-300 decoration-2' : 'text-slate-950 underline decoration-emerald-500 decoration-2'}`}>
          {renderedParts}
        </strong>
      );
    } else {
      return <React.Fragment key={bIdx}>{renderedParts}</React.Fragment>;
    }
  });
};

const MiniMarkdown: React.FC<{ text: string; mode?: 'light' | 'dark' }> = ({ text, mode = 'dark' }) => {
  if (!text) return null;

  const typedMode = mode as 'light' | 'dark';
  const lines = text.split('\n');

  return (
    <div className={`space-y-3 font-semibold leading-relaxed leading-sans ${typedMode === 'light' ? 'text-emerald-50' : 'text-slate-700'}`}>
      {lines.map((line, lIdx) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return <div key={lIdx} className="h-1.5" />;

        // Check for Headers
        if (trimmedLine.startsWith('###')) {
          const headerText = trimmedLine.replace(/^###\s*/, '');
          return (
            <h4 key={lIdx} className={`text-xs md:text-sm font-black uppercase tracking-wider mt-4 mb-2 px-3 py-1 rounded inline-block ${typedMode === 'light' ? 'bg-white/10 text-white' : 'bg-slate-150 text-slate-800 border border-slate-200 shadow-sm'}`}>
              {parseInlineMarkdown(headerText, typedMode)}
            </h4>
          );
        }
        if (trimmedLine.startsWith('##') || trimmedLine.startsWith('#')) {
          const headerText = trimmedLine.replace(/^#+\s*/, '');
          return (
            <h3 key={lIdx} className={`text-sm md:text-base font-black border-b pb-1.5 mt-4 mb-3 ${typedMode === 'light' ? 'border-white/10 text-white' : 'border-slate-150 text-slate-950'}`}>
              {parseInlineMarkdown(headerText, typedMode)}
            </h3>
          );
        }

        // Bullet lists
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          const itemText = trimmedLine.replace(/^[-*]\s*/, '');
          return (
            <div key={lIdx} className="flex items-start gap-2 pl-2">
              <span className={`shrink-0 select-none font-bold ${typedMode === 'light' ? 'text-emerald-300' : 'text-emerald-600'}`}>✓</span>
              <p className="flex-grow text-xs md:text-sm">
                {parseInlineMarkdown(itemText, typedMode)}
              </p>
            </div>
          );
        }

        // Numbered lists
        const numMatch = trimmedLine.match(/^(\d+)\.\s+/);
        if (numMatch) {
          const itemText = trimmedLine.slice(numMatch[0].length);
          const num = numMatch[1];
          return (
            <div key={lIdx} className="flex items-start gap-2.5 pl-2">
              <span className={`text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold ${typedMode === 'light' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700 border border-slate-250'}`}>
                {num}
              </span>
              <p className="flex-grow text-xs md:text-sm">
                {parseInlineMarkdown(itemText, typedMode)}
              </p>
            </div>
          );
        }

        // Plain paragraph
        return (
          <p key={lIdx} className="text-xs md:text-sm">
            {parseInlineMarkdown(trimmedLine, typedMode)}
          </p>
        );
      })}
    </div>
  );
};

// Beautiful built-in study card reference data for Italian A2
const A2_STUDY_CARDS: StudyCard[] = [
  {
    id: "sc_1",
    title: "Passato Prossimo - Essere o Avere?",
    grammarTopic: "Ausiliari nel Passato",
    explanation: "Transitive verbs always take 'avere'. Intransitive verbs (especially of movement or status) and reflexive verbs take 'essere'. Remember that when using 'essere', the past participle MUST agree in gender and number with the subject!",
    examples: [
      { italian: "Ieri sera Luigi è andato a casa di Chiara.", english: "Yesterday evening Luigi went to Chiara's house. (Luigi = masc. sing, ends in -o)" },
      { italian: "Le ragazze sono andate in centro.", english: "The girls went downtown. (Le ragazze = fem. plur, ends in -ate)" },
      { italian: "Ho mangiato una pizza eccellente.", english: "I ate an excellent pizza. (Mangiato = transitive, takes avere, no agreement)" }
    ],
    tips: ["Verbs like andare, venire, uscire, salire, scendere, restare, and all reflexive verbs like svegliarsi require ESSERE."]
  },
  {
    id: "sc_2",
    title: "Preposizioni Articolate - The Grid",
    grammarTopic: "Preposizioni",
    explanation: "Prepositions (di, a, da, in, su) combine together with definite articles (il, lo, la, i, gli, le) to form single words. For example, 'in' + 'il' = 'nel', and 'da' + 'gli' = 'negli'.",
    examples: [
      { italian: "Vado in biblioteca.", english: "I go to the library (no article needed for general rooms/spaces)." },
      { italian: "Vado nella biblioteca della scuola.", english: "I go to the school library (specifically defined, takes in + la = nella)." },
      { italian: "Abito negli Stati Uniti.", english: "I live in the United States (in + gli = negli)." }
    ],
    tips: ["Locations ending in '-teca' (biblioteca), '-ia' (pizzeria), or countries ending in vowels generally take basic 'in' unless modified by a specification."]
  },
  {
    id: "sc_3",
    title: "I Pronomi Diretti vs Indiretti",
    grammarTopic: "Pronomi",
    explanation: "Direct object pronouns replace WHO or WHAT is receiving the action directly (mi, ti, lo, la, ci, vi, li, le). Indirect object pronouns replace 'TO WHOM' or 'FOR WHOM' (mi, ti, gli, le, ci, vi, loro).",
    examples: [
      { italian: "Compri le mele? — Sì, le compro.", english: "Do you buy the apples? — Yes, I buy them. (Direct: le)" },
      { italian: "Telefoni a Marco? — Sì, gli telefono.", english: "Do you call Marco? — Yes, I call him. (Indirect: gli = to him)" },
      { italian: "Ho incontrato Lucia e le ho dato il libro.", english: "I met Lucia and gave her the book. (le = to her)" }
    ],
    tips: ["Check the verb construction. Standard verbs like 'consigliare', 'inviare', 'regalare' take indirect prepositions ('a qualcuno')."]
  },
  {
    id: "sc_4",
    title: "I Pronomi Ci e Ne",
    grammarTopic: "Ci e Ne",
    explanation: "We use 'ci' to replace a place (locative) or with phrases starting with 'a/su'. We use 'ne' to replace quantities (some, of them, about it) or after sentences starting with 'di'.",
    examples: [
      { italian: "Sei stato a Roma? — Sì, ci sono stato due volte.", english: "Have you been to Rome? — Yes, I have been there twice. (ci = there)" },
      { italian: "Quanti caffè bevi? — Ne bevo due.", english: "How many coffees do you drink? — I drink two of them. (ne = of them/quantity)" },
      { italian: "Hai paura di parlare in pubblico? — No, non ne ho paura.", english: "Are you afraid of speaking in public? — No, I am not afraid of it. (ne = of it/di)" }
    ],
    tips: ["If there is a number or word like 'molti/pochi' at the end, use 'ne'. If it is about going or staying somewhere, use 'ci'."]
  },
  {
    id: "sc_5",
    title: "Struttura Esami CILS & PLIDA A2",
    grammarTopic: "Guida alla Certificazione",
    explanation: "Gli esami CILS (Siena) e PLIDA (Dante Alighieri) per il livello A2 testano le tue abilità pratiche in contesti quotidiani. CILS include l'accordo degli aggettivi nel testo (Prova 1), coniugazione verbi (Prova 2) e cloze multiplo (Prova 3). PLIDA include l'abbinamento lavoro e il completamento volantini pubblicitari.",
    examples: [
      { italian: "L'agriturismo si trova su una dolce collina.", english: "Adjective Agreement: 'collina' (fem. sing.) pairs with '(dolce)'." },
      { italian: "Domenica scorsa è stata una bella giornata.", english: "Verb conjugation: Finished past action uses passato prossimo 'è stata'." },
      { italian: "Cerco un lavoro part-time nel pomeriggio.", english: "Job hunting: Matching key criteria (afternoon study vs afternoon work shifts)." }
    ],
    tips: ["Nelle prove di lettura e ascolto della CILS le opzioni di risposta sono sempre TRE (A, B, C). Concentrati sui sinonimi usati nei testi per trovare la risposta giusta!"]
  }
];

// Beautiful built-in Italian A2 vocabulary flashcards matching key topics
const A2_VOCAB_FLASHCARDS = [
  {
    id: "fc_1",
    word: "Alloggio",
    translation: "Accommodation / Lodging",
    category: "Viaggi & Hotel",
    pronunciation: "al-lod-jo",
    example: "Abbiamo prenotato un alloggio economico vicino al centro storico.",
    exampleTranslation: "We booked a cheap accommodation near the historical center."
  },
  {
    id: "fc_2",
    word: "Sconto",
    translation: "Discount",
    category: "Spesa & Shopping",
    pronunciation: "scon-to",
    example: "C'è uno sconto del venti percento su tutti i vestiti estivi.",
    exampleTranslation: "There is a twenty percent discount on all summer clothes."
  },
  {
    id: "fc_3",
    word: "Sciopero",
    translation: "Strike",
    category: "Viaggi & Trasporti",
    pronunciation: "sho-pe-ro",
    example: "A causa dello sciopero dei treni, dobbiamo viaggiare in auto.",
    exampleTranslation: "Due to the train strike, we have to travel by car."
  },
  {
    id: "fc_4",
    word: "Disponibile",
    translation: "Available",
    category: "Conversazione",
    pronunciation: "dis-po-ni-bi-le",
    example: "Questo tavolo all'aperto è disponibile per stasera.",
    exampleTranslation: "This outdoor table is available for tonight."
  },
  {
    id: "fc_5",
    word: "Bilocale",
    translation: "Two-room apartment",
    category: "Casa & Abitare",
    pronunciation: "bi-lo-ca-le",
    example: "In affitto c'è un delizioso bilocale arredato con balcone vista mare.",
    exampleTranslation: "There is a lovely furnished two-room apartment for rent with a sea-view balcony."
  },
  {
    id: "fc_6",
    word: "Cornetto",
    translation: "Croissant",
    category: "Cibo & Ristorante",
    pronunciation: "cor-net-to",
    example: "Prendo un cornetto alla crema calda e un succo d'arancia.",
    exampleTranslation: "I'll have a croissant with hot custard and an orange juice."
  },
  {
    id: "fc_7",
    word: "Sciroppo",
    translation: "Syrup / Medicine",
    category: "Salute",
    pronunciation: "shi-rop-po",
    example: "Il medico mi ha consigliato uno sciroppo per calmare la tosse.",
    exampleTranslation: "The doctor recommended a syrup to soothe my cough."
  },
  {
    id: "fc_8",
    word: "Spuntino",
    translation: "Snack",
    category: "Cibo & Ristorante",
    pronunciation: "spun-ti-no",
    example: "I bambini fanno sempre uno spuntino con frutta e yogurt nel pomeriggio.",
    exampleTranslation: "Children always have a snack with fruit and yogurt in the afternoon."
  },
  {
    id: "fc_9",
    word: "Abbigliamento",
    translation: "Clothing / Apparel",
    category: "Spesa & Shopping",
    pronunciation: "ab-bi-glia-men-to",
    example: "C'è un grande negozio di abbigliamento sportivo vicino alla stazione.",
    exampleTranslation: "There is a large sports clothing store near the station."
  },
  {
    id: "fc_10",
    word: "Spiaggia",
    translation: "Beach",
    category: "Tempo Libero",
    pronunciation: "spiad-ja",
    example: "Domenica prossima andiamo tutti in spiaggia a prendere il sole.",
    exampleTranslation: "Next Sunday we are all going to the beach to sunbathe."
  },
  {
    id: "fc_11",
    word: "Biglietto",
    translation: "Ticket",
    category: "Viaggi & Trasporti",
    pronunciation: "bi-gliet-to",
    example: "Devo fare il biglietto per l'autobus prima di salire a bordo.",
    exampleTranslation: "I must buy the bus ticket before getting on board."
  },
  {
    id: "fc_12",
    word: "Prenotazione",
    translation: "Reservation / Booking",
    category: "Viaggi & Hotel",
    pronunciation: "pre-no-ta-zio-ne",
    example: "La nostra prenotazione per l'hotel è confermata da ieri sera.",
    exampleTranslation: "Our hotel reservation has been confirmed since yesterday evening."
  }
];


async function reportQuestion(questionId: string, reason?: string): Promise<boolean> {
  try {
    const res = await fetch('/api/questions/flag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, reason }),
    });
    const data = await res.json();
    return !!data?.success;
  } catch (err) {
    console.warn('[reportQuestion] failed:', err);
    return false;
  }
}

export default function App() {
  // Navigation states
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'quiz' | 'results' | 'prefettura'>('menu');
  const [examMode, setExamMode] = useState<'practice' | 'exam' | 'prefettura'>('practice');
  const [showPrefetturaInfo, setShowPrefetturaInfo] = useState(false);
  const [examType, setExamType] = useState<string>('all');
  const [activeBentoTab, setActiveBentoTab] = useState<'questions' | 'study-guide' | 'tutor-chat' | 'vocab-game' | 'voice-practice' | 'flashcards' | 'writing'>('questions');

  // Flashcards Game States
  const [currentFlashIndex, setCurrentFlashIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCardIds, setKnownCardIds] = useState<Record<string, boolean>>({});
  const [practiceCardIds, setPracticeCardIds] = useState<Record<string, boolean>>({});
  const [flashcardsFilter, setFlashcardsFilter] = useState<'all' | 'known' | 'practice'>('all');

  // A2 Pronunciation/Speech Challenge State
  const [selectedVoiceCardIdx, setSelectedVoiceCardIdx] = useState(0);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [pronunciationFeedback, setPronunciationFeedback] = useState("");
  const [voicePoints, setVoicePoints] = useState(0);

  // Quiz Engine State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [resultsFilter, setResultsFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());

  const handleFlagQuestion = async (questionId: string) => {
    if (!questionId || flaggedIds.has(questionId)) return;
    // Optimistic update — server result doesn't affect UI either way
    setFlaggedIds(prev => {
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
    const ok = await reportQuestion(questionId);
    setAiGenerationToast(ok
      ? '🚩 Grazie! La domanda è stata segnalata per revisione.'
      : '⚠️ Segnalazione non inviata, riprova più tardi.');
    setTimeout(() => setAiGenerationToast(null), 4000);
  };
  const [savedExplanations, setSavedExplanations] = useState<Record<string, string>>({});
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [timer, setTimer] = useState(3600); // 1 hour for exam mode
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);

  // Stats / Tracking
  const [localStreak, setLocalStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [hasApiKey, setHasApiKey] = useState(true);

  // Dynamic AI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAiExplanation, setCurrentAiExplanation] = useState<string | null>(null);
  const [isAiExplaining, setIsAiExplaining] = useState(false);
  const [coachingFeedback, setCoachingFeedback] = useState<string | null>(null);
  const [isCoachingLoading, setIsCoachingLoading] = useState(false);
  const [aiGenerationToast, setAiGenerationToast] = useState<string | null>(null);

  // Italian Tutor Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: "Ciao! Benvenuto! I am Professore, your personal AI Italian Tutor. Ask me any question about vocabulary, prepositions, tenses, or write some Italian and I'll review it for you!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Selected study card ID
  const [selectedCardId, setSelectedCardId] = useState<string>("sc_1");

  // A2 Writing Exercise (Text Production) States
  const [currentWritingIdx, setCurrentWritingIdx] = useState(0);
  const [studentWritingText, setStudentWritingText] = useState("");
  const [writingEvaluation, setWritingEvaluation] = useState<any | null>(null);
  const [isWritingEvaluating, setIsWritingEvaluating] = useState(false);
  const [writingErrorMsg, setWritingErrorMsg] = useState("");

  // A2 Vocabulary Matcher Game State
  const [vocabGamePairs, setVocabGamePairs] = useState<{ id: string; italian: string; english: string; matched: boolean }[]>([]);
  const [shuffledItal, setShuffledItal] = useState<string[]>([]);
  const [shuffledEng, setShuffledEng] = useState<string[]>([]);
  const [selectedItWord, setSelectedItWord] = useState<string | null>(null);
  const [selectedEngWord, setSelectedEngWord] = useState<string | null>(null);
  const [vocabGameScore, setVocabGameScore] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [wrongMatch, setWrongMatch] = useState<{ it: string; eng: string } | null>(null);

  const initVocabGame = () => {
    // Select 5 random items from SORTED_A2_KEYS / A2_DICTIONARY
    const keys = [...SORTED_A2_KEYS];
    const shuffledKeys = keys.sort(() => 0.5 - Math.random());
    const selectedKeys = shuffledKeys.slice(0, 5);
    
    const pairs = selectedKeys.map((key, index) => ({
      id: `pair_${index}_${Date.now()}`,
      italian: key,
      english: A2_DICTIONARY[key],
      matched: false
    }));

    setVocabGamePairs(pairs);
    // Shuffle lists of Italian & English
    setShuffledItal(pairs.map(p => p.italian).sort(() => 0.5 - Math.random()));
    setShuffledEng(pairs.map(p => p.english).sort(() => 0.5 - Math.random()));
    setSelectedItWord(null);
    setSelectedEngWord(null);
    setMatchedCount(0);
    setWrongMatch(null);
  };

  const handleSelectItWord = (word: string) => {
    if (wrongMatch) setWrongMatch(null);
    setSelectedItWord(word);
    speakItalian(word);

    // If English was already highlighted, check it
    if (selectedEngWord) {
      checkMatch(word, selectedEngWord);
    }
  };

  const handleSelectEngWord = (word: string) => {
    if (wrongMatch) setWrongMatch(null);
    setSelectedEngWord(word);

    // If Italian was already highlighted, check it
    if (selectedItWord) {
      checkMatch(selectedItWord, word);
    }
  };

  const checkMatch = (itWord: string, engWord: string) => {
    const isCorrect = vocabGamePairs.some(p => p.italian === itWord && p.english === engWord);
    if (isCorrect) {
      setVocabGamePairs(prev => prev.map(p => p.italian === itWord ? { ...p, matched: true } : p));
      setMatchedCount(prev => {
        const next = prev + 1;
        if (next === 5) {
          setVocabGameScore(s => s + 5);
        }
        return next;
      });
      setSelectedItWord(null);
      setSelectedEngWord(null);
    } else {
      setWrongMatch({ it: itWord, eng: engWord });
      setTimeout(() => {
        setWrongMatch(null);
        setSelectedItWord(null);
        setSelectedEngWord(null);
      }, 700);
    }
  };

  useEffect(() => {
    initVocabGame();
  }, []);

  // TTS State
  const [currentlySpeaking, setCurrentlySpeaking] = useState<string | null>(null);
  // Cached audio element used when a question has a pre-generated MP3 (set by
  // Phase 6's seed-audio pipeline). When present we play the file via HTML5
  // <audio> instead of Web Speech — better Italian voice, exam-realistic.
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Speak an Italian snippet. If `audioUrl` is provided AND points to a real
   * cached MP3, play that via HTML5 <audio> (no TTS cost, native voice).
   * Otherwise fall back to the browser's Web Speech API.
   *
   * Both paths share the same `currentlySpeaking` UI state so the speaker
   * icons toggle correctly regardless of which engine is playing.
   */
  const speakItalian = (text: string, audioUrl?: string) => {
    // Toggle-off — if we're already speaking exactly this text, stop both engines.
    if (currentlySpeaking === text) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current.currentTime = 0;
      }
      setCurrentlySpeaking(null);
      return;
    }

    // Cut off whatever's playing first.
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
    }

    // Branch 1: cached MP3 path — preferred for Ascolto.
    if (audioUrl) {
      const el = audioElRef.current ?? new Audio();
      audioElRef.current = el;
      el.src = audioUrl;
      el.onended = () => setCurrentlySpeaking(prev => (prev === text ? null : prev));
      el.onerror = () => setCurrentlySpeaking(prev => (prev === text ? null : prev));
      setCurrentlySpeaking(text);
      el.play().catch(err => {
        // Autoplay policies on iOS Safari can reject .play() if not initiated
        // by a user gesture — our speaker button satisfies that, but just in
        // case, clear the speaking state so the icon doesn't get stuck.
        console.warn('[audio] play() rejected:', err?.message);
        setCurrentlySpeaking(prev => (prev === text ? null : prev));
      });
      return;
    }

    // Branch 2: Web Speech TTS fallback.
    if (!('speechSynthesis' in window)) return;

    // Clean up text if it contains markdown or special symbols inside prompt
    let cleanedText = text
      .replace(/\[\d+\]/g, '')   // strip CILS slot markers like [1], [12]
      .replace(/[\r\n]+/g, ' ')  // newlines (dialog turns, multi-line passages) → space for continuous utterance
      .replace(/_+/g, ' ... ')   // fill-in-the-blank underscores → ellipsis for better speech pacing
      .replace(/[*#`]/g, '')
      .replace(/\s{2,}/g, ' ')   // collapse any double spaces introduced by the strips above
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'it-IT';

    // Try to find Italian voice
    const voices = window.speechSynthesis.getVoices();
    const italianVoice = voices.find(voice => voice.lang.toLowerCase().includes('it'));
    if (italianVoice) {
      utterance.voice = italianVoice;
    }

    // Slow down speech rate slightly so A2 level language learners can easily follow
    utterance.rate = 0.80;

    utterance.onend = () => {
      setCurrentlySpeaking(null);
    };

    utterance.onerror = () => {
      setCurrentlySpeaking(null);
    };

    setCurrentlySpeaking(text);
    window.speechSynthesis.speak(utterance);
  };

  // Stop any in-flight playback when the active question changes. Without
  // this the previous Ascolto MP3 (or TTS utterance) would keep playing into
  // the new question. Mirrors the same logic inside SimulazionePrefettura.
  useEffect(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
    }
    setCurrentlySpeaking(null);
  }, [currentIndex, questions]);

  const startSpeechRecognition = () => {
    if (isRecognizing) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognizedText("Dettatura vocale nativa non supportata su questo browser. Usa il bottone 'Simula Pronuncia Esatta' o 'Simula Pronuncia con Errori' sotto per testare il sistema di feedback!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'it-IT';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecognizing(true);
        setRecognizedText("Registrazione... parla ora chiaramente! 🎤");
        setPronunciationScore(null);
        setPronunciationFeedback("");
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        setIsRecognizing(false);
        if (event.error === 'not-allowed') {
          setRecognizedText("Permesso microfono negato. Abilita i permessi nel browser o usa i comandi per simulare la dizione.");
        } else {
          setRecognizedText(`Connessione audio interrotta (${event.error}). Usa la simulazione.`);
        }
      };

      recognition.onend = () => {
        setIsRecognizing(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setRecognizedText(transcript);
        evaluatePronunciation(transcript, A2_PRONUNCIATION_CARDS[selectedVoiceCardIdx].sentence);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecognizing(false);
    }
  };

  const evaluatePronunciation = (spoken: string, target: string) => {
    const normalizeStr = (str: string) => {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // removes accent variations
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "") // removes punctuation
        .replace(/\s+/g, " ")
        .trim();
    };

    const normSpoken = normalizeStr(spoken);
    const normTarget = normalizeStr(target);

    const spokenWords = normSpoken.split(" ");
    const targetWords = normTarget.split(" ");

    let matchedWordsCount = 0;
    targetWords.forEach(word => {
      if (spokenWords.includes(word)) {
        matchedWordsCount++;
      }
    });

    const score = Math.round((matchedWordsCount / targetWords.length) * 100);
    setPronunciationScore(score);

    if (score >= 82) {
      setPronunciationFeedback("Magnifico! Pronuncia corretta e intonazione A2 impeccabile! Hai ottenuto +5 punti! 🌟");
      setVoicePoints(prev => prev + 5);
    } else if (score >= 50) {
      setPronunciationFeedback("Buono! Gran parte della frase è corretta. Clicca sul tasto 🔊 per riascoltare e perfezionare le doppie consonanti o i suoni di dizione!");
    } else {
      setPronunciationFeedback("Hmm, alcune parole non sono state comprese. Consigliamo di riascoltare il Professore AI, studiare i consigli e scandire le sillabe lentamente.");
    }
  };

  const simulateVoiceRecording = (simulateCorrect: boolean) => {
    setIsRecognizing(true);
    setRecognizedText("Analisi audio in corso...");
    setPronunciationScore(null);
    setPronunciationFeedback("");
    
    setTimeout(() => {
      setIsRecognizing(false);
      const targetText = A2_PRONUNCIATION_CARDS[selectedVoiceCardIdx].sentence;
      if (simulateCorrect) {
        setRecognizedText(targetText);
        evaluatePronunciation(targetText, targetText);
      } else {
        // Simulation with slight grammar errors
        let rawWords = targetText.split(" ");
        if (rawWords.length > 3) {
          rawWords[1] = "vorrei ... mmm ... voglio ..."; // hesitation
          rawWords[2] = "cornetto d'oro"; // slight errors
        }
        const brokenText = rawWords.join(" ");
        setRecognizedText(brokenText);
        evaluatePronunciation(brokenText, targetText);
      }
    }, 1200);
  };

  // Stop TTS on navigation, quiz change or tab change
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setCurrentlySpeaking(null);
    }
  }, [currentScreen, currentIndex, activeBentoTab]);

  // Load API status on mount
  useEffect(() => {
    fetch('/api/config/status')
      .then(res => res.json())
      .then(data => setHasApiKey(data.hasApiKey))
      .catch(() => setHasApiKey(true));
  }, []);

  // Synchronize currentIndex with its ref for reliable background async queries
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Timer countdown handler
  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            handleCompleteExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timer]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Starts a new quiz session of 50 questions
  const handleStartQuiz = async (selectedMode: 'practice' | 'exam' | 'prefettura') => {
    setExamMode(selectedMode);
    setCurrentIndex(0);
    setUserAnswers({});
    setResultsFilter('all');
    setSavedExplanations({});
    setCurrentAiExplanation(null);
    setCoachingFeedback(null);
    setIsQuizCompleted(false);
    const isTimed = selectedMode === 'exam' || selectedMode === 'prefettura';
    setTimer(isTimed ? 3600 : 0);
    setTimerActive(isTimed);
    setLocalStreak(0);
    setActiveBentoTab('questions');

    // The Prefettura simulation has its own self-contained screen + state
    // machine + per-section timers, and fetches its own structured payload.
    // We just hand off to it.
    if (selectedMode === 'prefettura') {
      setIsGenerating(false);
      setCurrentScreen('prefettura');
      return;
    }

    // No blocking generator screen: Transition immediately!
    setIsGenerating(false);
    setCurrentScreen('quiz');

    try {
      // Step 1: Show a baseline deck instantly so the user enters the quiz with
      // zero perceived latency. This is the in-process static set; the server's
      // deduped set replaces it as soon as the network round-trip completes.
      const baseline = getQuestionsForQuiz(selectedMode, examType);
      setQuestions(baseline);

      // Step 2: Ask the server for the proper, browser-aware deck. The server
      // excludes recently-seen IDs and may fire a background Gemini top-up.
      const browserId = getBrowserId();
      fetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ browserId, mode: selectedMode, examType, count: 50 }),
      })
        .then(res => res.json())
        .then(data => {
          if (!data?.success || !Array.isArray(data.questions) || data.questions.length === 0) return;
          // Replace only items the user has not seen yet — keep `completedAndActive`
          // stable so the on-screen card doesn't shift if Step 1 already rendered.
          setQuestions(prev => {
            const currentIdx = currentIndexRef.current;
            const completedAndActive = prev.slice(0, currentIdx + 1);
            const seenIds = new Set(completedAndActive.map(q => q?.id).filter(Boolean));
            const fresh = (data.questions as Question[]).filter(q => q && !seenIds.has(q.id));
            const combined = [...completedAndActive, ...fresh];
            return combined.slice(0, 50);
          });
          if (data.questions.length > baseline.length / 2) {
            setAiGenerationToast(`✨ Caricate ${data.questions.length} domande dal banco persistente`);
            setTimeout(() => setAiGenerationToast(null), 4000);
          }
        })
        .catch(apiErr => {
          console.warn('quiz/start request failed; continuing with local baseline.', apiErr);
        });
    } catch (err) {
      console.error("Critical error in start of quiz:", err);
      setQuestions(getQuestionsForQuiz(selectedMode, examType));
    }
  };

  // Handles options clicks
  const handleSelectOption = async (optionIndex: number) => {
    const currentQuestion = questions[currentIndex];
    const questionId = currentQuestion.id;

    // Reject changes if already answered in practicing, or exam is completed
    if (userAnswers[questionId] !== undefined && examMode === 'practice') return;

    // Record answer
    const updatedAnswers = {
      ...userAnswers,
      [questionId]: optionIndex
    };
    setUserAnswers(updatedAnswers);

    // Update streak metrics in Practice Mode
    if (examMode === 'practice') {
      const isCorrect = optionIndex === currentQuestion.correctAnswerIndex;
      if (isCorrect) {
        const nextStreak = localStreak + 1;
        setLocalStreak(nextStreak);
        if (nextStreak > maxStreak) {
          setMaxStreak(nextStreak);
        }
      } else {
        setLocalStreak(0);
      }

      // Automatically generate AI Deep explanation from our offline system, or fetch details if requested
      setCurrentAiExplanation(currentQuestion.explanation);
    }
  };

  // Triggers Premium Realtime AI Coaching Explanation from Gemini API for the current selected question
  const fetchDeepAiExplanation = async () => {
    const currentQuestion = questions[currentIndex];
    const selectedIndex = userAnswers[currentQuestion.id];
    const selectedOptionText = selectedIndex !== undefined ? currentQuestion.options[selectedIndex] : null;

    setIsAiExplaining(true);
    setCurrentAiExplanation(null);

    try {
      const res = await fetch('/api/explain-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          selectedOption: selectedOptionText
        })
      });
      const data = await res.json();
      if (data.success && data.explanation) {
        setCurrentAiExplanation(data.explanation);
      } else {
        setCurrentAiExplanation(currentQuestion.explanation);
      }
    } catch (err) {
      setCurrentAiExplanation(currentQuestion.explanation);
    } finally {
      setIsAiExplaining(false);
    }
  };

  // Navigation: Next Question
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentAiExplanation(null);
    } else if (examMode === 'practice') {
      // In practice mode, reaching the end can directly conclude the report
      handleCompleteExam();
    }
  };

  // Navigation: Previous Question (Only in practice mode for easy review)
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setCurrentAiExplanation(null);
    }
  };

  // Conclude the Test and load Results Screen
  const handleCompleteExam = async () => {
    setTimerActive(false);
    setIsQuizCompleted(true);
    setCurrentScreen('results');

    // Categorize mistakes to compile the analysis
    const mistakes = questions
      .map(q => ({
        question: q,
        selectedIndex: userAnswers[q.id]
      }))
      .filter(m => m.selectedIndex !== undefined && m.selectedIndex !== m.question.correctAnswerIndex);

    // Fetch dynamic coaching report if we have API Keys
    if (hasApiKey && mistakes.length > 0) {
      setIsCoachingLoading(true);
      try {
        const res = await fetch('/api/analyze-mistakes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mistakes })
        });
        const data = await res.json();
        if (data.success) {
          setCoachingFeedback(data.feedback);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsCoachingLoading(false);
      }
    }
  };

  // Chat tutor messaging handle
  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatSending) return;

    const userMsgText = chatInput;
    setChatInput("");
    setIsChatSending(true);

    // Optimistically update chat
    setChatMessages(prev => [...prev, { role: 'user', text: userMsgText }]);

    try {
      const res = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          history: chatMessages
        })
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setChatMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'model', text: "Scusami, ho un piccolo problema a connettermi al mio dizionario. Puoi ripetere per favore?" }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', text: "Scusami, c'è stato un problema di rete. Puoi riprovare tra un attimo?" }]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Writing Exercise Submission & Evaluation
  const handleEvaluateWriting = async () => {
    const prompt = A2_WRITING_PROMPTS[currentWritingIdx];
    if (!studentWritingText.trim()) {
      setWritingErrorMsg("Per favore, scrivi del testo prima di inviare!");
      return;
    }
    setWritingErrorMsg("");
    setIsWritingEvaluating(true);
    setWritingEvaluation(null);

    try {
      const res = await fetch('/api/evaluate-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptTitle: prompt.title,
          promptText: prompt.promptText,
          studentText: studentWritingText,
          mode: examMode
        })
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        setWritingEvaluation(data.evaluation);
      } else {
        setWritingErrorMsg("Scusami, ho riscontrato un errore nel valutare il testo. Puoi riprovare?");
      }
    } catch (err) {
      setWritingErrorMsg("Si è verificato un errore di connessione. Controlla la rete e riprova.");
    } finally {
      setIsWritingEvaluating(false);
    }
  };

  // Calculate score outcomes
  const totalAnswered = Object.keys(userAnswers).length;
  const correctCount = questions.filter(q => userAnswers[q.id] === q.correctAnswerIndex).length;
  const incorrectCount = totalAnswered - correctCount;
  const completionPercent = questions.length ? Math.round((totalAnswered / questions.length) * 100) : 0;
  const correctPercent = totalAnswered ? Math.round((correctCount / questions.length) * 100) : 0;

  // Group Stats by Category
  const categoryStatsMap: Record<string, CategoryStats> = {};
  questions.forEach(q => {
    if (!categoryStatsMap[q.category]) {
      categoryStatsMap[q.category] = { category: q.category, total: 0, correct: 0 };
    }
    categoryStatsMap[q.category].total += 1;
    if (userAnswers[q.id] === q.correctAnswerIndex) {
      categoryStatsMap[q.category].correct += 1;
    }
  });
  const categoryStatsList = Object.values(categoryStatsMap);

  // Time conversion
  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div id="app-container" className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-200">
      
      {/* Top Banner Navigation Header */}
      <nav id="header-nav" className="sticky top-0 z-50 bg-white border-b border-slate-200/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentScreen('menu')}>
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg select-none shadow-md shadow-emerald-200">
            A2
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-800 flex items-center gap-1.5">
              Pronto! <span className="text-emerald-600">Italiano</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">QCER Simulare & Preparare</p>
          </div>
        </div>

        {currentScreen === 'quiz' && (
          <div className="flex items-center gap-4">
            {examMode !== 'practice' && (
              <div className="bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 flex items-center gap-2 shadow-sm font-mono text-sm font-bold text-slate-700 animate-pulse">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>TEMPO: {formatTime(timer)}</span>
              </div>
            )}
            
            <button 
              id="btn-conclude" 
              onClick={handleCompleteExam}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-2 px-4 rounded-full transition-all flex items-center gap-1 shadow-sm"
            >
              Concludi Test
            </button>
          </div>
        )}

        {currentScreen !== 'quiz' && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              Livello A2
            </span>
          </div>
        )}
      </nav>

      {/* Hero Welcome Menu Screen */}
      {currentScreen === 'menu' && (
        <main id="menu-screen" className="max-w-4xl mx-auto px-6 py-12">
          
          {/* Welcome Intro Hero */}
          <section className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 font-bold text-xs px-4 py-1.5 rounded-full mb-4 border border-emerald-200/60 shadow-sm animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              SISTEMA FORMATIVO INTEGRATO QCER ITALIANO A2
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4 max-w-2xl mx-auto leading-tight">
              Sconfiggi l'esame di <span className="underline decoration-emerald-500 decoration-3">Italiano A2</span> con fiducia!
            </h2>
            <p className="text-base text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
              Tre modalità di studio: allenamento libero con il Tutor AI, simulazione esame generica QCER, e la nuova **Simulazione Prefettura** calibrata sul test ufficiale per il *permesso di soggiorno UE per soggiornanti di lungo periodo*.
            </p>
          </section>

          {/* Three Main Modes Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">

            {/* Box 1: Practice & Coach Mode */}
            <div id="card-mode-practice" className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-8 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-emerald-50 to-emerald-500/10 rounded-full filter blur-xl transform translate-x-6 -translate-y-6" />
              <div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Allenamento con Assistenza</h3>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mb-4">
                  Apprendimento Guidato
                </span>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-6">
                  Pratica a passo libero con spiegazioni grammaticali istantanee. Include l'integrazione con la bacheca vocaboli, il simulatore di pronuncia vocale, flashcards intelligenti e il Tutor AI in tempo reale per conversare ed esercitarti.
                </p>
              </div>
              <button
                onClick={() => handleStartQuiz('practice')}
                disabled={isGenerating}
                className="w-full bg-emerald-600 border border-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl text-sm transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isGenerating ? 'Preparazione Corso...' : 'Inizia Allenamento Libero'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Box 2: Direct Exam Simulation */}
            <div id="card-mode-exam" className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-8 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-900/10 rounded-full filter blur-xl transform translate-x-6 -translate-y-6" />
              <div>
                <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Simulazione Esame Generica</h3>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full mb-4">
                  Mock Test QCER · 60 min
                </span>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-6">
                  Mettiti alla prova con un test formale di 50 domande combinate CILS/PLIDA estratte in tempo reale. Gestisci il timer di 60 minuti senza alcun aiuto visivo. Al termine riceverai un report con mappatura dettagliata degli errori.
                </p>
              </div>
              <button
                onClick={() => handleStartQuiz('exam')}
                disabled={isGenerating}
                className="w-full bg-slate-950 border border-slate-900 text-white font-bold py-4 px-6 rounded-2xl text-sm transition-all hover:bg-slate-800 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isGenerating ? 'Preparazione Test...' : 'Inizia Simulazione Completa'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Box 3: Official Prefettura Simulation — Permesso di soggiorno UE lungo periodo */}
            <div id="card-mode-prefettura" className="bg-white rounded-3xl border-2 border-emerald-200 shadow-sm hover:shadow-lg transition-all p-8 flex flex-col justify-between group relative overflow-hidden">
              {/* Tricolore accent stripe */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 flex flex-col">
                <div className="flex-1 bg-emerald-600" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-red-600" />
              </div>
              <div className="pointer-events-none absolute right-0 top-0 w-28 h-28 bg-gradient-to-br from-emerald-100 to-red-100/30 rounded-full filter blur-xl transform translate-x-6 -translate-y-6" />
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-red-500 text-white rounded-2xl flex items-center justify-center">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPrefetturaInfo(true)}
                    className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-700 underline decoration-dotted underline-offset-4 cursor-pointer"
                  >
                    Cos'è?
                  </button>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-1">Simulazione Prefettura</h3>
                <p className="text-[11px] font-bold text-slate-500 mb-3 italic">Test A2 ufficiale — permesso di soggiorno UE</p>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-4 border border-emerald-200">
                  Ufficiale · Soglia 80/100
                </span>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-6">
                  Tre sezioni come al test reale del Ministero dell'Interno: <strong>Ascolto</strong> (30 pt · 25 min), <strong>Lettura</strong> (35 pt · 25 min), <strong>Scrittura</strong> (35 pt · 10 min). Nessuna sezione orale, nessuna grammatica isolata. Devi raggiungere 80/100 per essere promosso.
                </p>
              </div>
              <button
                onClick={() => handleStartQuiz('prefettura')}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-emerald-600 to-red-600 hover:from-emerald-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-2xl text-sm transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                {isGenerating ? 'Preparazione Simulazione...' : 'Inizia Simulazione Prefettura'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </main>
      )}

      {/* Prefettura explainer modal */}
      {showPrefetturaInfo && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPrefetturaInfo(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPrefetturaInfo(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              aria-label="Chiudi"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-red-500 text-white rounded-2xl flex items-center justify-center">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 leading-tight">Cos'è il Test A2 della Prefettura</h3>
                <p className="text-xs font-bold text-slate-500 italic">Permesso di soggiorno UE per soggiornanti di lungo periodo</p>
              </div>
            </div>
            <div className="space-y-3.5 text-sm text-slate-700 font-medium leading-relaxed">
              <p>
                È il test gratuito di lingua italiana <strong>obbligatorio</strong> per ottenere il permesso di soggiorno UE per soggiornanti di lungo periodo (ex "carta di soggiorno"), introdotto dal <strong>D.M. 4 giugno 2010</strong> del Ministero dell'Interno e organizzato dalle Prefetture in collaborazione con i CPIA.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between"><span className="font-bold text-slate-500">Durata totale</span><span className="font-black text-slate-900">60 minuti</span></div>
                <div className="flex justify-between"><span className="font-bold text-slate-500">Punteggio totale</span><span className="font-black text-slate-900">100 punti</span></div>
                <div className="flex justify-between"><span className="font-bold text-slate-500">Soglia di promozione</span><span className="font-black text-emerald-700">≥ 80 / 100</span></div>
                <div className="flex justify-between"><span className="font-bold text-slate-500">Sezioni</span><span className="font-black text-slate-900">3 (no orale)</span></div>
                <div className="flex justify-between"><span className="font-bold text-slate-500">Costo</span><span className="font-black text-slate-900">Gratuito</span></div>
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider mb-2">Struttura</h4>
                <ul className="space-y-1.5 text-xs">
                  <li>• <strong>Ascolto</strong> — 30 pt, 25 min (comprensione di dialoghi e annunci registrati)</li>
                  <li>• <strong>Lettura</strong> — 35 pt, 25 min (comprensione di testi della vita quotidiana e dei servizi pubblici)</li>
                  <li>• <strong>Scrittura</strong> — 35 pt, 10 min (compilazione modulo + breve messaggio)</li>
                </ul>
              </div>
              <p className="text-xs text-slate-500 italic">
                Le certificazioni CILS, CELI, PLIDA o Roma Tre di livello A2 (o superiore) sostituiscono il test. La Simulazione Prefettura di questa app ricostruisce la struttura, i pesi e i tempi reali per allenarti come al test vero.
              </p>
              <p className="text-xs text-slate-500">
                <strong>Fonte ufficiale:</strong> <a href="https://www.interno.gov.it/it/temi/immigrazione-e-asilo/modalita-dingresso/test-conoscenza-lingua-italiana" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-bold">interno.gov.it</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Simulazione Prefettura — dedicated self-contained flow (timers, sections, scoring) */}
      {currentScreen === 'prefettura' && (
        <SimulazionePrefettura
          onExit={() => {
            setExamMode('practice');
            setCurrentScreen('menu');
          }}
        />
      )}

      {/* Main Study/Exam Area with Bento Grid Elements */}
      {currentScreen === 'quiz' && (
        <main id="quiz-area" className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN LEFT: Bento Tabs Selection & Contents (8 of 12 columns) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Category / Screen Navigation Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-4 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full select-none uppercase tracking-widest border border-emerald-200">
                    {questions[currentIndex]?.category || 'GRAMMATICA'}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Livello {questions[currentIndex]?.difficulty || 'A2'} • Sezione: {questions[currentIndex]?.section}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-500">
                  Domanda {currentIndex + 1} di {questions.length}
                </div>
              </div>

              {/* Bento Switch Navigation Tabs inside practice screen */}
              {examMode === 'practice' && (
                <div className="flex flex-wrap bg-slate-200/60 p-1 rounded-2xl border border-slate-200 gap-1 select-none">
                  <button 
                    onClick={() => setActiveBentoTab('questions')}
                    className={`flex-grow min-w-[85px] flex items-center justify-center gap-1.5 text-[11px] font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer ${activeBentoTab === 'questions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    Domande
                  </button>
                  <button 
                    onClick={() => setActiveBentoTab('study-guide')}
                    className={`flex-grow min-w-[100px] flex items-center justify-center gap-1.5 text-[11px] font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer ${activeBentoTab === 'study-guide' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <BookMarked className="w-3.5 h-3.5 shrink-0" />
                    Schede Studio
                  </button>
                  <button 
                    onClick={() => setActiveBentoTab('tutor-chat')}
                    className={`flex-grow min-w-[100px] flex items-center justify-center gap-1.5 text-[11px] font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer ${activeBentoTab === 'tutor-chat' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    Tutor AI
                  </button>
                  <button 
                    onClick={() => setActiveBentoTab('vocab-game')}
                    className={`flex-grow min-w-[105px] flex items-center justify-center gap-1.5 text-[11px] font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer ${activeBentoTab === 'vocab-game' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Compass className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    Sfida Lessico
                  </button>
                  <button 
                    onClick={() => setActiveBentoTab('voice-practice')}
                    className={`flex-grow min-w-[110px] flex items-center justify-center gap-1.5 text-[11px] font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer ${activeBentoTab === 'voice-practice' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Mic className="w-3.5 h-3.5 shrink-0 text-red-500 animate-pulse" />
                    Pronuncia Vocale
                  </button>
                  <button 
                    onClick={() => setActiveBentoTab('flashcards')}
                    className={`flex-grow min-w-[100px] flex items-center justify-center gap-1.5 text-[11px] font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer ${activeBentoTab === 'flashcards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Flame className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                    Flashcard A2
                  </button>
                  <button 
                    onClick={() => setActiveBentoTab('writing')}
                    className={`flex-grow min-w-[100px] flex items-center justify-center gap-1.5 text-[11px] font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer ${activeBentoTab === 'writing' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Edit3 className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                    Produzione Scritta
                  </button>
                </div>
              )}

              {/* TAB CONTENT 1: Primary Question Viewer Block */}
              {activeBentoTab === 'questions' && (
                <div id="bento-box-question" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col justify-between min-h-[480px]">
                  
                  {/* Listening exercise special helper box */}
                  {questions[currentIndex]?.category === "Ascolto" && (
                    <div className="bg-emerald-50 border border-emerald-200/50 rounded-2xl p-4.5 mb-6 flex items-start gap-3.5 text-emerald-900 shadow-sm animate-fade-in">
                      <div className="text-2xl shrink-0 select-none">👂</div>
                      <div>
                        <h5 className="font-extrabold text-xs uppercase tracking-widest text-emerald-800">Esercizio di Ascolto A2</h5>
                        <p className="text-[11px] font-semibold text-emerald-700/90 leading-relaxed mt-0.5">
                          Il Professore ha registrato una breve frase in Italiano. Clicca sul pulsante dell'altoparlante per ascoltare la pronuncia, poi scegli la traduzione corretta.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Passage context block if provided (important for Reading Comprehension) */}
                  {questions[currentIndex]?.context && (
                    <div className="bg-slate-100 rounded-2xl p-5 mb-6 border border-slate-200/60 font-medium text-sm leading-relaxed text-slate-700 italic flex justify-between items-start gap-4">
                      <div className="flex-grow whitespace-pre-line">
                        {questions[currentIndex]?.category === "Ascolto" ? (
                          <div className="flex flex-col gap-1 text-xs">
                            <span className="text-emerald-700 font-extrabold flex items-center gap-1">📋 REGISTRAZIONE AUDIO (Testo nascosto)</span>
                            <span className="text-slate-500 font-medium leading-relaxed">
                              La trascrizione scritta dell'ascolto è nascosta per simulare le condizioni d'esame. Clicca sull'altoparlante a destra per ascoltare la pronuncia autentica del Professore!
                            </span>
                          </div>
                        ) : (
                          highlightDifficultWords(questions[currentIndex].context!)
                        )}
                      </div>
                      <button
                        onClick={() => speakItalian(questions[currentIndex].context!, questions[currentIndex].audioUrl)}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer border shrink-0 ${currentlySpeaking === questions[currentIndex].context ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-emerald-600 border-slate-200 shadow-sm'}`}
                        title="Ascolta la pronuncia"
                      >
                        {currentlySpeaking === questions[currentIndex].context ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>
                  )}

                  {/* Question image if provided */}
                  {questions[currentIndex]?.imageUrl && (
                    <div className="w-full max-w-sm mx-auto mb-6 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm flex items-center justify-center p-4">
                      <img
                        src={questions[currentIndex].imageUrl}
                        alt="Esercizio con immagine"
                        className="max-h-56 object-contain rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Question main prompt text */}
                  <div className="mb-6 flex justify-between items-start gap-4">
                    <h3 className="text-lg md:text-xl font-extrabold text-slate-900 leading-snug whitespace-pre-line">
                      {highlightDifficultWords(questions[currentIndex]?.questionText)}
                    </h3>
                    <button
                      onClick={() => speakItalian(questions[currentIndex]?.questionText, questions[currentIndex]?.category === 'Ascolto' && !questions[currentIndex]?.context ? questions[currentIndex]?.audioUrl : undefined)}
                      className={`p-2 rounded-xl transition-all cursor-pointer border shrink-0 ${currentlySpeaking === questions[currentIndex]?.questionText ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-emerald-600 border-slate-200'}`}
                      title="Ascolta la pronuncia"
                    >
                      {currentlySpeaking === questions[currentIndex]?.questionText ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Answers multiple choices clickable list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    {questions[currentIndex]?.options.map((option, idx) => {
                      const questionId = questions[currentIndex].id;
                      const selectedIdx = userAnswers[questionId];
                      const isCorrectAnswer = idx === questions[currentIndex].correctAnswerIndex;
                      
                      // Practice mode specific visual logic
                      let buttonStyle = "border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50";
                      let indicatorStyle = "bg-slate-100 text-slate-500";

                      if (selectedIdx !== undefined) {
                        if (examMode === 'practice') {
                          // Immediate feedback styling
                          if (isCorrectAnswer) {
                            buttonStyle = "border-emerald-500 bg-emerald-50/70";
                            indicatorStyle = "bg-emerald-500 text-white";
                          } else if (selectedIdx === idx) {
                            buttonStyle = "border-rose-300 bg-rose-50/70";
                            indicatorStyle = "bg-rose-500 text-white";
                          }
                        } else {
                          // Exam Mode: just highlight selected cleanly
                          if (selectedIdx === idx) {
                            buttonStyle = "border-slate-800 bg-slate-100 font-bold";
                            indicatorStyle = "bg-slate-800 text-white";
                          }
                        }
                      }

                      return (
                        <div key={idx} className="relative animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                          <motion.button
                            id={`option-${idx}`}
                            onClick={() => handleSelectOption(idx)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={`w-full flex items-center p-5 pr-14 border-2 rounded-2xl text-left transition-all ${buttonStyle} cursor-pointer`}
                          >
                            <span className={`w-8 h-8 rounded-lg ${indicatorStyle} flex items-center justify-center font-bold mr-4 text-xs transition-colors shrink-0`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <div className="flex flex-col w-full">
                              {questions[currentIndex]?.optionImages?.[idx] && (
                                <div className="w-full h-24 mb-2 bg-slate-50 border border-slate-150 rounded-xl overflow-hidden flex items-center justify-center p-1.5">
                                  <img 
                                    src={questions[currentIndex].optionImages![idx]} 
                                    alt={`Disegno Opzione ${String.fromCharCode(65 + idx)}`}
                                    className="h-full object-contain rounded-lg"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}
                              <span className="font-semibold text-slate-700 text-sm">
                                {highlightDifficultWords(option)}
                              </span>
                            </div>
                          </motion.button>
                          
                          {/* Audio button inside option block without bubbling click */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              speakItalian(option);
                            }}
                            className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer border shadow-sm ${currentlySpeaking === option ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-slate-100 text-slate-400 hover:text-emerald-600 border-slate-200'}`}
                            title="Ascolta la pronuncia"
                          >
                            {currentlySpeaking === option ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Control actions bar for switching pages */}
                  <div className="flex justify-between items-center border-t border-slate-100 pt-6 mt-6">
                    <button
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-3 px-6 rounded-2xl transition-all disabled:opacity-40 cursor-pointer text-center"
                    >
                      ← Indietro
                    </button>

                    {/* Show correct badge in practice mode */}
                    {examMode === 'practice' && userAnswers[questions[currentIndex].id] !== undefined && (
                      <div className="flex items-center gap-1 text-xs font-black">
                        {userAnswers[questions[currentIndex].id] === questions[currentIndex].correctAnswerIndex ? (
                          <span className="text-emerald-700 flex items-center gap-1.5 bg-emerald-100 px-3 py-1.5 rounded-full select-none">
                            <CheckCircle className="w-4 h-4" /> Corretto!
                          </span>
                        ) : (
                          <span className="text-rose-700 flex items-center gap-1.5 bg-rose-100 px-3 py-1.5 rounded-full select-none">
                            <XCircle className="w-4 h-4" /> Sbagliato!
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      onClick={handleNext}
                      disabled={currentIndex === questions.length - 1}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 px-6 rounded-2xl transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5 justify-center"
                    >
                      Avanti →
                    </button>
                  </div>

                </div>
              )}

              {/* TAB CONTENT 2: Study Guide Helper cards */}
              {examMode === 'practice' && activeBentoTab === 'study-guide' && (
                <div id="bento-box-study-guide" className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[480px]">
                  
                  {/* Left hand card selectors list (4 columns) */}
                  <div className="md:col-span-4 bg-white rounded-3xl border border-slate-200 p-4 flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 mb-3">Argomenti Chiave</h4>
                    {A2_STUDY_CARDS.map(card => (
                      <button
                        key={card.id}
                        onClick={() => setSelectedCardId(card.id)}
                        className={`w-full text-left p-3.5 rounded-2xl transition-all text-xs font-bold border ${selectedCardId === card.id ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-extrabold' : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800'} cursor-pointer`}
                      >
                        {card.title}
                      </button>
                    ))}
                  </div>

                  {/* Right hand card context viewer (8 columns) */}
                  <div className="md:col-span-8 bg-white rounded-3xl border border-slate-200 p-8 flex flex-col justify-between">
                    {(() => {
                      const card = A2_STUDY_CARDS.find(c => c.id === selectedCardId);
                      if (!card) return null;
                      return (
                        <>
                          <div>
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-emerald-200 mb-4 inline-block select-none">
                              {card.grammarTopic}
                            </span>
                            <h3 className="text-xl font-extrabold text-slate-900 mb-3">{card.title}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">{card.explanation}</p>
                            
                            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest mb-3">Esempi Pratici (Ascolta e Ripeti)</h4>
                            <div className="flex flex-col gap-3">
                              {card.examples.map((ex, i) => (
                                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs flex justify-between items-center gap-4">
                                  <div className="flex-grow">
                                    <p className="font-bold text-slate-800 italic text-sm">{highlightDifficultWords(ex.italian)}</p>
                                    <p className="text-slate-500 font-medium mt-1">{ex.english}</p>
                                  </div>
                                  <button
                                    onClick={() => speakItalian(ex.italian)}
                                    className={`p-2 rounded-xl transition-all cursor-pointer border shrink-0 ${currentlySpeaking === ex.italian ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-slate-100 text-slate-500 hover:text-emerald-600 border-slate-200'}`}
                                    title="Ascolta la pronuncia"
                                  >
                                    {currentlySpeaking === ex.italian ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mt-6 flex items-start gap-3">
                            <Lightbulb className="w-5 h-5 text-orange-500 shrink-0" />
                            <div>
                              <h5 className="font-bold text-sm text-orange-850">La Spia Grammaticale (Tip)</h5>
                              <p className="text-xs text-orange-700/95 font-medium mt-0.5 leading-relaxed">
                                {card.tips[0]}
                              </p>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                </div>
              )}

              {/* TAB CONTENT 3: AI Professore Tutor Chat Widget */}
              {examMode === 'practice' && activeBentoTab === 'tutor-chat' && (
                <div id="bento-box-tutor" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between min-h-[480px]">
                  
                  {/* Header title */}
                  <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center">
                        👨‍🏫
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-950">Il Professore d'Italiano</h4>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">AI Coaching Support active</p>
                      </div>
                    </div>
                    <span className="text-xs bg-slate-100 font-semibold px-3 py-1 rounded-full text-slate-400 select-none uppercase">
                      CEFR A2
                    </span>
                  </div>

                  {/* Messages list container */}
                  <div className="flex-grow overflow-y-auto max-h-[280px] pr-2 space-y-4 mb-4">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2 animate-fade-in`}>
                        {msg.role === 'model' && (
                          <button
                            onClick={() => speakItalian(msg.text)}
                            className={`p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${currentlySpeaking === msg.text ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 text-slate-400 hover:text-emerald-600 border-slate-200'}`}
                            title="Pronuncia ad alta voce"
                          >
                            {currentlySpeaking === msg.text ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs md:text-sm font-medium leading-relaxed leading-sans shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'}`}>
                          {msg.role === 'model' ? (
                            <MiniMarkdown text={msg.text} mode="dark" />
                          ) : (
                            <p>{msg.text}</p>
                          )}
                        </div>
                        {msg.role === 'user' && (
                          <button
                            onClick={() => speakItalian(msg.text)}
                            className={`p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${currentlySpeaking === msg.text ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 text-slate-400 hover:text-emerald-600 border-slate-200'}`}
                            title="Pronuncia ad alta voce"
                          >
                            {currentlySpeaking === msg.text ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    ))}
                    {isChatSending && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 text-slate-400 rounded-2xl p-4 text-xs font-bold italic animate-pulse">
                          Il Professore sta pensando alla spiegazione...
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Prompt input box */}
                  <div className="flex gap-2 bg-slate-100 p-2 rounded-2xl">
                    <input 
                      type="text" 
                      placeholder="Iscriviti o chiedi: 'Come si dice 'Yesterday I fell down?' o 'Spiegami la differenza tra ci e ne'" 
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSendChat();
                      }}
                      className="flex-grow bg-transparent border-0 outline-none text-xs md:text-sm font-medium px-3 text-slate-800 placeholder-slate-400"
                    />
                    <button 
                      onClick={handleSendChat}
                      disabled={isChatSending || !chatInput.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

              {/* TAB CONTENT 4: A2 Vocabulary Match Game */}
              {examMode === 'practice' && activeBentoTab === 'vocab-game' && (
                <div id="bento-box-vocab-game" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col justify-between min-h-[480px]">
                  
                  {/* Game view Header */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-xl">
                          🎯
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm md:text-base">Mappa Mentale del Vocabolario</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Associa la parola italiana al suo significato!</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">Punti Accumulati:</span>
                        <span className="bg-emerald-105 hover:bg-emerald-200 text-emerald-800 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-200 transition-all select-none">
                          {vocabGameScore} pt
                        </span>
                      </div>
                    </div>

                    {/* Completion state / Success Screen */}
                    {matchedCount === 5 ? (
                      <div className="flex flex-col items-center justify-center text-center py-10 px-4 animate-fade-in">
                        <div className="text-5xl mb-4 select-none animate-bounce">🏆</div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Grandioso!</h3>
                        <p className="text-xs md:text-sm text-slate-500 font-semibold max-w-sm mb-6">
                          Hai abbinato correttamente tutti e 5 i termini di livello A2! Hai guadagnato +5 punti. Continua così per padroneggiare tutto il dizionario!
                        </p>
                        <button
                          onClick={initVocabGame}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 px-8 rounded-2xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" /> Prossimo Gruppo di Parole
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Interactive Matcher Arena */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 mb-6 text-slate-500 text-xs font-semibold leading-relaxed">
                          💡 <span className="text-slate-700 font-bold">Istruzioni:</span> Seleziona una parola in <span className="text-emerald-600 font-black">Italiano</span> a sinistra, poi seleziona la sua corretta traduzione in <span className="text-indigo-600 font-black">Inglese</span> a destra. Clicca sull'altoparlante 🔊 per ascoltare la pronuncia nativa in qualsiasi momento.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-2">
                          
                          {/* Column 1: ITALIAN WORDS */}
                          <div className="flex flex-col gap-3.5">
                            <h5 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1 border-b pb-1.5 border-slate-100 flex items-center gap-1">
                              🇮🇹 Parola Italiana
                            </h5>
                            {shuffledItal.map(itWord => {
                              const correspondingPair = vocabGamePairs.find(p => p.italian === itWord);
                              const isMatched = correspondingPair?.matched;
                              const isSelected = selectedItWord === itWord;
                              const isWrong = wrongMatch?.it === itWord;

                              let btnStyle = "bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50 cursor-pointer";
                              if (isMatched) {
                                btnStyle = "bg-emerald-100/60 border-emerald-200 text-emerald-800 cursor-not-allowed opacity-40 line-through";
                              } else if (isWrong) {
                                btnStyle = "bg-rose-50 border-rose-500 text-rose-700 animate-pulse";
                              } else if (isSelected) {
                                btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-black ring-2 ring-emerald-500/20";
                              }

                              return (
                                <div key={itWord} className="flex items-center gap-2">
                                  <button
                                    onClick={() => !isMatched && handleSelectItWord(itWord)}
                                    disabled={!!isMatched}
                                    className={`flex-grow text-left py-4 px-5 border-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-150 flex items-center justify-between ${btnStyle}`}
                                  >
                                    <span>{itWord}</span>
                                    {isMatched && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                  </button>
                                  <button
                                    onClick={() => speakItalian(itWord)}
                                    className={`p-2.5 rounded-xl transition-all cursor-pointer border shrink-0 ${currentlySpeaking === itWord ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-slate-100 text-slate-500 hover:text-emerald-600 border-slate-200'}`}
                                    title="Ascolta la pronuncia"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          {/* Column 2: ENGLISH TRANSLATIONS */}
                          <div className="flex flex-col gap-3.5">
                            <h5 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1 border-b pb-1.5 border-slate-100 flex items-center gap-1">
                              🇬🇧 Traduzione Inglese
                            </h5>
                            {shuffledEng.map(engWord => {
                              const correspondingPair = vocabGamePairs.find(p => p.english === engWord);
                              const isMatched = correspondingPair?.matched;
                              const isSelected = selectedEngWord === engWord;
                              const isWrong = wrongMatch?.eng === engWord;

                              let btnStyle = "bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50 cursor-pointer";
                              if (isMatched) {
                                btnStyle = "bg-emerald-100/60 border-emerald-200 text-emerald-800 cursor-not-allowed opacity-40 line-through";
                              } else if (isWrong) {
                                btnStyle = "bg-rose-50 border-rose-500 text-rose-700 animate-pulse";
                              } else if (isSelected) {
                                btnStyle = "bg-indigo-50 border-indigo-500 text-indigo-950 font-black ring-2 ring-indigo-500/20";
                              }

                              return (
                                <button
                                  key={engWord}
                                  onClick={() => !isMatched && handleSelectEngWord(engWord)}
                                  disabled={!!isMatched}
                                  className={`text-left py-4 px-5 border-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center justify-between ${btnStyle}`}
                                >
                                  <span>{engWord}</span>
                                  {isMatched && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                </button>
                              );
                            })}
                          </div>

                        </div>
                      </>
                    )}
                  </div>

                  {/* Reset Game utility footer */}
                  {matchedCount < 5 && (
                    <div className="flex justify-between items-center border-t border-slate-100 pt-6 mt-8">
                      <div className="text-[11px] font-bold text-slate-400">
                        Trova gli abbinamenti • {5 - matchedCount} rimanenti
                      </div>
                      <button
                        onClick={initVocabGame}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs py-2.5 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Cambia Parole
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* TAB CONTENT 5: A2 Pronunciation / Speech Challenge */}
              {examMode === 'practice' && activeBentoTab === 'voice-practice' && (
                <div id="bento-box-voice-practice" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col justify-between min-h-[480px]">
                  
                  {/* Header */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-xl">
                          🎙️
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm md:text-base">Laboratorio di Pronuncia Vocale A2</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Migliora la dizione con l'analisi vocale in tempo reale!</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">Punti Parlato:</span>
                        <span className="bg-red-50 text-red-700 text-xs font-black px-3.5 py-1.5 rounded-full border border-red-200 transition-all select-none">
                          {voicePoints} pt
                        </span>
                      </div>
                    </div>

                    {/* Left Column: Sentences / Right Column: Feedback & Mic Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      
                      {/* Sentences list (5 cols) */}
                      <div className="md:col-span-5 flex flex-col gap-2.5">
                        <h5 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1 border-b pb-1.5 border-slate-100">
                          Scegli la Frase da Esercitare
                        </h5>
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[310px] pr-1">
                          {A2_PRONUNCIATION_CARDS.map((card, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedVoiceCardIdx(idx);
                                setPronunciationScore(null);
                                setPronunciationFeedback("");
                                setRecognizedText("");
                              }}
                              className={`w-full text-left p-3 rounded-xl transition-all border text-xs font-extrabold cursor-pointer ${selectedVoiceCardIdx === idx ? 'bg-red-50 border-red-400 text-red-950 shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'}`}
                            >
                              <div className="truncate mb-0.5">{card.sentence}</div>
                              <div className="text-[10px] text-slate-400 truncate font-semibold">{card.english}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Controls and feedback panel (7 cols) */}
                      <div className="md:col-span-7 bg-slate-50 border border-slate-200/60 rounded-3xl p-6 flex flex-col justify-between min-h-[320px]">
                        <div>
                          <div className="flex justify-between items-start gap-4 mb-3">
                            <div>
                              <span className="bg-red-50 text-red-600 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border border-red-200/70 select-none">
                                Frase Selezionata
                              </span>
                            </div>
                            <button
                              onClick={() => speakItalian(A2_PRONUNCIATION_CARDS[selectedVoiceCardIdx].sentence)}
                              className={`p-2 rounded-xl transition-all cursor-pointer border flex items-center gap-1.5 text-xs font-bold shrink-0 ${currentlySpeaking === A2_PRONUNCIATION_CARDS[selectedVoiceCardIdx].sentence ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 hover:text-red-700 border-slate-200'}`}
                            >
                              {currentlySpeaking === A2_PRONUNCIATION_CARDS[selectedVoiceCardIdx].sentence ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                              Ascolta Madrelingua
                            </button>
                          </div>

                          <h4 className="text-base font-black text-slate-800 italic leading-relaxed mb-4 p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                            "{A2_PRONUNCIATION_CARDS[selectedVoiceCardIdx].sentence}"
                          </h4>
                          
                          <p className="text-xs text-slate-500 font-semibold mb-4 bg-white/50 border border-slate-100 p-3 rounded-xl leading-relaxed">
                            💡 <span className="text-red-600 font-black">Consiglio Dizione:</span> {A2_PRONUNCIATION_CARDS[selectedVoiceCardIdx].tips}
                          </p>

                          {/* Recording Panel */}
                          <div className="space-y-3">
                            <div className="flex flex-col gap-1.5 bg-white rounded-xl p-4 border border-slate-200">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hai pronunciato:</span>
                              <p className={`text-xs font-bold ${recognizedText ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                                {recognizedText || "Clicca su registra o simula per iniziare la dizione..."}
                              </p>
                            </div>

                            {pronunciationScore !== null && (
                              <div className="bg-white rounded-xl p-4 border border-slate-200 animate-fade-in flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-sm border ${pronunciationScore >= 82 ? 'bg-emerald-50 text-emerald-800 border-emerald-250' : pronunciationScore >= 50 ? 'bg-amber-50 text-amber-800 border-amber-250' : 'bg-red-50 text-red-800 border-red-250'}`}>
                                  {pronunciationScore}%
                                </div>
                                <div className="space-y-0.5">
                                  <h6 className="font-extrabold text-xs text-slate-800">Accuratezza dizione</h6>
                                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{pronunciationFeedback}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Speech controls buttons */}
                        <div className="flex flex-col gap-1.5 mt-5">
                          <button
                            onClick={startSpeechRecognition}
                            className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${isRecognizing ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                          >
                            <Mic className="w-3.5 h-3.5 shrink-0" />
                            {isRecognizing ? "Ascolto del Microfono attivo... Parla ora!" : "Registra con il Microfono"}
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => simulateVoiceRecording(true)}
                              className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-850 font-bold text-[10px] rounded-xl transition-all cursor-pointer text-center"
                            >
                              Simula Dizione Corretta
                            </button>
                            <button
                              onClick={() => simulateVoiceRecording(false)}
                              className="py-2 px-3 bg-red-50 hover:bg-red-105 border border-red-200 text-red-850 font-bold text-[10px] rounded-xl transition-all cursor-pointer text-center"
                            >
                              Simula Dizione con Errori
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* TAB CONTENT 6: A2 Vocabulary Flashcards with Flip Animations */}
              {examMode === 'practice' && activeBentoTab === 'flashcards' && (() => {
                const getFilteredFlashcards = () => {
                  return A2_VOCAB_FLASHCARDS.filter(card => {
                    if (flashcardsFilter === 'known') return !!knownCardIds[card.id];
                    if (flashcardsFilter === 'practice') return !!practiceCardIds[card.id];
                    return true;
                  });
                };

                const filtered = getFilteredFlashcards();
                const totalKnown = Object.keys(knownCardIds).length;
                const totalPractice = Object.keys(practiceCardIds).length;
                const totalPoints = totalKnown * 5;

                const isCurrentIndexInBounds = currentFlashIndex < filtered.length;
                const currentCard = isCurrentIndexInBounds ? filtered[currentFlashIndex] : null;

                const markAsKnown = (id: string) => {
                  setKnownCardIds(prev => ({ ...prev, [id]: true }));
                  setPracticeCardIds(prev => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                  });
                  setIsFlipped(false);
                  setTimeout(() => {
                    setCurrentFlashIndex(prev => prev + 1);
                  }, 150);
                };

                const markAsPractice = (id: string) => {
                  setPracticeCardIds(prev => ({ ...prev, [id]: true }));
                  setKnownCardIds(prev => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                  });
                  setIsFlipped(false);
                  setTimeout(() => {
                    setCurrentFlashIndex(prev => prev + 1);
                  }, 150);
                };

                const resetFlashcards = () => {
                  setCurrentFlashIndex(0);
                  setIsFlipped(false);
                  setKnownCardIds({});
                  setPracticeCardIds({});
                  setFlashcardsFilter('all');
                };

                return (
                  <div id="bento-box-flashcards" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col justify-between min-h-[520px]">
                    
                    {/* Header */}
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6 font-sans">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-xl select-none">
                            📚
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm md:text-base">Schedario Vocaboli A2</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Padroneggia il lessico essenziale con le flashcard interattive!</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 select-none">
                          <span className="text-xs font-bold text-slate-400">Punti Memoria:</span>
                          <span className="bg-amber-50 text-amber-700 text-xs font-black px-3.5 py-1.5 rounded-full border border-amber-250 transition-all select-none flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" /> {totalPoints} pt
                          </span>
                        </div>
                      </div>

                      {/* Filter Controls Bar */}
                      <div className="flex flex-wrap items-center gap-2 mb-6 select-none font-sans">
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 mr-2">Filtro:</span>
                        <button
                          onClick={() => { setFlashcardsFilter('all'); setCurrentFlashIndex(0); setIsFlipped(false); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${flashcardsFilter === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-650'}`}
                        >
                          Tutti ({A2_VOCAB_FLASHCARDS.length})
                        </button>
                        <button
                          onClick={() => { setFlashcardsFilter('known'); setCurrentFlashIndex(0); setIsFlipped(false); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${flashcardsFilter === 'known' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'}`}
                        >
                          <Check className="w-3.5 h-3.5" /> Conosciuti ({totalKnown})
                        </button>
                        <button
                          onClick={() => { setFlashcardsFilter('practice'); setCurrentFlashIndex(0); setIsFlipped(false); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${flashcardsFilter === 'practice' ? 'bg-red-650 text-white shadow-sm' : 'bg-red-50 hover:bg-red-100 text-red-700'}`}
                        >
                          <Heart className="w-3.5 h-3.5" /> Da Ripassare ({totalPractice})
                        </button>
                      </div>

                      {/* Content Arena */}
                      {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-12 px-4 animate-fade-in font-sans">
                          <span className="text-4xl mb-4 select-none">📂</span>
                          <h5 className="font-extrabold text-slate-800 text-sm md:text-base">Mazzo vuoto</h5>
                          <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6 font-semibold">
                            {flashcardsFilter === 'known' 
                              ? "Non hai ancora contrassegnato nessuna parola come conosciuta. Gira le schede ed esercitati!" 
                              : "Ottimo lavoro! Nessun termine rimasto da ripassare in questo mazzo."}
                          </p>
                          <button
                            onClick={() => { setFlashcardsFilter('all'); setCurrentFlashIndex(0); setIsFlipped(false); }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2.5 px-6 rounded-xl transition-all cursor-pointer"
                          >
                            Mostra Tutti i Vocaboli
                          </button>
                        </div>
                      ) : !isCurrentIndexInBounds ? (
                        /* Completed Deck state */
                        <div className="flex flex-col items-center justify-center text-center py-10 px-4 animate-fade-in font-sans">
                          <div className="text-5xl mb-4 select-none animate-bounce">👑</div>
                          <h3 className="text-xl font-black text-slate-900 mb-1">Mazzo Completato!</h3>
                          <p className="text-xs md:text-sm text-slate-500 font-semibold max-w-sm mb-6">
                            Hai esaminato tutte le {filtered.length} flashcard in questo filtro. Hai contrassegnato {totalKnown} parole come conosciute e {totalPractice} da ripassare.
                          </p>
                          
                          <div className="flex gap-3">
                            <button
                              onClick={() => { setCurrentFlashIndex(0); setIsFlipped(false); }}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 px-6 rounded-xl transition-all cursor-pointer"
                            >
                              Riavvia questo Mazzo
                            </button>
                            <button
                              onClick={resetFlashcards}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-extrabold text-xs py-3.5 px-6 rounded-xl transition-all cursor-pointer"
                            >
                              Resetta Tutto il Progresso
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Standard Flashcard loop */
                        <div className="flex flex-col items-center justify-center py-2 font-sans">
                          
                          {/* Flashcard Box with Flip Interaction */}
                          <div 
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="perspective-1000 w-full max-w-md h-64 md:h-72 cursor-pointer relative group transition-transform duration-300 active:scale-95"
                          >
                            <div className={`transform-style-3d relative w-full h-full duration-500 select-none ${isFlipped ? 'rotate-y-180' : ''}`}>
                              
                              {/* FRONT SIDE (Italian Word and Helper) */}
                              <div className="backface-hidden absolute inset-0 bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:border-slate-350 transition-all">
                                <div className="flex items-center justify-between">
                                  <span className="bg-amber-150 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                                    {currentCard.category}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400">
                                    {currentFlashIndex + 1} / {filtered.length}
                                  </span>
                                </div>

                                <div className="text-center space-y-2">
                                  <h3 className="font-extrabold text-slate-900 text-2xl md:text-3.5xl tracking-tight">
                                    {currentCard.word}
                                  </h3>
                                  <span className="inline-block font-mono text-xs text-slate-450 font-semibold bg-white/90 px-3 py-1 rounded-full border border-slate-250/20">
                                    /{currentCard.pronunciation}/
                                  </span>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speakItalian(currentCard.word);
                                    }}
                                    className={`p-2.5 rounded-xl transition-all cursor-pointer border ${currentlySpeaking === currentCard.word ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-500 hover:text-amber-600 hover:bg-amber-50 border-slate-200'}`}
                                    title="Ascolta la pronuncia"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-amber-600 transition-colors flex items-center gap-1">
                                    Clicca per girare 🔄
                                  </span>
                                </div>
                              </div>

                              {/* BACK SIDE (English Meaning and Context Examples) */}
                              <div className="rotate-y-180 backface-hidden absolute inset-0 bg-amber-50/20 border-2 border-amber-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm transition-all">
                                <div className="flex items-center justify-between">
                                  <span className="bg-amber-100 text-amber-850 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                                    Traduzione
                                  </span>
                                  <span className="text-[10px] font-bold text-amber-700">
                                    Contesto & Esempio A2
                                  </span>
                                </div>

                                <div className="text-center space-y-4 px-1">
                                  <h3 className="font-extrabold text-amber-950 text-xl md:text-2xl tracking-tight leading-tight">
                                    {currentCard.translation}
                                  </h3>
                                  
                                  {/* Visual Context Box */}
                                  <div className="bg-white/90 border border-amber-200/50 rounded-2xl p-3 text-left space-y-1 relative pr-10">
                                    <p className="text-slate-800 font-bold text-[11px] md:text-xs leading-relaxed">
                                      🇮🇹 {currentCard.example}
                                    </p>
                                    <p className="text-slate-500 font-medium text-[10px] md:text-[11px] leading-relaxed italic">
                                      🇬🇧 &ldquo;{currentCard.exampleTranslation}&rdquo;
                                    </p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        speakItalian(currentCard.example);
                                      }}
                                      className={`absolute right-2 top-3 p-1.5 rounded-lg transition-all border ${currentlySpeaking === currentCard.example ? 'bg-amber-600 text-white border-amber-600' : 'bg-white hover:bg-amber-50 text-slate-500 hover:text-amber-600 border-slate-200'}`}
                                      title="Ascolta frase"
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-amber-200/40 pt-3">
                                  <span className="text-[9px] font-bold text-slate-400">
                                    Gira di nuovo per l'Italiano
                                  </span>
                                  <span className="text-[10px] font-black text-amber-700">
                                    🔄 Retro
                                  </span>
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* Quick Swipe/Response Buttons */}
                          <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-6 select-none font-sans">
                            <button
                              onClick={() => markAsPractice(currentCard.id)}
                              className="bg-white hover:bg-red-50 border-2 border-red-200 hover:border-red-400 text-red-700 font-extrabold text-xs md:text-sm py-4 px-5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                            >
                              <Heart className="w-4 h-4 shrink-0 fill-red-100" />
                              Da Ripassare
                            </button>
                            <button
                              onClick={() => markAsKnown(currentCard.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs md:text-sm py-4 px-5 rounded-2xl transition-all hover:shadow-md cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                            >
                              <CheckCircle className="w-4 h-4 shrink-0" />
                              Lo conosco!
                            </button>
                          </div>

                          {/* Manual Step Over Navigation Helpers */}
                          <div className="flex items-center justify-between w-full max-w-sm mt-5 select-none text-slate-500 font-sans">
                            <button
                              disabled={currentFlashIndex === 0}
                              onClick={() => { setCurrentFlashIndex(prev => Math.max(0, prev - 1)); setIsFlipped(false); }}
                              className="text-xs font-extrabold hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 cursor-pointer p-2 flex items-center gap-1"
                            >
                              &larr; Indietro
                            </button>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                              Procedimento: {Math.round((currentFlashIndex / filtered.length) * 100)}%
                            </span>
                            <button
                              onClick={() => { setCurrentFlashIndex(prev => prev + 1); setIsFlipped(false); }}
                              className="text-xs font-extrabold hover:text-slate-800 cursor-pointer p-2 flex items-center gap-1"
                            >
                              Sveglia &rarr;
                            </button>
                          </div>

                          {/* Interactive Progress Indicator Bar */}
                          <div className="w-full max-w-md bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3 shadow-inner">
                            <div 
                              className="bg-gradient-to-r from-amber-400 to-emerald-500 h-full transition-all duration-350"
                              style={{ width: `${Math.min(100, Math.max(0, (currentFlashIndex / filtered.length) * 100))}%` }}
                            />
                          </div>

                        </div>
                      )}

                    </div>

                    {/* Progress tracking footer panel */}
                    {filtered.length > 0 && isCurrentIndexInBounds && (
                      <div className="flex justify-between items-center border-t border-slate-100 pt-5 mt-6 text-slate-400 text-[10px] sm:text-xs">
                        <div className="flex gap-4 select-none font-sans">
                          <span className="flex items-center gap-1 font-bold">
                            <span className="w-2 h-2 rounded-full bg-slate-350" />
                            Schede: <strong className="text-slate-600">{filtered.length}</strong>
                          </span>
                          <span className="flex items-center gap-1 font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Conosciuti: <strong className="text-emerald-650">{totalKnown}</strong>
                          </span>
                          <span className="flex items-center gap-1 font-bold">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            Da ripassare: <strong className="text-red-650">{totalPractice}</strong>
                          </span>
                        </div>
                        <button
                          onClick={resetFlashcards}
                          className="text-slate-400 hover:text-amber-700 font-bold hover:underline cursor-pointer flex items-center gap-1 font-sans"
                          title="Resetta l'intera sessione"
                        >
                          <RotateCcw className="w-3 h-3" /> Resetta Tutto
                        </button>
                      </div>
                    )}

                  </div>
                );
              })()}

              {/* TAB CONTENT 7: A2 Open Writing Exercises (Produzione Scritta) */}
              {examMode === 'practice' && activeBentoTab === 'writing' && (() => {
                const prompt = A2_WRITING_PROMPTS[currentWritingIdx];
                const currentWordCount = studentWritingText.trim() === "" ? 0 : studentWritingText.trim().split(/\s+/).filter(Boolean).length;

                return (
                  <div id="bento-box-writing" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 md:p-8 min-h-[520px] flex flex-col justify-between animate-fade-in">
                    <div>
                      {/* Section Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5 font-sans">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl select-none">
                            ✍️
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm md:text-base">Produzione Scritta A2</h4>
                            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Esercitati con compiti reali tratti da esami CILS e PLIDA!</p>
                          </div>
                        </div>
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-full border border-blue-200">
                          COMPOSIZIONE LIBERA
                        </span>
                      </div>

                      {/* Prompts Bento-style Layout */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
                        
                        {/* Prompt Selector List (4 columns) */}
                        <div className="lg:col-span-4 bg-slate-50 border border-slate-150 p-4 rounded-2.5xl flex flex-col gap-2.5">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 font-sans select-none">Seleziona Traccia</h5>
                          {A2_WRITING_PROMPTS.map((item, idx) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                setCurrentWritingIdx(idx);
                                setStudentWritingText("");
                                setWritingEvaluation(null);
                                setWritingErrorMsg("");
                              }}
                              className={`w-full text-left p-3.5 rounded-2xl transition-all border text-xs focus:outline-none cursor-pointer ${currentWritingIdx === idx ? 'bg-blue-600 border-blue-600 text-white font-extrabold shadow-sm' : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-100 hover:text-slate-850'}`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${currentWritingIdx === idx ? 'bg-blue-700/60 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                  {item.examType}
                                </span>
                                <span className="text-[10px] opacity-80 font-medium font-mono">
                                  {item.targetWordCount}
                                </span>
                              </div>
                              <p className="font-bold truncate">{item.title}</p>
                            </button>
                          ))}
                        </div>

                        {/* Main Editor & Results Dashboard (8 columns) */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                          
                          {/* Active Prompt Description */}
                          <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/25 border border-blue-100 rounded-2.5xl p-6">
                            <span className="text-[9px] font-black tracking-widest text-blue-600 uppercase">Traccia Corrente • {prompt.examType}</span>
                            <h4 className="text-base font-extrabold text-slate-900 mt-1 mb-2">{prompt.title}</h4>
                            <p className="text-slate-650 text-sm font-semibold leading-relaxed mb-4">{prompt.promptText}</p>
                            
                            {/* Guidelines list */}
                            <div className="bg-white rounded-xl p-4 border border-blue-100/50 mb-4">
                              <h5 className="text-[10px] font-black text-slate-450 uppercase tracking-widest mb-2 flex items-center gap-1">📋 Requisiti Obbligatori</h5>
                              <ul className="space-y-1.5 text-xs text-slate-600 font-semibold">
                                {prompt.guidelines.map((g, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-blue-500 font-extrabold shrink-0">•</span>
                                    <span>{g}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Suggested vocabulary */}
                            <div>
                              <h5 className="text-[10px] font-black text-slate-450 uppercase tracking-widest mb-2">💡 Vocabolario Suggerito (Tocca per ascoltare)</h5>
                              <div className="flex flex-wrap gap-1.5">
                                {prompt.suggestedHelperWords.map((word, i) => (
                                  <button
                                    key={i}
                                    onClick={() => speakItalian(word)}
                                    className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-350 text-slate-700 hover:text-blue-700 font-semibold text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                  >
                                    <span>{word}</span>
                                    <Volume2 className="w-3 h-3 text-slate-400 hover:text-blue-500 shrink-0" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Error block if any */}
                          {writingErrorMsg && (
                            <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-semibold p-4 rounded-2xl flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 shrink-0 text-red-650 animate-bounce" />
                              <span>{writingErrorMsg}</span>
                            </div>
                          )}

                          {/* Writing Worksheet Stage */}
                          {!writingEvaluation ? (
                            <div className="space-y-4">
                              <div className="relative">
                                <textarea
                                  value={studentWritingText}
                                  onChange={(e) => setStudentWritingText(e.target.value)}
                                  disabled={isWritingEvaluating}
                                  rows={6}
                                  placeholder="Scrivi qui il tuo testo in Italiano... Ricorda l'accordo di genere, numero e l'uso corretto di verbi e preposizioni."
                                  className="w-full resize-none bg-slate-50 hover:bg-slate-100/50 border-2 border-slate-200 focus:border-blue-500 text-slate-800 placeholder-slate-450 font-semibold text-sm md:text-base rounded-2.5xl p-5 md:p-6 transition-all focus:outline-none focus:ring-4 focus:ring-blue-100/50 leading-relaxed shadow-inner"
                                />
                                <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md border border-slate-700/20 text-white font-mono text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-2 select-none">
                                  <span>{currentWordCount} parole</span>
                                  <span className="text-slate-400 border-l border-slate-700 pl-2">Target: {prompt.targetWordCount}</span>
                                </div>
                              </div>

                              <button
                                onClick={handleEvaluateWriting}
                                disabled={isWritingEvaluating || !studentWritingText.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm py-4.5 px-6 rounded-2.5xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2.5"
                              >
                                {isWritingEvaluating ? (
                                  <>
                                    <div className="w-4.5 h-4.5 border-3 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                                    <span>Il Professore sta correggendo l'elaborato...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4" />
                                    <span>Consegna Compito al Professore</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            /* Structured Evaluation Results Screen */
                            <div className="space-y-6 animate-fade-in text-slate-800">
                              
                              {/* Summary Score Bar */}
                              <div className="bg-slate-900 text-white rounded-2.5xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow ${writingEvaluation.passed ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                    {writingEvaluation.score}
                                  </div>
                                  <div>
                                    <h5 className="font-extrabold text-sm md:text-base leading-tight">Valutazione del Professore</h5>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                      {writingEvaluation.passed ? '🎉 PROMOSSO!' : '✍️ DA RIPASSARE'} (Soglia d'esame: 12/20) • {writingEvaluation.wordCount} parole scritte
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setStudentWritingText("");
                                    setWritingEvaluation(null);
                                    setWritingErrorMsg("");
                                  }}
                                  className="bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs py-2.5 px-4.5 rounded-xl transition-all cursor-pointer"
                                >
                                  Scrivi Ancora
                                </button>
                              </div>

                              {/* Errors breakdown block */}
                              <div className="bg-white border border-slate-200 rounded-2.5xl p-6">
                                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4">✍️ Analisi degli Errori</h5>
                                {writingEvaluation.errors && writingEvaluation.errors.length > 0 ? (
                                  <div className="space-y-3.5">
                                    {writingEvaluation.errors.map((errObject: any, iIndex: number) => (
                                      <div key={iIndex} className="bg-red-50/40 hover:bg-red-50/75 border border-red-100 rounded-xl p-4 flex items-start gap-3 transition-colors">
                                        <div className="w-5.5 h-5.5 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                                          !
                                        </div>
                                        <div className="flex-grow space-y-1 text-xs">
                                          <div className="flex flex-wrap items-center gap-1.5 text-slate-800 font-semibold">
                                            <span className="font-bold line-through text-slate-400">&ldquo;{errObject.original}&rdquo;</span>
                                            <span className="text-slate-450 text-[10px] font-bold">&rarr;</span>
                                            <span className="text-emerald-700 font-black">&ldquo;{errObject.correction}&rdquo;</span>
                                            <span className="bg-red-100 text-red-800 text-[8px] font-black uppercase px-2 py-0.5 rounded select-none shrink-0 border border-red-200/50">
                                              {errObject.category}
                                            </span>
                                          </div>
                                          <p className="text-slate-600 font-medium leading-relaxed italic">{errObject.explanation}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold p-4 rounded-xl flex items-center gap-2">
                                    <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                                    <span>Nessun errore orografico o strutturale rilevato! Sei stato eccezionale.</span>
                                  </div>
                                )}
                              </div>

                              {/* Perfect Model Version from Professore */}
                              <div className="bg-amber-50/45 border-2 border-dashed border-amber-250 rounded-2.5xl p-6 relative">
                                <span className="bg-amber-100 text-amber-850 text-[9px] font-black uppercase px-2.5 py-1 rounded border border-amber-250 absolute -top-3 left-6">
                                  VERSIONE MODELLO DEL PROFESSORE
                                </span>
                                <div className="flex justify-between items-start gap-4 mt-2">
                                  <div className="flex-grow text-slate-800 font-bold italic text-sm md:text-base leading-relaxed p-0.5">
                                    {writingEvaluation.perfectVersion}
                                  </div>
                                  <button
                                    onClick={() => speakItalian(writingEvaluation.perfectVersion)}
                                    className={`p-2.5 rounded-xl transition-all cursor-pointer border shrink-0 ${currentlySpeaking === writingEvaluation.perfectVersion ? 'bg-amber-600 text-white border-amber-600' : 'bg-white hover:bg-amber-100 text-slate-650 hover:text-amber-800 border-amber-200 shadow-sm'}`}
                                    title="Ascolta la pronuncia"
                                  >
                                    {currentlySpeaking === writingEvaluation.perfectVersion ? <VolumeX className="w-4 h-4 text-white animate-pulse" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                                  </button>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3 pl-1">🎯 Premi il tasto a destra per ascoltare come leggere fluidamente la versione corretta!</p>
                              </div>

                              {/* Mentoring Coach Suggestions Block */}
                              <div className="bg-blue-50/40 border border-blue-100 rounded-2.5xl p-6">
                                <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-3 mb-4">💡 Rapporto di Miglioramento</h5>
                                <div className="text-slate-650 text-xs font-semibold leading-relaxed">
                                  <p>{writingEvaluation.coachingReport}</p>
                                </div>
                              </div>

                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* PRACTICE MODE COMPANION: Explanation block layout below primary questions */}
              {examMode === 'practice' && activeBentoTab === 'questions' && userAnswers[questions[currentIndex].id] !== undefined && (
                <div id="bento-box-explanation-widget" className="bg-emerald-600 rounded-3xl p-8 flex items-start gap-5 shadow-inner text-white">
                  <div className="w-12 h-12 shrink-0 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl select-none">
                    💡
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                      <h4 className="font-extrabold text-lg">Spiegazione ed Analisi Vocabolario</h4>
                      {hasApiKey && (
                        <button
                          onClick={fetchDeepAiExplanation}
                          disabled={isAiExplaining}
                          className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-1.5 px-4 rounded-full border border-white/20 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {isAiExplaining ? 'In corso...' : 'Deep AI Breakdown'}
                        </button>
                      )}
                    </div>

                    <div className="text-emerald-50 leading-relaxed text-sm font-medium leading-sans">
                      {isAiExplaining ? (
                        <div className="italic animate-pulse">Generando spiegazione grammaticale dettagliata tramite il professore AI...</div>
                      ) : currentAiExplanation ? (
                        <MiniMarkdown text={currentAiExplanation} mode="light" />
                      ) : (
                        "Seleziona un'opzione per visualizzare la regola grammaticale o il breakdown del vocabolario."
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* COLUMN RIGHT: Bento Widgets Sidebar (4 of 12 columns) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Widget A: Andamento (Current Progress Meter) */}
              {examMode === 'practice' && (
                <div id="bento-box-progress" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Andamento Corrente</h3>
                  
                  <div className="flex-grow flex flex-col items-center justify-center py-6">
                    {/* Perfect native SVG circular progress ring */}
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                        {/* Background track */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="transparent"
                          stroke="#f1f5f9"
                          strokeWidth="10"
                        />
                        {/* Progressive arc (emerald-500 = #10b981) */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="transparent"
                          stroke="#10b981"
                          strokeWidth="10"
                          strokeDasharray="314.16"
                          strokeDashoffset={314.16 - (314.16 * completionPercent) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-3xl font-black block text-slate-800">{completionPercent}%</span>
                        <span className="text-[10px] font-black text-slate-400">COMPLETATO</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-400 font-bold mt-4">
                      Completate: {totalAnswered} su {questions.length} domande
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Corrette</p>
                      <p className="text-2xl font-black text-emerald-600 mt-1">{correctCount}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Errate</p>
                      <p className="text-2xl font-black text-rose-500 mt-1">{incorrectCount}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Widget B: Mappa Risposte (Answers Map Grid) */}
              <div id="bento-box-map" className="bg-slate-900 rounded-3xl p-6 flex flex-col justify-between overflow-hidden text-white">
                <div>
                  <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">Mappa Risposte (50 Blocchi)</h3>
                  
                  <div className="grid grid-cols-10 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {questions.map((q, idx) => {
                      const userAnsIdx = userAnswers[q.id];
                      const isAnswered = userAnsIdx !== undefined;
                      const isCorrect = isAnswered && userAnsIdx === q.correctAnswerIndex;
                      
                      let bgStyle = "bg-slate-800 hover:bg-slate-700 text-slate-400";
                      
                      if (currentIndex === idx) {
                        bgStyle = "bg-blue-500 text-white animate-pulse ring-2 ring-white";
                      } else if (isAnswered) {
                        if (examMode === 'practice') {
                          bgStyle = isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white";
                        } else {
                          // Exam Mode: just general grey block showing 'completed'
                          bgStyle = "bg-slate-600 text-white";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          id={`map-block-${idx}`}
                          onClick={() => {
                            if (examMode === 'practice') {
                              setCurrentIndex(idx);
                              setCurrentAiExplanation(null);
                            }
                          }}
                          className={`w-full aspect-square text-[9px] font-black rounded-lg flex items-center justify-center transition-all ${bgStyle} cursor-pointer`}
                          title={`Domanda ${idx + 1}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[10px] text-slate-400 font-bold mt-3 italic leading-relaxed">
                    {examMode === 'practice' ? 'Tocca una casella per saltare direttamente a quel quesito d\'esame.' : 'I blocchi scuri indicano risposte inserite nel foglio d\'esame.'}
                  </p>
                </div>

                {examMode === 'practice' && (
                  <div className="mt-6 flex flex-col gap-2 border-t border-slate-800 pt-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold flex items-center gap-1">🔥 Streak Attuale:</span>
                      <span className="text-emerald-400 font-extrabold">{localStreak} risposte</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${Math.min((localStreak / 10) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </main>
      )}

      {/* Screen 3: Complete Results Summary Analytics Screen */}
      {currentScreen === 'results' && (
        <main id="results-screen" className="max-w-4xl mx-auto px-6 py-12">
          
          {/* Main Grade Header */}
          <section className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs px-4 py-1.5 rounded-full mb-4 border border-emerald-200">
              <Award className="w-4 h-4" /> TEST CONCLUSO CON SUCCESSO
            </div>
            
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
              Il tuo Risultato d'Esame
            </h2>
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
              {correctCount >= (examMode === 'prefettura' ? 40 : 30) ? '🎉 Promosso! Livello A2 Raggiunto' : '✍️ Ci sei quasi! Ti consigliamo più esercizio'}
              {examMode === 'prefettura' && (
                <span className="block mt-1 text-[10px] text-slate-400 normal-case tracking-normal">Soglia ufficiale Prefettura · 80% (40/50 in Phase 1; ponderato 80/100 in Simulazione completa)</span>
              )}
            </p>

            {/* Score Grid layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-8">
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Domande Corrette</span>
                <span className="block text-4xl font-black text-emerald-600 mt-2">{correctCount} <span className="text-base text-slate-400 font-medium">/ 50</span></span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Punteggio Percentuale</span>
                <span className="block text-4xl font-black text-slate-800 mt-2">{correctPercent}%</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risposte Errate</span>
                <span className="block text-4xl font-black text-rose-500 mt-2">{incorrectCount}</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Streak Massimo</span>
                <span className="block text-4xl font-black text-indigo-600 mt-2">{maxStreak}</span>
              </div>

            </div>
          </section>

          {/* Results Bento Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left box: Category scores breakdowns (5 of 12 columns) */}
            <div className="md:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Grafico Categoria QCER</h3>
              
              <div className="space-y-4">
                {categoryStatsList.length > 0 ? (
                  categoryStatsList.map((stat, i) => {
                    const pct = Math.round((stat.correct / stat.total) * 100);
                    return (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                          <span>{stat.category}</span>
                          <span>{stat.correct}/{stat.total} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-rose-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic">Nessun dato statistico raccolto.</p>
                )}
              </div>
            </div>

            {/* Right box: Deep AI Study Feedback (7 of 12 columns) */}
            <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">Rapporto di Studio Personalizzato</h3>
              </div>

              {isCoachingLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6" />
                  <p className="text-xs text-slate-400 italic animate-pulse">Il Professore AI sta esaminando gli sforzi e compilando la spiegazione dei tuoi errori...</p>
                </div>
              ) : coachingFeedback ? (
                <div className="max-h-[380px] overflow-y-auto pr-2 border-b border-slate-50 pb-4 mb-4">
                  <MiniMarkdown text={coachingFeedback} mode="dark" />
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-medium leading-relaxed">
                  {incorrectCount === 0 ? (
                    <p className="text-emerald-700 font-bold bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      Perfetto! Non hai sbagliato nessuna risposta, sei pronto per l'esame vero e proprio!
                    </p>
                  ) : (
                    <p className="italic text-slate-400">
                      Disponibile con la connessione AI. Avvia un test ed esegui errori per ricevere compiti personalizzati.
                    </p>
                  )}
                </div>
              )}

              {/* Reset Quiz Button */}
              <div className="flex gap-4 mt-6">
                <button 
                  onClick={() => handleStartQuiz('exam')}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-4 px-6 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Ripeti Esame (Nuovo Mix)
                </button>
                <button 
                  onClick={() => setCurrentScreen('menu')}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-extrabold text-xs py-4 px-6 rounded-2xl transition-all cursor-pointer"
                >
                  Torna al Menu
                </button>
              </div>

            </div>

          </div>

          {/* Detailed Questions Review Area */}
          <div className="mt-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-indigo-600" />
                  Correzione e Spiegazioni Dettagliate
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-semibold">
                  Esamina ogni singola domanda per comprendere gli errori e approfondire le regole QCER A2.
                </p>
              </div>
              
              {/* Filter controls */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setResultsFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${resultsFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
                >
                  Tutte ({questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setResultsFilter('correct')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${resultsFilter === 'correct' ? 'bg-emerald-500 text-white shadow-sm font-semibold' : 'hover:text-emerald-600 text-emerald-705 font-bold'}`}
                >
                  Corrette ({questions.filter(q => q && userAnswers[q.id] === q.correctAnswerIndex).length})
                </button>
                <button
                  type="button"
                  onClick={() => setResultsFilter('incorrect')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${resultsFilter === 'incorrect' ? 'bg-rose-500 text-white shadow-sm font-semibold' : 'hover:text-rose-600 text-rose-705'}`}
                >
                  Errate ({questions.filter(q => q && userAnswers[q.id] !== q.correctAnswerIndex).length})
                </button>
              </div>
            </div>

            {/* Questions list */}
            <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2">
              {questions
                .filter((q) => {
                  if (!q) return false;
                  const isCorrect = userAnswers[q.id] === q.correctAnswerIndex;
                  if (resultsFilter === 'correct') return isCorrect;
                  if (resultsFilter === 'incorrect') return !isCorrect;
                  return true;
                })
                .map((q, idx) => {
                  if (!q) return null;
                  const userAnsIdx = userAnswers[q.id];
                  const isCorrect = userAnsIdx === q.correctAnswerIndex;
                  const isUnanswered = userAnsIdx === undefined;
                  
                  return (
                    <div 
                      key={q.id || `res-q-${idx}`} 
                      className={`p-5 rounded-2xl border transition-all ${
                        isUnanswered 
                          ? 'border-yellow-250 bg-yellow-50/20' 
                          : isCorrect 
                            ? 'border-emerald-200/60 bg-emerald-50/10' 
                            : 'border-rose-200/60 bg-rose-50/10'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                            Domanda {idx + 1}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/50">
                            {q.category || "Generale"}
                          </span>
                        </div>
                        
                        <div>
                          {isUnanswered ? (
                            <span className="text-[10px] font-black text-yellow-750 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-200">
                              🟡 Non data
                            </span>
                          ) : isCorrect ? (
                            <span className="text-[10px] font-black text-emerald-750 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 font-bold">
                              <Check className="w-3 h-3" /> Risposta Corretta
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-rose-750 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1 font-bold">
                              <XCircle className="w-3 h-3" /> Errore
                            </span>
                          )}
                        </div>
                      </div>

                      {q.context && (
                        <p className="text-[11px] font-bold text-slate-500 italic mb-2 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                          {q.context}
                        </p>
                      )}
                      
                      <h4 className="text-sm font-bold text-slate-800 leading-relaxed mb-4 whitespace-pre-wrap">
                        {q.questionText}
                      </h4>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                        {(q.options || []).map((option, optIdx) => {
                          const isThisCorrect = optIdx === q.correctAnswerIndex;
                          const isThisUserSelected = optIdx === userAnsIdx;
                          
                          let cardStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-700";
                          let badgeText = null;

                          if (isThisCorrect) {
                            cardStyle = "border-emerald-400 bg-emerald-50/40 text-emerald-900 font-bold shadow-sm";
                            badgeText = "Esatta";
                          } else if (isThisUserSelected) {
                            cardStyle = "border-rose-400 bg-rose-50/40 text-rose-900 font-bold shadow-sm";
                            badgeText = "Errata";
                          }

                          return (
                            <div 
                              key={optIdx} 
                              className={`p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between ${cardStyle}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                                  isThisCorrect 
                                    ? 'bg-emerald-500 text-white' 
                                    : isThisUserSelected 
                                      ? 'bg-rose-500 text-white' 
                                      : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{option}</span>
                              </div>
                              {badgeText && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-white/70">
                                  {badgeText}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Block */}
                      <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 mt-2">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Spiegazione Grammatica:</span>
                            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                              {q.explanation || "Questa domanda si riferisce all'uso corretto degli elementi grammaticali o alla logica di lettura A2."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Flag-as-broken */}
                      <div className="flex justify-end mt-3">
                        <button
                          type="button"
                          onClick={() => handleFlagQuestion(q.id)}
                          disabled={flaggedIds.has(q.id)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                            flaggedIds.has(q.id)
                              ? 'border-amber-200 bg-amber-50 text-amber-700 cursor-default'
                              : 'border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 cursor-pointer'
                          }`}
                          title="Segnala questa domanda come errata"
                        >
                          {flaggedIds.has(q.id) ? '✓ Segnalata' : '🚩 Segnala domanda'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              
              {questions
                .filter((q) => {
                  if (!q) return false;
                  const isCorrect = userAnswers[q.id] === q.correctAnswerIndex;
                  if (resultsFilter === 'correct') return isCorrect;
                  if (resultsFilter === 'incorrect') return !isCorrect;
                  return true;
                }).length === 0 && (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-sm font-semibold text-slate-400">Nessuna domanda corrispondente al filtro selezionato.</p>
                </div>
              )}
            </div>
          </div>

        </main>
      )}

      {/* Floating AI Generation Toast Alert */}
      {aiGenerationToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700/30 text-white shadow-xl max-w-sm rounded-2xl p-4.5 flex items-center gap-3.5"
        >
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 shadow text-xl select-none">
            🤖
          </div>
          <div className="flex-1">
            <h5 className="text-[10px] font-black tracking-widest text-[#00E676] uppercase">Banca Dati Aggiornata</h5>
            <p className="text-xs text-slate-100 mt-0.5 font-bold leading-normal">{aiGenerationToast}</p>
          </div>
        </motion.div>
      )}

      {/* Footer copyright */}
      <footer className="bg-white border-t border-slate-200/60 text-center py-8 text-xs text-slate-400 font-medium mt-16">
        <p>© 2026 Pronto! Italiano A2 - Preparazione Esami di Lingua Italiana per Stranieri.</p>
        <p className="mt-1 text-[10px]">Realizzato in conformità con i requisiti QCER / CEFR.</p>
      </footer>

    </div>
  );
}
