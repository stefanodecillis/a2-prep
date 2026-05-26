/** Canonical A2 verb-tense definitions: rules, formation examples, and vocabulary. */

export type TenseId =
  | 'presente'
  | 'passato_composto'
  | 'imperfetto'
  | 'trapassato_prossimo'
  | 'futuro_semplice'
  | 'futuro_anteriore';

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
  'trapassato_prossimo',
  'futuro_semplice',
  'futuro_anteriore',
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
// TRAPASSATO PROSSIMO
// ---------------------------------------------------------------------------

const TRAPASSATO_PROSSIMO: TenseDef = {
  id: 'trapassato_prossimo',
  labelIt: 'Trapassato Prossimo',
  labelEn: 'Past Perfect (Pluperfect)',
  isCompound: true,
  auxiliaryTenseId: 'imperfetto',
  rules: `Il **trapassato prossimo** indica un'azione del passato avvenuta **prima** di un'altra azione del passato: *Quando sono arrivato, Maria era già uscita.*

Si usa spesso insieme al **passato prossimo** o all'**imperfetto** per dire quale azione è successa per prima.

**Formazione:** **ausiliare all'imperfetto** (essere o avere) + **participio passato** del verbo principale.

**Ausiliare all'imperfetto:**
- **avere**: avevo, avevi, aveva, avevamo, avevate, avevano
- **essere**: ero, eri, era, eravamo, eravate, erano

**Scelta dell'ausiliare:** segue le stesse regole del passato prossimo.
- **avere** con i verbi transitivi: *Avevo già mangiato quando è arrivato Marco.*
- **essere** con i verbi di movimento, di stato e con i riflessivi: *Eravamo già partiti. Mi ero già lavato i denti.*

**Accordo del participio:**
- Con **essere**, il participio concorda con il soggetto in **genere e numero**: *Anna era andat**a**. Le ragazze erano uscit**e**.*
- Con **avere**, il participio resta in **-o**: *Avevamo finit**o** i compiti.*

**Participi passati regolari:** -are → -ato, -ere → -uto, -ire → -ito.
**Irregolari frequenti:** stato, fatto, detto, preso, letto, scritto, visto, venuto, aperto, chiuso, bevuto, messo.

**Esempi tipici:**
- *Quando sono arrivata a casa, mio marito aveva già preparato la cena.*
- *Non avevo mai visto un film così bello prima di ieri.*
- *Marco era stanco perché aveva lavorato tutto il giorno.*`,
  formationExamples: [
    { it: 'Quando sei arrivato, io avevo già parlato con il direttore.', en: 'When you arrived, I had already spoken with the director.', verb: 'parlare' },
    { it: 'Avevamo preso il treno sbagliato e siamo tornati indietro.', en: 'We had taken the wrong train and we went back.', verb: 'prendere' },
    { it: 'Non avevo mai dormito così male in vita mia.', en: 'I had never slept so badly in my life.', verb: 'dormire' },
    { it: 'Quando sono uscita, Luca era già andato via.', en: 'When I went out, Luca had already left.', verb: 'andare' },
    { it: 'I bambini erano stanchi perché avevano fatto sport tutto il giorno.', en: 'The children were tired because they had done sports all day.', verb: 'fare' },
    { it: 'Maria era partita due ore prima di me.', en: 'Maria had left two hours before me.', verb: 'partire' },
  ],
  vocabulary: [
    {
      term: 'finire',
      kind: 'verb',
      english: 'to finish',
      exampleIt: 'Quando è suonato il telefono, avevo già finito di mangiare.',
      exampleEn: 'When the phone rang, I had already finished eating.',
    },
    {
      term: 'mangiare',
      kind: 'verb',
      english: 'to eat',
      exampleIt: 'Non avevo fame perché avevo mangiato un panino al bar.',
      exampleEn: 'I wasn\'t hungry because I had eaten a sandwich at the bar.',
    },
    {
      term: 'uscire',
      kind: 'verb',
      english: 'to go out',
      exampleIt: 'Quando sono arrivata, i miei amici erano già usciti.',
      exampleEn: 'When I arrived, my friends had already gone out.',
    },
    {
      term: 'arrivare',
      kind: 'verb',
      english: 'to arrive',
      exampleIt: 'Il treno era arrivato in orario, ma noi eravamo in ritardo.',
      exampleEn: 'The train had arrived on time, but we were late.',
    },
    {
      term: 'dimenticare',
      kind: 'verb',
      english: 'to forget',
      exampleIt: 'Sono tornato a casa perché avevo dimenticato le chiavi.',
      exampleEn: 'I went back home because I had forgotten the keys.',
    },
    {
      term: 'studiare',
      kind: 'verb',
      english: 'to study',
      exampleIt: 'Anna ha preso un bel voto perché aveva studiato molto.',
      exampleEn: 'Anna got a good grade because she had studied a lot.',
    },
    {
      term: 'vedere',
      kind: 'verb',
      english: 'to see',
      exampleIt: 'Non avevo mai visto la neve prima di andare in montagna.',
      exampleEn: 'I had never seen snow before going to the mountains.',
    },
    {
      term: 'prenotare',
      kind: 'verb',
      english: 'to book',
      exampleIt: 'Per fortuna avevamo prenotato il ristorante in anticipo.',
      exampleEn: 'Luckily we had booked the restaurant in advance.',
    },
    {
      term: 'prima',
      kind: 'term',
      english: 'before / earlier',
      exampleIt: 'Avevo preparato la valigia il giorno prima della partenza.',
      exampleEn: 'I had packed the suitcase the day before the departure.',
    },
    {
      term: 'già',
      kind: 'term',
      english: 'already',
      exampleIt: 'Quando sei entrato, avevamo già iniziato la riunione.',
      exampleEn: 'When you came in, we had already started the meeting.',
    },
    {
      term: 'non ancora',
      kind: 'term',
      english: 'not yet',
      exampleIt: 'A mezzogiorno non avevo ancora ricevuto la sua e-mail.',
      exampleEn: 'At noon I had not yet received his email.',
    },
    {
      term: 'mai',
      kind: 'term',
      english: 'never / ever',
      exampleIt: 'Non avevo mai mangiato il sushi prima di quel giorno.',
      exampleEn: 'I had never eaten sushi before that day.',
    },
    {
      term: 'appena',
      kind: 'term',
      english: 'just',
      exampleIt: 'Eravamo appena tornati a casa quando è iniziato il temporale.',
      exampleEn: 'We had just returned home when the storm started.',
    },
    {
      term: 'dopo che',
      kind: 'term',
      english: 'after (that)',
      exampleIt: 'Dopo che aveva finito di lavorare, è andato in palestra.',
      exampleEn: 'After he had finished work, he went to the gym.',
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
// FUTURO ANTERIORE
// ---------------------------------------------------------------------------

const FUTURO_ANTERIORE: TenseDef = {
  id: 'futuro_anteriore',
  labelIt: 'Futuro Anteriore',
  labelEn: 'Future Perfect',
  isCompound: true,
  auxiliaryTenseId: 'futuro_semplice',
  rules: `Il **futuro anteriore** indica un'azione del futuro che sarà **già finita** prima di un'altra azione futura: *Quando arriverai, avrò già preparato la cena.*

**Quando si usa:**
- Azione futura conclusa prima di un'altra azione futura, di solito con **quando**, **appena**, **dopo che**: *Appena avrò finito di lavorare, ti chiamerò.*
- Supposizioni sul passato recente: *Dov'è Maria? Sarà uscita con i suoi amici.* (= Penso che sia uscita.)

**Formazione:** **ausiliare al futuro semplice** (essere o avere) + **participio passato**.

**Ausiliare al futuro:**
- **avere**: avrò, avrai, avrà, avremo, avrete, avranno
- **essere**: sarò, sarai, sarà, saremo, sarete, saranno

**Scelta dell'ausiliare:** segue le stesse regole del passato prossimo e del trapassato.
- **avere** con i verbi transitivi: *Avrò finito il libro per domenica.*
- **essere** con i verbi di movimento, di stato e con i riflessivi: *Saremo arrivati per le otto. Mi sarò già svegliato quando suonerà la sveglia.*

**Accordo del participio:**
- Con **essere**, il participio concorda con il soggetto in **genere e numero**: *Maria sarà tornat**a**. I ragazzi saranno usciti.*
- Con **avere**, il participio resta in **-o**: *Avremo mangiat**o** prima delle otto.*

**Participi regolari:** -are → -ato, -ere → -uto, -ire → -ito.
**Irregolari frequenti:** stato, fatto, detto, preso, visto, scritto, letto, venuto, aperto, chiuso, bevuto, messo.

All'A2 il futuro anteriore appare soprattutto con **quando**, **appena**, **dopo che** per dire l'ordine di due azioni future.`,
  formationExamples: [
    { it: 'Quando arriverai, avrò già parlato con il direttore.', en: 'When you arrive, I will have already spoken with the director.', verb: 'parlare' },
    { it: 'Appena avremo preso la patente, compreremo una macchina.', en: 'As soon as we have got our driving licence, we will buy a car.', verb: 'prendere' },
    { it: 'Dopo che avrò dormito un po\', mi sentirò meglio.', en: 'After I have slept a bit, I will feel better.', verb: 'dormire' },
    { it: 'Per le sette Maria sarà già andata via.', en: 'By seven, Maria will have already left.', verb: 'andare' },
    { it: 'Quando finiremo, avremo fatto tutti i compiti.', en: 'When we finish, we will have done all our homework.', verb: 'fare' },
    { it: 'Sarò tornata a casa prima delle dieci di sera.', en: 'I will have come back home before ten in the evening.', verb: 'tornare' },
  ],
  vocabulary: [
    {
      term: 'finire',
      kind: 'verb',
      english: 'to finish',
      exampleIt: 'Quando avrò finito di studiare, ti chiamerò.',
      exampleEn: 'When I have finished studying, I will call you.',
    },
    {
      term: 'arrivare',
      kind: 'verb',
      english: 'to arrive',
      exampleIt: 'Per mezzogiorno saremo arrivati a Bologna.',
      exampleEn: 'By midday we will have arrived in Bologna.',
    },
    {
      term: 'preparare',
      kind: 'verb',
      english: 'to prepare',
      exampleIt: 'Quando torneremo a casa, mia madre avrà preparato la cena.',
      exampleEn: 'When we return home, my mother will have prepared dinner.',
    },
    {
      term: 'partire',
      kind: 'verb',
      english: 'to leave (depart)',
      exampleIt: 'Alle otto saranno già partiti per l\'aeroporto.',
      exampleEn: 'By eight they will have already left for the airport.',
    },
    {
      term: 'mangiare',
      kind: 'verb',
      english: 'to eat',
      exampleIt: 'Quando arriverete, avremo già mangiato.',
      exampleEn: 'When you arrive, we will have already eaten.',
    },
    {
      term: 'tornare',
      kind: 'verb',
      english: 'to return',
      exampleIt: 'Per le dieci sarò tornato a casa di sicuro.',
      exampleEn: 'I will surely be back home by ten.',
    },
    {
      term: 'leggere',
      kind: 'verb',
      english: 'to read',
      exampleIt: 'Entro venerdì avrò letto tutto il libro.',
      exampleEn: 'By Friday I will have read the whole book.',
    },
    {
      term: 'scrivere',
      kind: 'verb',
      english: 'to write',
      exampleIt: 'Dopo che avrò scritto l\'e-mail, andrò a dormire.',
      exampleEn: 'After I have written the email, I will go to sleep.',
    },
    {
      term: 'quando',
      kind: 'term',
      english: 'when',
      exampleIt: 'Quando saremo tornati, andremo a fare la spesa.',
      exampleEn: 'When we have come back, we will go grocery shopping.',
    },
    {
      term: 'appena',
      kind: 'term',
      english: 'as soon as',
      exampleIt: 'Appena avrò finito il lavoro, verrò da te.',
      exampleEn: 'As soon as I have finished work, I will come to you.',
    },
    {
      term: 'dopo che',
      kind: 'term',
      english: 'after (that)',
      exampleIt: 'Dopo che avranno cenato, guarderanno un film.',
      exampleEn: 'After they have had dinner, they will watch a film.',
    },
    {
      term: 'entro',
      kind: 'term',
      english: 'by / within',
      exampleIt: 'Entro lunedì avremo consegnato il progetto.',
      exampleEn: 'By Monday we will have delivered the project.',
    },
    {
      term: 'per le otto',
      kind: 'term',
      english: 'by eight (o\'clock)',
      exampleIt: 'Per le otto saranno arrivati tutti gli ospiti.',
      exampleEn: 'By eight all the guests will have arrived.',
    },
    {
      term: 'prima di',
      kind: 'term',
      english: 'before',
      exampleIt: 'Prima di partire, avrò controllato la valigia.',
      exampleEn: 'Before leaving, I will have checked the suitcase.',
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
  trapassato_prossimo: TRAPASSATO_PROSSIMO,
  futuro_semplice: FUTURO_SEMPLICE,
  futuro_anteriore: FUTURO_ANTERIORE,
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
