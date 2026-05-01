# ChatLingo Writing Style Guide

Questo documento definisce le regole di scrittura per tutti i testi del progetto ChatLingo. Consultalo ogni volta che generi testo con un modello di linguaggio.

---

## Istruzioni di formattazione da allegare ai prompt

Incolla questo blocco all'inizio di ogni prompt quando chiedi a un LLM di scrivere testo per ChatLingo.

```
ISTRUZIONI DI FORMATTAZIONE CHATLINGO

Scrivi come se stessi scrivendo un articolo o un messaggio in prosa naturale.

Regole obbligatorie:
- Nessun em-dash (—). Usa virgole o punti al loro posto.
- Nessuna freccia (→, ←, ➜). Usa parole come "poi", "quindi", "verso".
- Nessun asterisco (*) per enfatizzare. Usa la struttura della frase.
- Nessun trattino usato come separatore visivo (----, ────).
- Nessun elenco puntato se il testo può essere scritto in prosa continua.
- Nessuna parola in MAIUSCOLO per dare enfasi.
- Frasi complete con soggetto, verbo e complemento.
- Tono conversazionale ma professionale, mai troppo formale.
- Se devi elencare elementi, usa "primo... secondo... infine..." oppure una lista numerata solo se l'ordine conta davvero.
```

---

## Template per i casi d'uso più comuni

### Messaggio motivazionale (obiettivo giornaliero completato)

```
Contesto: l'utente ha appena completato la sessione di pratica giornaliera in ChatLingo.
Lingua: [INSERISCI LINGUA]
Tono: caldo, diretto, senza enfasi eccessiva.
Lunghezza: una o due frasi.

Scrivi un messaggio di congratulazioni che non usi em-dash, frecce o asterischi.
```

### Messaggio motivazionale (minuti rimanenti)

```
Contesto: all'utente mancano [X] minuti per completare l'obiettivo giornaliero in ChatLingo.
Lingua: [INSERISCI LINGUA]
Tono: incoraggiante ma sobrio, non gridato.
Lunghezza: una frase, massimo due.

Scrivi il messaggio senza em-dash, frecce o punteggiatura decorativa.
```

### Testo UI (bottoni, etichette, placeholder)

```
Contesto: etichetta per [DESCRIVI IL BOTTONE O IL CAMPO] nell'app ChatLingo.
Lingua: [INSERISCI LINGUA]
Lunghezza massima: quattro parole.
Tono: neutro e diretto.

Nessun simbolo, nessuna freccia, nessun punto esclamativo a meno che non sia indispensabile.
```

### Descrizione di una funzionalità (onboarding o marketing)

```
Contesto: descrizione della funzionalità "[NOME FUNZIONALITÀ]" per la pagina [LANDING / ONBOARDING / DASHBOARD] di ChatLingo.
Lingua: [INSERISCI LINGUA]
Lunghezza: due o tre frasi in prosa continua.
Tono: chiaro, fiducioso, senza aggettivi vuoti come "rivoluzionario" o "incredibile".

Nessun elenco puntato. Nessun em-dash. Nessuna freccia.
```

### Messaggio di errore o avviso

```
Contesto: messaggio mostrato all'utente quando [DESCRIVI LA SITUAZIONE DI ERRORE] in ChatLingo.
Lingua: [INSERISCI LINGUA]
Tono: neutro, non colpevolizzante, utile.
Lunghezza: una frase con una possibile soluzione.

Nessun punto esclamativo. Nessun em-dash. Testo in prosa naturale.
```

---

## Checklist prima di usare il testo generato

Scorri questa lista prima di incollare qualsiasi testo nell'app o nelle traduzioni.

1. Il testo contiene em-dash (—)? Sostituiscili con una virgola o un punto.
2. Il testo contiene frecce (→, ←)? Riscrivilo con parole.
3. Il testo usa asterischi per enfatizzare? Rimuovili e riscrivi la frase.
4. Ci sono separatori visivi (----, ────)? Eliminali.
5. Ci sono parole in MAIUSCOLO usate come enfasi? Riscrivile in minuscolo.
6. Il testo suona naturale letto ad alta voce? Se sembra rigido, semplificalo.
7. La lunghezza è adeguata al contesto (bottone, messaggio, descrizione)?
