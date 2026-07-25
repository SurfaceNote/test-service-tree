const assert=require('node:assert/strict');
const engine=require('../assets/diagnostics-engine.js');
const recommendations=require('../assets/diagnostics-recommendations.js');
const compact=value=>String(value).replace(/[\s\u00a0\u202f]+/g,' ');

const one=engine.calculate([{rev:4820000,exp:4136000,cash:620000,liab:850000,over:620000,debt:1100000,stock:440000}],'services');
const oneModel=recommendations.build(one);
const oneText=compact(JSON.stringify(oneModel));
assert.equal(one.status,'Высокий риск');
assert.ok(oneModel.items.length>=5,'Для месячного расчёта нужны краткие рекомендации по ключевым показателям.');
assert.match(oneText,/230 000 ₽/,'Должен быть указан кассовый дефицит.');
assert.match(oneText,/2 137 333 ₽/,'Должен быть указан разрыв денежного резерва.');
assert.match(oneText,/183 600 ₽/,'Должен быть указан разрыв прибыли до ориентира маржи.');
assert.match(oneText,/41 600 ₽/,'Должна быть указана минимальная сумма сокращения просрочки.');
assert.ok(oneModel.items.some(item=>item.title==='Покрытие обязательств'&&item.priority==='critical'));
assert.ok(oneModel.items.some(item=>item.title==='Денежный резерв'&&item.priority==='critical'));
assert.ok(oneModel.items.every(item=>item.recommendation.length<320),'Рекомендации должны оставаться краткими.');

const three=engine.calculate([
  {rev:4300000,exp:3900000,cash:520000,liab:790000,over:700000,debt:1200000,stock:400000},
  {rev:4650000,exp:4050000,cash:570000,liab:820000,over:660000,debt:1150000,stock:420000},
  {rev:4820000,exp:4136000,cash:620000,liab:850000,over:620000,debt:1100000,stock:440000}
],'services');
const threeModel=recommendations.build(three);
const growth=threeModel.items.find(item=>item.title==='Динамика выручки');
assert.ok(growth,'Для трёх месяцев нужна краткая рекомендация по динамике выручки.');
assert.equal(growth.priority,'positive');
assert.match(compact(growth.current),/12,1%/);
assert.match(compact(growth.recommendation),/денежным потоком/,'Рост должен интерпретироваться вместе с денежным положением.');

const missing=engine.calculate([{rev:1000000,exp:900000,cash:null,liab:null,over:null,debt:null,stock:null}],'services');
const missingModel=recommendations.build(missing);
assert.ok(missingModel.items.filter(item=>item.priority==='data').length>=4,'Пустые поля должны приводить к запросу данных, а не к ложным выводам.');

const html=recommendations.render(one,'Краткие рекомендации по примеру');
assert.match(html,/Краткие рекомендации по примеру/);
assert.match(html,/Обратиться за консультацией/);
assert.match(html,/детально разобрать обязательства/);
assert.match(html,/Это не аудит|не заменяют аудит/);
assert.doesNotMatch(html,/План действий на 90 дней/);
assert.doesNotMatch(html,/Целевые значения и разрывы/);
console.log('Diagnostic recommendations: concise guidance and consultation CTA are correct.');
