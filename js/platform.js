// ---- funzioni della piattaforma: file, assistente (servizio) ----
function guessMime(name){
  const e = name.split('.').pop().toLowerCase();
  return {json:'application/json', csv:'text/csv;charset=utf-8', html:'text/html;charset=utf-8', ics:'text/calendar;charset=utf-8'}[e] || 'application/octet-stream';
}
// Salva un file: su telefono apre il foglio di condivisione (Salva su File), altrimenti scarica.
function saveFile(filename, data, mime){
  const type = mime || guessMime(filename);
  const blob = new Blob([data], {type});
  const download = () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  };
  try{
    const file = new File([blob], filename, {type});
    if(/iPhone|iPad|Android/i.test(navigator.userAgent) && navigator.canShare && navigator.canShare({files:[file]})){
      return navigator.share({files:[file], title:filename}).catch(e => {
        if(e && e.name==='AbortError'){ const err = new Error('declined'); err.code = 'declined'; throw err; }
        download();
      });
    }
  }catch(e){}
  download(); return Promise.resolve();
}
S.dl = {save:o => saveFile(o.filename, o.data)};

// ---- assistente: parla con il servizio, che parla con Claude ----
const AI = {
  mode(){ return (window.CONFIG && CONFIG.proxyUrl) ? 'proxy' : 'key'; },
  enabled(){ return this.mode()==='proxy' ? !!S.settings.aiCode : !!Secret.get('apikey'); },
  fail(status, j){
    const msg = (j && j.error && (j.error.message || j.error)) || ('HTTP '+status);
    const e = new Error(String(msg)); e.status = status;
    if(status===401 || status===403) e.code = 'not_granted';
    else if(status===429) e.code = 'rate_limited';
    else if(/credit balance/i.test(String(msg))) e.code = 'no_credit';
    else e.code = 'upstream';
    return e;
  },
  countUsage(j){
    try{
      const u = j && j.usage; if(!u) return;
      const m = todayStr().slice(0,7), cur = S.settings.usage && S.settings.usage.month===m ? S.settings.usage : {month:m, inTok:0, outTok:0, calls:0};
      cur.inTok += (u.input_tokens||0) + (u.cache_creation_input_tokens||0) + (u.cache_read_input_tokens||0); cur.outTok += u.output_tokens||0; cur.calls += 1;
      S.settings.usage = cur; saveSettings();
    }catch(e){}
  },
  async call(body, signal){
    let r;
    const direct = this.mode()==='key';
    try{
      if(direct) r = await fetch('https://api.anthropic.com/v1/messages', {method:'POST', signal,
        headers:{'content-type':'application/json','x-api-key':Secret.get('apikey'),'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
        body:JSON.stringify({model:CONFIG.model, max_tokens:2000, ...body})});
      else r = await fetch(CONFIG.proxyUrl, {method:'POST', headers:{'content-type':'application/json','x-access-code':S.settings.aiCode}, body:JSON.stringify(body), signal});
    }catch(e){ if(e && e.name==='AbortError'){ const x = new Error('cancelled'); x.code='cancelled'; throw x; } const x = new Error('rete'); x.code='network'; throw x; }
    const j = await r.json().catch(()=>null);
    if(!r.ok) throw this.fail(r.status, j);
    this.countUsage(j);
    return j;
  }
};
const usageCost = () => { const u = S.settings.usage; return u && u.month===todayStr().slice(0,7) ? (u.inTok*CONFIG.priceIn + u.outTok*CONFIG.priceOut)/1e6 : 0; };
function blobToImageBlock(blob){
  return new Promise((res,rej)=>{
    const fr = new FileReader();
    fr.onerror = () => rej(new Error('lettura'));
    fr.onload = () => {
      const im = new Image();
      im.onerror = () => { const e = new Error('immagine'); e.code='image_rejected'; rej(e); };
      im.onload = () => {
        const k = Math.min(1, 1280/Math.max(im.naturalWidth, im.naturalHeight));
        const c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth*k); c.height = Math.round(im.naturalHeight*k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        res({type:'image', source:{type:'base64', media_type:'image/jpeg', data:c.toDataURL('image/jpeg',0.8).split(',')[1]}});
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(blob);
  });
}
async function aiSample(input, opts){
  opts = opts || {};
  const raw = typeof input==='string' ? [{role:'user', content:input}] : input;
  const messages = [];
  for(const m of raw){
    const block = {type:'text', text:m.content};
    if(messages.length && messages[messages.length-1].role===m.role) messages[messages.length-1].content.push(block);
    else messages.push({role:m.role, content:[block]});
  }
  if(opts.images && opts.images.length){
    const last = messages[messages.length-1];
    for(const b of [].concat(opts.images)) last.content.push(await blobToImageBlock(b));
  }
  const tools = (opts.tools||[]).map(t => ({name:t.name, description:t.description, input_schema:t.inputSchema||{type:'object',properties:{}}}));
  const parts = []; let last = null;
  for(let round=0; round<7; round++){
    try{ last = await AI.call({messages, ...(tools.length?{tools}:{})}, opts.signal); }
    catch(e){ if(parts.length) e.text = parts.join('\n\n'); throw e; }
    const txt = (last.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('').trim();
    if(txt){ parts.push(txt); if(opts.onText) opts.onText({text:parts.join('\n\n')}); }
    messages.push({role:'assistant', content:last.content});
    if(last.stop_reason!=='tool_use') break;
    const results = [];
    for(const b of (last.content||[]).filter(b=>b.type==='tool_use')){
      const t = (opts.tools||[]).find(x=>x.name===b.name);
      try{
        if(!t) throw new Error('strumento sconosciuto');
        const out = await t.execute(b.input||{});
        results.push({type:'tool_result', tool_use_id:b.id, content:JSON.stringify(out===undefined?{ok:true}:out)});
      }catch(e){ results.push({type:'tool_result', tool_use_id:b.id, is_error:true, content:String(e && e.message || e)}); }
    }
    messages.push({role:'user', content:results});
  }
  return {text:parts.join('\n\n').trim(), truncated:!!(last && last.stop_reason==='max_tokens')};
}
aiSample.json = async function(input, opts){
  const r = await aiSample(input, opts), t = r.text;
  const a = Math.min(...['[','{'].map(ch=>{ const i=t.indexOf(ch); return i<0?1e9:i; })), b = Math.max(t.lastIndexOf(']'), t.lastIndexOf('}'));
  try{ return JSON.parse(t.slice(a, b+1)); }catch(e){ const x = new Error('json'); x.code='invalid_json'; x.text=t; throw x; }
};
function refreshAI(){
  S.sample = AI.enabled() ? aiSample : null;
  S.imgLimits = S.sample ? {maxCount:1, mediaTypes:['image/jpeg','image/png','image/webp','image/gif']} : null;
}
