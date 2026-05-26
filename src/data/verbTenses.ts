/** Canonical A2 verb-tense definitions: rules, formation examples, and vocabulary. */

export type TenseId =
  | 'presente'
  | 'passato_composto'
  | 'imperfetto'
  | 'futuro_semplice'
  | 'imperativo';

/**
 * Item kinds used by the training UI:
 * - 'vocab'     = step 2: vocabulary teaching + matching (what the verb/term MEANS)
 * - 'recognize' = step 3: given a conjugated form, pick the infinitive
 * - 'conjugate' = step 4: given infinitive + pronoun, pick the correct conjugated form
 * - 'context'   = step 5: fill-in-the-blank in a sentence (uses the tense in context)
 * - 'mixed'     = step 6: mixed mini-quiz with all four item types
 */
export type StepKind = 'vocab' | 'recognize' | 'conjugate' | 'context' | 'mixed';

export const TENSE_ORDER: TenseId[] = [
  'presente',
  'passato_composto',
  'imperfetto',
  'futuro_semplice',
  'imperativo',
] as const;

export interface VocabCard {
  term: string;
  kind: 'verb' | 'term';
  english: string;
  exampleIt: string;
  exampleEn: string;
}

export interface TenseDef {
  id: TenseId;
  labelIt: string;
  labelEn: string;
  isCompound: boolean;
  auxiliaryTenseId?: TenseId;
  rules: string;
  formationExamples: { it: string; en: string; verb: string }[];
  vocabulary: VocabCard[];
}

// ---------------------------------------------------------------------------
// PRESENTE SEMPLICE
// ---------------------------------------------------------------------------

const PRESENTE: TenseDef = {
  id: 'presente',
  labelIt: 'Presente Semplice',
  labelEn: 'Simple Present',
  isCompound: false,
  rules: `Il **presente indicativo** si usa per parlare di azioni che accadono **ora**, di abitudini e di fatti generali.

**Quando si usa:**
- Azioni in corso ora: *Mangio la pizza.*
- Abitudini e routine: *Ogni mattina bevo un caffè.*
- Fatti veri o generali: *L'Italia è in Europa.*
- Futuro vicino e programmato: *Domani parto per Roma.*

**Formazione dei verbi regolari** (togliamo -are/-ere/-ire e aggiungiamo le desinenze):

- **-are** (parlare): io parl**o**, tu parl**i**, lui/lei parl**a**, noi parl**iamo**, voi parl**ate**, loro parl**ano**
- **-ere** (prendere): io prend**o**, tu prend**i**, lui/lei prend**e**, noi prend**iamo**, voi prend**ete**, loro prend**ono**
- **-ire** (dormire): io dorm**o**, tu dorm**i**, lui/lei dorm**e**, noi dorm**iamo**, voi dorm**ite**, loro dorm**ono**

Molti verbi in **-ire** prendono **-isc-** (capire, finire, preferire): io cap**isc**o, tu cap**isc**i, lui cap**isc**e, noi capiamo, voi capite, loro cap**isc**ono.

**Irregolari importanti:**
- **essere**: sono, sei, è, siamo, siete, sono
- **avere**: ho, hai, ha, abbiamo, avete, hanno
- **fare**: faccio, fai, fa, facciamo, fate, fanno
- **andare**: vado, vai, va, andiamo, andate, vanno
- **stare**: sto, stai, sta, stiamo, state, stanno
- **dare**: do, dai, dà, diamo, date, danno
- **dire**: dico, dici, dice, diciamo, dite, dicono
- **venire**: vengo, vieni, viene, veniamo, venite, vengono
- **uscire**: esco, esci, esce, usciamo, uscite, escono`,
  formationExamples: [
    { it: 'Io parlo italiano con i miei amici.', en: 'I speak Italian with my friends.', verb: 'parlare' },
    { it: 'Tu prendi sempre il treno delle otto.', en: 'You always take the eight o\'clock train.', verb: 'prendere' },
    { it: 'Noi dormiamo otto ore ogni notte.', en: 'We sleep eight hours every night.', verb: 'dormire' },
    { it: 'Lei capisce bene lo spagnolo.', en: 'She understands Spanish well.', verb: 'capire' },
    { it: 'Loro vanno al mare ogni domenica.', en: 'They go to the sea every Sunday.', verb: 'andare' },
    { it: 'Io ho due fratelli e una sorella.', en: 'I have two brothers and one sister.', verb: 'avere' },
  ],
  vocabulary: [
    {
      term: 'mangiare',
      kind: 'verb',
      english: 'to eat',
      exampleIt: 'A pranzo mangio sempre la pasta.',
      exampleEn: 'For lunch I always eat pasta.',
    },
    {
      term: 'lavorare',
      kind: 'verb',
      english: 'to work',
      exampleIt: 'Marco lavora in un ufficio in centro.',
      exampleEn: 'Marco works in an office downtown.',
    },
    {
      term: 'studiare',
      kind: 'verb',
      english: 'to study',
      exampleIt: 'Studio italiano ogni sera.',
      exampleEn: 'I study Italian every evening.',
    },
    {
      term: 'abitare',
      kind: 'verb',
      english: 'to live (reside)',
      exampleIt: 'Abito a Milano da tre anni.',
      exampleEn: 'I have been living in Milan for three years.',
    },
    {
      term: 'avere',
      kind: 'verb',
      english: 'to have',
      exampleIt: 'Ho una bicicletta nuova.',
      exampleEn: 'I have a new bicycle.',
    },
    {
      term: 'essere',
      kind: 'verb',
      english: 'to be',
      exampleIt: 'Siamo italiani e parliamo italiano.',
      exampleEn: 'We are Italian and we speak Italian.',
    },
    {
      term: 'andare',
      kind: 'verb',
      english: 'to go',
      exampleIt: 'Vado a scuola in autobus.',
      exampleEn: 'I go to school by bus.',
    },
    {
      term: 'fare',
      kind: 'verb',
      english: 'to do / to make',
      exampleIt: 'La domenica faccio sport con i miei amici.',
      exampleEn: 'On Sundays I do sports with my friends.',
    },
    {
      term: 'di solito',
      kind: 'term',
      english: 'usually',
      exampleIt: 'Di solito mi alzo alle sette.',
      exampleEn: 'I usually get up at seven.',
    },
    {
      term: 'sempre',
      kind: 'term',
      english: 'always',
      exampleIt: 'Bevo sempre un caffè dopo pranzo.',
      exampleEn: 'I always drink a coffee after lunch.',
    },
    {
      term: 'oggi',
      kind: 'term',
      english: 'today',
      exampleIt: 'Oggi mangio a casa di mia madre.',
      exampleEn: 'Today I am eating at my mother\'s house.',
    },
    {
      term: 'ogni giorno',
      kind: 'term',
      english: 'every day',
      exampleIt: 'Ogni giorno vado in palestra alle sei.',
      exampleEn: 'Every day I go to the gym at six.',
    },
    {
      term: 'spesso',
      kind: 'term',
      english: 'often',
      exampleIt: 'Spesso ceniamo con i nostri vicini.',
      exampleEn: 'We often have dinner with our neighbours.',
    },
    {
      term: 'adesso',
      kind: 'term',
      english: 'now',
      exampleIt: 'Adesso non posso parlare, sono al lavoro.',
      exampleEn: 'I can\'t talk now, I am at work.',
    },
  ],
};

// ---------------------------------------------------------------------------
// PASSATO COMPOSTO (Passato Prossimo)
// ---------------------------------------------------------------------------

const PASSATO_COMPOSTO: TenseDef = {
  id: 'passato_composto',
  labelIt: 'Passato Composto (Passato Prossimo)',
  labelEn: 'Present Perfect',
  isCompound: true,
  auxiliaryTenseId: 'presente',
  rules: `Il **passato prossimo** racconta azioni finite nel passato, spesso recenti o con un legame con il presente: *Ieri ho mangiato la pizza. / Stamattina sono andato a scuola.*

**Formazione:** **ausiliare al presente** (essere o avere) + **participio passato** del verbo principale.

**Participio passato regolare:**
- **-are** → **-ato** (parlare → parl**ato**)
- **-ere** → **-uto** (credere → cred**uto**)
- **-ire** → **-ito** (dormire → dorm**ito**)

**Scelta dell'ausiliare:**
- **avere** con la maggior parte dei verbi transitivi (azioni con oggetto): *Ho mangiato una mela.*
- **essere** con i verbi di movimento (andare, venire, partire, arrivare, uscire, entrare, salire, scendere, tornare), di stato (essere, stare, rimanere), di cambiamento (nascere, morire, diventare) e con i verbi riflessivi (alzarsi, lavarsi): *Sono andata a Roma. Mi sono svegliato presto.*

**Accordo del participio:**
- Con **essere**, il participio concorda in **genere e numero** con il soggetto: *Maria è andat**a**. I ragazzi sono partit**i**.*
- Con **avere**, il participio resta in **-o** (non concorda con l'oggetto, salvo casi con pronomi diretti, non richiesti all'A2).

**Participi irregolari frequenti:**
- essere → stato — avere → avuto — fare → fatto — dire → detto
- prendere → preso — leggere → letto — scrivere → scritto — vedere → visto
- venire → venuto — nascere → nato — aprire → aperto — chiudere → chiuso
- bere → bevuto — mettere → messo — perdere → perso — rispondere → risposto`,
  formationExamples: [
    { it: 'Ieri ho parlato con il professore.', en: 'Yesterday I spoke with the teacher.', verb: 'parlare' },
    { it: 'Abbiamo creduto alla sua storia.', en: 'We believed his story.', verb: 'credere' },
    { it: 'Stanotte ho dormito poco.', en: 'Last night I slept little.', verb: 'dormire' },
    { it: 'Maria è andata al mercato stamattina.', en: 'Maria went to the market this morning.', verb: 'andare' },
    { it: 'Loro sono partiti per la Francia.', en: 'They left for France.', verb: 'partire' },
    { it: 'Ho fatto i compiti dopo cena.', en: 'I did my homework after dinner.', verb: 'fare' },
  ],
  vocabulary: [
    {
      term: 'mangiare',
      kind: 'verb',
      english: 'to eat',
      exampleIt: 'A pranzo ho mangiato un panino al prosciutto.',
      exampleEn: 'For lunch I ate a ham sandwich.',
    },
    {
      term: 'andare',
      kind: 'verb',
      english: 'to go',
      exampleIt: 'Sabato scorso sono andata al cinema con Luca.',
      exampleEn: 'Last Saturday I went to the cinema with Luca.',
    },
    {
      term: 'vedere',
      kind: 'verb',
      english: 'to see',
      exampleIt: 'Ieri sera ho visto un bel film italiano.',
      exampleEn: 'Yesterday evening I saw a nice Italian film.',
    },
    {
      term: 'fare',
      kind: 'verb',
      english: 'to do / to make',
      exampleIt: 'Ho fatto la spesa al supermercato vicino casa.',
      exampleEn: 'I did the shopping at the supermarket near home.',
    },
    {
      term: 'prendere',
      kind: 'verb',
      english: 'to take',
      exampleIt: 'Stamattina ho preso il treno delle otto.',
      exampleEn: 'This morning I took the eight o\'clock train.',
    },
    {
      term: 'partire',
      kind: 'verb',
      english: 'to leave (depart)',
      exampleIt: 'I miei amici sono partiti per Napoli ieri.',
      exampleEn: 'My friends left for Naples yesterday.',
    },
    {
      term: 'arrivare',
      kind: 'verb',
      english: 'to arrive',
      exampleIt: 'Anna è arrivata in ritardo alla riunione.',
      exampleEn: 'Anna arrived late at the meeting.',
    },
    {
      term: 'scrivere',
      kind: 'verb',
      english: 'to write',
      exampleIt: 'Ho scritto una lunga e-mail a mia sorella.',
      exampleEn: 'I wrote a long email to my sister.',
    },
    {
      term: 'ieri',
      kind: 'term',
      english: 'yesterday',
      exampleIt: 'Ieri ho lavorato fino a tardi.',
      exampleEn: 'Yesterday I worked late.',
    },
    {
      term: 'la settimana scorsa',
      kind: 'term',
      english: 'last week',
      exampleIt: 'La settimana scorsa sono andato a Firenze.',
      exampleEn: 'Last week I went to Florence.',
    },
    {
      term: 'già',
      kind: 'term',
      english: 'already',
      exampleIt: 'Ho già finito di studiare la lezione.',
      exampleEn: 'I have already finished studying the lesson.',
    },
    {
      term: 'mai',
      kind: 'term',
      english: 'never / ever',
      exampleIt: 'Non sono mai stata in Giappone.',
      exampleEn: 'I have never been to Japan.',
    },
    {
      term: 'due ore fa',
      kind: 'term',
      english: 'two hours ago',
      exampleIt: 'Ho chiamato Marco due ore fa.',
      exampleEn: 'I called Marco two hours ago.',
    },
    {
      term: 'stamattina',
      kind: 'term',
      english: 'this morning',
      exampleIt: 'Stamattina ho bevuto un cappuccino al bar.',
      exampleEn: 'This morning I had a cappuccino at the bar.',
    },
  ],
};

// ---------------------------------------------------------------------------
// IMPERFETTO
// ---------------------------------------------------------------------------

const IMPERFETTO: TenseDef = {
  id: 'imperfetto',
  labelIt: 'Imperfetto',
  labelEn: 'Imperfect',
  isCompound: false,
  rules: `L'**imperfetto** descrive il passato senza dire quando l'azione finisce. Si usa per:

- **Abitudini passate**: *Da bambino giocavo sempre in giardino.*
- **Descrizioni** di persone, luoghi, tempo: *La casa era grande e aveva un giardino. Faceva freddo.*
- **Azioni in corso** nel passato, spesso con *mentre*: *Mentre leggevo, il telefono è suonato.*
- **Età, ora e stati d'animo** nel passato: *Avevo dieci anni. Erano le tre. Ero stanco.*

**Formazione dei verbi regolari** (togliamo -re e aggiungiamo le desinenze):

- **-are** (parlare): parl**avo**, parl**avi**, parl**ava**, parl**avamo**, parl**avate**, parl**avano**
- **-ere** (prendere): prend**evo**, prend**evi**, prend**eva**, prend**evamo**, prend**evate**, prend**evano**
- **-ire** (dormire): dorm**ivo**, dorm**ivi**, dorm**iva**, dorm**ivamo**, dorm**ivate**, dorm**ivano**

L'imperfetto è quasi sempre regolare: bastano le desinenze giuste.

**Irregolari importanti:**
- **essere**: ero, eri, era, eravamo, eravate, erano
- **fare**: facevo, facevi, faceva, facevamo, facevate, facevano
- **dire**: dicevo, dicevi, diceva, dicevamo, dicevate, dicevano
- **bere**: bevevo, bevevi, beveva, bevevamo, bevevate, bevevano

**Imperfetto o passato prossimo?** L'imperfetto descrive lo sfondo (*com'era*, *cosa succedeva di solito*); il passato prossimo racconta l'azione precisa e finita (*cosa è successo una volta*).`,
  formationExamples: [
    { it: 'Da bambino parlavo solo italiano in famiglia.', en: 'As a child I only spoke Italian at home.', verb: 'parlare' },
    { it: 'Ogni mattina prendevamo il caffè insieme.', en: 'Every morning we used to have coffee together.', verb: 'prendere' },
    { it: 'Quando ero piccolo, dormivo con la luce accesa.', en: 'When I was little, I used to sleep with the light on.', verb: 'dormire' },
    { it: 'Mia nonna era una donna molto allegra.', en: 'My grandmother was a very cheerful woman.', verb: 'essere' },
    { it: 'In montagna faceva sempre molto freddo.', en: 'In the mountains it was always very cold.', verb: 'fare' },
    { it: 'I bambini bevevano il latte ogni sera.', en: 'The children used to drink milk every evening.', verb: 'bere' },
  ],
  vocabulary: [
    {
      term: 'abitare',
      kind: 'verb',
      english: 'to live (reside)',
      exampleIt: 'Da bambina abitavo in un piccolo paese.',
      exampleEn: 'As a child I lived in a small village.',
    },
    {
      term: 'giocare',
      kind: 'verb',
      english: 'to play',
      exampleIt: 'Mio fratello e io giocavamo a calcio ogni pomeriggio.',
      exampleEn: 'My brother and I used to play football every afternoon.',
    },
    {
      term: 'avere',
      kind: 'verb',
      english: 'to have',
      exampleIt: 'Quando avevo dieci anni, avevo un cane bianco.',
      exampleEn: 'When I was ten, I had a white dog.',
    },
    {
      term: 'essere',
      kind: 'verb',
      english: 'to be',
      exampleIt: 'Da giovane mio nonno era molto sportivo.',
      exampleEn: 'When he was young, my grandfather was very sporty.',
    },
    {
      term: 'andare',
      kind: 'verb',
      english: 'to go',
      exampleIt: 'D\'estate andavamo sempre al mare in Sicilia.',
      exampleEn: 'In summer we always used to go to the sea in Sicily.',
    },
    {
      term: 'guardare',
      kind: 'verb',
      english: 'to watch',
      exampleIt: 'La sera guardavamo i cartoni animati in TV.',
      exampleEn: 'In the evening we used to watch cartoons on TV.',
    },
    {
      term: 'leggere',
      kind: 'verb',
      english: 'to read',
      exampleIt: 'Mia madre leggeva una favola prima di dormire.',
      exampleEn: 'My mother used to read a fairy tale before bed.',
    },
    {
      term: 'fare',
      kind: 'verb',
      english: 'to do / to make',
      exampleIt: 'In inverno faceva molto freddo nella vecchia casa.',
      exampleEn: 'In winter it was very cold in the old house.',
    },
    {
      term: 'da bambino/a',
      kind: 'term',
      english: 'as a child',
      exampleIt: 'Da bambina avevo i capelli lunghi e biondi.',
      exampleEn: 'As a child I had long, blond hair.',
    },
    {
      term: 'mentre',
      kind: 'term',
      english: 'while',
      exampleIt: 'Mentre cucinavo, ascoltavo la radio.',
      exampleEn: 'While I was cooking, I was listening to the radio.',
    },
    {
      term: 'sempre',
      kind: 'term',
      english: 'always',
      exampleIt: 'Da piccolo mangiavo sempre la pizza il sabato.',
      exampleEn: 'When I was little, I always used to eat pizza on Saturdays.',
    },
    {
      term: 'ogni giorno',
      kind: 'term',
      english: 'every day',
      exampleIt: 'Ogni giorno andavo a scuola a piedi.',
      exampleEn: 'Every day I used to walk to school.',
    },
    {
      term: 'di solito',
      kind: 'term',
      english: 'usually',
      exampleIt: 'Di solito la domenica pranzavamo dai nonni.',
      exampleEn: 'On Sundays we usually had lunch at our grandparents\' house.',
    },
    {
      term: 'una volta',
      kind: 'term',
      english: 'once / in the past',
      exampleIt: 'Una volta in questo quartiere c\'era un cinema.',
      exampleEn: 'There used to be a cinema in this neighbourhood.',
    },
  ],
};

// ---------------------------------------------------------------------------
// FUTURO SEMPLICE
// ---------------------------------------------------------------------------

const FUTURO_SEMPLICE: TenseDef = {
  id: 'futuro_semplice',
  labelIt: 'Futuro Semplice',
  labelEn: 'Simple Future',
  isCompound: false,
  rules: `Il **futuro semplice** parla di azioni o situazioni che avverranno **dopo** il momento in cui parliamo: *Domani andrò al mare.*

**Quando si usa:**
- Previsioni: *Domani pioverà.*
- Programmi e intenzioni future: *L'anno prossimo cambierò lavoro.*
- Ipotesi e supposizioni nel presente: *Saranno le tre.* (= Sono circa le tre.)
- Promesse: *Ti scriverò appena arrivo.*

In italiano per il futuro vicino si usa spesso anche il **presente** (*Domani parto per Roma.*).

**Formazione dei verbi regolari:**

I verbi in **-are** cambiano la **-a-** in **-e-**: parlare → parler-.

- **-are** (parlare): parler**ò**, parler**ai**, parler**à**, parler**emo**, parler**ete**, parler**anno**
- **-ere** (prendere): prender**ò**, prender**ai**, prender**à**, prender**emo**, prender**ete**, prender**anno**
- **-ire** (dormire): dormir**ò**, dormir**ai**, dormir**à**, dormir**emo**, dormir**ete**, dormir**anno**

**Irregolari importanti** (radice irregolare + stesse desinenze):
- **essere**: sarò, sarai, sarà, saremo, sarete, saranno
- **avere**: avrò, avrai, avrà, avremo, avrete, avranno
- **fare**: farò, farai, farà, faremo, farete, faranno
- **andare**: andrò, andrai, andrà, andremo, andrete, andranno
- **venire**: verrò, verrai, verrà, verremo, verrete, verranno
- **vedere**: vedrò, vedrai, vedrà, vedremo, vedrete, vedranno
- **sapere**: saprò, saprai, saprà, sapremo, saprete, sapranno
- **potere / dovere / volere**: potrò, dovrò, vorrò...

I verbi in **-care/-gare** (cercare, pagare) aggiungono **h** per mantenere il suono duro: cer**ch**erò, pa**gh**erò.`,
  formationExamples: [
    { it: 'Domani parlerò con la mia insegnante di matematica.', en: 'Tomorrow I will speak with my maths teacher.', verb: 'parlare' },
    { it: 'Stasera prenderemo un taxi per andare al ristorante.', en: 'Tonight we will take a taxi to go to the restaurant.', verb: 'prendere' },
    { it: 'In vacanza dormirò almeno dieci ore a notte.', en: 'On holiday I will sleep at least ten hours a night.', verb: 'dormire' },
    { it: 'L\'anno prossimo andrò in Spagna con la mia famiglia.', en: 'Next year I will go to Spain with my family.', verb: 'andare' },
    { it: 'Marco e Anna saranno felici di rivederti.', en: 'Marco and Anna will be happy to see you again.', verb: 'essere' },
    { it: 'Cercherò un nuovo lavoro dopo l\'estate.', en: 'I will look for a new job after the summer.', verb: 'cercare' },
  ],
  vocabulary: [
    {
      term: 'partire',
      kind: 'verb',
      english: 'to leave (depart)',
      exampleIt: 'Domani partirò per Napoli con il treno delle nove.',
      exampleEn: 'Tomorrow I will leave for Naples on the nine o\'clock train.',
    },
    {
      term: 'visitare',
      kind: 'verb',
      english: 'to visit',
      exampleIt: 'L\'estate prossima visiteremo Roma e Firenze.',
      exampleEn: 'Next summer we will visit Rome and Florence.',
    },
    {
      term: 'comprare',
      kind: 'verb',
      english: 'to buy',
      exampleIt: 'Sabato comprerò un regalo per mia sorella.',
      exampleEn: 'On Saturday I will buy a present for my sister.',
    },
    {
      term: 'essere',
      kind: 'verb',
      english: 'to be',
      exampleIt: 'Fra dieci anni sarò un bravo medico.',
      exampleEn: 'In ten years I will be a good doctor.',
    },
    {
      term: 'avere',
      kind: 'verb',
      english: 'to have',
      exampleIt: 'L\'anno prossimo avrò una casa più grande.',
      exampleEn: 'Next year I will have a bigger house.',
    },
    {
      term: 'fare',
      kind: 'verb',
      english: 'to do / to make',
      exampleIt: 'Questo weekend faremo una gita in montagna.',
      exampleEn: 'This weekend we will take a trip to the mountains.',
    },
    {
      term: 'andare',
      kind: 'verb',
      english: 'to go',
      exampleIt: 'Domani sera andremo a teatro insieme.',
      exampleEn: 'Tomorrow evening we will go to the theatre together.',
    },
    {
      term: 'studiare',
      kind: 'verb',
      english: 'to study',
      exampleIt: 'Dopo cena studierò per l\'esame di italiano.',
      exampleEn: 'After dinner I will study for the Italian exam.',
    },
    {
      term: 'domani',
      kind: 'term',
      english: 'tomorrow',
      exampleIt: 'Domani pioverà su tutta l\'Italia.',
      exampleEn: 'Tomorrow it will rain across the whole of Italy.',
    },
    {
      term: 'la prossima settimana',
      kind: 'term',
      english: 'next week',
      exampleIt: 'La prossima settimana inizierò un nuovo corso di yoga.',
      exampleEn: 'Next week I will start a new yoga course.',
    },
    {
      term: 'fra poco',
      kind: 'term',
      english: 'in a little while',
      exampleIt: 'Fra poco arriverà l\'autobus per il centro.',
      exampleEn: 'In a little while the bus to the centre will arrive.',
    },
    {
      term: 'l\'anno prossimo',
      kind: 'term',
      english: 'next year',
      exampleIt: 'L\'anno prossimo mi sposerò con Giulia.',
      exampleEn: 'Next year I will marry Giulia.',
    },
    {
      term: 'dopodomani',
      kind: 'term',
      english: 'the day after tomorrow',
      exampleIt: 'Dopodomani avremo l\'esame finale di grammatica.',
      exampleEn: 'The day after tomorrow we will have the final grammar exam.',
    },
    {
      term: 'fra due giorni',
      kind: 'term',
      english: 'in two days',
      exampleIt: 'Fra due giorni partiremo per le vacanze.',
      exampleEn: 'In two days we will leave for our holidays.',
    },
  ],
};

// ---------------------------------------------------------------------------
// IMPERATIVO
// ---------------------------------------------------------------------------

const IMPERATIVO: TenseDef = {
  id: 'imperativo',
  labelIt: 'Imperativo',
  labelEn: 'Imperative Mood',
  isCompound: false,
  rules: `L'**imperativo** si usa per dare **ordini**, **consigli**, **istruzioni**, **divieti** e **richieste cortesi**. È fondamentale nella vita di tutti i giorni: a scuola, al lavoro, al ristorante, in negozio.

**Quando si usa:**
- Ordini diretti: *Marco, **parla** più forte!*
- Consigli e suggerimenti: ***Prendi** l'ombrello, piove!*
- Istruzioni: ***Premi** il pulsante verde.*
- Cortesia con "Lei" (forme di rispetto): *Signora, **mi scusi**! ***Prenda** un caffè, prego.*
- Divieti (con "non"): ***Non parlare** ad alta voce!*
- Esortazioni: ***Andiamo** a mangiare qualcosa!*

**Le quattro forme A2:** **tu** (informale), **Lei** (formale), **noi** (esortazione), **voi** (gruppo).

**Formazione regolare (positivo):**
- **-are** (parlare): **parla** (tu) · **parli** (Lei) · **parliamo** (noi) · **parlate** (voi)
- **-ere** (prendere): **prendi** · **prenda** · **prendiamo** · **prendete**
- **-ire** (dormire): **dormi** · **dorma** · **dormiamo** · **dormite**
- **-ire** -isc- (finire): **finisci** · **finisca** · **finiamo** · **finite**

**Negativo (regola importante!):**
- Con **tu**: **non + infinito** → ***Non parlare!*** *Non correre!* *Non aprire la porta!*
- Con **Lei**, **noi**, **voi**: **non + imperativo** → *Non parli! Non parliamo! Non parlate!*

**Irregolari principali:**
- **essere**: **sii** · **sia** · siamo · siate
- **avere**: **abbi** · **abbia** · abbiamo · abbiate
- **fare**: **fai** (o **fa'**) · **faccia** · facciamo · fate
- **andare**: **vai** (o **va'**) · **vada** · andiamo · andate
- **dare**: **dai** (o **da'**) · **dia** · diamo · date
- **dire**: **di'** · **dica** · diciamo · dite
- **stare**: **stai** (o **sta'**) · **stia** · stiamo · state

**Pronomi con l'imperativo:** all'A2, con **tu/noi/voi** i pronomi si attaccano al verbo (*dimmi*, *aspettami*, *scusami*); con **Lei** restano separati e prima del verbo (*mi dica*, *mi aspetti*, *mi scusi*).`,
  formationExamples: [
    { it: 'Marco, parla più lentamente, per favore!', en: 'Marco, speak more slowly, please!', verb: 'parlare' },
    { it: 'Signora, prenda pure una sedia.', en: 'Ma\'am, please take a chair.', verb: 'prendere' },
    { it: 'Ragazzi, finite i compiti prima di cena!', en: 'Kids, finish your homework before dinner!', verb: 'finire' },
    { it: 'Andiamo al cinema stasera!', en: 'Let\'s go to the cinema tonight!', verb: 'andare' },
    { it: 'Non aprire quella porta!', en: 'Don\'t open that door!', verb: 'aprire' },
  ],
  vocabulary: [
    {
      term: 'venire',
      kind: 'verb',
      english: 'to come',
      exampleIt: 'Vieni qui un momento, per favore!',
      exampleEn: 'Come here for a moment, please!',
    },
    {
      term: 'aspettare',
      kind: 'verb',
      english: 'to wait',
      exampleIt: 'Aspetta un attimo, arrivo subito.',
      exampleEn: 'Wait a moment, I\'m coming right away.',
    },
    {
      term: 'ascoltare',
      kind: 'verb',
      english: 'to listen',
      exampleIt: 'Ascoltami bene, è importante.',
      exampleEn: 'Listen to me carefully, it\'s important.',
    },
    {
      term: 'prendere',
      kind: 'verb',
      english: 'to take',
      exampleIt: 'Prendi l\'autobus numero 23 per il centro.',
      exampleEn: 'Take bus number 23 for the city centre.',
    },
    {
      term: 'dire',
      kind: 'verb',
      english: 'to say / to tell',
      exampleIt: 'Dimmi la verità, per favore.',
      exampleEn: 'Tell me the truth, please.',
    },
    {
      term: 'stare',
      kind: 'verb',
      english: 'to stay / to be (state)',
      exampleIt: 'Sta\' tranquillo, tutto va bene.',
      exampleEn: 'Stay calm, everything is fine.',
    },
    {
      term: 'andare',
      kind: 'verb',
      english: 'to go',
      exampleIt: 'Va\' a casa e riposati un po\'.',
      exampleEn: 'Go home and rest a little.',
    },
    {
      term: 'fare',
      kind: 'verb',
      english: 'to do / to make',
      exampleIt: 'Fai attenzione quando attraversi la strada!',
      exampleEn: 'Be careful when you cross the street!',
    },
    {
      term: 'per favore',
      kind: 'term',
      english: 'please',
      exampleIt: 'Aspetta un momento, per favore.',
      exampleEn: 'Wait a moment, please.',
    },
    {
      term: 'subito',
      kind: 'term',
      english: 'right away / immediately',
      exampleIt: 'Vieni qui subito!',
      exampleEn: 'Come here right away!',
    },
    {
      term: 'attenzione',
      kind: 'term',
      english: 'attention / careful',
      exampleIt: 'Attenzione al gradino, signora!',
      exampleEn: 'Watch the step, ma\'am!',
    },
    {
      term: 'forza!',
      kind: 'term',
      english: 'come on! / go on!',
      exampleIt: 'Forza, possiamo farcela!',
      exampleEn: 'Come on, we can do it!',
    },
    {
      term: 'dai!',
      kind: 'term',
      english: 'come on! (informal)',
      exampleIt: 'Dai, andiamo, siamo in ritardo!',
      exampleEn: 'Come on, let\'s go, we\'re late!',
    },
    {
      term: 'non ti preoccupare',
      kind: 'term',
      english: 'don\'t worry',
      exampleIt: 'Non ti preoccupare, è tutto a posto.',
      exampleEn: 'Don\'t worry, everything is fine.',
    },
  ],
};

// ---------------------------------------------------------------------------
// PUBLIC REGISTRY + HELPERS
// ---------------------------------------------------------------------------

export const TENSES: Record<TenseId, TenseDef> = {
  presente: PRESENTE,
  passato_composto: PASSATO_COMPOSTO,
  imperfetto: IMPERFETTO,
  futuro_semplice: FUTURO_SEMPLICE,
  imperativo: IMPERATIVO,
};

/**
 * Returns a compact Italian block that can be embedded in a Gemini system prompt
 * to ground the model in the canonical rules of a tense. Kept under ~600 words.
 */
export function rulesPromptBlock(tense: TenseId): string {
  const def = TENSES[tense];
  const examplesList = def.formationExamples
    .map((ex) => `- ${ex.it} (${ex.verb})`)
    .join('\n');

  // Pick up to 8 most useful terms: prefer time markers / typical signals, then verbs.
  const keyVocab = [
    ...def.vocabulary.filter((v) => v.kind === 'term'),
    ...def.vocabulary.filter((v) => v.kind === 'verb'),
  ]
    .slice(0, 8)
    .map((v) => v.term)
    .join(', ');

  return `## Regole: ${def.labelIt}\n\n${def.rules}\n\nFormazione (esempi):\n${examplesList}\n\nVocabolario chiave: ${keyVocab}`;
}
