// ---- icone ----
const ICON = {
  menu:'<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
  cal:'<svg viewBox="0 0 24 24"><path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.2 1 2 2 2-.5-3 0-6 1-8z"/></svg>',
  spesa:'<svg viewBox="0 0 24 24"><path d="M5 7h14l-1.5 11a2 2 0 0 1-2 1.7h-7a2 2 0 0 1-2-1.7L5 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
  prep:'<svg viewBox="0 0 24 24"><path d="M4 11h16v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6z"/><path d="M8 11V8M12 11V6M16 11V8M2 11h20"/></svg>',
  allena:'<svg viewBox="0 0 24 24"><path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/></svg>',
  sun:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>',
  cup:'<svg viewBox="0 0 24 24"><path d="M5 8h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8z"/><path d="M16 9h2a2 2 0 0 1 0 5h-2M8 4v1.5M11 4v1.5"/></svg>',
  fork:'<svg viewBox="0 0 24 24"><path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-2.5 5-2.5 8h2.5v10"/></svg>',
  clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>',
  moon:'<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>',
  drop:'<svg viewBox="0 0 24 24"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11z"/></svg>',
  bolt:'<svg viewBox="0 0 24 24"><path d="M13 3 5 13h6l-1 8 8-10h-6l1-8z"/></svg>',
  left:'<svg viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg>',
  right:'<svg viewBox="0 0 24 24"><path d="m10 6 6 6-6 6"/></svg>',
  plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  minus:'<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
  check:'<svg viewBox="0 0 24 24"><path d="m5 12.5 4.500 4.500L19 7.500"/></svg>',
  spark:'<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800L12 3zM18 15l.8 2.200L21 18l-2.200.8L18 21l-.8-2.200L15 18l2.200-.8L18 15z"/></svg>',
  scale:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.500 9.500A5 5 0 0 1 15.500 9.500M12 12l2-2"/></svg>',
  flask:'<svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.800 3h10.400A2 2 0 0 0 19 18l-5-9V3M7.500 15h9"/></svg>',
  send:'<svg viewBox="0 0 24 24"><path d="M5 12 20 5l-4 14-3.500-5.500L5 12z"/></svg>',
  clip:'<svg viewBox="0 0 24 24"><path d="M20 11.500 12 19.500a5 5 0 0 1-7-7l8.500-8.500a3.500 3.500 0 0 1 5 5L10 17.500a2 2 0 0 1-3-3l7.500-7.500"/></svg>',
  cam:'<svg viewBox="0 0 24 24"><path d="M4 8h3l1.500-2h7L17 8h3v11H4V8z"/><circle cx="12" cy="13" r="3.500"/></svg>',
  report:'<svg viewBox="0 0 24 24"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>',
  bell:'<svg viewBox="0 0 24 24"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.500 2h-15L6 17zM10 21h4"/></svg>',
  user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6"/></svg>',
  today:'<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/><circle cx="12" cy="15" r="1.2"/></svg>'
};
const SLOT_ICON = {colazione:['t1','sun'], spuntino:['t2','cup'], pre:['t1','bolt'], post:['t3','allena'], pranzo:['t3','fork'], merenda:['t5','clock'], cena:['t4','moon']};
const PAGES = [
  {id:'menu', n:'Menù', sub:'Il piano di ogni giorno', ic:'menu'},
  {id:'cal', n:'Calorie', sub:'Il tuo diario', ic:'cal'},
  {id:'sett', n:'Riepilogo settimana', sub:'Come sta andando', ic:'report'},
  {id:'spesa', n:'Spesa', sub:'La lista della settimana', ic:'spesa'},
  {id:'prep', n:'Cosa preparare', sub:'Meal prep e conservazione', ic:'prep'},
  {id:'allena', n:'Allenamento', sub:'Giorni, scheda e carichi', ic:'allena'},
  {id:'prog', n:'Peso e misure', sub:'I tuoi progressi', ic:'scale'},
  {id:'esami', n:'Esami del sangue', sub:'I tuoi valori nel tempo', ic:'flask'},
  {id:'prof', n:'Il mio profilo', sub:'Dati personali e preferenze', ic:'user'},
  {id:'dati', n:'Promemoria e dati', sub:'Calendario ed esportazione', ic:'bell'},
  {id:'assist', n:'Assistente', sub:'Chiedi o modifica con una frase', ic:'spark'}
];
const MONTHS_LONG = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const WATER_GLASS_ML = 250, WATER_TARGET = 11; // 11 bicchieri = 2,75 L

// ---- viste ----
const weekStart = s => shift(s, -dayIdx(s));
function dateLabel(s){
  const d=parse(s), i=dayIdx(s);
  return (s===todayStr()?'Oggi, ':'')+DAYS_LONG[i]+' '+d.getDate()+' '+MONTHS[d.getMonth()];
}
const sumEntries = es => es.reduce((a,e)=>({k:a.k+e.k,p:a.p+e.p,c:a.c+e.c,f:a.f+e.f}),{k:0,p:0,c:0,f:0});
const isTrain = di => S.settings.train.includes(di);
// allenamento di una data: la variazione del giorno (se c'è) vale più del programma
const trainOn = date => { const dd = S.days[date]; return (dd && typeof dd.train==='boolean') ? dd.train : isTrain(dayIdx(date)); };
const daySlots = (di, date) => slotsFor((date ? trainOn(date) : isTrain(di)) ? [di] : [], di);
function planTotals(day, date){
  const t={k:0,p:0,c:0,f:0};
  for(const sid of daySlots(day, date)){ const m=mealOf(day,sid); if(m){ const x=mealMacros(m); t.k+=x.k;t.p+=x.p;t.c+=x.c;t.f+=x.f; } }
  return t;
}
const targets = (date) => {
  const base = S.settings.target || TARGET_KCAL;
  const k = base + (trainOn(date||S.date) ? trainBonus() : 0), P = pTarget(), Fa = fTarget();
  return {k, base, p:P, f:Fa, c:Math.max(0,(k - 4*P - 9*Fa)/4)};
};
const litres = g => String(Math.round(g*WATER_GLASS_ML/100)/10).replace('.',',');

function calendarCard(){
  const ws = weekStart(S.date), td = todayStr(), d0 = parse(S.date);
  const letters = ['L','M','M','G','V','S','D'];
  return `<section class="card cal" aria-label="Calendario"><div class="hd"><h2>${MONTHS_LONG[d0.getMonth()]} ${d0.getFullYear()}</h2>
    <div class="wrow"><button class="circ" data-act="wprev" aria-label="Settimana precedente">${ICON.left}</button><button class="circ" data-act="wnext" aria-label="Settimana successiva">${ICON.right}</button></div></div>
    <div class="week" role="tablist" aria-label="Giorni della settimana">`+letters.map((n,i)=>{
      const d = shift(ws,i), on = d===S.date;
      return `<button class="wd ${on?'on':''} ${d===td?'today':''} ${trainOn(d)?'tr':''}" data-act="pickday" data-d="${d}" role="tab" aria-selected="${on}" aria-label="${DAYS_LONG[i]} ${parse(d).getDate()}"><span class="n">${n}</span><span class="d num">${parse(d).getDate()}</span></button>`;
    }).join('')+`</div></section>`;
}

function recipeHTML(sid, idx, m, di){
  if(!m || (di>=5 && sid==='cena' && CFG.eatOut)) return '';
  const r = REC[recKey(sid, idx)]; if(!r) return '';
  return `<details style="margin:0 0 12px"><summary class="small" style="cursor:pointer;color:var(--accent-ink);font-weight:600">Come si prepara${r[0]?' · '+r[0]+' min':''}</summary><ol class="small" style="margin:8px 0 0;padding-left:20px;display:grid;gap:6px">${r[1].map(x=>`<li>${esc(x)}</li>`).join('')}</ol></details>`;
}
function viewMenu(){
  const di = dayIdx(S.date), we = di>=5, day = S.days[S.date], T = targets(), P = planTotals(di, S.date), tr = trainOn(S.date);
  const eaten = day ? sumEntries(day.entries) : null;
  const ratio = eaten && T.k>0 ? eaten.k/T.k : 0, over = eaten && eaten.k>T.k;
  const C = 2*Math.PI*38;
  const water = day ? (day.water||0) : 0;
  let h = `<section class="hero" aria-label="Calorie del giorno"><div class="grow"><div class="lab"><i>${ICON.bolt}</i>Calorie di oggi</div>
      <div class="big num">${eaten?fmt(eaten.k):'–'}</div><div class="of num">su ${fmt(T.k)} kcal</div>
      <div class="small" style="margin-top:8px;font-weight:600;${over?'color:var(--warn)':''}">${eaten?(over?fmt(eaten.k-T.k)+' kcal oltre l\'obiettivo':'Ne restano '+fmt(T.k-eaten.k)):'&nbsp;'}</div>
      <div class="small muted">Menù previsto: <span class="num">${fmt(P.k)}</span> kcal</div></div>
    <div class="ringbox"><svg viewBox="0 0 96 96"><circle cx="48" cy="48" r="38" fill="none" stroke="var(--surface)" stroke-width="10"/>
      <circle class="ring-v" cx="48" cy="48" r="38" fill="none" stroke="${over?'var(--warn)':'var(--accent-ink)'}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C*Math.min(ratio,1)} ${C}"/></svg>
      <div class="c"><span class="num">${Math.round(ratio*100)}%</span><small>obiettivo</small></div></div></section>`;
  h += `<div class="minis"><div class="mini"><div class="top"><span class="small muted">Proteine</span><span class="tile t4" style="width:34px;height:34px;border-radius:11px">P</span></div>
      <div class="v num">${eaten?fmt(eaten.p):'–'} <small>/ ${T.p} g</small></div><div class="mbar"><i style="width:${eaten?Math.min(100,eaten.p/T.p*100):0}%;background:var(--mp)"></i></div></div>
    <div class="mini"><div class="top"><span class="small muted">Acqua</span><span class="tile t4" style="width:34px;height:34px;border-radius:11px">${ICON.drop}</span></div>
      <div class="v num">${litres(water)} <small>L · ${water}/${WATER_TARGET}</small></div>
      <div class="wrow" style="margin-top:8px"><button class="circ" data-act="water-" aria-label="Togli un bicchiere">${ICON.minus}</button><button class="plus" style="width:34px;height:34px" data-act="water+" aria-label="Aggiungi un bicchiere">${ICON.plus}</button><span class="small muted">bicchiere 250 ml</span></div></div></div>`;
  h += calendarCard();
  const prog = isTrain(di), varied = tr!==prog;
  h += `<section class="card row between" style="padding:14px 16px"><div class="grow"><div style="font-weight:700;font-family:var(--font-d)">${tr?'Giorno di allenamento':'Giorno di riposo'}</div>
    <div class="small muted">${varied?'Variazione per questo giorno. Da programma: '+(prog?'ti alleni':'riposo'):(tr?'Obiettivo +'+trainBonus()+' kcal rispetto ai giorni normali':'Da programma')}</div></div>
    <button class="btn sm" data-act="trainday">${varied?'Torna al programma':(tr?'Oggi non mi alleno':'Oggi mi alleno')}</button></section>`;
  if(we && CFG.eatOut) h += `<div class="note">Nel weekend la cena è fuori: i valori sono stime per una porzione tipica. Pranzo e spuntini restano più leggeri, così ti godi la cena senza compensare dopo.</div>`;
  const ci = (day && day.ci) || {};
  h += `<section class="card"><h3>Come stai oggi?</h3>
    <div class="row between" style="margin-top:10px"><span class="small muted">Sonno</span><div class="wrow"><button class="circ" data-act="sleep-" aria-label="Meno ore di sonno">${ICON.minus}</button><b class="num" style="min-width:64px;text-align:center">${ci.sleep!=null?String(ci.sleep).replace('.',',')+' ore':'–'}</b><button class="circ" data-act="sleep+" aria-label="Più ore di sonno">${ICON.plus}</button></div></div>
    <div style="margin-top:12px"><div class="small muted" style="margin-bottom:6px">Energia (1 scarico, 5 al massimo)</div><div class="chips" style="margin:0;overflow:visible">${[1,2,3,4,5].map(n=>`<button class="chip ${ci.energy===n?'on':''}" data-act="energy" data-n="${n}" aria-pressed="${ci.energy===n}">${n}</button>`).join('')}</div></div>
    <div style="margin-top:6px"><div class="small muted" style="margin-bottom:6px">Stress (1 tranquillo, 5 alto)</div><div class="chips" style="margin:0;overflow:visible">${[1,2,3,4,5].map(n=>`<button class="chip ${ci.stress===n?'on':''}" data-act="stress" data-n="${n}" aria-pressed="${ci.stress===n}">${n}</button>`).join('')}</div></div></section>`;
  h += `<div class="row between" style="margin:6px 4px 10px"><h2>Pasti di ${DAYS_LONG[di].toLowerCase()}</h2><button class="btn sm" data-act="go" data-p="cal">Diario</button></div>`;
  for(const sid of daySlots(di, S.date)){
    const s = {id:sid, n:SLOT_DEF[sid]};
    const pool = poolFor(di,s.id), idx = curPlan()[di][s.id], m = idx>=0 ? mealOf(di, s.id, S.date) : null, f = dayScale(di, S.date);
    const skippable = s.id==='merenda' || s.id==='spuntino' || s.id==='post' || s.id==='pre';
    const okIdx = (s.id==='cena' && di>=5 && CFG.eatOut) || s.id==='pre' ? pool.map((_,i)=>i) : (allowedMap((S.settings.profile||{}).excl)[s.id] || pool.map((_,i)=>i));
    const opts = (skippable?`<option value="-1" ${idx<0?'selected':''}>Salta questo pasto</option>`:'') +
      pool.map((p,i)=>[p,i]).filter(([p,i])=>i===idx || okIdx.includes(i)).map(([p,i])=>`<option value="${i}" ${i===idx?'selected':''}>${esc(p.n)} (${fmt(mealMacros(scaledMeal(p,f)).k)} kcal)</option>`).join('');
    const x = m ? mealMacros(m) : null;
    const logged = day && day.entries.find(e=>e.plan===s.id);
    const time = slotTime(s.id, tr, we);
    const [tc,ic] = SLOT_ICON[s.id];
    const ht = tr ? trainHint(s.id) : ''; const hint = ht ? `<p class="small muted" style="margin:0 0 4px">${ht}</p>` : '';
    h += `<details class="mrow ${logged?'is-done':''}"><summary><span class="tile ${tc}">${ICON[ic]}</span>
      <div class="grow"><div class="mt">${we&&s.id==='cena'&&CFG.eatOut?'Cena fuori':s.n}<span class="time num">${time}</span></div><div class="mn">${m?esc(m.n):'Saltato'}</div></div>
      ${x?`<div class="kc"><b class="num">${fmt(x.k)}</b><span>kcal</span></div>`:''}
      ${m?(logged?`<button class="plus is-on" data-act="unmark" data-slot="${s.id}" aria-label="Segnato come mangiato, tocca per annullare">${ICON.check}</button>`:`<button class="plus" data-act="mark" data-slot="${s.id}" aria-label="Segna come mangiato">${ICON.plus}</button>`):''}</summary>
      <div class="mbody">${hint}
      ${m&&m.i?`<ul class="ing">${m.i.map(([id,g])=>`<li><span>${esc(foodName(id))}</span><span class="num">${g} ${F[id].unit||'g'}</span></li>`).join('')}</ul>`:''}
      ${m&&m.fixed&&s.id!=='pre'?'<p class="small muted" style="margin:6px 0 10px">Stima per una porzione al ristorante.</p>':''}
      ${recipeHTML(s.id, idx, m, di)}
      <label for="sw-${s.id}">Cambia con un'alternativa</label><select id="sw-${s.id}" data-act="swap" data-slot="${s.id}">${opts}</select></div></details>`;
  }
  const cyc = S.settings.cycle||4;
  h += `<section class="card" style="margin-top:14px"><h3>Rotazione dei menù</h3><p class="small muted" style="margin:6px 0 10px">Stai guardando il menù ${weekIdxOf(S.date)+1} di ${cyc}. I menù si alternano ogni settimana, per non mangiare sempre le stesse combinazioni.</p>
    <div class="chips" style="flex-wrap:wrap;overflow:visible">${[1,2,3,4].map(n=>`<button class="chip ${cyc===n?'on':''}" data-act="cycle" data-n="${n}" aria-pressed="${cyc===n}">${n===1?'Sempre uguale':n+' settimane'}</button>`).join('')}</div></section>
  ${ringsCard(day, S.date)}
  <p class="small muted" style="margin:14px 4px 0">Tocca un pasto per vedere ingredienti e alternative. Pesi a crudo e al netto degli scarti. Spezie, limone, aceto ed erbe aromatiche sono a volontà.</p>`;
  return h;
}

function weekChart(){
  const ws = weekStart(S.date), T = targets(), MAXP = 120;
  let cols = '';
  for(let i=0;i<7;i++){
    const d = shift(ws,i), dd = S.days[d], k = dd ? sumEntries(dd.entries).k : 0;
    const pct = targets(d).k>0 ? k/targets(d).k*100 : 0, hp = Math.min(pct,MAXP)/MAXP*100, on = d===S.date;
    cols += `<button class="col ${on?'on':''}" data-act="pickday" data-d="${d}" aria-label="${DAYS_LONG[i]}: ${fmt(k)} kcal"><div class="trk">
      <div class="goal" style="bottom:${100/MAXP*100}%"></div>
      ${k>0?`<div class="fill" style="height:${hp}%"></div><span class="pct num" style="bottom:calc(${hp}% + 4px)">${Math.round(pct)}%</span>`:''}</div><span class="dn">${DAYS[i]}</span></button>`;
  }
  return `<div class="chart" role="group" aria-label="Calorie della settimana in percentuale dell'obiettivo">${cols}</div><div class="small muted" style="margin-top:10px">La linea tratteggiata è l'obiettivo di ${fmt(T.k)} kcal.</div>`;
}

function viewCal(){
  const day = S.days[S.date];
  let h = calendarCard();
  if(!day) return h + '<div class="card muted">Carico i dati…</div>';
  const T = targets(), tot = sumEntries(day.entries), left = T.k - tot.k, over = left<0, water = day.water||0;
  h += `<section class="card"><div class="row between" style="align-items:flex-start"><div><div class="tag">${dateLabel(S.date)}</div><div class="kcal num" style="margin-top:8px">${fmt(tot.k)} <span class="small muted" style="font-family:var(--font-b);font-weight:500;letter-spacing:0">kcal</span></div></div>
    <div style="text-align:right"><div class="small muted">Obiettivo</div><b class="num">${fmt(T.k)} kcal</b><div class="small ${over?'':'muted'}" style="${over?'color:var(--warn);font-weight:600':''}">${over?fmt(-left)+' oltre':fmt(left)+' disponibili'}</div></div></div>${weekChart()}</section>`;
  const mc = (lab,val,max,col,tile,txt) => `<div class="mini"><div class="top"><span class="small muted">${lab}</span><span class="tile ${tile}" style="width:34px;height:34px;border-radius:11px">${txt}</span></div>
    <div class="v num">${fmt(val)} <small>/ ${fmt(max)} g</small></div><div class="mbar"><i style="width:${max>0?Math.min(100,val/max*100):0}%;background:${col}"></i></div></div>`;
  h += `<div class="cgrid">${mc('Proteine',tot.p,T.p,'var(--mp)','t4','P')}${mc('Carboidrati',tot.c,T.c,'var(--mc)','t1','C')}${mc('Grassi',tot.f,T.f,'var(--mf)','t2','G')}
    <div class="mini"><div class="top"><span class="small muted">Acqua</span><span class="tile t3" style="width:34px;height:34px;border-radius:11px">${ICON.drop}</span></div><div class="v num">${litres(water)} <small>L</small></div>
    <div class="wrow" style="margin-top:8px"><button class="circ" data-act="water-" aria-label="Togli un bicchiere">${ICON.minus}</button><button class="plus" style="width:34px;height:34px" data-act="water+" aria-label="Aggiungi un bicchiere">${ICON.plus}</button></div></div></div>`;
  let diary = '';
  const groups = [...SLOTS.map(s=>({id:s.id,n:s.n})), {id:'altro',n:'Fuori pasto'}];
  for(const g of groups){
    const items = day.entries.filter(e => (e.slot||'altro')===g.id);
    if(!items.length) continue;
    diary += `<div class="tag" style="margin:14px 0 2px">${g.n}</div>`;
    for(const e of items){
      diary += `<div class="entry"><div class="grow"><div style="font-weight:500">${esc(e.name)}</div><div class="small muted num">${e.g?fmt(e.g)+' '+(e.u||'g')+' · ':''}${fmt(e.k)} kcal · P ${fmt(e.p)} · C ${fmt(e.c)} · G ${fmt(e.f)}</div></div>
        <div class="stack" style="gap:2px;align-items:flex-end"><button class="x" data-act="favadd" data-id="${e.id}" aria-label="Salva ${esc(e.name)} tra i preferiti">Preferito</button><button class="x" data-act="del" data-id="${e.id}" aria-label="Elimina ${esc(e.name)}">Elimina</button></div></div>`;
    }
  }
  h += `<section class="card"><div class="row between"><h2>Diario</h2><div class="wrow"><button class="btn sm" data-act="opencopy">Copia da un giorno</button><button class="btn pri" data-act="openadd">Aggiungi</button></div></div>${diary||'<p class="muted" style="margin:10px 0 0">Registra ciò che mangi con "Aggiungi", oppure con il + nei pasti del Menù.</p>'}</section>`;
  h += `<section class="card"><h3>Obiettivo giornaliero</h3><div class="row" style="margin-top:10px"><div class="grow"><label for="tgt">Calorie nei giorni normali (kcal)</label><input id="tgt" type="number" inputmode="numeric" min="1200" max="4500" value="${T.base}"></div></div>
    <p class="small muted" style="margin:10px 0 0">Nei giorni di allenamento si aggiungono ${trainBonus()} kcal. Proteine ${T.p} g, grassi ${T.f} g, il resto in carboidrati. Il valore iniziale (circa 2.050 kcal) è una stima: dopo 3 settimane lo verifichiamo con il tuo peso.</p></section>`;
  return h;
}

