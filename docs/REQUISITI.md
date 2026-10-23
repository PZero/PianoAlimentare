# Requisiti

## Obiettivo
PWA **mobile first per iPhone** che importa il piano alimentare dato dal nutrizionista (PDF) e aiuta a **seguirlo**: cosa mangiare al prossimo pasto, spesa organizzata (ordine Amazon + fresco), monitoraggio di peso e aderenza con gamification.
L'app **non genera** piani: il piano è sempre quello del nutrizionista.

## Utenti e accessi
- Multiutente, login Google (Firebase Auth).
- Il primo accesso resta **in attesa** finché l'**admin** non lo approva.
- L'admin approva gli accessi e può avere un proprio piano come ogni utente. **Non legge** i dati degli altri utenti.
- Per ora l'admin importa i piani degli altri utenti (vedi `docs/IMPORT.md`): può **creare** un piano per un utente, non leggerlo.
- Profilo utente: nome, **intolleranze/esigenze** (es. senza glutine), da considerare nella scelta dei prodotti.
- **Nutrizionista** (fase 2): ruolo assegnato dall'admin. Riceve un **codice**; il paziente che vuole lo inserisce nel Profilo e l'app li associa. Il **paziente decide quali dati condividere** (piano, pesi, aderenza ai pasti, report) e può cambiarli o revocare in ogni momento. In futuro potrà caricare e correggere i piani dei suoi pazienti.

## Il piano (vedi `docs/IMPORT.md`)
- Numero e nomi dei pasti **variabili** da piano a piano (es. pre-allenamento, colazione, pranzo, spuntino, cena).
- Di solito ogni giorno della settimana ha un piatto fisso per pasto; può esserci un pasto **libero** o **digiuno**.
- Dove il piano offre **scelte** (gruppi di colazioni, "pre-allenamento", ingredienti "lenticchie *o* ceci", varianti "in alternativa…"), l'app le **mostra come scelte**.
- Il piano vale **fino alla visita successiva**, ripetendo la stessa settimana. Lo storico dei piani resta consultabile.
- Note e regole del nutrizionista (es. "almeno 3 colazioni diverse in 7 giorni", "2 L d'acqua entro pranzo") sono mostrate come promemoria; le regole strutturate sono verificate dall'app con un indicatore.
- Gli **orari** dei pasti li decide l'utente.
- Dopo il caricamento l'utente può **controllare e correggere** il piano (nomi, quantità, unità, preparazioni, canale degli alimenti).
- I blocchi di una stessa casella del PDF sono **portate** dello stesso pasto (primo, secondo, contorno/frutta).

## Funzionalità
1. **Oggi / prossimo pasto**: piatto, ingredienti con grammature, preparazione; scelte da fare se presenti; segna il pasto come *fatto / sostituito / saltato*.
2. **Settimana**: vista dei 7 giorni; scelte della settimana.
3. **Scelte settimanali**: per gli ingredienti alternativi l'utente sceglie **una volta per settimana** (es. ceci invece di lenticchie); le scelte alimentano la spesa.
4. **Spesa**, su due canali:
   - **Ordine Amazon** ogni 1-2 settimane: quantità calcolate dal piano e dalle scelte, convertite in confezioni; ogni alimento è collegato a un prodotto Amazon (ASIN); l'app genera il link per aggiungere tutto al carrello.
   - **Fresco** (frutta, verdura, pesce, ...) ogni 2-3 giorni: lista da spuntare, acquistata fuori da Amazon.
   - Alimenti con **link esterno** (es. prodotto indicato dal nutrizionista): segnalati come "da ordinare a parte"; l'utente può sostituire il link con un prodotto Amazon.
   - **Ingredienti di base** (olio, sale, spezie, ...) esclusi: ci pensa l'utente.
   - Legumi sempre **già cotti** (nessuna conversione secco/cotto).
   - Prodotti incompatibili con le intolleranze del profilo vanno segnalati.
5. **Peso**: inserimento, grafico nel tempo, obiettivo.
6. **Gamification del peso**: un **gioco** in cui l'unica interazione dell'utente è **inserire il peso**. Conta quanto perde e **con che regolarità si misura** (costanza premiata). Da inventare in fase di design. Tono positivo, mai colpevolizzante.
7. **Admin**: elenco accessi in attesa, approva/blocca; importa un piano per un utente.

## Idee per dopo
- Promemoria (calendario .ics o Comandi rapidi iOS: niente server sul piano Spark).
- Resoconto PDF per la visita successiva (aderenza, peso, difficoltà).
- Dispensa con scorte e scadenze.
- Importazione di piani da altri nutrizionisti (formati diversi).
