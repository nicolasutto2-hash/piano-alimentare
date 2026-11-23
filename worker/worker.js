// Servizio dell'assistente: riceve le richieste dell'app, controlla il codice amici e il limite giornaliero,
// e le inoltra a Claude con la chiave segreta (che resta qui, mai nell'app).
// Variabili da impostare su Cloudflare (vedi worker/README.md):
//   ANTHROPIC_API_KEY  (segreto)   la chiave API
//   ACCESS_CODES       (segreto)   codici amici separati da virgola, per esempio: marco-7k2,sara-9p4
//   DAILY_LIMIT        (variabile) richieste al modello per codice al giorno (default 120)
//   MODEL              (variabile) default claude-haiku-5-5
//   ALLOWED_ORIGIN     (variabile) indirizzo dell'app, per esempio https://nicolasutto2-hash.github.io
//   LIMITS             (KV)        archivio dei contatori giornalieri
const MAX_BODY = 1_500_000;      // byte
const MAX_MESSAGES = 60, MAX_TOOLS = 25, MAX_SYSTEM = 20000;

const cors = env => ({
  'access-control-allow-origin': env.ALLOWED_ORIGIN || '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type, x-access-code',
  'access-control-max-age': '86400',
  'vary': 'origin'
});
const json = (env, status, obj) => new Response(JSON.stringify(obj), {status, headers:{'content-type':'application/json', ...cors(env)}});
const err = (env, status, message) => json(env, status, {error:{message}});

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, {status:204, headers:cors(env)});
    if (request.method !== 'POST') return err(env, 405, 'Metodo non consentito');

    // codice amici
    const code = (request.headers.get('x-access-code') || '').trim();
    const codes = (env.ACCESS_CODES || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!code || !codes.includes(code)) return err(env, 401, 'Codice non valido');

    // limite giornaliero per codice
    const limit = parseInt(env.DAILY_LIMIT || '120', 10);
    const day = new Date().toISOString().slice(0, 10);
    const key = `${code}:${day}`;
    let used = 0;
    if (env.LIMITS) { used = parseInt((await env.LIMITS.get(key)) || '0', 10); if (used >= limit) return err(env, 429, 'Hai finito le richieste di oggi. Riprova domani.'); }

    // richiesta
    const raw = await request.text();
    if (raw.length > MAX_BODY) return err(env, 413, 'Richiesta troppo grande');
    let body;
    try { body = JSON.parse(raw); } catch { return err(env, 400, 'Richiesta non valida'); }
    if (!Array.isArray(body.messages) || !body.messages.length || body.messages.length > MAX_MESSAGES) return err(env, 400, 'Messaggi non validi');
    if (body.tools && (!Array.isArray(body.tools) || body.tools.length > MAX_TOOLS)) return err(env, 400, 'Strumenti non validi');
    if (body.system && (typeof body.system !== 'string' || body.system.length > MAX_SYSTEM)) return err(env, 400, 'Istruzioni non valide');

    // l'app non sceglie il modello né i limiti: li decide il servizio
    const payload = {model: env.MODEL || 'claude-haiku-5-5', max_tokens: 2000, messages: body.messages};
    if (body.system) payload.system = body.system;
    if (body.tools && body.tools.length) payload.tools = body.tools;

    if (env.LIMITS) await env.LIMITS.put(key, String(used + 1), {expirationTtl: 172800});

    let upstream;
    try {
      upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {'content-type':'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01'},
        body: JSON.stringify(payload)
      });
    } catch { return err(env, 502, 'Non riesco a raggiungere Claude'); }

    const text = await upstream.text();
    return new Response(text, {status: upstream.status, headers: {'content-type':'application/json', ...cors(env)}});
  }
};
