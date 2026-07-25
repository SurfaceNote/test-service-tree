const assert=require('node:assert/strict');
const path=require('node:path');

const summary={
  children:[{outerHTML:'<div><small>Формат</small><b>Формат</b></div>'},{outerHTML:'<div><small>Старт</small><b>Старт</b></div>'}],
  innerHTML:'',
  before(node){this.beforeNode=node;}
};
global.key='accounting';
global.serviceExpertise={accounting:{
  inputs:['доступ к учётной системе','банковские выписки','первичные документы','отчётность','данные по сотрудникам'],
  artifacts:[
    {title:'Чек-лист закрытия',format:'таблица',cadence:'ежемесячно',contains:['участок','процедура','ответственный','срок']},
    {title:'Календарь обязательств',format:'календарь',cadence:'еженедельно',contains:['обязательство','период','сумма','статус']},
    {title:'Отчёт собственнику',format:'PDF',cadence:'ежемесячно',contains:['статус','налоги','риски','решения']},
    {title:'Реестр сверок',format:'таблица',cadence:'ежеквартально',contains:['объект','остаток','подтверждение','расхождение']}
  ],
  acceptance:['период закрыт','остатки подтверждены','обязательства спрогнозированы','открытые вопросы назначены']
}};
global.document={
  body:{dataset:{page:'service'}},
  querySelector(selector){return selector==='.service-side-summary'?summary:null;},
  createElement(){return {className:'',textContent:''};}
};

require(path.join('..','assets','service-passport-details.js'));
assert.match(summary.innerHTML,/Исходные данные/);
assert.match(summary.innerHTML,/5 групп/);
assert.match(summary.innerHTML,/доступ к учётной системе/);
assert.match(summary.innerHTML,/Артефакты/);
assert.match(summary.innerHTML,/Чек-лист закрытия/);
assert.match(summary.innerHTML,/Приёмка/);
assert.match(summary.innerHTML,/период закрыт/);
assert.match(summary.innerHTML,/details class="passport-detail-card" open/);
assert.equal(summary.beforeNode.textContent,'Нажмите на раздел, чтобы увидеть конкретный состав.');
console.log('Service passport details: all sections are explained.');
