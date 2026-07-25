(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.FinancialDiagnosticsRecommendations=api;
  if(typeof document!=='undefined')api.mount();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const isNumber=value=>typeof value==='number'&&Number.isFinite(value);
  const money=value=>isNumber(value)?new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(value):'н/д';
  const number=value=>isNumber(value)?new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(value):'н/д';
  const percent=value=>isNumber(value)?new Intl.NumberFormat('ru-RU',{maximumFractionDigits:1}).format(value*100)+'%':'н/д';
  const escapeHtml=value=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const nonNegative=value=>Math.max(0,value||0);
  const labels={critical:'Срочно',important:'Важно',monitor:'Контроль',positive:'Сильная сторона',data:'Нужны данные'};
  const order={critical:0,important:1,data:2,monitor:3,positive:4};

  function summary(result){
    if(!isNumber(result?.rawScore))return 'Для рекомендаций недостаточно данных. Заполните обязательные показатели и остатки на конец периода.';
    const score=number(result.rawScore);
    if(result.rawScore<50)return `Индекс ${score} из 100: высокий риск. В первую очередь нужно защитить платёжеспособность и увеличить денежный запас.`;
    if(result.rawScore<70)return `Индекс ${score} из 100: ситуация требует внимания. Зафиксируйте приоритетные меры и контрольные сроки.`;
    if(result.rawScore<85)return `Индекс ${score} из 100: положение в целом стабильное, но отдельные показатели требуют регулярного контроля.`;
    return `Индекс ${score} из 100: устойчивый ориентир. Сохраняйте финансовую дисциплину и проверяйте стресс-сценарий.`;
  }

  function build(result){
    if(!result||!result.valid)return {summary:'Расчёт не завершён.',items:[]};
    const items=[];
    const c=result.c||{};
    const end=result.end||{};
    const add=(priority,title,current,target,recommendation)=>items.push({priority,label:labels[priority],title,current,target,recommendation});

    if(isNumber(result.margin)&&isNumber(c.margin)){
      const gap=nonNegative(result.rev*c.margin-result.profit);
      if(result.profit<0)add('critical','Прибыльность',`${money(result.profit)}, маржа ${percent(result.margin)}`,`маржа ≥ ${percent(c.margin)}`,`Остановите убыточные направления, проверьте цены и расходы. Для достижения ориентира результат нужно улучшить примерно на ${money(gap)}.`);
      else if(result.margin<c.margin)add('important','Прибыльность',`${money(result.profit)}, маржа ${percent(result.margin)}`,`маржа ≥ ${percent(c.margin)}`,`Разберите маржу по продуктам и клиентам. При текущей выручке прибыль желательно увеличить минимум на ${money(gap)}.`);
      else add('positive','Прибыльность',`${money(result.profit)}, маржа ${percent(result.margin)}`,`сохранять ≥ ${percent(c.margin)}`,'Сохраняйте текущую маржу и проверяйте, что она не сформирована разовыми доходами или переносом расходов.');
    }else add('data','Прибыльность','не рассчитана',`маржа ≥ ${percent(c.margin)}`,'Укажите выручку и расходы за одинаковый период и проверьте полноту затрат.');

    if(result.noLiabilities){
      add('positive','Покрытие обязательств','краткосрочные обязательства отсутствуют','своевременная оплата','Проверьте, что в расчёт включены ближайшие налоги, зарплата и договорные платежи.');
    }else if(isNumber(result.coverage)&&isNumber(end.cash)&&isNumber(end.liab)){
      const gap=nonNegative(end.liab-end.cash);
      if(result.coverage<1)add('critical','Покрытие обязательств',number(result.coverage),'≥ 1,00',`Составьте платёжный календарь и закройте денежный дефицит не менее ${money(gap)} за счёт ускорения поступлений или переноса необязательных платежей.`);
      else if(result.coverage<1.25)add('important','Покрытие обязательств',number(result.coverage),'рабочий запас ≥ 1,25','Обязательства покрываются с небольшим запасом. Установите неснижаемый остаток и стресс-сценарий при задержке поступлений.');
      else add('positive','Покрытие обязательств',number(result.coverage),'сохранять ≥ 1,00','Продолжайте еженедельно обновлять платёжный календарь и подтверждать даты поступлений.');
    }else add('data','Покрытие обязательств','не рассчитано','≥ 1,00','Укажите деньги и краткосрочные обязательства на одну дату.');

    if(isNumber(result.reserve)&&isNumber(result.avgExp)&&isNumber(end.cash)){
      const targetCash=result.avgExp/30*c.reserve;
      const gap=nonNegative(targetCash-end.cash);
      if(result.reserve<c.reserve*.5)add('critical','Денежный резерв',`${number(result.reserve)} дня`,`${c.reserve} дней`,`Создайте отдельный резерв и поэтапно доведите его до ${money(targetCash)}. До ориентира не хватает около ${money(gap)}.`);
      else if(result.reserve<c.reserve)add('important','Денежный резерв',`${number(result.reserve)} дня`,`${c.reserve} дней`,`Регулярно пополняйте резерв. Текущий разрыв до ориентира составляет около ${money(gap)}.`);
      else add('positive','Денежный резерв',`${number(result.reserve)} дня`,`сохранять ≥ ${c.reserve} дней`,'Храните резерв отдельно от операционных денег и пересчитывайте цель при изменении расходов.');
    }else add('data','Денежный резерв','не рассчитан',`${c.reserve} дней расходов`,'Укажите денежный остаток на конец периода и проверьте полноту среднемесячных расходов.');

    if(isNumber(result.over)&&isNumber(end.over)&&isNumber(result.avgRev)){
      const limitAmount=result.avgRev*c.over;
      const excess=nonNegative(end.over-limitAmount);
      if(result.over>c.over)add(result.over>c.over*1.5?'critical':'important','Просроченная дебиторка',`${money(end.over)}, ${percent(result.over)} выручки`,`≤ ${percent(c.over)}`,`Составьте реестр долгов по срокам и сократите просрочку минимум на ${money(excess)} либо согласуйте реалистичные графики погашения.`);
      else add('positive','Просроченная дебиторка',`${money(end.over)}, ${percent(result.over)} выручки`,`сохранять ≤ ${percent(c.over)}`,'Еженедельно контролируйте старение задолженности и отдельно долги старше 60 и 90 дней.');
    }else add('data','Просроченная дебиторка','не указана',`≤ ${percent(c.over)}`,'Соберите задолженность по контрагентам и срокам; пустое поле не означает отсутствие просрочки.');

    if(isNumber(result.debt)&&isNumber(end.debt)&&isNumber(result.avgRev)){
      const limitAmount=result.avgRev*c.debt;
      const excess=nonNegative(end.debt-limitAmount);
      if(result.debt>c.debt)add('critical','Долговая нагрузка',`${money(end.debt)}, ${percent(result.debt)} выручки`,`≤ ${percent(c.debt)}`,`Долг выше ориентира примерно на ${money(excess)}. Составьте график основного долга и процентов, затем оцените рефинансирование.`);
      else add('monitor','Долговая нагрузка',`${money(end.debt)}, ${percent(result.debt)} выручки`,`сохранять ≤ ${percent(c.debt)}`,'Сопоставьте график погашения с платёжным календарём и не используйте новый долг для постоянного покрытия операционного дефицита.');
    }else add('data','Долговая нагрузка','не указана',`≤ ${percent(c.debt)}`,'Укажите остаток кредитов и займов, ставки и ближайший график погашения.');

    if(result.n===3){
      if(isNumber(result.growth)){
        if(result.growth<0)add(result.growth<-.1?'critical':'important','Динамика выручки',percent(result.growth),'не ниже 0%','Разделите снижение на объём продаж, средний чек и цены; подготовьте сценарий расходов при продолжении спада.');
        else add('positive','Динамика выручки',percent(result.growth),'рост без ухудшения денег','Рост выручки сопоставляйте с прибылью, дебиторкой и денежным потоком, чтобы не наращивать кассовый разрыв.');
      }else add('data','Динамика выручки','не рассчитана','сравнить первый и третий месяц','Проверьте выручку первого и третьего месяца по одинаковым правилам признания.');
    }

    if(c.stock){
      if(isNumber(result.stockDays)&&isNumber(end.stock)&&isNumber(result.avgExp)){
        const limitAmount=result.avgExp/30*c.days;
        const excess=nonNegative(end.stock-limitAmount);
        if(result.stockDays>c.days)add('important','Запасы',`${number(result.stockDays)} дня расходов`,`≤ ${c.days} дней`,`Проведите ABC/XYZ-анализ и сократите избыточные запасы примерно на ${money(excess)}.`);
        else add('monitor','Запасы',`${number(result.stockDays)} дня расходов`,`≤ ${c.days} дней`,'Контролируйте неликвиды и связывайте закупки с подтверждённым спросом.');
      }else add('data','Запасы','не указаны',`≤ ${c.days} дней расходов`,'Укажите остаток запасов и отдельно выделите неликвидные позиции.');
    }

    items.sort((a,b)=>order[a.priority]-order[b.priority]);
    return {summary:summary(result),items};
  }

  function render(result,title='Краткие рекомендации по результатам'){
    const model=build(result);
    const items=model.items.map(item=>`<article class="fd-rec-item ${item.priority}"><div class="fd-rec-item-head"><span>${escapeHtml(item.label)}</span><h4>${escapeHtml(item.title)}</h4></div><p class="fd-rec-values"><b>Сейчас:</b> ${escapeHtml(item.current)} <i>·</i> <b>Ориентир:</b> ${escapeHtml(item.target)}</p><p>${escapeHtml(item.recommendation)}</p></article>`).join('');
    return `<details class="fd-recommendations" open><summary><div><span class="tag">Рекомендации</span><h3>${escapeHtml(title)}</h3></div><i aria-hidden="true">⌄</i></summary><div class="fd-rec-body"><div class="fd-rec-verdict"><b>Краткий вывод</b><p>${escapeHtml(model.summary)}</p></div><div class="fd-rec-list">${items}</div><section class="fd-rec-consult"><div class="fd-rec-consult-copy"><span class="tag">Персональный разбор</span><h4>Почему нужна консультация</h4><p>Калькулятор оценивает только введённые суммы и не учитывает сроки платежей, сезонность, налоги, условия договоров, структуру долга и качество исходных данных.</p><ul class="fd-rec-benefits"><li>выявить реальные причины отклонений;</li><li>расставить приоритеты по влиянию на деньги и прибыль;</li><li>получить план действий с суммами, сроками и ответственными.</li></ul></div><a class="btn primary" href="../contacts/">Обратиться за консультацией</a></section><div class="notice fd-rec-disclaimer"><b>Важно:</b> рекомендации сформированы автоматически по введённым данным и не заменяют аудит или индивидуальное финансовое заключение.</div></div></details>`;
  }

  function insertAfter(reference,html,marker){
    if(!reference)return;
    const parent=reference.parentElement;
    const old=parent?.querySelector(`[data-fd-rec="${marker}"]`);
    if(old)old.remove();
    const holder=document.createElement('div');
    holder.dataset.fdRec=marker;
    holder.innerHTML=html;
    reference.insertAdjacentElement('afterend',holder);
  }

  function mount(){
    if(document.body.dataset.page!=='diagnostics')return;
    const engine=globalThis.FinancialDiagnosticsEngine;
    if(!engine)return;
    const dashboards=[...document.querySelectorAll('.fd-dashboard')];
    const examples=[engine.calculate(fdExample.one,'services'),engine.calculate(fdExample.three,'services')];
    dashboards.forEach((dashboard,index)=>{
      const kpis=dashboard.querySelector('.fd-kpis');
      if(kpis&&examples[index]?.valid)insertAfter(kpis,render(examples[index],`Краткие рекомендации по примеру за ${examples[index].n===1?'1 месяц':'3 месяца'}`),`example-${index+1}`);
    });

    const injectDynamic=result=>{
      const metrics=document.querySelector('.diag-result .metrics');
      if(metrics&&result?.valid)insertAfter(metrics,render(result,'Краткие рекомендации по вашему расчёту'),'dynamic');
    };
    const clearDynamic=()=>document.querySelector('[data-fd-rec="dynamic"]')?.remove();
    const originalRender=fdRender;
    fdRender=function(result){originalRender(result);injectDynamic(result);};
    const originalReset=fdReset;
    fdReset=function(){originalReset();clearDynamic();};
    const period=Number(document.querySelector('#period')?.value||3);
    const initial=fdCalc(fdRead(period),document.querySelector('#industry')?.value||'services');
    if(initial?.valid)injectDynamic(initial);
  }

  return {build,render,mount};
});
