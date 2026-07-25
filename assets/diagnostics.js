const exampleData={
  one:[{rev:4820000,exp:4136000,cash:620000,liab:850000,over:620000,debt:1100000,stock:440000}],
  three:[
    {rev:4300000,exp:3900000,cash:520000,liab:790000,over:700000,debt:1200000,stock:400000},
    {rev:4650000,exp:4050000,cash:570000,liab:820000,over:660000,debt:1150000,stock:420000},
    {rev:4820000,exp:4136000,cash:620000,liab:850000,over:620000,debt:1100000,stock:440000}
  ]
};
const df=[['rev','Выручка'],['exp','Расходы'],['cash','Деньги на конец месяца'],['liab','Краткосрочные обязательства'],['over','Просроченная дебиторка'],['debt','Кредиты и займы'],['stock','Запасы']];
const cfg={services:{name:'Услуги',margin:.18,reserve:20,over:.12,debt:.55,stock:false},trade:{name:'Торговля',margin:.08,reserve:18,over:.10,debt:.65,stock:true,days:60},manufacturing:{name:'Производство',margin:.12,reserve:25,over:.12,debt:.70,stock:true,days:90},it:{name:'IT',margin:.22,reserve:30,over:.15,debt:.45,stock:false},construction:{name:'Строительство',margin:.10,reserve:30,over:.18,debt:.75,stock:true,days:120},other:{name:'Другое',margin:.12,reserve:22,over:.14,debt:.65,stock:false}};
function diagnosticsPage(){
  layout(hero('Экспресс-диагностика финансовой устойчивости','Выберите расчёт за один месяц или за три месяца. Можно загрузить полностью вымышленный пример ООО «Вектор Сервис»; введённые показатели не сохраняются.','Диагностика')+`<section class="section white"><div class="container"><div class="notice"><b>Методика 2.2:</b> выручка и расходы суммируются за выбранный период, показатели ликвидности и задолженности берутся на конец периода, а динамика рассчитывается только для трёх месяцев.</div><div class="diag"><div class="diag-grid"><form class="diag-form" id="diagForm"><div class="group"><h2>Параметры бизнеса</h2><div class="row"><div class="field"><label for="industry">Отрасль</label><select id="industry">${Object.entries(cfg).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('')}</select></div><div class="field"><label for="period">Период расчёта</label><select id="period"><option value="1">За 1 месяц</option><option value="3" selected>За 3 месяца</option></select></div></div><div class="notice" id="exampleInfo"><b>Вымышленный пример:</b> ООО «Вектор Сервис». Нажмите «Загрузить пример», чтобы заполнить форму данными за выбранный период.</div></div><div id="months"></div><div class="actions"><button class="btn primary" type="submit">Рассчитать</button><button class="btn" id="loadEx" type="button">Загрузить пример</button><button class="btn ghost" id="clearD" type="button">Очистить</button></div></form><section class="diag-result" id="result" aria-live="polite"><div class="score"><div class="ring"><b id="score">—</b><span>/100</span></div><div><span>Ориентировочный уровень</span><h2 id="status">Недостаточно данных</h2><p id="meta">Выберите период и заполните форму.</p></div></div><div class="notice" id="periodSummary"><b>Сводка периода:</b> появится после расчёта.</div><div class="metrics">${[['profit','Прибыль за период'],['margin','Средняя маржа'],['liq','Ликвидность на конец периода'],['reserve','Резерв на конец периода'],['growth','Динамика выручки'],['debt','Долг / среднемесячная выручка']].map(([i,n])=>`<div class="metric"><small id="${i}Label">${n}</small><b id="${i}">—</b></div>`).join('')}</div><h2>Зоны внимания</h2><div id="risks"><div class="risk">Появятся после расчёта.</div></div><h2>Вклад факторов</h2><div class="factors" id="factors"></div><div class="notice"><b>Ограничения:</b> расчёт демонстрационный и не заменяет бухгалтерский, налоговый или финансовый аудит.</div><div class="actions print-hide"><button class="btn" id="printD" type="button">Сохранить в PDF</button><a class="btn primary" href="../contacts/">Обсудить</a></div></section></div></div></div></section>`);
  buildMonths(3);
  $('#diagForm').addEventListener('submit',e=>{e.preventDefault();calcDiag()});
  $('#period').addEventListener('change',()=>{buildMonths(Number($('#period').value));resetDiag();toast(`Выбран расчёт за ${periodText(Number($('#period').value))}`)});
  $('#loadEx').addEventListener('click',loadExample);
  $('#clearD').addEventListener('click',()=>{$$('#diagForm input').forEach(i=>i.value='');resetDiag();toast('Форма очищена')});
  $('#printD').addEventListener('click',()=>window.print());
}
function periodText(count){return count===1?'1 месяц':'3 месяца'}
function buildMonths(count){
  $('#months').innerHTML=Array.from({length:count},(_,idx)=>{const i=idx+1;return `<div class="group"><h2>${count===1?'Данные за месяц':`Месяц ${i}`}</h2><div class="row">${df.map(([k,n])=>`<div class="field"><label for="${k}${i}">${n}</label><input id="${k}${i}" type="number" min="0" inputmode="decimal"></div>`).join('')}</div></div>`}).join('');
}
function loadExample(){
  const count=Number($('#period').value),data=count===1?exampleData.one:exampleData.three;
  $('#industry').value='services';
  data.forEach((month,i)=>df.forEach(([key])=>{const field=$(`#${key}${i+1}`);if(field)field.value=month[key]}));
  calcDiag();
  toast(`Загружен вымышленный пример за ${periodText(count)}`);
}
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),sum=(m,k)=>m.reduce((s,x)=>s+x[k],0),avg=(m,k)=>sum(m,k)/m.length,fmt=v=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:1}).format(v),money=v=>new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(v);
function readMonths(count){return Array.from({length:count},(_,idx)=>{const i=idx+1;return Object.fromEntries(df.map(([k])=>[k,Number($(`#${k}${i}`).value)||0]))})}
function calcDiag(){
  const count=Number($('#period').value),m=readMonths(count),c=cfg[$('#industry').value],periodRev=sum(m,'rev'),periodExp=sum(m,'exp');
  if(!periodRev&&!periodExp){resetDiag();toast('Заполните данные или загрузите пример');return}
  const end=m[m.length-1],avgRev=avg(m,'rev'),avgExp=avg(m,'exp'),profit=periodRev-periodExp,margin=periodRev?profit/periodRev:null,liq=end.liab?end.cash/end.liab:null,reserve=avgExp?end.cash/avgExp*30:null,overS=avgRev?end.over/avgRev:null,debtL=avgRev?end.debt/avgRev:null,growth=count===3&&m[0].rev?m[2].rev/m[0].rev-1:null,stockD=avgExp?end.stock/avgExp*30:null,f=[];
  const add=(n,s,w)=>{if(s!==null&&!Number.isNaN(s))f.push({n,s:Math.round(clamp(s)*100),w})};
  add('Прибыльность',margin===null?null:margin/c.margin,.25);
  add('Ликвидность',liq,.20);
  add('Денежный резерв',reserve===null?null:reserve/c.reserve,.20);
  add('Просрочка',overS===null?null:1-overS/c.over,.15);
  add('Долговая нагрузка',debtL===null?null:1-debtL/c.debt,.10);
  if(count===3)add('Динамика выручки',growth===null?null:(growth+.1)/.3,.10);
  if(c.stock)add('Запасы',stockD===null?null:1-stockD/c.days,.10);
  const totalWeight=f.reduce((s,x)=>s+x.w,0),score=totalWeight?Math.round(f.reduce((s,x)=>s+x.s*x.w,0)/totalWeight):null,status=score===null?'Недостаточно данных':score>=85?'Устойчивый ориентир':score>=70?'Стабильный ориентир':score>=50?'Требует внимания':'Высокий риск';
  $('#score').textContent=score??'—';
  $('#status').textContent=status;
  $('#meta').textContent=`Период: ${periodText(count)}. Отрасль: ${c.name}. Учтено факторов: ${f.length}.`;
  $('#periodSummary').innerHTML=`<b>Сводка за ${periodText(count)}:</b> выручка ${money(periodRev)}, расходы ${money(periodExp)}, среднемесячная выручка ${money(avgRev)}, среднемесячные расходы ${money(avgExp)}.`;
  $('#profitLabel').textContent=count===1?'Прибыль за месяц':'Прибыль за 3 месяца';
  $('#profit').textContent=money(profit);
  $('#margin').textContent=margin===null?'н/д':fmt(margin*100)+'%';
  $('#liq').textContent=liq===null?'нет обязательств':fmt(liq);
  $('#reserve').textContent=reserve===null?'н/д':fmt(reserve)+' дней';
  $('#growth').textContent=count===1?'н/д — нужен период 3 месяца':growth===null?'н/д':fmt(growth*100)+'%';
  $('#debt').textContent=debtL===null?'н/д':fmt(debtL*100)+'%';
  $('#factors').innerHTML=f.map(x=>`<div class="factor"><b>${x.n}</b><div>${x.s}/100</div><div class="bar"><i style="width:${x.s}%"></i></div></div>`).join('');
  const r=[];
  if(profit<0)r.push(`За ${periodText(count)} расходы превысили выручку.`);
  if(liq!==null&&liq<1)r.push('На конец периода недостаточно ликвидных денег для покрытия краткосрочных обязательств.');
  if(reserve!==null&&reserve<c.reserve*.75)r.push('Денежный резерв ниже отраслевого ориентира.');
  if(overS!==null&&overS>c.over)r.push('Высокая просроченная дебиторская задолженность.');
  if(debtL!==null&&debtL>c.debt)r.push('Высокая долговая нагрузка относительно среднемесячной выручки.');
  if(count===3&&growth!==null&&growth<0)r.push('Выручка третьего месяца ниже выручки первого месяца.');
  if(c.stock&&stockD!==null&&stockD>c.days)r.push('Медленная оборачиваемость запасов.');
  if(!r.length)r.push('Критические сигналы по введённым данным не обнаружены.');
  $('#risks').innerHTML=r.map(x=>`<div class="risk ${r.length===1?'good':''}">${x}</div>`).join('');
  toast(`Расчёт за ${periodText(count)} обновлён`);
}
function resetDiag(){
  ['score','profit','margin','liq','reserve','growth','debt'].forEach(i=>$('#'+i).textContent='—');
  $('#status').textContent='Недостаточно данных';
  $('#meta').textContent='Выберите период и заполните форму.';
  $('#periodSummary').innerHTML='<b>Сводка периода:</b> появится после расчёта.';
  $('#profitLabel').textContent=Number($('#period')?.value)===1?'Прибыль за месяц':'Прибыль за 3 месяца';
  $('#factors').innerHTML='';
  $('#risks').innerHTML='<div class="risk">Появятся после расчёта.</div>';
}
