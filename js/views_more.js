// ---- riepilogo settimanale ----
function trainedDates(){
  const set = new Set();
  for(const arr of Object.values(S.wlog.ex||{})) for(const x of arr) set.add(x.d);
  return set;
}
const avgOf = (days, f) => { const v = days.map(f).filter(x=>x!=null); return v.length ? v.reduce((a,b)=>a+b,0)/v.length : null; };
function sleepInsight(days){
  const lo = days.filter(x=>x.logged && x.ci.sleep!=null && x.ci.sleep<6.5), hi = days.filter(x=>x.logged && x.ci.sleep!=null && x.ci.sleep>=6.5);
  if(lo.length<2 || hi.length<2) return null;
  const a = lo.reduce((s,x)=>s+x.k,0)/lo.length, b = hi.reduce((s,x)=>s+x.k,0)/hi.length, d = Math.round(a-b);
  if(Math.abs(d)<100) return null;
  return 'Nei giorni in cui hai dormito meno di 6 ore e mezza hai mangiato in media '+fmt(Math.abs(d))+' kcal '+(d>0?'in più':'in meno')+'.';
}
function weekSummary(ws){
  const td = todayStr(), tdates = trainedDates(), days = [];
  for(let i=0;i<7;i++){
    const d = shift(ws,i), dd = S.days[d], es = dd ? dd.entries : [], past = d<=td, di = i;
    const t = sumEntries(es);
    days.push({d, past, logged:es.length>0, k:t.k, p:t.p, water:dd?(dd.water||0):0, tg:targets(d).k,
      planned: past ? daySlots(di,d).filter(sid=>mealOf(di,sid)).length : 0, marked: es.filter(e=>e.plan).length,
      train: trainOn(d), trained: tdates.has(d), ci: (dd && dd.ci) || {}, hl: (dd && dd.health) || null});
  }
  const L = days.filter(x=>x.logged), n = L.length || 1;
  const avgK = L.reduce((a,x)=>a+x.k,0)/n, avgT = L.reduce((a,x)=>a+x.tg,0)/n;
  const wk = weeklyWeights(), cur = wk.find(w=>w.ws===ws), prev = wk.filter(w=>w.ws<ws).pop();
  return {ws, days, logged:L.length, avgK, avgT, pctK:L.length?avgK/avgT*100:0, avgP:L.reduce((a,x)=>a+x.p,0)/n, avgW:L.reduce((a,x)=>a+x.water,0)/n,
    planned:days.reduce((a,x)=>a+x.planned,0), marked:days.reduce((a,x)=>a+x.marked,0),
    trainPlan:days.filter(x=>x.train).length, trained:days.filter(x=>x.trained).length, trainPast:days.filter(x=>x.train&&x.d<td).length,
    weight: cur ? cur.kg : null, weightPrev: prev ? prev.kg : null,
    stepsTotal: days.reduce((a,x)=>a+((x.hl&&x.hl.steps)||0),0), avgSteps: avgOf(days, x=>x.hl&&x.hl.steps), avgActive: avgOf(days, x=>x.hl&&x.hl.active), exTotal: days.reduce((a,x)=>a+((x.hl&&x.hl.exMin)||0),0), hlDays: days.filter(x=>x.hl).length,
    avgSleep: avgOf(days, x=>x.ci.sleep), avgEnergy: avgOf(days, x=>x.ci.energy), avgStress: avgOf(days, x=>x.ci.stress), insight: sleepInsight(days)};
}
function weekTips(s){
  const tips = [];
  if(s.logged<4) tips.push('Hai registrato '+s.logged+(s.logged===1?' giorno':' giorni')+' su 7: con più giorni il riepilogo diventa più affidabile.');
  if(s.logged){
    if(s.pctK<85) tips.push('In media sei '+fmt(s.avgT-s.avgK)+' kcal sotto l\'obiettivo. Mangiare troppo poco toglie energia e può costare muscolo: completa spuntino e merenda.');
    else if(s.pctK>110) tips.push('In media sei '+fmt(s.avgK-s.avgT)+' kcal sopra l\'obiettivo. Guarda i fuori pasto e il weekend, senza saltare i pasti per compensare.');
    else tips.push('Le calorie sono in linea con l\'obiettivo.');
    if(s.avgP < pTarget()*0.85) tips.push('Le proteine sono basse (circa '+fmt(s.avgP)+' g al giorno su '+pTarget()+'): più yogurt greco, uova o pollo.');
    else tips.push('Proteine buone: circa '+fmt(s.avgP)+' g al giorno.');
    if(s.avgW<8) tips.push('Acqua sotto gli 8 bicchieri al giorno: tieni una bottiglia vicino.');
  }
  if(s.trainPast>0) tips.push(s.trained>=s.trainPast ? 'Allenamenti: '+s.trained+' su '+s.trainPast+' previsti finora. Ottimo.' : 'Allenamenti: '+s.trained+' su '+s.trainPast+' previsti finora. Se salti un giorno, segnalo dal Menù.');
  if(s.avgSteps!=null) tips.push('Attività da Salute: circa '+fmt(s.avgSteps)+' passi e '+fmt(s.avgActive||0)+' kcal attive al giorno ('+s.hlDays+(s.hlDays===1?' giorno':' giorni')+'), '+fmt(s.exTotal)+' minuti di esercizio in totale.');
  if(s.avgSleep!=null) tips.push('Sonno medio: '+f1(s.avgSleep)+' ore'+(s.avgSleep<7?'. Meno di 7 ore può aumentare fame e stanchezza.':'.'));
  if(s.avgStress!=null && s.avgStress>=4) tips.push('Lo stress è alto questa settimana: occhio agli spuntini serali.');
  if(s.insight) tips.push(s.insight);
  if(s.weight!=null && s.weightPrev!=null){ const d = s.weight-s.weightPrev; tips.push('Peso: '+(d<0?'−':d>0?'+':'')+f1(Math.abs(d))+' kg rispetto alla settimana scorsa.'); }
  return tips;
}
function viewSett(){
  const ws = shift(S.date, -dayIdx(S.date)), s = weekSummary(ws), tips = weekTips(s);
  const stat = (lab,val,sub) => `<div class="mini"><div class="small muted">${lab}</div><div class="v num">${val}</div><div class="small muted">${sub}</div></div>`;
  let h = `<section class="card row between" style="padding:12px 14px"><button class="circ" data-act="wprev" aria-label="Settimana precedente">${ICON.left}</button>
    <div style="text-align:center"><div style="font-weight:700;font-family:var(--font-d)">${shortDate(ws)} – ${shortDate(shift(ws,6))}</div><div class="small muted">${ws===shift(todayStr(),-dayIdx(todayStr()))?'Questa settimana':'Settimana selezionata'}</div></div>
    <button class="circ" data-act="wnext" aria-label="Settimana successiva">${ICON.right}</button></section>`;
  if(!s.logged && s.weight==null) h += `<div class="note">Per questa settimana non c'è ancora niente di registrato. Segna i pasti dal Menù o dal diario e qui compare il riepilogo.</div>`;
  h += `<div class="minis">${stat('Calorie al giorno', s.logged?fmt(s.avgK):'–', s.logged?'obiettivo '+fmt(s.avgT)+' · '+Math.round(s.pctK)+'%':'nessun giorno')}
    ${stat('Proteine al giorno', s.logged?fmt(s.avgP)+' g':'–', 'obiettivo '+pTarget()+' g')}
    ${stat('Acqua al giorno', s.logged?fmt1(s.avgW*WATER_GLASS_ML/1000).replace('.',',')+' L':'–', s.logged?fmt1(s.avgW)+' bicchieri':'')}
    ${stat('Allenamenti', s.trained+' / '+s.trainPlan, 'fatti su previsti')}
    ${stat('Giorni registrati', s.logged+' / 7', 'con almeno una voce')}
    ${stat('Sonno medio', s.avgSleep!=null?f1(s.avgSleep)+' ore':'–', s.avgEnergy!=null?'energia '+f1(s.avgEnergy)+' · stress '+f1(s.avgStress??0):'nessun check-in')}
    ${stat('Peso medio', s.weight!=null?f1(s.weight)+' kg':'–', s.weight!=null&&s.weightPrev!=null?((s.weight-s.weightPrev<0?'−':'+')+f1(Math.abs(s.weight-s.weightPrev))+' kg dalla scorsa'):'nessuna pesata')}
    ${stat('Passi al giorno', s.avgSteps!=null?fmt(s.avgSteps):'–', s.avgSteps!=null?'totale '+fmt(s.stepsTotal)+' in '+s.hlDays+(s.hlDays===1?' giorno':' giorni'):'importa da Salute')}
    ${stat('Energia attiva', s.avgActive!=null?fmt(s.avgActive)+' kcal':'–', s.avgActive!=null?'al giorno · '+fmt(s.exTotal)+' min di esercizio':'importa da Salute')}</div>`;
  h += `<section class="card"><div class="tag" style="margin-bottom:8px">Giorno per giorno</div>`+
    s.days.map((x,i)=>{ const pct = x.logged && x.tg>0 ? x.k/x.tg*100 : 0; return `<div class="row" style="padding:5px 0"><span class="small" style="width:34px">${DAYS[i]}</span><div class="bar grow" style="height:10px"><i style="width:${Math.min(100,pct)}%;background:${pct>110?'var(--warn)':'var(--lime-strong)'}"></i></div><span class="small num muted" style="width:92px;text-align:right">${x.logged?fmt(x.k)+' kcal':(x.past?'–':'')}</span>${x.train?`<span class="pill" title="Allenamento">${x.trained?'fatto':'palestra'}</span>`:'<span style="width:52px"></span>'}</div>`; }).join('')+`</section>`;
  if(s.hlDays>0 && !S.showSteps) h += `<button class="btn" style="width:100%;margin-bottom:12px" data-act="stepsshow">Mostra i passi per giorno</button>`;
  if(s.hlDays>0 && S.showSteps){
    const mx = Math.max(10000, ...s.days.map(x=>(x.hl&&x.hl.steps)||0));
    h += `<section class="card"><div class="row between" style="margin-bottom:8px"><div class="tag">Passi per giorno</div><button class="x" style="border:0;background:transparent;color:var(--muted);padding:0" data-act="stepshide">Nascondi</button></div>`+s.days.map((x,i)=>{ const v = x.hl && x.hl.steps; return `<div class="row" style="padding:5px 0"><span class="small" style="width:34px">${DAYS[i]}</span><div class="bar grow" style="height:10px"><i style="width:${v?Math.min(100,v/mx*100):0}%;background:var(--accent-ink)"></i></div><span class="small num muted" style="width:70px;text-align:right">${v==null?'–':fmt(v)}</span></div>`; }).join('')+`<div class="small muted" style="margin-top:6px">La scala arriva a ${fmt(mx)} passi.</div></section>`;
  }
  h += `<section class="card"><h3>Cosa notare</h3><ul style="margin:8px 0 0;padding-left:18px;display:grid;gap:8px" class="small">${tips.map(t=>`<li>${esc(t)}</li>`).join('')||'<li class="muted">Nessun dato.</li>'}</ul>
    ${S.sample?`<div style="margin-top:12px"><button class="btn sm" data-act="weekai" data-ws="${ws}">Commenta la settimana con l'assistente</button></div>`:''}</section>
    <p class="small muted">Indicazioni generali, non sono una valutazione medica. Supporto organizzativo ed educativo.</p>`;
  return h;
}

// ---- promemoria su Google Calendar ----
const BYDAY = ['MO','TU','WE','TH','FR','SA','SU'];
function nextOn(weekdays, hhmm){
  const now = new Date(); let best = null;
  for(let add=0; add<8; add++){
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate()+add, +hhmm.slice(0,2), +hhmm.slice(3), 0);
    if(d<=now) continue;
    const di = (d.getDay()+6)%7;
    if(weekdays===null || weekdays.includes(di)){ best = d; break; }
  }
  return best;
}
const isoLocal = d => d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes())+':00';
function reminderDefs(){
  const wd = S.settings.weighDay ?? 0, tr = [...S.settings.train].sort((a,b)=>a-b);
  return [
    {key:'weigh', n:'Pesata settimanale', when:DAYS_LONG[wd]+' alle 8:00', days:[wd], at:'08:00', mins:10, title:'Pesata settimanale', desc:'Pesati a digiuno, dopo il bagno. Scrivi il peso nell\'app Piano Alimentare.'},
    {key:'prepMon', n:'Preparazione per lunedì-mercoledì', when:'lunedì alle 11:00 (dopo la palestra)', days:[0], at:'11:00', mins:15, title:'Meal prep: cucina per lunedì, martedì e mercoledì', desc:'Apri "Cosa preparare" nell\'app per le quantità. Pranzo entro le 12:45.', len:75},
    {key:'prepB', n:'Preparazione per giovedì-sabato', when:'mercoledì alle 19:00', days:[2], at:'19:00', mins:30, title:'Meal prep: cucina per giovedì, venerdì e sabato', desc:'Apri "Cosa preparare" nell\'app per le quantità.'},
    {key:'pre', n:'Polvere pre workout', when:(tr.map(i=>DAYS[i]).join(', ')||'nessun giorno')+' alle 8:40', days:tr, at:'08:40', mins:0, title:'Pre workout: dose in 400 ml d\'acqua', desc:'Palestra alle 9:00.', len:5, skip:!tr.length},
    {key:'gym', n:'Allenamento in palestra', when:(tr.map(i=>DAYS[i]).join(', ')||'nessun giorno')+' dalle 9:00 alle 10:00', days:tr, at:'09:00', mins:15, title:'Allenamento in palestra', desc:'Apri la scheda nell\'app Piano Alimentare e registra i carichi. Dopo l\'allenamento: merenda con proteine e carboidrati.', len:60, skip:!tr.length},
    {key:'backup', n:'Copia di sicurezza dell\'app', when:'domenica alle 20:00', days:[6], at:'20:00', mins:0, title:'Copia di sicurezza di Piano Alimentare', desc:'Apri Promemoria e dati nell\'app e tocca "Salva una copia".', len:10},
    {key:'sera', n:'Preparazione serale', when:'ogni sera alle 21:00', days:null, at:'21:00', mins:0, title:'Prepara pranzo e merenda di domani', desc:'5 minuti: contenitore del pranzo, merenda nello zaino, ingredienti della colazione.', len:5}
  ];
}
function viewDati(){
  const defs = reminderDefs();
  let h = `<section class="card"><h2>Promemoria nel calendario</h2><p class="small muted" style="margin:6px 0 10px">Scegli i promemoria e scarica il file: il telefono ti chiede di aggiungere gli eventi al Calendario, già ricorrenti e con notifica. Non si aggiornano da soli: se cambi giorni o orari, scarica di nuovo il file e togli prima quelli vecchi dal Calendario.</p>`;
  h += defs.map(x=>`<label class="check" style="${x.skip?'opacity:.5':''}"><input type="checkbox" data-calkey="${x.key}" ${x.skip?'disabled':''} ${(!S.calOff[x.key]&&!x.skip)?'checked':''}><span class="grow t"><span style="font-weight:600">${esc(x.n)}</span><br><span class="small muted">${esc(x.when)}</span></span></label>`).join('');
  h += `<div style="margin-top:12px"><button class="btn pri" data-act="calgo">Scarica i promemoria (.ics)</button></div>${S.calMsg?`<p class="small" style="margin:10px 0 0">${esc(S.calMsg)}</p>`:''}</section>`;
  h += healthCard();
  h += `<section class="card"><h2>Esporta i tuoi dati</h2><p class="small muted" style="margin:6px 0 12px">Per portarli a un nutrizionista o al medico. Il file contiene peso, misure, esami, obiettivi e le calorie delle ultime 4 settimane. Si salva solo se confermi.</p>
    <div class="stack"><button class="btn pri" data-act="exphtml" ${S.dl?'':'disabled'}>Scarica il report (si apre e si stampa)</button><button class="btn" data-act="expcsv" ${S.dl?'':'disabled'}>Scarica i dati (CSV, per Excel)</button></div>
    ${S.dl?'':'<p class="small muted" style="margin:10px 0 0">Il download non è disponibile in questa visualizzazione.</p>'}</section>`;
  h += `<section class="card"><h2>Copia di sicurezza</h2><p class="small muted" style="margin:6px 0 12px">Un file con tutti i tuoi dati: diario, pesi, misure, esami, scheda, preferiti, menù e impostazioni. Serve per ripristinare l'app se cambi account o telefono. È diverso dal report: questo non si legge, si rimette nell'app. Contiene dati personali, tienilo al sicuro.</p>
    <div class="stack"><button class="btn pri" data-act="bkmake" ${S.dl?'':'disabled'}>Salva una copia</button>
    <button class="btn" data-act="bkpick" ${S.bkBusy?'disabled':''}>Ripristina da un file</button><input id="bkfile" type="file" accept=".json,application/json" hidden></div>
    ${S.restore?`<div class="note" style="margin:14px 0 0"><b>Copia del ${S.restore.created?esc(shortDate(S.restore.created.slice(0,10)))+' '+S.restore.created.slice(0,4):'file'}</b><br>${S.restore.sum.giorni} giorni di diario, ${S.restore.sum.pesate} pesate, ${S.restore.sum.misure} misure, ${S.restore.sum.esami} esami${S.restore.sum.foto?', '+S.restore.sum.foto+' foto':''}${S.restore.sum.scheda?', scheda di allenamento':''}.
      <p style="margin:8px 0 10px">Ripristinando, impostazioni, pesi, misure, esami e scheda diventano quelli del file. I giorni di diario presenti nel file sostituiscono quelli attuali; gli altri giorni restano.</p>
      <div class="row"><button class="btn pri" data-act="bkgo" ${S.bkBusy?'disabled':''}>${S.bkBusy?'Sto ripristinando…':'Ripristina'}</button><button class="btn" data-act="bkcancel" ${S.bkBusy?'disabled':''}>Annulla</button></div></div>`:''}
    ${S.bkMsg?`<p class="small" style="margin:10px 0 0">${esc(S.bkMsg)}</p>`:''}</section>`;
  return h;
}
// ---- copia di sicurezza ----
const BK_KEY = /^(settings|body|labs|wlog|chat|day-\d{4}-\d{2}-\d{2}|ex-[A-Za-z0-9_-]+)$/;
async function makeBackup(){
  const docs = await Store.all();
  return JSON.stringify({app:'piano-alimentare', version:1, created:new Date().toISOString(), docs});
}
function summarizeBackup(docs){
  const ks = Object.keys(docs);
  return {giorni:ks.filter(k=>k.startsWith('day-')).length, pesate:(docs.body&&docs.body.weights||[]).length, misure:(docs.body&&docs.body.measures||[]).length,
    esami:(docs.labs&&docs.labs.items||[]).length, foto:ks.filter(k=>k.startsWith('ex-')&&docs[k].img).length, scheda:!!(docs.settings&&docs.settings.workout&&Object.values(docs.settings.workout).some(a=>a&&a.length))};
}
function readBackupFile(f){
  if(!f) return;
  S.restore = null; S.bkMsg = '';
  if(f.size>15*1024*1024){ S.bkMsg='Il file è troppo grande per essere una copia di questa app.'; render(); return; }
  const r = new FileReader();
  r.onerror = () => { S.bkMsg='Non riesco a leggere il file.'; render(); };
  r.onload = () => {
    try{
      const j = JSON.parse(r.result);
      if(!j || j.app!=='piano-alimentare' || j.version!==1 || !j.docs || typeof j.docs!=='object') throw new Error('formato');
      const docs = {};
      for(const [k,v] of Object.entries(j.docs)){
        if(!BK_KEY.test(k) || !v || typeof v!=='object' || Array.isArray(v)) continue;
        docs[k] = v;
      }
      if(!Object.keys(docs).length) throw new Error('vuoto');
      S.restore = {docs, created:j.created||'', sum:summarizeBackup(docs)};
    }catch(e){ S.bkMsg = 'Questo file non è una copia di Piano Alimentare. Scegli un file "backup-piano-alimentare".'; }
    render();
  };
  r.readAsText(f);
}
async function restoreBackup(){
  if(!S.restore || S.bkBusy) return;
  S.bkBusy = true; S.bkMsg = ''; render();
  try{
    for(const [k,v] of Object.entries(S.restore.docs)) await Store.set(k, v);
    S.days = {}; S.exImg = {};
    await loadAll();
    S.restore = null; S.bkMsg = 'Copia ripristinata. I dati del file sono di nuovo nell\'app.';
    await loadDay(S.date, true);
  }catch(e){ S.bkMsg = 'Il ripristino non è andato a buon fine. Riprova: i dati già presenti non sono stati cancellati.'; }
  S.bkBusy = false; render();
}
const icsEsc = s => String(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
const icsFold = line => { let out='', s=line; while(s.length>73){ out+=s.slice(0,73)+'\r\n '; s=s.slice(73); } return out+s; };
const icsDate = d => d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'T'+pad(d.getHours())+pad(d.getMinutes())+'00';
function buildIcs(defs){
  const stamp = new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
  const L = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Piano Alimentare//IT','CALSCALE:GREGORIAN'];
  for(const x of defs){
    const start = nextOn(x.days, x.at); if(!start) continue;
    const end = new Date(start.getTime() + (x.len||30)*60000);
    const rule = x.days ? 'FREQ=WEEKLY;BYDAY='+x.days.map(i=>BYDAY[i]).join(',') : 'FREQ=DAILY';
    L.push('BEGIN:VEVENT','UID:'+x.key+'-'+uid()+'@piano-alimentare','DTSTAMP:'+stamp,'DTSTART:'+icsDate(start),'DTEND:'+icsDate(end),'RRULE:'+rule,
      'SUMMARY:'+icsEsc(x.title),'DESCRIPTION:'+icsEsc(x.desc||''),'TRANSP:TRANSPARENT','BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(x.title),'TRIGGER:-PT'+(x.mins||0)+'M','END:VALARM','END:VEVENT');
  }
  L.push('END:VCALENDAR');
  return L.map(icsFold).join('\r\n')+'\r\n';
}
async function addReminders(){
  const keys = reminderDefs().map(x=>x.key).filter(k=>!S.calOff[k]);
  const defs = reminderDefs().filter(x=>keys.includes(x.key) && !x.skip);
  if(!defs.length){ S.calMsg='Seleziona almeno un promemoria.'; render(); return; }
  try{
    await S.dl.save({filename:'promemoria-piano-alimentare.ics', data:buildIcs(defs)});
    S.calMsg = 'File pronto: aprilo e tocca "Aggiungi tutto" nel Calendario.';
  }catch(e){ S.calMsg = e && e.code==='declined' ? '' : 'Non sono riuscito a creare il file.'; }
  render();
}

// ---- esportazione ----
async function loadRecentDays(n){
  const out = [], td = todayStr();
  await Promise.all([...Array(n)].map((_,i)=>loadDay(shift(td,-i),true)));
  for(let i=n-1;i>=0;i--){ const d = shift(td,-i), dd = S.days[d]; if(dd && dd.entries.length){ const t = sumEntries(dd.entries); out.push({d, k:t.k, p:t.p, c:t.c, f:t.f, water:dd.water||0, tg:targets(d).k}); } }
  return out;
}
const csvCell = v => { const s = String(v ?? ''); return /[",;\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s; };
async function exportCSV(){
  const rows = [['tipo','data','nome','valore','unita','riferimento']];
  for(const w of sortedW()) rows.push(['peso',w.d,'Peso',w.kg,'kg','']);
  for(const m of S.body.measures) for(const [k,n] of MEASURES) if(m[k]!=null) rows.push(['misura',m.d,n,m[k],'cm','']);
  for(const l of S.labs.items) rows.push(['esame',l.d,l.t,l.v,l.u||'',refText(l)]);
  for(const x of await loadRecentDays(28)) rows.push(['calorie',x.d,'Calorie del giorno',Math.round(x.k),'kcal','obiettivo '+x.tg+' · P '+Math.round(x.p)+' g · C '+Math.round(x.c)+' g · G '+Math.round(x.f)+' g · acqua '+x.water+' bicchieri']);
  if(S.settings.goal) rows.push(['obiettivo',S.settings.goal.date,'Peso obiettivo',S.settings.goal.kg,'kg','']);
  return rows.map(r=>r.map(csvCell).join(';')).join('\n');
}
async function exportHTML(){
  const E = esc, ws = sortedW(), wk = weeklyWeights(), g = S.settings.goal, days = await loadRecentDays(28);
  const tbl = (head, rows) => rows.length ? `<table><thead><tr>${head.map(h=>`<th>${E(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${E(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '<p class="m">Nessun dato.</p>';
  const labs = {}; for(const l of [...S.labs.items].sort((a,b)=>a.d<b.d?-1:1)) (labs[l.t] = labs[l.t]||[]).push(l);
  const wksum = {}; for(const x of days){ const k = shift(x.d,-dayIdx(x.d)); (wksum[k]=wksum[k]||[]).push(x); }
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Report Piano Alimentare</title>
<style>body{font:15px/1.5 system-ui,sans-serif;color:#111;max-width:760px;margin:24px auto;padding:0 16px}h1{margin:0 0 4px}h2{margin:28px 0 8px;font-size:1.1rem;border-bottom:2px solid #9ED53F;padding-bottom:4px}table{border-collapse:collapse;width:100%;font-size:.9rem}th,td{border-bottom:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f3f5f4}.m{color:#666;font-size:.85rem}</style></head><body>
<h1>Report Piano Alimentare</h1><p class="m">Generato il ${E(shortDate(todayStr()))} ${parse(todayStr()).getFullYear()}. Dati inseriti dall'utente: supporto organizzativo ed educativo, non sostituisce una visita medica.</p>
<h2>Profilo e obiettivo</h2><p>${(()=>{const p=S.settings.profile; return p?(p.sex==='F'?'Donna':'Uomo')+', '+p.age+' anni, '+p.height+' cm. Obiettivo: '+(GOALS[p.goal]||'').toLowerCase()+'. '+(p.trainDays||[]).length+' allenamenti a settimana ('+sportLabel()+'). ':''})()}Obiettivo calorico: ${fmt(S.settings.target)} kcal nei giorni normali (+${trainBonus()} nei giorni di allenamento).${g?' Peso obiettivo: '+f1(g.kg)+' kg entro il '+E(shortDate(g.date))+'.':''}</p>
<h2>Peso</h2><p>${ws.length?`Partenza ${f1(ws[0].kg)} kg · ultimo ${f1(ws[ws.length-1].kg)} kg (${E(shortDate(ws[ws.length-1].d))}).`:'Nessuna pesata registrata.'}</p>
${tbl(['Settimana','Peso medio (kg)','Pesate'], [...wk].reverse().slice(0,16).map(w=>[shortDate(w.ws)+' – '+shortDate(shift(w.ws,6)), f1(w.kg), w.n]))}
<h2>Misure del corpo (cm)</h2>${tbl(['Data',...MEASURES.map(m=>m[1])], [...S.body.measures].sort((a,b)=>a.d<b.d?1:-1).map(m=>[shortDate(m.d)+' '+parse(m.d).getFullYear(), ...MEASURES.map(([k])=>m[k]!=null?f1(m[k]):'–')]))}
<h2>Esami del sangue</h2>${Object.keys(labs).length ? Object.entries(labs).map(([n,rows])=>`<h3 style="margin:14px 0 4px;font-size:1rem">${E(n)}</h3>${tbl(['Data','Valore','Unità','Riferimento','Esito'], rows.slice().reverse().map(l=>[shortDate(l.d)+' '+parse(l.d).getFullYear(), f1(l.v), l.u||'', refText(l)||'–', labStatus(l)[0]]))}`).join('') : '<p class="m">Nessun esame inserito.</p>'}
<p class="m">I valori di riferimento sono indicativi (maschio adulto): fa fede il referto del laboratorio.</p>
<h2>Alimentazione, ultime 4 settimane</h2>${tbl(['Settimana','Giorni registrati','Calorie medie','Obiettivo medio','Proteine medie (g)','Acqua media (bicchieri)'], Object.keys(wksum).sort().reverse().map(k=>{ const a = wksum[k], n = a.length; return [shortDate(k)+' – '+shortDate(shift(k,6)), n, fmt(a.reduce((s,x)=>s+x.k,0)/n), fmt(a.reduce((s,x)=>s+x.tg,0)/n), fmt(a.reduce((s,x)=>s+x.p,0)/n), fmt1(a.reduce((s,x)=>s+x.water,0)/n)]; }))}
<p class="m">Le calorie sono quelle registrate dall'utente, in parte stimate: valori indicativi.</p></body></html>`;
}
