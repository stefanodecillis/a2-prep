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
];
