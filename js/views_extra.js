// ---- allenamento ----
const exOf = di => S.settings.workout[di] || [];
function lastSession(exId){
  const arr = (S.wlog.ex[exId]||[]).filter(x=>x.d<todayStr());
  if(!arr.length) return null;
  const d = arr.reduce((m,x)=>x.d>m?x.d:m,'');
  return {d, sets:arr.filter(x=>x.d===d)};
}
function progression(ex){
  if(ex.inc===0) return null;
  const arr = S.wlog.ex[ex.id] || []; if(!arr.length) return null;
  const d = arr.reduce((m,x)=>x.d>m?x.d:m,''), sets = arr.filter(x=>x.d===d);
  const kgMax = Math.max(...sets.map(x=>x.kg)), top = Math.max(...(String(ex.reps).match(/\d+/g)||[10]).map(Number));
  const atMax = sets.filter(x=>x.kg===kgMax), inc = ex.inc>0 ? ex.inc : (kgMax>=20 ? 2.5 : 1);
  if(atMax.length>=ex.sets && atMax.every(x=>x.reps>=top)) return {up:true, kg:Math.round((kgMax+inc)*10)/10, text:'Hai chiuso tutte le serie: la prossima volta prova '+f1(kgMax+inc)+' kg.'};
  return {up:false, kg:kgMax, text:'Resta a '+f1(kgMax)+' kg finché fai '+top+' ripetizioni in tutte le '+ex.sets+' serie.'};
}
const setsToday = exId => (S.wlog.ex[exId]||[]).filter(x=>x.d===todayStr());
const exVideoUrl = n => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(n + ' esecuzione corretta');
function viewAllena(){
  const td = dayIdx(todayStr()), train = [...S.settings.train].sort((a,b)=>a-b);
  let h = `<section class="card"><h2>I tuoi giorni di ${sportLabel()}</h2><p class="small muted" style="margin:6px 0 12px">In questi giorni il menù si adatta all'allenamento e l'obiettivo sale di ${trainBonus()} kcal. Se un giorno cambia, lo modifichi dal Menù con "Oggi non mi alleno" o "Oggi mi alleno". Orari e sport si cambiano da Il mio profilo.</p>
    <div class="chips" style="flex-wrap:wrap;overflow:visible">${DAYS.map((n,i)=>`<button class="chip ${isTrain(i)?'on':''}" data-act="traintoggle" data-i="${i}" aria-pressed="${isTrain(i)}">${n}</button>`).join('')}</div>
    ${train.length!==3?`<p class="small muted" style="margin:6px 0 0">Ne hai scelti ${train.length}. </p>`:''}
    ${CFG.powder?`<div style="margin-top:14px"><label for="prek">Calorie di una dose di pre workout (kcal)</label><input id="prek" type="number" inputmode="numeric" min="0" max="200" value="${S.settings.preKcal ?? 10}"><p class="small muted" style="margin:6px 0 0">Guarda l'etichetta del barattolo: spesso sono poche. Controlla anche la caffeina per dose.</p></div>`:''}</section>`;
  if(S.schedaPrev){ const sp = S.schedaPrev; h += `<section class="card" style="border:2px solid var(--accent)"><h3>Scheda trovata</h3><p class="small" style="margin:6px 0 10px">${sp.sum.days} giorni, ${sp.sum.ex} esercizi, ${sp.sum.img} foto${sp.sum.note?'. Include una nota per l\'assistente sul tuo profilo':''}. Sostituisce gli esercizi di ${sp.sum.dayNames}. I carichi già registrati restano per gli esercizi con lo stesso nome.</p><div class="row"><button class="btn pri" data-act="schgo">Carica la scheda</button><button class="btn" data-act="schcancel">Annulla</button></div></section>`; }
  if(!train.length) h += `<div class="note">Seleziona almeno un giorno per creare la scheda.</div>`;
  for(const di of train){
    const exs = exOf(di);
    const mt = (S.settings.workoutMeta||{})[di];
    h += `<section class="card"><div class="row between"><div><h2>${DAYS_LONG[di]}</h2>${mt&&mt.name?`<div class="small muted">${esc(mt.name)}</div>`:''}</div>${di===td?'<span class="pill">Oggi</span>':''}</div>${mt&&(mt.warm||mt.cardio)?`<details style="margin-top:8px"><summary class="small">Riscaldamento e defaticamento</summary><div class="small muted" style="margin-top:6px">${mt.warm?'<b>Riscaldamento:</b> '+esc(mt.warm):''}${mt.warm&&mt.cardio?'<br>':''}${mt.cardio?'<b>Defaticamento:</b> '+esc(mt.cardio):''}</div></details>`:''}`;
    if(!exs.length) h += `<p class="muted" style="margin:10px 0">Nessun esercizio. Quando ti danno la scheda, aggiungi gli esercizi qui, oppure scrivili all'Assistente e li inserisce lui.</p>`;
    for(const e of exs){
      const ls = lastSession(e.id), tdy = setsToday(e.id), img = S.exImg[e.id], pr = progression(e);
      h += `<div class="entry" style="align-items:flex-start"><button class="exth" data-act="exview" data-id="${e.id}" data-di="${di}" aria-label="Foto e video di ${esc(e.name)}">${img?`<img src="${img}" alt="Foto di ${esc(e.name)}">`:ICON.cam}</button>
        <div class="grow"><div style="font-weight:600">${esc(e.name)}</div>
        <div class="small muted num">${e.sets} × ${esc(e.reps)}${e.rest?' · rec. '+esc(e.rest):''}${ls?' · Ultima volta: '+ls.sets.map(x=>x.kg+' kg × '+x.reps).join(', '):''}</div>
        ${tdy.length?`<div class="small done num">Oggi: ${tdy.map(x=>x.kg+' kg × '+x.reps).join(', ')}</div>`:''}
        ${pr?`<div class="small ${pr.up?'done':'muted'}">${pr.text}</div>`:''}
        ${e.note?`<details class="small" style="margin:2px 0"><summary class="small">Indicazioni</summary><div class="muted" style="margin-top:4px">${esc(e.note)}</div></details>`:''}
        <a class="small" style="color:var(--accent-ink);font-weight:600" href="${exVideoUrl(e.name)}" target="_blank" rel="noopener">Come si fa</a></div>
        <div class="stack" style="gap:6px;align-items:flex-end"><button class="btn sm pri" data-act="wlogopen" data-id="${e.id}" data-di="${di}">Registra</button><button class="x" style="border:0;background:transparent;color:var(--muted)" data-act="exdel" data-id="${e.id}" data-di="${di}" aria-label="Elimina ${esc(e.name)}">Elimina</button></div></div>`;
    }
    h += `<div style="margin-top:10px"><button class="btn sm" data-act="exadd" data-di="${di}">Aggiungi esercizio</button></div></section>`;
  }
  const gd = S.settings.workoutGuide;
  if(gd && gd.length) h += `<section class="card"><h3>Linee guida della scheda</h3><ul class="small muted" style="margin:8px 0 0;padding-left:18px;display:grid;gap:6px">${gd.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`;
  h += `<section class="card"><h3>Importa una scheda</h3><p class="small muted" style="margin:6px 0 10px">Da un file di scheda (con serie, ripetizioni, recuperi, indicazioni e foto). Gli esercizi con lo stesso nome tengono i carichi già registrati.</p><button class="btn" data-act="schpick">Scegli il file della scheda</button><input id="schfile" type="file" hidden>
    <details style="margin-top:12px"><summary class="small">Oppure incolla il testo della scheda</summary><div class="stack" style="margin-top:8px"><textarea id="schtext" rows="4" placeholder="{ &quot;app&quot;: &quot;piano-alimentare&quot;, &quot;kind&quot;: &quot;scheda&quot; … }" style="font:inherit;color:var(--fg);background:var(--surface2);border:1px solid transparent;border-radius:14px;padding:10px 12px;width:100%"></textarea><button class="btn" data-act="schpaste">Importa il testo</button></div></details>
    ${S.schedaMsg?`<p class="small" style="margin:10px 0 0;color:var(--warn)">${esc(S.schedaMsg)}</p>`:''}</section>`;
  h += `<p class="small muted">Chiedi all'Assistente per riempire una scheda in una frase, per esempio "Mercoledì: panca 4x8, squat 4x10, rematore 3x12".</p>`;
  return h;
}

// ---- peso e misure ----
const num = v => { const x = parseFloat(String(v).replace(',','.')); return isFinite(x) ? x : NaN; };
const f1 = n => String(Math.round(n*10)/10).replace('.',',');
const sortedW = () => [...S.body.weights].sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0);
const shortDate = d => { const x=parse(d); return x.getDate()+' '+MONTHS[x.getMonth()]; };
function weightChart(ws){
  const pts = ws.slice(-30), W=320, H=165, pl=38, pr=16, pt=16, pb=26, g = S.settings.goal;
  const T = d => parse(d).getTime(), DAY = 864e5;
  let t0 = T(pts[0].d); const tl = T(pts[pts.length-1].d);
  let tEnd = g ? Math.max(T(g.date), tl) : tl;
  if(pts.length===1 && !g){ t0 -= 3.5*DAY; tEnd = tl + 3.5*DAY; }
  const span = Math.max(tEnd-t0, 7*DAY);
  const vals = pts.map(x=>x.kg).concat(g?[g.kg]:[]);
  let mn = Math.min(...vals), mx = Math.max(...vals);
  if(mx-mn<2){ const m=(mx+mn)/2; mn=m-1; mx=m+1; }
  mn = Math.floor(mn*2)/2-.5; mx = Math.ceil(mx*2)/2+.5;
  const X = t => pl + (t-t0)/span*(W-pl-pr), Y = v => pt + (mx-v)/(mx-mn)*(H-pt-pb), mid = (mx+mn)/2;
  let s = [mn,mid,mx].map(v=>`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" stroke-width="1"/><text x="${pl-6}" y="${Y(v)+4}" text-anchor="end" font-size="10" fill="var(--muted)">${f1(v)}</text>`).join('');
  if(g) s += `<line x1="${X(T(pts[0].d)).toFixed(1)}" y1="${Y(pts[0].kg).toFixed(1)}" x2="${X(T(g.date)).toFixed(1)}" y2="${Y(g.kg).toFixed(1)}" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="5 4"/>
    <circle cx="${X(T(g.date)).toFixed(1)}" cy="${Y(g.kg).toFixed(1)}" r="5" fill="var(--surface)" stroke="var(--warn)" stroke-width="2"/>
    <text x="${Math.min(W-pr, X(T(g.date))).toFixed(1)}" y="${(Y(g.kg)-9).toFixed(1)}" text-anchor="end" font-size="10" font-weight="700" fill="var(--warn)">${f1(g.kg)} kg</text>`;
  const line = pts.map((p,i)=>(i?'L':'M')+X(T(p.d)).toFixed(1)+' '+Y(p.kg).toFixed(1)).join(' ');
  const dots = pts.map((p,i)=>`<circle cx="${X(T(p.d)).toFixed(1)}" cy="${Y(p.kg).toFixed(1)}" r="${i===pts.length-1?5:3}" fill="${i===pts.length-1?'var(--accent-ink)':'var(--surface)'}" stroke="var(--accent-ink)" stroke-width="2"/>`).join('');
  const lx = `<text x="${pl}" y="${H-6}" font-size="10" fill="var(--muted)" text-anchor="start">${shortDate(pts[0].d)}</text>` + (g && T(g.date)>tl ? `<text x="${W-pr}" y="${H-6}" font-size="10" fill="var(--muted)" text-anchor="end">${shortDate(g.date)}</text>` : (pts.length>1?`<text x="${W-pr}" y="${H-6}" font-size="10" fill="var(--muted)" text-anchor="end">${shortDate(pts[pts.length-1].d)}</text>`:''));
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block" role="img" aria-label="Andamento del peso${g?' e obiettivo':''}">${s}<path d="${line}" fill="none" stroke="var(--accent-ink)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${dots}${lx}</svg>`;
}
function weightTrend(ws){
  if(ws.length<2) return null;
  const last = ws[ws.length-1], first = ws[0], td = todayStr(), adjAt = S.settings.adjAt;
  const lim = shift(last.d,-21), startLim = (adjAt && adjAt>lim) ? adjAt : lim;
  const base = ws.find(x=>x.d>=startLim && x!==last);
  const sinceStart = (parse(last.d)-parse(first.d))/864e5;
  if(!base) return {rate:0, days:0, tip: adjAt ? 'Hai aggiornato l\'obiettivo il '+shortDate(adjAt)+'. Servono 2 settimane di pesate prima di rivalutarlo.' : 'Servono più pesate per valutare il ritmo.', adj:null};
  const days = (parse(last.d)-parse(base.d))/864e5;
  if(days<1) return null;
  const rate = (last.kg-base.kg)/days*7, tgt = S.settings.target;
  let tip, adj = null;
  if(days<14) tip = 'Servono almeno 2 settimane di pesate per valutare il ritmo. Pesati una volta a settimana, sempre al mattino a digiuno.';
  else if(rate<=-1){ tip = 'Stai scendendo in fretta (oltre 1 kg a settimana). Per proteggere muscoli ed energia conviene aggiungere circa 150 kcal al giorno.'; if(tgt+150<=3200) adj = {delta:150, label:'Aggiungi 150 kcal'}; }
  else if(rate<=-0.25) tip = 'Ritmo giusto: continua così.';
  else {
    tip = rate<0.25 ? 'Il peso è stabile.' : 'Il peso sale.';
    if(sinceStart<20) tip += ' Con l\'inizio dell\'allenamento è normale nelle prime settimane: aspetta di avere 3 settimane di dati prima di cambiare le calorie.';
    else if(tgt-150>=1800){ tip += ' Se vuoi dimagrire, puoi togliere circa 150 kcal al giorno.'; adj = {delta:-150, label:'Togli 150 kcal'}; }
    else tip += ' L\'obiettivo è già vicino al minimo consigliato: meglio più movimento e più passi che meno cibo.';
  }
  return {rate, days, tip, adj};
}
function weeklyWeights(){
  const m = {};
  for(const x of sortedW()){ const k = shift(x.d, -dayIdx(x.d)); (m[k] = m[k] || []).push(x.kg); }
  return Object.keys(m).sort().map(ws => ({ws, n:m[ws].length, kg:m[ws].reduce((a,b)=>a+b,0)/m[ws].length}));
}
const weighedThisWeek = () => { const k = shift(todayStr(), -dayIdx(todayStr())); return weeklyWeights().some(w=>w.ws===k); };
function weeklyCard(){
  const wk = weeklyWeights(), rows = [...wk].reverse().slice(0,12);
  let h = `<section class="card"><div class="row between"><h3>Registro settimanale</h3><span class="pill num">${wk.length} ${wk.length===1?'settimana':'settimane'}</span></div>
    <p class="small muted" style="margin:6px 0 10px">Una pesata a settimana, la mattina a digiuno e nello stesso giorno. Se ne registri più di una nella stessa settimana, vedi la media.</p>
    <div class="row" style="margin-bottom:6px"><div class="grow"><label for="wday">Giorno della pesata</label><select id="wday">${DAYS_LONG.map((n,i)=>`<option value="${i}" ${(S.settings.weighDay??0)===i?'selected':''}>${n}</option>`).join('')}</select></div></div>`;
  h += rows.map((w,i)=>{
    const prev = rows[i+1], diff = prev ? w.kg-prev.kg : null, we = shift(w.ws,6);
    return `<div class="entry"><div class="grow"><div class="num" style="font-weight:600">${shortDate(w.ws)} – ${shortDate(we)}</div><div class="small muted">${w.n>1?'Media di '+w.n+' pesate':'Una pesata'}</div></div>
      <div style="text-align:right"><b class="num">${f1(w.kg)} kg</b>${diff!==null?`<div class="small num" style="color:${diff<0?'var(--ok)':diff>0?'var(--warn)':'var(--muted)'}">${diff<0?'−':diff>0?'+':''}${f1(Math.abs(diff))} kg</div>`:'<div class="small muted">Partenza</div>'}</div></div>`;
  }).join('');
  return h+`</section>`;
}
function goalCard(ws){
  const g = S.settings.goal, last = ws[ws.length-1], first = ws[0];
  let txt = '';
  if(g){
    const total = (parse(g.date)-parse(first.d))/864e5, el = (parse(todayStr())-parse(first.d))/864e5;
    const weeks = Math.max(0,(parse(g.date)-parse(todayStr()))/864e5/7), need = last.kg-g.kg;
    if(need<=0) txt = 'Obiettivo raggiunto. Se vuoi continuare, scegli un nuovo traguardo.';
    else if(weeks<=0) txt = 'La data è passata: manca ancora '+f1(need)+' kg. Scegli una nuova data.';
    else {
      const rate = need/weeks, exp = total>0 ? first.kg+(g.kg-first.kg)*Math.min(1,Math.max(0,el/total)) : last.kg, diff = last.kg-exp;
      txt = `Mancano ${f1(need)} kg in ${Math.ceil(weeks)} settimane: circa ${f1(rate)} kg a settimana. `+
        (rate>1 ? 'È un ritmo troppo veloce per farlo bene: conviene spostare la data più avanti. ' : rate<0.2 ? 'È un ritmo molto tranquillo. ' : 'È un ritmo sostenibile. ')+
        (Math.abs(diff)<0.3 ? 'Oggi sei in linea con la tua retta.' : diff<0 ? 'Oggi sei in anticipo di '+f1(-diff)+' kg rispetto alla retta.' : 'Oggi sei in ritardo di '+f1(diff)+' kg rispetto alla retta.');
    }
  }
  return `<section class="card"><h3>Obiettivo di peso</h3>
    <div class="grid2" style="margin-top:10px"><div><label for="gkg">Peso da raggiungere (kg)</label><input id="gkg" type="number" inputmode="decimal" step="0.1" min="30" max="250" value="${g?g.kg:''}" placeholder="75"></div>
    <div><label for="gdate">Entro il</label><input id="gdate" type="date" value="${g?g.date:''}" min="${todayStr()}"></div></div>
    <div class="row" style="margin-top:12px"><button class="btn pri" data-act="goalsave">Salva obiettivo</button>${g?'<button class="btn" data-act="goaldel">Rimuovi</button>':''}</div>
    ${txt?`<p class="small" style="margin:12px 0 0">${txt}</p>`:`<p class="small muted" style="margin:10px 0 0">Per esempio "75 kg entro marzo". La linea tratteggiata sul grafico è la strada ideale dal peso di partenza.</p>`}</section>`;
}
function viewProg(){
  if(!sortedW().length) return `<section class="card"><h2>Registra il primo peso</h2><div class="grid2" style="margin-top:10px"><div><label for="wkg">Peso (kg)</label><input id="wkg" type="number" inputmode="decimal" step="0.1"></div><div><label for="wdate">Data</label><input id="wdate" type="date" value="${todayStr()}"></div></div><div style="margin-top:12px"><button class="btn pri" data-act="wsave">Salva peso</button></div></section>`;
  const ws = sortedW(), first = ws[0], last = ws[ws.length-1], tr = weightTrend(ws), d = last.kg-first.kg;
  let h = `<section class="card"><div class="tag">Peso attuale</div><div class="kcal num" style="margin-top:8px">${f1(last.kg)} <span class="small muted" style="font-family:var(--font-b);font-weight:500;letter-spacing:0">kg</span></div>
    <div class="small muted" style="margin-top:6px">Partenza ${f1(first.kg)} kg · ${d===0?'nessuna variazione':(d<0?'−':'+')+f1(Math.abs(d))+' kg'}${tr?' · '+(tr.rate<0?'−':'+')+f1(Math.abs(tr.rate))+' kg a settimana':''}</div>
    <div style="margin-top:16px">${weightChart(ws)}</div></section>`;
  if(tr) h += `<div class="note">${tr.tip}${tr.adj?`<div style="margin-top:10px"><button class="btn pri sm" data-act="calapply" data-d="${tr.adj.delta}">${tr.adj.label}: nuovo obiettivo ${fmt(S.settings.target+tr.adj.delta)} kcal</button></div>`:''}</div>`;
  h += goalCard(ws);
  h += weeklyCard();
  h += `<section class="card"><h3>Registra il peso</h3><div class="grid2" style="margin-top:10px"><div><label for="wkg">Peso (kg)</label><input id="wkg" type="number" inputmode="decimal" step="0.1" min="30" max="250" placeholder="77,5"></div>
    <div><label for="wdate">Data</label><input id="wdate" type="date" value="${todayStr()}" max="${todayStr()}"></div></div>
    <div style="margin-top:12px"><button class="btn pri" data-act="wsave">Salva peso</button></div>
    <div style="margin-top:12px">${[...ws].reverse().slice(0,6).map(x=>`<div class="entry"><div class="grow num">${shortDate(x.d)}</div><b class="num">${f1(x.kg)} kg</b>${ws.length>1?`<button class="x" data-act="wdel" data-d="${x.d}" data-kg="${x.kg}" aria-label="Elimina la pesata del ${shortDate(x.d)}">Elimina</button>`:''}</div>`).join('')}</div></section>`;
  const ms = [...S.body.measures].sort((a,b)=>a.d<b.d?1:-1);
  h += `<section class="card"><h3>Misure del corpo (cm)</h3><p class="small muted" style="margin:6px 0 10px">Una volta ogni 2 settimane, sempre nello stesso punto. Compila solo quello che hai misurato.</p>
    <div class="grid2">${MEASURES.map(([k,n])=>`<div><label for="m-${k}">${n}</label><input id="m-${k}" type="number" inputmode="decimal" step="0.5" min="10" max="250"></div>`).join('')}<div><label for="mdate">Data</label><input id="mdate" type="date" value="${todayStr()}" max="${todayStr()}"></div></div>
    <div style="margin-top:12px"><button class="btn pri" data-act="msave">Salva misure</button></div>`;
  if(ms.length){
    const firstM = [...S.body.measures].sort((a,b)=>a.d<b.d?-1:1)[0];
    h += `<div style="overflow-x:auto;margin-top:14px"><table style="border-collapse:collapse;width:100%;min-width:430px;font-size:.85rem" class="num"><thead><tr><th style="text-align:left;padding:6px 4px" class="muted">Data</th>${MEASURES.map(([k,n])=>`<th style="padding:6px 4px;text-align:right" class="muted">${n}</th>`).join('')}<th></th></tr></thead><tbody>`+
      ms.slice(0,6).map(m=>`<tr style="border-top:1px solid var(--line)"><td style="padding:8px 4px">${shortDate(m.d)}</td>${MEASURES.map(([k])=>`<td style="padding:8px 4px;text-align:right">${m[k]!=null?f1(m[k]):'–'}${m[k]!=null&&firstM&&firstM!==m&&firstM[k]!=null?`<div class="small" style="color:${m[k]<firstM[k]?'var(--ok)':'var(--muted)'}">${m[k]-firstM[k]>0?'+':m[k]-firstM[k]<0?'−':''}${f1(Math.abs(m[k]-firstM[k]))}</div>`:''}</td>`).join('')}<td style="padding:8px 0 8px 4px"><button class="x" style="border:0;background:transparent;color:var(--muted)" data-act="mdel" data-id="${m.id}" aria-label="Elimina le misure del ${shortDate(m.d)}">Elimina</button></td></tr>`).join('')+`</tbody></table></div><div class="small muted" style="margin-top:6px">Sotto ogni valore c'è la differenza dalla prima misurazione.</div>`;
  }
  h += `</section><p class="small muted">Supporto organizzativo ed educativo: non sostituisce una visita da un professionista sanitario.</p>`;
  return h;
}

// ---- esami del sangue ----
function labStatus(e){
  if(e.min!=null && e.v<e.min) return ['sotto','warn'];
  if(e.max!=null && e.v>e.max) return ['sopra','warn'];
  if(e.min==null && e.max==null) return ['senza riferimento',''];
  return ['nella norma',''];
}
const refText = e => e.min!=null&&e.max!=null ? f1(e.min)+'–'+f1(e.max) : e.max!=null ? '< '+f1(e.max) : e.min!=null ? '> '+f1(e.min) : '';
function viewEsami(){
  const items = [...S.labs.items].sort((a,b)=>a.d<b.d?1:-1);
  let h = `<section class="card"><h2>Aggiungi un valore</h2><p class="small muted" style="margin:6px 0 12px">Copia i valori dal tuo referto. Ti mostro come cambiano nel tempo.</p>
    <div class="stack"><div><label for="labt">Esame</label><select id="labt">${Object.entries(LAB_TESTS).map(([k,t])=>`<option value="${k}">${t.n} (${t.u})</option>`).join('')}<option value="custom">Altro esame…</option></select></div>
    <div class="grid2"><div><label for="labv">Valore</label><input id="labv" type="number" inputmode="decimal" step="any"></div><div><label for="labd">Data del prelievo</label><input id="labd" type="date" value="${todayStr()}" max="${todayStr()}"></div></div>
    <details><summary class="small muted" style="cursor:pointer">Esame non in elenco, o valori di riferimento diversi</summary><div class="stack" style="margin-top:10px">
      <div><label for="labn">Nome (solo se "Altro esame")</label><input id="labn" type="text"></div>
      <div class="grid2"><div><label for="labu">Unità</label><input id="labu" type="text" placeholder="mg/dL"></div><div></div><div><label for="labmin">Minimo di riferimento</label><input id="labmin" type="number" inputmode="decimal" step="any"></div><div><label for="labmax">Massimo di riferimento</label><input id="labmax" type="number" inputmode="decimal" step="any"></div></div></div></details>
    <button class="btn pri" data-act="labsave">Salva valore</button></div></section>`;
  if(!items.length) h += `<div class="note">Non hai ancora inserito esami. Se non ne hai, va bene: un controllo con esami del sangue dal medico di base è comunque utile prima di cambiare alimentazione e iniziare la palestra.</div>`;
  const names = [...new Set(items.map(x=>x.t))];
  for(const n of names){
    const rows = items.filter(x=>x.t===n), cur = rows[0], [st,cls] = labStatus(cur);
    h += `<section class="card"><div class="row between"><h3>${esc(n)}</h3><span class="pill ${cls}">${st}</span></div>
      <div class="row" style="align-items:baseline;margin-top:6px"><span class="kcal num" style="font-size:1.8rem">${f1(cur.v)}</span><span class="small muted">${esc(cur.u||'')}</span><span class="grow"></span><span class="small muted num">${refText(cur)?'Riferimento '+refText(cur):''}</span></div>`+
      rows.map(x=>`<div class="entry"><div class="grow num small">${shortDate(x.d)} ${parse(x.d).getFullYear()}</div><b class="num">${f1(x.v)}</b><button class="x" data-act="labdel" data-id="${x.id}" aria-label="Elimina il valore del ${shortDate(x.d)}">Elimina</button></div>`).join('')+`</section>`;
  }
  h += `<p class="small muted">I valori di riferimento sono indicativi per un maschio adulto: fa fede quello scritto sul tuo referto. Se un valore è fuori dall'intervallo, parlane con il medico: l'app registra i numeri e non interpreta gli esami.</p>`;
  return h;
}

// ---- assistente ----
const esc2 = t => esc(t).replace(/\n/g,'<br>');
function chatHTML(){
  const m = chatMsgs();
  let h = '';
  if(!m.length && !S.chatBusy){
    h += `<div class="card"><h2>Chiedimi quello che vuoi</h2><p class="muted" style="margin:6px 0 12px">Scrivi in modo naturale, anche con una foto del piatto o della scheda. Posso segnare quello che mangi o bevi calcolando le calorie, cambiare un pasto del menù, aggiornare l'obiettivo, inserire la scheda, il peso, le misure o un esame.</p>
      <div class="stack" style="gap:8px">${['Ieri sera ho mangiato una pizza margherita e due birre medie, segnalo','Sostituisci la cena di martedì con qualcosa di più leggero','Mercoledì: panca 4x8, squat 4x10, rematore 3x12','Oggi peso 77,5 kg','Come sto andando questa settimana?'].map(t=>`<button class="btn" style="text-align:left" data-act="chatsug" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>`;
  }
  for(const x of m) h += `<div class="bub ${x.role==='user'?'me':'ai'}">${esc2(x.content)}</div>`;
  if(S.chatBusy && S.chatBusyId===S.chat.cur) h += `<div class="bub ai">${S.chatLive?esc2(S.chatLive):'<span class="muted">Sto pensando…</span>'}</div>`;
  return h;
}
function chatHistHTML(){
  const ts = S.chat.threads;
  const fm = t => { const d = new Date(t); return d.getDate()+' '+MONTHS[d.getMonth()]+' '+pad(d.getHours())+':'+pad(d.getMinutes()); };
  return `<section class="card"><div class="row between"><h2>Cronologia</h2><button class="btn sm" data-act="chathist">Chiudi</button></div>`+
    (ts.length ? ts.map(t=>`<div class="entry"><button class="foodrow" style="border:0;padding:0" data-act="chatopen" data-id="${t.id}"><span style="font-weight:500">${esc(t.title||'Conversazione')}</span><span class="muted small num">${fm(t.t)} · ${t.msgs.length}</span></button><button class="x" data-act="chatdel" data-id="${t.id}" aria-label="Elimina la conversazione">Elimina</button></div>`).join('') : '<p class="muted" style="margin:10px 0 0">Nessuna conversazione salvata.</p>')+`</section>`;
}
function viewAssist(){
  if(!S.sample){
    if(AI.mode()==='proxy') return `<div class="card"><h2>Assistente</h2><p class="muted" style="margin:6px 0 12px">Per usarlo serve il <b>codice amici</b> che ti ha dato chi ti ha mandato l'app.</p>
      <label for="aicode">Codice amici</label><input id="aicode" type="text" autocomplete="off" autocapitalize="off" spellcheck="false">
      <div style="margin-top:12px"><button class="btn pri" data-act="aicodesave">Attiva l'assistente</button></div>${S.aiMsg?`<p class="small" style="margin:10px 0 0;color:var(--warn)">${esc(S.aiMsg)}</p>`:''}</div>`;
    return `<div class="card"><h2>Attiva l'assistente</h2><p class="muted" style="margin:6px 0 12px">Scrivi in modo naturale e l'assistente segna cosa mangi calcolando le calorie, cambia il menù, inserisce peso, misure, esami e la scheda, e legge le foto di piatti e schede. Usa Claude Haiku e si paga a consumo con una tua chiave: di solito centesimi al mese.</p>
      <ol class="small" style="margin:0 0 12px;padding-left:20px;display:grid;gap:6px"><li>Vai su <b>console.anthropic.com</b>, crea un account e compra un piccolo credito.</li><li>Lascia spenta la ricarica automatica: il massimo che spendi è il credito caricato.</li><li>In <i>API keys</i> crea una chiave e incollala qui sotto.</li></ol>
      <label for="aikey">Chiave API</label><input id="aikey" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="sk-ant-…">
      <p class="small muted" style="margin:8px 0 0">La chiave resta solo su questo telefono: non viene mai inclusa nelle copie di sicurezza né nei report.</p>
      <div style="margin-top:12px"><button class="btn pri" data-act="aikeysave">Attiva l'assistente</button></div>${S.aiMsg?`<p class="small" style="margin:10px 0 0;color:var(--warn)">${esc(S.aiMsg)}</p>`:''}</div>`;
  }
  const imgOk = !!S.imgLimits, acc = imgOk ? S.imgLimits.mediaTypes.join(',') : '';
  const top = `<div class="row" style="margin-bottom:12px"><button class="btn sm" data-act="chatnew" ${S.chatBusy?'disabled':''}>Nuova chat</button><button class="btn sm" data-act="chathist">Cronologia${S.chat.threads.length?' ('+S.chat.threads.length+')':''}</button><span class="grow"></span>${chatMsgs().length?'<button class="btn sm ghost" data-act="chatcopy">Copia la conversazione</button>':''}</div>`;
  if(S.chatView==='hist') return top + chatHistHTML();
  return top + `<div id="chatlog">${chatHTML()}</div>
    ${S.chatImg?`<div class="row" style="margin-top:6px"><img src="${S.chatImg.url}" alt="Foto allegata" style="height:52px;width:52px;object-fit:cover;border-radius:12px"><span class="small grow">Foto allegata</span><button class="x" style="border:0;background:transparent;color:var(--muted)" data-act="chatimgdel">Togli</button></div>`:''}
    <form id="chatform" class="chatbar" autocomplete="off">${imgOk?`<button type="button" class="circ" style="width:46px;height:46px;background:var(--surface)" data-act="chatattach" aria-label="Allega una foto" ${S.chatBusy?'disabled':''}>${ICON.clip}</button><input id="chatfile" type="file" accept="${acc}" hidden>`:''}<input id="chatin" type="text" placeholder="${S.chatImg?'Aggiungi un commento (facoltativo)':'Scrivi qui…'}" aria-label="Messaggio per l'assistente" value="${esc(S.chatDraft)}" ${S.chatBusy?'disabled':''}>
    ${S.chatBusy?`<button type="button" class="btn" data-act="chatstop">Stop</button>`:`<button class="plus" style="width:46px;height:46px" aria-label="Invia">${ICON.send}</button>`}</form>
    <p class="small muted" style="margin:8px 4px 0"><button class="x" style="border:0;background:transparent;color:var(--muted);padding:0;text-decoration:underline" data-act="${AI.mode()==='proxy'?'aicodereset':'aikeyreset'}">${AI.mode()==='proxy'?'Cambia codice':'Rimuovi la chiave'}</button> · Spesa stimata questo mese: ${usageCost()<0.01?'meno di 1 centesimo':'circa $'+usageCost().toFixed(2).replace('.',',')}<br><label for="aimodel" style="display:inline;margin:0">Modello</label> <select id="aimodel" style="width:auto;min-height:34px;padding:4px 8px">${Object.entries(CONFIG.models).map(([k,m])=>`<option value="${k}" ${(S.settings.aiModel||'haiku')===k?'selected':''}>${m.label}</option>`).join('')}</select><br>L'assistente stima le calorie: sono valori indicativi. Non sostituisce una visita da un professionista sanitario.</p>`;
}
