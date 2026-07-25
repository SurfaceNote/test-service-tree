const assert=require('node:assert/strict');
const engine=require('../assets/diagnostics-engine.js');

const one=[{rev:4820000,exp:4136000,cash:620000,liab:850000,over:620000,debt:1100000,stock:440000}];
const three=[
  {rev:4300000,exp:3900000,cash:520000,liab:790000,over:700000,debt:1200000,stock:400000},
  {rev:4650000,exp:4050000,cash:570000,liab:820000,over:660000,debt:1150000,stock:420000},
  {rev:4820000,exp:4136000,cash:620000,liab:850000,over:620000,debt:1100000,stock:440000}
];
const close=(actual,expected,tolerance=1e-6)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} differs from ${expected}`);

// 1. Статус определяется по точному индексу, а не по отображаемому округлённому баллу.
{
  const result=engine.calculate(one,'services');
  assert.equal(result.valid,true);
  close(result.rawScore,49.60611101695133,1e-9);
  assert.equal(result.score,50);
  assert.equal(result.status,'Высокий риск');
}

// 2. Пустое значение исключается, настоящий ноль остаётся полноценным входным значением.
{
  const missing=engine.calculate([{rev:100,exp:80,cash:null,liab:null,over:null,debt:null,stock:null}],'services');
  assert.deepEqual(missing.f.map(f=>f.key),['profit']);
  assert.ok(missing.missing.includes('деньги'));
  assert.ok(missing.missing.includes('краткосрочные обязательства'));

  const zeros=engine.calculate([{rev:100,exp:80,cash:0,liab:100,over:0,debt:0,stock:null}],'services');
  assert.ok(zeros.f.some(f=>f.key==='coverage'&&f.score===0));
  assert.ok(zeros.f.some(f=>f.key==='reserve'&&f.score===0));
  assert.ok(zeros.f.some(f=>f.key==='over'&&f.score===100));
  assert.ok(zeros.f.some(f=>f.key==='debt'&&f.score===100));
}

// 3. Отрицательная прибыль строится ниже нулевой линии, положительная — выше.
{
  const geometry=engine.barGeometry([400,-200,100],20,200);
  assert.equal(geometry.bars[0].direction,'positive');
  assert.ok(geometry.bars[0].y<geometry.zeroY);
  assert.equal(geometry.bars[1].direction,'negative');
  assert.equal(geometry.bars[1].y,geometry.zeroY);
  assert.ok(geometry.bars[1].height>0);
}

// 4. Проверены периоды 1/3 месяца и нулевые знаменатели без Infinity/NaN.
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

  const zero=engine.calculate([{rev:0,exp:0,cash:0,liab:0,over:0,debt:0,stock:0}],'services');
  assert.equal(zero.valid,true);
  assert.equal(zero.noLiabilities,true);
  assert.equal(zero.rawScore,null);
  assert.equal(zero.score,null);
  assert.equal(zero.status,'Недостаточно данных');
  for(const value of [zero.margin,zero.coverage,zero.reserve,zero.over,zero.debt])assert.equal(value,null);
}

// Обязательные поля не подменяются нулём.
{
  const invalid=engine.calculate([{rev:null,exp:100,cash:0,liab:0,over:0,debt:0,stock:0}],'services');
  assert.equal(invalid.valid,false);
  assert.match(invalid.errors[0],/выручка/i);
}

console.log('Diagnostics engine: all boundary tests passed.');
