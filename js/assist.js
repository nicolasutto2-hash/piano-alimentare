// ---- assistente: istruzioni, strumenti e chat ----
const SLOT_IDS = Object.keys(SLOT_DEF);
const touch = () => { if(S.page!=='assist') render(); };
const okNum = (v,min,max) => { const x = typeof v==='number' ? v : num(v); return isFinite(x) && x>=min && x<=max ? x : NaN; };
const validDate = d => (typeof d==='string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) ? d : todayStr();

function rules(){
  const t = targets(todayStr()), p = S.settings.profile || {}, c = p.age ? calcPlan(p) : null;
  const goal = c ? ({lose:'perdere peso', recomp:'definirsi', maintain:'mantenere il peso', gain:'mettere massa'})[c.goalUsed] : 'stare meglio con l\'alimentazione';
  const who = p.age ? `${p.sex==='F'?'una persona di sesso femminile':'una persona di sesso maschile'} di ${p.age} anni (${p.height} cm, ${p.weight} kg all'inizio)` : 'una persona';
  return `Sei l'assistente dentro l'app "Piano Alimentare" di ${who}, con l'obiettivo di ${goal}${(S.settings.train||[]).length?`, che si allena (${sportLabel()}) ${(S.settings.train||[]).length} volte a settimana`:''}. Rispondi in italiano, in modo breve, caldo e pratico, senza giudicare e senza diete estreme. Sei un supporto organizzativo ed educativo: non fai diagnosi e non interpreti esami del sangue (registrali e, se servono commenti, invita a parlarne con il medico). Non proporre mai di scendere sotto ${p.sex==='F'?1500:1800} kcal al giorno e non proporre tagli di calorie nelle prime 3 settimane; ${p.age && p.age<18 ? 'la persona è minorenne: niente deficit calorici e invita a parlarne con un medico;' : ''} nei giorni di allenamento all'obiettivo si aggiungono ${trainBonus()} kcal.
${p.notes && String(p.notes).trim() ? 'Preferenze e abitudini della persona (rispettale sempre): '+String(p.notes).trim().slice(0,600)+'.\n' : ''}Per cambiare dati nell'app USA SEMPRE gli strumenti, poi conferma in una frase cosa hai fatto. Se manca un'informazione indispensabile, fai una sola domanda breve. Quando stimi le calorie di cibi o bevande, usa porzioni tipiche italiane se non sono indicate e dillo.
Oggi è ${DAYS_LONG[dayIdx(todayStr())]} ${todayStr()}. Giorni della settimana: 0=Lunedì, 1=Martedì, 2=Mercoledì, 3=Giovedì, 4=Venerdì, 5=Sabato, 6=Domenica. Obiettivo di oggi: ${fmt(t.k)} kcal. Giorni di allenamento: ${(S.settings.train||[]).map(i=>DAYS_LONG[i]).join(', ')||'nessuno'}. Pasti possibili: ${SLOT_IDS.join(', ')} (nei giorni normali colazione, spuntino, pranzo, merenda, cena; nei giorni di allenamento ${CFG.trainMode==='mattina'?`colazione, pre${CFG.powder?' = polvere pre workout':''}, post = pasto dopo l'allenamento, pranzo, merenda, cena`:'colazione, spuntino, pranzo, pre = spuntino prima di allenarsi, cena'}). Il programma di allenamento è nei giorni indicati; se un giorno cambia usa set_day_training. Per segnare qualcosa fuori pasto usa "altro".${CFG.eatOut?' Il sabato e la domenica la cena è fuori casa.':''}`;
}
function chatTools(){
  const obj = (properties, required=[]) => ({type:'object', properties, required});
  const dateP = {type:'string', description:'Data YYYY-MM-DD, se omessa oggi'};
  return [
    {name:'get_overview', description:'Stato attuale: obiettivo kcal, giorni di allenamento, calorie e macro di oggi, menù di ogni giorno (nome del pasto scelto e indice), ultime pesate.', inputSchema:obj({}),
     execute: async () => {
       await loadDay(todayStr(), true);
       const tot = sumEntries(S.days[todayStr()].entries);
       const menu = DAYS_LONG.map((n,di)=>({giorno:n, indice:di, pasti:Object.fromEntries(daySlots(di).map(sid=>{ const m=mealOf(di,sid); return [sid, m ? {indice:curPlan()[di][sid], nome:m.n, kcal:Math.round(mealMacros(m).k)} : 'saltato']; }))}));
       const hl=S.days[todayStr()].health; return {salute_oggi:hl||null, oggi:todayStr(), obiettivo_kcal:targets(todayStr()).k, mangiato_oggi:{kcal:Math.round(tot.k),proteine:Math.round(tot.p),carboidrati:Math.round(tot.c),grassi:Math.round(tot.f)}, giorni_allenamento:S.settings.train, ultime_pesate:sortedW().slice(-5), menu};
     }},
    {name:'get_day_log', description:'Voci del diario di un giorno con i totali.', inputSchema:obj({date:dateP}),
     execute: async ({date}) => { const d=validDate(date); await loadDay(d,true); const es=S.days[d].entries; const t=sumEntries(es); return {date:d, kcal:Math.round(t.k), voci:es.map(e=>({nome:e.name,kcal:Math.round(e.k),pasto:e.slot||'altro'}))}; }},
    {name:'log_food', description:"Registra nel diario cibi o bevande consumati (alcol compreso) con calorie e macro stimati. Una voce per alimento o bevanda.", inputSchema:obj({date:dateP, items:{type:'array', items:obj({slot:{type:'string',description:'colazione, spuntino, pre, post, pranzo, merenda, cena oppure altro'}, name:{type:'string'}, kcal:{type:'number'}, protein_g:{type:'number'}, carbs_g:{type:'number'}, fat_g:{type:'number'}}, ['name','kcal'])}}, ['items']),
     execute: async ({date, items}) => {
       const d = validDate(date); await loadDay(d,true); let n=0;
       for(const it of (items||[])){
         const k = okNum(it.kcal,0,5000); if(!it.name || isNaN(k)) continue;
         S.days[d].entries.push({id:uid(), slot:SLOT_IDS.includes(it.slot)?it.slot:'altro', name:String(it.name).slice(0,80), k, p:okNum(it.protein_g,0,500)||0, c:okNum(it.carbs_g,0,1000)||0, f:okNum(it.fat_g,0,500)||0}); n++;
       }
       saveDay(d); touch();
       const t = sumEntries(S.days[d].entries);
       return {aggiunte:n, date:d, totale_giorno_kcal:Math.round(t.k), obiettivo_kcal:targets(d).k};
     }},
    {name:'delete_log_entries', description:'Elimina dal diario le voci il cui nome contiene il testo indicato.', inputSchema:obj({date:dateP, name_contains:{type:'string'}}, ['name_contains']),
     execute: async ({date,name_contains}) => { const d=validDate(date); await loadDay(d,true); const q=String(name_contains).toLowerCase(); const before=S.days[d].entries.length; S.days[d].entries=S.days[d].entries.filter(e=>!e.name.toLowerCase().includes(q)); saveDay(d); touch(); return {eliminate:before-S.days[d].entries.length}; }},
    {name:'list_meal_options', description:'Alternative disponibili per un pasto di un giorno (già adattate alle esclusioni della persona), con indice, nome e calorie.', inputSchema:obj({weekday:{type:'integer'}, slot:{type:'string'}}, ['weekday','slot']),
     execute: ({weekday,slot}) => {
       if(!(weekday>=0&&weekday<=6)||!SLOT_IDS.includes(slot)) throw new Error('giorno o pasto non validi');
       const pool = poolFor(weekday,slot), f = dayScale(weekday, null), ex = (S.settings.profile||{}).excl;
       const ok = (slot==='cena' && weekday>=5 && CFG.eatOut) || slot==='pre' ? pool.map((_,i)=>i) : (allowedMap(ex)[slot] || pool.map((_,i)=>i));
       return pool.map((m,i)=>({indice:i, nome:m.n, kcal:Math.round(mealMacros(scaledMeal(m,f)).k)})).filter(x=>ok.includes(x.indice));
     }},
    {name:'get_day_menu', description:'Menù di un giorno: orari, nomi dei pasti, ingredienti con grammature e calorie. Usalo per rispondere a "cosa mangio oggi/domani/…?".', inputSchema:obj({date:dateP}),
     execute: async ({date}) => {
       const d = validDate(date), di = dayIdx(d);
       await loadDay(d, true);
       return withPlanWeek(weekIdxOf(d), () => ({date:d, giorno:DAYS_LONG[di], allenamento:trainOn(d), obiettivo_kcal:targets(d).k,
         pasti: daySlots(di, d).map(sid => { const m = mealOf(di, sid, d); return m ? {pasto:sid, ora:slotTime(sid, trainOn(d), di>=5), nome:m.n, kcal:Math.round(mealMacros(m).k), ingredienti:(m.i||[]).map(([id,g])=>foodName(id)+' '+g+' '+(F[id].unit||'g'))} : {pasto:sid, nome:'saltato'}; })}));
     }},
    {name:'swap_meal', description:'Cambia un pasto del menù settimanale scegliendo un indice dalle alternative (-1 per saltarlo, solo per spuntino, post, merenda).', inputSchema:obj({weekday:{type:'integer'}, slot:{type:'string'}, option_index:{type:'integer'}}, ['weekday','slot','option_index']),
     execute: ({weekday,slot,option_index}) => {
       if(!(weekday>=0&&weekday<=6)||!SLOT_IDS.includes(slot)) throw new Error('giorno o pasto non validi');
       const pool = poolFor(weekday,slot);
       if(option_index===-1 && !['spuntino','post','merenda'].includes(slot)) throw new Error('questo pasto non si può saltare');
       if(option_index!==-1 && !pool[option_index]) throw new Error('indice non valido');
       curPlan()[weekday][slot] = option_index; saveSettings(); touch();
       return {fatto:true, nuovo: option_index===-1?'saltato':pool[option_index].n};
     }},
    {name:'set_target_kcal', description:'Imposta l\'obiettivo calorico dei giorni normali (tra 1200 e 4500). Nei giorni di allenamento si aggiungono alcune kcal.', inputSchema:obj({kcal:{type:'integer'}}, ['kcal']),
     execute: ({kcal}) => { const k=okNum(kcal,1200,4500); if(isNaN(k)) throw new Error('valore fuori da 1200-4500'); S.settings.target=Math.round(k); saveSettings(); touch(); return {obiettivo:S.settings.target}; }},
    {name:'set_day_training', description:"Cambia solo per una data se l'utente si allena oppure no (variazione rispetto al programma).", inputSchema:obj({date:dateP, training:{type:'boolean'}}, ['training']),
     execute: async ({date,training}) => { const d=validDate(date); await loadDay(d,true); if(training===isTrain(dayIdx(d))) delete S.days[d].train; else S.days[d].train=!!training; saveDay(d); touch(); return {date:d, allenamento:trainOn(d), obiettivo_kcal:targets(d).k}; }},
    {name:'set_training_days', description:'Imposta i giorni di allenamento (0=Lunedì … 6=Domenica).', inputSchema:obj({weekdays:{type:'array', items:{type:'integer'}}}, ['weekdays']),
     execute: ({weekdays}) => { const w=[...new Set((weekdays||[]).filter(i=>i>=0&&i<=6))]; S.settings.train=w; saveSettings(); touch(); return {giorni:w}; }},
    {name:'set_workout', description:"Imposta la scheda di un giorno di allenamento, sostituendo gli esercizi. Aggiunge il giorno ai giorni di allenamento se manca.", inputSchema:obj({weekday:{type:'integer'}, exercises:{type:'array', items:obj({name:{type:'string'}, sets:{type:'integer'}, reps:{type:'string',description:'ripetizioni, es. 8 o 8-10'}}, ['name','sets','reps'])}}, ['weekday','exercises']),
     execute: ({weekday,exercises}) => {
       if(!(weekday>=0&&weekday<=6)) throw new Error('giorno non valido');
       const old = exOf(weekday);
       S.settings.workout[weekday] = (exercises||[]).slice(0,20).map(e=>({id:(old.find(o=>o.name.toLowerCase()===String(e.name).toLowerCase())||{}).id||uid(), name:String(e.name).slice(0,60), sets:Math.max(1,Math.min(20,Math.round(e.sets)||3)), reps:String(e.reps||'10').slice(0,12)}));
       if(!S.settings.train.includes(weekday)) S.settings.train.push(weekday);
       saveSettings(); touch(); return {giorno:DAYS_LONG[weekday], esercizi:S.settings.workout[weekday].length};
     }},
    {name:'log_weight', description:'Registra il peso in kg.', inputSchema:obj({kg:{type:'number'}, date:dateP}, ['kg']),
     execute: ({kg,date}) => { const v=okNum(kg,30,250); if(isNaN(v)) throw new Error('peso non valido'); const d=validDate(date); S.body.weights=S.body.weights.filter(x=>x.d!==d); S.body.weights.push({d,kg:Math.round(v*10)/10}); saveDoc('body'); touch(); return {date:d, kg:v}; }},
    {name:'log_measurements', description:'Registra misure del corpo in cm (ognuna facoltativa).', inputSchema:obj({date:dateP, waist_cm:{type:'number'}, hips_cm:{type:'number'}, chest_cm:{type:'number'}, arm_cm:{type:'number'}, thigh_cm:{type:'number'}}),
     execute: (i) => { const m={id:uid(), d:validDate(i.date)}; const map={vita:i.waist_cm,fianchi:i.hips_cm,petto:i.chest_cm,braccio:i.arm_cm,coscia:i.thigh_cm}; let n=0; for(const k in map){ const v=okNum(map[k],10,250); if(!isNaN(v)){ m[k]=Math.round(v*2)/2; n++; } } if(!n) throw new Error('nessuna misura valida'); S.body.measures.push(m); saveDoc('body'); touch(); return {salvate:n}; }},
    {name:'add_lab_result', description:"Registra un valore degli esami del sangue (non interpretarlo).", inputSchema:obj({name:{type:'string'}, value:{type:'number'}, unit:{type:'string'}, ref_min:{type:'number'}, ref_max:{type:'number'}, date:dateP}, ['name','value']),
     execute: (i) => {
       const v = okNum(i.value,-1e6,1e6); if(isNaN(v)||!i.name) throw new Error('dati non validi');
       const known = Object.values(LAB_TESTS).find(t=>t.n.toLowerCase()===String(i.name).toLowerCase());
       S.labs.items.push({id:uid(), d:validDate(i.date), t:known?known.n:String(i.name).slice(0,60), v, u:i.unit||(known&&known.u)||'', min:isFinite(i.ref_min)?i.ref_min:(known?known.min:undefined), max:isFinite(i.ref_max)?i.ref_max:(known?known.max:undefined)});
       saveDoc('labs'); touch(); return {salvato:true};
     }},
    {name:'set_weight_goal', description:'Imposta l\'obiettivo di peso con una data.', inputSchema:obj({kg:{type:'number'}, date:{type:'string',description:'YYYY-MM-DD'}}, ['kg','date']),
     execute: ({kg,date}) => { const v=okNum(kg,30,250); if(isNaN(v)||!/^\d{4}-\d{2}-\d{2}$/.test(date||'')) throw new Error('dati non validi'); S.settings.goal={kg:Math.round(v*10)/10,date}; saveSettings(); touch(); return S.settings.goal; }},
    {name:'get_week_summary', description:'Riepilogo di una settimana (lunedì-domenica): calorie e proteine medie, acqua, allenamenti, giorni registrati, peso. Passa una data qualsiasi della settimana.', inputSchema:obj({date:dateP}),
     execute: async ({date}) => { const d=validDate(date), ws=shift(d,-dayIdx(d)); await loadWeek2(ws); const s=withPlanWeek(weekIdxOf(ws), () => weekSummary(ws)); return {settimana_da:ws, giorni_registrati:s.logged, kcal_medie:Math.round(s.avgK), obiettivo_medio:Math.round(s.avgT), proteine_medie_g:Math.round(s.avgP), bicchieri_acqua_medi:Math.round(s.avgW*10)/10, allenamenti_fatti:s.trained, allenamenti_previsti:s.trainPlan, peso_medio:s.weight, peso_settimana_prima:s.weightPrev}; }},
    {name:'add_water', description:'Aggiunge (o toglie, con numero negativo) bicchieri d\'acqua da 250 ml.', inputSchema:obj({glasses:{type:'integer'}, date:dateP}, ['glasses']),
     execute: async ({glasses,date}) => { const d=validDate(date); await loadDay(d,true); S.days[d].water=Math.max(0,Math.min(30,(S.days[d].water||0)+Math.round(glasses))); saveDay(d); touch(); return {bicchieri:S.days[d].water}; }}
  ];
}

async function loadWeek2(ws){ await Promise.all([...Array(7)].map((_,i)=>loadDay(shift(ws,i),true))); }
let chatCtl = null;
function chatErr(e){
  if(e && e.code==='not_granted'){ if(AI.mode()==='proxy'){ S.settings.aiCode=''; saveSettings(); refreshAI(); S.aiMsg='Il codice amici non è valido: controllalo e riprova.'; return 'Il codice amici non è valido. Inseriscilo di nuovo.'; } Secret.remove('apikey'); refreshAI(); S.aiMsg='La chiave non è valida o è stata revocata: creane una nuova nella console e incollala qui.'; return 'La chiave non funziona più. Inseriscila di nuovo.'; }
  if(e && e.code==='no_credit') return 'Il credito Anthropic è finito. Aggiungine un po\' su console.anthropic.com e riprova.';
  if(e && e.code==='network') return 'Non riesco a collegarmi: controlla la connessione.';
  if(e && (e.code==='image_rejected' || e.code==='images_unavailable')) return 'Non riesco a usare questa foto. Prova con un\'altra, in formato JPEG o PNG.';
  if(e && e.code==='rate_limited') return 'Troppe richieste ravvicinate. Aspetta qualche secondo e riprova.';
  return 'Non riesco a rispondere in questo momento. Riprova tra poco.';
}
const chatThread = () => S.chat.threads.find(t => t.id===S.chat.cur) || null;
const chatMsgs = () => { const t = chatThread(); return t ? t.msgs : []; };
function ensureThread(){
  let t = chatThread();
  if(!t){ t = {id:uid(), title:'', t:Date.now(), msgs:[]}; S.chat.threads.unshift(t); S.chat.cur = t.id; if(S.chat.threads.length>30) S.chat.threads.length = 30; }
  return t;
}
function paintChat(){
  const el = document.getElementById('chatlog'); if(!el) return;
  el.innerHTML = chatHTML();
  window.scrollTo(0, document.body.scrollHeight);
}
async function sendChat(text){
  text = (text||'').trim();
  const img = S.chatImg;
  if((!text && !img) || S.chatBusy || !S.sample) return;
  if(!text) text = 'Guarda questa foto.';
  S.chatView = '';
  const th = ensureThread();
  if(!th.title) th.title = text.slice(0,48);
  th.t = Date.now();
  th.msgs.push({role:'user',content:text + (img?' (foto allegata)':'')}); S.chatDraft=''; S.chatImg=null; S.chatBusy=true; S.chatBusyId=th.id; S.chatLive='';
  chatCtl = new AbortController(); render(); window.scrollTo(0, document.body.scrollHeight);
  let turns = th.msgs.slice(-14).map(m=>({role:m.role,content:m.content})); while(turns.length && turns[0].role!=='user') turns.shift();
  const trace = [];
  const tools = chatTools().map(t => ({...t, execute: async inp => {
    try{ const r = await t.execute(inp); trace.push({tool:t.name, input:inp, result:r}); return r; }
    catch(e){ trace.push({tool:t.name, input:inp, error:String(e && e.message || e)}); throw e; } }}));
  try{
    const r = await S.sample([{role:'user',content:rules()}, ...turns], {cache:false, signal:chatCtl.signal, tools, ...(img?{images:[img.blob]}:{}), onText:({text})=>{ if(S.chat.cur===th.id) { S.chatLive=text; paintChat(); } }});
    th.msgs.push({role:'assistant',content:(r.text||'Fatto.').trim(), trace});
  }catch(e){
    th.msgs.push({role:'assistant',content: e && e.code==='cancelled' ? ((e.text||'')+' (interrotto)').trim() : chatErr(e), trace, err:(e&&e.code)||'errore'});
  }
  S.chatBusy=false; S.chatBusyId=null; S.chatLive=''; chatCtl=null;
  th.msgs = th.msgs.slice(-40);
  saveDoc('chat'); render(); window.scrollTo(0, document.body.scrollHeight);
}
function chatTranscript(){
  const t = chatThread(); if(!t) return '';
  const md = AI.model();
  let s = 'CONVERSAZIONE ASSISTENTE · '+todayStr()+' · modello '+md.id+'\n\n';
  for(const m of t.msgs){
    s += (m.role==='user' ? 'UTENTE: ' : 'ASSISTENTE: ') + m.content + '\n';
    for(const x of (m.trace||[])) s += '   · '+x.tool+' '+JSON.stringify(x.input).slice(0,300)+' → '+(x.error?'ERRORE '+x.error:JSON.stringify(x.result).slice(0,300))+'\n';
    if(m.err) s += '   · errore: '+m.err+'\n';
    s += '\n';
  }
  return s;
}

// ---- "Descrivi": stima di calorie da una frase ----
async function estimateFood(text, blob){
  const prompt = `Sei un nutrizionista. Stima calorie e macronutrienti di ciò che la persona ha mangiato o bevuto. Se le quantità non sono indicate usa porzioni tipiche italiane e scrivilo nel nome (per esempio "Pizza margherita (1 intera)"). Una voce per alimento o bevanda.
Rispondi SOLO con un array JSON di oggetti {"name":string,"kcal":number,"p":number,"c":number,"f":number}, con p, c, f in grammi. Esempio: [{"name":"Birra media (330 ml)","kcal":140,"p":1,"c":12,"f":0}]
${text?`Testo della persona: """${text.slice(0,600)}"""`:''}${blob?'\nIn allegato c\'è la foto del pasto: stima le porzioni confrontandole con piatto, posate o mano se si vedono e scrivi le assunzioni nel nome.':''}`;
  const arr = await S.sample.json(prompt, blob ? {modelTier:'default', images:[blob]} : {modelTier:'quick'});
  if(!Array.isArray(arr)) throw {code:'invalid_json'};
  return arr.map(x=>({name:String(x.name||'').slice(0,80), k:okNum(x.kcal,0,5000), p:okNum(x.p,0,500)||0, c:okNum(x.c,0,1000)||0, f:okNum(x.f,0,500)||0})).filter(x=>x.name && !isNaN(x.k)).slice(0,12);
}
