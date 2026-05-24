/**
 * Verbatim sample questions from the official A2 exam booklets:
 *   - Università per Stranieri di Siena, CILS A2 Quaderno di esame (June 2017)
 *   - Società Dante Alighieri, PLIDA A2 Esempio di prova d'esame
 *
 * These are the ground truth for what the AI-generated questions should
 * resemble. They are inserted into the DB with source='official' and are also
 * used as few-shot examples in the Gemini generation prompt.
 *
 * Scope decisions:
 *   - Ascolto (listening) is skipped because the app cannot play the official
 *     audio.
 *   - The CILS open-answer prove (adjective inflection, verb conjugation) are
 *     converted to 3-option MC questions — the only schema the app supports.
 *   - PLIDA image-matching exercises (Ascoltare seconda parte) are also
 *     skipped; there are no images to render.
 *
 * Section/id conventions: `off_cils_*` / `off_plida_*` so they're easy to find.
 */

import type { Question } from '../types';

export const officialSamples: Question[] = [
  // ============================================================
  // CILS A2 — Comprensione della lettura — Prova n. 1
  // Source text: "La pizza napoletana a Firenze"
  // ============================================================
  {
    id: 'off_cils_let1_q1',
    category: 'Lettura',
    section: 'CILS Lettura Prova 1',
    context:
      'LA PIZZA NAPOLETANA A FIRENZE\n\nIl re della pizza a Firenze è sempre stato Giovanni Santarpia. Ma ora c\'è anche la Buoneria, una nuova pizzeria napoletana che ha aperto giovedì 2 marzo con una festa di inaugurazione dalle 20.00 alle 24.00. Il pizzaiolo è Antonio Starita, che viene direttamente da Napoli e porta con sé una ricetta di inizio Novecento. Soffice e leggera e con ingredienti di qualità: pomodoro fresco e mozzarella fior di latte. Il locale ha già avuto un grande successo ed è molto difficile trovare un tavolo, soprattutto nel fine settimana devi assolutamente prenotare.',
    questionText: 'Giovanni Santarpia è',
    options: ['un pizzaiolo conosciuto', 'un attore di teatro', 'un cantante famoso'],
    correctAnswerIndex: 0,
    explanation:
      'Il testo dice "Il re della pizza a Firenze è sempre stato Giovanni Santarpia" — è quindi un pizzaiolo famoso.',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_let1_q2',
    category: 'Lettura',
    section: 'CILS Lettura Prova 1',
    context:
      'LA PIZZA NAPOLETANA A FIRENZE\n\nIl re della pizza a Firenze è sempre stato Giovanni Santarpia. Ma ora c\'è anche la Buoneria, una nuova pizzeria napoletana che ha aperto giovedì 2 marzo con una festa di inaugurazione dalle 20.00 alle 24.00. Il pizzaiolo è Antonio Starita, che viene direttamente da Napoli e porta con sé una ricetta di inizio Novecento.',
    questionText: 'Il 2 marzo la Buoneria',
    options: ['ha aperto alle 19.00', 'ha offerto la cena a tutti', 'ha chiuso alle 24.00'],
    correctAnswerIndex: 2,
    explanation:
      'Il testo dice "una festa di inaugurazione dalle 20.00 alle 24.00": il locale ha chiuso alle 24.00. L\'apertura è stata alle 20.00, non alle 19.00.',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_let1_q3',
    category: 'Lettura',
    section: 'CILS Lettura Prova 1',
    context:
      'LA PIZZA NAPOLETANA A FIRENZE\n\nLa Buoneria è una nuova pizzeria napoletana. Il pizzaiolo è Antonio Starita, che viene direttamente da Napoli e porta con sé una ricetta di inizio Novecento. Soffice e leggera e con ingredienti di qualità: pomodoro fresco e mozzarella fior di latte.',
    questionText: 'Alla Buoneria puoi mangiare',
    options: ['i piatti tipici di Firenze', 'la vera pizza napoletana', 'la pasta con una ricetta antica'],
    correctAnswerIndex: 1,
    explanation:
      'La Buoneria è una "pizzeria napoletana" con pizzaiolo che viene da Napoli e usa una ricetta di inizio Novecento: serve la vera pizza napoletana.',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_let1_q4',
    category: 'Lettura',
    section: 'CILS Lettura Prova 1',
    context:
      'Il locale ha già avuto un grande successo ed è molto difficile trovare un tavolo, soprattutto nel fine settimana devi assolutamente prenotare.',
    questionText: 'La Buoneria è un posto',
    options: ['sempre pieno di gente', 'molto elegante', 'abbastanza economico'],
    correctAnswerIndex: 0,
    explanation:
      'Il testo dice "ha già avuto un grande successo ed è molto difficile trovare un tavolo": il locale è sempre pieno.',
    difficulty: 'A2',
  },

  // ============================================================
  // CILS A2 — Comprensione della lettura — Prova n. 2
  // Format: a short ad + 3 statements; pick the one that's actually in the text.
  // ============================================================
  {
    id: 'off_cils_let2_q1',
    category: 'Lettura',
    section: 'CILS Lettura Prova 2',
    context:
      'Case in affitto:\n"Affittasi a Viareggio bilocale arredato: soggiorno con angolo cottura, camera matrimoniale, bagno, terrazzo con vista mare. 3° piano con ascensore, posto auto esterno. Disponibile da subito. Prezzo: euro 400,00."',
    questionText: 'Quale informazione è presente nel testo?',
    options: [
      'Dall\'appartamento puoi vedere il mare',
      'L\'appartamento ha un garage condominiale',
      'L\'appartamento in questo momento è occupato',
    ],
    correctAnswerIndex: 0,
    explanation:
      'Il testo dice "terrazzo con vista mare". Il garage non è menzionato (si parla di "posto auto esterno") e l\'appartamento è "Disponibile da subito".',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_let2_q2',
    category: 'Lettura',
    section: 'CILS Lettura Prova 2',
    context:
      'Sportello Assistenza agli studenti:\n"Università degli Studi di Pisa - Sportello Assistenza - orario di apertura al pubblico:\n- martedì: solo su appuntamento dalle ore 15.30 alle ore 17.30\n- mercoledì: ore 11.00-13.00\n- venerdì: ore 9.00-11.00."',
    questionText: 'Quale informazione è presente nel testo?',
    options: [
      'Il martedì lo Sportello Assistenza riceve gli studenti che hanno appuntamento',
      'Lo Sportello Assistenza è chiuso il mercoledì',
      'Il venerdì lo Sportello Assistenza è aperto nel pomeriggio',
    ],
    correctAnswerIndex: 0,
    explanation:
      'Il testo specifica "martedì: solo su appuntamento". Il mercoledì è aperto dalle 11 alle 13, e il venerdì la mattina (9-11), non il pomeriggio.',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_let2_q3',
    category: 'Lettura',
    section: 'CILS Lettura Prova 2',
    context:
      'Hotel Tiberio:\n"L\'Hotel Tiberio è un albergo completamente nuovo. È un hotel a 4 stelle e si affaccia direttamente sul mare. È a soli 3 km dall\'aeroporto internazionale di Fiumicino e a pochi km da Roma."',
    questionText: 'Quale informazione è presente nel testo?',
    options: [
      'L\'Hotel Tiberio si trova in un antico palazzo',
      'L\'Hotel Tiberio è vicino all\'aeroporto',
      'L\'Hotel Tiberio ha una grande piscina',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Il testo dice "a soli 3 km dall\'aeroporto internazionale di Fiumicino": l\'hotel è quindi vicino all\'aeroporto. È "completamente nuovo" (non antico) e non si parla di piscina.',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_let2_q4',
    category: 'Lettura',
    section: 'CILS Lettura Prova 2',
    context:
      'Corsi di lingua italiana a Firenze:\n"La scuola di lingua Machiavelli a Firenze organizza corsi di lingua e cultura italiana per stranieri dal 1978. Offre anche corsi di cucina e arte."',
    questionText: 'Quale informazione è presente nel testo?',
    options: [
      'I corsi della scuola Machiavelli comprendono la visita della città',
      'Alla scuola Machiavelli puoi imparare a cucinare',
      'La scuola Machiavelli organizza anche corsi online',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Il testo dice "Offre anche corsi di cucina e arte": si può imparare a cucinare. Visite della città e corsi online non sono menzionati.',
    difficulty: 'A2',
  },

  // ============================================================
  // CILS A2 — Analisi delle strutture — Prova n. 3 (cloze)
  // Source text: "Il mio cane" — 8 items, each A/B/C.
  // ============================================================
  {
    id: 'off_cils_cloze_q1',
    category: 'Grammatica',
    section: 'CILS Cloze',
    context:
      'IL MIO CANE\n\nDa qualche mese ho un cane. Si chiama Buio. È molto carino, ha il pelo __________ e nero. Ha sempre fame!',
    questionText: 'ha il pelo __________ e nero',
    options: ['largo', 'lungo', 'alto'],
    correctAnswerIndex: 1,
    explanation:
      '"Pelo lungo" è la combinazione naturale in italiano per descrivere il pelo di un cane. "Largo" e "alto" non si usano per il pelo.',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_cloze_q2',
    category: 'Grammatica',
    section: 'CILS Cloze',
    context:
      'IL MIO CANE\n\nHa sempre fame! Come tutti i cani mangia una volta al __________, però spesso fa degli spuntini insieme a me.',
    questionText: 'mangia una volta al __________',
    options: ['tempo', 'momento', 'giorno'],
    correctAnswerIndex: 2,
    explanation:
      '"Una volta al giorno" è l\'espressione standard per indicare la frequenza giornaliera. "Una volta al tempo / al momento" non sono espressioni italiane.',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_cloze_q3',
    category: 'Grammatica',
    section: 'CILS Cloze',
    context:
      'IL MIO CANE\n\nIl suo __________ preferito è in fondo al mio letto e la notte dorme insieme a me.',
    questionText: 'Il suo __________ preferito è in fondo al mio letto',
    options: ['campo', 'posto', 'terreno'],
    correctAnswerIndex: 1,
    explanation:
      '"Posto preferito" significa il luogo che preferisce. "Campo" e "terreno" sono spazi all\'aperto e non si usano in questo contesto.',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_cloze_q4',
    category: 'Grammatica',
    section: 'CILS Cloze',
    context:
      'IL MIO CANE\n\nIl suo posto preferito è in fondo al mio letto e la notte __________ insieme a me.',
    questionText: 'la notte __________ insieme a me',
    options: ['dorme', 'sogna', 'vive'],
    correctAnswerIndex: 0,
    explanation:
      'Il cane "dorme" nel letto la notte. "Sogna" non si usa con "insieme a me" e "vive" indica un\'azione permanente, non notturna.',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_cloze_q5',
    category: 'Grammatica',
    section: 'CILS Cloze',
    context: 'IL MIO CANE\n\nNon sta mai __________, corre e gioca continuamente.',
    questionText: 'Non sta mai __________',
    options: ['fermo', 'fisso', 'spento'],
    correctAnswerIndex: 0,
    explanation:
      '"Stare fermo" significa non muoversi: è l\'opposto di "correre e giocare continuamente". "Fisso" si usa per oggetti, "spento" per dispositivi.',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_cloze_q6',
    category: 'Grammatica',
    section: 'CILS Cloze',
    context: 'IL MIO CANE\n\nMi fa molta __________, specialmente quando sono sola a casa.',
    questionText: 'Mi fa molta __________',
    options: ['amicizia', 'compagnia', 'simpatia'],
    correctAnswerIndex: 1,
    explanation:
      '"Fare compagnia" è un\'espressione fissa che significa stare con qualcuno per non farlo sentire solo. "Amicizia" e "simpatia" non si combinano con "fare".',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_cloze_q7',
    category: 'Grammatica',
    section: 'CILS Cloze',
    context: 'IL MIO CANE\n\nMi fa molta compagnia, specialmente quando sono sola a __________.',
    questionText: 'quando sono sola a __________',
    options: ['scuola', 'palazzo', 'casa'],
    correctAnswerIndex: 2,
    explanation:
      '"A casa" è l\'espressione standard senza articolo, come "a scuola". Ma in questo contesto della propria abitazione si dice "sola a casa". "A palazzo" non si usa con il verbo "essere sola".',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_cloze_q8',
    category: 'Grammatica',
    section: 'CILS Cloze',
    context: 'IL MIO CANE\n\nBuio è molto intelligente e quando vuole __________ abbaia forte.',
    questionText: 'quando vuole __________ abbaia forte',
    options: ['uscire', 'salire', 'partire'],
    correctAnswerIndex: 0,
    explanation:
      'Il cane abbaia per chiedere di "uscire" di casa. "Salire" e "partire" non hanno senso in questo contesto domestico.',
    difficulty: 'A2',
  },

  // ============================================================
  // CILS A2 — Analisi delle strutture — Prova n. 1 (adjective inflection)
  // Originally open-answer; converted to MC with 3 plausible forms.
  // Source text: "Benvenuti all'agriturismo Nico"
  // ============================================================
  {
    id: 'off_cils_adj_q1',
    category: 'Grammatica',
    section: 'CILS Aggettivi',
    context: 'L\'agriturismo Nico si trova in Toscana su una dolce collina, in mezzo ad (antico) __________ alberi di olivo.',
    questionText: 'Forma corretta di "antico" davanti a "alberi di olivo":',
    options: ['antichi', 'antiche', 'antico'],
    correctAnswerIndex: 0,
    explanation:
      '"Alberi" è maschile plurale, quindi l\'aggettivo prende la forma "antichi" (con la -h- per mantenere il suono duro davanti alla -i).',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_adj_q2',
    category: 'Grammatica',
    section: 'CILS Aggettivi',
    context: 'In mezzo ad antichi alberi di olivo e a prati (verde) __________.',
    questionText: 'Forma corretta di "verde" con "prati":',
    options: ['verdi', 'verde', 'verdo'],
    correctAnswerIndex: 0,
    explanation: '"Verde" è un aggettivo della seconda classe (in -e): al plurale diventa "verdi" sia maschile che femminile.',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_adj_q3',
    category: 'Grammatica',
    section: 'CILS Aggettivi',
    context: 'Nico è in una posizione (tranquillo) __________, con una magnifica vista sulla città.',
    questionText: 'Forma corretta di "tranquillo" con "posizione":',
    options: ['tranquilla', 'tranquillo', 'tranquilli'],
    correctAnswerIndex: 0,
    explanation: '"Posizione" è femminile singolare, quindi "tranquillo" diventa "tranquilla".',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_adj_q4',
    category: 'Grammatica',
    section: 'CILS Aggettivi',
    context: 'L\'agriturismo è situato al centro di una (piccolo) __________ azienda.',
    questionText: 'Forma corretta di "piccolo" con "azienda":',
    options: ['piccola', 'piccolo', 'piccole'],
    correctAnswerIndex: 0,
    explanation: '"Azienda" è femminile singolare: "piccola".',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_adj_q5',
    category: 'Grammatica',
    section: 'CILS Aggettivi',
    context: 'I proprietari si interessano di agricoltura (naturale) __________.',
    questionText: 'Forma corretta di "naturale" con "agricoltura":',
    options: ['naturale', 'naturali', 'naturala'],
    correctAnswerIndex: 0,
    explanation:
      '"Agricoltura" è femminile singolare; "naturale" è invariabile al singolare (forma in -e per maschile e femminile), quindi resta "naturale".',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_adj_q6',
    category: 'Grammatica',
    section: 'CILS Aggettivi',
    context: 'Producono olio di (alto) __________ qualità.',
    questionText: 'Forma corretta di "alto" con "qualità":',
    options: ['alta', 'alto', 'alti'],
    correctAnswerIndex: 0,
    explanation: '"Qualità" è femminile singolare (invariabile per numero), quindi "alta".',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_adj_q7',
    category: 'Grammatica',
    section: 'CILS Aggettivi',
    context: 'Nico offre ai suoi ospiti sei (comodo) __________ appartamenti.',
    questionText: 'Forma corretta di "comodo" con "appartamenti":',
    options: ['comodi', 'comodo', 'comode'],
    correctAnswerIndex: 0,
    explanation: '"Appartamenti" è maschile plurale: "comodi".',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_adj_q8',
    category: 'Grammatica',
    section: 'CILS Aggettivi',
    context: 'Appartamenti con camere (spazioso) __________.',
    questionText: 'Forma corretta di "spazioso" con "camere":',
    options: ['spaziose', 'spaziosi', 'spaziosa'],
    correctAnswerIndex: 0,
    explanation: '"Camere" è femminile plurale: "spaziose".',
    difficulty: 'A2',
  },

  // ============================================================
  // CILS A2 — Analisi delle strutture — Prova n. 2 (verb conjugation)
  // Originally open-answer; converted to MC with 3 plausible verb forms.
  // Source text: "Gita al mare" — past narrative in passato prossimo
  // ============================================================
  {
    id: 'off_cils_verb_q1',
    category: 'Grammatica',
    section: 'CILS Verbi',
    context: 'Domenica è stata una piacevole giornata. (Pensare) __________ di fare una gita al mare con la mia amica Noemi.',
    questionText: 'Forma corretta di "pensare" (io):',
    options: ['Ho pensato', 'Pensavo', 'Penso'],
    correctAnswerIndex: 0,
    explanation:
      'Azione completata nel passato (domenica scorsa): si usa il passato prossimo "ho pensato". L\'imperfetto "pensavo" indicherebbe un\'azione abituale o in corso, e "penso" è presente.',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_verb_q2',
    category: 'Grammatica',
    section: 'CILS Verbi',
    context: 'Noemi ed io (prendere) __________ il treno alle 9.00 da Siena per andare a Follonica.',
    questionText: 'Forma corretta di "prendere" (noi):',
    options: ['abbiamo preso', 'prendevamo', 'prendemmo'],
    correctAnswerIndex: 0,
    explanation:
      'Passato prossimo per un\'azione completata. "Prendere" è transitivo → ausiliare "avere": "abbiamo preso". "Prendemmo" è passato remoto (non standard in italiano parlato moderno per fatti recenti).',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_verb_q3',
    category: 'Grammatica',
    section: 'CILS Verbi',
    context: 'In treno (incontrare) __________ una signora simpatica.',
    questionText: 'Forma corretta di "incontrare" (noi):',
    options: ['abbiamo incontrato', 'incontravamo', 'incontrammo'],
    correctAnswerIndex: 0,
    explanation: 'Passato prossimo, ausiliare "avere" → "abbiamo incontrato".',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_verb_q4',
    category: 'Grammatica',
    section: 'CILS Verbi',
    context: 'Abbiamo incontrato una signora simpatica che (vivere) __________ a Follonica.',
    questionText: 'Forma corretta di "vivere" (lei):',
    options: ['vive', 'è vissuta', 'vivrà'],
    correctAnswerIndex: 0,
    explanation:
      '"Vive a Follonica" descrive uno stato attuale della signora (vive lì adesso, non solo allora) — si usa il presente "vive". Il passato prossimo cambierebbe il significato.',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_verb_q5',
    category: 'Grammatica',
    section: 'CILS Verbi',
    context: 'La signora ci (consigliare) __________ alcuni ristoranti in riva al mare.',
    questionText: 'Forma corretta di "consigliare" (lei):',
    options: ['ha consigliato', 'consigliava', 'consiglierebbe'],
    correctAnswerIndex: 0,
    explanation: 'Azione completata nel passato → passato prossimo, ausiliare "avere": "ha consigliato".',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_verb_q6',
    category: 'Grammatica',
    section: 'CILS Verbi',
    context: 'Durante il viaggio in treno Noemi (dormire) __________ un po\'.',
    questionText: 'Forma corretta di "dormire" (lei):',
    options: ['ha dormito', 'dormiva', 'dormirà'],
    correctAnswerIndex: 0,
    explanation: 'Azione conclusa nel passato → passato prossimo "ha dormito". "Dormire" prende l\'ausiliare "avere".',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_verb_q7',
    category: 'Grammatica',
    section: 'CILS Verbi',
    context: 'Il treno (arrivare) __________ a Follonica alle 11.00.',
    questionText: 'Forma corretta di "arrivare" (il treno):',
    options: ['è arrivato', 'arrivava', 'arriverà'],
    correctAnswerIndex: 0,
    explanation: 'Passato prossimo. "Arrivare" è un verbo di movimento → ausiliare "essere" + participio accordato con il soggetto maschile singolare: "è arrivato".',
    difficulty: 'A2',
  },
  {
    id: 'off_cils_verb_q8',
    category: 'Grammatica',
    section: 'CILS Verbi',
    context: 'Io e Noemi (andare) __________ subito in spiaggia.',
    questionText: 'Forma corretta di "andare" (noi, due ragazze):',
    options: ['siamo andate', 'siamo andati', 'andavamo'],
    correctAnswerIndex: 0,
    explanation:
      '"Andare" prende l\'ausiliare "essere": il participio si accorda con il soggetto. "Io e Noemi" sono due donne → femminile plurale → "siamo andate".',
    difficulty: 'A2',
  },

  // ============================================================
  // PLIDA A2 — Leggere — Prima parte (persona → annuncio)
  // ============================================================
  {
    id: 'off_plida_job_q1',
    category: 'Lettura',
    section: 'PLIDA Lavoro',
    context:
      'Profilo: "Dal 2012 al 2017 ho lavorato in un negozio di scarpe. Ho cambiato città da poco e vorrei trovare un lavoro come quello."\n\nAnnunci disponibili:\nA) IMPIEGATO TECNICO AMMINISTRATIVO — buon uso PC e Office, tempo pieno, diploma\nB) ASSISTENTI DI VOLO — selezioniamo per scali europei, altezza 157-188 cm, inglese\nC) COMMESSO/A — assistenza vendita prodotti, conoscenza base inglese, esperienza di almeno due anni nella vendita di abbigliamento e calzature\nD) MAGAZZINIERE — carico/scarico merce, tempo pieno, scuola dell\'obbligo\nE) OPERATORI CALL CENTER — part time, turni 4 ore, 9-13 o 16-20',
    questionText: 'Quale annuncio è adatto a questa persona?',
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIndex: 2,
    explanation:
      'La persona ha 5 anni di esperienza nella vendita di scarpe e cerca un lavoro simile. L\'annuncio C cerca proprio "esperienza di almeno due anni nella vendita di abbigliamento e calzature".',
    difficulty: 'A2',
  },
  {
    id: 'off_plida_job_q2',
    category: 'Lettura',
    section: 'PLIDA Lavoro',
    context:
      'Profilo: "Ho bisogno di soldi, ma la mattina devo studiare: vorrei lavorare per poche ore al giorno nel pomeriggio."\n\nAnnunci:\nA) IMPIEGATO — tempo pieno\nB) ASSISTENTI DI VOLO — scali europei\nC) COMMESSO/A — esperienza vendita richiesta\nD) MAGAZZINIERE — tempo pieno\nE) OPERATORI CALL CENTER — part time, turni 4 ore (9:00-13:00 o 16:00-20:00), persone giovani e dinamiche',
    questionText: 'Quale annuncio è adatto a questa persona?',
    options: ['A', 'C', 'D', 'E'],
    correctAnswerIndex: 3,
    explanation:
      'La persona vuole lavorare poche ore nel pomeriggio (studia la mattina). L\'annuncio E offre part time 4 ore con turno pomeridiano 16:00-20:00, perfetto.',
    difficulty: 'A2',
  },
  {
    id: 'off_plida_job_q3',
    category: 'Lettura',
    section: 'PLIDA Lavoro',
    context:
      'Profilo: "Vorrei trovare un lavoro per viaggiare e stare con la gente. Parlo molte lingue straniere."\n\nAnnunci:\nA) IMPIEGATO — ufficio, tempo pieno\nB) ASSISTENTI DI VOLO — selezioniamo per scali europei, devi saper parlare e scrivere in inglese\nC) COMMESSO/A — negozio di abbigliamento\nD) MAGAZZINIERE — carico/scarico merce in magazzino',
    questionText: 'Quale annuncio è adatto a questa persona?',
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIndex: 1,
    explanation:
      'La persona vuole viaggiare, stare con la gente e usa le lingue straniere. L\'annuncio B per "Assistenti di volo" copre tutti questi punti (viaggi sugli scali europei, contatto con passeggeri, richiesto l\'inglese).',
    difficulty: 'A2',
  },

  // ============================================================
  // PLIDA A2 — Leggere — Seconda parte (volantino → slogan)
  // ============================================================
  {
    id: 'off_plida_slogan_q1',
    category: 'Lettura',
    section: 'PLIDA Slogan',
    context: 'Volantino: "Corso di cucina dietetica con gusto — Sabato 5 marzo, dalle 9:30 alle 11:30 presso \'I Cantieri\'. Prenotazione obbligatoria. [Slogan mancante]"',
    questionText: 'Quale slogan completa il volantino?',
    options: [
      'Corsi con istruttori di danza qualificati!',
      'I mobili più belli per il tuo giardino',
      'Ricette dal mondo buone e leggere',
      'Lezioni private e di gruppo con professori abilitati',
    ],
    correctAnswerIndex: 2,
    explanation:
      'Il volantino è per un corso di cucina dietetica. "Ricette dal mondo buone e leggere" parla di ricette leggere (dietetiche), perfetto per il tema.',
    difficulty: 'A2',
  },
  {
    id: 'off_plida_slogan_q2',
    category: 'Lettura',
    section: 'PLIDA Slogan',
    context: 'Volantino: "ZUMBA dalle 19:30 alle 20:30 — Giovedì 25 settembre, prova gratuita ti aspettiamo! Salsa Bachata, balli latino-americani. [Slogan mancante]"',
    questionText: 'Quale slogan completa il volantino?',
    options: [
      'Corsi con istruttori di danza qualificati!',
      'Ricette dal mondo buone e leggere',
      'Biglietti disponibili a partire da 20 euro',
      'Svendita totale su occhiali da sole e da vista',
    ],
    correctAnswerIndex: 0,
    explanation: 'Il volantino è per corsi di ballo (Zumba, salsa, bachata). Lo slogan adatto parla esplicitamente di "istruttori di danza qualificati".',
    difficulty: 'A2',
  },
  {
    id: 'off_plida_slogan_q3',
    category: 'Lettura',
    section: 'PLIDA Slogan',
    context: 'Volantino: "Personalizza il tuo angolo di verde con eleganza e semplicità. €269 dal 27 marzo al 20 aprile. [Slogan mancante]"',
    questionText: 'Quale slogan completa il volantino?',
    options: [
      'Ricette dal mondo buone e leggere',
      'I mobili più belli per il tuo giardino',
      'Piante e fiori per te non avranno più segreti!',
      'Lezioni private e di gruppo con professori abilitati',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Il volantino mostra mobili da giardino in promozione ("angolo di verde", €269). Lo slogan "I mobili più belli per il tuo giardino" è il match esatto. "Piante e fiori" parlerebbe di flora, non di mobili.',
    difficulty: 'A2',
  },
  {
    id: 'off_plida_slogan_q4',
    category: 'Lettura',
    section: 'PLIDA Slogan',
    context:
      'Volantino: "Recupero materie scolastiche, recupero anni scolastici, recupero debiti formativi, preparazione esami universitari, preparazione test d\'ingresso (facoltà a numero chiuso). [Slogan mancante]"',
    questionText: 'Quale slogan completa il volantino?',
    options: [
      'Corsi con istruttori di danza qualificati!',
      'Ricette dal mondo buone e leggere',
      'Ordina per telefono e il pranzo te lo portiamo noi!',
      'Lezioni private e di gruppo con professori abilitati',
    ],
    correctAnswerIndex: 3,
    explanation:
      'Il volantino offre servizi di recupero scolastico e preparazione esami. "Lezioni private e di gruppo con professori abilitati" è l\'unico slogan didattico tra le opzioni.',
    difficulty: 'A2',
  },

  // ============================================================
  // PLIDA A2 — Leggere — Terza parte (testo + 3 opzioni A/B/C)
  // ============================================================
  {
    id: 'off_plida_terza_q1',
    category: 'Lettura',
    section: 'PLIDA Lettura',
    context:
      '"Scopri le novità dell\'orario invernale Trenitalia. Il collegamento diretto Venezia-Zurigo, già attivo nei fine settimana da giugno a dicembre, dal 10 dicembre diventa quotidiano con i seguenti orari: Venezia (15:20) Zurigo (21:51), Zurigo (09:09) Venezia (15:40). I costi rimarranno gli stessi."',
    questionText: "D'inverno il treno Venezia-Zurigo",
    options: ['parte tutti i giorni', 'costa di meno', 'fa più fermate'],
    correctAnswerIndex: 0,
    explanation:
      'Il testo dice "dal 10 dicembre diventa quotidiano": il treno parte tutti i giorni. I costi "rimarranno gli stessi" (non costa di meno) e le fermate non sono menzionate.',
    difficulty: 'A2',
  },
  {
    id: 'off_plida_terza_q2',
    category: 'Lettura',
    section: 'PLIDA Lettura',
    context: '"A causa di forti temporali, si segnalano code nel tratto compreso tra Senigallia (Km. 194,5) e Marotta-Mondolfo (Km. 187,9) in direzione Bologna."',
    questionText: 'Che cosa hai letto?',
    options: ['Previsioni del tempo', 'Indicazioni stradali', 'Informazioni sul traffico'],
    correctAnswerIndex: 2,
    explanation:
      'Il testo parla di "code" (ingorghi) tra due punti chilometrici di un\'autostrada: sono informazioni sul traffico. Il temporale è la causa ma non l\'argomento.',
    difficulty: 'A2',
  },
  {
    id: 'off_plida_terza_q3',
    category: 'Lettura',
    section: 'PLIDA Lettura',
    context:
      '"Stampate tutti i biglietti e le prenotazioni degli alberghi: il cellulare quando più vi serve potrebbe essere scarico. In ogni caso, quando sarete all\'estero, sarà utile comprare una scheda SIM e dati, per navigare su Internet a poco prezzo e per usare il gps."',
    questionText: 'In questo testo trovi',
    options: ['consigli per organizzare un viaggio', 'le istruzioni di un telefono', 'un avviso di pagamento'],
    correctAnswerIndex: 0,
    explanation:
      'Il testo dà consigli pratici per chi viaggia: stampare biglietti, comprare una SIM all\'estero. Sono consigli per organizzare un viaggio.',
    difficulty: 'A2',
  },
  {
    id: 'off_plida_terza_q4',
    category: 'Lettura',
    section: 'PLIDA Lettura',
    context:
      '"La Sn management è lieta di comunicarvi che partono le selezioni 2018 per animatori turistici. Se ti interessano proposte in questo settore puoi contattarci: selezioniamo persone per le nostre strutture, anche alla prima esperienza."',
    questionText: 'Questo messaggio è',
    options: ["l'avviso di una scuola", "un'offerta di lavoro", 'la pubblicità di un viaggio'],
    correctAnswerIndex: 1,
    explanation:
      'Il messaggio annuncia "selezioni 2018 per animatori turistici" e cerca personale: è un\'offerta di lavoro.',
    difficulty: 'A2',
  },
  {
    id: 'off_plida_terza_q5',
    category: 'Lettura',
    section: 'PLIDA Lettura',
    context:
      '"La carta \'Open\' — Dieci ingressi al Teatro Piccolo Eliseo a soli 150 euro. Con la carta \'Open\' è possibile prenotare uno spettacolo e decidere di venire da soli o accompagnati da un amico o da un familiare: il costo del biglietto (15 euro) verrà scalato dalla cifra presente nella carta, come una qualsiasi carta prepagata."',
    questionText: 'Con la carta "Open" puoi',
    options: ['avere uno sconto di 5 euro sul biglietto', 'scegliere i posti migliori', 'portare con te altre persone'],
    correctAnswerIndex: 2,
    explanation:
      'Il testo dice "decidere di venire da soli o accompagnati da un amico o da un familiare": puoi portare altre persone. Lo sconto di 5 euro è in realtà il costo di modifica della prenotazione, non uno sconto.',
    difficulty: 'A2',
  },
];
