const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const source=fs.readFileSync(path.join(__dirname,'..','assets','diagnostics-layout.js'),'utf8');
assert.match(source,/Примеры результата за 1 и 3 месяца/);
assert.match(source,/Рассчитайте финансовую устойчивость/);
assert.match(source,/container\.insertBefore\(calculatorTitle,examples\)/);
assert.match(source,/container\.insertBefore\(calculator,examples\)/);
assert.match(source,/Сначала выберите период и рассчитайте показатели своего бизнеса/);
console.log('Diagnostics layout: calculator precedes example dashboards.');
