(function(){
  'use strict';
  if(document.body.dataset.page!=='service')return;
  const expertise=globalThis.serviceExpertise?.[globalThis.key];
  const summary=document.querySelector('.service-side-summary');
  if(!expertise||!summary)return;

  const escapeHtml=value=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const list=items=>`<ol class="passport-detail-list">${items.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ol>`;
  const artifacts=items=>`<div class="passport-artifact-list">${items.map(item=>`<div class="passport-artifact"><b>${escapeHtml(item.title)}</b><span>${escapeHtml(item.format)} · ${escapeHtml(item.cadence)}</span><small>${escapeHtml(item.contains.join(', '))}</small></div>`).join('')}</div>`;
  const card=(label,count,content,open=false)=>`<details class="passport-detail-card" ${open?'open':''}><summary><span><small>${label}</small><b>${count}</b></span><i aria-hidden="true">⌄</i></summary><div class="passport-detail-body">${content}</div></details>`;

  const format=summary.children[0]?.outerHTML||'';
  const start=summary.children[1]?.outerHTML||'';
  summary.innerHTML=`${format}${start}${card('Исходные данные',`${expertise.inputs.length} групп`,list(expertise.inputs),true)}${card('Артефакты',`${expertise.artifacts.length} вида`,artifacts(expertise.artifacts))}${card('Приёмка',`${expertise.acceptance.length} критерия`,list(expertise.acceptance))}`;

  const heading=document.createElement('p');
  heading.className='passport-help';
  heading.textContent='Нажмите на раздел, чтобы увидеть конкретный состав.';
  summary.before(heading);
})();
