# Piano Alimentare

App per telefono (si installa dalla schermata Home) con menù settimanale, calorie, spesa,
meal prep, allenamento, peso e misure, esami del sangue e un assistente. Ognuno compila il
proprio profilo e ottiene calorie e porzioni su misura.

> Supporto organizzativo ed educativo: non sostituisce una visita da un professionista sanitario.

## Come si installa

**iPhone (Safari):** apri il link dell'app, tocca il pulsante *Condividi* e poi *Aggiungi alla schermata Home*.
**Android (Chrome):** apri il link, tocca il menu (⋮) e poi *Installa app*.

## Dati e privacy
- I dati (diario, peso, esami, profilo) restano **solo sul telefono** di chi usa l'app. Non c'è nessun account e nessun database.
- Se cancelli i dati del sito o cambi telefono si perdono: usa **Promemoria e dati → Salva una copia** e conserva il file.
- L'assistente (facoltativo) invia al servizio solo i messaggi che scrivi e le foto che allegi.

## Struttura
- `index.html`, `css/`, `js/` — l'app (nessuna dipendenza, nessuna compilazione).
- `manifest.webmanifest`, `sw.js`, `icons/` — installazione e uso senza internet.
- `worker/` — il piccolo servizio dell'assistente (Cloudflare Worker). Vedi `worker/README.md`.
- `js/config.js` — qui si scrive l'indirizzo del servizio (`proxyUrl`). Se è vuoto l'assistente è spento.

## Pubblicazione
GitHub Pages: *Settings → Pages → Deploy from a branch → `main` / root*. L'app si aggiorna da sola
a ogni modifica del ramo `main`.

## Licenza
Tutti i diritti riservati. Vedi `LICENSE`.
