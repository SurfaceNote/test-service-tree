const assert=require('node:assert/strict');
const engine=require('../assets/diagnostics-engine.js');

const one=[{rev:4820000,exp:4136000,cash:620000,liab:850000,over:620000,debt:1100000,stock:440000}];
const three=[
  {rev:4300000,exp:3900000,cash:520000,liab:790000,over:700000,debt:1200000,stock:400000},
  {rev:4650000,exp:4050000,cash:570000,liab:820000,over:660000,debt:1150000,stock:420000},
  {rev:4820000,exp:4136000,cash:620000,liab:850000,over:620000,debt:1100000,stock:440000}
];
const close=(actual,expected,tolerance=1e-6)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} differs from ${expected}`);

// Полный пример сохраняет точный расчёт и получает итоговый статус.
{
  const result=engine.calculate(one,'services');
  assert.equal(result.valid,true);
  close(result.observedScore,49.60611101695133,1e-9);
  close(result.rawScore,49.60611101695133,1e-9);
  assert.equal(result.score,50);
  assert.equal(result.status,'Высокий риск');
  assert.equal(result.completeness,100);
  assert.equal(result.provisional,false);
}

// Только выручка и расходы не могут дать статус «устойчивый», даже при высокой марже.
{
  const partial=engine.calculate([{rev:1000000,exp:700000,cash:null,liab:null,over:null,debt:null,stock:null}],'services');
  assert.equal(partial.valid,true);
  assert.equal(partial.observedScore,100);
  assert.equal(partial.score,null);
  assert.equal(partial.rawScore,null);
  assert.equal(partial.status,'Предварительный результат');
  assert.equal(partial.provisional,true);
  close(partial.completeness,27.77777777777778,1e-9);
  close(partial.scoreRange.min,27.77777777777778,1e-9);
  assert.equal(partial.scoreRange.max,100);
  assert.match(partial.risks[0],/Полнота данных 28%/);
}

// При полноте выше порога итоговый статус снова разрешён.
{
  const enough=engine.calculate([{rev:1000,exp:800,cash:500,liab:400,over:0,debt:null,stock:null}],'services');
  close(enough.completeness,88.88888888888889,1e-9);
  assert.equal(enough.provisional,false);
  assert.notEqual(enough.score,null);
  assert.notEqual(enough.status,'Предварительный результат');
}

// Нулевые обязательства считаются полноценным положительным фактором, а не пропуском данных.
{
  const noLiabilities=engine.calculate([{rev:100,exp:80,cash:20,liab:0,over:0,debt:0,stock:null}],'services');
  assert.equal(noLiabilities.noLiabilities,true);
  assert.ok(noLiabilities.f.some(factor=>factor.key==='coverage'&&factor.score===100));
  assert.equal(noLiabilities.completeness,100);
}

// Пустое значение исключается, настоящий ноль остаётся входным значением.
{
  const missing=engine.calculate([{rev:100,exp:80,cash:null,liab:null,over:null,debt:null,stock:null}],'services');
  assert.deepEqual(missing.f.map(f=>f.key),['profit']);
  assert.ok(missing.missing.includes('деньги'));

  const zeros=engine.calculate([{rev:100,exp:80,cash:0,liab:100,over:0,debt:0,stock:null}],'services');
  assert.ok(zeros.f.some(f=>f.key==='coverage'&&f.score===0));
  assert.ok(zeros.f.some(f=>f.key==='reserve'&&f.score===0));
  assert.ok(zeros.f.some(f=>f.key==='over'&&f.score===100));
  assert.ok(zeros.f.some(f=>f.key==='debt'&&f.score===100));
}

// Отрицательная прибыль строится ниже нулевой линии.
{
  const geometry=engine.barGeometry([400,-200,100],20,200);
  assert.equal(geometry.bars[0].direction,'positive');
  assert.ok(geometry.bars[0].y<geometry.zeroY);
  assert.equal(geometry.bars[1].direction,'negative');
  assert.equal(geometry.bars[1].y,geometry.zeroY);
  assert.ok(geometry.bars[1].height>0);
}

// Проверены три месяца и нулевые знаменатели.
{
  const result=engine.calculate(three,'services');
  assert.equal(result.rev,13770000);
  assert.equal(result.exp,12086000);
  assert.equal(result.profit,1684000);
  close(result.avgRev,4590000);
  close(result.avgExp,4028666.6666666665);
  close(result.growth,0.12093023255813962,1e-12);
  close(result.rawScore,49.197585015218,1e-9);
  assert.equal(result.score,49);
  assert.equal(result.status,'Высокий риск');
  assert.equal(result.completeness,100);

  const zero=engine.calculate([{rev:0,exp:0,cash:0,liab:0,over:0,debt:0,stock:0}],'services');
  assert.equal(zero.valid,true);
  assert.equal(zero.noLiabilities,true);
  assert.equal(zero.rawScore,null);
  assert.equal(zero.score,null);
  assert.equal(zero.status,'Предварительный результат');
  for(const value of [zero.margin,zero.coverage,zero.reserve,zero.over,zero.debt])assert.equal(value,null);

  const noRevenueLoss=engine.calculate([{rev:0,exp:100,cash:null,liab:null,over:null,debt:null,stock:null}],'services');
  assert.equal(noRevenueLoss.margin,-1);
  assert.ok(noRevenueLoss.f.some(f=>f.key==='profit'&&f.score===0));
  assert.equal(noRevenueLoss.status,'Предварительный результат');
}

// Обязательные поля не подменяются нулём.
{
  const invalid=engine.calculate([{rev:null,exp:100,cash:0,liab:0,over:0,debt:0,stock:0}],'services');
  assert.equal(invalid.valid,false);
  assert.match(invalid.errors[0],/выручка/i);
}

console.log('Diagnostics engine 2.5: all tests passed.');
