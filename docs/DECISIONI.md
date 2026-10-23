# Registro delle decisioni

| Data | Decisione | Motivazione |
|---|---|---|
| 2026-10-23 | Backend Firebase, piano gratuito Spark, niente Cloud Functions | Stessa base degli altri progetti; zero spese |
| 2026-10-23 | Codice su GitHub `PZero/PianoAlimentare`, segreti solo in `.env` | Versionamento e backup; nessuna credenziale nel repository |
| 2026-10-23 | Repository GitHub pubblico | Scelta dell'utente; quindi mai dati personali reali nel repository |
| 2026-10-23 | PWA pubblicata con GitHub Pages (non Firebase Hosting); Firebase solo per Auth e Firestore | Scelta dell'utente; repo pubblico, Pages gratuito |
| 2026-10-23 | Multiutente con approvazione dell'admin; l'admin approva e crea piani per altri, ma non li legge | Privacy dei dati di salute |
| 2026-10-23 | Ruolo admin impostato a mano in Firestore, mai l'email nel codice | Repository pubblico |
| 2026-10-23 | Import: PDF → JSON con l'agente `importatore-piani` in Claude Code, poi caricato dall'app | Niente server/IA sul piano Spark; controllo umano dei dubbi |
| 2026-10-23 | Le scelte del piano (gruppi, ingredienti alternativi, varianti) mostrate come scelte; ingredienti scelti una volta a settimana | Richiesta dell'utente |
| 2026-10-23 | Spesa su due canali: ordine Amazon ogni 1-2 settimane (link carrello con ASIN), fresco ogni 2-3 giorni fuori Amazon; ingredienti di base esclusi; legumi già cotti | Richiesta dell'utente; Amazon e Cortilia non hanno API pubbliche per ordini |
| 2026-10-23 | Intolleranze nel profilo, considerate nella scelta dei prodotti | Richiesta dell'utente |
| 2026-10-23 | Progetto Firebase `piano-alimentare-pz` (l'id `piano-alimentare` era occupato) | Id univoco globale |
| 2026-10-23 | Blocchi di una casella = portate dello stesso pasto (campo `portata` nei componenti) | Risposta dell'utente sul PDF |
| 2026-10-23 | Piano modificabile dall'utente dopo l'import | Il PDF può essere convertito in modo impreciso |
| 2026-10-23 | Ruolo nutrizionista (fase 2) che vede i pazienti collegati con il loro consenso | Richiesta dell'utente; privacy dei dati di salute |
| 2026-10-23 | Gioco del peso: concept "Il Giardino" proposto (da confermare) | Premia costanza delle misure e perdita sostenibile, senza punizioni |
| 2026-10-23 | Collegamento paziente-nutrizionista con codice del nutrizionista; il paziente sceglie quali dati condividere | Richiesta dell'utente; consenso granulare |
| 2026-10-23 | Redesign in stile "Editoriale": carta calda/notte, Fraunces, illustrazioni a tratto | Aspetto caldo e leggibile per l uso quotidiano; design in docs/DESIGN.md |
| 2026-10-23 | Font Fraunces self-hosted (`@fontsource-variable`), senza Google Fonts a runtime | PWA offline e nessuna richiesta a terzi |
| 2026-10-23 | Modalità demo solo in sviluppo (`?demo`) con dati inventati, esclusa dalla build | Vedere le schermate senza account e senza dati reali |
| 2026-10-23 | Schermata unica "Controlla il piano" per import e modifica, giorno per giorno | Correggere il piano prima di salvarlo, senza il vecchio editor a modulo |
