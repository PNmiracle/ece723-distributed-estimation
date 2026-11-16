# Turn the paper's run-in subheadings ("1) Title:" / "1）标题。" and unnumbered italic/bold paragraph heads)
# into <h4 class="sub-h"> headings with ids, and rebuild the sidebar contents as a multi-level tree.
# Idempotent. Usage (from repo root): python3 tools/toc/subheads.py reading.html reading-en.html
import re, sys, bisect, html
def strip(h): return html.unescape(re.sub(r'<[^>]+>', '', re.sub(r'<span class="katex">.*?</annotation>', '', h, flags=re.S))).strip()
PAT = {
 'en': [('num', re.compile(r'<p><em>(\d+\) (?:(?!</em>).){3,120}?):</em>\s*', re.S), False),
        ('num', re.compile(r'\s*<em>(\d+\) [A-Z](?:(?!</em>).){3,120}?):</em>\s*', re.S), True),
        ('minor', re.compile(r'<p><em>((?!Proof)[A-Z](?:(?!</em>).){2,80}?)[.:]</em>\s*', re.S), False)],
 'zh': [('num', re.compile(r'<p>(?:<strong>)?(\d+\s*[）)]\s*[^。：:<$]{2,60}?)[。：:](?:</strong>)?\s*'), False),
        ('minor', re.compile(r'<p><strong>((?!摘要|关键词|定理|引理|推论|命题|证明)[^<]{2,40})。</strong>\s*'), False)],
}
for f in sys.argv[1:]:
    s = open(f, encoding='utf-8').read()
    lang = 'en' if 'lang="en"' in s[:300] else 'zh'
    for kind, rx, mid in PAT[lang]:
        secs = [(m.start(), m.group(1)) for m in re.finditer(r'<section class="unit[^"]*" id="([^"]+)"', s)]
        pos = [p for p, _ in secs]; cnt = {}
        def rep(m):
            sec = secs[bisect.bisect_right(pos, m.start()) - 1][1]
            if sec == 'references': return m.group(0)
            if mid:
                pre = s[max(0, m.start() - 2):m.start()]
                if not re.search(r'[.:]$', pre.rstrip()): return m.group(0)
            cnt[sec] = cnt.get(sec, 0) + 1
            hid = f"{sec}-{'s' if kind == 'num' else 'p'}{cnt[sec]}" if kind == 'num' else f"{sec}-p{cnt[sec]}"
            h = f'<h4 class="sub-h{" minor" if kind == "minor" else ""}" id="{hid}">{m.group(1).strip()}</h4>'
            return ('</p>' + h + '<p>') if mid else (h + '<p>')
        s = rx.sub(rep, s)
        # disambiguate repeated ids (e.g. two counters in one section)
    if lang == 'zh':  # unnumbered paragraph heads: use the English page's positions (paragraphs are 1:1)
        import os
        enf = os.path.join(os.path.dirname(os.path.abspath(f)), 'reading-en.html')
        e = open(enf, encoding='utf-8').read(); m0 = e.find('<main')
        est = [m.start() for m in re.finditer(r'<div class="para[ "]', e) if m.start() > m0]
        idx = [bisect.bisect_right(est, m.start()) - 1 for m in re.finditer(r'<h4 class="sub-h minor"', e)]
        m0 = s.find('<main'); zst = [m.start() for m in re.finditer(r'<div class="para[ "]', s) if m.start() > m0]
        hits = set()
        BAD = re.compile(r'^(证明|每个|所有|该|且|最后)|是|为$|成立|都|=')
        def chunk(j): return zst[j], (zst[j + 1] if j + 1 < len(zst) else len(s))
        for i in idx:
            win = [j for j in (i, i - 1, i + 1, i - 2, i + 2) if 0 <= j < len(zst)]
            if any('<h4 class="sub-h minor"' in s[slice(*chunk(j))] for j in win): continue
            for j in win:
                a, b = chunk(j)
                m = re.compile(r'<p>(?:<strong>)?([^<。：:$，,（(]{2,24}(?:（[^）<]{1,30}）[^<。：:$，,]{0,16})?)[。：:](?:</strong>)?\s*').search(s, a, b)
                if m and m.start() in (s.find('<p>', a, b),) and m.start() not in hits and not BAD.search(m.group(1)):
                    hits.add(m.start()); break
        for st in sorted(hits, reverse=True):
            m = re.compile(r'<p>(?:<strong>)?([^<。：:$，,（(]{2,24}(?:（[^）<]{1,30}）[^<。：:$，,]{0,16})?)[。：:](?:</strong>)?\s*').match(s, st)
            s = s[:st] + f'<h4 class="sub-h minor" id="tmp">{m.group(1).strip()}</h4><p>' + s[m.end():]
    s = re.sub(r'<p>\s*</p>', '', s)
    # number every subheading in document order, per section
    secs = [(m.start(), m.group(1)) for m in re.finditer(r'<section class="unit[^"]*" id="([^"]+)"', s)]
    pos = [p for p, _ in secs]; cnt = {}
    def ren(m):
        sec = secs[bisect.bisect_right(pos, m.start()) - 1][1]; k = 'p' if m.group(1) else 's'
        cnt[(sec, k)] = cnt.get((sec, k), 0) + 1
        return f'<h4 class="sub-h{m.group(1) or ""}" id="{sec}-{k}{cnt[(sec, k)]}">'
    s = re.sub(r'<h4 class="sub-h( minor)?" id="[^"]+">', ren, s)
    # ---- rebuild the contents tree ----
    nav_m = re.search(r'(<nav aria-label="[^"]*">)(.*?)(</nav>)', s, re.S)
    labels = {}
    for a in re.finditer(r'<a(?: class="(toc-l1)")? href="#([^"]+)">(.*?)</a>', nav_m.group(2)):
        if a.group(2) not in labels and not re.search(r'-[sp]\d+$', a.group(2)): labels[a.group(2)] = (bool(a.group(1)), a.group(3))
    order = [m.group(1) for m in re.finditer(r'<section class="unit[^"]*" id="([^"]+)"', s)]
    kids = {}
    for m in re.finditer(r'<section class="unit[^"]*" id="([^"]+)"|<h4 class="sub-h( minor)?" id="([^"]+)">(.*?)</h4>', s, re.S):
        if m.group(1): cur = m.group(1); kids[cur] = []
        else: kids[cur].append((bool(m.group(2)), m.group(3), html.escape(strip(m.group(4)), quote=False)))
    def tree(sec):
        out = ''; node = None
        items = []
        for minor, hid, txt in kids.get(sec, []):
            if not minor: items.append([hid, txt, []])
            elif items and items[-1][2] is not None: items[-1][2].append((hid, txt))
            else: items.append([hid, txt, None])
        for hid, txt, sub in items:
            if sub is None: out += f'<a class="toc-l4" href="#{hid}">{txt}</a>'
            elif sub: out += f'<div class="toc-node"><a class="toc-l3" href="#{hid}">{txt}</a><div class="toc-kids">' + ''.join(f'<a class="toc-l4" href="#{a}">{b}</a>' for a, b in sub) + '</div></div>'
            else: out += f'<a class="toc-l3" href="#{hid}">{txt}</a>'
        return out
    nav = ''
    first = re.match(r'\s*(<a class="toc-l1" href="#overview">.*?</a>)', nav_m.group(2))
    if first: nav += first.group(1)
    i = 0; secs_l1 = [x for x in order if labels.get(x, (False,))[0]]
    for x in secs_l1:
        subs = [y for y in order[order.index(x) + 1:] if y in labels and not labels[y][0]]
        nxt = secs_l1[secs_l1.index(x) + 1] if secs_l1.index(x) + 1 < len(secs_l1) else None
        if nxt: subs = [y for y in subs if order.index(y) < order.index(nxt)]
        inner = tree(x)
        for y in subs:
            t = tree(y)
            inner += (f'<div class="toc-node"><a href="#{y}">{labels[y][1]}</a><div class="toc-kids">{t}</div></div>' if t else f'<a href="#{y}">{labels[y][1]}</a>')
        nav += f'<div class="toc-group"><a class="toc-l1" href="#{x}">{labels[x][1]}</a><div class="toc-sub">{inner}</div></div>'
    s = s[:nav_m.start(2)] + nav + s[nav_m.end(2):]
    open(f, 'w', encoding='utf-8').write(s)
    print(f, lang, 'subheadings', s.count('class="sub-h'), 'toc links', nav.count('<a '))
# ---- inject (or refresh) the contents-tree style and script ----
import os
HERE = os.path.dirname(os.path.abspath(__file__))
css = open(os.path.join(HERE, 'toc.css'), encoding='utf-8').read().strip()
js = open(os.path.join(HERE, 'toc.js'), encoding='utf-8').read().strip()
for f in sys.argv[1:]:
    s = open(f, encoding='utf-8').read()
    s = re.sub(r'\n?<style id="toc-style">.*?</style>', '', s, flags=re.S)
    s = re.sub(r'\n?<script id="toc-script">.*?</script>', '', s, flags=re.S)
    s = s.replace('</head>', f'<style id="toc-style">\n{css}\n</style>\n</head>')
    s = s.replace('</body>', f'<script id="toc-script">\n{js}\n</script>\n</body>')
    open(f, 'w', encoding='utf-8').write(s)
