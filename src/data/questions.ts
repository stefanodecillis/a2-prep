/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question } from '../types';

// Proper Fisher–Yates shuffle. The previous codebase used
// `arr.sort(() => 0.5 - Math.random())` in several places, which is biased
// (some permutations are more likely than others). Use this everywhere.
export function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const curatedQuestions: Question[] = [
  // GRAMMATICA - Preposizioni
  {
    id: "g_prep_1",
    category: "Grammatica",
    section: "Preposizioni",
    questionText: "Stasera vado __________ medico perché ho un forte mal di gola.",
    options: ["nel", "al", "dal", "da"],
    correctAnswerIndex: 2,
    explanation: "In Italian, we use the preposition 'da' + article (da + il = dal) when going to or visiting a person or a professional's office (e.g. 'andare dal medico', 'andare da Marco').",
    difficulty: "A2"
  },
  {
    id: "g_prep_2",
    category: "Grammatica",
    section: "Preposizioni",
    questionText: "I bambini sono __________ giardino a giocare con il cane.",
    options: ["in", "nel", "a", "al"],
    correctAnswerIndex: 0,
    explanation: "To express being in a general space like a garden or room without specific descriptions, simple 'in' is used: 'in giardino' (in the garden).",
    difficulty: "A2"
  },
  {
    id: "g_prep_3",
    category: "Grammatica",
    section: "Preposizioni",
    questionText: "Questo treno parte domani mattina __________ binario 4.",
    options: ["da", "dal", "di", "del"],
    correctAnswerIndex: 1,
    explanation: "Departure from a specific place uses the preposition 'da' combined with the article 'il' (da + il = dal): 'dal binario 4' (from platform 4).",
    difficulty: "A2"
  },
  {
    id: "g_prep_4",
    category: "Grammatica",
    section: "Preposizioni",
    questionText: "Vado __________ biblioteca comunale per studiare storia.",
    options: ["in", "a", "nella", "alla"],
    correctAnswerIndex: 0,
    explanation: "Locations ending in '-teca' (like biblioteca, discoteca, enoteca) take the simple preposition 'in' without an article unless specified: 'in biblioteca'.",
    difficulty: "A2"
  },
  {
    id: "g_prep_5",
    category: "Grammatica",
    section: "Preposizioni",
    questionText: "Teresa abita __________ Stati Uniti da quasi tre anni ormai.",
    options: ["in", "negli", "a", "sugli"],
    correctAnswerIndex: 1,
    explanation: "Plural or modified country names take articulated prepositions. 'Stati Uniti' is masculine plural starting with S+consonant, taking 'negli' (in + gli).",
    difficulty: "A2"
  },

  // GRAMMATICA - Passato Prossimo vs Imperfetto
  {
    id: "g_pass_1",
    category: "Grammatica",
    section: "Passato Prossimo",
    questionText: "Sabato scorso io e i miei amici __________ in centro per fare spese.",
    options: ["siamo andati", "andavamo", "siamo andate", "hanno andato"],
    correctAnswerIndex: 0,
    explanation: "For a completed action in the past ('Sabato scorso'), we use the 'passato prossimo'. Since the subject is 'io e i miei amici' (masculine plural we), 'andare' conjugates with 'essere' and the past participle ends in '-ati': 'siamo andati'.",
    difficulty: "A2"
  },
  {
    id: "g_pass_2",
    category: "Grammatica",
    section: "Imperfetto vs Passato",
    questionText: "Mentre io __________ la cena, il telefono ha squillato.",
    options: ["ho preparato", "preparavo", "preparato", "preparerò"],
    correctAnswerIndex: 1,
    explanation: "The imperfect ('preparavo') expresses an ongoing action in the past that was interrupted by a sudden completed action in the passato prossimo ('ha squillato'). 'Mentre' (while) is a key indicator for Imperfetto.",
    difficulty: "A2"
  },
  {
    id: "g_pass_3",
    category: "Grammatica",
    section: "Passato Prossimo",
    questionText: "Ieri sera Giulia non __________ uscire perché si sentiva molto stanca.",
    options: ["ha potuto", "è potuta", "poteva", "è potuto"],
    correctAnswerIndex: 1,
    explanation: "When travel/movement verbs conjugate with 'essere' in the compound tense, the modal verb 'potere' also takes 'essere', and its participle agrees with the feminine subject 'Giulia': 'è potuta uscire'.",
    difficulty: "A2"
  },
  {
    id: "g_pass_4",
    category: "Grammatica",
    section: "Imperfetto",
    questionText: "Da piccolo, Luca __________ sempre le vacanze estive dai nonni in Puglia.",
    options: ["ha passato", "passava", "è passato", "passerò"],
    correctAnswerIndex: 1,
    explanation: "Habitual or repetitive actions in the past ('Da piccolo... sempre') are described using the imperfect tense: 'passava'.",
    difficulty: "A2"
  },
  {
    id: "g_pass_5",
    category: "Grammatica",
    section: "Passato Prossimo",
    questionText: "Domenica scorsa mi sono svegliato tardi e poi __________ un caffè al volo.",
    options: ["bevuto", "ho bevuto", "bevevo", "sono bevuto"],
    correctAnswerIndex: 1,
    explanation: "'Bere' (to drink) is a transitive verb, so its past compound verb takes 'avere' as auxiliary: 'ho bevuto'. The completed past action requires Passato Prossimo.",
    difficulty: "A2"
  },

  // GRAMMATICA - Pronomi Diretti e Indiretti
  {
    id: "g_pron_1",
    category: "Grammatica",
    section: "Pronomi",
    questionText: "Ti piace la cucina italiana? - Sì, m'interessa molto e __________ cucino spesso.",
    options: ["la", "lo", "le", "li"],
    correctAnswerIndex: 0,
    explanation: "The direct object is 'la cucina italiana' (feminine singular), which is replaced by the pronoun 'la'.",
    difficulty: "A2"
  },
  {
    id: "g_pron_2",
    category: "Grammatica",
    section: "Pronomi",
    questionText: "Hai comprato le pesche al mercato? - Sì, __________ ho comprate un chilo.",
    options: ["le", "le ho", "ne", "ci"],
    correctAnswerIndex: 2,
    explanation: "When speaking about a specific quantity of an item ('un chilo', 'due', 'un po''), we must use the partitive pronoun 'ne'. The past participle agrees with the gender/plural of the noun: 'ne ho comprate un chilo'.",
    difficulty: "A2"
  },
  {
    id: "g_pron_3",
    category: "Grammatica",
    section: "Pronomi",
    questionText: "Hai telefonato a Mario per il suo compleanno? - No, __________ telefono stasera.",
    options: ["lo", "gli", "le", "ci"],
    correctAnswerIndex: 1,
    explanation: "The verb 'telefonare' takes an indirect object ('telefonare A qualcuno'). To replace 'a Mario' (masculine singular), we use the indirect object pronoun 'gli' (to him).",
    difficulty: "A2"
  },
  {
    id: "g_pron_4",
    category: "Grammatica",
    section: "Pronomi",
    questionText: "Signora Rossi, posso aiutar__________ con le borse della spesa?",
    options: ["La", "la", "ti", "Vi"],
    correctAnswerIndex: 0,
    explanation: "For formal address ('Signora Rossi'), we use the formal pronoun 'La' (capitalized) to replace the direct object 'you': 'posso aiutarLa' or 'La posso aiutare'.",
    difficulty: "A2"
  },
  {
    id: "g_pron_5",
    category: "Grammatica",
    section: "Pronomi",
    questionText: "Ieri ho visto Anna e __________ ho dato il libro che cercava.",
    options: ["lo", "la", "le", "gli"],
    correctAnswerIndex: 2,
    explanation: "The verb is 'dare QUALCOSA A QUALCUNO'. For a feminine singular indirect object ('a Anna'), we use 'le' (to her).",
    difficulty: "A2"
  },

  // GRAMMATICA - Verbi Riflessivi
  {
    id: "g_rif_1",
    category: "Grammatica",
    section: "Verbi Riflessivi",
    questionText: "Di solito la mattina mi __________ alle sette in punto.",
    options: ["sveglio", "sveglio mi", "sveglia", "mi sveglio"],
    correctAnswerIndex: 3,
    explanation: "Reflexive verbs require pre-verbal pronouns. For the first-person singular 'io' of 'svegliarsi', the reflexive pronoun is 'mi' followed by the conjugated verb: 'mi sveglio'.",
    difficulty: "A2"
  },
  {
    id: "g_rif_2",
    category: "Grammatica",
    section: "Verbi Riflessivi",
    questionText: "Io e Chiara __________ sempre per il compleanno dei nostri nonni.",
    options: ["ci prepariamo", "vi preparate", "si preparano", "prepararci"],
    correctAnswerIndex: 0,
    explanation: "For 'io e Chiara' (noi), the reflexive pronoun is 'ci'. The verb 'prepararsi' conjugates to 'ci prepariamo'.",
    difficulty: "A2"
  },
  {
    id: "g_rif_3",
    category: "Grammatica",
    section: "Verbi Riflessivi",
    questionText: "Perché ieri voi non __________ alla festa di compleanno di Andrea?",
    options: ["siete divertiti", "vi siete divertiti", "vi siete divertite", "hanno divertito"],
    correctAnswerIndex: 1,
    explanation: "In compound tenses (Passato Prossimo), reflexive verbs ALWAYS use 'essere'. For 'voi' (masculine plural here by default), it is 'vi siete divertiti'.",
    difficulty: "A2"
  },

  // VOCABOLARIO - Tempo, Casa, Cibo, Salute
  {
    id: "v_voc_1",
    category: "Vocabolario",
    section: "Cibo",
    questionText: "Cosa prendi per prima colazione? - Di solito un __________ calda con un croissant.",
    options: ["panino", "pesce", "tazza di latte", "aranciata"],
    correctAnswerIndex: 2,
    explanation: "'Una tazza di latte calda' fits well with breakfast routines ('prima colazione') together with a croissant.",
    difficulty: "A2"
  },
  {
    id: "v_voc_2",
    category: "Vocabolario",
    section: "Salute",
    questionText: "Mi fa molto male la testa. Devo prendere __________.",
    options: ["una camicia", "uno sciroppo", "un'aspirina", "un termometro"],
    correctAnswerIndex: 2,
    explanation: "For a headache ('mal di testa'), 'un'aspirina' (aspirin/painkiller) is the most standard item to take.",
    difficulty: "A2"
  },
  {
    id: "v_voc_3",
    category: "Vocabolario",
    section: "Meteo",
    questionText: "Oggi il cielo è tutto grigio ed è molto nuvoloso. Penso che presto __________.",
    options: ["farà caldo", "pioverà", "sarà soleggiato", "tirerà vento"],
    correctAnswerIndex: 1,
    explanation: "A grey, cloudy sky ('tutto grigio e nuvoloso') indicates that it will rain soon ('pioverà').",
    difficulty: "A2"
  },
  {
    id: "v_voc_4",
    category: "Vocabolario",
    section: "Negozi",
    questionText: "Devo comprare del pane fresco e due focacce, vado subito dal __________.",
    options: ["farmacista", "macellaio", "panettiere", "fruttivendolo"],
    correctAnswerIndex: 2,
    explanation: "Bread and focaccia are bought from a baker ('panettiere').",
    difficulty: "A2"
  },
  {
    id: "v_voc_5",
    category: "Vocabolario",
    section: "Casa",
    questionText: "La camera da letto si trova al secondo piano, dobbiamo salire le __________.",
    options: ["finestre", "scale", "porte", "sedie"],
    correctAnswerIndex: 1,
    explanation: "To reach the second floor of a house, you climb the stairs ('scale').",
    difficulty: "A2"
  },

  // SITUAZIONI - Conversazione e Dialogo Quotidiano
  {
    id: "s_sit_1",
    category: "Situazioni",
    section: "Ristorante",
    questionText: "Cosa desidera ordinare come primo piatto, signore?\n— Come primo __________ gli spaghetti alle vongole, grazie.",
    options: ["prendo", "vorrei", "mi piace", "gradisco"],
    correctAnswerIndex: 1,
    explanation: "'Vorrei' (I would like) is the polite conditional form commonly used for placing orders at restaurants.",
    difficulty: "A2"
  },
  {
    id: "s_sit_2",
    category: "Situazioni",
    section: "Indicazioni",
    questionText: "Scusi, per andare alla stazione centrale?\n— Allora, __________ dritto per questa via e poi giri alla seconda strada a destra.",
    options: ["guardi", "vada", "va", "faccia"],
    correctAnswerIndex: 1,
    explanation: "In giving informal directions using polite imperative 'Lei' form, we say 'Vada dritto' (Go straight).",
    difficulty: "A2"
  },
  {
    id: "s_sit_3",
    category: "Situazioni",
    section: "Shopping",
    questionText: "Mi piace molto questo maglione rosso. Posso __________?",
    options: ["pagarlo", "provarlo", "comprarlo", "vestirlo"],
    correctAnswerIndex: 1,
    explanation: "Before buying a piece of clothing, you ask to retry or test fit it: 'posso provarlo?' (can I try it on?).",
    difficulty: "A2"
  },
  {
    id: "s_sit_4",
    category: "Situazioni",
    section: "Incontri",
    questionText: "Ciao Marta! Quanto tempo! Come stai?\n— Ciao Giacomo! Che sorpresa! Io sto bene, e tu? __________ ?",
    options: ["Come ti chiami", "Di dove sei", "Che novità ci sono", "Quanti anni hai"],
    correctAnswerIndex: 2,
    explanation: "'Che novità ci sono?' (What's new?) is a typical follow-up question when bumping into an old friend.",
    difficulty: "A2"
  },
  {
    id: "s_sit_5",
    category: "Situazioni",
    section: "Albergo",
    questionText: "Buongiorno, vorrei prenotare una camera doppia per tre notti.\n— Buongiorno, certo. Ha già effettuato __________ sul nostro sito?",
    options: ["il conto", "la chiave", "la prenotazione", "la colazione"],
    correctAnswerIndex: 2,
    explanation: "In a hotel check-in/booking conversation, they ask if you have already made the reservation ('prenotazione').",
    difficulty: "A2"
  },

  // LETTURA - Comprensione del Testo (Readings and Questions)
  {
    id: "l_let_1",
    category: "Lettura",
    section: "Comprensione",
    context: "Marco ha 28 anni e abita a Firenze. Lavora come impiegato in un'azienda informatica dal lunedì al venerdì. Nel tempo libero gli piace molto cucinare e fare escursioni in montagna durante il fine settimana. Sabato prossimo andrà sull'Appennino toscano con alcuni parenti.",
    questionText: "Qual è il lavoro di Marco e dove si reca di sabato?",
    options: [
      "È studente e studia a Firenze anche nei fine settimana.",
      "Lavora in un ufficio ed esce con gli amici in centro città.",
      "È impiegato informatico e farà un'escursione in montagna sabato.",
      "È un programmatore e sabato lavora da casa."
    ],
    correctAnswerIndex: 2,
    explanation: "The text states: 'Lavora come impiegato in un'azienda informatica...' and 'Sabato prossimo andrà sull'Appennino toscano (montagna) con alcuni parenti.'",
    difficulty: "A2"
  },
  {
    id: "l_let_2",
    category: "Lettura",
    section: "Comprensione",
    context: "L'anno scorso, durante le vacanze natalizie, la famiglia Bruni ha deciso di visitare la città di Venezia. Hanno viaggiato in treno e sono rimasti lì per quattro giorni. Il tempo era freddo ma soleggiato. Hanno descritto il viaggio in gondola come un'esperienza magica e indimenticabile, anche se un po' costosa.",
    questionText: "Come ha descritto la famiglia Bruni l'esperienza in gondola?",
    options: [
      "Divertente e molto economica per tutti.",
      "Magica, stupenda, anche se piuttosto cara.",
      "Molto fredda e noiosa a causa del brutto tempo.",
      "Cortese ma faticosa per i bambini piccoli."
    ],
    correctAnswerIndex: 1,
    explanation: "The text says 'Hanno descritto il viaggio in gondola come un'esperienza magica e indimenticabile, anche se un po' costosa (cara)'.",
    difficulty: "A2"
  },
  {
    id: "l_let_3",
    category: "Lettura",
    section: "Comprensione",
    context: "Ieri sera Giulia è andata al supermercato perché il suo frigorifero era completamente vuoto. Ha comprato della frutta fresca, del petto di pollo, due bottiglie d'acqua e un cartone di latte. Quando è arrivata alla cassa, si è accorta di aver dimenticato il portafoglio a casa, quindi ha dovuto telefonare a suo fratello per farsi portare i soldi.",
    questionText: "Per quale motivo Giulia ha dovuto telefonare a suo fratello?",
    options: [
      "Per invitarlo a cena a mangiare il pollo.",
      "Perché il cibo acquistato era troppo pesante da trasportare.",
      "Perché non aveva con sé il portafoglio alla cassa.",
      "Per chiedergli quale marca di latte acquistare."
    ],
    correctAnswerIndex: 2,
    explanation: "The text highlights: 'si è accorta di aver dimenticato il portafoglio a casa, quindi ha dovuto telefonare a suo fratello per farsi portare i soldi.'",
    difficulty: "A2"
  },

  // ADDING MORE RICH QUESTIONS TO REACH 50+
  // Grammar - Futuro Semplice
  {
    id: "g_fut_1",
    category: "Grammatica",
    section: "Futuro",
    questionText: "Secondo le previsioni, domani nel pomeriggio __________ un forte temporale.",
    options: ["faceva", "farà", "ha fatto", "farebbe"],
    correctAnswerIndex: 1,
    explanation: "For events occurring tomorrow ('domani'), we use the future simple tense. The third-person singular of 'fare' is 'farà'.",
    difficulty: "A2"
  },
  {
    id: "g_fut_2",
    category: "Grammatica",
    section: "Futuro",
    questionText: "Se studierai molto per questo esame, sicuramente __________ un buon voto.",
    options: ["prendi", "prendevi", "prenderai", "prendesti"],
    correctAnswerIndex: 2,
    explanation: "In a real future conditional sentence ('Se + futuro... futuro'), we pair 'studierai' with the future tense 'prenderai'.",
    difficulty: "A2"
  },

  // Grammar - Condizionale Semplice (Polite requests)
  {
    id: "g_cond_1",
    category: "Grammatica",
    section: "Condizionale",
    questionText: "Scusi cameriere, ci __________ portare dell'acqua naturale fredda, per favore?",
    options: ["potrebbe", "poteva", "potrà", "possiamo"],
    correctAnswerIndex: 0,
    explanation: "To make a polite request inside a restaurant, the conditional tense is used: 'potrebbe' (could you).",
    difficulty: "A2"
  },

  // Vocabulary - Vestiti, Abbigliamento
  {
    id: "v_vest_1",
    category: "Vocabolario",
    section: "Vestiti",
    questionText: "Fa molto freddo oggi fuori, non dimenticare di metterti il __________ e i guanti.",
    options: ["costume da bagno", "cappotto", "pantaloncino corto", "sandalo"],
    correctAnswerIndex: 1,
    explanation: "With cold weather ('freddo fuori'), a coat ('cappotto') and gloves ('guanti') are appropriate wear.",
    difficulty: "A2"
  },

  // Vocabulary - Mezzi di trasporto
  {
    id: "v_tran_1",
    category: "Vocabolario",
    section: "Trasporti",
    questionText: "Per viaggiare velocemente da Milano a Roma la gente preferisce prendere il __________ ad alta velocità.",
    options: ["treno", "motorino", "traghetto", "camion"],
    correctAnswerIndex: 0,
    explanation: "'Treno ad alta velocità' (high-speed train, e.g. Frecciarossa) is the correct term for high-speed rail travel.",
    difficulty: "A2"
  },

  // Grammar - Imperativo Informale
  {
    id: "g_imp_1",
    category: "Grammatica",
    section: "Imperativo",
    questionText: "Marco, fa freddo fuori! __________ la giacca prima di uscire!",
    options: ["mettere", "metti", "metta", "mettiti"],
    correctAnswerIndex: 3,
    explanation: "The informal imperative for reflexive verb 'mettersi' (to put on) for the 'tu' subject is 'mettiti' (put on yourself).",
    difficulty: "A2"
  },
  {
    id: "g_imp_2",
    category: "Grammatica",
    section: "Imperativo",
    questionText: "Luigi, __________! Il semaforo è diventato verde, puoi camminare!",
    options: ["guarda", "guardi", "guarda di", "guardate"],
    correctAnswerIndex: 0,
    explanation: "Informal imperative for 'tu' (singular Luigi) with 'guardare' is 'guarda!'",
    difficulty: "A2"
  },

  // Grammar - Aggettivi e pronomi possessivi
  {
    id: "g_poss_1",
    category: "Grammatica",
    section: "Possessivi",
    questionText: "La mia macchina è nera, quella di fianco a sinistra invece è la __________ (di Chiara)?",
    options: ["sua", "tua", "mia", "nostra"],
    correctAnswerIndex: 0,
    explanation: "To match Chiara (possessive third-person singular feminine), we use 'la sua' (hers).",
    difficulty: "A2"
  },

  // Grammar - Ci e Ne
  {
    id: "g_cine_1",
    category: "Grammatica",
    section: "Ci e Ne",
    questionText: "Quante volte sei stato a Roma? — __________ sono stato due volte.",
    options: ["Ci", "Ne", "Lo", "La"],
    correctAnswerIndex: 0,
    explanation: "The locative pronoun 'ci' replaces a place already mentioned ('a Roma'): 'Ci sono stato' (I've been there).",
    difficulty: "A2"
  },
  {
    id: "g_cine_2",
    category: "Grammatica",
    section: "Ci e Ne",
    questionText: "Hai voglia di fare una passeggiata in spiaggia nel pomeriggio?\n— Sì, __________ ho molta voglia!",
    options: ["ci", "ne", "la", "ci lo"],
    correctAnswerIndex: 1,
    explanation: "The structure is 'avere voglia DI qualcosa'. To replace 'di fare una passeggiata' (of it), we use the partitive/prepositional pronoun 'ne'.",
    difficulty: "A2"
  },

  // Dialoghi e espressioni comuni
  {
    id: "s_dia_1",
    category: "Situazioni",
    section: "Incontri",
    questionText: "Scusa, sai se l'ufficio postale è già aperto a quest'ora?\n— No, non __________ ancora, proviamo a controllare online.",
    options: ["lo so", "lo conosco", "ci penso", "ne so"],
    correctAnswerIndex: 0,
    explanation: "To express 'I don't know it (transitive clitic replacing a clause)', we use the accusative clitic pronoun 'lo' followed by 'so': 'No, non lo so'.",
    difficulty: "A2"
  },

  // Verbs - Present tense exceptions
  {
    id: "g_pres_1",
    category: "Grammatica",
    section: "Verbi Presente",
    questionText: "I miei amici __________ da Milano alle sei del pomeriggio.",
    options: ["vengono", "venite", "vengono da", "veniamo"],
    correctAnswerIndex: 0,
    explanation: "The present tense third person plural of 'venire' is 'vengono'.",
    difficulty: "A2"
  },
  {
    id: "g_pres_2",
    category: "Grammatica",
    section: "Verbi Presente",
    questionText: "Scusate ragazzi, dove __________ le chiavi di casa?",
    options: ["mettete", "metti", "mettiamo", "mettono"],
    correctAnswerIndex: 0,
    explanation: "The subject 'ragazzi' is second person plural (voi). The contraction is 'mettete' (you put).",
    difficulty: "A2"
  },

  // Reading Comprehension 4
  {
    id: "l_let_4",
    category: "Lettura",
    section: "Comprensione",
    context: "Il mercato rionale apre ogni martedì mattina nella piazza centrale del paese. Ci sono banchi di frutta, verdura fresca, formaggi tipici e vestiti usati. La signora Gigli vi si reca sempre prima delle nove per acquistare i prodotti migliori e scambiare due chiacchiere con le sue amiche del quartiere.",
    questionText: "A che ora e perché la signora Gigli va al mercato?",
    options: [
      "Alle dieci di sera per fare spese veloci da sola.",
      "Prima delle nove per comprare prodotti freschi e parlare con le amiche.",
      "Solo il venerdì per comprare vestiti costosi e firmati.",
      "A mezzogiorno per mangiare formaggio in piazza."
    ],
    correctAnswerIndex: 1,
    explanation: "The text says: 'La signora Gigli vi si reca sempre prima delle nove...' and 'per acquistare i prodotti migliori e scambiare due chiacchiere con le sue amiche...'.",
    difficulty: "A2"
  },

  // Reading Comprehension 5
  {
    id: "l_let_5",
    category: "Lettura",
    section: "Comprensione",
    context: "Per andare all'aeroporto di Roma-Fiumicino, molti viaggiatori scelgono il Leonardo Express. Questo treno diretto unisce la stazione di Roma Termini all'aeroporto in soli trentadue minuti senza fermate intermedie. Il biglietto costa quattordici euro e ci sono corse ogni quindici o trenta minuti.",
    questionText: "Quali sono le caratteristiche principali del treno Leonardo Express?",
    options: [
      "È gratis per chi viaggia molto e ferma in tutte le stazioni.",
      "È un treno lento che costa pochissimo ed ha una sola corsa al giorno.",
      "È un treno diretto, costa 14 euro e unisce Termini a Fiumicino in 32 minuti.",
      "È un treno speciale che va solo verso gli alberghi della capitale."
    ],
    correctAnswerIndex: 2,
    explanation: "The text explicitly states: 'treno diretto unisce... Roma Termini all'aeroporto in soli trentadue minuti...', 'Il biglietto costa quattordici euro'.",
    difficulty: "A2"
  },

  // Grammar - Comparative and Superlative
  {
    id: "g_comp_1",
    category: "Grammatica",
    section: "Comparativi",
    questionText: "Il treno ad alta velocità è sicuramente molto __________ della macchina.",
    options: ["più veloce", "velocissimo", "il più veloce", "tanto veloce"],
    correctAnswerIndex: 0,
    explanation: "To compare two objects ('treno' and 'macchina') using 'than' ('della'), we use the comparative structure 'più + adjective + di': 'più veloce della'.",
    difficulty: "A2"
  },
  {
    id: "g_comp_2",
    category: "Grammatica",
    section: "Comparativi",
    questionText: "Questa pizza è buonissima! È la pizza __________ saporita che io abbia mai mangiato.",
    options: ["più", "molto", "così", "troppo"],
    correctAnswerIndex: 0,
    explanation: "The relative superlative: 'la pizza più saporita' (the most flavorful pizza).",
    difficulty: "A2"
  },

  // Vocabulary - Giorni, Mesi, Stagioni
  {
    id: "v_stag_1",
    category: "Vocabolario",
    section: "Giorni",
    questionText: "Se oggi è giovedì, dopodomani sarà .......... .",
    options: ["venerdì", "sabato", "domenica", "mercoledì"],
    correctAnswerIndex: 1,
    explanation: "If today is Thursday ('giovedì'), tomorrow is Friday and the day after tomorrow ('dopodomani') will be Saturday ('sabato').",
    difficulty: "A2"
  },
  {
    id: "v_stag_2",
    category: "Vocabolario",
    section: "Stagioni",
    questionText: "In Italia l'autunno inizia nel mese di __________.",
    options: ["maggio", "settembre", "dicembre", "marzo"],
    correctAnswerIndex: 1,
    explanation: "Autumn in Italy starts in September ('settembre').",
    difficulty: "A2"
  },

  // Auxiliary questions to pad up to a robust selection pool (let's provide 45 total high-quality questions which can be augmented dynamically by Gemini to form infinite sets, or drawn from).
  // Yes, let's include about 15 more questions to make it a total of 40-45 excellent questions.
  {
    id: "g_prep_6",
    category: "Grammatica",
    section: "Preposizioni",
    questionText: "La lezione di storia dell'arte comincia __________ nove e mezza.",
    options: ["a", "alle", "di", "dalle"],
    correctAnswerIndex: 1,
    explanation: "Time expressions in Italian use 'a' combined with the feminine plural article: 'alle nove' (at nine).",
    difficulty: "A2"
  },
  {
    id: "g_verb_ref_4",
    category: "Grammatica",
    section: "Verbi Riflessivi",
    questionText: "Ciao ragazzi! Come __________ sentite oggi?",
    options: ["vi", "si", "ci", "ti"],
    correctAnswerIndex: 0,
    explanation: "The plural reflexive pronoun for 'voi' is 'vi'. Conjugation: 'Come vi sentite?' (How do you feel?).",
    difficulty: "A2"
  },
  {
    id: "g_pass_6",
    category: "Grammatica",
    section: "Passato Prossimo",
    questionText: "Anna, __________ tutta la notte per preparare l'esame di lingua italiana?",
    options: ["hai studiata", "hai studiato", "sei studiata", "sei studiato"],
    correctAnswerIndex: 1,
    explanation: "Transitive verbs like 'studiare' take 'avere' in compound tenses. The past participle remains neutral (-o) unless preceded by direct object pronouns: 'hai studiato'.",
    difficulty: "A2"
  },
  {
    id: "g_pron_6",
    category: "Grammatica",
    section: "Pronomi",
    questionText: "Questi bignè alla crema sono buonissimi! Vorrei mangiar__________ tutti subito!",
    options: ["li", "lo", "le", "gli"],
    correctAnswerIndex: 0,
    explanation: "The direct object pronoun replaces masculine plural noun 'bignè'. For masculine plural we use 'li' attached to the end of the infinitive verb (mangiarsi -> mangiarli).",
    difficulty: "A2"
  },
  {
    id: "v_job_1",
    category: "Vocabolario",
    section: "Lavoro",
    questionText: "Il signor Bianchi progetta case e palazzi, fa l'__________.",
    options: ["operaio", "architetto", "avvocato", "infermiere"],
    correctAnswerIndex: 1,
    explanation: "Someone who plans and designs houses and buildings is an architect ('architetto').",
    difficulty: "A2"
  },
  {
    id: "v_hobby_1",
    category: "Vocabolario",
    section: "Tempo libero",
    questionText: "Nel tempo libero mi piace dipingere quadri e suonare la __________.",
    options: ["bicicletta", "chitarra", "pittura", "canzone"],
    correctAnswerIndex: 1,
    explanation: "To play an instrument is 'suonare la chitarra' (playing the guitar). You don't play a bicycle or a painting.",
    difficulty: "A2"
  },
  {
    id: "s_travel_1",
    category: "Situazioni",
    section: "Viaggio",
    questionText: "Vorrei prenotare un posto sul treno delle 14:00.\n— Vuole un biglietto di andata e __________ o solo andata?",
    options: ["partenza", "ritorno", "arrivo", "viaggio"],
    correctAnswerIndex: 1,
    explanation: "A round-trip ticket is called 'andata e ritorno' (outward and return) in Italy.",
    difficulty: "A2"
  },
  {
    id: "g_prep_7",
    category: "Grammatica",
    section: "Preposizioni",
    questionText: "Hai messo le chiavi __________ tavolo in cucina?",
    options: ["su", "sul", "sotto", "sopra"],
    correctAnswerIndex: 1,
    explanation: "'Articulated preposition' su + il = sul (on the table).",
    difficulty: "A2"
  },
  {
    id: "g_pron_7",
    category: "Grammatica",
    section: "Pronomi",
    questionText: "Hai cucinato la pasta calda? — Sì, __________ ho appena preparata.",
    options: ["l'", "la", "ne", "ci"],
    correctAnswerIndex: 0,
    explanation: "For the feminine singular direct object ('la pasta'), we use the pronoun 'la'. When paired with 'avere' in passato prossimo, 'la' collapses into 'l'' before 'ho', and the past participle has feminine agreement: 'l'ho appena preparata'.",
    difficulty: "A2"
  },
  {
    id: "v_body_1",
    category: "Vocabolario",
    section: "Corpo Umano",
    questionText: "Ho camminato tanto ieri e adesso mi fanno male entrambi i __________.",
    options: ["piedi", "braccia", "capelli", "occhi"],
    correctAnswerIndex: 0,
    explanation: "Walking a lot ('camminato tanto') leads to sore feet ('piedi'). Plural of 'piede' is 'piedi'.",
    difficulty: "A2"
  },
  {
    id: "a_asc_1",
    category: "Ascolto",
    section: "Ascolto e Capisci",
    context: "Vorrei un cappuccino tiepido e un cornetto alla crema, grazie.",
    questionText: "Ascolta la pronuncia del Professore cliccando sull'icona dell'altoparlante. Che cosa desidera ordinare il Professore?",
    options: [
      "Un caffè espresso forte e un cornetto al cioccolato.",
      "Un cappuccino non troppo caldo e un cornetto ripieno di crema.",
      "Un gelato al pistacchio e un bicchiere d'acqua frizzante.",
      "Una cioccolata calda e un pezzo di torta di mele."
    ],
    correctAnswerIndex: 1,
    explanation: "The speaker says: 'Vorrei un cappuccino tiepido (tiepido = lukewarm / non troppo caldo) e un cornetto alla crema, grazie.'",
    difficulty: "A2"
  },
  {
    id: "a_asc_2",
    category: "Ascolto",
    section: "Comprensione Orale",
    context: "Scusi, il treno regionale per Pisa parte dal binario due o quattro? Perché sull'orario non lo trovo.",
    questionText: "Quale informazione sta cercando il Professore e per quale destinazione?",
    options: [
      "Cerca l'autobus per andare a Firenze dal semaforo.",
      "Cerca il binario di partenza per il treno regionale diretto a Pisa.",
      "Cerca la biglietteria della stazione di Roma Termini.",
      "Cerca l'orario di arrivo del volo internazionale da Pisa."
    ],
    correctAnswerIndex: 1,
    explanation: "The speaker asks: 'il treno regionale per Pisa parte dal binario due o quattro?' which is searching for the departure platform ('binario') to Pisa.",
    difficulty: "A2"
  },
  {
    id: "a_asc_3",
    category: "Ascolto",
    section: "Comprensione Orale",
    context: "Se domani c'è bel tempo, andiamo a fare una passeggiata in spiaggia e magari facciamo un bagno nel pomeriggio.",
    questionText: "Qual è il programma per domani se il meteo è favorevole?",
    options: [
      "Andare al cinema in centro città a vedere uno spettacolo.",
      "Andare a mangiare della carne al ristorante in montagna.",
      "Fare una passeggiata in spiaggia e nuotare nel pomeriggio.",
      "Rimanere a casa a riposare a causa della pioggia."
    ],
    correctAnswerIndex: 2,
    explanation: "The Professore says: 'andiamo a fare una passeggiata in spiaggia (walk on the beach) e magari facciamo un bagno (take a swim / bathe)' which matches option C.",
    difficulty: "A2"
  },
  {
    id: "cils_str_1_adj",
    category: "Grammatica",
    section: "Siena CILS - Accordo Aggettivi",
    context: "Siena CILS - Test di Analisi delle Strutture di Comunicazione (Prova n. 1 aggettivi):\nCompleta l'accordo degli aggettivi nel seguente testo sui viaggi:\n'L'agriturismo Nico si trova in Toscana su una (dolce) [1] __________ collina, in mezzo ad (antico) [2] __________ alberi di olivo e a prati (verde) [3] __________.'",
    questionText: "Scegli la combinazione corretta di aggettivi concordati nell'ordine [1], [2], [3]:",
    options: [
      "dolce / antichi / verdi",
      "dolci / antico / verde",
      "dolce / antiche / verdi",
      "dolce / antico / verde"
    ],
    correctAnswerIndex: 0,
    explanation: "[1] 'collina' is feminine singular -> 'dolce'. [2] 'alberi' is masculine plural -> 'antichi'. [3] 'prati' is masculine plural -> 'verdi'.",
    difficulty: "A2"
  },
  {
    id: "cils_str_2_verb",
    category: "Grammatica",
    section: "Siena CILS - Tempo Verbi",
    context: "Siena CILS - Test di Analisi delle Strutture di Comunicazione (Prova n. 2 verbi):\nCompleta la coniugazione corretta dei verbi tra parentesi:\n'Domenica scorsa (essere) [1] __________ stata una piacevole giornata. Noemi ed io (prendere) [2] __________ il treno delle 9:00 da Siena per andare al mare.'",
    questionText: "Scegli la combinazione verbale corretta nell'ordine [1], [2]:",
    options: [
      "è / abbiamo preso",
      "era / prendevamo",
      "è stata / prendemmo",
      "sia / avevamo preso"
    ],
    correctAnswerIndex: 0,
    explanation: "[1] The full passato prossimo of 'essere' for 'una giornata' (feminine singular) is 'è stata'; the word 'stata' is already in the sentence, so the blank takes just 'è'. [2] Completed action for 'Noemi ed io' (noi) is the passato prossimo of 'prendere' with auxiliary 'avere': 'abbiamo preso'.",
    difficulty: "A2"
  },
  {
    id: "cils_str_3_cloze",
    category: "Grammatica",
    section: "Siena CILS - Test Cloze",
    context: "Siena CILS - Test di Analisi delle Strutture di Comunicazione (Prova n. 3 completamento testo):\nCompleta il brano 'Il mio cane Buio':\n'Da qualche mese ho un cane. Si chiama Buio. È molto carino, ha il pelo (1) __________ e nero. Ha sempre fame! Mangia una volta al (2) __________, però spesso fa degli spuntini insieme a me.'",
    questionText: "Scegli le parole giuste per riempire gli spazi (1) e (2):",
    options: [
      "largo / tempo",
      "lungo / giorno",
      "alto / momento",
      "lungo / periodo"
    ],
    correctAnswerIndex: 1,
    explanation: "Buio is a dog, so he has 'pelo lungo' (long hair), and he eats once a 'giorno' (day). This is from the Siena CILS June 2017 Exam.",
    difficulty: "A2"
  },
  {
    id: "cils_read_3_match",
    category: "Lettura",
    section: "Siena CILS - Abbinamento Annunci",
    context: "Siena CILS - Comprensione della Lettura (Prova n. 3 abbinamento avvisi):\nLeggi i due brevi testi scolastici:\nTesto 1: 'Mostra a Padova - 28 aprile ore 18: inaugurazione della mostra di Daniela Mancin.'\nTesto 2: 'Invito ad una festa - Sabato 3 giugno è il mio compleanno! Ti aspetto a casa mia alle ore 20:00.'",
    questionText: "Quale combinazione di affermazioni completa correttamente i dettagli dei due testi?",
    options: [
      "La mostra è a Padova presso la Galleria; la festa inizia alle 20.00 e puoi portare un amico.",
      "La mostra è solo online; la festa è di domenica mattina per studiare insieme.",
      "La mostra cambia gli orari a causa di uno sciopero; la festa è annullata.",
      "La mostra è a Milano e l'ingresso costa 15 euro; la festa si tiene in un albergo di lusso."
    ],
    correctAnswerIndex: 0,
    explanation: "Based on the June 2017 Siena CILS exam: The exhibition 'Giocare con i colori' is in Padua at Galleria La Rinascente, and the birthday party begins at 20.00.",
    difficulty: "A2"
  },
  {
    id: "plida_read_1_match",
    category: "Lettura",
    section: "PLIDA - Abbinamento Lavoro",
    context: "PLIDA A2 - Comprensione della Lettura (Prima parte: Ricerca Lavoro):\nIl candidato cerca lavoro:\n'Ho bisogno di soldi, ma la mattina devo studiare all'università: vorrei lavorare per poche ore al giorno nel pomeriggio.'\nGli annunci disponibili sono:\nAnnuncio A: 'COMMESSO/A - Tempo pieno (dalle 9:00 alle 18:00) con esperienza.'\nAnnuncio B: 'OPERATORI CALL CENTER - Lavoro part time su turni di 4 ore a scelta (pom. dalle 16:00 alle 20:00).'",
    questionText: "Quale annuncio è il perfetto completamento per il profilo del candidato?",
    options: [
      "L'annuncio A, perché è un'attività adatta a chi parla più lingue straniere.",
      "L'annuncio B, perché rispetta l'esigenza di orario part-time pomeridiano permettendo di studiare la mattina.",
      "Nessun annuncio è adatto, perché il candidato deve rimanere a riposare a causa dello studio.",
      "Entrambi gli annunci, perché sono lavori vicini all'aeroporto internazionale."
    ],
    correctAnswerIndex: 1,
    explanation: "The profile wants to study in the morning and work part-time in the afternoon ('poche ore... nel pomeriggio'). Annuncio B is a part-time job of 4 hours with afternoon shifts (16:00 - 20:00), making it perfect.",
    difficulty: "A2"
  },
  {
    id: "plida_read_2_flyer",
    category: "Lettura",
    section: "PLIDA - Annunci Volantini",
    context: "PLIDA A2 - Comprensione della Lettura (Seconda parte: Volantino Gapped):\nIn una brochure promozionale si legge:\n'CORSO DI CUCINA DIETETICA CON GUSTO — Sabato 5 marzo dalle 9:30 alle 11:30 presso I Cantieri di Pavia. [Slogan mancante]'",
    questionText: "Quale dei seguenti gruppi di parole è coerente con lo spazio vuoto?",
    options: [
      "I mobili più belli per il tuo giardino",
      "Cartoleria punto e virgola: tutto per l'anno scolastico",
      "Ricette dal mondo buone e leggere",
      "Svendita totale su occhiali da sole"
    ],
    correctAnswerIndex: 2,
    explanation: "A 'Corso di cucina dietetica' (healthy cooking course) matches perfectly with the phrase 'Ricette dal mondo buone e leggere' (tasty and light world recipes) from the official PLIDA A2 sample paper.",
    difficulty: "A2"
  },
  {
    id: "plida_draw_1_ladder",
    category: "Ascolto",
    section: "PLIDA - Ascolto con Disegni",
    context: "Io vado in bagno a montare la lampadina nuova. Tu per favore vai in cucina, prendi la scala di legno e portamela qui così posso salire in sicurezza.",
    questionText: "Ascolta la registrazione audio del Professore. Che cosa deve portare l'altro personaggio in bagno?",
    options: [
      "Una sedia robusta da cucina",
      "La scala di legno per salire in sicurezza",
      "Il cappello di lana ed i guanti nuovi",
      "Una borsa portaspesa della spesa"
    ],
    correctAnswerIndex: 1,
    explanation: "The speaker requests the assistant to bring the wooden ladder ('prendi la scala di legno... e portamela qui'). This matches the image option displaying our mascot nanobanana on a ladder.",
    difficulty: "A2",
    optionImages: [
      "/images/banana_lightbulb_1779555206073.png",
      "/images/banana_ladder_1779555182658.png",
      "/images/banana_shopping_1779555229530.png",
      ""
    ]
  },
  {
    id: "plida_draw_2_shopping",
    category: "Ascolto",
    section: "PLIDA - Ascolto con Disegni",
    context: "Siamo andati al mercato coperto del centro città. Lì c'era molto freddo, allora mia sorellina ha scelto un grazioso cappello di lana rosso e un paio di guanti caldi coordinati.",
    questionText: "Ascolta la registrazione. Che cosa ha acquistato la sorellina al mercato per proteggersi dal freddo?",
    options: [
      "Un maglione blu pesante",
      "Una giacca leggera primaverile",
      "Un cappello di lana rosso e un paio di guanti caldi",
      "Un ombrello tascabile per la pioggia"
    ],
    correctAnswerIndex: 2,
    explanation: "The dialog specifies a wool hat and matching gloves ('un grazioso cappello di lana rosso e un paio di guanti caldi coordinati'), which is portrayed in our shopping nanobanana mascot asset.",
    difficulty: "A2",
    imageUrl: "/images/banana_shopping_1779555229530.png"
  },
  {
    id: "cils_asc_3_train",
    category: "Ascolto",
    section: "CILS - Prova n.1 Ascolto",
    context: "Prendo il treno regionale per andare a Firenze alle otto di mattina. Spero proprio di arrivare in tempo per l'inizio della mia lezione di storia dell'arte medievale.",
    questionText: "Ascolta la registrazione del Professore. Con quale mezzo viaggia il soggetto e perché?",
    options: [
      "Viaggia in auto per incontrare il fidanzato",
      "Prende un treno regionale per frequentare una lezione di storia dell'arte",
      "Cammina a piedi per partecipare a un tour guidato dei musei",
      "Prende un taxi per andare a lavorare all'ufficio postale"
    ],
    correctAnswerIndex: 1,
    explanation: "Based on the hidden text ('Prendo il treno regionale... per l'inizio della mia lezione di storia dell'arte'), the correct choice is taking the regional train for the lecture.",
    difficulty: "A2"
  },
  {
    id: "cils_asc_4_noleggio",
    category: "Ascolto",
    section: "CILS - Prova n.2 Autonoleggio",
    context: "Buongiorno signora, vorrei noleggiare una macchina per fare una vacanza di tre giorni al lago. Siccome siamo quattro persone adulte e abbiamo tre grandi valigie, ci serve un'auto spaziosa con un bagagliaio molto capiente.",
    questionText: "Ascolta l'estratto parlato. Quanti passeggeri devono viaggiare e quali requisiti deve possedere l'auto a noleggio?",
    options: [
      "Due persone con borse piccole per una gita in montagna",
      "Quattro persone adulte con tre grandi valigie e necessità di un bagagliaio capiente",
      "Tre ragazzi universitari senza bagagli che cercano una macchina sportiva veloce",
      "Una persona singola con un cane che cerca un furgoncino per traslochi"
    ],
    correctAnswerIndex: 1,
    explanation: "The customer specifies they are 4 adults with 3 large suitcases ('siamo quattro persone adulte e abbiamo tre grandi valigie') requiring a capacious trunk ('bagagliaio molto capiente').",
    difficulty: "A2"
  }
];

export function generateDynamicQuestionsPool(
  isExam: boolean,
  examType: string,
  count: number = 35
): Question[] {
  const list: Question[] = [];
  const startId = `${examType}_${isExam ? "exam" : "prac"}_dyn_`;

  // Distinct sets representing feminine and masculine names to solve morphological and indirect object agreements
  const maleNames = ["Stefano", "Federico", "Giacomo", "Gabriele", "Filippo", "Marco", "Matteo", "Davide", "Lorenzo", "Alessandro", "Luca", "Edoardo"];
  const femaleNames = ["Giulia", "Alice", "Silvia", "Valentina", "Anna", "Roberta", "Sofia", "Elena", "Chiara", "Francesca", "Teresa", "Beatrice"];

  const cities = [
    { name: "Venezia", prep: "a" },
    { name: "Roma", prep: "a" },
    { name: "Napoli", prep: "a" },
    { name: "Pisa", prep: "a" },
    { name: "Palermo", prep: "a" },
    { name: "Milano", prep: "a" },
    { name: "Torino", prep: "a" },
    { name: "Bologna", prep: "a" },
    { name: "Firenze", prep: "a" },
    { name: "Siena", prep: "a" }
  ];

  const countries = [
    { name: "Italia", prep: "in" },
    { name: "Francia", prep: "in" },
    { name: "Spagna", prep: "in" },
    { name: "Germania", prep: "in" },
    { name: "Inghilterra", prep: "in" }
  ];

  const foods = [
    { it: "un piatto di spaghetti alle vongole", eng: "a plate of spaghetti with clams" },
    { it: "una pizza Margherita calda", eng: "a hot Margherita pizza" },
    { it: "un risotto delizioso ai funghi", eng: "a delicious mushroom risotto" },
    { it: "un gelato artigianale al pistacchio", eng: "an artisanal pistachio ice cream" },
    { it: "le lasagne alla bolognese", eng: "lasagna bolognese" },
    { it: "un cornetto di pasticceria alla crema", eng: "a bakery custard croissant" }
  ];

  const jobs = [
    { name: "medico", desc: "cura i pazienti malati in ospedale", fName: "medica" },
    { name: "ingegnere", desc: "progetta ponti e sistemi complessi", fName: "ingegnere" },
    { name: "architetto", desc: "progetta case e bei palazzi pubblici", fName: "architetto" },
    { name: "cameriere", desc: "serve le pietanze calde ai tavoli", fName: "cameriera" },
    { name: "panettiere", desc: "prepara il pane fresco ogni mattina", fName: "panettiera" },
    { name: "farmacista", desc: "vende le medicine e dà consigli utili sulla salute", fName: "farmacista" }
  ];

  // Helper to generate a single question based on dynamic item template
  interface TemplateDef {
    category: string;
    section: string;
    build: (index: number) => Question;
  }

  const templates: TemplateDef[] = [
    // 1. City Prepositions
    {
      category: "Grammatica",
      section: "Preposizioni",
      build: (idx) => {
        const isFem = Math.random() > 0.5;
        const name = isFem ? femaleNames[idx % femaleNames.length] : maleNames[idx % maleNames.length];
        const city = cities[idx % cities.length];
        return {
          id: `${startId}prep_city_${idx}`,
          category: "Grammatica",
          section: "Preposizioni",
          questionText: `Domani mattina, ${name} prende il treno e va __________ ${city.name} per incontrare degli amici di scuola.`,
          options: ["in", "a", "da", "di"],
          correctAnswerIndex: 1, // "a"
          explanation: `In Italian, we always use the simple preposition 'a' before proper names of cities (e.g., 'vado a ${city.name}').`,
          difficulty: "A2"
        };
      }
    },
    // 2. Country Prepositions
    {
      category: "Grammatica",
      section: "Preposizioni",
      build: (idx) => {
        const isFem = Math.random() > 0.5;
        const name = isFem ? femaleNames[idx % femaleNames.length] : maleNames[idx % maleNames.length];
        const country = countries[idx % countries.length];
        return {
          id: `${startId}prep_country_${idx}`,
          category: "Grammatica",
          section: "Preposizioni",
          questionText: `Quest'estate, ${name} farà una vacanza __________ ${country.name} con un gruppo di studenti.`,
          options: ["a", "in", "di", "su"],
          correctAnswerIndex: 1, // "in"
          explanation: `In Italian, the simple preposition 'in' is used before names of countries or states (e.g., 'vado in ${country.name}').`,
          difficulty: "A2"
        };
      }
    },
    // 3. Reflexive Verbs - Third person singular (fixes "le piace" / "gli piace" gender alignment)
    {
      category: "Grammatica",
      section: "Verbi Riflessivi",
      build: (idx) => {
        const isFem = Math.random() > 0.5;
        const name = isFem ? femaleNames[idx % femaleNames.length] : maleNames[idx % maleNames.length];
        const pronoun = isFem ? "le" : "gli"; // Fix: "le piace" for female, "gli piace" for male
        return {
          id: `${startId}rif_pres_${idx}`,
          category: "Grammatica",
          section: "Verbi Riflessivi",
          questionText: `In genere, ${name} __________ presto nel fine settimana perché ${pronoun} piace correre all'aperto.`,
          options: ["si sveglia", "mi sveglio", "ti svegli", "si svegliano"],
          correctAnswerIndex: 0, // "si sveglia"
          explanation: `For the third-person singular pronoun 'lui/lei' representing '${name}', the reflexive verb 'svegliarsi' takes the clitic 'si' + 'sveglia'. The indirect object pronoun '${pronoun}' matches their gender.`,
          difficulty: "A2"
        };
      }
    },
    // 4. Reflexive Verbs - Passato Prossimo Plurals (fixes gendered pronouns and auxiliary essere agreements)
    {
      category: "Grammatica",
      section: "Verbi Riflessivi",
      build: (idx) => {
        const isFem = Math.random() > 0.5;
        const name1 = isFem ? femaleNames[idx % femaleNames.length] : maleNames[idx % maleNames.length];
        const name2 = isFem ? femaleNames[(idx + 1) % femaleNames.length] : maleNames[(idx + 1) % maleNames.length];
        
        // Exclude mixed ambiguities: Use either all-feminine names ("svegliate") or all-masculine/mixed ("svegliati")
        const ending = isFem ? "e" : "i";
        const subject = isFem ? `${name1} e ${name2}` : `${name1} e suo fratello`;
        
        return {
          id: `${startId}rif_pass_${idx}`,
          category: "Grammatica",
          section: "Verbi Riflessivi",
          questionText: `Ieri mattina, ${subject} __________ svegliat${ending} tardissimo e hanno perso il treno.`,
          options: [
            isFem ? "si sono" : "si sono",
            "ci siamo",
            "vi siete",
            "sono"
          ],
          correctAnswerIndex: 0,
          explanation: `Reflexive verb compound tenses in Italian always require the auxiliary verb 'essere'. For third-person plural 'loro' (${subject}), the correct form is 'si sono'. The participle ends in '-at${ending}' to agree with the subject's gender.`,
          difficulty: "A2"
        };
      }
    },
    // 5. Direct Object Pronouns
    {
      category: "Grammatica",
      section: "Pronomi Diretti",
      build: (idx) => {
        const isFem = Math.random() > 0.5;
        const name = isFem ? femaleNames[idx % femaleNames.length] : maleNames[idx % maleNames.length];
        return {
          id: `${startId}pron_dir_${idx}`,
          category: "Grammatica",
          section: "Pronomi",
          questionText: `Hai comprato la frutta fresca al mercato? — Sì, __________ ho appena comprata e lavata per ${name}.`,
          options: ["l'", "la", "lo", "ne"],
          correctAnswerIndex: 0, // "l'" (la collapses before ho)
          explanation: `The direct object 'la frutta' (feminine singular) is replaced by 'la', which contracts to 'l'' before the auxiliary verb 'ho'. The participle 'comprata' agrees with the feminine object.`,
          difficulty: "A2"
        };
      }
    },
    // 6. Indirect Object Pronouns
    {
      category: "Grammatica",
      section: "Pronomi Indiretti",
      build: (idx) => {
        const isFem = Math.random() > 0.5;
        const sender = isFem ? femaleNames[idx % femaleNames.length] : maleNames[idx % maleNames.length];
        const receiverIsFem = Math.random() > 0.5;
        const receiver = receiverIsFem ? femaleNames[(idx + 1) % femaleNames.length] : maleNames[(idx + 1) % maleNames.length];
        const correctAnswer = receiverIsFem ? "le" : "gli";
        const explanationPrn = receiverIsFem ? "le (to her)" : "gli (to him)";
        
        return {
          id: `${startId}pron_ind_${idx}`,
          category: "Grammatica",
          section: "Pronomi",
          questionText: `Oggi è il compleanno di ${receiver}. ${sender} __________ telefona nel pomeriggio per augurarle buon compleanno.`,
          options: [correctAnswer, correctAnswer === "le" ? "lo" : "la", "ci", "ne"].sort(() => 0.5 - Math.random()),
          correctAnswerIndex: -1, // dynamically set below
          explanation: `The verb 'telefonare' takes an indirect object in Italian ('telefonare a qualcuno'). We replace 'a ${receiver}' with the indirect pronoun '${explanationPrn}'.`,
          difficulty: "A2"
        };
      }
    },
    // 7. Partitive "Ne"
    {
      category: "Grammatica",
      section: "Pronomi",
      build: (idx) => {
        const name = maleNames[idx % maleNames.length];
        return {
          id: `${startId}part_ne_${idx}`,
          category: "Grammatica",
          section: "Pronomi",
          questionText: `Quanti caffè desidera, signor ${name}? — __________ vorrei due decaffeinati, per favore.`,
          options: ["Ne", "Ci", "Lo", "Li"],
          correctAnswerIndex: 0, // "Ne"
          explanation: `We use the partitive pronoun 'ne' to represent quantities of a specific noun ('caffè') mentioned in the question.`,
          difficulty: "A2"
        };
      }
    },
    // 8. Locative "Ci"
    {
      category: "Grammatica",
      section: "Pronomi",
      build: (idx) => {
        const name = femaleNames[idx % femaleNames.length];
        const city = cities[idx % cities.length];
        return {
          id: `${startId}loc_ci_${idx}`,
          category: "Grammatica",
          section: "Pronomi",
          questionText: `Sei andata a visitare ${city.name} con ${name}? — Sì, __________ sono andata l'anno scorso.`,
          options: ["ci", "ne", "lo", "la"],
          correctAnswerIndex: 0, // "ci"
          explanation: `The locative pronoun 'ci' replaces phrases denoting a physical place or destination ('a ${city.name}').`,
          difficulty: "A2"
        };
      }
    },
    // 9. Vocabulary - Food Ristorazione (resolves awkward singulars)
    {
      category: "Vocabolario",
      section: "Cibo",
      build: (idx) => {
        const name = maleNames[idx % maleNames.length];
        const food = foods[idx % foods.length];
        return {
          id: `${startId}vocab_food_${idx}`,
          category: "Vocabolario",
          section: "Cibo",
          questionText: `Al ristorante tipico, ${name} ordina __________ perché adora la cucina tradizionale italiana.`,
          options: [food.it, "una giacca di lana", "un treno ad alta velocità", "un semaforo stradale"],
          correctAnswerIndex: 0,
          explanation: `'${food.it}' (which means '${food.eng}') is the only logical item here that can be eaten at a restaurant.`,
          difficulty: "A2"
        };
      }
    },
    // 10. Vocabulary - Profession and Jobs (Corrects indefinite article agreements)
    {
      category: "Vocabolario",
      section: "Lavoro",
      build: (idx) => {
        const isFem = Math.random() > 0.5;
        const name = isFem ? femaleNames[idx % femaleNames.length] : maleNames[idx % maleNames.length];
        const job = jobs[idx % jobs.length];
        const jobTitle = isFem ? job.fName : job.name;
        
        // Determine indefinite article
        let article = "un";
        if (isFem) {
          article = (jobTitle.startsWith("a") || jobTitle.startsWith("e") || jobTitle.startsWith("i") || jobTitle.startsWith("o") || jobTitle.startsWith("u")) ? "un'" : "una";
        } else {
          article = (jobTitle.startsWith("i") || jobTitle.startsWith("a")) ? "un" : "un"; // Note A2 simple ingegnere -> un ingegnere, medico -> un medico.
        }
        
        return {
          id: `${startId}vocab_job_${idx}`,
          category: "Vocabolario",
          section: "Lavoro",
          questionText: `La sorella di ${name} studia molto all'università: lei lavora come __________ e ${job.desc}.`,
          options: [job.fName, "bilocale", "biglietteria", "autostop"].sort(() => 0.5 - Math.random()),
          correctAnswerIndex: -1,
          explanation: `The professional description matches the professional noun '${job.fName}' in Italian.`,
          difficulty: "A2"
        };
      }
    },
    // 11. Situational Interactions (fixing "di pomeriggio" to "nel pomeriggio")
    {
      category: "Situazioni",
      section: "Al bar",
      build: (idx) => {
        const isFem = Math.random() > 0.5;
        const name = isFem ? femaleNames[idx % femaleNames.length] : maleNames[idx % maleNames.length];
        return {
          id: `${startId}sit_bar_${idx}`,
          category: "Situazioni",
          section: "Al bar",
          context: "Al bar del centro nel pomeriggio.",
          questionText: `Cameriere: — Buongiorno signora ${name}, cosa desidera oggi?\nCliente: — Buongiorno! __________ un cappuccino tiepido e un cornetto d'orzo, grazie.`,
          options: ["Vorrei", "Voglio", "Gradisco", "Mi piace"],
          correctAnswerIndex: 0, // "Vorrei" (polite conditional)
          explanation: `'Vorrei' is the grammatically polite conditional form of 'volere' universally used to order items at a cafe or bar.`,
          difficulty: "A2"
        };
      }
    },
    // 12. Situational Directions
    {
      category: "Situazioni",
      section: "Indicazioni",
      build: (idx) => {
        return {
          id: `${startId}sit_dir_${idx}`,
          category: "Situazioni",
          section: "Indicazioni",
          context: "Chiedendo l'itinerario a un passante in via dell'Indipendenza.",
          questionText: `Turista: — Scusi, per andare alla farmacia comunale?\nPassante: — Deve andare sempre dritto e poi __________ a destra al semaforo.`,
          options: ["girare", "andare", "spiegare", "salire"],
          correctAnswerIndex: 0, // "girare"
          explanation: `Turning right or left in Italian navigational directions is expressed by the infinitive 'girare a destra' / 'girare a sinistra'.`,
          difficulty: "A2"
        };
      }
    }
  ];

  // Specific template additions for Siena CILS formatting with complete randomized variants
  const cilsTemplates: TemplateDef[] = [
    {
      category: "Grammatica",
      section: "Siena CILS - Accordo Aggettivi",
      build: (idx) => {
        const variants = [
          {
            city: "Siena",
            story: (n: string) => `Completa l'accordo degli aggettivi nel seguente brano:\n"La mia (nuovo) [1] __________ casa si trova a Siena, in una strada (stretto) [2] __________ del centro e ha una cucina molto (spazioso) [3] __________."`,
            options: ["nuova / stretta / spaziosa", "nuovo / stretta / spazioso", "nuove / stretto / spaziose"],
            ans: 0,
            exp: "'casa' (fem. sing.) -> 'nuova', 'strada' (fem. sing.) -> 'stretta', 'cucina' (fem. sing.) -> 'spaziosa'."
          },
          {
            city: "Milano",
            story: (n: string) => `Completa l'accordo degli aggettivi nel seguente brano:\n"Il nostro (bello) [1] __________ appartamento si trova a Milano, ha un salotto (luminoso) [2] __________ e una terrazza (fiorito) [3] __________."`,
            options: ["bello / luminoso / fiorita", "bella / luminosa / fiorito", "belli / luminoso / fioriti"],
            ans: 0,
            exp: "'appartamento' (masc. sing.) -> 'bello', 'salotto' (masc. sing.) -> 'luminoso', 'terrazza' (fem. sing.) -> 'fiorita'."
          },
          {
            city: "Roma",
            story: (n: string) => `Completa l'accordo degli aggettivi nel seguente brano:\n"Ieri abbiamo incontrato dei ragazzi (simpatico) [1] __________. Abbiamo mangiato in un ristorante (tipico) [2] __________ e bevuto dell'acqua (fresco) [3] __________."`,
            options: ["simpatici / tipico / fresca", "simpatico / tipica / fresco", "simpatica / tipico / fresche"],
            ans: 0,
            exp: "'ragazzi' (masc. plur.) -> 'simpatici', 'ristorante' (masc. sing.) -> 'tipico', 'acqua' (fem. sing.) -> 'fresca'."
          },
          {
            city: "Venezia",
            story: (n: string) => `Completa l'accordo degli aggettivi nel seguente brano:\n"In hotel ci sono due camere (grande) [1] __________, un bagno (pulito) [2] __________ e un corridoio molto (lungo) [3] __________."`,
            options: ["grandi / pulito / lungo", "grande / pulita / lunghi", "grandi / pulito / lunghe"],
            ans: 0,
            exp: "'camere' (fem. plur.) -> 'grandi', 'bagno' (masc. sing.) -> 'pulito', 'corridoio' (masc. sing.) -> 'lungo'."
          },
          {
            city: "Napoli",
            story: (n: string) => `Completa l'accordo degli aggettivi nel seguente brano:\n"Questa pizzeria (famoso) [1] __________ offre una pizza (buono) [2] __________ con mozzarella (fresco) [3] __________ di bufala."`,
            options: ["famosa / buona / fresca", "famoso / buono / fresche", "famosa / buoni / fresca"],
            ans: 0,
            exp: "'pizzeria' (fem. sing.) -> 'famosa', 'pizza' (fem. sing.) -> 'buona', 'mozzarella' (fem. sing.) -> 'fresca'."
          }
        ];
        const v = variants[idx % variants.length];
        const name = femaleNames[idx % femaleNames.length];
        return {
          id: `${startId}cils_adj_${idx}`,
          category: "Grammatica",
          section: "Siena CILS - Accordo Aggettivi",
          context: "Siena CILS - Analisi strutture di comunicazione (Accordi degli aggettivi):",
          questionText: v.story(name),
          options: v.options,
          correctAnswerIndex: v.ans,
          explanation: v.exp,
          difficulty: "A2"
        };
      }
    },
    {
      category: "Grammatica",
      section: "Siena CILS - Tempo Verbi",
      build: (idx) => {
        const variants = [
          {
            story: (n: string) => `Coniuga correttamente i verbi per rendere il brano coerente al passato:\n"Ieri ${n} (svegliarsi) [1] __________ alle 7:30 e (prendere) [2] __________ l'autobus per andare all'università."`,
            options: ["si è svegliata / ha preso", "si sveglia / prende", "si era svegliata / prendeva"],
            ans: 0,
            exp: "The reflexive 'svegliarsi' takes auxiliary 'essere' ('si è svegliata'), while transitives like 'prendere' require 'avere' ('ha preso')."
          },
          {
            story: (n: string) => `Coniuga correttamente i verbi per rendere coerente il brano:\n"Sabato scorso io e ${n} (andare) [1] __________ al mercato e (comprare) [2] __________ della frutta di stagione."`,
            options: ["siamo andate / abbiamo comprato", "siamo andati / avete comprato", "vanno / comprano"],
            ans: 0,
            exp: "Plural past action uses 'siamo andate' (for all-female) or 'siamo andati' (general) + 'abbiamo...'"
          },
          {
            story: (n: string) => `Coniuga correttamente i verbi per rendere coerente il racconto:\n"Mentre il cuoco (cucinare) [1] __________ la cena, gli ospiti (arrivare) [2] __________ all'improvviso in salotto."`,
            options: ["cucinava / sono arrivati", "ha cucinato / arrivano", "cucinava / hanno arrivato"],
            ans: 0,
            exp: "An ongoing past background action uses imperfetto ('cucinava') interrupted by a completed action in passato prossimo ('sono arrivati')."
          },
          {
            story: (n: string) => `Coniuga correttamente i verbi per rendere coerente il testo:\n"L'anno scorso, ${n} (comprare) [1] __________ una nuova bicicletta e ogni giorno (andare) [2] __________ a lavorare con essa."`,
            options: ["ha comprato / andava", "compra / va", "aveva comprato / è andato"],
            ans: 0,
            exp: "Completed past event 'ha comprato' paired with a habitual repetitive past action in imperfetto ('andava')."
          },
          {
            story: (n: string) => `Coniuga correttamente i verbi nel passato:\n"Ieri sera noi (cenare) [1] __________ molto tardi e poi (andare) [2] __________ a dormire subito."`,
            options: ["abbiamo cenato / siamo andati", "abbiamo cenato / abbiamo andato", "ceniamo / andiamo"],
            ans: 0,
            exp: "'cenare' takes avere ('abbiamo cenato'), while 'andare' is motion and takes essere ('siamo andati')."
          }
        ];
        const v = variants[idx % variants.length];
        const name = femaleNames[idx % femaleNames.length];
        return {
          id: `${startId}cils_verb_${idx}`,
          category: "Grammatica",
          section: "Siena CILS - Tempo Verbi",
          context: "Siena CILS - Analisi strutture di comunicazione (Morfoflessioni del verbo):",
          questionText: v.story(name),
          options: v.options,
          correctAnswerIndex: v.ans,
          explanation: v.exp,
          difficulty: "A2"
        };
      }
    },
    {
      category: "Grammatica",
      section: "Siena CILS - Test Cloze",
      build: (idx) => {
        const variants = [
          {
            story: `Trova le parole mancanti (1) e (2) per dare un senso logico al brano 'In stazione':\n"Per viaggiare da Roma a Firenze dobbiamo prima fare il (1) __________ alla biglietteria. Il viaggio dura circa due (2) __________."`,
            options: ["biglietto / ore", "cambio / minuti", "treno / mesi"],
            ans: 0,
            exp: "We buy a ticket ('biglietto') before traveling and the transit duration is measured in hours ('ore')."
          },
          {
            story: `Trova le parole mancanti (1) e (2) per dare coerenza al brano 'Al ristorante':\n"Dopo aver cenato, abbiamo chiamato il cameriere per chiedere il (1) __________. Abbiamo pagato in contanti e lasciato una (2) __________ sul tavolo."`,
            options: ["conto / mancia", "menu / borsa", "prezzo / chiave"],
            ans: 0,
            exp: "At the end of a meal, you ask for the bill ('conto') and can optionally leave a tip ('mancia')."
          },
          {
            story: `Trova le parole mancanti (1) e (2) al brano 'In albergo':\n"All'arrivo alla reception, ho mostrato il mio (1) __________ d'identità. L'impiegato mi ha consegnato la (2) __________ per aprire la camera."`,
            options: ["documento / chiave", "biglietto / luce", "passaporto / sedia"],
            ans: 0,
            exp: "You verify your identity showing a document ('documento') and receive the key ('chiave') to access your hotel room."
          },
          {
            story: `Trova le parole mancanti (1) e (2) al brano 'Dal medico':\n"Ho una forte (1) __________ e mi fa male la testa. Il dottore mi ha consigliato di rimanere a (2) __________ per due giorni."`,
            options: ["influenza / riposo", "febbre / lavorare", "salute / festa"],
            ans: 0,
            exp: "Being sick with flu ('influenza') requires staying in bed resting ('riposo')."
          },
          {
            story: `Trova le parole mancanti (1) e (2) per il brano 'Una casa in affitto':\n"Cerco un appartamento con un (1) __________ non troppo alto. Voglio firmare un (2) __________ di affitto per studenti."`,
            options: ["canone / contratto", "prezzo / biglietto", "costo / passaporto"],
            ans: 0,
            exp: "The rent fee is the 'canone' and standard housing requires signing a lease agreement ('contratto')."
          }
        ];
        const v = variants[idx % variants.length];
        return {
          id: `${startId}cils_cloze_${idx}`,
          category: "Grammatica",
          section: "Siena CILS - Test Cloze",
          context: "Siena CILS - Analisi strutture di comunicazione (Test di completamento testo):",
          questionText: v.story,
          options: v.options,
          correctAnswerIndex: v.ans,
          explanation: v.exp,
          difficulty: "A2"
        };
      }
    }
  ];

  // Specific templates for Dante Alighieri PLIDA formatting with 5 distinct dynamic variants
  const plidaTemplates: TemplateDef[] = [
    {
      category: "Lettura",
      section: "PLIDA - Ricerca Lavoro",
      build: (idx) => {
        const variants = [
          {
            candidate: "Giulia",
            requirement: "posso dare la mia disponibilità solo la mattina prima dell'inizio delle lezioni universitarie alle 13:00, con un impegno part-time.",
            options: [
              "Annuncio A: 'Cercasi commesso a tempo pieno dalle 9:00 alle 18:00.'",
              "Annuncio B: 'Cercasi cameriere per turno serale dalle 19:30 alle 23:30.'",
              "Annuncio C: 'Cercasi addetto alle pulizie part-time la mattina dalle 8:00 alle 11:30.'",
              "Annuncio D: 'Cercasi receptionist turni diurni alternati week-end.'"
            ],
            ans: 2,
            exp: "Giulia needs a morning-only, part-time job before 13:00. Annuncio C matches her schedule perfectly."
          },
          {
            candidate: "Stefano",
            requirement: "posso lavorare solo durante il fine settimana (sabato e domenica) perché studio dal lunedì al venerdì a tempo pieno.",
            options: [
              "Annuncio A: 'Offresi lavoro continuativo d'ufficio lun-ven.'",
              "Annuncio B: 'Cercasi cassiere part-time per week-end presso supermercato locale.'",
              "Annuncio C: 'Cercasi apprendista idraulico turni settimanali.'",
              "Annuncio D: 'Cercasi cuoco stagionale e assistente cucina.'"
            ],
            ans: 1,
            exp: "Stefano is busy studying during weekdays and can only work Saturdays/Sundays, coinciding with Annuncio B (week-end)."
          },
          {
            candidate: "Alice",
            requirement: "cerco un impiego nel campo della ristorazione biologica e vegetariana, ho già due anni di esperienza come aiuto cuoco.",
            options: [
              "Annuncio A: 'Cercasi macellaio esperto per banco carne fresca.'",
              "Annuncio B: 'Ristorante vegano in centro cerca aiuto cuoco appassionato di materie prime organiche.'",
              "Annuncio C: 'Pizzeria d'asporto cerca fattorino automunito.'",
              "Annuncio D: 'Osteria tradizionale piemontese cerca cameriere di sala.'"
            ],
            ans: 1,
            exp: "Alice's profile matches organic/veg kitchen assistant, coordinating directly with Annuncio B (vegan restaurant, cooking assistant)."
          },
          {
            candidate: "Federico",
            requirement: "adoro la natura e il giardinaggio. Preferisco lavorare all'aperto, accudendo piante e giardini privati o pubblici.",
            options: [
              "Annuncio A: 'Cercasi giardiniere motivato per manutenzione parchi e spazi verdi.'",
              "Annuncio B: 'Cercasi magazziniere per deposito merci chiuso.'",
              "Annuncio C: 'Cercasi impiegato d'ufficio per inserimento dati.'",
              "Annuncio D: 'Cercasi commesso per negozio di elettronica.'"
            ],
            ans: 0,
            exp: "Federico wants outdoor gardening activities, which fits Annuncio A (gardener, parks maintenance)."
          },
          {
            candidate: "Sofia",
            requirement: "parlo bene inglese e spagnolo. Cerco un impiego da svolgere direttamente da casa in smart-working come traduttrice.",
            options: [
              "Annuncio A: 'Cercasi segretaria di presenza per studio medico.'",
              "Annuncio B: 'Agenzia editoriale cerca collaboratore esterno da remoto per traduzione testi stranieri.'",
              "Annuncio C: 'Cercasi hostess di volo bilingue.'",
              "Annuncio D: 'Cercasi promoter commerciale presso centro commerciale.'"
            ],
            ans: 1,
            exp: "Sofia wants work-from-home smart-working translations matching Annuncio B (remote translation jobs)."
          }
        ];
        const v = variants[idx % variants.length];
        return {
          id: `${startId}plida_job_${idx}`,
          category: "Lettura",
          section: "PLIDA - Ricerca Lavoro",
          context: `PLIDA A2 - Comprensione della Lettura (Parte 1: Ricerca Lavoro). Profilo di ${v.candidate}: "Ho bisogno di un impiego e ${v.requirement}"`,
          questionText: "Quale annuncio di lavoro corrisponde perfettamente alle esigenze del candidato?",
          options: v.options,
          correctAnswerIndex: v.ans,
          explanation: v.exp,
          difficulty: "A2"
        };
      }
    },
    {
      category: "Lettura",
      section: "PLIDA - Volantini Slogan",
      build: (idx) => {
        const variants = [
          {
            title: "CENTRO SPORTIVO COMUNALE",
            body: "Corsi di nuoto per bambini e adulti aperti a tutti, vasca coperta termale climatizzata.",
            options: [
              "Vieni ad imparare a nuotare con i migliori istruttori qualificati!",
              "Torte di compleanno su ordinazione con ingredienti biologici.",
              "Sconti eccezionali su scarpe classiche in pelle.",
              "Vendesi comodo appartamento ristrutturato con grande terrazzo."
            ],
            ans: 0,
            exp: "The brochure is about swimming courses ('corsi di nuoto'), making 'imparare a nuotare' the only cohesive visual slogan."
          },
          {
            title: "SCUOLA DI LINGUE 'ITALIA MIA'",
            body: "Impara la lingua più bella del mondo con professori madrelingua, mini-gruppi flessibili di mattina o sera.",
            options: [
              "Migliora il tuo italiano e comunica con sicurezza oggi stesso!",
              "Pizze fragranti cotte nel forno a legna anche a pranzo.",
              "Abbonamenti convenienti per la metropolitana a tariffa locale.",
              "Vasta scelta di piante fiorite e vasi su misura per terrazze."
            ],
            ans: 0,
            exp: "The leaflet describes learning Italian with native teachers, aligning directly with language acquisition."
          },
          {
            title: "PALESTRA 'VITA SANA'",
            body: "Sala pesi attrezzata, corsi di yoga, pilates and cardio aperti dalle 6:00 alle 24:00 tutti i giorni.",
            options: [
              "Prenditi cura del tuo corpo e rimani in forma con noi!",
              "Riparazione rapida di frigoriferi e lavatrici a domicilio.",
              "Arredamento moderno e mobili componibili per il soggiorno.",
              "Prenota un viaggio rilassante in crociera sul Mediterraneo."
            ],
            ans: 0,
            exp: "Gymnasiums and health activities align perfectly with body fitness ('rimani in forma')."
          },
          {
            title: "LIBRERIA DEL CENTRO",
            body: "Tutti i fine settimana incontri letterari con gli autori, sconti speciali del 20% su romanzi e fumetti.",
            options: [
              "Scopri il tuo prossimo libro preferito e inizia a leggere!",
              "Offerte speciali su pneumatici per auto estivi e invernali.",
              "Formaggi locali freschi e stagionati pronti da asporto.",
              "Corsi professionali di informatica di base e database."
            ],
            ans: 0,
            exp: "The bookstore flyer calls for discovering your next favorite book and reading ('inizia a leggere')."
          },
          {
            title: "CLINICA DENTISTICA 'SORRISO'",
            body: "Igiene orale professionale, dentisti esperti convenzionati, prima visita di controllo gratuita.",
            options: [
              "Mantieni sano il tuo sorriso con veri professionisti della salute!",
              "Tessuti pregiati per tende da sole e tappezzeria d'interni.",
              "Spaghetti freschi e pasta fatta in casa pronti in 5 minuti.",
              "Vendita scooter elettrici con ricarica domestica veloce."
            ],
            ans: 0,
            exp: "Dental care directly targets smiles ('sorriso') and health."
          }
        ];
        const v = variants[idx % variants.length];
        return {
          id: `${startId}plida_flyer_${idx}`,
          category: "Lettura",
          section: "PLIDA - Volantini Slogan",
          context: `PLIDA A2 - Comprensione della Lettura (Parte 2: Completamento Volantini). Volantino: "${v.title} — ${v.body} [Slogan mancante]"`,
          questionText: "Scegli il gruppo di parole mancante coerente con il volantino:",
          options: v.options,
          correctAnswerIndex: v.ans,
          explanation: v.exp,
          difficulty: "A2"
        };
      }
    }
  ];

  // Compile active template builders based on exact target selection to preserve exercise types integration
  let activeBuilders: TemplateDef[] = [];
  if (examType === "cils_adj") {
    activeBuilders = [cilsTemplates[0]];
  } else if (examType === "cils_verb") {
    activeBuilders = [cilsTemplates[1]];
  } else if (examType === "cils_cloze") {
    activeBuilders = [cilsTemplates[2]];
  } else if (examType === "plida_job") {
    activeBuilders = [plidaTemplates[0]];
  } else if (examType === "plida_slogan") {
    activeBuilders = [plidaTemplates[1]];
  } else if (examType === "qcer_general") {
    activeBuilders = [...templates];
  } else if (examType === "cils") {
    activeBuilders = [...cilsTemplates];
  } else if (examType === "plida") {
    activeBuilders = [...plidaTemplates];
  } else {
    // general/all QCER mix
    activeBuilders = [...templates, ...cilsTemplates, ...plidaTemplates];
  }

  // Final fallback guard if activeBuilders is somehow empty or invalid
  if (!activeBuilders || activeBuilders.length === 0) {
    activeBuilders = [...templates];
  }

  // Shuffle breeders so order is random
  activeBuilders = shuffleArray(activeBuilders);

  // Generate dynamic questions in a round-robin interleaved schema to completely avoid repetitive single-category runs!
  let idxCounter = 0;
  while (list.length < count && idxCounter < 150) {
    const builder = activeBuilders[idxCounter % activeBuilders.length];
    if (!builder || typeof builder.build !== 'function') {
      idxCounter++;
      continue;
    }
    try {
      const q = builder.build(idxCounter);
      if (!q || !q.id || !q.options || !Array.isArray(q.options)) {
        idxCounter++;
        continue;
      }
      
      // Update correctAnswerIndex dynamically if options were shuffled during build
      if (q.correctAnswerIndex === -1) {
        const correctVal = q.options[0]; // assume first option holds correction during setup
        const shuffledOpts = shuffleArray(q.options);
        q.options = shuffledOpts;
        q.correctAnswerIndex = shuffledOpts.indexOf(correctVal);
      }

      // Enforce CILS Siena 3-choice rule deterministically
      const qIdStr = q.id || "";
      if (examType === "cils" || qIdStr.includes("cils")) {
        // CILS always features exactly 3 options. Slice out one wrong option.
        const correctVal = q.options[q.correctAnswerIndex];
        const wrongOpts = q.options.filter(o => o !== correctVal).slice(0, 2);
        const cilsOpts = shuffleArray([correctVal, ...wrongOpts]);
        q.options = cilsOpts;
        q.correctAnswerIndex = cilsOpts.indexOf(correctVal);
      }

      list.push(q);
    } catch (e) {
      console.error("Error building dynamic item", e);
    }
    idxCounter++;
  }

  return list.filter(q => q && q.id).slice(0, count);
}

export function shuffleQuestionOptions(question: Question): Question {
  const optionsWithIndices = question.options.map((option, idx) => ({
    option,
    isCorrect: idx === question.correctAnswerIndex,
    optionImage: question.optionImages ? question.optionImages[idx] : undefined
  }));
  
  // Scramble options randomly using Fisher-Yates
  for (let i = optionsWithIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionsWithIndices[i], optionsWithIndices[j]] = [optionsWithIndices[j], optionsWithIndices[i]];
  }
  
  const newOptions = optionsWithIndices.map(o => o.option);
  const newCorrectIndex = optionsWithIndices.findIndex(o => o.isCorrect);
  const newOptionImages = question.optionImages 
    ? optionsWithIndices.map(o => o.optionImage || "") 
    : undefined;

  return {
    ...question,
    options: newOptions,
    correctAnswerIndex: newCorrectIndex,
    optionImages: newOptionImages
  };
}

// Split curatedQuestions into disjoint practice and exam statically
const curatedPractice = curatedQuestions.filter((_, idx) => idx % 2 === 0);
const curatedExam = curatedQuestions.filter((_, idx) => idx % 2 !== 0);

export function getQuestionsForQuiz(
  mode: 'practice' | 'exam' | 'prefettura',
  examType: string = 'all'
): Question[] {
  // Disjoint division: Practice gets practice, Exam/Prefettura get exam pool
  let staticCurated = (mode === 'practice' ? curatedPractice : curatedExam).filter(q => q && q.id);
  
  // Filter core static curated items by specific syllabus target if selected
  if (examType === 'cils' || examType.startsWith('cils_')) {
    staticCurated = staticCurated.filter(q => {
      const qId = (q?.id || '').toLowerCase();
      const qSec = (q?.section || '').toLowerCase();
      const qText = (q?.questionText || '').toLowerCase();
      return qId.includes('cils') || qSec.includes('cils') || qText.includes('cils');
    });
  } else if (examType === 'plida' || examType.startsWith('plida_')) {
    staticCurated = staticCurated.filter(q => {
      const qId = (q?.id || '').toLowerCase();
      const qSec = (q?.section || '').toLowerCase();
      const qText = (q?.questionText || '').toLowerCase();
      return qId.includes('plida') || qSec.includes('plida') || qText.includes('plida');
    });
  } else if (examType === 'qcer_general') {
    staticCurated = staticCurated.filter(q => {
      const qId = (q?.id || '').toLowerCase();
      return !qId.includes('cils') && !qId.includes('plida');
    });
  }

  // Note: the previous localStorage cache (`cached_gemini_questions_v1`) is
  // gone — the server-side SQLite bank is now the source of truth. This
  // function is only used as a synchronous fallback while the network
  // /api/quiz/start request is in flight. We also opportunistically clear the
  // stale cache so it doesn't grow unbounded on existing browsers.
  if (typeof window !== 'undefined' && window.localStorage) {
    try { window.localStorage.removeItem('cached_gemini_questions_v1'); } catch { /* ignore */ }
  }

  const basePool = [...staticCurated].filter(q => q && q.id);
  const neededDynamic = 50 - basePool.length;
  
  // Create a beautiful dynamic generator with unique seeds to populate whatever count is remaining
  const isExamMode = mode === 'exam' || mode === 'prefettura';
  const dynamicGenerated = generateDynamicQuestionsPool(isExamMode, examType, neededDynamic > 0 ? neededDynamic : 30);
  
  const combined = [...basePool, ...dynamicGenerated].filter(q => q && q.id && q.options && Array.isArray(q.options));
  
  // Choose up to 50 items and shuffle them (Fisher–Yates)
  const shuffledQuestions = shuffleArray(combined).slice(0, 50);

  // Dynamically scramble answer placements for high realism
  return shuffledQuestions.map(q => {
    if (!q || !q.id || !q.options || !Array.isArray(q.options)) return null;
    const qIdStr = (q.id || '').toLowerCase();
    const qSecStr = (q.section || '').toLowerCase();

    // If the question is a CILS question, keep exactly 3 options.
    if (examType === 'cils' || examType.startsWith('cils_') || qIdStr.includes('cils') || qSecStr.includes('cils')) {
      const correctVal = q.options[q.correctAnswerIndex];
      const wrongs = q.options.filter(o => o !== correctVal).slice(0, 2);
      const shuffledOpts = shuffleArray([correctVal, ...wrongs]);
      return {
        ...q,
        options: shuffledOpts,
        correctAnswerIndex: shuffledOpts.indexOf(correctVal)
      };
    }
    return shuffleQuestionOptions(q);
  }).filter(q => q && q.id && q.options) as Question[];
}
