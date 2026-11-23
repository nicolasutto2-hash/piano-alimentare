# Servizio dell'assistente

Piccolo programma (Cloudflare Worker) che sta tra l'app e Claude. Tiene al sicuro la chiave API,
controlla il **codice amici** e limita le richieste per ogni codice al giorno.

## Cosa serve
1. Un account **Anthropic** (console.anthropic.com) con un po' di credito, un **tetto di spesa mensile** basso e una **chiave API**.
2. Un account gratuito **Cloudflare** (cloudflare.com).

## Passaggi (da dashboard Cloudflare; i nomi dei menu possono cambiare un po')
1. *Workers & Pages → Create → Create Worker*. Dai un nome (per esempio `piano-alimentare-assistente`) e tocca *Deploy*.
2. *Edit code*: sostituisci tutto con il contenuto di `worker.js` e tocca *Deploy*.
3. *Storage & Databases → KV → Create*: crea un archivio chiamato `LIMITS`.
4. Nel Worker: *Settings → Bindings → Add → KV namespace*: nome variabile `LIMITS`, scegli l'archivio creato.
5. *Settings → Variables and Secrets*: aggiungi
   - `ANTHROPIC_API_KEY` come **Secret**: incolla la chiave (solo qui, mai in chat né nel codice);
   - `ACCESS_CODES` come **Secret**: i codici amici separati da virgola, per esempio `marco-7k2,sara-9p4` (un codice per persona: se qualcuno abusa, lo togli);
   - `ALLOWED_ORIGIN` come variabile: `https://nicolasutto2-hash.github.io`;
   - `DAILY_LIMIT` (facoltativa): richieste al giorno per codice, default 120;
   - `MODEL` (facoltativa): default `claude-haiku-5-5`.
6. Copia l'indirizzo del Worker (tipo `https://piano-alimentare-assistente.TUO-NOME.workers.dev`) e scrivilo in `js/config.js` come `proxyUrl`.

## Costi e controllo
Il costo è a consumo: con Haiku 5.5 sono nell'ordine di un decimo di centesimo per messaggio.
Tieni sempre un tetto di spesa sul conto Anthropic. Per togliere l'accesso a una persona, rimuovi il suo codice da `ACCESS_CODES`.
