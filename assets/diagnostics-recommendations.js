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
  const priorityLabels={critical:'Срочно',important:'Приоритет',monitor:'Контроль',positive:'Сильная сторона',data:'Нужны данные'};

  function resultSummary(result){
    const score=isNumber(result.rawScore)?number(result.rawScore):'н/д';
    if(!isNumber(result.rawScore))return 'Для содержательных рекомендаций недостаточно показателей. Сначала заполните обязательные поля и ключевые остатки на конец периода.';
    if(result.rawScore<50)return `Точный индекс ${score} из 100 соответствует категории «${result.status}». Первоочередная задача — восстановить платёжеспособность и денежный запас; положительная прибыль сама по себе не устраняет кассовый риск.`;
    if(result.rawScore<70)return `Точный индекс ${score} из 100 соответствует категории «${result.status}». Бизнес сохраняет рабочую модель, но отдельные риски уже требуют плана с ответственными, суммами и контрольными датами.`;
    if(result.rawScore<85)return `Точный индекс ${score} из 100 соответствует категории «${result.status}». Основная задача — закрепить сильные показатели и устранить факторы, которые могут ухудшить денежный поток.`;
    return `Точный индекс ${score} из 100 соответствует категории «${result.status}». Рекомендуется сохранить финансовую дисциплину, регулярно пересматривать лимиты и проверять устойчивость при неблагоприятном сценарии.`;
  }

  function build(result){
    if(!result||!result.valid)return {summary:'Расчёт не завершён.',cards:[],targets:[],plan:[]};
    const cards=[];
    const targets=[];
    const config=result.c||{};
    const end=result.end||{};
    const period=result.n===1?'месяца':'трёх месяцев';
    const addCard=(priority,title,current,target,analysis,actions)=>cards.push({priority,label:priorityLabels[priority],title,current,target,analysis,actions});
    const addTarget=(metric,current,target,gap,state)=>targets.push({metric,current,target,gap,state});

    const marginTarget=config.margin;
    if(isNumber(result.margin)&&isNumber(marginTarget)){
      const targetProfit=result.rev*marginTarget;
      const gap=nonNegative(targetProfit-result.profit);
      if(result.profit<0){
        addCard('critical','Прибыльность',`${money(result.profit)}; маржа ${percent(result.margin)}`,`маржа не ниже ${percent(marginTarget)}`,`За период получен убыток. Для выхода только на нулевую прибыль нужно улучшить результат минимум на ${money(Math.abs(result.profit))}; для достижения ориентира модели — на ${money(gap)}.`,[
          'Разделить расходы на переменные, условно-постоянные и разовые; по каждой крупной статье назначить владельца и допустимый лимит.',
          'Посчитать маржу по продуктам, клиентам и каналам. Остановить или пересмотреть сделки, которые не покрывают прямые затраты.',
          'Сформировать три сценария на следующий период: базовый, стрессовый и восстановительный — с отдельным планом продаж и расходов.'
        ]);
      }else if(result.margin<marginTarget){
        addCard('important','Прибыльность',`${money(result.profit)}; маржа ${percent(result.margin)}`,`маржа не ниже ${percent(marginTarget)}`,`Прибыль положительная, но до ориентира модели не хватает ${percent(marginTarget-result.margin)} маржи, или примерно ${money(gap)} прибыли при текущей выручке.`,[
          'Разложить валовую и операционную маржу по направлениям, продуктам и ключевым клиентам; исключить усреднение, скрывающее убыточные сегменты.',
          'Проверить цены, скидки, загрузку сотрудников и закупочные условия. Решения принимать по вкладу в прибыль, а не только по объёму выручки.',
          `Зафиксировать план улучшения результата минимум на ${money(gap)}: отдельно эффект от роста цены, изменения структуры продаж и сокращения затрат.`
        ]);
      }else{
        addCard('positive','Прибыльность',`${money(result.profit)}; маржа ${percent(result.margin)}`,`сохранять не ниже ${percent(marginTarget)}`,`Маржа находится не ниже ориентира модели. Важно подтвердить, что результат не создан разовыми доходами или переносом расходов на следующий период.`,[
          'Проверять маржу по направлениям и клиентам не реже одного раза в месяц.',
          'Отделять повторяемую операционную прибыль от разовых доходов и экономии.',
          'Не увеличивать постоянные расходы быстрее устойчивой валовой прибыли.'
        ]);
      }
      addTarget('Маржа',percent(result.margin),`≥ ${percent(marginTarget)}`,gap>0?`не хватает ${money(gap)} прибыли`:'ориентир достигнут',gap>0?'gap':'ok');
    }else{
      addCard('data','Прибыльность','не рассчитана',`маржа не ниже ${percent(marginTarget)}`,'Без выручки и расходов нельзя проверить качество прибыли и определить реалистичную точку безубыточности.',[
        'Заполнить выручку и расходы за каждый месяц выбранного периода.',
        'Проверить, что расходы относятся к тому же периоду, что и выручка.',
        'Отделить возвраты, разовые доходы и капитальные вложения от текущей деятельности.'
      ]);
    }

    if(result.noLiabilities){
      addCard('positive','Покрытие краткосрочных обязательств','краткосрочные обязательства не указаны или равны нулю','сохранять своевременную оплату','По введённым данным краткосрочная задолженность отсутствует. Это не отменяет необходимости учитывать ближайшие налоги, зарплату и платежи по договорам.',[
        'Включить в платёжный календарь обязательства, которые возникнут в ближайшие 8 недель.',
        'Сверить календарь с договорами, налоговыми сроками и графиком зарплаты.',
        'Не считать свободными деньги, зарезервированные под уже принятые обязательства.'
      ]);
      addTarget('Покрытие обязательств','обязательств нет','≥ 1,00','дефицита нет','ok');
    }else if(isNumber(result.coverage)&&isNumber(end.cash)&&isNumber(end.liab)){
      const gap=nonNegative(end.liab-end.cash);
      if(result.coverage<1){
        addCard('critical','Покрытие краткосрочных обязательств',`${number(result.coverage)}; денег ${money(end.cash)}`,`коэффициент не ниже 1,00; требуется ${money(end.liab)}`,`Доступных денег не хватает на ${money(gap)} для полного покрытия указанных краткосрочных обязательств. При совпадении сроков платежей возникает риск кассового разрыва.`,[
          'Составить платёжный календарь минимум на 8 недель с датой, суммой, приоритетом и подтверждённым источником денег по каждому платежу.',
          `Обеспечить дополнительный денежный поток не менее ${money(gap)}: ускорить поступления, сократить необязательные выплаты или согласовать коммерческие сроки оплаты.`,
          'Налоги, зарплату и иные обязательные выплаты переносить только при наличии законного основания; коммерческие платежи согласовывать письменно.'
        ]);
      }else if(result.coverage<1.25){
        addCard('important','Покрытие краткосрочных обязательств',number(result.coverage),'не ниже 1,25 для рабочего запаса','Обязательства формально покрываются, но запас небольшой: задержка одного крупного поступления может быстро создать дефицит.',[
          'Разнести платежи по неделям и проверить минимальный остаток после каждой даты.',
          'Установить неснижаемый остаток, который не используется на необязательные покупки.',
          'Подготовить резервный сценарий при задержке крупнейшего платежа клиента на 7–14 дней.'
        ]);
      }else{
        addCard('positive','Покрытие краткосрочных обязательств',number(result.coverage),'сохранять не ниже 1,00','Денежный остаток покрывает заявленные краткосрочные обязательства. Следует проверить совпадение сроков поступлений и платежей.',[
          'Еженедельно обновлять платёжный календарь и подтверждать ожидаемые поступления.',
          'Отдельно учитывать деньги с ограниченным назначением.',
          'Проверять устойчивость при задержке крупнейшей дебиторской задолженности.'
        ]);
      }
      addTarget('Покрытие обязательств',number(result.coverage),'≥ 1,00',gap>0?`нужно ещё ${money(gap)}`:'обязательства покрыты',gap>0?'gap':'ok');
    }else{
      addCard('data','Покрытие краткосрочных обязательств','не рассчитано','коэффициент не ниже 1,00','Не указаны деньги или краткосрочные обязательства на конец периода. Без этих данных нельзя оценить непосредственный риск неплатежа.',[
        'Указать остатки на всех расчётных счетах и в кассе на одну дату.',
        'Собрать обязательства со сроком погашения до 12 месяцев, отдельно выделив ближайшие 8 недель.',
        'Исключить из свободных денег суммы с целевым назначением.'
      ]);
    }

    if(isNumber(result.reserve)&&isNumber(result.avgExp)&&isNumber(end.cash)){
      const targetDays=config.reserve;
      const targetCash=result.avgExp/30*targetDays;
      const gap=nonNegative(targetCash-end.cash);
      const priority=result.reserve<targetDays*.5?'critical':result.reserve<targetDays?'important':'positive';
      if(priority==='critical'){
        addCard('critical','Денежный резерв',`${number(result.reserve)} дня; ${money(end.cash)}`,`${targetDays} дней; около ${money(targetCash)}`,`Резерв покрывает менее половины отраслевого ориентира. До целевого запаса не хватает примерно ${money(gap)}. Даже краткая задержка поступлений может потребовать внешнего финансирования.`,[
          'Открыть отдельный резервный счёт и запретить его использование на плановые операционные расходы без решения ответственного лица.',
          `Сначала довести резерв хотя бы до 10 дней расходов, затем — до ${targetDays} дней. Пополнять его фиксированной долей каждого свободного денежного потока.`,
          'Пересмотреть регулярные платежи, подписки, аренду, подрядчиков и график закупок; разовые сокращения не заменяют постоянного контроля.'
        ]);
      }else if(priority==='important'){
        addCard('important','Денежный резерв',`${number(result.reserve)} дня; ${money(end.cash)}`,`${targetDays} дней; около ${money(targetCash)}`,`Резерв ниже ориентира модели на ${number(targetDays-result.reserve)} дня, или примерно на ${money(gap)}.`,[
          'Зафиксировать еженедельное пополнение резерва как отдельную строку платёжного календаря.',
          'Определить перечень событий, при которых резерв разрешено использовать.',
          'Ежемесячно пересчитывать целевую сумму с учётом фактических расходов.'
        ]);
      }else{
        addCard('positive','Денежный резерв',`${number(result.reserve)} дня; ${money(end.cash)}`,`сохранять не ниже ${targetDays} дней`,`Запас денег соответствует ориентиру модели. Его необходимо защищать от незапланированного роста постоянных расходов.`,[
          'Хранить резерв отдельно от операционного остатка.',
          'Пересчитывать цель после существенного изменения затрат.',
          'Проверять достаточность резерва в стресс-сценарии падения выручки.'
        ]);
      }
      addTarget('Денежный резерв',`${number(result.reserve)} дня`,`${targetDays} дней / ${money(targetCash)}`,gap>0?`не хватает ${money(gap)}`:'ориентир достигнут',gap>0?'gap':'ok');
    }else{
      addCard('data','Денежный резерв','не рассчитан',`${config.reserve} дней расходов`,'Для расчёта нужны деньги на конец периода и среднемесячные расходы.',[
        'Указать денежный остаток на ту же дату, на которую определены обязательства.',
        'Проверить полноту расходов за период, включая налоги и регулярные выплаты.',
        'Не включать в резерв деньги, которые уже предназначены для конкретного платежа.'
      ]);
    }

    if(isNumber(result.over)&&isNumber(end.over)&&isNumber(result.avgRev)){
      const limit=config.over;
      const limitAmount=result.avgRev*limit;
      const excess=nonNegative(end.over-limitAmount);
      if(result.over>limit){
        addCard(result.over>limit*1.5?'critical':'important','Просроченная дебиторская задолженность',`${money(end.over)}; ${percent(result.over)} среднемесячной выручки`,`не более ${percent(limit)}; до ${money(limitAmount)}`,`Для возвращения хотя бы к границе модели необходимо получить, реструктурировать или юридически урегулировать минимум ${money(excess)} просроченной задолженности.`,[
          'Сформировать реестр старения долга: до 30, 31–60, 61–90 и более 90 дней; назначить ответственного и следующую дату действия по каждому должнику.',
          `Составить план поступлений минимум на ${money(excess)} сверх обычных продаж: подтверждение оплаты, график реструктуризации, претензионная работа или списание по обоснованной процедуре.`,
          'Для новых продаж установить кредитные лимиты, авансы, контроль просрочки и запрет дальнейшей отгрузки при нарушении условий.'
        ]);
      }else{
        addCard('positive','Просроченная дебиторская задолженность',`${money(end.over)}; ${percent(result.over)} среднемесячной выручки`,`сохранять не выше ${percent(limit)}`,'Доля просрочки не превышает границу модели. Важно контролировать не только сумму, но и срок и концентрацию долга у отдельных клиентов.',[
          'Еженедельно обновлять старение дебиторской задолженности.',
          'Установить лимиты и условия отсрочки по каждому клиенту.',
          'Отдельно контролировать долги старше 60 и 90 дней.'
        ]);
      }
      addTarget('Просроченная дебиторка',percent(result.over),`≤ ${percent(limit)}`,excess>0?`сократить минимум на ${money(excess)}`:'в пределах ориентира',excess>0?'gap':'ok');
    }else{
      addCard('data','Просроченная дебиторская задолженность','не указана',`не выше ${percent(config.over)} среднемесячной выручки`,'Пустое поле исключено из индекса. Это не означает отсутствия просрочки.',[
        'Собрать задолженность по контрагентам и срокам возникновения.',
        'Отделить текущую задолженность от просроченной.',
        'Сверить суммы с актами, договорами и фактическими поступлениями.'
      ]);
    }

    if(isNumber(result.debt)&&isNumber(end.debt)&&isNumber(result.avgRev)){
      const limit=config.debt;
      const limitAmount=result.avgRev*limit;
      const excess=nonNegative(end.debt-limitAmount);
      if(result.debt>limit){
        addCard('critical','Долговая нагрузка',`${money(end.debt)}; ${percent(result.debt)} среднемесячной выручки`,`не выше ${percent(limit)}; до ${money(limitAmount)}`,`Долг превышает границу модели на ${money(excess)}. Простое отношение долга к выручке не учитывает проценты и сроки, поэтому отдельно нужен график обслуживания долга.`,[
          'Составить единый график основного долга, процентов, комиссий, залогов и ковенант.',
          'Приостановить новый долг для покрытия системного операционного дефицита до появления подтверждённого плана денежного потока.',
          'Рассмотреть рефинансирование, изменение графика или досрочное погашение наиболее дорогих обязательств на основе сценарного расчёта.'
        ]);
      }else{
        addCard('monitor','Долговая нагрузка',`${money(end.debt)}; ${percent(result.debt)} среднемесячной выручки`,`сохранять не выше ${percent(limit)}`,'Показатель находится ниже границы модели. Однако при слабом денежном резерве даже умеренный долг может создавать напряжение по датам платежей.',[
          'Сопоставить график погашения с платёжным календарём и ожидаемыми поступлениями.',
          'Не использовать новый долг как постоянную замену недостаточной операционной прибыли.',
          'Отдельно контролировать процентную ставку, обеспечение и возможность досрочного требования.'
        ]);
      }
      addTarget('Долг / выручка',percent(result.debt),`≤ ${percent(limit)}`,excess>0?`превышение ${money(excess)}`:'в пределах ориентира',excess>0?'gap':'ok');
    }else{
      addCard('data','Долговая нагрузка','не указана',`не выше ${percent(config.debt)} среднемесячной выручки`,'Пустое поле исключено из индекса. Для решения о кредитной нагрузке нужен не только остаток, но и календарь платежей.',[
        'Указать остаток кредитов, займов, овердрафтов и процентов на конец периода.',
        'Добавить ежемесячный график погашения и ставку по каждому договору.',
        'Сопоставить выплаты с операционным денежным потоком.'
      ]);
    }

    if(result.n===3){
      if(isNumber(result.growth)){
        if(result.growth<0){
          addCard(result.growth<-.1?'critical':'important','Динамика выручки',percent(result.growth),'не допускать устойчивого снижения',`Выручка третьего месяца ниже первого. Нужно отделить сезонность и разовые колебания от устойчивого снижения спроса.`,[
            'Разложить изменение выручки на количество продаж, средний чек, цены, возвраты и структуру клиентов.',
            'Проверить воронку продаж и ожидаемую выручку минимум на 8 недель.',
            'Согласовать стресс-сценарий расходов при сохранении снижения ещё два месяца.'
          ]);
        }else{
          const cashWarning=(isNumber(result.coverage)&&result.coverage<1)||(isNumber(result.reserve)&&result.reserve<config.reserve);
          addCard('positive','Динамика выручки',percent(result.growth),'сохранять рост без ухудшения маржи и денег',cashWarning?'Выручка растёт, но рост пока не преобразован в достаточную ликвидность. Возможно, деньги задерживаются в дебиторке или рост требует опережающих расходов.':'Выручка растёт. Следует убедиться, что одновременно сохраняются маржа, качество дебиторки и денежный поток.',[
            'Сравнивать рост выручки с ростом прибыли, дебиторки и операционных расходов.',
            'Планировать потребность в оборотном капитале до принятия крупных заказов.',
            'Не считать рост устойчивым, пока поступления не подтверждены деньгами.'
          ]);
        }
        addTarget('Динамика выручки',percent(result.growth),'≥ 0% без ухудшения маржи',result.growth<0?'нужно восстановление':'положительная динамика',result.growth<0?'gap':'ok');
      }else{
        addCard('data','Динамика выручки','не рассчитана','сравнить первый и третий месяц','Для оценки динамики нужна положительная выручка первого месяца и данные третьего месяца.',[
          'Проверить выручку по одинаковым правилам признания во всех месяцах.',
          'Исключить влияние возвратов и разовых продаж.',
          'Сравнить также количество продаж и средний чек.'
        ]);
      }
    }

    if(config.stock){
      if(isNumber(result.stockDays)&&isNumber(end.stock)&&isNumber(result.avgExp)){
        const limit=config.days;
        const limitAmount=result.avgExp/30*limit;
        const excess=nonNegative(end.stock-limitAmount);
        if(result.stockDays>limit){
          addCard('important','Запасы',`${number(result.stockDays)} дня расходов; ${money(end.stock)}`,`не выше ${limit} дней; до ${money(limitAmount)}`,`Запасы превышают границу модели на ${money(excess)} и могут связывать оборотные деньги. Этот показатель приблизительный и не заменяет расчёт оборачиваемости по себестоимости.`,[
            'Провести ABC/XYZ-анализ и выделить медленно оборачиваемые и неликвидные позиции.',
            'Установить точки заказа, минимальные и максимальные остатки.',
            'Согласовать план распродажи, возврата поставщику или списания неликвидов.'
          ]);
        }else{
          addCard('monitor','Запасы',`${number(result.stockDays)} дня расходов; ${money(end.stock)}`,`не выше ${limit} дней`,'Запасы находятся в пределах границы модели. Контролируйте наличие дефицита и неликвидов отдельно.',[
            'Проверять оборачиваемость по категориям, а не только общую сумму.',
            'Сопоставлять закупки с подтверждённым спросом.',
            'Отдельно учитывать резерв под обесценение неликвидов.'
          ]);
        }
        addTarget('Запасы',`${number(result.stockDays)} дня`,`≤ ${limit} дней`,excess>0?`сократить на ${money(excess)}`:'в пределах ориентира',excess>0?'gap':'ok');
      }else{
        addCard('data','Запасы','не указаны',`не выше ${config.days} дней расходов`,'Для выбранной отрасли запасы участвуют в модели, но поле не заполнено.',[
          'Указать остаток запасов на конец периода.',
          'Отделить готовую продукцию, сырьё, товары и неликвиды.',
          'Для полноценного анализа рассчитать оборачиваемость по себестоимости.'
        ]);
      }
    }

    const coverageGap=isNumber(end.liab)&&isNumber(end.cash)?nonNegative(end.liab-end.cash):0;
    const reserveTarget=isNumber(result.avgExp)?result.avgExp/30*config.reserve:null;
    const reserveGap=isNumber(reserveTarget)&&isNumber(end.cash)?nonNegative(reserveTarget-end.cash):0;
    const overdueLimit=isNumber(result.avgRev)?result.avgRev*config.over:null;
    const overdueGap=isNumber(overdueLimit)&&isNumber(end.over)?nonNegative(end.over-overdueLimit):0;
    const marginGap=isNumber(marginTarget)?nonNegative(result.rev*marginTarget-result.profit):0;
    const plan=[
      {period:'Первые 7 дней',actions:[
        'Составить платёжный календарь на 8 недель и подтвердить даты крупнейших поступлений и выплат.',
        'Подготовить реестр дебиторской задолженности по срокам и назначить ответственного по каждому просроченному долгу.',
        'Зафиксировать временный порядок согласования необязательных расходов и минимальный остаток денег.'
      ]},
      {period:'До 30 дней',actions:[
        coverageGap>0?`Закрыть или письменно урегулировать кассовый дефицит не менее ${money(coverageGap)}.`:'Подтвердить, что денежный остаток покрывает обязательства по фактическим срокам.',
        overdueGap>0?`Сократить просроченную дебиторку минимум на ${money(overdueGap)} либо оформить реалистичные графики погашения.`:'Сохранить просрочку в пределах ориентира и не допускать роста долгов старше 60 дней.',
        marginGap>0?`Утвердить набор решений, дающих не менее ${money(marginGap)} улучшения прибыли при сопоставимой выручке.`:'Подтвердить устойчивость маржи без разовых доходов.'
      ]},
      {period:'За 60–90 дней',actions:[
        reserveGap>0?`Сформировать план накопления денежного резерва до ${money(reserveTarget)}; текущий разрыв к цели — ${money(reserveGap)}.`:`Поддерживать резерв не ниже ${config.reserve} дней среднемесячных расходов.`,
        'Ввести ежемесячный цикл: закрытие периода, ДДС, ОПиУ, платёжный календарь, анализ дебиторки и протокол решений.',
        `Повторить диагностику на сопоставимых данных и проверить, улучшились ли показатели не только за один месяц, но и в динамике ${period}.`
      ]}
    ];

    return {summary:resultSummary(result),cards,targets,plan};
  }

  function render(result,title='Детальные рекомендации по расчёту'){
    const model=build(result);
    const cards=model.cards.map(card=>`<article class="fd-rec-card ${card.priority}"><div class="fd-rec-card-head"><span class="fd-rec-priority">${escapeHtml(card.label)}</span><h4>${escapeHtml(card.title)}</h4></div><dl><div><dt>Текущее значение</dt><dd>${escapeHtml(card.current)}</dd></div><div><dt>Ориентир</dt><dd>${escapeHtml(card.target)}</dd></div></dl><p>${escapeHtml(card.analysis)}</p><h5>Что сделать</h5><ol>${card.actions.map(action=>`<li>${escapeHtml(action)}</li>`).join('')}</ol></article>`).join('');
    const targets=model.targets.map(row=>`<tr class="${row.state}"><td>${escapeHtml(row.metric)}</td><td>${escapeHtml(row.current)}</td><td>${escapeHtml(row.target)}</td><td>${escapeHtml(row.gap)}</td></tr>`).join('');
    const plan=model.plan.map(step=>`<article><span>${escapeHtml(step.period)}</span><ol>${step.actions.map(action=>`<li>${escapeHtml(action)}</li>`).join('')}</ol></article>`).join('');
    return `<details class="fd-recommendations" open><summary><div><span class="tag">Рекомендации</span><h3>${escapeHtml(title)}</h3></div><i aria-hidden="true">⌄</i></summary><div class="fd-rec-body"><div class="fd-rec-verdict"><b>Экспертная интерпретация</b><p>${escapeHtml(model.summary)}</p></div><div class="fd-rec-grid">${cards}</div><section class="fd-rec-targets"><h4>Целевые значения и разрывы</h4><div class="fd-scroll"><table><thead><tr><th>Показатель</th><th>Сейчас</th><th>Ориентир модели</th><th>Что требуется</th></tr></thead><tbody>${targets}</tbody></table></div></section><section class="fd-rec-plan"><h4>План действий на 90 дней</h4><div>${plan}</div></section><div class="notice fd-rec-disclaimer"><b>Важно:</b> рекомендации сформированы автоматически только по введённым показателям. Перед решениями проверьте сроки платежей, налоги, сезонность, договорные ограничения и качество исходных данных. Это не аудит и не индивидуальное финансовое заключение.</div></div></details>`;
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
      if(kpis&&examples[index]?.valid)insertAfter(kpis,render(examples[index],`Рекомендации по примеру за ${examples[index].n===1?'1 месяц':'3 месяца'}`),`example-${index+1}`);
    });

    const injectDynamic=result=>{
      const metrics=document.querySelector('.diag-result .metrics');
      if(metrics&&result?.valid)insertAfter(metrics,render(result,'Рекомендации по вашему расчёту'),'dynamic');
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
