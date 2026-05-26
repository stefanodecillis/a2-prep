/**
 * Writing prompts calibrated to the real Prefettura A2 test (D.M. 4 giugno 2010).
 *
 * The real exam's Scrittura section is **functional** — fill out a form, or
 * write a short message related to everyday Italian public-service contexts
 * (Comune, Anagrafe, ASL, INPS, Poste, condominio, locazione). Not lifestyle
 * emails like the CILS/PLIDA prompts. This file backs the Simulazione
 * Prefettura mode so the writing task actually looks like the real thing.
 *
 * Each prompt has a `kind`:
 *   - 'modulo'             → form with labeled fields (renders as multiple inputs)
 *   - 'lettera_formale'    → short formal letter in a single textarea
 *   - 'lettera_informale'  → short informal note in a single textarea
 *
 * Themes give us thematic spread so the simulation doesn't pick three ASL
 * prompts in a row across a session.
 */

import type { WritingPrompt } from './writingPrompts';

export const PREFETTURA_WRITING_PROMPTS: WritingPrompt[] = [
  // -------------------------------------------------------------------------
  // FORM-FILLING (modulo)
  // -------------------------------------------------------------------------
  {
    id: 'pref_modulo_anagrafico',
    title: 'Modulo Anagrafico — Cambio di residenza',
    examType: 'Prefettura A2',
    kind: 'modulo',
    theme: 'anagrafe',
    tagline: 'Compilazione di un modulo ufficiale del Comune',
    promptText:
      "Hai appena traslocato in una nuova casa a Bologna, in via Mazzini 12. Devi compilare il modulo di cambio di residenza all'Anagrafe del Comune. Inserisci le informazioni richieste in modo chiaro e completo.",
    guidelines: [
      "Scrivi nome e cognome così come compaiono sui documenti.",
      "Indica una data di nascita plausibile e il luogo di nascita.",
      "Specifica con precisione il nuovo indirizzo (via, numero civico, città, CAP).",
      "Spiega brevemente il motivo del cambio (es. nuovo lavoro, famiglia, studio).",
    ],
    targetWordCount: '~30 parole totali nei campi',
    suggestedHelperWords: ['Nome', 'Cognome', 'Data di nascita', 'Residenza', 'Comune', 'Motivo'],
    fields: [
      { id: 'nome', label: 'Nome', placeholder: 'Es. Maria', type: 'short' },
      { id: 'cognome', label: 'Cognome', placeholder: 'Es. Rossi', type: 'short' },
      { id: 'data_nascita', label: 'Data di nascita', placeholder: 'GG/MM/AAAA', type: 'short' },
      { id: 'luogo_nascita', label: 'Luogo di nascita', placeholder: 'Città, Provincia', type: 'short' },
      { id: 'nuovo_indirizzo', label: 'Nuovo indirizzo completo', placeholder: 'Via, numero civico, città, CAP', type: 'text' },
      { id: 'motivo', label: 'Motivo del cambio di residenza', placeholder: 'In una frase: perché ti sei trasferito', type: 'text' },
    ],
  },
  {
    id: 'pref_modulo_biblioteca',
    title: 'Modulo — Iscrizione alla biblioteca comunale',
    examType: 'Prefettura A2',
    kind: 'modulo',
    theme: 'scuola',
    tagline: 'Iscrizione a un servizio pubblico comunale',
    promptText:
      "Vuoi iscriverti gratuitamente alla biblioteca comunale del tuo quartiere. Compila il modulo di iscrizione con i tuoi dati e indica gli argomenti che ti interessano di più, così la bibliotecaria può consigliarti dei libri adatti al tuo livello.",
    guidelines: [
      'Indica nome, cognome e un recapito telefonico o e-mail valido.',
      "Indica l'indirizzo di residenza in città (richiesto per la tessera).",
      'Scegli almeno due argomenti che ti interessano in italiano semplice.',
      "Scrivi una breve frase sul perché vuoi usare la biblioteca.",
    ],
    targetWordCount: '~25 parole totali nei campi',
    suggestedHelperWords: ['Tessera', 'biblioteca', 'argomenti preferiti', 'leggere', 'imparare'],
    fields: [
      { id: 'nome_cognome', label: 'Nome e cognome', type: 'short' },
      { id: 'telefono', label: 'Telefono o e-mail di contatto', type: 'short' },
      { id: 'indirizzo', label: 'Indirizzo di residenza', type: 'text' },
      { id: 'argomenti', label: 'Argomenti che ti interessano', placeholder: 'Es. cucina, storia, viaggi', type: 'text' },
      { id: 'motivo', label: 'Perché vuoi usare la biblioteca', placeholder: 'Una frase breve in italiano semplice', type: 'text' },
    ],
  },

  // -------------------------------------------------------------------------
  // FORMAL LETTERS (lettera_formale)
  // -------------------------------------------------------------------------
  {
    id: 'pref_lettera_certificato_residenza',
    title: 'Richiesta certificato di residenza al Comune',
    examType: 'Prefettura A2',
    kind: 'lettera_formale',
    theme: 'anagrafe',
    tagline: 'Breve lettera formale al Comune',
    promptText:
      "Ti serve un certificato di residenza per presentarlo a una banca. Scrivi una breve e-mail formale all'ufficio Anagrafe del Comune per richiedere il certificato e chiedere quando puoi ritirarlo o se può essere inviato a casa. (Scrivi circa 40-60 parole).",
    guidelines: [
      'Inizia con un saluto formale (es. "Gentile Ufficio Anagrafe,").',
      "Spiega chi sei (nome, cognome, indirizzo) e cosa ti serve.",
      "Indica il motivo per cui ti serve il certificato (es. da presentare in banca).",
      "Chiedi cortesemente quando passare a ritirarlo o se può essere inviato.",
      "Termina con una formula di chiusura formale (es. \"Cordiali saluti,\").",
    ],
    targetWordCount: '40 - 60 parole',
    suggestedHelperWords: ['Gentile Ufficio', 'certificato di residenza', 'banca', 'ritirare', 'Cordiali saluti'],
  },
  {
    id: 'pref_lettera_prenotazione_asl',
    title: 'Prenotazione visita medica all\'ASL',
    examType: 'Prefettura A2',
    kind: 'lettera_formale',
    theme: 'asl',
    tagline: 'Breve e-mail formale al CUP / ASL',
    promptText:
      "Hai bisogno di prenotare una visita dal medico di base perché da una settimana hai mal di testa frequenti. Scrivi una breve e-mail formale al CUP dell'ASL della tua città per chiedere un appuntamento e indicare quando sei disponibile. (Scrivi circa 40-50 parole).",
    guidelines: [
      'Saluta in modo formale.',
      "Indica nome, cognome e il numero della tessera sanitaria (puoi inventarlo).",
      "Spiega brevemente perché ti serve la visita.",
      "Indica i giorni e le ore in cui sei libero per la visita.",
      "Chiudi con \"In attesa di un riscontro, cordiali saluti.\"",
    ],
    targetWordCount: '40 - 50 parole',
    suggestedHelperWords: ['Gentile CUP', 'prenotare', 'medico di base', 'tessera sanitaria', 'disponibile', 'mattina'],
  },
  {
    id: 'pref_lettera_inps_assegno',
    title: 'Richiesta informazioni all\'INPS',
    examType: 'Prefettura A2',
    kind: 'lettera_formale',
    theme: 'inps',
    tagline: 'Breve e-mail formale al patronato / INPS',
    promptText:
      "Hai un figlio piccolo e vuoi sapere se puoi chiedere l'assegno unico per la famiglia. Scrivi una breve e-mail formale al patronato del tuo quartiere per chiedere informazioni e un appuntamento per la pratica. (Scrivi circa 40-55 parole).",
    guidelines: [
      'Saluta in modo formale.',
      "Spiega chi sei in poche parole e qual è la tua situazione familiare.",
      "Chiedi quali documenti sono necessari per la pratica.",
      "Chiedi un appuntamento, indicando quando sei disponibile.",
      "Chiudi cortesemente.",
    ],
    targetWordCount: '40 - 55 parole',
    suggestedHelperWords: ['Gentile patronato', 'assegno unico', 'famiglia', 'documenti', 'appuntamento', 'cordiali saluti'],
  },
  {
    id: 'pref_lettera_locazione_bolletta',
    title: 'Comunicazione al gestore della luce',
    examType: 'Prefettura A2',
    kind: 'lettera_formale',
    theme: 'locazione',
    tagline: 'Breve e-mail formale al servizio clienti',
    promptText:
      "Hai ricevuto una bolletta della luce con un importo troppo alto rispetto al solito. Scrivi una breve e-mail formale al servizio clienti per chiedere un controllo del consumo e una spiegazione. (Scrivi circa 40-55 parole).",
    guidelines: [
      'Inizia con \"Gentile Servizio Clienti,\".',
      "Indica il tuo nome, cognome e il numero del cliente (puoi inventarlo).",
      "Spiega che la bolletta del mese ti sembra molto alta.",
      "Chiedi un controllo del contatore o una spiegazione del consumo.",
      "Chiudi cortesemente con i tuoi recapiti.",
    ],
    targetWordCount: '40 - 55 parole',
    suggestedHelperWords: ['Gentile Servizio Clienti', 'bolletta', 'consumo', 'contatore', 'controllo', 'recapiti'],
  },

  // -------------------------------------------------------------------------
  // INFORMAL MESSAGES (lettera_informale)
  // -------------------------------------------------------------------------
  {
    id: 'pref_nota_condominio',
    title: 'Biglietto al vicino di casa',
    examType: 'Prefettura A2',
    kind: 'lettera_informale',
    theme: 'condominio',
    tagline: 'Breve biglietto da lasciare alla porta del vicino',
    promptText:
      "Il tuo vicino di casa ha lasciato la sua bicicletta davanti alla tua porta da tre giorni. Scrivi un biglietto educato per chiedergli cortesemente di spostarla, e proponi anche di parlarne di persona. (Scrivi circa 30-45 parole).",
    guidelines: [
      'Saluta in modo cordiale ma non troppo formale (es. \"Ciao Luca,\" o \"Salve,\").',
      "Spiega gentilmente il problema della bicicletta.",
      "Chiedi se può spostarla nel posto giusto.",
      "Proponi di prendere un caffè insieme per conoscervi meglio.",
      "Firma con il tuo nome.",
    ],
    targetWordCount: '30 - 45 parole',
    suggestedHelperWords: ['Ciao vicino', 'bicicletta', 'spostare', 'cortesemente', 'caffè', 'scusa il disturbo'],
  },

  // -------------------------------------------------------------------------
  // PREFETTURA 5-EXAM BANK — additional writing prompts (forms + letters)
  // -------------------------------------------------------------------------
  {
    id: 'pref_modulo_questura_appuntamento',
    title: 'Modulo — Richiesta appuntamento in Questura',
    examType: 'Prefettura A2',
    kind: 'modulo',
    theme: 'questura',
    tagline: 'Compilazione di un modulo per un servizio pubblico',
    promptText:
      "Devi rinnovare il permesso di soggiorno e vuoi prenotare un appuntamento all'ufficio immigrazione della Questura. Compila il modulo di richiesta con i tuoi dati.",
    guidelines: [
      "Scrivi nome e cognome così come compaiono sui documenti.",
      "Indica una data di nascita e una nazionalità plausibili.",
      "Specifica il motivo della richiesta (rinnovo del permesso di soggiorno).",
      "Indica un recapito telefonico e un'email per la conferma.",
    ],
    targetWordCount: '~30 parole totali nei campi',
    suggestedHelperWords: ['Nome', 'Cognome', 'Nazionalità', 'Permesso di soggiorno', 'Rinnovo', 'Telefono'],
    fields: [
      { id: 'nome', label: 'Nome', placeholder: 'Es. Amir', type: 'short' },
      { id: 'cognome', label: 'Cognome', placeholder: 'Es. Hassan', type: 'short' },
      { id: 'data_nascita', label: 'Data di nascita', placeholder: 'GG/MM/AAAA', type: 'short' },
      { id: 'nazionalita', label: 'Nazionalità', placeholder: 'Es. egiziana', type: 'short' },
      { id: 'motivo', label: 'Motivo della richiesta', placeholder: 'In una frase', type: 'text' },
      { id: 'recapito', label: 'Telefono ed email', placeholder: 'Numero e indirizzo email', type: 'text' },
    ],
  },
  {
    id: 'pref_modulo_poste_recapito',
    title: 'Modulo — Ritiro di un pacco alle Poste',
    examType: 'Prefettura A2',
    kind: 'modulo',
    theme: 'poste',
    tagline: 'Compilazione di un modulo postale',
    promptText:
      "Hai ricevuto un avviso di giacenza: un pacco a tuo nome ti aspetta all'ufficio postale. Compila il modulo per il ritiro del pacco.",
    guidelines: [
      "Scrivi nome e cognome del destinatario.",
      "Indica il tuo indirizzo completo (via, numero, città, CAP).",
      "Inserisci il numero dell'avviso (puoi inventarne uno plausibile).",
      "Indica il tipo di documento d'identità che porti con te.",
    ],
    targetWordCount: '~25 parole totali nei campi',
    suggestedHelperWords: ['Destinatario', 'Indirizzo', 'Avviso', 'Documento', "Carta d'identità", 'Ritiro'],
    fields: [
      { id: 'nome_cognome', label: 'Nome e cognome del destinatario', placeholder: 'Es. Maria Rossi', type: 'short' },
      { id: 'indirizzo', label: 'Indirizzo completo', placeholder: 'Via, numero, città, CAP', type: 'text' },
      { id: 'numero_avviso', label: "Numero dell'avviso di giacenza", placeholder: 'Es. 12345678', type: 'short' },
      { id: 'documento', label: "Documento d'identità", placeholder: "Es. carta d'identità n. ...", type: 'short' },
    ],
  },
  {
    id: 'pref_modulo_scuola_mensa',
    title: 'Modulo — Iscrizione alla mensa scolastica',
    examType: 'Prefettura A2',
    kind: 'modulo',
    theme: 'scuola',
    tagline: 'Compilazione di un modulo per la scuola',
    promptText:
      "Vuoi iscrivere tuo figlio al servizio di mensa scolastica. Compila il modulo con i dati del bambino e le informazioni richieste.",
    guidelines: [
      "Scrivi nome e cognome del bambino.",
      "Indica la classe che frequenta.",
      "Segnala eventuali allergie o intolleranze alimentari.",
      "Indica nome e telefono di un genitore.",
    ],
    targetWordCount: '~25 parole totali nei campi',
    suggestedHelperWords: ['Nome del bambino', 'Classe', 'Allergie', 'Genitore', 'Telefono', 'Mensa'],
    fields: [
      { id: 'nome_bambino', label: 'Nome e cognome del bambino', placeholder: 'Es. Luca Bianchi', type: 'short' },
      { id: 'classe', label: 'Classe', placeholder: 'Es. 2ª B', type: 'short' },
      { id: 'allergie', label: 'Allergie o intolleranze', placeholder: 'Se non ce ne sono, scrivi "nessuna"', type: 'text' },
      { id: 'genitore', label: 'Nome e telefono del genitore', placeholder: 'Es. Anna Bianchi, 333...', type: 'text' },
    ],
  },
  {
    id: 'pref_lettera_asl_disdetta',
    title: 'Lettera formale — Disdetta di una visita medica',
    examType: 'Prefettura A2',
    kind: 'lettera_formale',
    theme: 'asl',
    tagline: 'Breve messaggio formale a un ufficio pubblico',
    promptText:
      "Hai un appuntamento per una visita all'ASL martedì prossimo, ma non puoi andarci perché devi lavorare. Scrivi una breve email all'ASL per disdire l'appuntamento e chiedere una nuova data. (Scrivi circa 40-50 parole).",
    guidelines: [
      "Inizia con un saluto formale (es. Gentile ufficio prenotazioni,).",
      "Spiega che non puoi venire all'appuntamento e perché.",
      "Chiedi cortesemente di spostare la visita a un altro giorno.",
      "Concludi con i saluti e il tuo nome.",
    ],
    targetWordCount: '40 - 50 parole',
    suggestedHelperWords: ['Gentile', 'appuntamento', 'purtroppo', 'spostare', 'disponibile', 'Cordiali saluti'],
  },
  {
    id: 'pref_lettera_condominio_reclamo',
    title: "Lettera formale — Segnalazione all'amministratore",
    examType: 'Prefettura A2',
    kind: 'lettera_formale',
    theme: 'condominio',
    tagline: "Breve messaggio formale all'amministratore di condominio",
    promptText:
      "Nel tuo palazzo l'ascensore è rotto da una settimana e tu abiti all'ultimo piano. Scrivi una breve email all'amministratore del condominio per segnalare il problema e chiedere una riparazione veloce. (Scrivi circa 40-50 parole).",
    guidelines: [
      "Inizia con un saluto formale (es. Gentile amministratore,).",
      "Spiega qual è il problema (l'ascensore è rotto da una settimana).",
      "Di' perché è un problema per te (abiti all'ultimo piano).",
      "Chiedi cortesemente una riparazione rapida e concludi con i saluti.",
    ],
    targetWordCount: '40 - 50 parole',
    suggestedHelperWords: ['Gentile amministratore', 'ascensore', 'rotto', 'ultimo piano', 'riparare', 'al più presto'],
  },
  {
    id: 'pref_lettera_utenza_disdetta',
    title: 'Lettera formale — Disdetta di un abbonamento',
    examType: 'Prefettura A2',
    kind: 'lettera_formale',
    theme: 'altro',
    tagline: "Breve messaggio formale a un'azienda",
    promptText:
      "Hai un abbonamento a una palestra, ma vuoi disdirlo perché ti trasferisci in un'altra città. Scrivi una breve email alla palestra per comunicare la disdetta e chiedere una conferma. (Scrivi circa 40-50 parole).",
    guidelines: [
      "Inizia con un saluto formale (es. Spettabile palestra,).",
      "Comunica che vuoi disdire l'abbonamento.",
      "Spiega brevemente il motivo (ti trasferisci in un'altra città).",
      "Chiedi una conferma scritta e concludi con i saluti.",
    ],
    targetWordCount: '40 - 50 parole',
    suggestedHelperWords: ['Spettabile', 'abbonamento', 'disdire', 'mi trasferisco', 'conferma', 'Distinti saluti'],
  },
  {
    id: 'pref_lettera_informale_scusa',
    title: 'Messaggio informale — Disdire un invito',
    examType: 'Prefettura A2',
    kind: 'lettera_informale',
    theme: 'altro',
    tagline: 'Breve messaggio informale a un amico',
    promptText:
      "Un amico ti ha invitato a cena sabato sera, ma non puoi andarci perché sei malato. Scrivi un breve messaggio al tuo amico per scusarti, spiegare il motivo e proporre di vedervi un altro giorno. (Scrivi circa 30-40 parole).",
    guidelines: [
      "Saluta l'amico in modo informale (es. Ciao Luca,).",
      "Spiega che non puoi venire e perché.",
      "Chiedi scusa e proponi un altro giorno per incontrarvi.",
      "Saluta in modo amichevole.",
    ],
    targetWordCount: '30 - 40 parole',
    suggestedHelperWords: ['Ciao', 'mi dispiace', 'non posso', 'sono malato', 'un altro giorno', 'a presto'],
  },
];
