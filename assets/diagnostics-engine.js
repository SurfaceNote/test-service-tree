(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.FinancialDiagnosticsEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const methodologyVersion='2.5';
  const completenessThreshold=80;
  const fields=['rev','exp','cash','liab','over','debt','stock'];
  const configs={
    services:{name:'Услуги',margin:.18,reserve:20,over:.12,debt:.55,stock:false},
    trade:{name:'Торговля',margin:.08,reserve:18,over:.10,debt:.65,stock:true,days:60},
    manufacturing:{name:'Производство',margin:.12,reserve:25,over:.12,debt:.70,stock:true,days:90},
    it:{name:'IT',margin:.22,reserve:30,over:.15,debt:.45,stock:false},
    construction:{name:'Строительство',margin:.10,reserve:30,over:.18,debt:.75,stock:true,days:120},
    other:{name:'Другое',margin:.12,reserve:22,over:.14,debt:.65,stock:false}
  };

  const isNumber=value=>typeof value==='number'&&Number.isFinite(value);
  const normalizeValue=value=>{
    if(value===null||value===undefined||value==='')return null;
    const number=Number(value);
    return Number.isFinite(number)?number:null;
  };
  const normalizeMonth=month=>Object.fromEntries(fields.map(key=>[key,normalizeValue(month?.[key])]));
  const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
  const sum=(months,key)=>months.reduce((total,month)=>total+(isNumber(month[key])?month[key]:0),0);
  const baseStatus=rawScore=>rawScore===null||!Number.isFinite(rawScore)?'Недостаточно данных':rawScore>=85?'Устойчивый ориентир':rawScore>=70?'Стабильный ориентир':rawScore>=50?'Требует внимания':'Высокий риск';
  const completenessLabel=value=>value>=completenessThreshold?'Достаточно данных':value>=50?'Частичные данные':'Недостаточно данных';

  function expectedFactors(period,config){
    const factors=[
      {key:'profit',weight:.25},
      {key:'coverage',weight:.20},
      {key:'reserve',weight:.20},
      {key:'over',weight:.15},
      {key:'debt',weight:.10}
    ];
    if(period===3)factors.push({key:'growth',weight:.10});
    if(config.stock)factors.push({key:'stock',weight:.10});
    return factors;
  }

  function calculate(inputMonths,industry='services'){
    const months=(Array.isArray(inputMonths)?inputMonths:[]).map(normalizeMonth);
    const n=months.length;
    const c=configs[industry]||configs.services;
    const errors=[];

    if(n!==1&&n!==3)errors.push('Поддерживается период только за 1 или 3 месяца.');
    months.forEach((month,index)=>{
      if(!isNumber(month.rev))errors.push(`Не указана выручка за месяц ${index+1}.`);
      if(!isNumber(month.exp))errors.push(`Не указаны расходы за месяц ${index+1}.`);
    });

    if(errors.length){
      return {
        valid:false,errors,n,c,months,score:null,rawScore:null,observedScore:null,
        status:'Недостаточно данных',f:[],risks:[],missing:[],completeness:0,
        completenessLabel:completenessLabel(0),provisional:true,scoreRange:null
      };
    }

    const rev=sum(months,'rev');
    const exp=sum(months,'exp');
    const avgRev=n?rev/n:0;
    const avgExp=n?exp/n:0;
    const end=months[n-1]||normalizeMonth({});
    const profit=rev-exp;
    const margin=rev>0?profit/rev:(exp>0?-1:null);
    const noLiabilities=isNumber(end.liab)&&end.liab===0;
    const coverage=noLiabilities?null:(isNumber(end.cash)&&isNumber(end.liab)&&end.liab>0?end.cash/end.liab:null);
    const reserve=isNumber(end.cash)&&avgExp>0?end.cash/avgExp*30:null;
    const over=isNumber(end.over)&&avgRev>0?end.over/avgRev:null;
    const debt=isNumber(end.debt)&&avgRev>0?end.debt/avgRev:null;
    const growth=n===3&&months[0].rev>0&&isNumber(months[2].rev)?months[2].rev/months[0].rev-1:null;
    const stockDays=isNumber(end.stock)&&avgExp>0?end.stock/avgExp*30:null;

    const factors=[];
    const add=(key,name,value,weight,note)=>{
      if(value===null||!Number.isFinite(value))return;
      const raw=clamp(value);
      factors.push({key,name,raw,score:Math.round(raw*100),weight,note});
    };

    add('profit','Прибыльность',margin===null?null:margin/c.margin,.25,{actual:margin,target:c.margin});
    add('coverage','Денежное покрытие обязательств',noLiabilities?1:coverage,.20,{actual:coverage,target:1,noLiabilities});
    add('reserve','Денежный резерв',reserve===null?null:reserve/c.reserve,.20,{actual:reserve,target:c.reserve});
    add('over','Просроченная дебиторка',over===null?null:1-over/c.over,.15,{actual:over,limit:c.over});
    add('debt','Долговая нагрузка',debt===null?null:1-debt/c.debt,.10,{actual:debt,limit:c.debt});
    if(n===3)add('growth','Динамика выручки',growth===null?null:(growth+.10)/.30,.10,{actual:growth});
    if(c.stock)add('stock','Дни покрытия запасов',stockDays===null?null:1-stockDays/c.days,.10,{actual:stockDays,limit:c.days});

    const expected=expectedFactors(n,c);
    const expectedWeight=expected.reduce((total,factor)=>total+factor.weight,0);
    const availableWeight=factors.reduce((total,factor)=>total+factor.weight,0);
    const knownWeighted=factors.reduce((total,factor)=>total+factor.raw*factor.weight,0);
    const observedScore=availableWeight?knownWeighted/availableWeight*100:null;
    const completeness=expectedWeight?availableWeight/expectedWeight*100:0;
    const provisional=completeness<completenessThreshold;
    const minimumScore=expectedWeight?knownWeighted/expectedWeight*100:null;
    const maximumScore=expectedWeight?(knownWeighted+(expectedWeight-availableWeight))/expectedWeight*100:null;
    const rawScore=provisional?null:observedScore;
    const score=rawScore===null?null:Math.round(rawScore);
    const status=observedScore===null?'Недостаточно данных':provisional?'Предварительный результат':baseStatus(observedScore);

    const risks=[];
    if(provisional)risks.push(`Полнота данных ${Math.round(completeness)}%. Для итогового статуса требуется не менее ${completenessThreshold}%.`);
    if(profit<0)risks.push(`За ${n===1?'1 месяц':'3 месяца'} расходы превысили выручку.`);
    if(!noLiabilities&&coverage!==null&&coverage<1)risks.push('Денег недостаточно для полного покрытия краткосрочных обязательств.');
    if(reserve!==null&&reserve<c.reserve*.75)risks.push('Денежный резерв существенно ниже внутреннего ориентира методики.');
    if(over!==null&&over>c.over)risks.push('Просроченная дебиторка превысила внутреннюю критическую границу относительно среднемесячной выручки.');
    if(debt!==null&&debt>c.debt)risks.push('Долговая нагрузка превысила внутреннюю критическую границу.');
    if(n===3&&growth!==null&&growth<0)risks.push('Выручка третьего месяца ниже первого.');
    if(c.stock&&stockDays!==null&&stockDays>c.days)risks.push('Запасы превышают внутреннюю критическую границу в днях среднемесячных расходов.');
    if(!risks.length)risks.push('Критические сигналы по введённым данным не обнаружены.');

    const missing=[];
    if(!isNumber(end.cash))missing.push('деньги');
    if(!isNumber(end.liab))missing.push('краткосрочные обязательства');
    if(!isNumber(end.over))missing.push('просроченная дебиторка');
    if(!isNumber(end.debt))missing.push('кредиты и займы');
    if(c.stock&&!isNumber(end.stock))missing.push('запасы');
    if(n===3&&(!isNumber(months[0].rev)||!isNumber(months[2].rev)))missing.push('динамика выручки');

    return {
      valid:true,errors:[],n,c,months,rev,exp,avgRev,avgExp,end,profit,margin,
      coverage,noLiabilities,reserve,over,debt,growth,stockDays,f:factors,
      expectedFactors:expected,expectedWeight,availableWeight,observedScore,
      rawScore,score,status,risks,missing,completeness,
      completenessLabel:completenessLabel(completeness),provisional,
      scoreRange:minimumScore===null?null:{min:minimumScore,max:maximumScore}
    };
  }

  function barGeometry(values,top=0,height=100){
    const normalized=values.map(value=>Number.isFinite(value)?value:0);
    const min=Math.min(0,...normalized),max=Math.max(0,...normalized);
    const range=max-min||1;
    const y=value=>top+(max-value)/range*height;
    const zeroY=y(0);
    return {min,max,zeroY,bars:normalized.map(value=>{
      const valueY=y(value);
      return value>=0
        ?{value,direction:'positive',y:valueY,height:Math.max(0,zeroY-valueY),zeroY}
        :{value,direction:'negative',y:zeroY,height:Math.max(0,valueY-zeroY),zeroY};
    })};
  }

  return {
    methodologyVersion,completenessThreshold,fields,configs,normalizeValue,
    normalizeMonth,calculate,status:baseStatus,completenessLabel,barGeometry
  };
});
