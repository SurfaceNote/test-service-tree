const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const page=fs.readFileSync(path.join(root,'assets/diagnostics-v3.js'),'utf8');
const html=fs.readFileSync(path.join(root,'diagnostics/index.html'),'utf8');

assert.match(html,/Методика 2\.6/);
assert.match(html,/Неполные данные оцениваются консервативно/);
assert.match(html,/diagnostics-v3\.js/);
assert.match(html,/diagnostics-v3\.css/);
assert.match(page,/engine\.calculate/);
assert.match(page,/const periodFields=/);
assert.match(page,/const balanceFields=/);
assert.match(page,/Месяц \$\{i\}: доходы и расходы/);
assert.match(page,/Остатки на конец третьего месяца/);
assert.match(page,/visibleBalanceFields=balanceFields\.filter\(\(\[key\]\)=>key!==\'stock\'\|\|config\.stock\)/);
assert.match(page,/text===successRisk\?\'good\':\'\'/);
assert.doesNotMatch(page,/result\.risks\.length===1\?\'good\'/);
assert.match(page,/result\.incomplete\?\'консервативный индекс\'/);
assert.match(page,/result\.scoreRange\?`Возможный диапазон/);
assert.match(page,/aria-controls="panel-\$\{id\}"/);
assert.match(page,/role="tabpanel"/);
assert.match(page,/handleTabKeydown/);
for(const legacy of ['diagnostics-dashboard.js','diagnostics-boundary-fixes.js','diagnostics-layout.js','diagnostics-recommendations.js']){
  assert.doesNotMatch(html,new RegExp(legacy.replace('.','\.')));
}
assert.doesNotMatch(page,/margin:\.18/);
assert.doesNotMatch(page,/function fdCalc/);

console.log('Diagnostics v3 final corrections: all tests passed.');
