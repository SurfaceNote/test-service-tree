(function(root){
  'use strict';

  // Compatibility entry point for pages that still load the former shared
  // diagnostics script before assets/pages.js. The real calculator is
  // implemented in diagnostics-engine.js and diagnostics-v3.js.
  if(typeof root.diagnosticsPage==='function')return;

  root.diagnosticsPage=function(){
    if(typeof layout!=='function')return;
    layout(`<section class="section"><div class="container status"><b>↗</b><h1>Диагностика обновлена</h1><p>Откройте актуальную версию финансовой диагностики.</p><a class="btn primary" href="${typeof rel==='function'?rel('diagnostics/'):'./'}">Перейти к диагностике</a></div></section>`);
  };
})(typeof globalThis!=='undefined'?globalThis:this);
