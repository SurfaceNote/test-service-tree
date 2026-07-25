(function(){
  'use strict';
  if(document.body.dataset.page!=='diagnostics')return;

  const examples=document.querySelector('.fd-stack');
  const calculator=document.querySelector('.diag');
  const container=examples?.parentElement;
  if(!examples||!calculator||!container)return;

  const examplesTitle=examples.querySelector('.fd-title h2');
  if(examplesTitle)examplesTitle.textContent='Примеры результата за 1 и 3 месяца';

  const examplesText=examples.querySelector('.fd-title p');
  if(examplesText)examplesText.textContent='Ниже показаны два готовых расчёта для вымышленной компании: за один месяц и за три месяца. Они помогают проверить формат результата, графики и формулы.';

  const heroText=document.querySelector('.page-hero .container > p');
  if(heroText)heroText.textContent='Сначала выберите период и рассчитайте показатели своего бизнеса. Ниже можно сравнить готовые примеры результата за один и три месяца.';

  let calculatorTitle=document.querySelector('.diagnostics-calculator-title');
  if(!calculatorTitle){
    calculatorTitle=document.createElement('div');
    calculatorTitle.className='section-title diagnostics-calculator-title';
    calculatorTitle.innerHTML='<div><span class="tag">Калькулятор</span><h2>Рассчитайте финансовую устойчивость</h2><p>Выберите отрасль и период, заполните показатели вручную или восстановите вымышленный пример.</p></div>';
  }

  container.insertBefore(calculatorTitle,examples);
  container.insertBefore(calculator,examples);
})();
