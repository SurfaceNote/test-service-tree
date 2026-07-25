const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'diagnostics/index.html'),'utf8');
const page=fs.readFileSync(path.join(root,'assets/diagnostics-v3.js'),'utf8');

assert.match(html,/Экспресс-диагностика финансовой устойчивости/);
assert.match(html,/Полнота данных учитывается отдельно/);
assert.match(html,/diagnostics-v3\.js/);
assert.match(html,/diagnostics-v3\.css/);
for(const legacy of ['diagnostics-dashboard.js','diagnostics-boundary-fixes.js','diagnostics-layout.js','diagnostics-recommendations.js']){
  assert.doesNotMatch(html,new RegExp(legacy.replace('.','\\.')));
}
assert.match(page,/engine\.calculate/);
assert.match(page,/data-result-tab="recommendations"/);
assert.match(page,/completenessValue/);
assert.doesNotMatch(page,/margin:\.18/);
assert.doesNotMatch(page,/function fdCalc/);

console.log('Diagnostics v3 architecture: all tests passed.');
