const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const compatibility=fs.readFileSync(path.join(root,'assets/diagnostics.js'),'utf8');
const pages=fs.readFileSync(path.join(root,'assets/pages.js'),'utf8');

const services={
  accounting:{title:'Бухгалтерское сопровождение',lead:'Учёт и отчётность',includes:[],results:[]}
};
const products={
  calendar:{title:'Платёжный календарь',lead:'Шаблон контроля денег',price:'1 990 ₽',features:[]}
};

function render(page){
  let output='';
  const context={
    page,
    key:'',
    services,
    products,
    layout:html=>{output=String(html)},
    hero:(title,lead,crumb)=>`<header><span>${crumb}</span><h1>${title}</h1><p>${lead}</p></header>`,
    rel:value=>value,
    console
  };
  context.globalThis=context;
  vm.createContext(context);
  vm.runInContext(compatibility,context,{filename:'diagnostics.js'});
  vm.runInContext(pages,context,{filename:'pages.js'});
  return output;
}

assert.match(render('services'),/Финансовые услуги для ИП и ООО/);
assert.match(render('services'),/Бухгалтерское сопровождение/);
assert.match(render('cases'),/Демонстрационные кейсы/);
assert.match(render('cases'),/Кассовые разрывы при росте/);
assert.match(render('shop'),/Готовые финансовые шаблоны/);
assert.match(render('shop'),/Платёжный календарь/);
assert.match(render('team'),/Команда и стандарты/);
assert.match(render('team'),/Анна Соколова/);

for(const pagePath of ['index.html','services/index.html','cases/index.html','shop/index.html','team/index.html']){
  const html=fs.readFileSync(path.join(root,pagePath),'utf8');
  const compatibilityIndex=html.indexOf('diagnostics.js');
  const pagesIndex=html.indexOf('pages.js');
  assert.ok(compatibilityIndex>=0,`${pagePath} must load diagnostics.js compatibility entry point`);
  assert.ok(pagesIndex>compatibilityIndex,`${pagePath} must load diagnostics.js before pages.js`);
}

console.log('Navigation content: services, cases, templates and team render correctly.');
