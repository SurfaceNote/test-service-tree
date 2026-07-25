(function(){
  'use strict';

  const engine=globalThis.FinancialDiagnosticsEngine;
  if(!engine)throw new Error('FinancialDiagnosticsEngine is not loaded');

  const company={name:'ООО «Компания»',description:'Полностью вымышленный пример. Все суммы и выводы используются только для демонстрации калькулятора.'};
  const examples={
    one:[{rev:4820000,exp:4136000,cash:620000,liab:850000,over:620000,debt:1100000,stock:440000}],
    three:[
      {rev:4300000,exp:3900000,cash:null,liab:null,over:null,debt:null,stock:null},
      {rev:4650000,exp:4050000,cash:null,liab:null,over:null,debt:null,stock:null},
      {rev:4820000,exp:4136000,cash:620000,liab:850000,over:620000,debt:1100000,stock:440000}
    ]
  };
  const periodFields=[['rev','Выручка',true],['exp','Расходы',true]];
  const balanceFields=[
    ['cash','Деньги на конец периода',false],
    ['liab','Краткосрочные обязательства',false],
    ['over','Просроченная дебиторка',false],
    ['debt','Кредиты и займы',false],
    ['stock','Запасы',false]
  ];
  const allFields=[...periodFields,...balanceFields];
  const successRisk='Критические сигналы по введённым данным не обнаружены.';
  const money=value=>Number.isFinite(value)?new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(value):'н/д';
  const number=value=>Number.isFinite(value)?new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(value):'н/д';
  const percent=value=>Number.isFinite(value)?new Intl.NumberFormat('ru-RU',{maximumFractionDigits:1}).format(value*100)+'%':'н/д';
  const compact=value=>Number.isFinite(value)?new Intl.NumberFormat('ru-RU',{notation:'compact',maximumFractionDigits:1}).format(value)+' ₽':'н/д';
  const periodText=n=>n===1?'1 месяц':'3 месяца';
  const escapeHtml=value=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

  function fieldMarkup(field,index,value){
    const [key,label,required]=field;
    const valueAttribute=Number.isFinite(value)?` value="${value}"`:'';
    return `<div class="field"><label for="${key}${index}">${label}${required?'':' <span>— необязательно</span>'}</label><input id="${key}${index}" type="number" min="0" inputmode="decimal" placeholder="${required?'Введите значение':'Не указано'}" ${required?'required':''}${valueAttribute}></div>`;
  }

  function buildMonths(n,values=null){
    const industry=$('#industry')?.value||'services';
    const config=engine.configs[industry]||engine.configs.services;
    const months=Array.isArray(values)?values:[];
    const periodBlocks=Array.from({length:n},(_,index)=>{
      const i=index+1;
      const legend=n===1?'Доходы и расходы за месяц':`Месяц ${i}: доходы и расходы`;
      return `<fieldset class="diag-v3-month"><legend>${legend}</legend><div class="diag-v3-fields">${periodFields.map(field=>fieldMarkup(field,i,months[index]?.[field[0]])).join('')}</div></fieldset>`;
    }).join('');
    const endIndex=n;
    const visibleBalanceFields=balanceFields.filter(([key])=>key!=='stock'||config.stock);
    const balanceBlock=`<fieldset class="diag-v3-month diag-v3-balance"><legend>${n===1?'Остатки на конец месяца':'Остатки на конец третьего месяца'}</legend><p class="diag-v3-field-note">Эти показатели вводятся один раз: модель использует только остатки на последнюю дату выбранного периода.</p><div class="diag-v3-fields">${visibleBalanceFields.map(field=>fieldMarkup(field,endIndex,months[endIndex-1]?.[field[0]])).join('')}</div></fieldset>`;
    $('#months').innerHTML=periodBlocks+balanceBlock;
  }

  function readMonths(n){
    return Array.from({length:n},(_,index)=>Object.fromEntries(allFields.map(([key])=>{
      const input=$(`#${key}${index+1}`);
      return [key,input&&input.value.trim()!==''?Number(input.value):null];
    })));
  }

  function loadExample(n,notify=true){
    const data=n===1?examples.one:examples.three;
    $('#industry').value='services';
    $('#period').value=String(n);
    buildMonths(n,data);
    $('#exampleInfo').innerHTML=`<b>Загружен вымышленный пример:</b> ${company.name}, расчёт за ${periodText(n)}.`;
    renderCalculation(false);
    if(notify)toast(`Загружен пример за ${periodText(n)}`);
  }

  function factorNote(factor){
    const note=factor.note||{};
    if(factor.key==='profit')return `Маржа ${percent(note.actual)} при внутреннем ориентире ${percent(note.target)}.`;
    if(factor.key==='coverage')return note.noLiabilities?'Краткосрочные обязательства указаны как нулевые.':`Деньги покрывают ${percent(note.actual)} краткосрочных обязательств.`;
    if(factor.key==='reserve')return `Резерв ${number(note.actual)} дня при внутреннем ориентире ${number(note.target)} дней.`;
    if(factor.key==='over')return `Просрочка ${percent(note.actual)} среднемесячной выручки; внутренняя граница ${percent(note.limit)}.`;
    if(factor.key==='debt')return `Долг ${percent(note.actual)} среднемесячной выручки; внутренняя граница ${percent(note.limit)}.`;
    if(factor.key==='growth')return `Выручка третьего месяца к первому: ${percent(note.actual)}.`;
    if(factor.key==='stock')return `Запасы ${number(note.actual)} дня среднемесячных расходов; внутренняя граница ${number(note.limit)} дней.`;
    return '';
  }

  function renderFactors(result){
    return `<div class="diag-v3-factor-list">${result.f.map(factor=>`<article class="diag-v3-factor"><div><b>${escapeHtml(factor.name)}</b><span>${factor.score}/100</span></div><div class="diag-v3-bar"><i style="width:${factor.score}%"></i></div><p>${escapeHtml(factorNote(factor))}</p></article>`).join('')}</div>`;
  }

  function recommendationModel(result){
    const items=[];
    const c=result.c;
    const end=result.end;
    const add=(priority,title,current,target,text)=>items.push({priority,title,current,target,text});
    const nonNegative=value=>Math.max(0,value||0);

    if(result.provisional){
      add('data','Полнота расчётной модели',`${Math.round(result.completeness)}%`,`не менее ${engine.completenessThreshold}%`,'Заполните отсутствующие остатки. До этого результат остаётся предварительным и не получает статус финансовой устойчивости.');
    }else if(result.incomplete){
      add('data','Неполная расчётная модель',`${Math.round(result.completeness)}%`,'100%','Статус рассчитан по нижней границе диапазона. Заполните отсутствующие данные, чтобы получить точный индекс вместо консервативной оценки.');
    }
    if(Number.isFinite(result.margin)){
      const gap=nonNegative(result.rev*c.margin-result.profit);
      if(result.profit<0)add('critical','Прибыльность',`${money(result.profit)}, маржа ${percent(result.margin)}`,`маржа ≥ ${percent(c.margin)}`,`Проверьте цены, прямые затраты и постоянные расходы. Для достижения внутреннего ориентира результат нужно улучшить примерно на ${money(gap)}.`);
      else if(result.margin<c.margin)add('important','Прибыльность',`${money(result.profit)}, маржа ${percent(result.margin)}`,`маржа ≥ ${percent(c.margin)}`,`Разберите маржу по продуктам и клиентам. При текущей выручке прибыль желательно увеличить минимум на ${money(gap)}.`);
      else add('positive','Прибыльность',`${money(result.profit)}, маржа ${percent(result.margin)}`,`сохранять ≥ ${percent(c.margin)}`,'Проверьте, что маржа не сформирована разовыми доходами или переносом расходов.');
    }
    if(result.noLiabilities){
      add('positive','Покрытие обязательств','краткосрочные обязательства отсутствуют','своевременная оплата','Убедитесь, что включены ближайшие налоги, зарплата и договорные платежи.');
    }else if(Number.isFinite(result.coverage)){
      const gap=nonNegative(end.liab-end.cash);
      if(result.coverage<1)add('critical','Покрытие обязательств',number(result.coverage),'≥ 1,00',`Составьте платёжный календарь и закройте дефицит не менее ${money(gap)}.`);
      else add('positive','Покрытие обязательств',number(result.coverage),'сохранять ≥ 1,00','Подтверждайте даты поступлений и еженедельно обновляйте платёжный календарь.');
    }else add('data','Покрытие обязательств','не рассчитано','≥ 1,00','Укажите деньги и краткосрочные обязательства на одну дату.');

    if(Number.isFinite(result.reserve)){
      const targetCash=result.avgExp/30*c.reserve;
      const gap=nonNegative(targetCash-end.cash);
      if(result.reserve<c.reserve)add(result.reserve<c.reserve*.5?'critical':'important','Денежный резерв',`${number(result.reserve)} дня`,`${c.reserve} дней`,`До внутреннего ориентира не хватает около ${money(gap)}. Пополняйте резерв отдельным регулярным переводом.`);
      else add('positive','Денежный резерв',`${number(result.reserve)} дня`,`сохранять ≥ ${c.reserve} дней`,'Храните резерв отдельно от операционных денег и пересчитывайте цель при изменении расходов.');
    }else add('data','Денежный резерв','не рассчитан',`${c.reserve} дней расходов`,'Укажите денежный остаток на конец периода.');

    if(Number.isFinite(result.over)){
      const excess=nonNegative(end.over-result.avgRev*c.over);
      if(result.over>c.over)add(result.over>c.over*1.5?'critical':'important','Просроченная дебиторка',`${money(end.over)}, ${percent(result.over)} выручки`,`≤ ${percent(c.over)}`,`Составьте реестр долгов и сократите просрочку минимум на ${money(excess)}.`);
      else add('positive','Просроченная дебиторка',`${money(end.over)}, ${percent(result.over)} выручки`,`сохранять ≤ ${percent(c.over)}`,'Еженедельно контролируйте старение задолженности.');
    }else add('data','Просроченная дебиторка','не указана',`≤ ${percent(c.over)}`,'Пустое поле не означает отсутствие просрочки. Укажите остаток на конец периода.');

    if(Number.isFinite(result.debt)){
      const excess=nonNegative(end.debt-result.avgRev*c.debt);
      if(result.debt>c.debt)add('critical','Долговая нагрузка',`${money(end.debt)}, ${percent(result.debt)} выручки`,`≤ ${percent(c.debt)}`,`Долг выше внутреннего ориентира примерно на ${money(excess)}. Составьте график основного долга и процентов.`);
      else add('monitor','Долговая нагрузка',`${money(end.debt)}, ${percent(result.debt)} выручки`,`сохранять ≤ ${percent(c.debt)}`,'Сопоставьте график погашения с платёжным календарём.');
    }else add('data','Долговая нагрузка','не указана',`≤ ${percent(c.debt)}`,'Укажите остаток кредитов и займов.');

    if(result.n===3&&Number.isFinite(result.growth)){
      if(result.growth<0)add(result.growth<-.1?'critical':'important','Динамика выручки',percent(result.growth),'не ниже 0%','Разделите снижение на объём продаж, средний чек и цены; подготовьте сценарий расходов при продолжении спада.');
      else add('positive','Динамика выручки',percent(result.growth),'рост без ухудшения денег','Сопоставляйте рост с прибылью, дебиторкой и денежным потоком.');
    }

    if(c.stock){
      if(Number.isFinite(result.stockDays)){
        const excess=nonNegative(end.stock-result.avgExp/30*c.days);
        if(result.stockDays>c.days)add('important','Запасы',`${number(result.stockDays)} дня расходов`,`≤ ${c.days} дней`,`Проведите ABC/XYZ-анализ и сократите избыточные запасы примерно на ${money(excess)}.`);
        else add('monitor','Запасы',`${number(result.stockDays)} дня расходов`,`≤ ${c.days} дней`,'Контролируйте неликвиды и связывайте закупки с подтверждённым спросом.');
      }else add('data','Запасы','не указаны',`≤ ${c.days} дней расходов`,'Укажите остаток запасов и отдельно выделите неликвидные позиции.');
    }

    const order={critical:0,important:1,data:2,monitor:3,positive:4};
    items.sort((a,b)=>order[a.priority]-order[b.priority]);
    return items;
  }

  function renderRecommendations(result){
    const labels={critical:'Срочно',important:'Важно',monitor:'Контроль',positive:'Сильная сторона',data:'Нужны данные'};
    const items=recommendationModel(result);
    return `<div class="diag-v3-recommendations">${items.map(item=>`<article class="diag-v3-rec ${item.priority}"><div><span>${labels[item.priority]}</span><h3>${escapeHtml(item.title)}</h3></div><p><b>Сейчас:</b> ${escapeHtml(item.current)} · <b>Ориентир:</b> ${escapeHtml(item.target)}</p><p>${escapeHtml(item.text)}</p></article>`).join('')}</div><section class="diag-v3-consult"><div><span class="tag">Персональный разбор</span><h3>Автоматический расчёт не видит сроки платежей и качество данных</h3><p>На консультации можно проверить причины отклонений, расставить приоритеты и подготовить план действий с суммами, сроками и ответственными.</p></div><a class="btn primary" href="../contacts/">Обратиться за консультацией</a></section>`;
  }

  function renderBarChart(title,items){
    const valid=items.filter(item=>Number.isFinite(item.value));
    if(!valid.length)return `<div class="notice">Для графика «${escapeHtml(title)}» недостаточно данных.</div>`;
    const W=640,H=300,L=84,R=24,T=38,B=62,cw=W-L-R,ch=H-T-B;
    const geometry=engine.barGeometry(valid.map(item=>item.value),T,ch);
    const slot=cw/valid.length,bw=Math.min(110,slot*.52);
    const ticks=Array.from({length:5},(_,index)=>geometry.max-(geometry.max-geometry.min)*index/4);
    const y=value=>T+(geometry.max-value)/(geometry.max-geometry.min||1)*ch;
    const grid=ticks.map(value=>{const gy=y(value);return `<line x1="${L}" y1="${gy}" x2="${W-R}" y2="${gy}" class="diag-v3-grid"/><text x="${L-10}" y="${gy+4}" text-anchor="end">${compact(value)}</text>`}).join('');
    const bars=valid.map((item,index)=>{
      const box=geometry.bars[index],x=L+slot*index+(slot-bw)/2;
      const labelY=box.direction==='negative'?Math.min(H-B+20,box.y+box.height+18):Math.max(T+14,box.y-9);
      return `<g><rect x="${x}" y="${box.y}" width="${bw}" height="${Math.max(box.height,1)}" rx="10" class="diag-v3-column ${box.direction}"/><text x="${x+bw/2}" y="${labelY}" text-anchor="middle" class="diag-v3-value">${compact(item.value)}</text><text x="${x+bw/2}" y="${H-24}" text-anchor="middle">${escapeHtml(item.label)}</text></g>`;
    }).join('');
    return `<figure class="diag-v3-chart"><figcaption><b>${escapeHtml(title)}</b><span>Суммы в рублях</span></figcaption><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(title)}"><title>${escapeHtml(title)}</title><desc>${valid.map(item=>`${item.label}: ${money(item.value)}`).join('. ')}</desc>${grid}<line x1="${L}" y1="${geometry.zeroY}" x2="${W-R}" y2="${geometry.zeroY}" class="diag-v3-zero"/>${bars}</svg></figure>`;
  }

  function renderCharts(result){
    const summary=renderBarChart('Выручка и расходы',[{label:'Выручка',value:result.rev},{label:'Расходы',value:result.exp}]);
    const balance=renderBarChart('Деньги и обязательства',[{label:'Деньги',value:result.end.cash},{label:'Обязательства',value:result.end.liab}]);
    const monthly=result.n===3?renderBarChart('Прибыль по месяцам',result.months.map((month,index)=>({label:`Месяц ${index+1}`,value:month.rev-month.exp}))):'';
    return `<div class="diag-v3-charts">${summary}${balance}${monthly}</div>`;
  }

  function renderAudit(result){
    const range=result.scoreRange?`${number(result.scoreRange.min)}–${number(result.scoreRange.max)}`:'н/д';
    const basis=result.provisional?'Итоговый индекс не присвоен':result.incomplete?'Нижняя граница возможного диапазона':'Наблюдаемый индекс по полной модели';
    const rows=[
      ['Выручка за период',money(result.rev)],
      ['Расходы за период',money(result.exp)],
      ['Прибыль',`${money(result.rev)} − ${money(result.exp)} = ${money(result.profit)}`],
      ['Маржа',result.rev?`${money(result.profit)} ÷ ${money(result.rev)} = ${percent(result.margin)}`:'н/д'],
      ['Денежное покрытие',result.noLiabilities?'обязательства равны нулю':Number.isFinite(result.coverage)?`${money(result.end.cash)} ÷ ${money(result.end.liab)} = ${number(result.coverage)}`:'н/д'],
      ['Денежный резерв',Number.isFinite(result.reserve)?`${money(result.end.cash)} ÷ ${money(result.avgExp)} × 30 = ${number(result.reserve)} дня`:'н/д'],
      ['Покрытие расчётных факторов',`${number(result.availableWeight)} ÷ ${number(result.expectedWeight)} = ${Math.round(result.completeness)}%`],
      ['Основа итогового статуса',basis],
      ['Диапазон при неполной модели',result.incomplete?`${range} из 100`:'не применяется — модель полная']
    ];
    const passport=[
      ['Версия',engine.methodologyVersion],
      ['Назначение','Предварительная экспресс-диагностика'],
      ['Область применения','ИП и ООО; демонстрационная модель без отраслевой валидации'],
      ['Статус порогов','Внутренние ориентиры, не официальные нормативы'],
      ['Правило неполных данных',`Ниже ${engine.completenessThreshold}% статус не присваивается; от ${engine.completenessThreshold}% до 100% используется нижняя граница диапазона`],
      ['Источники и выборка','Не опубликованы; требуется экспертное утверждение и проверка на реальных компаниях'],
      ['Ограничения','Не учитываются календарь платежей, налоги, договорные условия, сезонность и качество учёта']
    ];
    return `<div class="diag-v3-audit"><div class="notice"><b>Методика ${engine.methodologyVersion}:</b> при неполной модели статус определяется консервативно по нижней границе диапазона. При покрытии ниже ${engine.completenessThreshold}% итоговый статус не присваивается.</div><h3>Паспорт методики</h3><div class="table-scroll"><table><thead><tr><th>Поле</th><th>Значение</th></tr></thead><tbody>${passport.map(row=>`<tr><td>${escapeHtml(row[0])}</td><td>${escapeHtml(row[1])}</td></tr>`).join('')}</tbody></table></div><h3>Проверка расчёта</h3><div class="table-scroll"><table><thead><tr><th>Проверка</th><th>Расчёт</th></tr></thead><tbody>${rows.map(row=>`<tr><td>${escapeHtml(row[0])}</td><td>${escapeHtml(row[1])}</td></tr>`).join('')}</tbody></table></div><details><summary>Веса факторов</summary><ul>${result.expectedFactors.map(factor=>`<li><b>${escapeHtml(factor.key)}</b> — ${Math.round(factor.weight*100)}% базового веса</li>`).join('')}</ul></details></div>`;
  }

  function switchResultTab(name,focus=false){
    $$('[data-result-tab]').forEach(button=>{
      const active=button.dataset.resultTab===name;
      button.classList.toggle('active',active);
      button.setAttribute('aria-selected',String(active));
      button.tabIndex=active?0:-1;
      if(active&&focus)button.focus();
    });
    $$('[data-result-panel]').forEach(panel=>panel.hidden=panel.dataset.resultPanel!==name);
  }

  function handleTabKeydown(event){
    const tabs=Array.from($$('[data-result-tab]'));
    const index=tabs.indexOf(event.currentTarget);
    let next=null;
    if(event.key==='ArrowRight')next=(index+1)%tabs.length;
    if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=tabs.length-1;
    if(next===null)return;
    event.preventDefault();
    switchResultTab(tabs[next].dataset.resultTab,true);
  }

  function renderResult(result){
    const scoreText=result.score===null?'—':String(result.score);
    const range=result.scoreRange?`Возможный диапазон: ${number(result.scoreRange.min)}–${number(result.scoreRange.max)} из 100.`:'';
    const missing=result.missing.length?` Не указаны: ${result.missing.join(', ')}.`:'';
    $('#score').textContent=scoreText;
    $('#status').textContent=result.status;
    $('#scoreCaption').textContent=result.provisional?'итоговый статус не присвоен':result.incomplete?'консервативный индекс':'ориентировочный индекс';
    $('#meta').textContent=`Период: ${periodText(result.n)}. Отрасль: ${result.c.name}. Покрытие модели: ${Math.round(result.completeness)}%. ${range}${missing}`;
    $('#completenessValue').textContent=`${Math.round(result.completeness)}%`;
    $('#completenessLabel').textContent=result.completenessLabel;
    $('#completenessBar').style.width=`${Math.min(100,result.completeness)}%`;
    $('#periodSummary').innerHTML=`<b>Сводка:</b> выручка ${money(result.rev)}, расходы ${money(result.exp)}, среднемесячная выручка ${money(result.avgRev)}, среднемесячные расходы ${money(result.avgExp)}.`;
    $('#profit').textContent=money(result.profit);
    $('#margin').textContent=percent(result.margin);
    $('#liq').textContent=result.noLiabilities?'обязательств нет':number(result.coverage);
    $('#reserve').textContent=Number.isFinite(result.reserve)?`${number(result.reserve)} дня`:'н/д';
    $('#growth').textContent=result.n===1?'н/д — нужен период 3 месяца':percent(result.growth);
    $('#debt').textContent=percent(result.debt);
    $('#risks').innerHTML=result.risks.map(text=>`<div class="risk ${text===successRisk?'good':''}">${escapeHtml(text)}</div>`).join('');
    $('#factors').innerHTML=renderFactors(result);
    $('#recommendations').innerHTML=renderRecommendations(result);
    $('#charts').innerHTML=renderCharts(result);
    $('#audit').innerHTML=renderAudit(result);
    switchResultTab('overview');
  }

  function resetResult(){
    $('#score').textContent='—';
    $('#status').textContent='Недостаточно данных';
    $('#scoreCaption').textContent='ориентировочный индекс';
    $('#meta').textContent='Заполните обязательные поля.';
    $('#completenessValue').textContent='0%';
    $('#completenessLabel').textContent='Недостаточно данных';
    $('#completenessBar').style.width='0%';
    $('#periodSummary').innerHTML='<b>Сводка:</b> появится после расчёта.';
    ['profit','margin','liq','reserve','growth','debt'].forEach(id=>$('#'+id).textContent='—');
    $('#risks').innerHTML='<div class="risk">Появятся после расчёта.</div>';
    $('#factors').innerHTML='';
    $('#recommendations').innerHTML='';
    $('#charts').innerHTML='';
    $('#audit').innerHTML='';
  }

  function renderCalculation(notify=true){
    const n=Number($('#period').value);
    const result=engine.calculate(readMonths(n),$('#industry').value);
    if(!result.valid){
      resetResult();
      if(notify)toast(result.errors[0]||'Заполните обязательные поля');
      return;
    }
    renderResult(result);
    if(notify)toast(result.provisional?'Предварительный расчёт обновлён':result.incomplete?'Консервативный расчёт обновлён':'Расчёт обновлён');
  }

  function exampleCard(n){
    const result=engine.calculate(n===1?examples.one:examples.three,'services');
    return `<article class="diag-v3-example"><span class="tag">Пример за ${periodText(n)}</span><div><b>${result.score}/100</b><span>${result.status}</span></div><p>Покрытие модели ${Math.round(result.completeness)}%. Все показатели вымышлены.</p><button class="btn" type="button" data-load-example="${n}">Открыть в калькуляторе</button></article>`;
  }

  function diagnosticsPage(){
    const configOptions=Object.entries(engine.configs).map(([key,value])=>`<option value="${key}">${value.name}</option>`).join('');
    const tabs=[['overview','Обзор'],['recommendations','Рекомендации'],['charts','Графики'],['audit','Формулы']];
    const tabButtons=tabs.map(([id,label],index)=>`<button id="tab-${id}" type="button" class="${index===0?'active':''}" role="tab" aria-selected="${index===0}" aria-controls="panel-${id}" tabindex="${index===0?'0':'-1'}" data-result-tab="${id}">${label}</button>`).join('');
    layout(hero('Экспресс-диагностика финансовой устойчивости','Введите показатели за один или три месяца. Система отдельно покажет финансовый результат и покрытие расчётной модели.','Диагностика')+`<section class="section white"><div class="container"><div class="diag-v3-method"><div><span class="tag">Методика ${engine.methodologyVersion}</span><h2>Неполные данные оцениваются консервативно</h2><p>При покрытии от ${engine.completenessThreshold}% до 100% статус определяется по нижней границе возможного диапазона. Ниже ${engine.completenessThreshold}% итоговый статус не присваивается.</p></div><a href="#calculator" class="btn primary">Перейти к расчёту</a></div><div class="diag-v3-examples">${exampleCard(1)}${exampleCard(3)}</div><section class="diag-v3-shell" id="calculator"><form class="diag-v3-form" id="diagForm"><div class="diag-v3-form-head"><div><span class="tag">Ваш расчёт</span><h2>Исходные данные</h2></div><p>За каждый месяц нужны только выручка и расходы. Остатки вводятся один раз — на последнюю дату периода.</p></div><div class="row"><div class="field"><label for="industry">Отрасль</label><select id="industry">${configOptions}</select></div><div class="field"><label for="period">Период расчёта</label><select id="period"><option value="1">За 1 месяц</option><option value="3" selected>За 3 месяца</option></select></div></div><div class="notice" id="exampleInfo"><b>Сейчас используется пример:</b> ${company.name}. Значения можно заменить своими.</div><div id="months"></div><div class="actions"><button class="btn primary" type="submit">Рассчитать</button><button class="btn" id="loadExample" type="button">Восстановить пример</button><button class="btn ghost" id="clearDiagnostics" type="button">Очистить</button></div></form><section class="diag-v3-result" aria-live="polite"><div class="diag-v3-result-head"><div class="ring"><b id="score">—</b><span>/100</span></div><div><small id="scoreCaption">ориентировочный индекс</small><h2 id="status">Недостаточно данных</h2><p id="meta">Заполните обязательные поля.</p></div></div><div class="diag-v3-completeness"><div><b id="completenessLabel">Недостаточно данных</b><span id="completenessValue">0%</span></div><div class="diag-v3-progress"><i id="completenessBar"></i></div><small>Минимум для присвоения статуса: ${engine.completenessThreshold}%. До 100% статус рассчитывается по нижней границе.</small></div><div class="notice" id="periodSummary"><b>Сводка:</b> появится после расчёта.</div><div class="metrics">${[['profit','Прибыль'],['margin','Маржа'],['liq','Покрытие обязательств'],['reserve','Денежный резерв'],['growth','Динамика выручки'],['debt','Долг / выручка']].map(([id,label])=>`<div class="metric"><small>${label}</small><b id="${id}">—</b></div>`).join('')}</div><div class="diag-v3-tabs" role="tablist" aria-label="Разделы результата">${tabButtons}</div><section id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" data-result-panel="overview"><h2>Зоны внимания</h2><div id="risks"><div class="risk">Появятся после расчёта.</div></div><h2>Вклад рассчитанных факторов</h2><div id="factors"></div></section><section id="panel-recommendations" role="tabpanel" aria-labelledby="tab-recommendations" data-result-panel="recommendations" hidden><div id="recommendations"></div></section><section id="panel-charts" role="tabpanel" aria-labelledby="tab-charts" data-result-panel="charts" hidden><div id="charts"></div></section><section id="panel-audit" role="tabpanel" aria-labelledby="tab-audit" data-result-panel="audit" hidden><div id="audit"></div></section><div class="notice"><b>Ограничения:</b> расчёт демонстрационный, использует внутренние ориентиры и не заменяет бухгалтерский, налоговый или финансовый аудит.</div><div class="actions print-hide"><button class="btn" id="printDiagnostics" type="button">Сохранить в PDF</button><a class="btn primary" href="../contacts/">Обсудить результат</a></div></section></section></div></section>`);

    buildMonths(3,examples.three);
    $('#diagForm').addEventListener('submit',event=>{event.preventDefault();renderCalculation(true)});
    $('#period').addEventListener('change',()=>{buildMonths(Number($('#period').value));resetResult();$('#exampleInfo').innerHTML='<b>Период изменён:</b> заполните показатели или восстановите пример.';toast(`Выбран расчёт за ${periodText(Number($('#period').value))}`)});
    $('#industry').addEventListener('change',()=>{const n=Number($('#period').value),values=readMonths(n);buildMonths(n,values);renderCalculation(false)});
    $('#loadExample').addEventListener('click',()=>loadExample(Number($('#period').value),true));
    $('#clearDiagnostics').addEventListener('click',()=>{$$('#diagForm input').forEach(input=>input.value='');resetResult();$('#exampleInfo').innerHTML='<b>Форма очищена:</b> заполните обязательные поля.';toast('Форма очищена')});
    $('#printDiagnostics').addEventListener('click',()=>window.print());
    $$('[data-load-example]').forEach(button=>button.addEventListener('click',()=>{const n=Number(button.dataset.loadExample);loadExample(n,true);$('#calculator').scrollIntoView({behavior:'smooth',block:'start'})}));
    $$('[data-result-tab]').forEach(button=>{button.addEventListener('click',()=>switchResultTab(button.dataset.resultTab));button.addEventListener('keydown',handleTabKeydown)});
    renderCalculation(false);
  }

  globalThis.diagnosticsPage=diagnosticsPage;
})();
