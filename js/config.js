// Configurazione pubblica (nessun segreto qui).
// proxyUrl: indirizzo del servizio che parla con Claude per conto dell'app. Vuoto = assistente spento.
// Se proxyUrl è vuoto, l'assistente usa la chiave personale salvata sul telefono (modalità "solo io").
// I prezzi servono solo per la stima di spesa mostrata nell'app (dollari per milione di token).
window.CONFIG = {
  proxyUrl: '',
  appVersion: '2026-11-25.2',
  model: 'claude-haiku-5-5',
  priceIn: 0.10,
  priceOut: 0.50,
  models: {
    haiku:  {id:'claude-haiku-5-5',  label:'Haiku (economico, veloce)', priceIn:0.10, priceOut:0.50},
    sonnet: {id:'claude-sonnet-5-5', label:'Sonnet (più accurato)',     priceIn:2.00, priceOut:10.00, effort:'medium'}
  }
};
