function greeting(){ const h=new Date().getHours(); return h<12?'Buongiorno':h<18?'Buon pomeriggio':'Buonasera'; }
function render(){
  if(S.ob){ document.getElementById('app').innerHTML = viewOnboarding(); return; }
  S.planWeek = weekIdxOf(S.date);
  const page = PAGES.find(p=>p.id===S.page) || PAGES[0];
  const body = {menu:viewMenu, cal:viewCal, spesa:viewSpesa, prep:viewPrep, allena:viewAllena, prog:viewProg, prof:viewProg, esami:viewEsami, assist:viewAssist, sett:viewSett, dati:viewDati}[page.id]();
  const store = Store.mode==='cloud' ? 'Dati salvati nel tuo account' : 'Dati salvati solo su questo dispositivo';
  const scrollY = window.scrollY, home = page.id==='menu';
  const fab = (S.sample && page.id!=='assist') ? `<button class="fab" data-act="go" data-p="assist" aria-label="Apri l'assistente">${ICON.spark}</button>` : '';
  const drawer = !S.nav ? '' : `<div class="scrim" data-act="navscrim"></div>
    <nav class="drawer" aria-label="Sezioni"><div class="brand"><b>Piano alimentare</b><span class="small muted">Definizione · ${fmt(targets().k)} kcal al giorno</span></div>
    ${PAGES.map(p=>`<button class="navitem ${p.id===page.id?'on':''}" data-act="go" data-p="${p.id}" ${p.id===page.id?'aria-current="page"':''}>${ICON[p.ic]}<span>${p.n}</span></button>`).join('')}
    <div class="foot">${store}.<br>Supporto organizzativo ed educativo, non sostituisce una visita da un professionista sanitario.</div></nav>`;
  document.getElementById('app').innerHTML =
    `<div class="app"><header class="bar-top"><button class="rbtn" data-act="burger" aria-label="Apri il menu" aria-expanded="${S.nav}"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
      <div class="ttl"><div class="sub">${home?greeting():page.sub}</div><h1>${home?'Il tuo piano':page.n}</h1></div>
      ${home||page.id==='cal'?`<button class="rbtn" data-act="today" aria-label="Vai a oggi">${ICON.today}</button>`:''}</header>${body}</div>${fab}${drawer}`;
  window.scrollTo(0,scrollY);
}

