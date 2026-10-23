# Design

_Curato dall'agente `coordinatore-design`. Direzione approvata: **B · Editoriale** (rivista di cucina). Sostituisce la versione "a moduli" del primo prototipo._

## 1. Principi editoriali
- **Gerarchia tipografica prima di tutto**: la struttura nasce da occhiello (maiuscolo spaziato) > titolo serif > sottotitolo > testo. Niente card annidate, niente bordi pesanti: si separa con aria e filetti da 1 px.
- **Aria**: margini laterali 20 px, almeno 32 px tra sezioni, righe ariose. Meno elementi per schermata; il resto sta dietro un tocco.
- **Le illustrazioni sono protagoniste**: ogni piatto, stato vuoto e stato di attesa ha un disegno a tratto; sostituiscono icone-badge e riempitivi.
- **Colore con parsimonia**: carta e inchiostro per l'80%, terracotta come unico accento d'azione e di "cibo", salvia per "fatto/ok". I colori semantici compaiono solo come piccolo segno (puntino, filetto, parola), mai come grandi campi.
- **Mobile first, iPhone in Home**: una mano sola, azioni in basso, `env(safe-area-inset-*)`.
- **Calmo e non colpevolizzante**: saltare un pasto è un'informazione. Nessun rosso aggressivo.
- **Il colore non è mai l'unico segnale**: ogni stato ha anche parola o forma. Contrasto WCAG AA (4.5:1 testo, 3:1 elementi grafici e componenti).
- **Chiaro e scuro** automatici (`prefers-color-scheme`), stessi token. Area tappabile minima 44x44.

## 2. Palette (variabili CSS)
Nota AA: `#888780` e `#D85A30` su carta NON raggiungono 4.5:1 come testo piccolo: servono solo per tratti, filetti e testi grandi (>= 20 px). Per il testo piccolo si usano `--c-testo-2` e `--c-terracotta-testo`. Verificare le coppie con un contrast checker prima del rilascio.

```css
:root {
  --c-carta: #FBF8F3;        --c-carta-2: #F3EEE5;     /* sfondo; fasce/sheet */
  --c-testo: #2C2C2A;        --c-testo-2: #6B6A64;     /* testo piccolo secondario */
  --c-tenue: #888780;        --c-filetto: #D3D1C7;     /* solo grafica e testi grandi */
  --c-terracotta: #D85A30;   --c-terracotta-testo: #B2441F;  /* tratti / testo piccolo */
  --c-salvia: #639922;       --c-salvia-testo: #4B7A1A;
  --c-inchiostro: #2C2C2A;   --c-su-inchiostro: #FBF8F3;     /* pulsante pieno */
  --c-focus: #3F6A95;        --c-errore: #A5504F;

  /* semantici: testo/segno + sfondo tenue (usato di rado) */
  --c-fatto: #4B7A1A;       --c-fatto-bg: #EAF0DE;
  --c-sostituito: #4F6D8A;  --c-sostituito-bg: #E6ECF1;
  --c-saltato: #A5504F;     --c-saltato-bg: #F5E6E3;
  --c-libero: #7C5A86;      --c-libero-bg: #EFE7F0;
  --c-digiuno: #5E6670;     --c-digiuno-bg: #EAEAE7;
  --c-scelta: #B2441F;      --c-scelta-bg: #F8E7DE;
  /* canali spesa */
  --c-amazon: #8A6314;      --c-amazon-bg: #F5EBD0;
  --c-fresco: #3E7A6E;      --c-fresco-bg: #E0EDE9;
  --c-esterno: #5C6091;     --c-esterno-bg: #E7E8F1;
}
@media (prefers-color-scheme: dark) {
  :root {                      /* "carta notte" */
    --c-carta: #1C1B19;        --c-carta-2: #262522;
    --c-testo: #F1EBDD;        --c-testo-2: #B3AFA3;
    --c-tenue: #8C887D;        --c-filetto: #3A3833;
    --c-terracotta: #E8754D;   --c-terracotta-testo: #F09A78;
    --c-salvia: #8DB65A;       --c-salvia-testo: #A6CB74;
    --c-inchiostro: #F1EBDD;   --c-su-inchiostro: #1C1B19;
    --c-focus: #9CC0E4;        --c-errore: #E59A96;

    --c-fatto: #A6CB74;       --c-fatto-bg: #2A3320;
    --c-sostituito: #9DB7D1;  --c-sostituito-bg: #232C36;
    --c-saltato: #E59A96;     --c-saltato-bg: #3A2523;
    --c-libero: #C9A9D3;      --c-libero-bg: #33283A;
    --c-digiuno: #A9B1BB;     --c-digiuno-bg: #2B2D30;
    --c-scelta: #F09A78;      --c-scelta-bg: #3B2619;
    --c-amazon: #E0B965;      --c-amazon-bg: #382D14;
    --c-fresco: #86C4B6;      --c-fresco-bg: #1F3330;
    --c-esterno: #AEB2E0;     --c-esterno-bg: #2A2C42;
  }
}
```
Il tema segue il sistema; opzione manuale in Profilo in seguito. In scuro niente ombre: si usano filetti.

## 3. Tipografia, spaziature, forme
- **Serif (titoli e nomi dei piatti)**: **Fraunces** (Google Fonts, variabile, `opsz` automatico; carattere caldo da rivista), caricata con `display=swap`, sottoinsieme latino e peso 400/600; **self-host** in `app/` per la PWA offline. Fallback: `Georgia, "Times New Roman", serif`.
- **Sans (testo, etichette, numeri)**: `-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif`. Numeri con `font-variant-numeric: tabular-nums` (grammature, peso, date).
- Scala (rem, base 16 px, rispetta Dynamic Type):

| Ruolo | Famiglia | Dim. | Peso | Note |
|---|---|---|---|---|
| Occhiello | sans | 0.6875 (11 px) | 600 | MAIUSCOLO, `letter-spacing: .14em`, `--c-testo-2` |
| Titolo pagina | serif | 2.25 (36 px) | 400 | interlinea 1.1, `letter-spacing: -.01em` |
| Titolo sezione/giorno | serif | 1.5 (24 px) | 400 | |
| Nome piatto | serif | 1.375 (22 px) | 600 | interlinea 1.2 |
| Testo | sans | 1 (16 px) | 400 | interlinea 1.45 |
| Ingrediente / quantità | sans | 0.9375 (15 px) | 400 / 500 | quantità tabulare |
| Etichette, pulsanti | sans | 0.875 (14 px) | 600 | |
| Nota | sans | 0.8125 (13 px) | 400 | `--c-testo-2` |

- Spazi (4 px): 4 · 8 · 12 · 16 · 20 · 32 · 48. Margine laterale 20 px; larghezza massima testo 34 rem su schermi larghi.
- Forme: angoli quasi assenti; pulsanti a **pillola** (999), sheet con raggio 22 in alto, immagini senza cornice. Filetti 1 px `--c-filetto`.
- Animazioni 150-200 ms, dissolvenze e scorrimenti; disattivate con `prefers-reduced-motion`. Focus: contorno 2 px `--c-focus`.

## 4. Sistema di illustrazioni
**Stile**: line art SVG **inline**, `viewBox="0 0 96 96"`, `fill="none"`, tratto **1.5 px** (1.25 per dettagli) con `stroke-linecap/linejoin: round`, `vector-effect: non-scaling-stroke`. Struttura (piatto, ciotola, contorni) in `currentColor` (inchiostro); **un solo colore d'accento** per il "cibo": terracotta e/o salvia, a tratti brevi o riempimenti non pieni (opacità .15 al massimo). Forme semplici, leggermente imperfette ma simmetriche; niente ombre o gradienti. Si ridimensionano via CSS (`--illu-s` 48, `--illu-m` 96, `--illu-l` 176). `aria-hidden="true"` se decorative.

Componenti (cartella `app/src/illustrazioni/`, un componente ciascuno + indice):
`Piatto` (cerchi concentrici, generico) · `Ciotola` · `Insalata` · `Legumi` · `Pesce` · `Carne` (pollo/manzo) · `Uova` · `Formaggio` · `Pane` · `Cereali` (riso/pasta/avena) · `Frutta` · `Verdura` · `Frullato` (bicchiere/smoothie) · `Yogurt` · `Tazza` (colazione) · `Libero` (forchetta e coltello incrociati) · `Digiuno` (piatto vuoto con luna) · `Carrello` · `Bilancia` · `Germoglio` (foglia). Extra per gli stati: `Orologio` (attesa), `Cuoco/Cloche` (login).

**Scelta dell'illustrazione di un piatto** (funzione `illustrazionePiatto(piatto)`, deterministica):
1. Tipo `libero` -> `Libero`; `digiuno` -> `Digiuno`.
2. Prende gli alimenti **principali** = quelli con quantità maggiore in grammi fra proteine/cereali/legumi; se pari, il primo dell'elenco.
3. Cerca parole chiave nel nome dell'alimento e nei tag, in quest'ordine di priorità: pesce/tonno/salmone/merluzzo -> `Pesce`; pollo/tacchino/manzo/vitello/maiale/prosciutto/bresaola -> `Carne`; uova/albume -> `Uova`; ceci/lenticchie/fagioli/piselli/legumi -> `Legumi`; formaggio/ricotta/mozzarella/parmigiano/feta -> `Formaggio`; riso/pasta/orzo/farro/avena/cereali/quinoa -> `Cereali`; pane/fette/gallette/crackers -> `Pane`; yogurt/skyr/kefir -> `Yogurt`; frullato/shake/latte -> `Frullato`; frutta e nomi di frutti -> `Frutta`; insalata/rucola/lattuga -> `Insalata`; verdura/zucchine/spinaci ecc. -> `Verdura`.
4. Tipo pasto `colazione` senza altro riscontro -> `Tazza`; pasto con più di 4 alimenti e contenuto liquido (zuppa/minestra) -> `Ciotola`.
5. Nessun riscontro -> `Piatto`. La tabella parole chiave sta in un solo file dati, modificabile.
Colore d'accento per default: terracotta per proteine/cereali/pane, salvia per verdure/frutta/legumi.

## 5. Componenti
- **Testata di pagina**: occhiello (es. `GIOVEDI' 23`) sopra il titolo serif 36 px, sottotitolo facoltativo in sans; 48 px sopra e 20 sotto. Nessuna barra superiore: la testata scorre via; titolo ridotto sticky solo nelle liste lunghe.
- **Card piatto editoriale** (non è una card: niente sfondo o bordo): occhiello del pasto, illustrazione `--illu-m` centrata, nome del piatto serif, sottotitolo (n. alimenti, canale principale), filetto, ingredienti, preparazione comprimibile ("Come si prepara", testo in sans), pillole azione. Pasti successivi in versione compatta: illustrazione 48 a sinistra, occhiello + nome, puntino di stato, separati da filetti.
- **Lista ingredienti a filetti**: riga alta 48, nome a sinistra, quantità a destra (tabulare, `--c-testo-2`), filetto 1 px sotto. Con alternative: la scelta corrente e sotto/accanto **"· cambia"** in `--c-terracotta-testo`. Scelta mancante: "· da scegliere" in terracotta (parola, non badge).
- **Pillole azione**: altezza 48, raggio 999. **Fatto** = pieno `--c-inchiostro` con testo `--c-su-inchiostro`; **Sostituito** = contorno 1.5 px inchiostro; **Saltato** = solo testo sottolineato, più discreto. Stato attivo: segno (spunta/doppia freccia/trattino) + parola.
- **Indicatore di stato**: puntino 8 px + parola nel colore semantico ("Fatto", "Sostituito", "Saltato", "Libero", "Digiuno", "Da scegliere"). Canali spesa: stessa forma con `--c-amazon/fresco/esterno` e parola ("Amazon", "Fresco", "Esterno"); sfondo `-bg` ammesso solo in elenchi di riepilogo.
- **Selettore alternative (bottom sheet editoriale)**: sfondo `--c-carta-2`, raggio 22 in alto, maniglia sottile, occhiello "SCEGLI" + titolo serif ("Legumi a pranzo"), opzioni come righe a filetti con illustrazione 48 a sinistra, nome serif e quantità a destra; la scelta è un cerchio 20 px (pieno terracotta se attiva). Tocco = seleziona e chiude con dissolvenza (nessun "Conferma" per 2-4 opzioni; per 5+ pulsante pillola "Conferma" fisso). Padding inferiore = safe area.
- **Barra in basso minimale**: altezza 56 + safe area, sfondo `--c-carta` con filetto superiore, 5 voci (**Oggi, Settimana, Spesa, Peso, Profilo**) con icona a tratto 1.5 px 24 px + etichetta 11 px; attiva in `--c-inchiostro` con piccolo trattino terracotta sopra l'icona; inattive `--c-testo-2`.
- **Stati vuoti illustrati**: illustrazione `--illu-l` + titolo serif + una frase + una sola pillola d'azione. Esempi: nessun piano (`Piatto` vuoto, "Il tuo menu non c'è ancora" -> "Importa il piano"); giornata completata (`Germoglio`); spesa (`Carrello`); peso (`Bilancia`).
- **Caricamento**: scheletri a filetti grigi (titolo + 4 righe), niente spinner a tutto schermo. **Errore**: frase chiara in `--c-errore` con "Riprova", mai codici. **Offline**: nota discreta in testa; dati in cache leggibili. **Toast**: pillola scura in basso sopra la barra, con "Annulla" per 5 s.

## 6. Schermate

### Oggi
1. Testata: occhiello `GIOVEDI' 23 OTTOBRE`, titolo serif "Oggi a pranzo" (il pasto cambia con il prossimo non segnato); sotto, progresso in parole ("2 di 4 pasti").
2. Illustrazione del piatto (`--illu-l`, centrata) -> nome piatto in serif -> ingredienti a filetti -> "Come si prepara" comprimibile -> "In alternativa" (se esiste).
3. Pillole: **Fatto** (piena), **Sostituito** (contorno; apre nota facoltativa), **Saltato** (testo). Segnato un pasto, il successivo sale con dissolvenza.
4. "Più tardi oggi": pasti compatti con filetti, stato a puntino; tocco = espande.
5. Promemoria del nutrizionista come riga corsiva sotto un filetto ("2 L d'acqua entro pranzo"); indicatori regole in parole ("Colazioni diverse: 2 di 3").
- Pasto di tipo scelta: elenco di piatti con illustrazione 48 selezionabili. Libero: illustrazione `Libero`, "Pasto libero: goditelo", solo Fatto. Digiuno: `Digiuno`, "Pausa dal cibo", Fatto/Saltato.
- Stati: vuoto illustrato, caricamento a scheletri, errore, "Giornata completata".

### Settimana (stile menu del ristorante)
1. Testata: occhiello `SETTIMANA 43`, titolo "Il menu della settimana"; frecce discrete per cambiare settimana (ISO). 
2. Se ci sono scelte da fare: striscia "Da scegliere: 2" in terracotta con tocco che apre lo sheet; altrimenti nascosta.
3. **Ogni giorno è un capitolo**: titolo serif ("Lunedì 20"), filetto doppio sottile, poi una riga per pasto: occhiello del pasto + nome piatto serif 18, illustrazione 48 a destra, puntino di stato. Oggi con occhiello terracotta "OGGI". Tocco su un pasto = pagina dettaglio (come Oggi) in sheet a tutta altezza.
4. Nessuna griglia: scorrimento verticale; indice dei giorni (L M M G V S D) sticky in alto, tocco = salta al capitolo.

### Controlla il piano (dopo l'import e in Modifica piano)
**Non è un modulo**: è il menu impaginato, modificabile toccando.
1. **Testata**: occhiello `CONTROLLA IL PIANO`, titolo serif = titolo del piano; sottotitolo "Visita del 12 ottobre · 28 pasti · 64 alimenti". Per l'admin, riga "Per: [utente]".
2. **Riepilogo "Da verificare"** (subito sotto): tre o quattro righe a filetti, ciascuna con conteggio grande in serif e descrizione: "7 · quantità q.b.", "5 · alimenti nuovi", "3 · senza canale di spesa", "2 · errori da correggere" (solo se bloccanti, testo `--c-errore`). Tocco su una riga = scorre al primo punto e mette in evidenza i successivi: freccia "Prossimo ›" in una pillola flottante con "2 di 7". A zero conteggio la riga diventa "Tutto a posto" in salvia con spunta.
3. **Il menu**: un capitolo per giorno (come Settimana), per ogni pasto: occhiello, nome piatto serif, ingredienti a filetti (nome · quantità a destra). I punti da verificare hanno un segno nel testo: quantità mancante = "q.b." in terracotta sottolineata tratteggiata; alimento nuovo = piccolo puntino terracotta prima del nome; canale mancante = parola "scegli canale" in terracotta. Nessun campo di input visibile: tutto è testo.
4. **Tocco su un ingrediente** -> bottom sheet "Modifica ingrediente": titolo serif = nome; campi in stile minimale (riga con etichetta sopra e solo filetto sotto, niente riquadro): **Nome**, **Quantita'** (numerica) e **Unita'** (g, ml, pezzi, q.b., cucchiai: segmented a pillole), **Canale** (Amazon / Fresco / Esterno: pillole). Azioni: pillola piena "Salva", testo "Elimina ingrediente" (con conferma), "Aggiungi alternativa" se applicabile. Dopo il salvataggio la riga si aggiorna e il conteggio "Da verificare" scala con una breve animazione.
5. **Tocco sul nome del piatto o sulla preparazione** -> modifica **in linea**: il testo diventa editabile sul posto (cursore, filetto sotto), tastiera iOS; "Fine" nella barra sopra la tastiera, salva in uscita dal campo. Annulla con un tocco fuori + toast "Annulla".
6. **Aggiunte**: in fondo a ogni pasto "+ Aggiungi ingrediente" (terracotta), apre lo stesso sheet vuoto.
7. **Conferma finale**: in fondo alla pagina un blocco con illustrazione `Piatto` + frase "Il piano è pronto?" + riepilogo (n. residui da verificare). **Barra fissa "Conferma piano"** sopra la barra di navigazione: pillola piena a tutta larghezza, sempre visibile. Se restano errori bloccanti è disabilitata con testo "Correggi 2 errori"; se restano solo avvisi, il tocco apre un sheet "Restano 7 punti da verificare" con "Conferma comunque" e "Torna al controllo". Dopo la conferma: schermata di successo (`Germoglio`) -> "Vai a Oggi".
- In **Modifica piano** valgono le stesse regole; la conferma diventa "Salva modifiche" e viene mostrato un conteggio delle variazioni.
- Stati: caricamento a scheletri; errore di salvataggio con "Riprova" (le modifiche restano in locale); piano sostituito -> avviso discreto sotto la testata (il precedente resta nello storico).

### Altre schermate (stessa testata, stessi filetti)
- **Importa piano**: tre passi dichiarati nell'occhiello (`1 DI 3`), scelta file con area a filetto tratteggiato, poi si passa a "Controlla il piano".
- **Admin**: titolo "Persone", tre voci testuali con contatori (In attesa · Approvati · Bloccati) al posto dei segmented; righe a filetti con avatar, nome, azioni "Approva" (pillola piena) / "Blocca" (testo, con conferma).
- **Profilo, Spesa, Peso**: stessi principi; i segnaposto usano `Carrello`/`Bilancia` con una frase.

## 7. Login e attesa
- **Login**: carta, illustrazione grande `Cloche` (a tratto, accento terracotta) a metà schermo, occhiello `PIANO ALIMENTARE`, titolo serif "Il tuo menu, giorno per giorno", una riga di descrizione, pillola "Continua con Google" (secondo le linee guida Google), nota privacy in 13 px. Errori sotto il pulsante.
- **In attesa**: illustrazione `Orologio` (piatto con lancette), titolo serif "Stiamo preparando il tuo posto", frase "Il tuo accesso è in attesa di approvazione", email usata, pillole "Ricontrolla" (contorno) e "Esci" (testo). Si aggiorna da solo. **Bloccato**: stessa schermata, testo neutro, nessuna illustrazione festosa.

## Gioco del peso (idea da sviluppare)
Non è nel prototipo. Vincolo: l'utente inserisce **solo il peso**. Il gioco premia perdita e regolarità, senza punire. Le illustrazioni seguono lo stesso stile a tratto (`Germoglio`, fiori e foglie).

Regole comuni (anti-incentivi malsani):
- Il progresso usa la **media mobile a 7 giorni**, non il singolo valore, per ignorare le oscillazioni.
- Il credito per la perdita è **limitato** a circa 0,5% del peso a settimana: perdere più in fretta non dà di più.
- Mai penalità: se salti le misure il gioco si **mette in pausa**, non si rovina. Niente serie da "non spezzare".
- Obiettivo di peso suggerito dal nutrizionista, mai calcolato dall'app. Se il peso sale o l'obiettivo è mantenere, premia la sola regolarità.
- Nessun confronto con altri utenti, nessun numero di calorie o "colpe".

**Concept A: Il Giardino.** Ogni misura nel ritmo scelto (es. ogni 3 giorni, con 1 giorno di tolleranza) fa spuntare una **foglia**. Ogni tappa verso l'obiettivo (es. ogni 0,5 kg di media) fa sbocciare un **fiore**. Le stagioni (4 settimane) chiudono un "quadro" da collezionare. Se salti, il giardino riposa: nulla appassisce. L'utente vede un giardino che cresce e il prossimo giorno consigliato.

**Concept B: Il Sentiero.** Un percorso a tappe verso una vetta/meta. Le misure regolari danno **energia** (passi) che fa avanzare l'avatar; la perdita sana sblocca **punti panoramici** (tappe di peso). Giorni "jolly" accumulati coprono le assenze. L'utente vede mappa, prossima tappa, energia della giornata.

**Consiglio: A (Giardino).** Più calmo, nessuna meccanica di perdita o di serie, facile da mostrare in una sola schermata, e separa bene regolarità (foglie) da risultato (fiori); si sposa con lo stile editoriale a tratto.
