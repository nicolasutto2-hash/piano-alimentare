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
  if(list.length) h += `<section class="card"><h3>Storico</h3>`+[...list].reverse().map(x=>`<div class="entry"><div class="grow num">${shortDate(x.d)} ${parse(x.d).getFullYear()}<div class="small muted">${CK_FIELDS.filter(f=>x[f[0]]!=null).length} valori${x.peso!=null?' · '+f1(x.peso)+' kg':''}${x.grassoPct!=null?' · grasso '+f1(x.grassoPct)+'%':''}</div></div><button class="x" data-act="ckdel" data-id="${x.id}" aria-label="Elimina il check-up del ${shortDate(x.d)}">Elimina</button></div>`).join('')+`</section>`;
  return h+`<p class="small muted">Valori dello strumento della palestra, indicativi: non sono una valutazione medica.</p>`;
}
