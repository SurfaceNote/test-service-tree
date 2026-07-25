const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const script=fs.readFileSync(path.join(root,'assets','home-roadmap.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const base='https://surfacenote.github.io/test-service-tree/';
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
const routes=urls.map(url=>url.replace(base,'')).filter(Boolean);

assert.match(index,/assets\/home-roadmap\.css/,'Roadmap styles must be connected');
assert.match(index,/assets\/home-roadmap\.js/,'Roadmap script must be connected');
assert.match(script,/Дорожная карта сайта/);
assert.match(script,/Быстрый переход на любую страницу/);
assert.match(script,/Показать полную структуру сайта/);
for(const route of routes){
  assert.ok(script.includes(`'${route}'`)||script.includes(`"${route}"`),`Missing roadmap route: ${route}`);
}
assert.match(script,/services\/accounting\.html/);
assert.match(script,/shop\/reports\.html/);
assert.match(script,/legal\/privacy\.html/);
console.log(`Home roadmap: ${routes.length+1} pages are available.`);
