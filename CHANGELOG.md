# Changelog

## 2026-10-23 (redesign)
- **design:** design system riscritto in stile "Editoriale": carta calda e carta notte (tema scuro automatico), palette, tipografia e componenti in `docs/DESIGN.md`.
- **frontend:** illustrazioni SVG a tratto (22) in `app/src/illustrazioni/`, scelte in base alle parole chiave degli ingredienti; con test.
- **frontend:** font Fraunces self-hosted (`@fontsource-variable/fraunces`), sottoinsieme latino.
- **frontend:** tutte le schermate rifatte: Accesso, Attesa, Oggi, Settimana a capitoli, Profilo, Admin, Importa piano in tre passi, segnaposto illustrati per Spesa e Peso.
- **frontend:** nuova schermata **Controlla il piano** per import e modifica: menu giorno per giorno, riepilogo "Da verificare", foglio di modifica ingrediente, modifica in linea, barra "Conferma piano". Rimossi `CardPasto` ed `EditorPiano`.
- **frontend:** modalità demo solo in sviluppo (`?demo`, `?demo=import`, `?demo=login`, `?demo=attesa`, `?demo=illustrazioni`) con piano d'esempio inventato; esclusa dalla build di produzione.
- **frontend:** logica di modifica del piano in `app/src/domain/modificaPiano.ts`, con test.
- **docs:** README aggiornato (interfaccia, modalità demo, test, stato e roadmap), stato del progetto e registro delle decisioni.
- Test: 55 test sull'app (6 file), 23 test sulle regole. Build di produzione verificata.

## 2026-10-23 (prototipo)
- **docs:** requisiti, design system, modello dati, procedura di importazione dei piani, decisioni, README completo.
- **backend:** progetto Firebase `piano-alimentare-pz` (Authentication con Google, Firestore); regole Firestore con 23 test sull'emulatore.
- **frontend:** PWA in `app/` (Vite, React, TypeScript, vite-plugin-pwa): Oggi, Settimana con scelte, Importa piano con controllo e correzione, Modifica piano, Admin, Profilo; 35 test Vitest.
- **repo:** pubblicazione su GitHub Pages con GitHub Actions; script di estrazione dai PDF e validatore del piano; agenti e comandi di Claude Code; `.env.example`.

## 2026-10-23 (impostazione)
- Impostazione del progetto: struttura, documenti, agenti, comandi `/stato` e `/fine-sessione`.
