# Design

_Curato dall'agente `coordinatore-design`. Versione per il primo prototipo._

## Principi
- **Mobile first, iPhone in Home**: una mano sola, azioni principali in basso, rispetto di `env(safe-area-inset-*)`.
- **Una cosa in evidenza per schermata**: Oggi mostra il prossimo pasto, il resto sta sotto.
- **Positivo e calmo**: verdi e toni naturali, nessun rosso aggressivo, nessuna colpevolizzazione (saltare un pasto è un'informazione, non un errore).
- **Il colore non è mai l'unico segnale**: ogni stato ha anche icona e testo. Contrasto WCAG AA (4.5:1 testo, 3:1 componenti).
- **Chiaro e scuro** automatici (`prefers-color-scheme`), stessi token.

## Palette (variabili CSS)
Ogni stato ha un colore del testo (`--colore-X`) e uno sfondo tenue (`--colore-X-sfondo`). Coppie verificate AA.

```css
:root {
  --colore-sfondo: #F6F8F4;        --colore-superficie: #FFFFFF;
  --colore-superficie-2: #EEF2EC;  --colore-bordo: #D5DDD3;
  --colore-testo: #1B2420;         --colore-testo-2: #55615A;
  --colore-primario: #1F7A4D;      --colore-su-primario: #FFFFFF;
  --colore-focus: #1D5FA8;         --colore-errore: #B3261E;

  --colore-fatto: #1F7A4D;      --colore-fatto-sfondo: #E1F3E8;
  --colore-sostituito: #1D5FA8; --colore-sostituito-sfondo: #E2EEFA;
  --colore-saltato: #A32B45;    --colore-saltato-sfondo: #FCE8EC;
  --colore-libero: #7A3E9D;     --colore-libero-sfondo: #F0E7F7;
  --colore-digiuno: #475569;    --colore-digiuno-sfondo: #E8ECF1;
  --colore-scelta: #A8480B;     --colore-scelta-sfondo: #FFEADB;

  --colore-amazon: #8A5A00;     --colore-amazon-sfondo: #FFF0CF;
  --colore-fresco: #0F766E;     --colore-fresco-sfondo: #DCF2EF;
  --colore-esterno: #4A4F9E;    --colore-esterno-sfondo: #E8E9F8;
}
@media (prefers-color-scheme: dark) {
  :root {
    --colore-sfondo: #0E1411;        --colore-superficie: #172019;
    --colore-superficie-2: #1F2A22;  --colore-bordo: #2F3C33;
    --colore-testo: #E8EFEA;         --colore-testo-2: #A5B3A9;
    --colore-primario: #5FD08F;      --colore-su-primario: #07170E;
    --colore-focus: #8EC1F5;         --colore-errore: #FFB4AB;

    --colore-fatto: #7BDDA2;      --colore-fatto-sfondo: #17382A;
    --colore-sostituito: #8EC1F5; --colore-sostituito-sfondo: #172F47;
    --colore-saltato: #FFA9BA;    --colore-saltato-sfondo: #44202B;
    --colore-libero: #D9B3F0;     --colore-libero-sfondo: #35223F;
    --colore-digiuno: #B8C4D4;    --colore-digiuno-sfondo: #263140;
    --colore-scelta: #FFB98A;     --colore-scelta-sfondo: #432915;

    --colore-amazon: #F5C96A;     --colore-amazon-sfondo: #3F2F0C;
    --colore-fresco: #6FDAD0;     --colore-fresco-sfondo: #12363A;
    --colore-esterno: #B3B7F2;    --colore-esterno-sfondo: #25274A;
  }
}
```
Il tema segue il sistema; in seguito si potrà aggiungere un'opzione manuale in Profilo.

## Tipografia, spaziature, forme
- Font: `-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif`. Numeri tabulari per grammature e peso (`font-variant-numeric: tabular-nums`).
- Scala (rem, base 16 px, rispetta Dynamic Type): `--testo-xs` 0.75 · `--testo-sm` 0.875 · `--testo-base` 1 · `--testo-lg` 1.125 · `--testo-xl` 1.375 (titolo pasto) · `--testo-2xl` 1.75 (titolo schermata). Pesi 400, 600, 700. Interlinea 1.4.
- Spazi (4 px): `--spazio-1` 4 · 2: 8 · 3: 12 · 4: 16 · 5: 24 · 6: 32. Margine laterale schermata 16 px.
- Raggi: `--raggio-s` 8 (chip, input) · `--raggio-m` 14 (card) · `--raggio-l` 22 (sheet) · pill 999.
- Ombre (solo chiaro; in scuro si usa il bordo): `--ombra-1: 0 1px 2px rgb(20 40 30 / 8%)` · `--ombra-2: 0 6px 20px rgb(20 40 30 / 12%)`.
- Area tappabile minima 44×44 px. Focus visibile: contorno 2 px `--colore-focus`.
- Animazioni brevi (150-200 ms), disattivate con `prefers-reduced-motion`.

## Componenti
- **Card pasto**: superficie, raggio m, nome del pasto (small caps), nome del piatto (`xl`), badge stato in alto a destra, ingredienti, azioni in fondo. Variante "in evidenza": bordo 2 px `--colore-primario`, ombra-2, sfondo superficie con leggera tinta.
- **Lista ingredienti**: riga = nome a sinistra, grammatura a destra (tabulare, es. `180 g`). Componente con alternative: riga con l'opzione scelta e link "cambia" (apre lo sheet). Intervalli come "100-130 g". Nessuna scelta fatta: riga con badge "scelta da fare".
- **Segmented control**: 2-4 opzioni brevi (es. ceci / lenticchie). Altezza 44, voce attiva su `--colore-primario`.
- **Bottom sheet**: per 5+ opzioni o testi lunghi (gruppi di colazioni). Maniglia, titolo, elenco di righe radio a tutta larghezza, pulsante "Conferma" fisso; si chiude con trascinamento o sfondo. Padding inferiore = safe area.
- **Badge stato** (pill, icona + testo): Fatto ✓, Sostituito ⇄, Saltato –, Libero ☺, Digiuno ○, Da scegliere !. Canali spesa: Amazon, Fresco, Esterno (stessa forma).
- **Pulsanti**: primario (pieno `--colore-primario`), secondario (contorno), testo; altezza 48, larghezza piena nelle azioni principali. Distruttivo (blocca utente) solo con conferma.
- **Barra di navigazione in basso**: 5 voci (icona + etichetta), altezza 56 + safe area, sfondo superficie con sfumatura/blur, voce attiva in `--colore-primario`. Barra superiore minimale con titolo grande che si riduce allo scorrimento.
- **Stati**: *vuoto* = illustrazione semplice, frase amichevole, un'azione ("Importa il tuo piano"); *caricamento* = scheletri grigi delle card (no spinner a tutto schermo); *errore* = messaggio chiaro in `--colore-errore` con icona e "Riprova", mai codici tecnici. *Offline*: banner discreto, dati in cache leggibili.
- **Toast**: conferma breve in basso sopra la barra, con "Annulla" per 5 s dopo fatto/saltato.

## Schermate del prototipo

### Login e attesa approvazione
- Scopo: entrare con Google. Contenuti: logo, una riga di descrizione, pulsante unico "Continua con Google" (secondo le linee guida Google), nota privacy breve.
- Stati: caricamento sul pulsante; errore (popup chiuso, rete) sotto il pulsante.
- **In attesa**: icona orologio, "Il tuo accesso è in attesa di approvazione", email usata, pulsante "Esci" e "Ricontrolla". Si aggiorna da solo. **Bloccato**: stessa schermata con testo neutro.

### Oggi
1. Intestazione: giorno e data ("Giovedì 23 ottobre"), progresso del giorno ("2 di 4 pasti").
2. **Prossimo pasto** in evidenza: il primo pasto del giorno non ancora segnato, nell'ordine del piano (gli orari li deciderà l'utente; per ora vale l'ordine). Piatto, ingredienti con grammature, preparazione comprimibile, varianti "In alternativa".
3. Azioni: **Fatto** (primaria), **Sostituito** (apre campo nota facoltativa), **Saltato**. Toast con Annulla. Segnato un pasto, quello dopo sale in evidenza.
4. **Altri pasti del giorno** in card compatte: già segnati col badge stato, quelli futuri in sola lettura; tap per espandere.
5. Promemoria del nutrizionista (note, es. "2 L d'acqua entro pranzo") in una striscia comprimibile; indicatori delle regole (es. "Colazioni diverse: 2 di 3").
- **Pasto di tipo scelta**: la card mostra le opzioni (gruppi, es. "Colazioni giorni di riposo") come elenco di piatti selezionabili; la scelta del giorno si fa prima di segnare. Se più gruppi, sezioni con titolo.
- **Componenti con alternative**: mostrano la scelta della settimana ("Ceci") con "cambia"; se manca, badge "Da scegliere" che apre lo sheet.
- **Libero**: card tinta `--colore-libero`, "Pasto libero: goditelo", solo azione "Fatto". **Digiuno**: tinta `--colore-digiuno`, "Pausa dal cibo", solo "Fatto"/"Saltato"; mai tono di rimprovero.
- Stati: vuoto (nessun piano: invito a importare o attendere l'admin), caricamento a scheletri, errore con Riprova, giornata completata ("Giornata completata", riepilogo).

### Settimana
1. Selettore settimana ISO (← S43 →), oggi evidenziato.
2. Sezione **Scelte della settimana** in alto: per ogni componente con alternative una riga "Legumi pranzo lun · Ceci" con segmented/sheet; contatore "2 da fare" in badge `scelta`. La scelta vale per la settimana ISO e alimenta la spesa.
3. Griglia compatta: 7 giorni in righe (giorno + una riga per pasto, nome del piatto troncato, pallino stato). Orizzontale non necessario su iPhone.
4. Tap su un pasto → dettaglio in sheet a tutta altezza (stessi contenuti della card).
- Stati: vuoto, caricamento, errore; settimana senza scelte → sezione nascosta.

### Importa piano
- Scopo: caricare il JSON (vedi `docs/IMPORT.md`). Passi: **1** scegli file (area tratteggiata + pulsante "Scegli file .json") · **2** anteprima · **3** conferma.
- Anteprima: titolo, data visita, n. pasti, n. piatti, n. alimenti per canale, **dubbi** (alimenti esterni senza link, quantità mancanti) in una lista con icona di avviso; errori di validazione in rosso, bloccanti, con riga/percorso.
- Admin: selettore "Utente destinatario" (elenco approvati; default se stesso). Conferma con riepilogo "Importo X piatti per [utente]"; avviso se sostituisce un piano esistente (resta nello storico).
- Stati: file non valido, caricamento, successo (vai a Oggi). Utenti non admin importano solo per sé.

### Admin (da Profilo)
- Tre schede segmentate: **In attesa**, **Approvati**, **Bloccati**, con contatori.
- Riga utente: avatar, nome, email, data richiesta; azioni "Approva" (primaria) / "Blocca" (con conferma); su approvati "Importa piano".
- L'admin non vede i dati di piano e peso degli altri. Stati: vuoto per scheda ("Nessuna richiesta in attesa"), errore.

### Navigazione
Barra in basso: **Oggi**, **Settimana**, **Spesa** (segnaposto: "In arrivo: lista Amazon e fresco"), **Peso** (segnaposto con anteprima del gioco), **Profilo** (nome, intolleranze, tema, piano attivo e storico, Importa piano, Admin se admin, Esci). I segnaposto hanno icona, frase e nessuna azione.

## Gioco del peso (idea da sviluppare)
Non è nel prototipo. Vincolo: l'utente inserisce **solo il peso**. Il gioco premia perdita e regolarità, senza punire.

Regole comuni (anti-incentivi malsani):
- Il progresso usa la **media mobile a 7 giorni**, non il singolo valore, per ignorare le oscillazioni.
- Il credito per la perdita è **limitato** a circa 0,5% del peso a settimana: perdere più in fretta non dà di più.
- Mai penalità: se salti le misure il gioco si **mette in pausa**, non si rovina. Niente serie da "non spezzare".
- Obiettivo di peso suggerito dal nutrizionista, mai calcolato dall'app. Se il peso sale o l'obiettivo è mantenere, premia la sola regolarità.
- Nessun confronto con altri utenti, nessun numero di calorie o "colpe".

**Concept A: Il Giardino.** Ogni misura nel ritmo scelto (es. ogni 3 giorni, con 1 giorno di tolleranza) fa spuntare una **foglia**. Ogni tappa verso l'obiettivo (es. ogni 0,5 kg di media) fa sbocciare un **fiore**. Le stagioni (4 settimane) chiudono un "quadro" da collezionare. Se salti, il giardino riposa: nulla appassisce. L'utente vede un giardino che cresce e il prossimo giorno consigliato.

**Concept B: Il Sentiero.** Un percorso a tappe verso una vetta/meta. Le misure regolari danno **energia** (passi) che fa avanzare l'avatar; la perdita sana sblocca **punti panoramici** (tappe di peso). Giorni "jolly" accumulati coprono le assenze. L'utente vede mappa, prossima tappa, energia della giornata.

**Consiglio: A (Giardino).** Più calmo, nessuna meccanica di perdita o di serie, facile da mostrare in una sola schermata, e separa bene regolarità (foglie) da risultato (fiori).
