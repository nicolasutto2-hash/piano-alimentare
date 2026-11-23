// ---- dati di Salute e Fitness: arrivano da un Comando rapido tramite gli appunti ----
const HEALTH_TAG = 'PIANO-SALUTE';
const RINGS_DEFAULT = {move:500, ex:30, stand:12};
const ringGoals = () => ({...RINGS_DEFAULT, ...(S.settings.rings||{})});

function parseHealth(text){
  const t = String(text||'').trim();
  if(!t.toUpperCase().includes(HEALTH_TAG)) return null;
  const kv = {};
  for(const part of t.split(/[;\n\r]+/)){ const i = part.indexOf('='); if(i>0) kv[part.slice(0,i).trim().toLowerCase()] = part.slice(i+1).trim().replace(/\s/g,'').replace(',','.'); }
  const num = (k, max) => { const x = parseFloat(kv[k]); return (isFinite(x) && x>=0 && x<=max) ? x : null; };
  const d = /^\d{4}-\d{2}-\d{2}$/.test(kv.data||'') ? kv.data : todayStr();
  const out = {d, steps:num('passi',100000), active:num('attive',6000), exMin:num('esercizio',1440), stand:num('piedi',24), weight:num('peso',250), sleep:num('sonno',24), workouts:num('allenamenti',20)};
  if(out.weight!==null && out.weight<30) out.weight = null;
  return Object.entries(out).some(([k,v])=>k!=='d' && v!==null) ? out : null;
}
async function importHealth(text){
  const h = parseHealth(text);
  if(!h) throw new Error('Non riconosco questi dati. Controlla che il Comando copi una riga che inizia con '+HEALTH_TAG+'.');
  await loadDay(h.d, true);
  const day = S.days[h.d];
  day.health = {steps:h.steps, active:h.active, exMin:h.exMin, stand:h.stand, at:Date.now()};
  if(h.workouts>0 && !trainOn(h.d)) day.train = true;
  if(h.sleep!==null && h.sleep>0){ day.ci = day.ci || {}; if(day.ci.sleep==null) day.ci.sleep = Math.round(h.sleep*2)/2; }
  if(h.weight!==null){ S.body.weights = S.body.weights.filter(x=>x.d!==h.d); S.body.weights.push({d:h.d, kg:Math.round(h.weight*10)/10}); saveDoc('body'); }
  saveDay(h.d);
  return h;
}
function ringsCard(day, date){
  const hl = day && day.health, g = ringGoals();
  if(!hl) return `<section class="card row between" style="padding:14px 16px"><div class="grow"><div style="font-weight:700;font-family:var(--font-d)">Attività da Salute</div><div class="small muted">Nessun dato per ${date===todayStr()?'oggi':'questo giorno'}</div></div><button class="btn sm" data-act="go" data-p="dati">Importa</button></section>`;
  const R = [[54,'#FA2D5E',(hl.active||0)/g.move],[40,'#9BE13C',(hl.exMin||0)/g.ex],[26,'#27D3E6',(hl.stand||0)/g.stand]];
  const ring = ([r,c,p]) => { const C = 2*Math.PI*r; return `<circle cx="66" cy="66" r="${r}" fill="none" stroke="${c}" stroke-opacity=".2" stroke-width="11"/><circle cx="66" cy="66" r="${r}" fill="none" stroke="${c}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${C*Math.min(p,1)} ${C}"/>`; };
  const row = (c,lab,val,goal,unit) => `<div class="row" style="gap:8px"><i style="width:10px;height:10px;border-radius:50%;background:${c};flex:none"></i><span class="small grow">${lab}</span><b class="num small">${val==null?'–':fmt(val)}</b><span class="small muted num">/ ${goal} ${unit}</span></div>`;
  return `<section class="card"><div class="row between" style="margin-bottom:10px"><h3>Attività da Salute</h3><span class="small muted">${date===todayStr()?'Oggi':shortDate(date)}</span></div>
    <div class="ringwrap" style="gap:16px"><div style="width:120px;height:120px;flex:none"><svg viewBox="0 0 132 132" style="width:100%;height:100%;transform:rotate(-90deg)">${R.map(ring).join('')}</svg></div>
    <div class="grow stack" style="gap:8px">${row('#FA2D5E','Muoversi',hl.active,g.move,'kcal')}${row('#9BE13C','Esercizio',hl.exMin,g.ex,'min')}${row('#27D3E6','In piedi',hl.stand,g.stand,'h')}</div></div>
    <div class="small muted" style="margin-top:10px">Passi <b class="num" style="color:var(--fg)">${hl.steps==null?'–':fmt(hl.steps)}</b></div></section>`;
}
function healthCard(){
  const g = ringGoals();
  return `<section class="card"><h2>Dati da Salute e Fitness</h2>
    <p class="small muted" style="margin:6px 0 12px">Un Comando rapido legge i dati di oggi (passi, energia attiva, minuti di esercizio, ore in piedi, peso, allenamenti) e li copia negli appunti. Poi li importi qui con un tocco.</p>
    <div class="stack"><button class="btn pri" data-act="hlimport">Importa dagli appunti</button>
    <details><summary>Incolla a mano</summary><div class="stack" style="margin-top:8px"><textarea id="hltext" rows="3" placeholder="PIANO-SALUTE;data=…;passi=…" style="font:inherit;color:var(--fg);background:var(--surface2);border:1px solid transparent;border-radius:14px;padding:10px 12px;width:100%"></textarea><button class="btn" data-act="hlpaste">Importa il testo</button></div></details></div>
    ${S.hlMsg?`<p class="small" style="margin:10px 0 0;color:${S.hlOk?'var(--ok)':'var(--warn)'}">${esc(S.hlMsg)}</p>`:''}
    <details style="margin-top:12px"><summary>Come creare il Comando rapido</summary>
    <ol class="small" style="margin:8px 0 0;padding-left:20px;display:grid;gap:8px">
      <li>Apri <b>Comandi rapidi</b> e tocca <b>+</b>. Chiamalo "Salute nell'app".</li>
      <li>Aggiungi <b>Trova campioni di Salute</b>: tipo <i>Passi</i>, data di inizio <i>è oggi</i>. Poi <b>Calcola statistiche</b> (<i>Somma</i>) e salva il risultato in una variabile "Passi". Ripeti per <i>Energia attiva</i> ("Attive"), <i>Tempo di esercizio</i> ("Esercizio") e <i>Ore in piedi</i> ("Piedi").</li>
      <li>Per il peso: <b>Trova campioni di Salute</b>, tipo <i>Peso</i>, ordina dal più recente, limite 1, variabile "Peso".</li>
      <li>Per gli allenamenti: <b>Trova allenamenti</b> di oggi, poi <b>Conta</b>, variabile "Allenamenti".</li>
      <li>Aggiungi <b>Formatta data</b> (oggi, formato personalizzato <i>yyyy-MM-dd</i>) e salvala come "Data".</li>
      <li>Aggiungi un'azione <b>Testo</b> con questo contenuto, inserendo le variabili al posto delle parentesi:<br><code style="word-break:break-all">PIANO-SALUTE;data=[Data];passi=[Passi];attive=[Attive];esercizio=[Esercizio];piedi=[Piedi];peso=[Peso];allenamenti=[Allenamenti]</code></li>
      <li>Aggiungi <b>Copia negli appunti</b>. Alla prima esecuzione iOS ti chiede i permessi per leggere Salute: consentili.</li>
      <li>Tocca <i>Condividi → Aggiungi alla schermata Home</i> per avere un'icona. Lancialo, poi apri l'app e tocca <b>Importa dagli appunti</b>.</li></ol>
      <p class="small muted" style="margin:8px 0 0">I nomi delle azioni possono cambiare un po' con la versione di iOS. Se un dato non c'è (per esempio il peso), lascia il campo vuoto: l'app importa quelli che trova.</p></details>
    <details style="margin-top:12px"><summary>Obiettivi degli anelli</summary><div class="grid2" style="margin-top:8px">
      <div><label for="rg-move">Muoversi (kcal)</label><input id="rg-move" data-rg="move" type="number" inputmode="numeric" value="${g.move}"></div>
      <div><label for="rg-ex">Esercizio (min)</label><input id="rg-ex" data-rg="ex" type="number" inputmode="numeric" value="${g.ex}"></div>
      <div><label for="rg-stand">In piedi (ore)</label><input id="rg-stand" data-rg="stand" type="number" inputmode="numeric" value="${g.stand}"></div></div>
      <p class="small muted" style="margin:8px 0 0">Scrivi gli stessi obiettivi che hai in Fitness.</p></details></section>`;
}
