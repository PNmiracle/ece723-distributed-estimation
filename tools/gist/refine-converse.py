"""Apply the reviewed (145)–(230) explanations without changing symbols or layout."""
from pathlib import Path
import importlib.util
import json
import re
import subprocess
from bs4 import BeautifulSoup

HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
edits={int(n):v for n,v in json.loads((HERE/'converse_revisions.json').read_text()).items()}
assert set(edits)==set(range(145,231))
# Keep the regular build sources consistent with this scoped refresh.
p=HERE/'gist.json';g=json.loads(p.read_text())
for n,item in edits.items():
    for lang,change in item.items():
        for field,index in [('what',0),('why',1)]:
            if field in change:g[lang][str(n)][index]=change[field]
p.write_text(json.dumps(g,ensure_ascii=False,indent=0)+'\n')
p=HERE/'derivations.tsv';lines=[]
for line in p.read_text().splitlines():
    n,en,zh=line.split('\t');change=edits.get(int(n),{})
    lines.append('\t'.join([n,change.get('en',{}).get('where',en),change.get('zh',{}).get('where',zh)]))
p.write_text('\n'.join(lines)+'\n')
# Existing section modules continue to expose the same API to build.js.
for name in ['sec-iii-b.js','sec-iii-c.js','sec-iii-d.js','sec-iii-e.js']:
    p=ROOT/'tools/data'/name;s=p.read_text()
    marker='// Reviewed converse explanations (145)–(230).'
    if marker not in s:
        s+='\n'+marker+'''
for (const [number, langs] of Object.entries(require('../gist/converse_revisions.json'))) {
  for (const [lang, revision] of Object.entries(langs)) {
    if (revision.detail && module.exports[lang]?.notes[number]) module.exports[lang].notes[number] = [revision.detail];
  }
}
'''
        p.write_text(s)
guides={k:v for k,v in json.loads((ROOT/'tools/subguide/subguide.json').read_text()).items() if k.startswith('sec-iii-')}
texts=[text for item in edits.values() for lang in item.values() for text in lang.values()]+[text for item in guides.values() for lang in item.values() for text in lang]
expressions=sorted({m for text in texts for m in re.findall(r'\$([^$]+)\$',text)})
js=r'''
const fs=require('fs');let k;
for(const n of [process.env.KATEX_MODULE,'katex','/opt/npm-tools/node_modules/katex'])if(n)try{k=require(n);break}catch{}
if(!k)throw Error('KaTeX unavailable');const out={};
for(const t of JSON.parse(fs.readFileSync(0,'utf8')))out[t]=k.renderToString(t,{output:'htmlAndMathml',throwOnError:true,strict:'error'});
process.stdout.write(JSON.stringify(out));
'''
r=subprocess.run(['node','-e',js],input=json.dumps(expressions),capture_output=True,text=True,check=True)
math=json.loads(r.stdout)
def inline(text):
    from html import escape
    return ''.join(math[part] if i%2 else re.sub(r'(?<![\w′])\((\d+)\)',
        lambda m:f'<a class="eq-ref" href="#eq-{m[1]}">{m[0]}</a>',escape(part))
        for i,part in enumerate(re.split(r'\$([^$]+)\$',text)))
spec=importlib.util.spec_from_file_location('dependencies',HERE/'dependencies.py');dep=importlib.util.module_from_spec(spec);spec.loader.exec_module(dep)
notes,parents,users,terminal=dep.load()
for name,lang in [('reading.html','zh'),('reading-en.html','en')]:
    p=ROOT/name;soup=BeautifulSoup(p.read_text(),'html.parser')
    invariant=[str(x) for x in soup.select('figure.equation,.plain-syms,.eq-fig,.speaker-bridge')]
    equations={int(e['id'][3:]):e for e in soup.select('figure.equation[id]')}
    for n,item in edits.items():
        aside=equations[n].find_next_sibling('aside',class_='plain');gist=aside.select_one('.plain-gist')
        rows=gist.find_all('span',class_='gist-row',recursive=False)
        assert len(rows)==3,n
        change=item[lang]
        for field,index in [('what',0),('why',2)]:
            if field not in change:continue
            row=rows[index];label=row.select_one('.gist-k').extract();row.clear();row.append(label)
            row.append(BeautifulSoup(inline(change[field]),'html.parser'))
        if 'detail' in change:
            old=aside.select('.plain-more');assert old,n
            new=soup.new_tag('span',attrs={'class':'plain-more'});new.append(BeautifulSoup(inline(change['detail']),'html.parser'))
            old[0].insert_before(new)
            for x in old:x.decompose()
    for id,item in guides.items():
        guide=soup.find(id='sg-'+id);assert guide is not None,id
        rows=guide.select('.sg-row');assert len(rows)==2,id
        for row,text in zip(rows,item[lang]):
            label=row.select_one('b').extract();row.clear();row.append(label)
            row.append(BeautifulSoup(inline(text),'html.parser'))
    html=dep.build(str(soup),lang,notes,parents,users,terminal,numbers=set(edits))
    after=BeautifulSoup(html,'html.parser')
    assert [str(x) for x in after.select('figure.equation,.plain-syms,.eq-fig,.speaker-bridge')]==invariant
    p.write_text(html);print(name,'86 gists reviewed; symbols, diagrams, speaking notes and displayed formulas preserved')
(HERE/'dependency_graph.json').write_text(json.dumps({'parents':parents,'used_by':{n:sorted(users[n]) for n in range(1,493)}},ensure_ascii=False,indent=2)+'\n')
