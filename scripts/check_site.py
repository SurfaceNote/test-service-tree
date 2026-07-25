from pathlib import Path
from html.parser import HTMLParser
import sys

root=Path(__file__).resolve().parents[1]
errors=[]

class Parser(HTMLParser):
    def __init__(self,path):
        super().__init__()
        self.path=path
        self.ids=set()
        self.labels=[]
        self.links=[]
        self.h1=0

    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if "id" in attrs:
            if attrs["id"] in self.ids:
                errors.append(f"{self.path}: duplicate id {attrs['id']}")
            self.ids.add(attrs["id"])
        if tag=="label" and "for" in attrs:
            self.labels.append(attrs["for"])
        if tag=="a" and "href" in attrs:
            self.links.append(attrs["href"])
        if tag=="h1":
            self.h1+=1

for path in root.rglob("*.html"):
    parser=Parser(path)
    parser.feed(path.read_text(encoding="utf-8"))
    for target in parser.labels:
        if target not in parser.ids:
            errors.append(f"{path}: missing label target {target}")
    for href in parser.links:
        if href.startswith(("http:","https:","mailto:","tel:","#")):
            continue
        clean=href.split("#")[0].split("?")[0]
        if not clean:
            continue
        target=path.parent/clean
        if clean.endswith("/"):
            target=target/"index.html"
        if not target.exists():
            errors.append(f"{path}: broken link {href}")

required_files=[
    "assets/data.js",
    "assets/core.js",
    "assets/diagnostics-engine.js",
    "assets/diagnostics-v3.js",
    "assets/diagnostics-v3.css",
    "assets/pages.js",
]
for relative in required_files:
    if not (root/relative).exists():
        errors.append(f"missing required file: {relative}")

js="\n".join((root/relative).read_text(encoding="utf-8") for relative in required_files if relative.endswith(".js") and (root/relative).exists())
for forbidden in ("localStorage","sessionStorage","document.write"):
    if forbidden in js:
        errors.append(f"forbidden API: {forbidden}")

index=(root/"diagnostics/index.html").read_text(encoding="utf-8")
for required in ("diagnostics-engine.js","diagnostics-v3.js","diagnostics-v3.css","Методика 2.6","Неполные данные оцениваются консервативно"):
    if required not in index:
        errors.append(f"diagnostics/index.html: missing {required}")
for legacy in ("diagnostics-dashboard.js","diagnostics-boundary-fixes.js","diagnostics-layout.js","diagnostics-recommendations.js"):
    if legacy in index:
        errors.append(f"diagnostics/index.html: legacy script is still connected: {legacy}")

if errors:
    print("\n".join(errors))
    sys.exit(1)
print("Static checks passed")
