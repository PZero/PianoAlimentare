# Stato del progetto

**Ultimo aggiornamento:** 2026-10-23 — Prototipo dell'app e regole Firestore.

## Fatto
- Requisiti (`docs/REQUISITI.md`), design system (`docs/DESIGN.md`), modello dati (`docs/MODELLO-DATI.md`), formato e procedura di importazione (`docs/IMPORT.md`).
- Progetto Firebase `piano-alimentare-pz`: Authentication con Google, Firestore (piano Spark).
- Regole Firestore in `firebase/firestore.rules`, con 23 test sull'emulatore (`npm run test:rules` in `firebase/`).
- PWA in `app/` (Vite, React, TypeScript): Oggi, Settimana con scelte settimanali, Importa piano con controllo e correzione, Modifica piano, Admin, Profilo. Spesa e Peso in arrivo. 35 test Vitest.
- Pubblicazione su GitHub Pages con `.github/workflows/pages.yml`: https://pzero.github.io/PianoAlimentare/

## Prossimi passi
1. Pubblicare le regole Firestore (`npm run deploy:regole` in `firebase/`) dopo aver verificato le regole attualmente attive.
2. Spesa: ordine Amazon con link al carrello (ASIN) e lista del fresco.
3. Peso con il gioco "Il Giardino" (concept da confermare).
4. Ruolo nutrizionista con codice e condivisione scelta dal paziente (fase 2).

## Problemi aperti
- Le regole Firestore non sono ancora pubblicate: verificare che le regole attive non siano troppo permissive.
- Verificare che il dominio `pzero.github.io` sia tra i domini autorizzati di Firebase Authentication, altrimenti il login non funziona dal sito online.
- `firebase/package.json` usa `firebase` ^12, l'app usa ^13: allineare le due versioni.
- I test delle regole non girano in CI, solo in locale.
- Su Windows git segnala la conversione CRLF/LF dei file: valutare un `.gitattributes`.
