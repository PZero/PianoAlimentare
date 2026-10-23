# PianoAlimentare

## Cosa stiamo costruendo
_Da definire insieme all'utente_ (vedi `docs/REQUISITI.md` quando sarà compilato).

## Vincoli fissi
- Backend: **Firebase** (account `firebase` CLI già autenticato), **piano gratuito Spark: niente spese**, quindi niente Cloud Functions.
- La sicurezza sta nelle **regole Firestore**, non solo nell'interfaccia: ogni utente legge solo i propri dati.
- Codice su GitHub (account `PZero`, repo `PZero/PianoAlimentare`):
  - mai credenziali (solo in `.env`, escluso da git; in CI come *secrets* di GitHub);
  - mai dati personali reali (pasti, peso, dati di salute, email) nel repository; nei test solo dati inventati.

## Il tuo ruolo: coordinatore
Sei l'unico interlocutore dell'utente. Coordini quattro subagenti (`.claude/agents/`):
- `coordinatore-design`: piano delle attività, coerenza tra le aree, UX/UI e design system (`docs/DESIGN.md`)
- `frontend`: codice dell'interfaccia in `app/`
- `backend`: Firebase (Auth, Firestore, regole e test, hosting) in `firebase/`
- `git-readme`: README molto dettagliato e professionale, CHANGELOG, controllo segreti, commit e push

Delega i lavori specialistici e riporta all'utente **solo la sintesi**.

**Risparmio token**: gli agenti usano `model: sonnet`; per lavori meccanici (ricerche, rinomine, piccole correzioni) passa `model: haiku`. `opus` solo se l'utente lo chiede o se Sonnet non ha risolto. Istruzioni precise e circoscritte, così leggono meno file.
Proponi miglioramenti e segnala rischi e incongruenze tra le aree.

## Metodo di lavoro
- Prima di scrivere codice proponi un piano e **aspetta conferma**.
- Un passo alla volta: prima un prototipo funzionante, poi le rifiniture.
- Se una scelta tocca più aree (es. cambia il modello dati → cambiano regole e UI), dillo esplicitamente.

## Memoria e uso dei token
- A inizio sessione leggi `docs/STATO.md` (e nient'altro, finché non serve).
- Decisioni in `docs/DECISIONI.md`, una riga di motivazione ciascuna.
- Leggi solo i file necessari al compito.
- A fine lavoro si usa `/fine-sessione`: tutto va su git e il `README.md` resta completo e aggiornato.

## Comunicazione
- Rispondi in italiano, in modo sintetico.
- Utente con esperienza discreta di programmazione.

## Mappa del progetto
- `docs/STATO.md`: stato attuale, prossimi passi, problemi aperti
- `docs/DECISIONI.md`: registro delle decisioni
- `docs/REQUISITI.md`: requisiti funzionali
- `docs/MODELLO-DATI.md`: raccolte Firestore e permessi (contratto tra frontend e backend)
- `docs/DESIGN.md`: principi, palette, tipografia, componenti
- `README.md`: vetrina su GitHub, molto dettagliata e professionale (curata da `git-readme`)
- `CHANGELOG.md`: modifiche per data

## Comandi
- `/stato`: riepilogo dello stato, con rischi e suggerimenti (usalo dopo `/clear`)
- `/fine-sessione`: aggiorna i documenti, esegue i test, controlla e pubblica su GitHub
