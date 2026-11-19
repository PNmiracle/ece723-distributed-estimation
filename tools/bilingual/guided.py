"""Expand the reviewed paper comparison into a full guided bilingual reader."""
from pathlib import Path
from bs4 import BeautifulSoup
import re

ROOT=Path(__file__).resolve().parents[2]

def build(english, chinese, rows, head, header, column_key, toc_html, title_pair):
    namespace=0
    def clean(node):
        nonlocal namespace
        namespace+=1
        # The supplied soups belong only to this build; copies are unnecessary.
        for x in list(node.select('button,.nref,.plain-zh,.vids,script')):x.decompose()
        # SVG marker IDs are document-global; some source diagrams reuse them.
        for index,svg in enumerate(node.select('svg')):
            mapping={el['id']:f'gb-{namespace}-{index}-{el["id"]}' for el in svg.select('[id]')}
            for el in [svg,*svg.find_all(True)]:
                for key,value in list(el.attrs.items()):
                    if not isinstance(value,str):continue
                    if key=='id':el[key]=mapping.get(value,value)
                    else:
                        for old,new in mapping.items():
                            value=value.replace(f'url(#{old})',f'url(#{new})')
                            if value=='#'+old:value='#'+new
                        el[key]=value
        return str(node)
    def pair(ident,en,zh,classes,chapter='',section=''):
        return (f'<div class="pair {classes}" id="{ident}" data-chapter="{chapter}" data-section="{section}">'
                f'<div class="column english" lang="en">{en}</div>'
                f'<div class="column chinese" lang="zh-Hans">{zh}</div></div>')
    en_eq={e['id']:e for e in english.select('.paper figure.equation')}
    zh_eq={e['id']:e for e in chinese.select('.paper figure.equation')}
    out=[];counts={'equations':0,'explanations':0,'speaking_bridges':0}
    for row in rows:
        match=re.search(r'<figure class="equation" id="(eq-\d+)" data-chapter="([^"]*)" data-section="([^"]*)"',row)
        if not match:out.append(row);continue
        ident,chapter,section=match.groups();en,en_zh=en_eq[ident],zh_eq[ident]
        ep=en.find_next_sibling('aside',class_='plain');zp=en_zh.find_next_sibling('aside',class_='plain')
        assert ep and zp,ident
        eb=en.find_previous_sibling();zb=en_zh.find_previous_sibling()
        if eb and 'speaker-bridge' in eb.get('class',[]):
            assert zb and 'speaker-bridge' in zb.get('class',[]),ident
            out.append(pair('speaking-'+ident,clean(eb),clean(zb),'speaking-pair',chapter,section));counts['speaking_bridges']+=1
        out.append(row);counts['equations']+=1
        out.append(pair('plain-'+ident,clean(ep),clean(zp),'explanation-pair',chapter,section));counts['explanations']+=1
    assert counts=={'equations':492,'explanations':492,'speaking_bridges':158},counts
    overview=pair('overview',clean(english.select_one('section.overview')).replace('id="overview"',''),clean(chinese.select_one('section.overview')).replace('id="overview"',''),'overview-pair')
    header=header.replace('⌂ 论文对照','⌂ 一口气读懂').replace('英文正文 · 逐段对照 · 多级目录','左英文 · 右中文 · 全部 492 条公式')
    header=header.replace('<form id="equation-jump">','<a class="pdf-link" href="bilingual.html?view=both" data-en="Paper text" data-zh="论文原文对照">论文原文对照</a><form id="equation-jump">')
    html=(head.replace(' · 中英论文对照</title>',' · 一口气读懂·中英对照</title>')+
          '<link rel="stylesheet" href="tools/bilingual/style.css"><link rel="stylesheet" href="tools/bilingual/guided.css"><link rel="stylesheet" href="tools/highlights/hl.css"></head><body class="guided-reader">'+header+
          '<div class="layout"><aside class="sidebar"><details id="sections" open><summary data-en="Reading outline" data-zh="阅读目录 · 展开子标题">阅读目录 · 展开子标题</summary><nav><details class="toc-node toc-leaf"><summary><a href="#overview"><span class="toc-en">One-page overview</span><span class="toc-zh">一页总览</span></a></summary></details>'+toc_html+'</nav></details></aside><main>'+column_key+title_pair+overview+''.join(out)+
          '</main></div><script src="tools/bilingual/reader.js"></script><script src="tools/highlights/hl.js" data-bilingual-notes></script></body></html>')
    (ROOT/'reading-bilingual.html').write_text(html)
    # Keep the entry point when the source readers are rebuilt from scratch.
    for filename in ['reading.html','reading-en.html']:
        path=ROOT/filename;source=path.read_text()
        if 'id="reader-bilingual-link"' not in source:
            control='<div aria-label="Language" class="langsw" role="group">'
            assert control in source,filename
            source=source.replace(control,control+'<a id="reader-bilingual-link" href="reading-bilingual.html?view=both" title="左英文、右中文">EN | 中</a>')
            source=source.replace('</body>', '<script id="reader-bilingual-navigation">(()=>{const a=document.getElementById("reader-bilingual-link");const update=()=>a.href="reading-bilingual.html?view=both"+location.hash;update();addEventListener("hashchange",update);})();</script></body>')
            path.write_text(source)
    return counts

if __name__=='__main__':
    raise SystemExit('Run tools/bilingual/build.py to build both comparison readers.')
