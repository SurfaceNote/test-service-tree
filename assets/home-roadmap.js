(function(){
  'use strict';
  if(document.body.dataset.page!=='home')return;

  const card=document.querySelector('.hero-card');
  if(!card)return;

  const groups=[
    {label:'Основные разделы',pages:[
      ['Главная',''],
      ['Все услуги','services/'],
      ['Финансовая диагностика','diagnostics/'],
      ['Кейсы','cases/'],
      ['Финансовые шаблоны','shop/'],
      ['Команда','team/'],
      ['Контакты','contacts/']
    ]},
    {label:'Услуги',pages:[
      ['Бухгалтерское сопровождение','services/accounting.html'],
      ['Налоговое консультирование','services/tax.html'],
      ['Зарплата и кадровый учёт','services/payroll.html'],
      ['Управленческий учёт','services/management.html'],
      ['Финансовый директор на аутсорсе','services/cfo.html'],
      ['Казначейство','services/treasury.html'],
      ['Аудит и восстановление','services/audit.html'],
      ['Финансовые модели','services/modeling.html']
    ]},
    {label:'Шаблоны',pages:[
      ['Шаблон ДДС','shop/cash-flow.html'],
      ['Финансовая модель бизнеса','shop/financial-model.html'],
      ['Платёжный календарь','shop/payment-calendar.html'],
      ['Набор управленческих отчётов','shop/reports.html']
    ]},
    {label:'Документы',pages:[
      ['Политика конфиденциальности','legal/privacy.html'],
      ['Условия использования','legal/terms.html']
    ]}
  ];

  const escapeHtml=value=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const optionGroups=groups.map(group=>`<optgroup label="${escapeHtml(group.label)}">${group.pages.map(([title,url])=>`<option value="${escapeHtml(url)}">${escapeHtml(title)}</option>`).join('')}</optgroup>`).join('');
  const allGroups=groups.map(group=>`<section class="roadmap-group"><h3>${escapeHtml(group.label)}</h3><div>${group.pages.map(([title,url])=>`<a href="${escapeHtml(url)}">${escapeHtml(title)}<span aria-hidden="true">→</span></a>`).join('')}</div></section>`).join('');
  const primary=[
    ['01','Диагностика','Рассчитать устойчивость','diagnostics/'],
    ['02','Услуги','Выбрать задачу','services/'],
    ['03','Кейсы','Посмотреть сценарии','cases/'],
    ['04','Шаблоны','Открыть инструменты','shop/'],
    ['05','Команда','Изучить стандарты','team/'],
    ['06','Контакты','Перейти к обращению','contacts/']
  ];

  card.classList.add('site-roadmap');
  card.setAttribute('aria-labelledby','siteRoadmapTitle');
  card.innerHTML=`
    <div class="roadmap-head">
      <span class="tag">Дорожная карта сайта</span>
      <h2 id="siteRoadmapTitle">Выберите нужный раздел</h2>
      <p>Начните с диагностики, найдите услугу или сразу откройте любую страницу сайта.</p>
    </div>
    <nav class="roadmap-primary" aria-label="Основные разделы сайта">
      ${primary.map(([number,title,text,url])=>`<a href="${url}" class="roadmap-step"><b>${number}</b><span><strong>${title}</strong><small>${text}</small></span><i aria-hidden="true">→</i></a>`).join('')}
    </nav>
    <div class="roadmap-jump">
      <label for="sitePageSelect">Быстрый переход на любую страницу</label>
      <div class="roadmap-jump-row">
        <select id="sitePageSelect" aria-label="Выберите страницу сайта">${optionGroups}</select>
        <button class="btn primary" id="sitePageGo" type="button">Перейти</button>
      </div>
    </div>
    <details class="roadmap-details">
      <summary>Показать полную структуру сайта</summary>
      <div class="roadmap-all">${allGroups}</div>
    </details>`;

  const select=document.getElementById('sitePageSelect');
  const go=document.getElementById('sitePageGo');
  const navigate=()=>{window.location.href=select.value||'./';};
  go.addEventListener('click',navigate);
  select.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();navigate();}});
})();
