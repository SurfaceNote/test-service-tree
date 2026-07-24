
from pathlib import Path
from html.parser import HTMLParser
import sys
root=Path(__file__).resolve().parents[1]
errors=[]
class P(HTMLParser):
    def __init__(self,path):
        super().__init__(); self.path=path; self.ids=set(); self.labels=[]; self.links=[]; self.h1=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if "id" in a:
            if a["id"] in self.ids: errors.append(f"{self.path}: duplicate id {a['id']}")
            self.ids.add(a["id"])
        if tag=="label" and "for" in a: self.labels.append(a["for"])
        if tag=="a" and "href" in a: self.links.append(a["href"])
        if tag=="h1": self.h1+=1
for path in root.rglob("*.html"):
    p=P(path); p.feed(path.read_text(encoding="utf-8"))
    for target in p.labels:
        if target not in p.ids: errors.append(f"{path}: missing label target {target}")
    for href in p.links:
        if href.startswith(("http:","https:","mailto:","tel:","#")): continue
        clean=href.split("#")[0].split("?")[0]
        if not clean: continue
        target=path.parent/clean
        if clean.endswith("/"): target=target/"index.html"
        if not target.exists(): errors.append(f"{path}: broken link {href}")
js="".join((root/f"assets/{name}.js").read_text(encoding="utf-8") for name in ["data","core","diagnostics","pages"])
for forbidden in ("localStorage","sessionStorage","document.write"):
    if forbidden in js: errors.append(f"forbidden API: {forbidden}")
if errors:
    print("\n".join(errors)); sys.exit(1)
print("Static checks passed")
