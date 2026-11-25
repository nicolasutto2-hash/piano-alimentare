// ---- profilo, calorie, porzioni, schermata iniziale ----
const ACT = {
  sed:{n:'Sedentaria', d:'Studio o lavoro seduto, pochi spostamenti', f:1.3},
  light:{n:'Leggermente attiva', d:'Qualche spostamento a piedi durante il giorno', f:1.45},
  active:{n:'Attiva', d:'Spesso in piedi o in movimento', f:1.6},
  very:{n:'Molto attiva', d:'Lavoro fisico o moltissimo movimento', f:1.75}
};
const SPORTS = {palestra:{n:'Palestra', met:5}, calcio:{n:'Calcio', met:8}, corsa:{n:'Corsa', met:9.5}, nuoto:{n:'Nuoto', met:7}, ciclismo:{n:'Ciclismo', met:7.5}, altro:{n:'Altro sport', met:6}};
const GOALS = {lose:'Perdere peso', recomp:'Definirmi', maintain:'Mantenere il peso', gain:'Mettere massa'};
const EXCL = {formaggi:['ricotta'], pesce:['tonno','pesce'], uova:['uova','albume'], fruttasecca:['fsecca','arachidi'], carne:['pollo','tacchino','manzo','prosciutto','tacarr']};
const LACTOSE = ['yogurt','ricotta','latte'], GLUTEN = ['pasta','pane','avena','cereali','piadina','soia'];
const clampN = (x,a,b) => Math.min(b, Math.max(a, x));

function newProfile(){
  return {name:'', sex:'', age:'', height:'', weight:'', goal:'lose', activity:'sed', sport:'palestra', trainDays:[0,2,4], trainWhen:'mattina', trainTime:'09:00', trainMin:60,
    powder:false, snacks:true, eatOut:true, excl:{}, veg:false, fruit:false};
}
function calcPlan(p){
  const w = +p.weight, h = +p.height, a = +p.age;
  const bmr = 10*w + 6.25*h - 5*a + (p.sex==='F' ? -161 : 5), tdee = bmr*(ACT[p.activity]||ACT.sed).f;
  const bmi = w/Math.pow(h/100,2), minor = a<18;
  let goal = p.goal, note = '';
  if(goal==='lose' && minor){ goal = 'maintain'; note = 'Sotto i 18 anni non propongo un piano per dimagrire: questo piano mantiene il peso, e per un obiettivo diverso conviene parlarne con un medico.'; }
  else if(goal==='lose' && bmi<18.5){ goal = 'maintain'; note = 'Il tuo peso è già basso per la tua altezza: non propongo un piano per dimagrire. Se ti preoccupa, parlane con un medico.'; }
  let adj = 0;
  if(goal==='lose') adj = -clampN(tdee*0.15, 250, 500);
  else if(goal==='gain') adj = clampN(tdee*0.1, 200, 350);
  let base = tdee + adj;
  if(goal==='lose') base = Math.max(base, p.sex==='F' ? 1500 : 1800);
  base = Math.round(base/50)*50;
  const sp = SPORTS[p.sport] || SPORTS.altro;
  const bonus = clampN(Math.round(((sp.met-1)*w*((+p.trainMin||60)/60)*0.6)/50)*50, 100, 500);
  return {bmr:Math.round(bmr), tdee:Math.round(tdee), target:base, trainBonus:bonus, p:Math.round(w*((p.trainDays||[]).length>=2?1.8:1.5)), f:Math.round(w*0.9), note, goalUsed:goal, bmi:Math.round(bmi*10)/10};
}
function applyCfg(p){
  const ex = p.excl || {};
  CFG.noCheese = !!ex.formaggi;
  CFG.eatOut = p.eatOut!==false;
  CFG.trainMode = (p.trainWhen==='mattina' && toMin(p.trainTime||'09:00')<12*60) ? 'mattina' : 'sera';
  CFG.powder = !!p.powder && CFG.trainMode==='mattina';
  CFG.snacks = p.snacks!==false;
  CFG.lactoseFree = !!ex.lattosio; CFG.glutenFree = !!ex.glutine;
  CFG.veg = !!p.veg; CFG.fruit = !!p.fruit;
}
function allowedMap(ex){
  const bad = new Set();
  for(const k of Object.keys(EXCL)) if(ex && ex[k]) EXCL[k].forEach(x=>bad.add(x));
  const m = {};
  for(const slot of ['colazione','spuntino','post','pranzo','merenda','cena'])
    m[slot] = POOLS[slot].map((_,i)=>i).filter(i => !(POOLS[slot][i].i||[]).some(([id])=>bad.has(id)));
  return m;
}
function fewOptions(ex){
  const m = allowedMap(ex), few = [];
  for(const [slot,n] of [['colazione','colazione'],['pranzo','pranzo'],['cena','cena']]) if(m[slot].length<2) few.push(n);
  return few;
}
function foodName(id){
  const n = F[id].n;
  if(CFG.lactoseFree && LACTOSE.includes(id)) return n+' (senza lattosio)';
  if(CFG.glutenFree && GLUTEN.includes(id)) return id==='soia' ? 'Tamari (senza glutine)' : n+' (senza glutine)';
  return n;
}

// ---- orari e testi che dipendono dal profilo ----
const toMin = s => { const [h,m] = String(s||'00:00').split(':').map(Number); return (h||0)*60+(m||0); };
const hm = n => { n = ((Math.round(n)%1440)+1440)%1440; return pad(Math.floor(n/60))+':'+pad(n%60); };
function slotTime(slot, tr, we){
  const pr = S.settings.profile || {}, tt = toMin(pr.trainTime||'18:00'), dur = +pr.trainMin||60;
  const base = {colazione:'07:45', spuntino:'10:30', pranzo:'12:45', merenda:'16:30', cena: we?'20:30':'20:00'};
  if(tr){
    if(CFG.trainMode==='mattina'){
      if(slot==='colazione') return hm(Math.min(toMin(base.colazione), tt-70));
      if(slot==='pre') return hm(tt-20);
      if(slot==='post') return hm(tt+dur+45);
    } else {
      if(slot==='pre') return hm(tt-90);
      if(slot==='cena') return hm(Math.max(toMin(base.cena), tt+dur+40));
    }
  }
  return base[slot] || '';
}
function trainHint(slot){
  if(slot==='pre') return (CFG.trainMode==='mattina' && CFG.powder) ? "Mescola la dose indicata sull'etichetta, circa 20-30 minuti prima dell'allenamento" : 'Spuntino leggero prima di allenarti';
  if(slot==='post') return "Entro un'ora dalla fine dell'allenamento";
  if(slot==='cena' && CFG.trainMode!=='mattina') return "Dopo l'allenamento: proteine e carboidrati";
  return '';
}
const sportLabel = () => { const s = (S.settings.profile||{}).sport; return s && SPORTS[s] ? SPORTS[s].n.toLowerCase() : 'allenamento'; };
const trainBonus = () => S.settings.trainBonus ?? 150;
const pTarget = () => S.settings.pTarget ?? TARGET_P;
const fTarget = () => S.settings.fTarget ?? TARGET_F;

// ---- porzioni adattate alle calorie di ogni giorno ----
const stripExcl = m => (!m || m.fixed || !CFG.noCheese) ? m : {...m, i:m.i.filter(([id])=>!STRIP_CHEESE.includes(id))};
// sostituisce nel piano i pasti che ora non sono permessi (tiene le altre scelte)
function repairPlans(){
  const ex = (S.settings.profile||{}).excl; if(!ex) return false;
  const allow = allowedMap(ex); let changed = false;
  for(const plan of S.settings.plans) plan.forEach((day, d) => {
    for(const slot of ['colazione','spuntino','post','pranzo','merenda','cena']){
      const idx = day[slot]; if(idx<0) continue;
      if(slot==='cena' && d>=5 && CFG.eatOut) continue;
      const list = allow[slot]; if(!list || !list.length || list.includes(idx)) continue;
      const nx = list.find(i=>i>idx); day[slot] = nx!==undefined ? nx : list[0]; changed = true;
    }
  });
  return changed;
}
function rawMeal(day, slot){
  const idx = curPlan()[day][slot]; if(idx<0) return null;
  const pool = poolFor(day, slot);
  let m = pool[idx] || (slot==='pre' ? pool[0] : null); if(!m) return null;
  if(m.fixed){ return slot==='pre' ? {...m, fixed:{k:(S.settings.preKcal ?? 10), p:0, c:0, f:0}} : m; }
  m = stripExcl(m);
  const extra = [];
  if(CFG.veg && (slot==='pranzo'||slot==='cena')) extra.push(['verdure',200]);
  if(CFG.fruit && (slot==='spuntino'||slot==='merenda'||slot==='pre')) extra.push(['frutta',150]);
  return extra.length ? {...m, i:[...m.i, ...extra]} : m;
}
function dayScale(di, date){
  const tr = date ? trainOn(date) : isTrain(di);
  const tg = (S.settings.target || TARGET_KCAL) + (tr ? trainBonus() : 0);
  let fixedK = 0, scK = 0;
  for(const sid of slotsFor(tr ? [di] : [], di)){ const m = rawMeal(di, sid); if(!m) continue; if(m.fixed) fixedK += m.fixed.k; else scK += mealMacros(m).k; }
  return scK>0 ? clampN((tg-fixedK)/scK, 0.55, 1.9) : 1;
}
const roundG = v => v<20 ? Math.max(1, Math.round(v)) : Math.round(v/5)*5;
const scaledMeal = (m, f) => (!m || m.fixed) ? m : {...m, i:m.i.map(([id,g])=>[id, roundG(g*f)])};
function mealOf(day, slot, date){ const m = rawMeal(day, slot); return (!m || m.fixed) ? m : scaledMeal(m, dayScale(day, date)); }

// ---- schermata iniziale e modifica profilo ----
const OB_STEPS = ['Chi sei', 'La tua giornata', 'Come mangi', 'Il tuo piano'];
function startOnboarding(edit){
  const p = edit && S.settings.profile ? clone(S.settings.profile) : newProfile();
  p.excl = p.excl || {}; p.trainDays = p.trainDays || [];
  S.ob = {step:0, draft:p, edit:!!edit, err:''};
}
function chipRow(k, opts, val, multi){
  return `<div class="chips" style="flex-wrap:wrap;overflow:visible;margin:0">`+opts.map(([v,n])=>{
    const on = multi ? (val||[]).includes(v) : val===v;
    return `<button type="button" class="chip ${on?'on':''}" data-act="${multi?'obmulti':'obset'}" data-k="${k}" data-v="${v}" aria-pressed="${on}">${esc(n)}</button>`;
  }).join('')+`</div>`;
}
const obField = (k, label, attrs) => `<div><label for="ob-${k}">${label}</label><input id="ob-${k}" data-ob="${k}" ${attrs||''} value="${esc(S.ob.draft[k] ?? '')}"></div>`;
function obToggle(k, label, sub){
  const v = k.startsWith('excl.') ? !!S.ob.draft.excl[k.slice(5)] : !!S.ob.draft[k];
  return `<label class="check"><input type="checkbox" data-obchk="${k}" ${v?'checked':''}><span class="grow t"><span style="font-weight:600">${label}</span>${sub?`<br><span class="small muted">${sub}</span>`:''}</span></label>`;
}
function obStepHTML(){
  const p = S.ob.draft;
  if(S.ob.step===0) return `<div class="stack">
    ${obField('name','Come ti chiami (facoltativo)','type="text" autocomplete="given-name"')}
    <div><label>Sesso biologico</label>${chipRow('sex',[['M','Uomo'],['F','Donna']],p.sex)}</div>
    <div class="grid2">${obField('age','Età','type="number" inputmode="numeric" min="14" max="99"')}${obField('height','Altezza (cm)','type="number" inputmode="numeric" min="120" max="220"')}
    ${obField('weight','Peso (kg)','type="number" inputmode="decimal" step="0.1" min="35" max="200"')}<div></div></div>
    <div><label>Il tuo obiettivo</label>${chipRow('goal',Object.entries(GOALS),p.goal)}</div></div>`;
  if(S.ob.step===1) return `<div class="stack">
    <div><label>Com'è la tua giornata, fuori dall'allenamento?</label>${chipRow('activity',Object.entries(ACT).map(([k,v])=>[k,v.n]),p.activity)}<p class="small muted" style="margin:8px 0 0">${esc(ACT[p.activity].d)}</p></div>
    <div><label>Che sport fai?</label>${chipRow('sport',Object.entries(SPORTS).map(([k,v])=>[k,v.n]),p.sport)}</div>
    <div><label>In quali giorni ti alleni?</label>${chipRow('trainDays',DAYS.map((n,i)=>[i,n]),p.trainDays,true)}</div>
    <div><label>Quando ti alleni?</label>${chipRow('trainWhen',[['mattina','Mattina'],['pomeriggio','Pomeriggio'],['sera','Sera']],p.trainWhen)}</div>
    <div class="grid2">${obField('trainTime','Ora di inizio','type="time"')}${obField('trainMin','Durata (minuti)','type="number" inputmode="numeric" min="20" max="240" step="5"')}</div>
    ${p.trainWhen==='mattina'?obToggle('powder','Prendo una polvere pre workout','Compare nel menù, nei giorni di allenamento al mattino'):''}</div>`;
  if(S.ob.step===2){
    const few = fewOptions(p.excl);
    return `<div class="stack"><div><div class="small muted" style="margin-bottom:4px">Spuntini e weekend</div>
      ${obToggle('snacks','Faccio gli spuntini','Spuntino di metà mattina e merenda del pomeriggio')}
      ${obToggle('eatOut','Il sabato e la domenica ceno fuori','La cena del weekend è una stima, non da cucinare')}</div>
    <div><div class="small muted" style="margin-bottom:4px">Cosa non puoi o non vuoi mangiare</div>
      ${obToggle('excl.lattosio','Intolleranza al lattosio','Uso latticini senza lattosio')}
      ${obToggle('excl.glutine','Celiachia o glutine','Uso pane, pasta e cereali senza glutine')}
      ${obToggle('excl.formaggi','Niente formaggi','Né ricotta né parmigiano, né derivati')}${obToggle('excl.pesce','Niente pesce')}${obToggle('excl.uova','Niente uova')}${obToggle('excl.fruttasecca','Allergia alla frutta secca')}${obToggle('excl.carne','Niente carne')}</div>
    ${few.length?`<div class="note">Con queste scelte il menù ha poche alternative a ${few.join(', ')}. Funziona lo stesso, ma sarà meno vario.</div>`:''}
    <div><div class="small muted" style="margin-bottom:4px">Verdura e frutta</div>${obToggle('veg','Aggiungi la verdura a pranzo e a cena','Circa 200 g di verdure cotte')}${obToggle('fruit','Aggiungi la frutta negli spuntini','Circa 150 g')}</div>
    <div><label for="ob-notes">Preferenze e abitudini (l'assistente le tiene a mente)</label><textarea id="ob-notes" data-ob="notes" rows="3" placeholder="Per esempio: a colazione bevo solo acqua; non mangio verdure né frutta" style="font:inherit;color:var(--fg);background:var(--surface2);border:1px solid transparent;border-radius:14px;padding:10px 12px;width:100%">${esc(p.notes||'')}</textarea></div>
    <p class="small muted">Per allergie gravi o patologie (diabete, reni, celiachia diagnosticata) segui le indicazioni del tuo medico: questa app non le sostituisce.</p></div>`;
  }
  const c = calcPlan(p);
  return `<div class="stack"><div class="hero" style="display:block"><div class="tag">Il tuo punto di partenza</div><div class="big num" style="margin-top:6px">${fmt(c.target)}<span class="of" style="font-size:1rem"> kcal al giorno</span></div>
    <div class="small muted" style="margin-top:8px">+${c.trainBonus} kcal nei giorni di allenamento · proteine ${c.p} g · grassi ${c.f} g</div></div>
    ${c.note?`<div class="note">${esc(c.note)}</div>`:''}
    <div class="card" style="box-shadow:none;background:var(--surface2)"><p class="small" style="margin:0">Il metabolismo basale stimato è circa ${fmt(c.bmr)} kcal. Con la tua giornata il consumo è circa ${fmt(c.tdee)} kcal${c.goalUsed==='lose'?', e tolgo un deficit moderato':c.goalUsed==='gain'?', e aggiungo un piccolo surplus':''}. È una stima: dopo qualche settimana di pesate l'app ti aiuta a correggerla.</p></div>
    <p class="small muted" style="margin:0">Questa app è un supporto organizzativo ed educativo e non sostituisce una visita da un professionista sanitario.</p></div>`;
}
function viewOnboarding(){
  const ob = S.ob, last = ob.step===OB_STEPS.length-1;
  let h = `<div class="app"><header class="bar-top" style="padding-top:18px"><div class="ttl"><div class="sub">${ob.edit?'Il tuo profilo':'Benvenuto'} · ${ob.step+1} di ${OB_STEPS.length}</div><h1>${OB_STEPS[ob.step]}</h1></div></header>
    <div class="bar" style="margin:0 0 14px"><i style="width:${(ob.step+1)/OB_STEPS.length*100}%"></i></div>
    <section class="card">${ob.step===0&&!ob.edit?'<p class="muted" style="margin:0 0 14px">Rispondi a poche domande: l\'app costruisce menù, porzioni e calorie per te. I tuoi dati restano su questo telefono.</p>':''}${obStepHTML()}
    ${ob.err?`<p class="small" style="color:var(--warn);margin:12px 0 0">${esc(ob.err)}</p>`:''}
    <div class="row" style="margin-top:16px">${ob.step>0?'<button class="btn" data-act="obback">Indietro</button>':ob.edit?'<button class="btn" data-act="obcancel">Annulla</button>':''}<span class="grow"></span><button class="btn pri" data-act="${last?'obfinish':'obnext'}">${last?(ob.edit?'Salva':'Crea il mio piano'):'Avanti'}</button></div></section>`;
  if(ob.step===0 && !ob.edit){
    h += `<section class="card"><h3>Hai già una copia di sicurezza?</h3><p class="small muted" style="margin:6px 0 10px">Se hai già usato l'app, ripristina i tuoi dati da un file.</p>
      <button class="btn" data-act="bkpick">Ripristina da un file</button><input id="bkfile" type="file" accept=".json,application/json" hidden>
      ${S.restore?`<div class="note" style="margin:12px 0 0">Trovati ${S.restore.sum.giorni} giorni di diario, ${S.restore.sum.pesate} pesate. <div class="row" style="margin-top:8px"><button class="btn pri sm" data-act="bkgo">Ripristina</button><button class="btn sm" data-act="bkcancel">Annulla</button></div></div>`:''}
      ${S.bkMsg?`<p class="small" style="margin:10px 0 0">${esc(S.bkMsg)}</p>`:''}</section>`;
  }
  return h+`</div>`;
}
function obValidate(){
  const p = S.ob.draft, s = S.ob.step;
  if(s===0){
    if(!p.sex) return 'Scegli il sesso biologico: serve per il calcolo delle calorie.';
    if(!(+p.age>=14 && +p.age<=99)) return "Inserisci un'età tra 14 e 99 anni.";
    if(!(+p.height>=120 && +p.height<=220)) return "Inserisci l'altezza in centimetri (tra 120 e 220).";
    if(!(+p.weight>=35 && +p.weight<=200)) return 'Inserisci il peso in chilogrammi (tra 35 e 200).';
  }
  if(s===1){
    if((p.trainDays||[]).length && !/^\d{2}:\d{2}$/.test(p.trainTime||'')) return "Inserisci l'ora di inizio dell'allenamento.";
    if((p.trainDays||[]).length && !(+p.trainMin>=20 && +p.trainMin<=240)) return 'La durata va da 20 a 240 minuti.';
  }
  return '';
}
function finishProfile(){
  const ob = S.ob, p = ob.draft, old = S.settings.profile, c = calcPlan(p);
  p.age = +p.age; p.height = +p.height; p.weight = +p.weight; p.trainMin = +p.trainMin || 60;
  if(p.trainWhen==='mattina' && toMin(p.trainTime)>=12*60) p.trainWhen = 'pomeriggio';
  const planChanged = !old || ['snacks','eatOut','trainWhen','powder'].some(k=>old[k]!==p[k]);
  const legacy = S.legacy && !old;
  S.settings.profile = p;
  applyCfg(p);
  if(!legacy){ S.settings.target = c.target; S.settings.trainBonus = c.trainBonus; S.settings.train = [...(p.trainDays||[])].sort((a,b)=>a-b); }
  S.settings.pTarget = c.p; S.settings.fTarget = c.f;
  if(!legacy && planChanged) S.settings.plans = allPlans(allowedMap(p.excl), p.snacks!==false);
  repairPlans();
  if(!old){
    S.settings.startWeek = S.settings.startWeek || shift(todayStr(), -dayIdx(todayStr()));
    if(!legacy) S.body = {weights:[{d:todayStr(), kg:p.weight}], measures:[], checkups:S.body.checkups||[]};
  }
  S.legacy = false; S.ob = null;
  saveSettings(); saveDoc('body'); render(); window.scrollTo(0,0);
  toast(ob.edit ? 'Profilo aggiornato' : 'Piano creato');
}
