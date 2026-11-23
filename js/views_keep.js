function qtyText(id,g){
  const f = F[id];
  if(f.piece) return Math.ceil(g/f.piece.g - 0.001)+' '+f.piece.l;
  const step = f.step||50, r = Math.ceil(g/step)*step, u = f.unit||'g';
  if(r>=1000) return String(r/1000).replace('.',',')+' '+(u==='ml'?'L':'kg');
  return r+' '+u;
}
function viewSpesa(){
  const td = todayStr(), thisWs = shift(td, -dayIdx(td));
  if(S.spesaWeek===null) S.spesaWeek = dayIdx(td)>=5 ? 1 : 0;
  const ws = shift(thisWs, 7*S.spesaWeek), w = weekIdxOf(ws);
  const list = shoppingList(S.settings.plans[w], S.settings.train), checked = S.settings.checked||{};
  const ids = Object.keys(list), ck = id => checked[ws+':'+id], done = ids.filter(i=>ck(i)).length;
  let h = `<div class="chips"><button class="chip ${S.spesaWeek===0?'on':''}" data-act="spesaweek" data-n="0">Questa settimana</button><button class="chip ${S.spesaWeek===1?'on':''}" data-act="spesaweek" data-n="1">Prossima settimana</button></div>
    <div class="card"><div class="row between"><div><h2>Lista della spesa</h2><div class="small muted">${shortDate(ws)} – ${shortDate(shift(ws,6))} · menù ${w+1} di ${S.settings.cycle||4}</div></div><span class="pill num">${done}/${ids.length}</span></div>
    <div class="row" style="margin-top:10px"><button class="btn sm" data-act="resetchecks" data-ws="${ws}">Svuota le spunte</button></div></div>`;
  for(const cat of Object.keys(CATS)){
    const items = ids.filter(i=>F[i].cat===cat).sort((a,b)=>F[a].n.localeCompare(F[b].n,'it'));
    if(!items.length) continue;
    h += `<div class="card"><div class="tag" style="margin-bottom:4px">${CATS[cat]}</div>`+
      items.map(id=>`<label class="check ${ck(id)?'ticked':''}"><input type="checkbox" data-act="tick" data-id="${ws}:${id}" ${ck(id)?'checked':''}><span class="grow t">${esc(F[id].n)}</span><span class="num small muted">${qtyText(id,list[id])}</span></label>`).join('')+`</div>`;
  }
  h += `<p class="small muted">Quantità arrotondate per eccesso. Se cambi un pasto nel menù, la lista si aggiorna da sola. Le cene del weekend sono fuori e non entrano nella spesa.</p>`;
  return h;
}

// ---- cosa preparare ----
const roundCooked = (id,g) => Math.max(5, Math.round(g*YIELD[id]/5)*5);
function prepBatch(b){ // usa il menù della settimana corrente di S.planWeek
  const bulk = {}, boxes = [], fresh = [];
  for(const d of b.days) for(const sid of ['pranzo','cena']){
    if(d>=5 && sid==='cena') continue;
    const m = mealOf(d,sid); if(!m || !m.i) continue;
    const label = DAYS[d]+' · '+(sid==='pranzo'?'pranzo':'cena');
    if(m.fresh){ fresh.push({label,m}); continue; }
    const cook = m.i.filter(([id])=>COOK.has(id)), rest = m.i.filter(([id])=>!COOK.has(id));
    for(const [id,g] of cook){ const o = bulk[id] || (bulk[id]={g:0,use:[]}); o.g += g; o.use.push(label); }
    boxes.push({label,m,cook,rest});
  }
  return {bulk,boxes,fresh};
}
function viewPrep(){
  const td = todayStr(), wd = dayIdx(td), tomorrow = (wd+1)%7;
  const pws = wd===6 ? shift(td,1) : shift(td,-wd);          // di domenica si vede già il meal prep di lunedì
  const tw = weekIdxOf(shift(td,1)), pw = weekIdxOf(pws);
  const tmeals = withPlanWeek(tw, () => ({p:mealOf(tomorrow,'pranzo'), m:mealOf(tomorrow,'merenda'), c:mealOf(tomorrow,'colazione')}));
  let h = '';
  // ogni sera
  const tp = tmeals.p, tm = tmeals.m, tc = tmeals.c;
  h += `<div class="card"><div class="row between"><h2>Ogni sera, 5 minuti</h2><span class="pill">Per domani, ${DAYS_LONG[tomorrow].toLowerCase()}</span></div>
    <div class="step"><span class="no">1</span><div><b>Pranzo</b><div class="muted small">${tp?esc(tp.n):'Nessuno'}. Mettilo in un contenitore, da mangiare entro le 12:45.</div></div></div>
    <div class="step"><span class="no">2</span><div><b>Merenda</b><div class="muted small">${tm?esc(tm.n)+'. Mettila nello zaino, per scuola o auto.':'Domani non è prevista.'}</div></div></div>
    <div class="step"><span class="no">3</span><div><b>Colazione</b><div class="muted small">${tc?esc(tc.n)+'. Tira fuori gli ingredienti, così domattina fai in fretta.'+(isTrain(tomorrow)?' Domani ti alleni: tieni pronta anche la polvere pre workout.':''):'Nessuna.'}</div></div></div></div>`;
  for(const b of BATCHES){
    const {bulk,boxes,fresh} = withPlanWeek(pw, () => prepBatch(b)), ids = Object.keys(bulk);
    h += `<div class="card"><div class="row between"><div><h2>${b.n}</h2><div class="small muted">${b.sub}</div></div>${wd===b.cookDay?'<span class="pill">Oggi</span>':''}</div>
      <div class="step"><span class="no">1</span><div class="grow"><b>Cuoci in blocco</b><div style="margin-top:6px">`+
      (ids.length ? ids.map(id=>`<div class="kv"><div><div>${esc(F[id].n)}</div><div class="small muted">${bulk[id].use.join(', ')}</div></div><div style="text-align:right"><div class="num">${fmt(bulk[id].g)} g crudo</div><div class="small muted num">circa ${fmt(roundCooked(id,bulk[id].g))} g cotto</div></div></div>`).join('') : '<div class="muted small">Niente da cuocere in blocco.</div>')+
      `</div></div></div>
      <div class="step"><span class="no">2</span><div class="grow"><b>Porziona nei contenitori</b>`+
      boxes.map(x=>`<div class="box"><div class="tag">${x.label}</div><div style="font-weight:600">${esc(x.m.n)}</div>
        <div class="small muted" style="margin-top:2px">${x.cook.map(([id,g])=>`${esc(F[id].n.toLowerCase())} circa ${roundCooked(id,g)} g cotto`).join(', ')}${x.rest.length?'<br>Aggiungi quando scaldi: '+x.rest.map(([id,g])=>`${esc(F[id].n.toLowerCase())} ${g} ${F[id].unit||'g'}`).join(', '):''}</div></div>`).join('')+
      `</div></div>`+
      (fresh.length ? `<div class="step"><span class="no">3</span><div class="grow"><b>Da fare al momento</b><div class="small muted">${fresh.map(x=>`${x.label}: ${esc(x.m.n)}`).join('<br>')}</div></div></div>` : '')+
      `</div>`;
  }
  h += `<div class="card"><h3>Conservazione</h3><ul class="muted small" style="margin:8px 0 0;padding-left:18px;display:grid;gap:6px">
    <li>Cibi cotti in frigo, in contenitori chiusi, per 3-4 giorni al massimo. Quello che serve più avanti puoi congelarlo.</li>
    <li>Raffredda il riso in fretta, entro circa un'ora, e mettilo subito in frigo. Scaldalo bene, con un goccio d'acqua.</li>
    <li>Pesce e frittata si fanno il giorno stesso. Il resto si scalda in 2 minuti.</li>
    <li>Il lunedì cuoci dopo la palestra, verso le 11: il pranzo di quel giorno lo cucini fresco. Nel weekend cucini al momento, con piatti semplici.</li></ul></div>`;
  return h;
}
