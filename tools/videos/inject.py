# -*- coding: utf-8 -*-
"""Insert the recommended-video blocks into the four pages (idempotent).

    python3 tools/videos/inject.py            # from the repo root

Roadmap pages:  a "Video path" section above the concept map (#videos), a top-bar
                link, and a "Recommended videos" box in every card listed in data.py.
Reading pages:  a box at the end of the section guides listed in data.SECTIONS,
                a top-bar link and a pointer in the one-page overview.
Everything inserted sits between <!--vid:...--> / <!--/vid--> markers, so running
the script again replaces the old blocks instead of duplicating them.
Boxes carry data-hl-ui (skipped by the highlighter) and their own id (so the
in-page editor keys of surrounding text do not shift).
"""
import html, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from data import STEPS, PHASES, QUICK, SECTIONS, CLIPS, CHAPTERS, SUBS, EQS  # noqa: E402

BYID = {s['id']: s for s in STEPS + CLIPS}
ORDER = {s['id']: i + 1 for i, s in enumerate(STEPS)}
E = html.escape

T = {
  'zh': dict(lang_zh='中文', lang_en='英文', slides='讲义', unknown='—', opt='选看', core='必看',
             vids='推荐视频讲解', step='视频路线第 {n} 步', path='完整视频路线 ↗', topbar='📺 视频路线',
             sec_title='配套视频', approx='约', min='分钟',
             vp_h='视频路线：按顺序看',
             vp_sub='每一步都写明看哪个视频的哪一段、多长、为什么看。顺序和下面学习路线的站点一致：先补工具，再进入本文模型，最后把下界拼起来。',
             vp_total='必看合计约 {core}（选看另有约 {opt}）。长视频建议 1.25 倍速；YouTube 上的英文视频可以打开字幕。',
             vp_quick='只有 2–3 小时？按这个顺序看：', vp_cards='对应卡片', vp_why='为什么看',
             ov='📺 不熟悉 score、Fisher 信息、熵或黑板协议？学习路线页有一份按顺序排好的配套视频清单（具体到第几集、第几分钟）。',
             bili_search='B站搜索中文字幕版', hr='小时'),
  'en': dict(lang_zh='Chinese', lang_en='English', slides='slides', unknown='—', opt='optional', core='core',
             vids='Recommended videos', step='Video path, step {n}', path='Full video path ↗', topbar='📺 Video path',
             sec_title='Companion videos', approx='≈', min='min',
             vp_h='Video path: watch in this order',
             vp_sub='Each step names the exact video, the exact part to watch, how long it takes and why. The order follows the stations of the learning path below: tools first, then the paper’s model, then the lower bound.',
             vp_total='Core steps take about {core} (optional steps add about {opt}). For long lectures 1.25× speed works well; Chinese videos are marked.',
             vp_quick='Only 2–3 hours? Watch these, in this order:', vp_cards='Cards', vp_why='Why',
             ov='📺 New to the score, Fisher information, entropy or blackboard protocols? The learning path has an ordered list of companion videos, down to the episode and the minute.',
             bili_search='', hr='h'),
}

HINT = {'zh': '{n} 条 · 点击展开', 'en': '{n} items · click to open'}
HINT0 = {'zh': '点击展开', 'en': 'click to open'}

CSS = """<style id="vid-css">
.vids{margin:12px 0 4px;border:1px solid #e3d9f3;background:#faf7ff;border-radius:10px;padding:8px 12px 6px;font-size:.9rem;line-height:1.6}
.vids .vids-h{font-size:.78rem;font-weight:700;letter-spacing:.06em;color:#6b3fa0;margin-bottom:2px}
.vids ol{margin:4px 0 2px;padding-left:1.3em}.vids li{margin:.45em 0}
.vids a.vt{font-weight:650;color:#3d2a6b;text-decoration:none;border-bottom:1px solid #cbb8ea}.vids a.vt:hover{border-bottom-color:#6b3fa0}
.vid-meta{display:inline-flex;flex-wrap:wrap;gap:4px;margin-left:6px;vertical-align:1px}
.vb{font-size:.7rem;padding:0 7px;border-radius:999px;background:#fff;border:1px solid #ddd3ee;color:#5a4b78;white-space:nowrap}
.vb.zh{border-color:#f0c9a8;color:#9a5a1e}.vb.opt{background:#eef0f3;border-color:#e1e4ea;color:#6b7686}.vb.core{background:#6b3fa0;border-color:#6b3fa0;color:#fff}
.vid-src{color:#6b6480;font-size:.82rem}.vid-part{margin-top:2px;color:#2e2a3a}.vid-why{margin-top:2px;color:#4f566a;font-size:.86rem}
.vid-links{font-size:.8rem;margin-top:2px}.vid-links a{color:#6b3fa0;margin-right:10px}
.vids .vids-more{font-size:.8rem;margin-top:4px}.vids .vids-more a{color:#6b3fa0}
.vpath{max-width:1100px;margin:22px auto 8px;padding:16px 20px;border:1px solid #e3d9f3;border-radius:14px;background:#fcfaff}
.vpath h2{margin:0 0 4px;font-size:1.25rem}.vpath .vp-sub{margin:0 0 6px;color:#4f566a}.vpath .vp-total{margin:0 0 10px;color:#4f566a;font-size:.9rem}
.vpath .vp-quick{font-size:.88rem;margin:0 0 12px;padding:6px 10px;background:#fff;border:1px dashed #cbb8ea;border-radius:8px}
.vpath .vp-quick a{color:#6b3fa0}
.vp-phase{margin:14px 0 4px;font-size:.95rem;color:#6b3fa0}
.vp-step{display:grid;grid-template-columns:2.2em 1fr;gap:4px 10px;padding:10px 0;border-top:1px solid #eee7f8}
.vp-n{font-weight:800;font-size:1.1rem;color:#6b3fa0;text-align:right}
.vp-body .chips{margin-top:4px}
.vp-k{font-size:.74rem;font-weight:700;color:#8a7fa3;margin-right:4px}
.vids-intro{margin:2px 0 4px;color:#3d3650}
.vids .vk{font-weight:700;color:#6b3fa0;margin-right:2px}
.vids-eq{margin:8px 0 14px;font-size:.86rem;background:#fcfaff}
.vids-sub{margin:6px 0 12px}
details.vids>summary{cursor:pointer;list-style:none;display:block}
details.vids>summary::-webkit-details-marker{display:none}
details.vids>summary::before{content:'▸';display:inline-block;width:1em;color:#6b3fa0;transition:transform .15s}
details.vids[open]>summary::before{transform:rotate(90deg)}
details.vids:not([open]){padding-bottom:8px}
details.vids>summary:hover{color:#3d2a6b}
.vids-hint{font-weight:400;color:#8a7fa3;margin-left:6px;font-size:.74rem;letter-spacing:0}
details.vids[open] .vids-hint{display:none}
</style>"""


def fmt_min(m, L):
    if m is None:
        return T[L]['unknown']
    if L == 'zh':
        return f'{m} 分钟' if m < 60 else f'{m // 60} 小时 {m % 60} 分' if m % 60 else f'{m // 60} 小时'
    return f'{m} min' if m < 60 else f'{m // 60} h {m % 60} min' if m % 60 else f'{m // 60} h'


def badges(s, L):
    t = T[L]
    out = []
    out.append(f'<span class="vb{" opt" if s.get("opt") else " core"}">{t["opt"] if s.get("opt") else t["core"]}</span>')
    dur = fmt_min(s['minutes'], L)
    if s.get('approx') and s['minutes'] is not None:
        dur = t['approx'] + dur if L == 'en' else t['approx'] + ' ' + dur
    out.append(f'<span class="vb">⏱ {E(dur)}</span>')
    lang = t['lang_zh'] if s['lang'] == 'zh' else t['lang_en']
    out.append(f'<span class="vb{" zh" if s["lang"] == "zh" else ""}">{lang}{" · " + t["slides"] if s.get("slides") else ""}</span>')
    return '<span class="vid-meta">' + ''.join(out) + '</span>'


def extra_links(s, L):
    links = []
    a = s.get('alt')
    if a:
        links.append(f'<a href="{E(a["url"])}" target="_blank" rel="noopener">{E(a[L])}</a>')
    if L == 'zh' and s['lang'] == 'en' and not s.get('slides') and 'youtube.com' in s['url']:
        q = {'bayes3b1b': '3Blue1Brown 贝叶斯定理', 'mit650a': 'MIT 18.650 统计', 'mit650b': 'MIT 18.650 统计',
             'mit650c': 'MIT 18.650 统计', 'odonnell23b': 'communication complexity'}.get(s['id'])
        if q:
            links.append(f'<a href="https://search.bilibili.com/all?keyword={E(q.replace(" ", "%20"))}" target="_blank" rel="noopener">{T[L]["bili_search"]}</a>')
    return f'<div class="vid-links">{"".join(links)}</div>' if links else ''


def item(s, L, note=None, link_step=True, roadmap_href=''):
    t = T[L]
    head = (f'<a class="vt" href="{E(s["url"])}" target="_blank" rel="noopener">{E(s["title_" + L])}</a>'
            f'{badges(s, L)}<div class="vid-src">{E(s["src_" + L])}</div>')
    body = f'<div class="vid-part">▶ {E(s["part_" + L])}</div>'
    why = f'<div class="vid-why">{E(note) if note else E(s["why_" + L])}</div>'
    step = ''
    if link_step and s['id'] in ORDER:
        step = f' <a class="vstep" href="{roadmap_href}#vp-{s["id"]}">{t["step"].format(n=ORDER[s["id"]])}</a>'
    return f'<li>{head}{body}{why}{extra_links(s, L)}<div class="vids-more">{step}</div></li>'


def wrap(key, inner):
    return f'<!--vid:{key}-->{inner}<!--/vid-->'


def strip_old(t):
    t = re.sub(r'<!--vid:[^>]*-->.*?<!--/vid-->', '', t, flags=re.S)
    return t


def card_titles(t):
    out = {}
    for m in re.finditer(r'<article class="card[^"]*" id="c-([^"]+)".*?<h3>(.*?)<span class="en">', t, re.S):
        out[m.group(1)] = re.sub(r'<[^>]+>', '', m.group(2)).strip()
    return out


def roadmap(path, L):
    t = open(path, encoding='utf-8').read()
    t = strip_old(t)
    titles = card_titles(t)
    for s in STEPS:
        for c in s['cards']:
            assert c in titles, f'{path}: unknown card {c} in step {s["id"]}'
    tx = T[L]
    # 1) CSS
    t = t.replace('</head>', wrap('css', CSS) + '</head>', 1)
    # 2) top-bar link
    t, n = re.subn(r'(<a class="tbtn" href="reading[^"]*"[^>]*>[^<]*</a>)',
                   lambda m: m.group(1) + wrap('tb', f'<a class="tbtn" href="#videos">{tx["topbar"]}</a>'), t, count=1)
    assert n == 1
    # 3) overview section
    core = sum(s['minutes'] or 0 for s in STEPS if not s.get('opt'))
    opt = sum(s['minutes'] or 0 for s in STEPS if s.get('opt'))
    parts = [f'<section class="vpath" id="videos" data-hl-ui><h2>📺 {tx["vp_h"]}</h2>',
             f'<p class="vp-sub">{tx["vp_sub"]}</p>',
             f'<p class="vp-total">{tx["vp_total"].format(core=fmt_min(core, L), opt=fmt_min(opt, L))}</p>']
    qmin = sum(BYID[q]['minutes'] or 0 for q in QUICK)
    ql = ' → '.join(f'<a href="#vp-{q}">{ORDER[q]}</a>' for q in QUICK)
    parts.append(f'<p class="vp-quick">{tx["vp_quick"]} {ql}（{fmt_min(qmin, L)}）</p>' if L == 'zh'
                 else f'<p class="vp-quick">{tx["vp_quick"]} {ql} ({fmt_min(qmin, L)})</p>')
    cur = None
    for s in STEPS:
        if s['phase'] != cur:
            cur = s['phase']
            parts.append(f'<h3 class="vp-phase">{cur}. {PHASES[cur][0 if L == "zh" else 1]}</h3>')
        chips = ''.join(f'<a class="chip pre" href="#c-{c}">{E(titles[c])}</a>' for c in s['cards'])
        it = item(s, L, link_step=False)[4:-5]  # inner of <li>
        parts.append(f'<div class="vp-step" id="vp-{s["id"]}"><div class="vp-n">{ORDER[s["id"]]}</div>'
                     f'<div class="vp-body">{it}<div class="chips"><span class="vp-k">{tx["vp_cards"]}</span>{chips}</div></div></div>')
    parts.append('</section>')
    sec = wrap('path', ''.join(parts))
    t, n = re.subn(r'(<section class="map-wrap" id="map">)', lambda m: sec + m.group(1), t, count=1)
    assert n == 1
    # 4) per-card boxes (before the relations block)
    per = {}
    for s in STEPS:
        for c in s['cards']:
            per.setdefault(c, []).append(s)
    count = 0
    for c, ss in per.items():
        m = re.search(r'<article class="card[^"]*" id="c-' + re.escape(c) + r'"', t)
        j = t.find('<div class="rels">', m.end())
        nxt = t.find('<article', m.end())
        assert j != -1 and (nxt == -1 or j < nxt), c
        box = (f'<details class="vids" id="v-{c}" data-hl-ui><summary class="vids-h">📺 {tx["vids"]}'
               f'<span class="vids-hint">{HINT[L].format(n=len(ss))}</span></summary><ol>'
               + ''.join(item(s, L) for s in ss) + '</ol></details>')
        t = t[:j] + wrap('c-' + c, box) + t[j:]
        count += 1
    open(path, 'w', encoding='utf-8').write(t)
    print(f'{path}: {count} cards, {len(STEPS)} steps')


def reading(path, L, roadmap_href):
    t = open(path, encoding='utf-8').read()
    t = strip_old(t)
    tx = T[L]
    t = t.replace('</head>', wrap('css', CSS) + '</head>', 1)
    t, n = re.subn(r'(<a class="tlink" href="roadmap[^"]*"[^>]*>[^<]*</a>)',
                   lambda m: m.group(1) + wrap('tb', f'<a class="tlink" href="{roadmap_href}#videos" target="_blank">{tx["topbar"]} ↗</a>'), t, count=1)
    assert n == 1, path
    # pointer in the one-page overview (end of section)
    i = t.find('<section class="overview" id="overview">')
    j = t.find('</section>', i)
    ov = (f'<div class="vids" id="v-overview" data-hl-ui><div class="vids-h">{tx["sec_title"]}</div>'
          f'<div>{tx["ov"]} <a href="{roadmap_href}#videos" target="_blank">{tx["path"]}</a></div></div>')
    t = t[:j] + wrap('ov', ov) + t[j:]
    count = 0
    for sec, rows in SECTIONS.items():
        m = re.search(r'<section class="unit[^"]*" id="' + re.escape(sec) + r'"[^>]*>', t)
        assert m, sec
        g = t.find('<aside class="guide">', m.end())
        nxt = t.find('<section class="unit', m.end())
        assert g != -1 and g < nxt, sec
        ge = t.find('</aside>', g)
        lis = ''.join(item(BYID[sid], L, note=(zh if L == 'zh' else en), roadmap_href=roadmap_href).replace(
            '<a class="vstep" href=', '<a class="vstep" target="_blank" href=') for sid, zh, en in rows)
        box = (f'<details class="vids" id="v-{sec}" data-hl-ui><summary class="vids-h">📺 {tx["sec_title"]}'
               f'<span class="vids-hint">{HINT[L].format(n=len(rows))}</span></summary><ol>{lis}</ol>'
               f'<div class="vids-more"><a href="{roadmap_href}#videos" target="_blank">{tx["path"]}</a></div></details>')
        t = t[:ge] + wrap(sec, box) + t[ge:]
        count += 1
    open(path, 'w', encoding='utf-8').write(t)
    print(f'{path}: {count} sections')


R = {
  'zh': dict(ch='本章配套视频（按顺序看）', sec='本节配套视频（按顺序看）', none='这一小节没有对口视频：怎么读', sub='读这一小节前，按顺序看', eq='看不懂式 ({n})？按顺序看',
             watch='看哪部分', why='为什么看', tot='必看约 {core}', tot_opt='，选看另约 {opt}', untimed='，另有未计时的片段'),
  'en': dict(ch='Companion videos for this chapter (in order)', sec='Companion videos for this section (in order)', none='No matching video for this subsection: how to read it', sub='Before reading this subsection, watch in order', eq='Stuck on Eq. ({n})? Watch in order',
             watch='Watch', why='Why', tot='core ≈ {core}', tot_opt=', optional ≈ {opt}', untimed=', plus some untimed parts'),
}


def rich(sid, L, note):
    s = BYID[sid]
    r = R[L]
    head = (f'<a class="vt" href="{E(s["url"])}" target="_blank" rel="noopener">{E(s["title_" + L])}</a>'
            f'{badges(s, L)}<div class="vid-src">{E(s["src_" + L])}</div>')
    part = f'<div class="vid-part"><span class="vk">▶ {r["watch"]}：</span>{E(s["part_" + L])}</div>' if L == 'zh' else \
           f'<div class="vid-part"><span class="vk">▶ {r["watch"]}:</span> {E(s["part_" + L])}</div>'
    sep = '：' if L == 'zh' else ': '
    why = f'<div class="vid-why"><span class="vk">💡 {r["why"]}{sep}</span>{E(note)}</div>'
    return f'<li>{head}{part}{why}{extra_links(s, L)}</li>'


def totals(rows, L):
    core = sum(BYID[i]['minutes'] or 0 for i, *_ in rows if not BYID[i].get('opt'))
    opt = sum(BYID[i]['minutes'] or 0 for i, *_ in rows if BYID[i].get('opt'))
    unk = any(BYID[i]['minutes'] is None for i, *_ in rows)
    r = R[L]
    if core == 0 and opt and not unk:
        return ('均为选看，约 ' if L == 'zh' else 'all optional, ≈ ') + fmt_min(opt, L)
    if core == 0 and unk:
        return ('时长未计' if L == 'zh' else 'untimed') + (r['tot_opt'].format(opt=fmt_min(opt, L)) if opt else '')
    out = r['tot'].format(core=fmt_min(core, L))
    if opt:
        out += r['tot_opt'].format(opt=fmt_min(opt, L))
    if unk:
        out += r['untimed']
    return out


def box(key, cls, title, rows, L, intro='', roadmap_href=''):
    lis = ''.join(rich(i, L, zh if L == 'zh' else en) for i, zh, en in rows)
    paren = ''
    if rows:
        tot = totals(rows, L)
        paren = f'（{tot}）' if L == 'zh' else f' ({tot})'
    hint = HINT[L].format(n=len(rows)) if rows else HINT0[L]
    intro_html = f'<div class="vids-intro">{E(intro)}</div>' if intro else ''
    more = f'<div class="vids-more"><a href="{roadmap_href}#videos" target="_blank">{T[L]["path"]}</a></div>' if roadmap_href else ''
    ol = f'<ol>{lis}</ol>' if rows else ''
    return (f'<details class="vids {cls}" id="v-{key}" data-hl-ui><summary class="vids-h">📺 {E(title)}{E(paren)}'
            f'<span class="vids-hint">{hint}</span></summary>{intro_html}{ol}{more}</details>')


def reading_fine(path, L, roadmap_href):
    t = open(path, encoding='utf-8').read()
    r = R[L]
    n_ch = n_sub = n_eq = 0
    for sec, rows in CHAPTERS.items():
        m = re.search(r'<section class="unit[^"]*" id="' + re.escape(sec) + r'"[^>]*>', t)
        assert m, sec
        g = t.find('<aside class="guide">', m.end())
        nxt = t.find('<section class="unit', m.end())
        if g == -1 or (nxt != -1 and g > nxt):
            print('  no chapter guide for', sec); continue
        ge = t.find('</aside>', g)
        title = r['ch'] if 'unit-h2' in m.group(0) else r['sec']
        t = t[:ge] + wrap('ch-' + sec, box('ch-' + sec, 'vids-ch', title, rows, L, roadmap_href=roadmap_href)) + t[ge:]
        n_ch += 1
    for sub, d in SUBS.items():
        m = re.search(r'<h4 class="sub-h" id="' + re.escape(sub) + r'">.*?</h4>', t, re.S)
        assert m, sub
        b = box(sub, 'vids-sub', r['sub'] if d['items'] else r['none'], d['items'], L, intro=d.get('intro_' + L, ''))
        at = m.end()
        if t.startswith('<!--sg-->', at):  # keep the blue sub-heading guide directly under the heading
            at = t.index('<!--/sg-->', at) + len('<!--/sg-->')
        t = t[:at] + wrap('sub-' + sub, b) + t[at:]
        n_sub += 1
    for n, rows in EQS.items():
        m = re.search(r'<figure class="equation" id="eq-%d">.*?</figure>' % n, t, re.S)
        assert m, n
        end = m.end()
        a = re.match(r'\s*<aside class="plain">.*?</aside>', t[end:], re.S)
        if a:
            end += a.end()
        b = box('eq-%d' % n, 'vids-eq', r['eq'].format(n=n), rows, L)
        t = t[:end] + wrap('eq-%d' % n, b) + t[end:]
        n_eq += 1
    open(path, 'w', encoding='utf-8').write(t)
    print(f'{path}: +{n_ch} chapters, {n_sub} subsections, {n_eq} equations')


if __name__ == '__main__':
    os.chdir(ROOT)
    roadmap('roadmap.html', 'zh')
    roadmap('roadmap-en.html', 'en')
    reading('reading.html', 'zh', 'roadmap.html')
    reading('reading-en.html', 'en', 'roadmap-en.html')
    reading_fine('reading.html', 'zh', 'roadmap.html')
    reading_fine('reading-en.html', 'en', 'roadmap-en.html')
