export interface WritingPrompt {
  id: string;
  title: string;
  examType: 'CILS A2' | 'PLIDA A2';
  tagline: string;
  promptText: string;
  guidelines: string[];
  targetWordCount: string;
  suggestedHelperWords: string[];
}

export const A2_WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: "wp_1",
    title: "Soggiorno in Agriturismo (Prova 1)",
    examType: "CILS A2",
    tagline: "Scrittura di un'e-mail informale descrittiva",
    promptText: "Sei stato in un bellissimo agriturismo in Toscana la scorsa settimana per tre giorni. Scrivi un'e-mail a un amico italiano descrivendo l'albergo, la camera e parlando di cosa hai fatto la sera. (Scrivi circa 40-50 parole).",
    guidelines: [
      "Saluta l'amico in modo informale (es. Ciao Marco, / Caro Luca,).",
      "Spiega dove ti trovavi e descrivi la struttura o la camera.",
      "Racconta che cibo hai mangiato o che attività hai svolto la sera.",
      "Concludi augurando di vedersi presto."
    ],
    targetWordCount: "40 - 50 parole",
    suggestedHelperWords: ["agriturismo", "bellissimo", "silenzioso", "pastasciutta", "passeggiata", "ieri sera"]
  },
  {
    id: "wp_2",
    title: "Candidatura Cameriero part-time (Prova 2)",
    examType: "CILS A2",
    tagline: "Scrittura di un'e-mail formale di lavoro",
    promptText: "Vuoi lavorare come cameriere part-time con orario pomeridiano/serale in una trattoria tipica a Roma. Scrivi una breve e-mail di candidatura al proprietario della trattoria (Signor Rossi) per presentarti, specificare quali sono i tuoi giorni di disponibilità e la tua esperienza. (Scrivi circa 45-60 parole).",
    guidelines: [
      "Inizia con una formula di saluto formale (es. Gentile Signor Rossi, / Egregio Direttore,).",
      "Spiega perché stai scrivendo (candidatura per l'annuncio di cameriere).",
      "Descrivi brevemente chi sei, la tua età e se hai già lavorato come cameriere.",
      "Termina dicendo quando sei libero (es. il fine settimana, il pomeriggio) e salutando cordialmente."
    ],
    targetWordCount: "45 - 60 parole",
    suggestedHelperWords: ["Gentile Signor Rossi", "esperienza", "cameriere", "disponibile", "pomeriggio", "cordiali saluti"]
  },
  {
    id: "wp_3",
    title: "Oggetto smarrito in Auto a Noleggio",
    examType: "PLIDA A2",
    tagline: "Scrittura di un'e-mail formale di richiesta assistenza",
    promptText: "Hai noleggiato una macchina con l'agenzia 'Auto Semplice' per fare una gita al lago. Purtroppo hai dimenticato le tue chiavi di casa nella tasca posteriore del sedile passeggero. Scrivi un'e-mail all'ufficio assistenza chiedendo aiuto e informazioni su come recuperarle. (Scrivi circa 40-50 parole).",
    guidelines: [
      "Fornisci il numero di noleggio o il giorno in cui hai guidato (es. ieri, sabato scorso).",
      "Spiega chiaramente dove si trovano le chiavi di casa.",
      "Chiedi cortesemente se un impiegato può controllare e inviarti un riscontro.",
      "Inserisci i tuoi contatti telefonici."
    ],
    targetWordCount: "40 - 50 parole",
    suggestedHelperWords: ["assistenza", "ho noleggiato", "chiavi di casa", "sedile passeggero", "ieri pomeriggio", "riscontro"]
  },
  {
    id: "wp_4",
    title: "Un nuovo acquisto di moda",
    examType: "PLIDA A2",
    tagline: "Messaggio informale a un amico",
    promptText: "Hai comprato un cappotto e un paio di scarpe eleganti in un negozio del centro o su internet. Scrivi un messaggio WhatsApp a un amico italiano parlando del colore delle cose comprate, del prezzo conveniente e proponendo di uscire insieme sabato per indossarli. (Scrivi circa 30-40 parole).",
    guidelines: [
      "Esprimi soddisfazione per il nuovo acquisto.",
      "Menziona il colore e se il prezzo era scontato (in offerta).",
      "Invita l'amico a bere qualcosa o a fare un giro sabato.",
      "Chiedi se anche lui vuole comprare qualcosa."
    ],
    targetWordCount: "30 - 40 parole",
    suggestedHelperWords: ["cappotto", "scarpe nuove", "costoso/conveniente", "sabato sera", "andiamo a bere", "indossare"]
  }
];
