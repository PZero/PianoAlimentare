# Importazione dei piani

Specifica per l'agente `importatore-piani`: come trasformare il PDF del nutrizionista nel JSON che l'app importa.

## Privacy (repository pubblico)
- PDF e JSON reali stanno **solo** in `dati/` (escluso da git) e poi in Firestore. **Mai** nel repository, nei test o nei messaggi di commit.
- Nei test e negli esempi solo piani **inventati** (`docs/esempi/piano-esempio.json`).

## Procedura
1. Estrai il testo: `python scripts/estrai-pdf.py <file.pdf>` (testo con pypdf + pagine renderizzate in PNG con pymupdf, nella cartella temporanea).
2. **Guarda le immagini delle pagine**: le tabelle giorni × pasti nel testo estratto perdono le colonne; la disposizione vera si legge solo dalle immagini.
3. Costruisci il JSON secondo lo schema sotto, riusando gli `id` degli alimenti già noti (catalogo in `docs/esempi/` e piani precedenti dell'utente).
4. Valida: `node scripts/valida-piano.mjs dati/piani/<file>.json`.
5. Salva in `dati/piani/<utente>-<aaaa-mm-gg>.json` e riporta all'admin **i dubbi** (testo ambiguo, quantità mancanti, alimenti nuovi, canale incerto).
6. L'admin importa il file dall'app (Gestione → Importa piano → utente).

## Formato del piano (versione 1)

```json
{
  "versione": 1,
  "titolo": "Piano Estate",
  "dataVisita": "2026-06-15",
  "pasti": [
    { "id": "pre-allenamento", "nome": "Pre-allenamento", "facoltativo": true },
    { "id": "colazione", "nome": "Colazione" },
    { "id": "pranzo", "nome": "Pranzo" },
    { "id": "spuntino", "nome": "Spuntino" },
    { "id": "cena", "nome": "Cena" }
  ],
  "settimana": {
    "lun": {
      "pre-allenamento": { "tipo": "scelta", "gruppi": ["pre-allenamento"] },
      "colazione": { "tipo": "scelta", "gruppi": ["colazione-post-allenamento", "colazione-riposo"] },
      "pranzo": { "tipo": "piatto", "piatto": "lun-pranzo" },
      "spuntino": { "tipo": "piatto", "piatto": "frullato-proteico" },
      "cena": { "tipo": "libero" }
    }
  },
  "gruppi": [
    { "id": "colazione-riposo", "nome": "Colazioni giorni di riposo", "piatti": ["uovo-e-affettato", "macedonia-yogurt"] }
  ],
  "piatti": {
    "lun-pranzo": {
      "nome": "Insalata di legumi con sgombro",
      "componenti": [
        { "portata": 1, "opzioni": [
          { "alimento": "lenticchie-cotte", "quantita": 180, "unita": "g" },
          { "alimento": "ceci-cotti", "quantita": 180, "unita": "g" }
        ] },
        { "opzioni": [ { "alimento": "sgombro-naturale", "quantita": 50, "unita": "g" } ] },
        { "opzioni": [ { "alimento": "olio-semi-lino", "quantita": 1, "unita": "cucchiaio" } ] }
      ],
      "preparazione": "Servi con pomodorini freschi e origano.",
      "varianti": []
    }
  },
  "alimenti": {
    "lenticchie-cotte": { "nome": "Lenticchie cotte", "canale": "amazon", "tag": ["legumi"] },
    "olio-semi-lino": { "nome": "Olio di semi di lino", "canale": "base" },
    "sgombro-naturale": { "nome": "Sgombro al naturale", "canale": "amazon" },
    "proteine-vegetali": { "nome": "Proteine vegetali", "canale": "esterno", "link": "https://..." }
  },
  "note": ["Assumi 2 L di acqua entro pranzo."],
  "regole": [
    { "tipo": "varieta", "pasto": "colazione", "minDiversi": 3, "giorni": 7,
      "testo": "Scegli almeno 3 colazioni diverse nell'arco di 7 giorni." }
  ]
}
```

### Regole di conversione
- **Portate**: più blocchi separati in una stessa cella (primo, secondo, contorno/frutta...) = **portate dello stesso piatto**: ogni componente ha il campo facoltativo `portata` (intero >= 1, assente = 1), numerato nell'ordine del PDF.
- **Giorni**: `lun mar mer gio ven sab dom`. Un pasto assente in un giorno → omesso; "Digiuno" → `{ "tipo": "digiuno" }`; "Libero" → `{ "tipo": "libero" }`.
- **Pasti fuori griglia** (es. elenchi di colazioni o "pre-allenamento" in una pagina a parte): diventano `gruppi`, assegnati a **ogni giorno** con `tipo: "scelta"`. Le condizioni ("post allenamento", "giorni di riposo") restano nel **nome del gruppo**: sono opzioni, non vincoli.
- **"Oppure" tra piatti interi** → piatti diversi nello stesso gruppo.
- **"A o B o C" dentro un piatto** → un componente con più `opzioni`. Se la quantità è indicata una sola volta ("lenticchie o ceci 180 g") vale per tutte le opzioni.
- **Frasi in corsivo "In alternativa: …"** → `varianti` del piatto (piatti completi).
- **Quantità**: `quantita` numero; intervalli ("100/130 g", "3-4 fette") → `quantitaMin` e `quantita` (= massimo, usato per la spesa). Unità ammesse: `g`, `mL`, `pezzo`, `fetta`, `cucchiaio`, `cucchiaino`, `vasetto`, `porzione`, `qb` (senza quantità).
- **"Peso cotto"** dei legumi: alimento `*-cotti` (l'utente li compra già cotti). "Peso secco" di cereali: alimento normale (riso, quinoa: si comprano secchi).
- **Marche citate** (Alpro, Sojasun, Schär, SevenHills, ...): nel `nome` dell'alimento o come opzioni distinte se sono alternative ("Alpro o Sojasun").
- **Canale** dell'alimento (modificabile dall'utente):
  - `fresco`: frutta, verdura, erbe fresche, pesce e carne freschi, uova, latticini freschi a breve scadenza (mozzarella, ricotta);
  - `base`: olio, sale, pepe, spezie, aceto, succo di limone, acqua, miele, senape → esclusi dalla spesa;
  - `esterno`: prodotto indicato con un link o "vedi mail" → da ordinare a parte;
  - `amazon`: tutto il resto (confezionati, legumi cotti, cereali, bevande vegetali, yogurt vegetali, frutta secca, conserve).
- **Id degli alimenti**: minuscolo con trattini, al singolare dove sensato, **stabili** tra un piano e l'altro (servono per ritrovare il prodotto Amazon già associato).
- **Note** generali → `note`; regole numeriche riconoscibili → anche in `regole`.
- Contenuti del PDF da **non** importare: nome del paziente, contatti del nutrizionista.

### Casi già visti
- Piano "a settimana fissa" con griglia lun-gio (pag. 2) e ven-dom (pag. 3), pasti pranzo / break / cena (break = spuntino).
- Colazioni su pagina separata in tre gruppi (pre-allenamento, post allenamento, riposo).
- Prodotto con "proteine vegetali vedi link via mail" → alimento `esterno` senza link: chiedere il link all'utente.
- Cella della griglia con più paragrafi separati da spazio (es. "insalata" + "riso"): proposta di regola = **un solo piatto** con più componenti, salvo "Oppure" esplicito; segnalare come dubbio se non è chiaro.
- Quantità assente ("pomodorini freschi", "un filo d'olio", "qualche oliva") → unità `qb`; "Fetta di pane" senza numero → 1 fetta.
- Brand citati come alternative ("Alpro o Sojasun") → alimenti distinti per marca; "senza glutine" nel nome dell'alimento.
- "Digiuno" in corsivo in una cella → `{ "tipo": "digiuno" }`; la data della visita, se assente nel PDF, si omette (`dataVisita` facoltativa).
