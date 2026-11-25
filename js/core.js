// ---- utilità ----
const MONTHS = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const fmt1 = n => (Math.round(n*10)/10).toLocaleString('it-IT');
const pad = n => String(n).padStart(2,'0');
const dstr = d => d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse = s => new Date(s+'T12:00:00');
const todayStr = () => dstr(new Date());
const dayIdx = s => (parse(s).getDay()+6)%7;
const shift = (s,n) => { const d=parse(s); d.setDate(d.getDate()+n); return dstr(d); };
const uid = () => Math.random().toString(36).slice(2,9);
const clone = o => JSON.parse(JSON.stringify(o));

// ---- salvataggio: tutto resta su questo telefono (localStorage) ----
const Store = {
  mode:'local',
  async init(){ try{ if(navigator.storage && navigator.storage.persist) navigator.storage.persist(); }catch(e){} },
  async get(k){ try{ const v = localStorage.getItem('piano:'+k); return v ? JSON.parse(v) : null; }catch(e){ return null; } },
  async all(){
    const out = {};
    try{ for(let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); if(k.startsWith('piano:')){ try{ out[k.slice(6)] = JSON.parse(localStorage.getItem(k)); }catch(e){} } } }catch(e){}
    return out;
  },
  async set(k,v){ localStorage.setItem('piano:'+k, JSON.stringify(v)); },
  async remove(k){ try{ localStorage.removeItem('piano:'+k); }catch(e){} }
};
// Segreti (chiave API): fuori dai dati dell'app, quindi mai nei backup né nei report.
const Secret = {
  get(k){ try{ return localStorage.getItem('piano-secret:'+k) || ''; }catch(e){ return ''; } },
  set(k,v){ try{ localStorage.setItem('piano-secret:'+k, v); }catch(e){} },
  remove(k){ try{ localStorage.removeItem('piano-secret:'+k); }catch(e){} }
};
let chain = Promise.resolve();
const enqueue = fn => { chain = chain.then(fn).catch(() => toast('Non sono riuscito a salvare. Riprova.')); return chain; };

// ---- settimane di menù (rotazione) ----
function weekIdxOf(date){
  const ws = shift(date, -dayIdx(date)), diff = Math.round((parse(ws)-parse((S.settings && S.settings.startWeek) || ws))/864e5/7), c = (S.settings && S.settings.cycle) || 4;
  return ((diff % c) + c) % c;
}
const curPlan = () => S.settings.plans[S.planWeek||0] || S.settings.plans[0];
function withPlanWeek(w, fn){ const old = S.planWeek; S.planWeek = w; try{ return fn(); } finally{ S.planWeek = old; } }

// ---- stato ----
const S = {
  page:'menu', planWeek:0, spesaWeek:null, nav:false, date:todayStr(), ready:false, sample:null,
  settings:{plans:allPlans(), cycle:4, target:TARGET_KCAL, checked:{}, train:[], workout:{}, preKcal:10, weighDay:0, profile:null, startWeek:null, trainBonus:150, pTarget:null, fTarget:null, goal:null, cal:{}, favs:[], adjAt:null},
  body:{weights:[], measures:[], checkups:[]}, ob:null, legacy:false,
  labs:{items:[]}, wlog:{ex:{}}, chat:{threads:[], cur:null}, chatView:'', chatBusyId:null,
  chatBusy:false, chatLive:'', chatDraft:'', chatImg:null, imgLimits:null, exImg:{}, dl:null, mcp:null, calBusy:false, calMsg:'', calOff:{}, restore:null, bkMsg:'', bkBusy:false, aiMsg:'', hlMsg:'', hlOk:false, showSteps:false, days:{}
};
const saveSettings = () => enqueue(() => Store.set('settings', S.settings));
const saveDoc = k => enqueue(() => Store.set(k, S[k]));
const saveDay = d => enqueue(() => Store.set('day-'+d, S.days[d]));
async function loadDay(d, quiet){
  if(S.days[d]) return;
  try{ S.days[d] = (await Store.get('day-'+d)) || {entries:[]}; }
  catch(e){ S.days[d] = {entries:[]}; toast('Non riesco a leggere i dati di questo giorno.'); }
  if(!Array.isArray(S.days[d].entries)) S.days[d].entries = [];
  if(!quiet) render();
}
async function loadWeek(){
  const ws = shift(S.date, -dayIdx(S.date));
  const need = [...Array(7)].map((_,i)=>shift(ws,i)).filter(d=>!S.days[d]);
  if(!need.length) return;
  await Promise.all(need.map(d=>loadDay(d,true)));
  render();
}
