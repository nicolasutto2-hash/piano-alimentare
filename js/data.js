// ---- DATI: alimenti (valori per 100 g, alimenti crudi dove indicato) ----
const CATS = {
  carne: 'Carne e pesce',
  lat: 'Uova e latticini',
  cer: 'Cereali, pane e pasta',
  disp: 'Dispensa',
  verd: 'Verdure e patate',
  bev: 'Bevande'
};
const F = {
  pollo:{n:'Petto di pollo',k:110,p:23,c:0,f:1.5,cat:'carne',step:50},
  tacchino:{n:'Petto di tacchino',k:105,p:23.5,c:0,f:1,cat:'carne',step:50},
  manzo:{n:'Manzo macinato magro',k:140,p:21,c:0,f:6,cat:'carne',step:50},
  tonno:{n:'Tonno al naturale',k:110,p:25,c:0,f:1,cat:'carne',step:50},
  pesce:{n:'Merluzzo o orata (filetto)',k:90,p:18,c:0,f:1.5,cat:'carne',step:50},
  tacarr:{n:'Tacchino arrosto (affettato)',k:100,p:17,c:1,f:3,cat:'carne',step:50},
  prosciutto:{n:'Prosciutto cotto',k:130,p:19,c:1,f:5.5,cat:'carne',step:50},
  uova:{n:'Uova',k:143,p:12.5,c:0.7,f:9.5,cat:'lat',piece:{g:60,l:'uova'}},
  albume:{n:'Albume',k:52,p:11,c:0.7,f:0.2,cat:'lat',step:50},
  yogurt:{n:'Yogurt greco magro',k:59,p:10,c:4,f:0.4,cat:'lat',step:50},
  ricotta:{n:'Ricotta',k:146,p:8.8,c:3.5,f:10.9,cat:'lat',step:50},
  parmigiano:{n:'Parmigiano Reggiano',k:392,p:33,c:0,f:28,cat:'lat',step:50},
  latte:{n:'Latte parzialmente scremato',k:46,p:3.3,c:5,f:1.5,cat:'lat',step:250,unit:'ml'},
  riso:{n:'Riso',k:360,p:7,c:80,f:0.6,cat:'cer',step:100},
  pasta:{n:'Pasta',k:355,p:12,c:72,f:1.5,cat:'cer',step:100},
  avena:{n:"Fiocchi d'avena",k:372,p:13.5,c:60,f:7,cat:'cer',step:100},
  cereali:{n:'Cereali integrali',k:370,p:9,c:70,f:5,cat:'cer',step:100},
  pane:{n:'Pane',k:265,p:8,c:57,f:0.5,cat:'cer',step:100},
  gallette:{n:'Gallette di riso',k:380,p:8,c:80,f:3,cat:'cer',step:50},
  piadina:{n:'Piadina',k:300,p:8,c:50,f:7,cat:'cer',piece:{g:100,l:'piadine'}},
  patate:{n:'Patate',k:77,p:2,c:17,f:0.1,cat:'verd',step:250},
  zucchine:{n:'Zucchine',k:17,p:1.2,c:2,f:0.2,cat:'verd',step:100},
  olio:{n:"Olio extravergine d'oliva",k:900,p:0,c:0,f:100,cat:'disp',step:50},
  passata:{n:'Passata di pomodoro',k:30,p:1.5,c:5,f:0.3,cat:'disp',step:100},
  miele:{n:'Miele',k:304,p:0.3,c:82,f:0,cat:'disp',step:50},
  cacao:{n:'Cacao amaro',k:220,p:20,c:11,f:11,cat:'disp',step:50},
  arachidi:{n:'Crema di arachidi (100%)',k:600,p:25,c:14,f:50,cat:'disp',step:100},
  fsecca:{n:'Frutta secca (mandorle, noci)',k:600,p:20,c:7,f:54,cat:'disp',step:50},
  barretta:{n:'Barretta proteica',k:400,p:40,c:36,f:14,cat:'disp',piece:{g:50,l:'barrette'}},
  soia:{n:'Salsa di soia',k:60,p:6,c:6,f:0,cat:'disp',step:50},
  succo:{n:"Succo d'arancia",k:40,p:0.7,c:9,f:0.2,cat:'bev',step:250,unit:'ml'},
  verdure:{n:'Verdure miste cotte',k:25,p:1.8,c:3.5,f:0.3,cat:'verd',step:100},
  frutta:{n:'Frutta fresca di stagione',k:55,p:0.7,c:12,f:0.3,cat:'verd',step:100},
  pizza:{n:'Pizza margherita',k:270,p:11,c:33,f:10,cat:'disp',step:100}
};

// ---- MENU: 5 pasti, ognuno con alternative intercambiabili ----
// Configurazione che dipende dal profilo (impostata da applyCfg in profile.js)
const CFG = {eatOut:true, trainMode:'mattina', powder:false, snacks:true, lactoseFree:false, glutenFree:false, veg:false, fruit:false, excl:[]};
const SLOT_DEF = {colazione:'Colazione', spuntino:'Spuntino', pre:'Pre workout', post:"Dopo l'allenamento", pranzo:'Pranzo', merenda:'Merenda', cena:'Cena'};
const SLOTS = Object.entries(SLOT_DEF).map(([id,n])=>({id,n})); // tutti i pasti possibili (per il diario)
const slotsFor = (train, d) => {
  const l = train.includes(d) ? (CFG.trainMode==='mattina' ? ['colazione','pre','post','pranzo','merenda','cena'] : ['colazione','spuntino','pranzo','pre','cena']) : ['colazione','spuntino','pranzo','merenda','cena'];
  return CFG.snacks ? l : l.filter(x => x!=='spuntino' && x!=='merenda');
};
const POOLS = {
  colazione:[
    {n:'Yogurt greco, avena, miele e cacao', i:[['yogurt',250],['avena',60],['miele',15],['cacao',5]]},
    {n:'Uova strapazzate, pane e spremuta', i:[['uova',120],['albume',60],['pane',70],['succo',200]]},
    {n:'Pancake proteici all\'avena', i:[['avena',60],['albume',120],['uova',60],['cacao',5],['miele',10],['arachidi',10]]},
    {n:'Latte, cereali integrali e yogurt', i:[['latte',250],['cereali',70],['yogurt',125]]},
    {n:'Pane con ricotta e miele, latte', i:[['pane',80],['ricotta',80],['miele',15],['latte',150]]}
  ],
  spuntino:[
    {n:'Yogurt greco con miele e frutta secca', i:[['yogurt',170],['miele',10],['fsecca',10]]},
    {n:'Gallette con crema di arachidi', i:[['gallette',25],['arachidi',12]]},
    {n:'Barretta proteica', i:[['barretta',50]]},
    {n:'Manciata di frutta secca', i:[['fsecca',30]]},
    {n:'Ricotta con miele', i:[['ricotta',100],['miele',10]]}
  ],
  pre:[
    {n:"Pre workout in polvere (400 ml d'acqua)", fixed:{k:10,p:0,c:2,f:0}}
  ],
  post:[
    {n:'Yogurt greco, avena e miele', i:[['yogurt',200],['avena',40],['miele',15]]},
    {n:'Barretta proteica e gallette', i:[['barretta',50],['gallette',30]]},
    {n:'Panino con tacchino arrosto e ricotta', i:[['pane',80],['tacarr',60],['ricotta',40]]},
    {n:'Latte con cereali integrali', i:[['latte',250],['cereali',60]]},
    {n:"Pancake proteici all'avena", i:[['albume',120],['avena',40],['uova',60],['miele',10]]}
  ],
  pranzo:[
    {n:'Pollo, riso e olio', i:[['pollo',160],['riso',90],['olio',12]]},
    {n:'Pasta al ragù di manzo', i:[['pasta',80],['manzo',120],['passata',150],['olio',5],['parmigiano',10]]},
    {n:'Riso e tonno', i:[['riso',90],['tonno',120],['olio',15]]},
    {n:'Piadina con pollo e uovo', i:[['piadina',100],['pollo',120],['uova',60],['olio',8]]},
    {n:'Riso alla cantonese semplice', i:[['riso',90],['uova',120],['prosciutto',40],['soia',10],['olio',10]]},
    {n:'Pasta al tonno e pomodoro', i:[['pasta',85],['tonno',100],['passata',150],['olio',15]]}
  ],
  merenda:[
    {n:'Panino con tacchino arrosto', i:[['pane',60],['tacarr',50],['olio',3]]},
    {n:'Yogurt greco con cereali', i:[['yogurt',200],['cereali',30]]},
    {n:'Pane con ricotta e miele', i:[['pane',60],['ricotta',40],['miele',10]]},
    {n:'Barretta proteica e gallette', i:[['barretta',50],['gallette',10]]}
  ],
  cena:[
    {n:'Pollo alla piastra e patate al forno', i:[['pollo',170],['patate',300],['olio',15]]},
    {n:'Hamburger di manzo con pane e patate', i:[['manzo',150],['pane',70],['patate',150],['olio',8]]},
    {n:'Frittata di 3 uova con patate', i:[['uova',180],['patate',250],['parmigiano',15],['olio',8]]},
    {n:'Pesce bianco con pane e patate', i:[['pesce',220],['pane',80],['patate',100],['olio',12]]},
    {n:'Pasta al forno semplice', i:[['pasta',80],['manzo',80],['passata',120],['parmigiano',20],['olio',5]]},
    {n:'Tacchino e riso', i:[['tacchino',180],['riso',80],['olio',10]]}
  ]
};
// cene fuori del weekend: valori stimati per porzione (non cucinati da te)
const OUT = [
  {n:'Pizza margherita intera', i:[['pizza',300]]},
  {n:'Ristorante: primo + secondo con contorno', fixed:{k:850,p:40,c:95,f:30}},
  {n:'Hamburger con patatine', fixed:{k:900,p:40,c:80,f:45}},
  {n:'Sushi (circa 18 pezzi)', fixed:{k:750,p:35,c:100,f:20}}
];
const QUICK = [
  {n:'Pre workout in polvere',k:10,p:0,c:2,f:0},
  {n:'Bibita zero',k:0,p:0,c:0,f:0},
  {n:'Birra media (330 ml)',k:140,p:1,c:12,f:0},
  {n:'Calice di vino',k:120,p:0,c:4,f:0},
  {n:'Cocktail',k:200,p:0,c:20,f:0},
  {n:'Cioccolata calda leggera',k:150,p:6,c:22,f:4}
];
const DAYS = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
const DAYS_LONG = ['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'];
const TARGET_KCAL = 2000, TARGET_P = 120, TARGET_F = 60; // valori di partenza prima del profilo

function defaultPlan(w=0, allow, snacks=true){
  // allow: {slot:[indici permessi]}; senza allow vale tutto
  const pick = (slot, n, fallbackLen) => {
    const list = allow && allow[slot] && allow[slot].length ? allow[slot] : [...Array(fallbackLen).keys()];
    return list[((n % list.length) + list.length) % list.length];
  };
  const plan = [];
  for(let d=0; d<7; d++){
    const we = d>=5;
    plan.push({
      pre: 0,
      post: pick('post', d + w, 5),
      colazione: pick('colazione', d + w, 5),
      spuntino: snacks ? pick('spuntino', d + 1 + w*2, 5) : -1,
      pranzo: pick('pranzo', d + w*2, 6),
      merenda: (we || !snacks) ? -1 : pick('merenda', d + w, 4),
      cena: we ? (CFG.eatOut ? ((d-5) + w) % 4 : pick('cena', (d-5) + w, 6)) : pick('cena', d + 2 + w*2, 6)
    });
  }
  return plan;
}
const PLAN_WEEKS = 4;
const allPlans = (allow, snacks) => [...Array(PLAN_WEEKS)].map((_,w)=>defaultPlan(w, allow, snacks));
function poolFor(day, slot){
  if(slot==='cena' && day>=5 && CFG.eatOut) return OUT;
  if(slot==='pre'){
    if(CFG.trainMode==='mattina' && CFG.powder) return POOLS.pre;
    return CFG.trainMode==='mattina' ? POOLS.spuntino : POOLS.merenda;
  }
  return POOLS[slot];
}
// chiave della ricetta per un pasto (il "pre" senza polvere usa le ricette di spuntino/merenda)
function recKey(slot, idx){
  if(slot==='pre' && !(CFG.trainMode==='mattina' && CFG.powder)) return (CFG.trainMode==='mattina' ? 'spuntino' : 'merenda')+':'+idx;
  return slot+':'+idx;
}
function mealMacros(m){
  if(!m) return {k:0,p:0,c:0,f:0};
  if(m.fixed) return {...m.fixed};
  const t = {k:0,p:0,c:0,f:0};
  for(const [id,g] of m.i){ const x=F[id]; t.k+=x.k*g/100; t.p+=x.p*g/100; t.c+=x.c*g/100; t.f+=x.f*g/100; }
  return t;
}

function mergePlan(p, w=0){
  const def = defaultPlan(w);
  return def.map((x,d)=>({...x, ...((p && p[d]) || {})}));
}
function dayTotals(plan, d, train=[]){
  const t = {k:0,p:0,c:0,f:0};
  for(const sid of slotsFor(train,d)){
    const idx = plan[d][sid]; if(idx<0) continue;
    const m = poolFor(d,sid)[idx]; if(!m) continue;
    const x = mealMacros(m); t.k+=x.k; t.p+=x.p; t.c+=x.c; t.f+=x.f;
  }
  return t;
}
function shoppingList(plan, train=[], scaleFn){
  const tot = {};
  for(let d=0; d<7; d++) for(const sid of slotsFor(train,d)){
    const idx = plan[d][sid]; if(idx<0) continue;
    if(d>=5 && sid==='cena' && CFG.eatOut) continue; // cena fuori: non si compra
    const m = poolFor(d,sid)[idx]; if(!m || m.fixed) continue;
    const f = scaleFn ? scaleFn(d) : 1;
    const extra = [...(CFG.veg && (sid==='pranzo'||sid==='cena') ? [['verdure',200]] : []), ...(CFG.fruit && (sid==='spuntino'||sid==='merenda'||sid==='pre') ? [['frutta',150]] : [])];
    for(const [id,g] of [...m.i, ...extra]) tot[id] = (tot[id]||0)+g*f;
  }
  return tot;
}

// ---- orari consigliati (scuola 14-18, auto 13 e 18-19) ----
const TIMES = {colazione:'08:15', spuntino:'10:30', pre:'08:40', post:'10:45', pranzo:'12:30', merenda:'16:30', cena:'19:45'};
const HINTS = {pranzo:'Mangia entro le 12:45, prima di partire', merenda:'Da portare con te, per scuola o auto'};
const TRAIN_HINTS = {pre:"Mescola la dose in 400 ml d'acqua, circa 20-30 minuti prima della palestra", post:"La tua merenda dopo la palestra, entro un'ora dalla fine dell'allenamento"};
// resa media da crudo a cotto (peso)
const YIELD = {riso:2.5, pasta:2.2, pollo:0.75, tacchino:0.75, manzo:0.75, patate:0.85};
const COOK = new Set(Object.keys(YIELD));
// piatti da fare al momento (non si preparano in anticipo)
POOLS.pranzo[3].fresh = true; // piadina
POOLS.cena[2].fresh = true;   // frittata
POOLS.cena[3].fresh = true;   // pesce
const BATCHES = [
  {id:'a', n:'Lunedì mattina', sub:'Per lunedì, martedì e mercoledì (dopo la palestra)', days:[0,1,2], cookDay:0},
  {id:'b', n:'Mercoledì sera', sub:'Per giovedì, venerdì e sabato', days:[3,4,5], cookDay:2}
];

const LAB_TESTS = {
  glicemia:{n:'Glicemia a digiuno',u:'mg/dL',min:70,max:99},
  colTot:{n:'Colesterolo totale',u:'mg/dL',max:200},
  hdl:{n:'Colesterolo HDL',u:'mg/dL',min:40},
  ldl:{n:'Colesterolo LDL',u:'mg/dL',max:130},
  trig:{n:'Trigliceridi',u:'mg/dL',max:150},
  tsh:{n:'TSH',u:'mUI/L',min:0.4,max:4},
  emo:{n:'Emoglobina',u:'g/dL',min:13.5,max:17.5},
  ferr:{n:'Ferritina',u:'ng/mL',min:30,max:400},
  vitd:{n:'Vitamina D (25-OH)',u:'ng/mL',min:30,max:100},
  got:{n:'AST (GOT)',u:'U/L',max:40},
  gpt:{n:'ALT (GPT)',u:'U/L',max:41},
  creat:{n:'Creatinina',u:'mg/dL',min:0.7,max:1.3},
  hba1c:{n:'Emoglobina glicata (HbA1c)',u:'%',max:5.7}
};
const MEASURES = [['vita','Vita'],['fianchi','Fianchi'],['petto','Petto'],['braccio','Braccio'],['coscia','Coscia']];

// ---- ricette: [minuti, [passaggi]] per "pasto:indice" ----
const REC = {
 'colazione:0':[3,['Versa lo yogurt in una ciotola.','Aggiungi l\'avena, il miele e il cacao.','Mescola: se la vuoi più morbida, lascia riposare 5 minuti.']],
 'colazione:1':[10,['Scalda una padella antiaderente con un filo d\'olio o poca acqua.','Sbatti le uova con l\'albume e un pizzico di sale, versale e mescola a fuoco medio finché sono cotte.','Tosta il pane e servi con la spremuta.']],
 'colazione:2':[12,['Frulla o mescola avena, albume, uovo e cacao fino a un impasto liscio.','Cuoci piccole porzioni in padella antiaderente 2 minuti per lato.','Servi con miele e crema di arachidi.']],
 'colazione:3':[3,['Versa il latte in una ciotola con i cereali.','Aggiungi lo yogurt greco a parte o sopra.']],
 'colazione:4':[4,['Taglia il pane e spalmaci la ricotta.','Aggiungi il miele.','Accompagna con il latte, freddo o caldo.']],
 'spuntino:0':[2,['Metti lo yogurt in un contenitore.','Aggiungi miele e frutta secca tritata.']],
 'spuntino:1':[2,['Spalma la crema di arachidi sulle gallette.']],
 'spuntino:2':[0,['Nessuna preparazione: portala con te.']],
 'spuntino:3':[0,['Porta la frutta secca in un sacchetto: pesa 30 g la prima volta e usa quella misura.']],
 'spuntino:4':[2,['Metti la ricotta in una ciotola.','Condisci con il miele.']],
 'pre:0':[1,['Versa la dose indicata sull\'etichetta in 400 ml d\'acqua.','Agita bene e bevi circa 20-30 minuti prima della palestra.']],
 'post:0':[3,['Mescola lo yogurt greco con l\'avena.','Aggiungi il miele.']],
 'post:1':[1,['Mangia la barretta con le gallette.','Puoi avere bisogno di un bicchiere d\'acqua.']],
 'post:2':[3,['Taglia il pane e farcisci con il tacchino arrosto.','Aggiungi uno strato di ricotta.']],
 'post:3':[2,['Versa il latte sui cereali integrali.']],
 'post:4':[12,['Mescola albume, uovo e avena in un impasto liscio.','Cuoci in padella antiaderente, 2 minuti per lato.','Condisci con il miele.']],
 'pranzo:0':[25,['Cuoci il riso in acqua salata (circa 12-15 minuti) e scolalo.','Cuoci il petto di pollo in padella con poco olio, 5-6 minuti per lato, fino a doratura al centro.','Taglia il pollo, unisci al riso e condisci con l\'olio a crudo.']],
 'pranzo:1':[30,['Rosola il macinato in padella con un filo d\'olio.','Aggiungi la passata e cuoci 10-12 minuti, con sale e pepe.','Cuoci la pasta al dente, scolala e condisci con il ragù e il parmigiano.']],
 'pranzo:2':[20,['Cuoci il riso e scolalo.','Scola il tonno e uniscilo al riso.','Condisci con olio, limone e un pizzico di sale.']],
 'pranzo:3':[15,['Cuoci il pollo a fettine in padella, 3-4 minuti per lato.','Cuoci l\'uovo (sodo o all\'occhio di bue).','Scalda la piadina e farciscila con il pollo e l\'uovo.']],
 'pranzo:4':[20,['Cuoci il riso e lascialo raffreddare un po\'.','In padella rosola il prosciutto a dadini con un filo d\'olio, aggiungi le uova sbattute e mescola.','Unisci il riso, la salsa di soia e salta 2-3 minuti.']],
 'pranzo:5':[20,['Scalda la passata in padella con un filo d\'olio per 8-10 minuti.','Cuoci la pasta al dente.','Unisci il tonno scolato al sugo e condisci la pasta.']],
 'merenda:0':[3,['Taglia il pane e farcisci con il tacchino arrosto.','Aggiungi un filo d\'olio.']],
 'merenda:1':[2,['Versa lo yogurt in un contenitore e aggiungi i cereali all\'ultimo, per tenerli croccanti.']],
 'merenda:2':[3,['Spalma la ricotta sul pane.','Aggiungi il miele.']],
 'merenda:3':[0,['Nessuna preparazione: barretta e gallette nello zaino.']],
 'cena:0':[40,['Scalda il forno a 200 °C. Taglia le patate a spicchi, condiscile con olio e sale e infornale per 30-35 minuti.','Cuoci il pollo alla piastra, 5-6 minuti per lato.','Servi con le patate.']],
 'cena:1':[25,['Forma l\'hamburger con il macinato e un pizzico di sale.','Cuocilo in padella o sulla piastra, 4-5 minuti per lato, fino a cottura al centro.','Servi nel pane, con le patate (al forno o in padella).']],
 'cena:2':[30,['Taglia le patate a cubetti e cuocile in padella con un po\' d\'olio e coperchio, 15 minuti.','Sbatti le uova con il parmigiano e un pizzico di sale, versale sulle patate.','Cuoci 4-5 minuti per lato, girando la frittata con un piatto.']],
 'cena:3':[25,['Condisci il pesce con olio, limone e un pizzico di sale.','Cuocilo in padella o al forno a 200 °C per 10-12 minuti.','Servi con il pane e le patate.']],
 'cena:4':[45,['Cuoci la pasta molto al dente. Prepara un ragù veloce con manzo e passata (15 minuti).','In una pirofila alterna pasta, ragù e parmigiano.','Gratina in forno a 200 °C per 15 minuti.']],
 'cena:5':[25,['Cuoci il riso e scolalo.','Cuoci il tacchino a fette in padella con un filo d\'olio, 4-5 minuti per lato.','Servi insieme e condisci con l\'olio a crudo.']]
};
