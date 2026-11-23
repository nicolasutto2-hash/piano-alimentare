// ---- toast ----
let toastTimer;
function toast(msg){
  let t = document.getElementById('toast');
  if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast'; t.setAttribute('role','status'); document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>{ t.hidden = true; }, 2200);
}

// ---- finestre (aggiungi al diario, esercizi, carichi) ----
const SH = {open:false, kind:'add', mode:'cibi', slot:'altro', food:null, text:'', busy:false, items:null, err:'', exDi:0, exId:null, img:null, copyDate:'', copyItems:null};
function defaultSlot(){
  const h=new Date().getHours(), tr = trainOn(S.date);
  if(tr) return h<8?'colazione':h<10?'pre':h<12?'post':h<15?'pranzo':h<18?'merenda':'cena';
  return h<10?'colazione':h<12?'spuntino':h<15?'pranzo':h<18?'merenda':'cena';
}
function foodRows(q){
  const items = Object.entries(F).filter(([id,f])=>f.n.toLowerCase().includes(q.trim().toLowerCase())).sort((a,b)=>a[1].n.localeCompare(b[1].n,'it'));
  return items.map(([id,f])=>`<button class="foodrow" data-act="pickfood" data-id="${id}"><span>${esc(f.n)}</span><span class="muted small num">${f.k} kcal/100 ${f.unit||'g'}</span></button>`).join('') || '<p class="muted">Nessun risultato. Prova con "Personalizzato".</p>';
}
function sheetBody(){
  if(SH.kind==='ex') return `<div class="row between"><h2>Nuovo esercizio · ${DAYS_LONG[SH.exDi]}</h2><button class="btn sm" data-act="closeadd">Chiudi</button></div>
    <div class="stack" style="margin-top:14px"><div><label for="exn">Nome</label><input id="exn" type="text" placeholder="Per esempio: panca piana"></div>
    <div class="grid2"><div><label for="exs">Serie</label><input id="exs" type="number" inputmode="numeric" min="1" max="20" value="3"></div><div><label for="exr">Ripetizioni</label><input id="exr" type="text" value="10" placeholder="10 oppure 8-10"></div></div>
    <button class="btn pri" data-act="exsave">Aggiungi</button></div>`;
  if(SH.kind==='exview'){
    const ex = exOf(SH.exDi).find(e=>e.id===SH.exId); if(!ex) return '';
    const img = S.exImg[ex.id];
    return `<div class="row between"><h2>${esc(ex.name)}</h2><button class="btn sm" data-act="closeadd">Chiudi</button></div>
      ${img?`<img src="${img}" alt="Foto di ${esc(ex.name)}" style="width:100%;border-radius:20px;margin:14px 0;display:block">`:`<p class="muted" style="margin:12px 0">Nessuna foto. Scatta o scegli una foto del macchinario in palestra: ti aiuta a riconoscerlo la volta dopo.</p>`}
      <div class="stack"><button class="btn pri" data-act="expick">${img?'Cambia foto':'Aggiungi foto'}</button><input id="exfile" type="file" accept="image/*" hidden>
      ${img?`<button class="btn" data-act="exrm">Rimuovi foto</button>`:''}
      <a class="btn" style="text-align:center;text-decoration:none;display:block" href="${exVideoUrl(ex.name)}" target="_blank" rel="noopener">Guarda come si fa (video)</a></div>`;
  }
  if(SH.kind==='copy'){
    const y = shift(S.date,-1), w = shift(S.date,-7);
    return `<div class="row between"><h2>Copia da un altro giorno</h2><button class="btn sm" data-act="closeadd">Chiudi</button></div>
      <p class="small muted" style="margin:6px 0 12px">Scegli il giorno da cui copiare. Poi decidi cosa portare in ${dateLabel(S.date).toLowerCase()}.</p>
      <div class="chips"><button class="chip" data-act="copyload" data-d="${y}">Ieri</button><button class="chip" data-act="copyload" data-d="${w}">Stesso giorno, 7 giorni fa</button></div>
      <div class="row" style="margin:6px 0 12px"><div class="grow"><label for="cpd">Oppure una data</label><input id="cpd" type="date" value="${SH.copyDate||y}" max="${todayStr()}"></div><button class="btn" style="align-self:flex-end" data-act="copyload" data-d="">Carica</button></div>
      ${SH.copyItems===null?'':SH.copyItems.length?`<div class="tag" style="margin:4px 0 2px">${esc(dateLabel(SH.copyDate))}</div>`+SH.copyItems.map((x,i)=>`<label class="check"><input type="checkbox" data-cp="${i}" checked><span class="grow t"><span style="font-weight:500">${esc(x.name)}</span><br><span class="small muted num">${fmt(x.k)} kcal</span></span></label>`).join('')+`<div style="margin-top:12px"><button class="btn pri" data-act="copygo">Copia le voci selezionate</button></div>`:'<p class="muted">Quel giorno non ha voci.</p>'}`;
  }
  if(SH.kind==='wlog'){
    const ex = exOf(SH.exDi).find(e=>e.id===SH.exId); if(!ex) return '';
    const ls = lastSession(ex.id), tdy = setsToday(ex.id);
    return `<div class="row between"><h2>${esc(ex.name)}</h2><button class="btn sm" data-act="closeadd">Chiudi</button></div>
      <p class="small muted" style="margin:6px 0 12px">Scheda: ${ex.sets} × ${esc(ex.reps)}${ls?' · Ultima volta ('+shortDate(ls.d)+'): '+ls.sets.map(x=>x.kg+' kg × '+x.reps).join(', '):''}</p>
      <div class="grid2"><div><label for="wlkg">Peso (kg)</label><input id="wlkg" type="number" inputmode="decimal" step="0.5" min="0" max="500" value="${tdy.length?tdy[tdy.length-1].kg:(ls?ls.sets[ls.sets.length-1].kg:'')}"></div>
      <div><label for="wlr">Ripetizioni</label><input id="wlr" type="number" inputmode="numeric" min="1" max="100"></div></div>
      <div style="margin:12px 0"><button class="btn pri" data-act="wlogsave">Aggiungi serie</button></div>
      ${tdy.map((x,i)=>`<div class="entry"><div class="grow num">Serie ${i+1}: ${x.kg} kg × ${x.reps}</div><button class="x" data-act="wlogdel" data-i="${i}" aria-label="Elimina la serie ${i+1}">Elimina</button></div>`).join('')}`;
  }
  const slotOpts = [...SLOTS.map(s=>[s.id,s.n]),['altro','Fuori pasto']].map(([id,n])=>`<option value="${id}" ${SH.slot===id?'selected':''}>${n}</option>`).join('');
  const modes = [...(S.sample?[['desc','Descrivi']]:[]), ['cibi','Alimenti'],['pref','Preferiti'],['veloci','Veloci'],['custom','Personalizzato']];
  let h = `<div class="row between"><h2>Aggiungi al diario</h2><button class="btn sm" data-act="closeadd">Chiudi</button></div>
    <div style="margin:12px 0"><label for="shslot">Pasto</label><select id="shslot">${slotOpts}</select></div>
    <div class="chips">${modes.map(([id,n])=>`<button class="chip ${SH.mode===id?'on':''}" data-act="shmode" data-m="${id}">${n}</button>`).join('')}</div>`;
  if(SH.mode==='desc'){
    h += `<label for="desct">Cosa hai mangiato o bevuto?</label><textarea id="desct" rows="3" placeholder="Per esempio: pizza margherita, 2 birre medie e un gelato" style="font:inherit;color:var(--fg);background:var(--surface2);border:1px solid transparent;border-radius:14px;padding:10px 12px;width:100%;resize:vertical">${esc(SH.text)}</textarea>
      ${S.imgLimits?`<div class="row" style="margin-top:8px"><button class="btn sm" data-act="descattach">${SH.img?'Cambia foto':'Aggiungi una foto del piatto'}</button>${SH.img?`<img src="${SH.img.url}" alt="Foto del piatto" style="height:44px;width:44px;object-fit:cover;border-radius:10px"><button class="x" style="border:0;background:transparent;color:var(--muted)" data-act="descimgdel">Togli</button>`:''}<input id="descfile" type="file" accept="${S.imgLimits.mediaTypes.join(',')}" hidden></div>`:''}
      <div style="margin:10px 0"><button class="btn pri" data-act="descgo" ${SH.busy?'disabled':''}>${SH.busy?'Sto calcolando…':'Calcola le calorie'}</button></div>
      ${SH.err?`<p class="small" style="color:var(--warn)">${esc(SH.err)}</p>`:''}`;
    if(SH.items){
      const tot = SH.items.reduce((a,x)=>a+x.k,0);
      h += `<div class="tag" style="margin:6px 0 2px">Stima, controlla prima di aggiungere</div>`+
        SH.items.map((x,i)=>`<div class="entry"><div class="grow"><div style="font-weight:500">${esc(x.name)}</div><div class="small muted num">${fmt(x.k)} kcal · P ${fmt(x.p)} · C ${fmt(x.c)} · G ${fmt(x.f)}</div></div><button class="x" data-act="descdel" data-i="${i}" aria-label="Togli ${esc(x.name)}">Togli</button></div>`).join('')+
        `<div class="row between" style="margin-top:10px"><b class="num">Totale ${fmt(tot)} kcal</b><button class="btn pri" data-act="descadd" ${SH.items.length?'':'disabled'}>Aggiungi tutto</button></div>`;
    }
  } else if(SH.mode==='cibi'){
    if(SH.food){
      const f=F[SH.food], u=f.unit||'g', dg=f.piece?f.piece.g:100;
      h += `<div class="card" style="background:var(--surface2)"><h3>${esc(f.n)}</h3><div class="row" style="margin-top:10px"><div class="grow"><label for="shg">Quantità (${u})</label><input id="shg" type="number" inputmode="decimal" min="1" value="${dg}"></div></div>
        <p id="shprev" class="muted num" style="margin:8px 0"></p><div class="row"><button class="btn pri" data-act="addfood">Aggiungi</button><button class="btn" data-act="pickfood" data-id="">Indietro</button></div></div>`;
    } else {
      h += `<input id="shq" type="search" placeholder="Cerca un alimento" aria-label="Cerca un alimento"><div id="shlist" style="margin-top:6px">${foodRows('')}</div>`;
    }
  } else if(SH.mode==='pref'){
    const fv = S.settings.favs || [];
    h += fv.length ? fv.map((x,i)=>`<div class="entry"><button class="foodrow" style="border:0;padding:0" data-act="favuse" data-i="${i}"><span>${esc(x.name)}</span><span class="muted small num">${fmt(x.k)} kcal</span></button><button class="x" data-act="favdel" data-i="${i}" aria-label="Togli ${esc(x.name)} dai preferiti">Togli</button></div>`).join('') : '<p class="muted">Nessun preferito. Nel diario, tocca "Preferito" accanto a una voce che mangi spesso.</p>';
  } else if(SH.mode==='veloci'){
    h += QUICK.map((q,i)=>`<button class="foodrow" data-act="addquick" data-i="${i}"><span>${esc(q.n)}</span><span class="muted small num">${q.k} kcal</span></button>`).join('');
  } else {
    h += `<div class="stack"><div><label for="cn">Nome</label><input id="cn" type="text" placeholder="Per esempio: gelato"></div>
      <div class="grid2"><div><label for="ck">Calorie</label><input id="ck" type="number" inputmode="numeric" min="0"></div><div><label for="cp">Proteine (g)</label><input id="cp" type="number" inputmode="decimal" min="0"></div>
      <div><label for="cc">Carboidrati (g)</label><input id="cc" type="number" inputmode="decimal" min="0"></div><div><label for="cf">Grassi (g)</label><input id="cf" type="number" inputmode="decimal" min="0"></div></div>
      <button class="btn pri" data-act="addcustom">Aggiungi</button></div>`;
  }
  return h;
}
function openSheet(kind, extra){
  Object.assign(SH, {open:true, kind:kind||'add', mode:S.sample?'desc':'cibi', food:null, text:'', busy:false, items:null, err:'', img:null, copyDate:'', copyItems:null, slot:defaultSlot()}, extra||{});
  let r = document.getElementById('sheetroot');
  if(!r){ r = document.createElement('div'); r.id='sheetroot'; document.body.appendChild(r); }
  paintSheet();
}
function paintSheet(){
  const r = document.getElementById('sheetroot'); if(!r) return;
  r.innerHTML = SH.open ? `<div class="sheetscrim" data-act="scrim"><div class="sheet" role="dialog" aria-modal="true" aria-label="Finestra">${sheetBody()}</div></div>` : '';
}
function closeSheet(){ SH.open=false; paintSheet(); }
function updatePreview(){
  const el = document.getElementById('shprev'), gi = document.getElementById('shg');
  if(!el||!gi||!SH.food) return;
  const f=F[SH.food], g=parseFloat(gi.value)||0;
  el.textContent = `${fmt(f.k*g/100)} kcal · P ${fmt1(f.p*g/100)} g · C ${fmt1(f.c*g/100)} g · G ${fmt1(f.f*g/100)} g`;
}
function pushEntry(e){
  const day = S.days[S.date]; if(!day) return;
  day.entries.push({id:uid(), ...e});
  saveDay(S.date); closeSheet(); render(); toast('Aggiunto al diario');
}

// ---- foto degli esercizi (miniature salvate, una per esercizio) ----
function makeThumb(file, size=360){
  return new Promise((res,rej)=>{
    const r = new FileReader();
    r.onerror = () => rej(new Error('lettura'));
    r.onload = () => {
      const im = new Image();
      im.onerror = () => rej(new Error('immagine'));
      im.onload = () => {
        const s = Math.min(im.naturalWidth, im.naturalHeight), sx = (im.naturalWidth-s)/2, sy = (im.naturalHeight-s)/2;
        const c = document.createElement('canvas'); c.width = c.height = size;
        c.getContext('2d').drawImage(im, sx, sy, s, s, 0, 0, size, size);
        res(c.toDataURL('image/jpeg', 0.78));
      };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  });
}
async function loadExImgs(){
  const ids = [];
  for(const di of S.settings.train) for(const e of exOf(di)) ids.push(e.id);
  const need = ids.filter(id => !(id in S.exImg));
  if(!need.length) return;
  need.forEach(id => { S.exImg[id] = null; });
  await Promise.all(need.map(async id => { try{ const d = await Store.get('ex-'+id); if(d && d.img) S.exImg[id] = d.img; }catch(e){} }));
  if(S.page==='allena') render();
}

// ---- eventi ----
const $ = id => document.getElementById(id);
const val = id => { const e=$(id); return e ? e.value : ''; };
document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-act]'); if(!el) return;
  const a = el.dataset.act;
  if(a==='scrim'){ if(ev.target===el) closeSheet(); return; }
  if(a==='navscrim'){ S.nav=false; render(); return; }
  if(el.tagName==='SELECT' || (el.tagName==='INPUT')) return;
  if(a==='burger'){ S.nav=true; render(); }
  else if(a==='obset'){ const k=el.dataset.k; S.ob.draft[k]=el.dataset.v; if(k==='trainWhen') S.ob.draft.trainTime = {mattina:'09:00',pomeriggio:'17:30',sera:'19:30'}[el.dataset.v]; S.ob.err=''; render(); }
  else if(a==='obmulti'){ const k=el.dataset.k, v=+el.dataset.v, arr=S.ob.draft[k]||[]; S.ob.draft[k]=arr.includes(v)?arr.filter(x=>x!==v):[...arr,v]; render(); }
  else if(a==='obnext'){ const er=obValidate(); S.ob.err=er; if(!er) S.ob.step++; render(); window.scrollTo(0,0); }
  else if(a==='obback'){ S.ob.step--; S.ob.err=''; render(); window.scrollTo(0,0); }
  else if(a==='obcancel'){ S.ob=null; render(); }
  else if(a==='obfinish'){ const er=obValidate(); if(er){ S.ob.err=er; render(); return; } finishProfile(); }
  else if(a==='go' && el.dataset.p==='prof'){ S.nav=false; startOnboarding(true); render(); window.scrollTo(0,0); }
  else if(a==='go'){ S.page=el.dataset.p; S.nav=false; render(); window.scrollTo(0,0); loadDay(S.date); loadWeek(); if(S.page==='allena') loadExImgs(); }
  else if(a==='today'){ S.date=todayStr(); render(); loadDay(S.date); loadWeek(); }
  else if(a==='wprev'||a==='wnext'){ S.date = shift(S.date, a==='wnext'?7:-7); render(); loadDay(S.date); loadWeek(); }
  else if(a==='pickday'){ S.date=el.dataset.d; render(); loadDay(S.date); loadWeek(); }
  else if(a==='water+'||a==='water-'){
    const day=S.days[S.date]; if(!day) return;
    day.water = Math.max(0, Math.min(30, (day.water||0) + (a==='water+'?1:-1))); saveDay(S.date); render();
  }
  else if(a==='mark'){
    ev.preventDefault();
    const m = mealOf(dayIdx(S.date), el.dataset.slot, S.date), day=S.days[S.date]; if(!m||!day) return;
    const x = mealMacros(m);
    day.entries.push({id:uid(),slot:el.dataset.slot,plan:el.dataset.slot,name:m.n,k:x.k,p:x.p,c:x.c,f:x.f});
    saveDay(S.date); render();
  }
  else if(a==='unmark'){ ev.preventDefault(); const day=S.days[S.date]; day.entries=day.entries.filter(e=>e.plan!==el.dataset.slot); saveDay(S.date); render(); }
  else if(a==='del'){ const day=S.days[S.date]; day.entries=day.entries.filter(e=>e.id!==el.dataset.id); saveDay(S.date); render(); }
  else if(a==='openadd') openSheet();
  else if(a==='closeadd') closeSheet();
  else if(a==='shmode'){ SH.mode=el.dataset.m; SH.food=null; paintSheet(); }
  else if(a==='pickfood'){ SH.food = el.dataset.id || null; paintSheet(); updatePreview(); }
  else if(a==='addfood'){
    const f=F[SH.food], g=parseFloat(val('shg'));
    if(!f||!(g>0)) return toast('Inserisci una quantità valida.');
    pushEntry({slot:SH.slot,name:f.n,g,u:f.unit||'g',k:f.k*g/100,p:f.p*g/100,c:f.c*g/100,f:f.f*g/100});
  }
  else if(a==='addquick'){ const q=QUICK[+el.dataset.i]; pushEntry({slot:SH.slot,name:q.n,k:q.k,p:q.p,c:q.c,f:q.f}); }
  else if(a==='addcustom'){
    const n=val('cn').trim(), v=id=>Math.max(0,parseFloat(val(id))||0);
    if(!n||!(v('ck')>0)) return toast('Servono almeno un nome e le calorie.');
    pushEntry({slot:SH.slot,name:n,k:v('ck'),p:v('cp'),c:v('cc'),f:v('cf')});
  }
  else if(a==='descgo'){
    const text = val('desct').trim(); SH.text = text;
    if(text.length<3 && !SH.img) return toast('Scrivi cosa hai mangiato o bevuto, o aggiungi una foto.');
    SH.busy=true; SH.err=''; SH.items=null; paintSheet();
    estimateFood(text, SH.img && SH.img.blob).then(items=>{ SH.items = items; if(!items.length) SH.err='Non sono riuscito a capire gli alimenti. Prova a descriverli meglio.'; })
      .catch(e=>{ SH.err = e && e.code==='not_granted' ? "Non hai consentito l'uso di Claude per questa pagina." : e && e.code==='rate_limited' ? 'Troppe richieste ravvicinate, aspetta un momento.' : e && (e.code==='image_rejected'||e.code==='images_unavailable') ? 'Non riesco a usare questa foto. Prova con un\'altra, in formato JPEG o PNG.' : 'Non sono riuscito a calcolare. Riprova o usa "Personalizzato".'; })
      .finally(()=>{ SH.busy=false; paintSheet(); });
  }
  else if(a==='descattach'){ const f=$('descfile'); if(f) f.click(); }
  else if(a==='descimgdel'){ SH.img=null; paintSheet(); }
  else if(a==='chatattach'){ const f=$('chatfile'); if(f) f.click(); }
  else if(a==='chatimgdel'){ S.chatImg=null; render(); }
  else if(a==='descdel'){ SH.items.splice(+el.dataset.i,1); paintSheet(); }
  else if(a==='descadd'){
    const day = S.days[S.date]; if(!day||!SH.items||!SH.items.length) return;
    for(const x of SH.items) day.entries.push({id:uid(),slot:SH.slot,name:x.name,k:x.k,p:x.p,c:x.c,f:x.f});
    saveDay(S.date); closeSheet(); render(); toast('Aggiunto al diario');
  }
  else if(a==='trainday'){
    const day=S.days[S.date]; if(!day) return;
    const next = !trainOn(S.date);
    if(next===isTrain(dayIdx(S.date))) delete day.train; else day.train=next;
    saveDay(S.date); render();
  }
  else if(a==='goalsave'){
    const kg=num(val('gkg')), d=val('gdate');
    if(!(kg>=30&&kg<=250)||!/^\d{4}-\d{2}-\d{2}$/.test(d)) return toast('Inserisci il peso da raggiungere e la data.');
    S.settings.goal={kg:Math.round(kg*10)/10,date:d}; saveSettings(); render(); toast('Obiettivo salvato');
  }
  else if(a==='goaldel'){ S.settings.goal=null; saveSettings(); render(); }
  else if(a==='weekai'){ S.page='assist'; render(); window.scrollTo(0,0); sendChat('Commenta la mia settimana che inizia il '+el.dataset.ws+': cosa sta andando bene, cosa posso migliorare, in poche righe.'); }
  else if(a==='calgo') addReminders();
  else if(a==='exphtml'||a==='expcsv'){
    if(!S.dl) return;
    const html = a==='exphtml';
    toast('Preparo il file…');
    (html?exportHTML():exportCSV()).then(data => S.dl.save({filename: html?'report-piano-alimentare.html':'dati-piano-alimentare.csv', data}))
      .then(()=>toast('File pronto'))
      .catch(e=>{ if(!(e&&e.code==='declined')) toast('Non sono riuscito a salvare il file.'); });
  }
  else if(a==='favadd'){
    const day=S.days[S.date], e=day && day.entries.find(x=>x.id===el.dataset.id); if(!e) return;
    const fv = S.settings.favs = S.settings.favs || [];
    if(fv.some(x=>x.name.toLowerCase()===e.name.toLowerCase())) return toast('È già tra i preferiti.');
    if(fv.length>=30) return toast('Hai già 30 preferiti: togline uno.');
    fv.push({name:e.name,k:e.k,p:e.p,c:e.c,f:e.f,g:e.g,u:e.u}); saveSettings(); toast('Salvato nei preferiti');
  }
  else if(a==='favuse'){ const x=(S.settings.favs||[])[+el.dataset.i]; if(x) pushEntry({slot:SH.slot,name:x.name,k:x.k,p:x.p,c:x.c,f:x.f,g:x.g,u:x.u}); }
  else if(a==='favdel'){ S.settings.favs.splice(+el.dataset.i,1); saveSettings(); paintSheet(); }
  else if(a==='opencopy') openSheet('copy');
  else if(a==='copyload'){
    const d = el.dataset.d || val('cpd'); if(!/^\d{4}-\d{2}-\d{2}$/.test(d)) return toast('Scegli una data.');
    if(d===S.date) return toast('È lo stesso giorno: scegline un altro.');
    SH.copyDate=d; loadDay(d,true).then(()=>{ SH.copyItems = clone(S.days[d].entries); paintSheet(); });
  }
  else if(a==='copygo'){
    const day=S.days[S.date]; if(!day||!SH.copyItems) return;
    const sel=[...document.querySelectorAll('[data-cp]:checked')].map(c=>SH.copyItems[+c.dataset.cp]).filter(Boolean);
    if(!sel.length) return toast('Seleziona almeno una voce.');
    for(const x of sel){ const {plan,id,...rest}=x; day.entries.push({id:uid(),...rest}); }
    saveDay(S.date); closeSheet(); render(); toast(sel.length+(sel.length===1?' voce copiata':' voci copiate'));
  }
  else if(a==='sleep+'||a==='sleep-'){
    const day=S.days[S.date]; if(!day) return;
    const ci = day.ci = day.ci || {}, cur = ci.sleep!=null ? ci.sleep : 7;
    ci.sleep = Math.max(3, Math.min(12, cur + (a==='sleep+'?0.5:-0.5)));
    saveDay(S.date); render();
  }
  else if(a==='energy'||a==='stress'){
    const day=S.days[S.date]; if(!day) return;
    const ci = day.ci = day.ci || {}, n=+el.dataset.n;
    ci[a] = ci[a]===n ? null : n; saveDay(S.date); render();
  }
  else if(a==='calapply'){
    const dlt=+el.dataset.d, nt = (S.settings.target||TARGET_KCAL)+dlt;
    if(nt<1500||nt>3500) return toast('Valore fuori dai limiti.');
    S.settings.target=nt; S.settings.adjAt=todayStr(); saveSettings(); render(); toast('Nuovo obiettivo: '+fmt(nt)+' kcal');
  }
  else if(a==='bkmake'){
    if(!S.dl) return;
    toast('Preparo la copia…');
    makeBackup().then(txt => S.dl.save({filename:'backup-piano-alimentare-'+todayStr()+'.json', data:txt}))
      .then(()=>toast('Copia pronta'))
      .catch(e=>{ if(!(e&&e.code==='declined')) toast('Non sono riuscito a salvare la copia.'); });
  }
  else if(a==='bkpick'){ const f=$('bkfile'); if(f) f.click(); }
  else if(a==='bkcancel'){ S.restore=null; S.bkMsg=''; render(); }
  else if(a==='bkgo') restoreBackup();
  else if(a==='aicodesave'){
    const c = val('aicode').trim(); if(!c) return toast('Scrivi il codice amici.');
    S.settings.aiCode = c; S.aiMsg=''; saveSettings(); refreshAI(); render();
  }
  else if(a==='aicodereset'){ S.settings.aiCode=''; S.aiMsg=''; saveSettings(); refreshAI(); render(); }
  else if(a==='resetchecks'){ const p=el.dataset.ws+':'; for(const k of Object.keys(S.settings.checked)) if(k.startsWith(p)) delete S.settings.checked[k]; saveSettings(); render(); }
  else if(a==='spesaweek'){ S.spesaWeek=+el.dataset.n; render(); }
  else if(a==='cycle'){ S.settings.cycle=+el.dataset.n; saveSettings(); render(); toast(S.settings.cycle===1?'Menù sempre uguale':'Rotazione su '+S.settings.cycle+' settimane'); }
  // allenamento
  else if(a==='traintoggle'){
    const i=+el.dataset.i, t=S.settings.train; S.settings.train = t.includes(i) ? t.filter(x=>x!==i) : [...t,i];
    saveSettings(); render();
  }
  else if(a==='exview') openSheet('exview',{exDi:+el.dataset.di, exId:el.dataset.id});
  else if(a==='expick'){ const f=$('exfile'); if(f) f.click(); }
  else if(a==='exrm'){ const id=SH.exId; S.exImg[id]=null; enqueue(()=>Store.set('ex-'+id,{})); paintSheet(); render(); }
  else if(a==='exadd') openSheet('ex',{exDi:+el.dataset.di});
  else if(a==='exsave'){
    const n=val('exn').trim(), s=parseInt(val('exs'),10)||3, r=val('exr').trim()||'10';
    if(!n) return toast('Scrivi il nome dell\'esercizio.');
    (S.settings.workout[SH.exDi] = S.settings.workout[SH.exDi]||[]).push({id:uid(),name:n.slice(0,60),sets:Math.max(1,Math.min(20,s)),reps:r.slice(0,12)});
    saveSettings(); closeSheet(); render();
  }
  else if(a==='exdel'){ const xid=el.dataset.id; S.settings.workout[+el.dataset.di] = exOf(+el.dataset.di).filter(e=>e.id!==xid); delete S.exImg[xid]; enqueue(()=>Store.set('ex-'+xid,{})); saveSettings(); render(); }
  else if(a==='wlogopen') openSheet('wlog',{exDi:+el.dataset.di, exId:el.dataset.id});
  else if(a==='wlogsave'){
    const kg=num(val('wlkg')), reps=parseInt(val('wlr'),10);
    if(!(kg>=0)||!(reps>0)) return toast('Inserisci peso e ripetizioni.');
    const arr = (S.wlog.ex[SH.exId] = S.wlog.ex[SH.exId]||[]);
    arr.push({d:todayStr(), kg, reps}); if(arr.length>80) arr.splice(0,arr.length-80);
    saveDoc('wlog'); paintSheet(); render();
  }
  else if(a==='wlogdel'){
    const arr = S.wlog.ex[SH.exId]||[], today = arr.filter(x=>x.d===todayStr()), target = today[+el.dataset.i];
    S.wlog.ex[SH.exId] = arr.filter(x=>x!==target); saveDoc('wlog'); paintSheet(); render();
  }
  // peso e misure
  else if(a==='wsave'){
    const kg=num(val('wkg')), d=val('wdate')||todayStr();
    if(!(kg>=30&&kg<=250)) return toast('Inserisci un peso tra 30 e 250 kg.');
    S.body.weights = S.body.weights.filter(x=>x.d!==d); S.body.weights.push({d,kg:Math.round(kg*10)/10});
    saveDoc('body'); render(); toast('Peso salvato');
  }
  else if(a==='wquick'){
    const kg=num(val('wq'));
    if(!(kg>=30&&kg<=250)) return toast('Inserisci un peso tra 30 e 250 kg.');
    const d=todayStr(); S.body.weights = S.body.weights.filter(x=>x.d!==d); S.body.weights.push({d,kg:Math.round(kg*10)/10});
    saveDoc('body'); render(); toast('Peso salvato');
  }
  else if(a==='wdel'){ S.body.weights = S.body.weights.filter(x=>!(x.d===el.dataset.d && x.kg===+el.dataset.kg)); saveDoc('body'); render(); }
  else if(a==='msave'){
    const m={id:uid(), d:val('mdate')||todayStr()}; let n=0;
    for(const [k] of MEASURES){ const v=num(val('m-'+k)); if(v>=10&&v<=250){ m[k]=Math.round(v*2)/2; n++; } }
    if(!n) return toast('Inserisci almeno una misura.');
    S.body.measures.push(m); saveDoc('body'); render(); toast('Misure salvate');
  }
  else if(a==='mdel'){ S.body.measures = S.body.measures.filter(x=>x.id!==el.dataset.id); saveDoc('body'); render(); }
  // esami
  else if(a==='labsave'){
    const key=val('labt'), v=num(val('labv'));
    if(!isFinite(v)) return toast('Inserisci il valore.');
    let e;
    if(key==='custom'){
      const n=val('labn').trim(); if(!n) return toast('Scrivi il nome dell\'esame.');
      e={t:n.slice(0,60), u:val('labu').trim()};
    } else { const t=LAB_TESTS[key]; e={t:t.n, u:t.u, min:t.min, max:t.max}; }
    const mn=num(val('labmin')), mx=num(val('labmax'));
    if(isFinite(mn)) e.min=mn; if(isFinite(mx)) e.max=mx;
    S.labs.items.push({id:uid(), d:val('labd')||todayStr(), v, ...e});
    saveDoc('labs'); render(); toast('Valore salvato');
  }
  else if(a==='labdel'){ S.labs.items = S.labs.items.filter(x=>x.id!==el.dataset.id); saveDoc('labs'); render(); }
  // assistente
  else if(a==='chatsug') sendChat(el.dataset.t);
  else if(a==='chatstop'){ if(chatCtl) chatCtl.abort(); }
});
function readPick(file, cb){
  if(!file) return;
  const r = new FileReader();
  r.onload = () => cb({blob:file, url:r.result});
  r.onerror = () => toast('Non riesco a leggere la foto.');
  r.readAsDataURL(file);
}
document.addEventListener('change', ev => {
  const el = ev.target;
  if(el.dataset && el.dataset.obchk && S.ob){ const k=el.dataset.obchk; if(k.startsWith('excl.')){ S.ob.draft.excl[k.slice(5)] = el.checked; } else S.ob.draft[k] = el.checked; if(S.ob.step===2 || k==='powder') render(); return; }
  if(el.id==='bkfile'){ const f = el.files && el.files[0]; el.value=''; readBackupFile(f); }
  else if(el.dataset.calkey){ if(el.checked) delete S.calOff[el.dataset.calkey]; else S.calOff[el.dataset.calkey]=true; }
  else if(el.id==='exfile'){
    const f = el.files && el.files[0], id = SH.exId; if(!f) return;
    makeThumb(f).then(url=>{ S.exImg[id]=url; enqueue(()=>Store.set('ex-'+id,{img:url})); paintSheet(); render(); })
      .catch(()=>toast('Non riesco a usare questa foto. Prova con un\'altra.'));
  }
  else if(el.id==='chatfile'){ readPick(el.files && el.files[0], img => { S.chatImg=img; render(); const c=$('chatin'); if(c) c.focus(); }); }
  else if(el.id==='descfile'){ readPick(el.files && el.files[0], img => { SH.img=img; paintSheet(); }); }
  else if(el.id==='shslot') SH.slot = el.value;
  else if(el.dataset.act==='swap'){ curPlan()[dayIdx(S.date)][el.dataset.slot] = +el.value; saveSettings(); render(); }
  else if(el.dataset.act==='tick'){ if(el.checked) S.settings.checked[el.dataset.id]=true; else delete S.settings.checked[el.dataset.id]; saveSettings(); render(); }
  else if(el.id==='wday'){ S.settings.weighDay = +el.value; saveSettings(); render(); toast('Giorno della pesata aggiornato'); }
  else if(el.id==='prek'){ const v=Math.round(parseFloat(el.value)); if(v>=0&&v<=200){ S.settings.preKcal=v; saveSettings(); render(); toast('Calorie del pre workout aggiornate'); } else { toast('Scegli un valore tra 0 e 200 kcal.'); el.value=S.settings.preKcal ?? 10; } }
  else if(el.id==='tgt'){ const v=Math.round(parseFloat(el.value)); if(v>=1200&&v<=4500){ S.settings.target=v; saveSettings(); render(); toast('Obiettivo aggiornato'); } else { toast('Scegli un valore tra 1.200 e 4.500 kcal.'); el.value=targets().base; } }
});
document.addEventListener('input', ev => {
  const id = ev.target.id;
  if(ev.target.dataset && ev.target.dataset.ob && S.ob){ S.ob.draft[ev.target.dataset.ob] = ev.target.value; return; }
  if(id==='shq'){ $('shlist').innerHTML = foodRows(ev.target.value); }
  else if(id==='shg') updatePreview();
  else if(id==='desct') SH.text = ev.target.value;
  else if(id==='chatin') S.chatDraft = ev.target.value;
});
document.addEventListener('submit', ev => {
  if(ev.target.id==='chatform'){ ev.preventDefault(); sendChat($('chatin').value); }
});
document.addEventListener('keydown', ev => { if(ev.key==='Escape'){ if(SH.open) closeSheet(); else if(S.nav){ S.nav=false; render(); } } });

// ---- caricamento dei dati salvati ----
async function loadAll(){
  const keys = ['settings','body','labs','wlog','chat'];
  const got = await Promise.all(keys.map(k => Store.get(k).catch(()=>{ toast('Non riesco a leggere alcuni dati salvati.'); return null; })));
  const [s,b,l,w,c] = got;
  if(s){
    const base = allPlans();
    if(Array.isArray(s.plans) && s.plans.length) S.settings.plans = base.map((p,w)=>mergePlan(s.plans[w] || p, w));
    else if(Array.isArray(s.plan) && s.plan.length===7) S.settings.plans = base.map((p,w)=>w===0?mergePlan(s.plan,0):p);
    if([1,2,3,4].includes(s.cycle)) S.settings.cycle = s.cycle;
    if(Array.isArray(s.favs)) S.settings.favs = s.favs;
    if(typeof s.adjAt==='string') S.settings.adjAt = s.adjAt;
    if(s.target) S.settings.target = s.target;
    if(s.checked && typeof s.checked==='object') S.settings.checked = s.checked;
    if(Array.isArray(s.train)) S.settings.train = s.train.filter(i=>i>=0&&i<=6);
    if(typeof s.preKcal==='number') S.settings.preKcal = s.preKcal;
    if(typeof s.weighDay==='number') S.settings.weighDay = s.weighDay;
    if(s.goal && typeof s.goal.kg==='number' && s.goal.date) S.settings.goal = s.goal;
    if(s.cal && typeof s.cal==='object') S.settings.cal = s.cal;
    if(typeof s.aiCode==='string') S.settings.aiCode = s.aiCode;
    if(s.profile && typeof s.profile==='object') S.settings.profile = s.profile;
    if(typeof s.startWeek==='string') S.settings.startWeek = s.startWeek;
    if(typeof s.trainBonus==='number') S.settings.trainBonus = s.trainBonus;
    if(typeof s.pTarget==='number') S.settings.pTarget = s.pTarget;
    if(typeof s.fTarget==='number') S.settings.fTarget = s.fTarget;
    S.legacy = !s.profile && !!(s.plans || s.plan);
    if(s.workout && typeof s.workout==='object') S.settings.workout = s.workout;
  }
  if(b && Array.isArray(b.weights) && b.weights.length) S.body = {weights:b.weights, measures:Array.isArray(b.measures)?b.measures:[]};
  if(l && Array.isArray(l.items)) S.labs = l;
  if(w && w.ex) S.wlog = w;
  if(c && Array.isArray(c.msgs)) S.chat = c;
  if(S.settings.profile) applyCfg(S.settings.profile);
  else if(S.legacy){ applyCfg({...newProfile(), powder:true, trainWhen:'mattina', trainTime:'09:00'}); if(!S.settings.startWeek) S.settings.startWeek = shift(todayStr(), -dayIdx(todayStr())); }
  if(!S.settings.profile){ if(!S.ob) startOnboarding(false); } else if(S.ob && !S.ob.edit) S.ob = null;
}

// ---- avvio ----
(async function start(){
  await Store.init();
  refreshAI();
  await loadAll();
  S.ready = true;
  render();
  loadDay(S.date);
})();
