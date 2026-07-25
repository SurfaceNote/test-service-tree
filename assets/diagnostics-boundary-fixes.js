(function(){
  'use strict';
  const engine=globalThis.FinancialDiagnosticsEngine;
  if(!engine)throw new Error('FinancialDiagnosticsEngine is not loaded');
  const isValue=value=>typeof value==='number'&&Number.isFinite(value);
  const maybeMoney=value=>isValue(value)?fdMoney(value):'н/д';
  const maybeNumber=value=>isValue(value)?fdNum(value):'н/д';
  const maybePercent=value=>isValue(value)?fdPct(value):'н/д';
  function factorNote(factor){
    const note=factor.note||{};
    if(factor.key==='profit')return `Маржа ${maybePercent(note.actual)} при ориентире ${maybePercent(note.target)}.`;
    if(factor.key==='coverage')return `Деньги покрывают ${maybePercent(note.actual)} краткосрочных обязательств.`;
    if(factor.key==='reserve')return `Резерв ${maybeNumber(note.actual)} дня при ориентире ${maybeNumber(note.target)} дней.`;
    if(factor.key==='over')return `Просрочка: ${maybePercent(note.actual)} среднемесячной выручки; критическая граница ${maybePercent(note.limit)}.`;
    if(factor.key==='debt')return `Долг: ${maybePercent(note.actual)} среднемесячной выручки; критическая граница ${maybePercent(note.limit)}.`;
    if(factor.key==='growth')return `Выручка третьего месяца к первому: ${maybePercent(note.actual)}.`;
    if(factor.key==='stock')return `Запасы: ${maybeNumber(note.actual)} дня среднемесячных расходов; критическая граница ${maybeNumber(note.limit)} дней.`;
    return '';
  }
  fdCalc=function(months,industry='services'){return engine.calculate(months,industry)};
  fdRead=function(n){
    return Array.from({length:n},(_,index)=>Object.fromEntries(fdFields.map(([key])=>{
      const input=$(`#${key}${index+1}`);
      return [key,input&&input.value.trim()!==''?Number(input.value):null];
    })));
  };
  fdBuildMonths=function(n){
    $('#months').innerHTML=Array.from({length:n},(_,index)=>{
      const i=index+1;
      return `<div class="group"><h2>${n===1?'Данные за месяц':`Месяц ${i}`}</h2><div class="row">${fdFields.map(([key,label])=>{
        const required=key==='rev'||key==='exp';
        return `<div class="field"><label for="${key}${i}">${label}${required?'':' — необязательно'}</label><input id="${key}${i}" type="number" min="0" inputmode="decimal" placeholder="${required?'Введите значение':'Не указано'}" ${required?'required':''}></div>`;
      }).join('')}</div></div>`;
    }).join('');
  };
  fdFactorBars=function(factors,notes=false){
    return `<div class="fd-factors">${factors.map(factor=>`<div class="fd-factor"><div><b>${factor.name}</b><span>${factor.score}/100</span></div><div class="bar"><i style="width:${factor.score}%"></i></div>${notes?`<small>${factorNote(factor)}</small>`:''}</div>`).join('')}</div>`;
  };
  fdBar=function(title,sourceItems){
    const items=sourceItems.filter(item=>isValue(item.value));
    if(!items.length)return `<section class="fd-chart-panel"><div class="fd-chart-title"><h4>${title}</h4><p>Нет данных</p></div><div class="notice">Для графика не указаны значения.</div></section>`;
    const W=640,H=310,L=88,R=28,T=42,B=64,cw=W-L-R,ch=H-T-B,slot=cw/items.length,bw=Math.min(100,slot*.48);
    const geometry=engine.barGeometry(items.map(item=>item.value),T,ch);
    const ticks=Array.from({length:5},(_,index)=>geometry.max-(geometry.max-geometry.min)*index/4);
    const y=value=>T+(geometry.max-value)/(geometry.max-geometry.min||1)*ch;
    const grid=ticks.map(value=>{const gy=y(value);return `<line x1="${L}" y1="${gy}" x2="${W-R}" y2="${gy}" class="fd-grid"/><text x="${L-10}" y="${gy+4}" text-anchor="end" class="fd-axis-text">${fdCompact(value)}</text>`}).join('');
    const bars=items.map((item,index)=>{
      const box=geometry.bars[index],x=L+slot*index+(slot-bw)/2,labelY=box.direction==='negative'?Math.min(H-B+20,box.y+box.height+17):Math.max(T+14,box.y-9),negative=box.direction==='negative'?' negative':'';
      return `<g><rect x="${x}" y="${box.y}" width="${bw}" height="${Math.max(box.height,1)}" rx="10" class="fd-bar ${item.kind||''}${negative}"/><text x="${x+bw/2}" y="${labelY}" text-anchor="middle" class="fd-value">${fdCompact(item.value)}</text><text x="${x+bw/2}" y="${H-24}" text-anchor="middle" class="fd-label">${item.label}</text></g>`;
    }).join('');
    return `<section class="fd-chart-panel"><div class="fd-chart-title"><h4>${title}</h4><p>Суммы в рублях</p></div><svg class="fd-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}"><title>${title}</title><desc>${items.map(item=>`${item.label}: ${fdMoney(item.value)}`).join('. ')}</desc>${grid}<line x1="${L}" y1="${geometry.zeroY}" x2="${W-R}" y2="${geometry.zeroY}" class="fd-zero"/>${bars}</svg></section>`;
  };
  fdCharts=function(result){
    if(result.n===1){
      const primary=fdBar('Выручка и расходы',[{label:'Выручка',value:result.rev,kind:'revenue'},{label:'Расходы',value:result.exp,kind:'expense'}]);
      const balance=fdBar('Деньги и обязательства',[{label:'Деньги',value:result.end.cash,kind:'cash'},{label:'Обязательства',value:result.end.liab,kind:'liability'}]);
      return primary+balance;
    }
    return fdLine(result)+fdBar('Прибыль по месяцам',result.months.map((month,index)=>({label:`Месяц ${index+1}`,value:month.rev-month.exp,kind:'profit'})));
  };
  fdRender=function(result){
    $('#score').textContent=result.score??'—';
    $('#status').textContent=result.status;
    const excluded=result.missing?.length?` Не использованы поля без данных: ${result.missing.join(', ')}.`:'';
    $('#meta').textContent=`Период: ${fdPeriod(result.n)}. Отрасль: ${result.c.name}. Факторов: ${result.f.length}. Точный индекс: ${maybeNumber(result.rawScore)}.${excluded}`;
    $('#periodSummary').innerHTML=`<b>Сводка за ${fdPeriod(result.n)}:</b> выручка ${fdMoney(result.rev)}, расходы ${fdMoney(result.exp)}, среднемесячная выручка ${fdMoney(result.avgRev)}, среднемесячные расходы ${fdMoney(result.avgExp)}.`;
    $('#profitLabel').textContent=result.n===1?'Прибыль за месяц':'Прибыль за 3 месяца';
    $('#profit').textContent=fdMoney(result.profit);
    $('#margin').textContent=maybePercent(result.margin);
    $('#liq').textContent=result.noLiabilities?'обязательств нет':maybeNumber(result.coverage);
    $('#reserve').textContent=isValue(result.reserve)?`${fdNum(result.reserve)} дня`:'н/д';
    $('#growth').textContent=result.n===1?'н/д — нужен период 3 месяца':maybePercent(result.growth);
    $('#debt').textContent=maybePercent(result.debt);
    $('#factors').innerHTML=fdFactorBars(result.f,true);
    $('#risks').innerHTML=result.risks.map(text=>`<div class="risk ${result.risks.length===1?'good':''}">${text}</div>`).join('');
    $('#activeCharts').innerHTML=`<section class="fd-selected"><h2>Графики выбранного расчёта</h2><div class="fd-chart-grid">${fdCharts(result)}</div></section>`;
  };
  fdFromForm=function(show=true){
    const n=Number($('#period').value),result=fdCalc(fdRead(n),$('#industry').value);
    if(!result.valid){fdReset();if(show)toast(result.errors[0]||'Заполните обязательные поля');return}
    fdRender(result);
    if(show)toast(`Расчёт за ${fdPeriod(n)} обновлён`);
  };
})();
