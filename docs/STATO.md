# Stato del progetto

**Ultimo aggiornamento:** 2026-10-23 — Redesign editoriale, modalità demo e app online.

## Fatto
- Requisiti (`docs/REQUISITI.md`), design system (`docs/DESIGN.md`, stile editoriale), modello dati (`docs/MODELLO-DATI.md`), importazione (`docs/IMPORT.md`).
- Firebase configurato: progetto `piano-alimentare-pz`, Firestore, login Google.
- Regole Firestore pubblicate, con 23 test sull'emulatore (`npm run test:rules` in `firebase/`).
- Admin configurato.
- App online su GitHub Pages: https://pzero.github.io/PianoAlimentare/ (deploy con `.github/workflows/pages.yml`).
- PWA in `app/`: Oggi, Settimana a capitoli, Importa piano in tre passi, Controlla il piano, Modifica piano, Admin, Profilo, redesign editoriale con 22 illustrazioni. Segnaposto illustrati per Spesa e Peso.
- Modalità demo solo in sviluppo (`?demo`), esclusa dalla build.
- Test: 55 sull'app (`npm test` in `app/`), 23 sulle regole.

## Prossimi passi
1. Provare l'import del piano reale dall'app (schermata Importa piano, con il JSON ricavato dal PDF in `dati/`).
2. Spesa: ordine Amazon con link al carrello (ASIN) e lista del fresco.
3. Peso con il gioco "Il Giardino" (concept da confermare).
4. Ruolo nutrizionista con codice e condivisione scelta dal paziente (fase 2).

## Problemi aperti
- "Sostituito" segna solo lo stato: una nota libera ("ho mangiato X") richiede un campo nuovo nel diario (regole + modello dati).
- Oggi: il pre-allenamento facoltativo compare come primo "prossimo pasto" da scegliere; valutare di saltarlo se non scelto.
- Bundle principale di circa 930 kB (precache del service worker circa 1 MB): valutare code splitting delle schermate.
- Le varianti dei piatti non sono modificabili nel controllo del piano.
- `firebase/package.json` usa `firebase` ^12, l'app usa ^13: allineare le due versioni.
- I test delle regole non girano in CI, solo in locale.
- Su Windows git segnala la conversione CRLF/LF dei file: valutare un `.gitattributes`.

## Decisioni in attesa dell'utente
- Gioco del peso "Il Giardino": ritmo di misura premiato (ogni 3 giorni?) e chi fissa l'obiettivo di peso.
- Interruttore manuale chiaro/scuro in Profilo o solo automatico.
- Nota libera su "Sostituito": sì/no.
