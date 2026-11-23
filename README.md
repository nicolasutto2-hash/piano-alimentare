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
- L'assistente (facoltativo) usa **una chiave personale Anthropic** inserita nell'app: resta solo sul telefono, fuori dalle copie di sicurezza, e le richieste vanno direttamente a Claude (Haiku). Si paga a consumo, con credito prepagato. In alternativa, se `js/config.js` ha un `proxyUrl`, usa il servizio in `worker/` con un codice amici.

## Struttura
- `index.html`, `css/`, `js/` — l'app (nessuna dipendenza, nessuna compilazione).
- `manifest.webmanifest`, `sw.js`, `icons/` — installazione e uso senza internet.
- `worker/` — servizio facoltativo per condividere l'assistente con altre persone (Cloudflare Worker). Non serve per l'uso personale. Vedi `worker/README.md`.
- `js/config.js` — modello e prezzi per la stima di spesa; `proxyUrl` vuoto = modalità con chiave personale.

## Pubblicazione
GitHub Pages: *Settings → Pages → Deploy from a branch → `main` / root*. L'app si aggiorna da sola
a ogni modifica del ramo `main`.

## Licenza
Tutti i diritti riservati. Vedi `LICENSE`.
