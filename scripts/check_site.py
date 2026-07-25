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
        self.scripts=[]
        self.styles=[]
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
        if tag=="script" and "src" in attrs:
            self.scripts.append(attrs["src"])
        if tag=="link" and attrs.get("rel")=="stylesheet" and "href" in attrs:
            self.styles.append(attrs["href"])
        if tag=="h1":
            self.h1+=1

def resolve(path,reference):
    clean=reference.split("#")[0].split("?")[0]
    if not clean or clean.startswith(("http:","https:","mailto:","tel:","data:")):
        return None
    target=path.parent/clean
    if clean.endswith("/"):
        target=target/"index.html"
    return target.resolve()

for path in root.rglob("*.html"):
    parser=Parser(path)
    parser.feed(path.read_text(encoding="utf-8"))
    for target in parser.labels:
        if target not in parser.ids:
            errors.append(f"{path}: missing label target {target}")
    for reference in [*parser.links,*parser.scripts,*parser.styles]:
        target=resolve(path,reference)
        if target is not None and not target.exists():
            errors.append(f"{path}: broken reference {reference}")

js_files=[
    "assets/data.js",
    "assets/core.js",
    "assets/diagnostics-engine.js",
    "assets/diagnostics-v3.js",
    "assets/pages.js",
]
for relative in js_files:
    path=root/relative
    if not path.exists():
        errors.append(f"missing required script: {relative}")
        continue
    content=path.read_text(encoding="utf-8")
    for forbidden in ("localStorage","sessionStorage","document.write"):
        if forbidden in content:
            errors.append(f"{relative}: forbidden API {forbidden}")

index=(root/"diagnostics/index.html").read_text(encoding="utf-8")
for legacy in (
    "diagnostics-dashboard.js",
    "diagnostics-boundary-fixes.js",
    "diagnostics-layout.js",
    "diagnostics-recommendations.js",
):
    if legacy in index:
        errors.append(f"diagnostics/index.html: legacy script is still connected: {legacy}")

if errors:
    print("\n".join(errors))
    sys.exit(1)
print("Static checks passed")
