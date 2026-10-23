# Modello dati (bozza)

Firestore. Ogni utente legge e scrive **solo** sotto `utenti/{uid}`. Nessuna email dell'admin nel codice: il ruolo si imposta a mano dalla console Firebase.

| Percorso | Contenuto | Chi legge / scrive |
|---|---|---|
| `utenti/{uid}` | nome, email, `stato` (`in_attesa` / `approvato` / `bloccato`), `ruolo` (`utente` / `admin`), `intolleranze[]`, obiettivo peso | utente: legge, modifica solo nome/intolleranze/obiettivo; admin: legge nome/email/stato, modifica `stato` |
| `utenti/{uid}/piani/{pianoId}` | piano importato (formato `docs/IMPORT.md`) + `attivo`, `importatoIl` | utente: legge e scrive; admin: **solo crea** (non legge) |
| `utenti/{uid}/settimane/{aaaa-Www}` | scelte della settimana: alternativa per componente, piatto scelto per i pasti `scelta` | utente |
| `utenti/{uid}/prodotti/{alimentoId}` | prodotto Amazon (ASIN, nome, confezione: quantità + unità), canale, link esterno, tag (es. `senza-glutine`) | utente |
| `utenti/{uid}/diario/{aaaa-mm-gg}` | stato di ogni pasto: `fatto` / `sostituito` / `saltato` | utente |
| `utenti/{uid}/peso/{aaaa-mm-gg}` | kg | utente |
| `utenti/{uid}/spese/{id}` | ordine Amazon o lista fresco: periodo coperto, righe, spuntate | utente |

Gamification (serie, badge) calcolata nel client da `diario` e `peso`.

Note aperte: l'admin non vede i piani degli altri; se un utente perde il piano, va reimportato dal file in `dati/`.

## Vincoli imposti dalle regole (`firebase/firestore.rules`)
- `utenti/{uid}` creazione: solo campi `nome`, `email`, `stato`, `ruolo`, `creatoIl`, `intolleranze`; `stato='in_attesa'`, `ruolo='utente'`. L'utente aggiorna solo `nome`, `intolleranze`, `obiettivoPeso`; l'admin solo `stato` (degli altri). Nessuna cancellazione.
- Admin = documento con `ruolo='admin'` **e** `stato='approvato'`. Le sottoraccolte sono accessibili solo al proprietario con `stato='approvato'` (in attesa o bloccato: tutto negato).
- `piani`: `versione == 1` e `titolo` stringa (altri campi liberi).
- `diario/{aaaa-mm-gg}`: documento `{ <pastoId>: 'fatto' | 'sostituito' | 'saltato' }`, nessun altro tipo di campo.
- `peso/{aaaa-mm-gg}`: solo `{ kg: numero 20..400 }`.
- Altre raccolte e percorsi non elencati: negati.

## Fase 2: nutrizionista (proposta, non ancora nelle regole)
- `utenti/{uid}.ruolo` può valere `nutrizionista` (approvato dall'admin).
- Al primo accesso approvato il nutrizionista riceve un **codice** casuale (es. 8 caratteri, non indovinabile): documento `codiciNutrizionista/{codice}` → `{ nutrizionistaId, nome }`. Leggibile con `get` da utenti approvati, mai elencabile.
- Il paziente inserisce il codice in Profilo → nel proprio documento: `nutrizionistaId` e `condivisione: { piano, peso, diario, report }` (booleani scelti dal paziente, modificabili e revocabili in ogni momento).
- Il nutrizionista legge solo le sottoraccolte dei pazienti con `nutrizionistaId == suo uid` **e** il relativo flag di `condivisione` a `true`. Elenco pazienti: query su `utenti` con `nutrizionistaId == suo uid` (vede nome e flag).
- Report calcolati nel client del nutrizionista (aderenza, andamento peso).
