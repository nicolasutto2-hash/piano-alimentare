// ---- check-up del corpo: composizione corporea, forza e mobilità (da palestra o bilancia) ----
const CK_FIELDS = [
  // chiave, etichetta, unità, gruppo, massimo
  ['peso','Peso','kg','comp',250], ['bmi','BMI','','comp',60],
  ['grassoPct','Massa grassa','%','comp',80], ['grassoKg','Massa grassa','kg','comp',200],
  ['magraPct','Massa magra (FFM)','%','comp',100], ['magraKg','Massa magra (FFM)','kg','comp',200],
  ['muscoloPct','Muscolo scheletrico (SMM)','%','comp',100], ['muscoloKg','Muscolo scheletrico (SMM)','kg','comp',100],
  ['slmKg','Massa magra tessuti molli (SLM)','kg','comp',200],
  ['acquaKg','Acqua corporea totale','kg','comp',120], ['acquaPct','Acqua corporea totale','%','comp',100],
  ['ecwPct','Acqua extracellulare (ECW)','%','comp',100], ['icwPct','Acqua intracellulare (ICW)','%','comp',100],
  ['bmr','Metabolismo basale','kcal','comp',6000], ['fase','Angolo di fase','°','comp',30], ['bmcKg','Contenuto minerale osseo','kg','comp',20],
  ['forza','Punteggio di forza','/100','mov',100], ['presaSx','Forza di presa sinistra','kg','mov',200], ['presaDx','Forza di presa destra','kg','mov',200],
  ['colloSx','Mobilità del collo sinistra','°','mov',180], ['colloDx','Mobilità del collo destra','°','mov',180],
  ['spalleSx','Mobilità spalle sinistra','°','mov',200], ['spalleDx','Mobilità spalle destra','°','mov',200],
  ['busto','Flessione del busto','°','mov',180], ['caviglieSx','Mobilità caviglie sinistra','°','mov',90], ['caviglieDx','Mobilità caviglie destra','°','mov',90]
];
const CK_KEY = Object.fromEntries(CK_FIELDS.map(f=>[f[0],f]));
const CK_HEAD = [['peso','Peso'],['grassoPct','Massa grassa'],['magraKg','Massa magra'],['muscoloKg','Muscolo'],['bmr','Metabolismo basale']];
const ckNum = s => { s = String(s==null?'':s).replace(/[^\d.,-]/g,''); if(!s) return NaN; if(s.includes('.') && s.includes(',')) return parseFloat(s.split(s.lastIndexOf('.')>s.lastIndexOf(',')?',':'.').join('').replace(',','.')); return parseFloat(s.replace(',','.')); };
const ckVal = v => { const n = typeof v==='number' ? v : ckNum(v); return isFinite(n) ? n : null; };
const sortedCk = () => [...(S.body.checkups||[])].sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0);

// riga incollabile: PIANO-CHECKUP;data=2026-11-25;peso=75,7;grassopct=22,3;...
function parseCheckup(text){
  const t = String(text||'');
  if(!t.toUpperCase().includes('PIANO-CHECKUP')) return null;
  const kv = {}; for(const part of t.split(/[;\n\r]+/)){ const i = part.indexOf('='); if(i>0) kv[part.slice(0,i).trim().toLowerCase()] = part.slice(i+1).trim(); }
  const out = {d: /^\d{4}-\d{2}-\d{2}$/.test(kv.data||'') ? kv.data : todayStr(), v:{}};
  for(const [k,,,,max] of CK_FIELDS){ const n = ckNum(kv[k.toLowerCase()]); if(isFinite(n) && n>=0 && n<=max) out.v[k] = n; }
  return Object.keys(out.v).length ? out : null;
}
function saveCheckup(d, v){
  if(!v || !Object.keys(v).length) return null;
  S.body.checkups = S.body.checkups || [];
  const e = {id:uid(), d, ...v};
  S.body.checkups = S.body.checkups.filter(x=>x.d!==d);
  S.body.checkups.push(e);
  if(v.peso>=30){ S.body.weights = S.body.weights.filter(x=>x.d!==d); S.body.weights.push({d, kg:Math.round(v.peso*10)/10}); }
  saveDoc('body');
  return e;
}
function importCheckup(text){
  const c = parseCheckup(text);
  if(!c) throw new Error('Non riconosco questi dati. Controlla che la riga inizi con PIANO-CHECKUP.');
  const e = saveCheckup(c.d, c.v);
  return {kind:'checkup', d:c.d, n:Object.keys(c.v).length, e};
}
const ckFmt = (k,v) => { const f = CK_KEY[k]; const x = (k==='bmr'||k==='forza') ? fmt(v) : f1(v); return x+(f&&f[2]?' '+f[2]:''); };
function ckDelta(k, cur, prev){
  if(!prev || prev[k]==null || cur[k]==null) return '';
  const d = cur[k]-prev[k]; if(Math.abs(d)<0.05) return '<span class="small muted">invariato</span>';
  const good = ({grassoPct:-1, grassoKg:-1, magraKg:1, muscoloKg:1, muscoloPct:1, peso:0, bmr:1})[k] || 0;
  const col = good===0 ? 'var(--muted)' : (d*good>0 ? 'var(--ok)' : 'var(--warn)');
  return `<span class="small num" style="color:${col}">${d>0?'+':'−'}${f1(Math.abs(d))}</span>`;
}
function viewCheck(){
  const list = sortedCk(), last = list[list.length-1], prev = list[list.length-2];
  let h = '';
  if(last){
    h += `<section class="card"><div class="row between"><div><div class="tag">Ultimo check-up</div><div style="font-weight:700;font-family:var(--font-d);margin-top:2px">${shortDate(last.d)} ${parse(last.d).getFullYear()}</div></div><span class="pill">${list.length} ${list.length===1?'misura':'misure'}</span></div>
      <div class="minis" style="margin:12px 0 0">${CK_HEAD.filter(([k])=>last[k]!=null).map(([k,n])=>`<div class="mini" style="box-shadow:none;background:var(--surface2)"><div class="small muted">${n}</div><div class="v num">${ckFmt(k,last[k])}</div><div>${ckDelta(k,last,prev)}</div></div>`).join('')}</div>`;
    if(prev) h += `<p class="small muted" style="margin:10px 0 0">Le variazioni sono rispetto al check-up del ${shortDate(prev.d)}.</p>`;
    h += `</section>`;
    for(const [grp,title] of [['comp','Composizione corporea'],['mov','Forza e mobilità']]){
      const rows = CK_FIELDS.filter(f=>f[3]===grp && last[f[0]]!=null);
      if(!rows.length) continue;
      h += `<section class="card"><h3>${title}</h3>`+rows.map(f=>`<div class="entry"><div class="grow">${esc(f[1])}</div><b class="num">${ckFmt(f[0],last[f[0]])}</b><span style="width:56px;text-align:right">${ckDelta(f[0],last,prev)}</span></div>`).join('')+`</section>`;
    }
  } else h += `<div class="note">Nessun check-up ancora. Aggiungi quello della palestra: i valori della bioimpedenziometria (grasso, massa magra, muscolo, acqua, metabolismo) e, se vuoi, forza e mobilità.</div>`;
  h += `<section class="card"><h3>Nuovo check-up</h3><p class="small muted" style="margin:6px 0 10px">Compila solo i valori che hai. Puoi anche mandare gli screenshot all'assistente: legge i numeri e li salva. Il peso va anche nel registro del peso.</p>
    <div><label for="ck-date">Data</label><input id="ck-date" type="date" value="${todayStr()}" max="${todayStr()}"></div>`+
    [['comp','Composizione corporea'],['mov','Forza e mobilità']].map(([grp,title])=>`<details style="margin-top:10px"><summary>${title}</summary><div class="grid2" style="margin-top:8px">${CK_FIELDS.filter(f=>f[3]===grp).map(f=>`<div><label for="ck-${f[0]}">${esc(f[1])}${f[2]?' ('+f[2]+')':''}</label><input id="ck-${f[0]}" data-ck="${f[0]}" type="text" inputmode="decimal"></div>`).join('')}</div></details>`).join('')+
    `<div style="margin-top:12px"><button class="btn pri" data-act="cksave">Salva il check-up</button></div>
    <details style="margin-top:12px"><summary>Incolla una riga di dati</summary><div class="stack" style="margin-top:8px"><textarea id="cktext" rows="3" placeholder="PIANO-CHECKUP;data=…;peso=…" style="font:inherit;color:var(--fg);background:var(--surface2);border:1px solid transparent;border-radius:14px;padding:10px 12px;width:100%"></textarea><button class="btn" data-act="ckpaste">Importa la riga</button></div></details></section>`;
  const p0 = S.settings.profile, withBmr = [...list].reverse().find(x=>x.bmr>0);
  if(withBmr && p0){
    const np = {...p0, weight: withBmr.peso>=30 ? withBmr.peso : p0.weight, bmrOverride: withBmr.bmr}, c = calcPlan(np), cur = {t:S.settings.target, b:trainBonus(), p:pTarget(), f:fTarget()};
    const applied = +p0.bmrOverride===withBmr.bmr && p0.bmrDate===withBmr.d;
    h = h.replace('<section class="card"><h3>Nuovo check-up</h3>', `<section class="card"><h3>Calorie dal check-up</h3><p class="small muted" style="margin:6px 0 10px">Il metabolismo basale misurato (${fmt(withBmr.bmr)} kcal, ${shortDate(withBmr.d)}) è più preciso della stima dal profilo (${fmt(c.bmrStd)} kcal).</p>
      <div class="kv"><span>Obiettivo giorni normali</span><b class="num">${fmt(cur.t)} → ${fmt(c.target)} kcal</b></div><div class="kv"><span>Giorni di allenamento</span><b class="num">+${cur.b} → +${c.trainBonus} kcal</b></div>
      <div class="kv"><span>Proteine · grassi</span><b class="num">${cur.p} → ${c.p} g · ${cur.f} → ${c.f} g</b></div>
      ${c.note?`<p class="small" style="margin:8px 0 0">${esc(c.note)}</p>`:''}
      ${applied?'<p class="small done" style="margin:10px 0 0">Già applicato.</p>':'<div style="margin-top:12px"><button class="btn pri" data-act="ckplan">Ricalcola le mie calorie</button></div>'}</section><section class="card"><h3>Nuovo check-up</h3>`);
  }
  if(list.length) h += `<section class="card"><h3>Storico</h3>`+[...list].reverse().map(x=>`<div class="entry"><div class="grow num">${shortDate(x.d)} ${parse(x.d).getFullYear()}<div class="small muted">${CK_FIELDS.filter(f=>x[f[0]]!=null).length} valori${x.peso!=null?' · '+f1(x.peso)+' kg':''}${x.grassoPct!=null?' · grasso '+f1(x.grassoPct)+'%':''}</div></div><button class="x" data-act="ckdel" data-id="${x.id}" aria-label="Elimina il check-up del ${shortDate(x.d)}">Elimina</button></div>`).join('')+`</section>`;
  return h+`<p class="small muted">Valori dello strumento della palestra, indicativi: non sono una valutazione medica.</p>`;
}

// ---- importazione di una scheda da file ----
const SCH_TAG = 'scheda';
function readScheda(f){
  if(!f) return;
  S.schedaPrev = null; S.schedaMsg = '';
  if(f.size > 12*1024*1024){ S.schedaMsg = 'Il file è troppo grande per essere una scheda.'; render(); return; }
  const r = new FileReader();
  r.onerror = () => { S.schedaMsg = 'Non riesco a leggere il file.'; render(); };
  r.onload = () => {
    try{
      const j = JSON.parse(r.result);
      if(!j || j.app!=='piano-alimentare' || j.kind!==SCH_TAG || !Array.isArray(j.days) || !j.days.length || j.days.length>7) throw new Error('formato');
      const cl = (s,n) => String(s==null?'':s).slice(0,n);
      const days = j.days.map(d => {
        if(!(d.weekday>=0 && d.weekday<=6) || !Array.isArray(d.exercises) || d.exercises.length>20) throw new Error('giorno');
        return {weekday:d.weekday|0, name:cl(d.name,80), warm:cl(d.warm,240), cardio:cl(d.cardio,240), exercises:d.exercises.map(x => {
          if(!x || !x.name) throw new Error('esercizio');
          const img = typeof x.img==='string' && /^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(x.img) && x.img.length<300000 ? x.img : null;
          return {name:cl(x.name,80), sets:Math.max(1,Math.min(20,x.sets|0||3)), reps:cl(x.reps||'10',24), rest:cl(x.rest,24), note:cl(x.note,300), inc:(x.inc>=0 && x.inc<=20) ? +x.inc : null, img};
        })};
      });
      const sch = {days, guide:(Array.isArray(j.guide)?j.guide:[]).slice(0,8).map(s=>cl(s,300)), notesAppend:cl(j.notesAppend,400)};
      S.schedaPrev = {sch, sum:{days:days.length, ex:days.reduce((a,d)=>a+d.exercises.length,0), img:days.reduce((a,d)=>a+d.exercises.filter(x=>x.img).length,0), note:!!sch.notesAppend, dayNames:days.map(d=>DAYS_LONG[d.weekday]).join(', ')}};
    }catch(e){ S.schedaMsg = 'Questo file non è una scheda di Piano Alimentare. Scegli il file della scheda che ti ho mandato.'; }
    render();
  };
  r.readAsText(f);
}
function applyScheda(){
  if(!S.schedaPrev) return;
  const sch = S.schedaPrev.sch;
  S.settings.workoutMeta = S.settings.workoutMeta || {};
  for(const d of sch.days){
    const old = exOf(d.weekday);
    S.settings.workout[d.weekday] = d.exercises.map(x => {
      const prev = old.find(o => o.name.toLowerCase()===x.name.toLowerCase()), id = prev ? prev.id : uid();
      if(x.img){ S.exImg[id] = x.img; const im = x.img; enqueue(() => Store.set('ex-'+id, {img:im})); }
      const out = {id, name:x.name, sets:x.sets, reps:x.reps};
      if(x.rest) out.rest = x.rest; if(x.note) out.note = x.note; if(x.inc!==null) out.inc = x.inc;
      return out;
    });
    S.settings.workoutMeta[d.weekday] = {name:d.name, warm:d.warm, cardio:d.cardio};
    if(!S.settings.train.includes(d.weekday)) S.settings.train.push(d.weekday);
  }
  if(sch.guide.length) S.settings.workoutGuide = sch.guide;
  const p = S.settings.profile;
  if(p && sch.notesAppend && !String(p.notes||'').includes(sch.notesAppend.slice(0,30))) p.notes = (String(p.notes||'').trim() ? String(p.notes).trim()+' ' : '') + sch.notesAppend;
  S.schedaPrev = null; S.schedaMsg = '';
  saveSettings(); render(); window.scrollTo(0,0); toast('Scheda caricata');
}
