/* ---------- highlights & notes: kept in this browser (localStorage) ---------- */
(() => {
  const MAIN = document.querySelector('main');
  if (!MAIN) return;
  const PAGE = (location.pathname.split('/').pop() || 'index.html');
  const KEY = 'notes:' + PAGE;
  const EN = (document.documentElement.lang || '').startsWith('en');
  const T = EN ? {
    btn: '🖍 Notes', title: 'My highlights & notes', note: 'Note', add: '＋ Note', ph: 'Write a note… (saved automatically)',
    auto: 'Auto highlight', autoTip: 'Toggle with Option+Q / Alt+Q. Undo an auto highlight with Cmd+Z / Ctrl+Z.',
    undone: 'Highlight undone',
    del: 'Delete', copy: 'Copy text', close: 'Close', saved: 'Saved', md: 'Export Markdown', cp: 'Copy all', bak: 'Back up (JSON)',
    imp: 'Restore', clr: 'Clear all', sure: 'Click again to clear', onlyN: 'With notes only', all: 'All',
    empty: 'Nothing yet. Select any text to highlight it, or hover over a formula / scanned paragraph and click “＋ Note”.<br>Shortcuts with text selected: <b>H</b> highlight, <b>N</b> highlight + note.',
    orphan: 'original text not found (page changed)', block: 'Block note', eq: 'Eq.', copied: 'Copied', imported: 'Restored', exported: 'Downloaded',
    hdr: 'My notes', src: 'Source', when: 'Exported', none: '(no note)', jump: 'open'
  } : {
    btn: '🖍 笔记', title: '我的高亮与笔记', note: '笔记', add: '＋ 笔记', ph: '写点笔记…（自动保存）',
    auto: '连续高亮', autoTip: 'Option+Q / Alt+Q 开关连续高亮；Cmd+Z / Ctrl+Z 撤销一次连续高亮。',
    undone: '已撤销高亮',
    del: '删除', copy: '复制原文', close: '关闭', saved: '已保存', md: '导出 Markdown', cp: '复制全部', bak: '备份 (JSON)',
    imp: '恢复备份', clr: '清空', sure: '再点一次确认清空', onlyN: '只看有笔记的', all: '全部',
    empty: '还没有内容。选中任意文字即可高亮；把鼠标移到公式或扫描段落上，点“＋ 笔记”即可给整块加笔记。<br>选中文字后的快捷键：<b>H</b> 高亮，<b>N</b> 高亮并写笔记。',
    orphan: '找不到原文（页面内容已改动）', block: '整块笔记', eq: '式', copied: '已复制', imported: '已恢复', exported: '已下载',
    hdr: '我的笔记', src: '来源', when: '导出时间', none: '（无笔记）', jump: '跳转'
  };
  const COLORS = ['y', 'g', 'b', 'p'];
  const CC = {y: '#ffd84a', g: '#86d993', b: '#8fc0ff', p: '#ff9cc2'};
  const CNAME = EN ? {y: 'yellow', g: 'green', b: 'blue', p: 'pink'} : {y: '黄', g: '绿', b: '蓝', p: '粉'};
  const SKIP = '.katex-mathml, script, style, [data-hl-ui], .hl-ui';
  // Older highlights counted neither guide nor summary text in their offsets.
  const LEGACY_SKIP = SKIP + ', .plain-gist, .sub-guide';
  const TEXT_MODEL = 2;
  const BLOCKS = 'figure.equation';

  /* ---------- storage ---------- */
  let items = [];
  try { const j = JSON.parse(localStorage.getItem(KEY) || '{}'); items = Array.isArray(j.items) ? j.items : []; } catch (e) { items = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify({v: 1, page: PAGE, items})); } catch (e) {} updCount(); };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const byId = id => items.find(x => x.id === id);
  const tgt = e => (e.target && e.target.nodeType === 1) ? e.target : ((e.target && e.target.parentElement) || document.body);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  /* ---------- text model: visible text of a root, skipping hidden MathML and our UI ---------- */
  function textNodes(root, skip = SKIP) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.parentElement && n.parentElement.closest(skip)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const out = []; let n; while ((n = w.nextNode())) out.push(n); return out;
  }
  const fullText = (root, skip) => textNodes(root, skip).map(n => n.data).join('');
  function posOf(root, container, offset) {
    const r = document.createRange(); r.setStart(container, offset); r.collapse(true);
    let base = 0;
    for (const n of textNodes(root)) {
      if (n === container) return base + offset;
      if (r.comparePoint(n, 0) >= 0) return base;
      base += n.data.length;
    }
    return base;
  }
  const anchorOf = node => {
    let el = node.nodeType === 1 ? node : node.parentElement;
    el = el && el.closest('[id]');
    return el && MAIN.contains(el) ? el : MAIN;
  };

  /* ---------- painting ---------- */
  function paintText(it) {
    let root = document.getElementById(it.anchor);
    if (!root || !MAIN.contains(root)) root = MAIN;
    const skip = it.model === TEXT_MODEL ? SKIP : LEGACY_SKIP;
    let s = it.start, e = it.end;
    let txt = fullText(root, skip);
    if (txt.slice(s, e) !== it.text) {
      const found = locate(txt, it);
      if (found < 0 && root !== MAIN) { root = MAIN; txt = fullText(MAIN, skip); }
      const f2 = found >= 0 ? found : locate(txt, it);
      if (f2 < 0) { it.orphan = true; return false; }
      s = f2; e = f2 + it.text.length;
    }
    it.orphan = false;
    let base = 0; const segs = []; const kats = new Set();
    for (const n of textNodes(root, skip)) {
      const len = n.data.length, a = Math.max(s, base), b = Math.min(e, base + len);
      if (a < b) {
        const k = n.parentElement.closest('.katex');
        if (k) kats.add(k); else if (n.data.slice(a - base, b - base).trim()) segs.push([n, a - base, b - base]);
      }
      base += len; if (base >= e) break;
    }
    const marks = [];
    for (const [n, a, b] of segs) {
      let mid = n; if (a > 0) mid = n.splitText(a); if (b - a < mid.data.length) mid.splitText(b - a);
      const m = document.createElement('mark'); m.className = 'hl hl-c-' + it.color; m.dataset.hl = it.id;
      mid.parentNode.insertBefore(m, mid); m.appendChild(mid); marks.push(m);
    }
    kats.forEach(k => { k.classList.add('hl-k', 'hl-c-' + it.color); k.dataset.hl = it.id; });
    if (marks.length && it.note) marks[marks.length - 1].classList.add('hl-note-end');
    if (!marks.length && kats.size && it.note) [...kats].pop().title = it.note;
    marks.forEach(m => { if (it.note) m.title = it.note; });
    return marks.length + kats.size > 0;
  }
  function locate(txt, it) {
    let best = -1, bestScore = -1, i = txt.indexOf(it.text);
    while (i >= 0) {
      let sc = 0;
      const pre = txt.slice(Math.max(0, i - (it.pre || '').length), i), suf = txt.slice(i + it.text.length, i + it.text.length + (it.suf || '').length);
      for (let k = 1; k <= pre.length && pre[pre.length - k] === it.pre[it.pre.length - k]; k++) sc++;
      for (let k = 0; k < suf.length && suf[k] === it.suf[k]; k++) sc++;
      if (sc > bestScore) { bestScore = sc; best = i; }
      i = txt.indexOf(it.text, i + 1);
    }
    return best;
  }
  function blockEl(it) {
    const root = document.getElementById(it.anchor) || MAIN;
    if (root.matches && root.matches('figure.equation') && it.idx === -1) return root;
    const list = [...root.querySelectorAll(BLOCKS)];
    return list[it.idx] || null;
  }
  function paintBlock(it) {
    const el = blockEl(it); if (!el) { it.orphan = true; return false; }
    it.orphan = false;
    el.classList.add('hl-block', 'hl-c-' + it.color); el.dataset.hlb = it.id;
    const bd = document.createElement('button'); bd.type = 'button'; bd.className = 'hl-badge'; bd.dataset.hlUi = '1'; bd.dataset.hl = it.id;
    bd.textContent = it.note ? '✎ ' + T.note : '★'; if (it.note) bd.title = it.note;
    el.appendChild(bd);
    return true;
  }
  const paint = it => it.kind === 'block' ? paintBlock(it) : paintText(it);
  function unpaint(id) {
    document.querySelectorAll(`mark.hl[data-hl="${id}"]`).forEach(m => { const p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); p.removeChild(m); p.normalize(); });
    document.querySelectorAll(`.katex[data-hl="${id}"]`).forEach(k => { k.classList.remove('hl-k', ...COLORS.map(c => 'hl-c-' + c)); delete k.dataset.hl; k.removeAttribute('title'); });
    document.querySelectorAll(`[data-hlb="${id}"]`).forEach(b => { b.classList.remove('hl-block', ...COLORS.map(c => 'hl-c-' + c)); delete b.dataset.hlb; });
    document.querySelectorAll(`.hl-badge[data-hl="${id}"]`).forEach(b => b.remove());
  }
  const repaint = it => { unpaint(it.id); paint(it); };
  function paintAll() {
    // marks may have been captured by the page's edit mode; clear stray ones first
    const stray = document.querySelectorAll('mark.hl');
    stray.forEach(m => { const p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); p.removeChild(m); p.normalize(); });
    items.forEach(paint);
  }
  function unpaintAll() { items.forEach(it => unpaint(it.id)); }

  /* ---------- context labels for the notes list ---------- */
  function contextOf(it) {
    let el = it.kind === 'block' ? blockEl(it) : document.querySelector(`[data-hl="${it.id}"]`);
    if (!el) el = document.getElementById(it.anchor);
    if (!el) return {sec: '', sub: '', order: 1e12, link: ''};
    const sec = el.closest('section');
    const h = sec && sec.querySelector('.sec-h, h2, h3');
    let sub = '';
    const plain = el.closest('aside.plain'); const fig = el.closest('figure.equation');
    if (plain) sub = (plain.querySelector('.plain-tag') || {}).textContent || '';
    else if (fig) sub = T.eq + ' (' + fig.id.replace('eq-', '') + ')';
    const linkEl = fig || (plain && plain.previousElementSibling && plain.previousElementSibling.id ? plain.previousElementSibling : null) || sec || el.closest('[id]');
    const r = el.getBoundingClientRect();
    return {sec: h ? h.textContent.trim() : '', sub, order: r.top + scrollY + r.left / 1e4, link: linkEl && linkEl.id ? '#' + linkEl.id : ''};
  }

  /* ---------- floating UI ---------- */
  const mk = (tag, cls, html) => { const e = document.createElement(tag); e.className = cls; e.dataset.hlUi = '1'; if (html != null) e.innerHTML = html; return e; };
  const dots = (on) => COLORS.map(c => `<button type="button" class="hl-dot hl-c-${c}${c === on ? ' on' : ''}" data-c="${c}" title="${CNAME[c]}" aria-label="${CNAME[c]}"></button>`).join('');
  const bar = mk('div', 'hl-ui hl-ui-float hl-bar', dots() + `<span class="hl-sep"></span><button type="button" data-a="note">✎ ${T.note}</button><button type="button" data-a="copy" title="${T.copy}">⧉</button>`);
  bar.hidden = true; document.body.appendChild(bar);
  const plus = mk('button', 'hl-ui hl-ui-float hl-plus', T.add); plus.type = 'button'; plus.hidden = true; document.body.appendChild(plus);
  const pop = mk('div', 'hl-ui hl-ui-float hl-pop'); pop.hidden = true; document.body.appendChild(pop);
  const toast = mk('div', 'hl-ui hl-toast'); toast.hidden = true; document.body.appendChild(toast);
  let toastT; const say = m => { toast.textContent = m; toast.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => toast.hidden = true, 1600); };
  const placeAt = (el, rect, below) => {
    el.hidden = false;
    const w = el.offsetWidth, h = el.offsetHeight;
    let x = rect.left + scrollX + rect.width / 2 - w / 2;
    x = Math.max(scrollX + 8, Math.min(x, scrollX + document.documentElement.clientWidth - w - 8));
    let y = below ? rect.bottom + scrollY + 8 : rect.top + scrollY - h - 8;
    if (!below && y < scrollY + 64) y = rect.bottom + scrollY + 8;
    el.style.left = x + 'px'; el.style.top = y + 'px';
  };

  /* ---------- selection → toolbar or continuous highlight ---------- */
  let selRange = null, continuous = false, selT = null;
  const autoHistory = [];
  function cancelQueuedSelection() { clearTimeout(selT); selT = null; }
  const mode = mk('button', 'hl-mode', T.auto);
  mode.type = 'button'; mode.title = T.autoTip;
  mode.setAttribute('aria-keyshortcuts', 'Alt+Q');
  mode.setAttribute('aria-pressed', 'false');
  function setContinuous(on) {
    continuous = on;
    mode.setAttribute('aria-pressed', String(on));
    cancelQueuedSelection();
    bar.hidden = true; selRange = null;
    if (currentRange()) getSelection().removeAllRanges();
  }
  mode.addEventListener('click', () => setContinuous(!continuous));

  function currentRange() {
    if (document.body.classList.contains('edit-on')) return null;
    const s = getSelection(); if (!s || s.isCollapsed || !s.rangeCount) return null;
    const r = s.getRangeAt(0);
    if (!MAIN.contains(r.commonAncestorContainer)) return null;
    const anc = r.commonAncestorContainer.nodeType === 1 ? r.commonAncestorContainer : r.commonAncestorContainer.parentElement;
    if (anc.closest('[data-hl-ui], [contenteditable="true"], input, textarea')) return null;
    if (!s.toString().trim()) return null;
    return r;
  }
  function finishSelection() {
    selT = null;
    const r = currentRange(); if (!r) { bar.hidden = true; return; }
    if (continuous) {
      const it = create('y', false, r);
      if (it) autoHistory.push(it);
      return;
    }
    selRange = r.cloneRange();
    const rects = r.getClientRects(); const rect = rects.length ? rects[rects.length - 1] : r.getBoundingClientRect();
    const touch = matchMedia('(pointer:coarse)').matches;
    placeAt(bar, touch ? r.getBoundingClientRect() : rect, touch);
  }
  const queueSelection = () => {
    clearTimeout(selT);
    // Let the mouse click finish before clearing the selection, and give touch
    // readers time to adjust the native selection handles.
    const delay = continuous ? (matchMedia('(pointer:coarse)').matches ? 400 : 35) : 180;
    selT = setTimeout(finishSelection, delay);
  };
  document.addEventListener('mouseup', e => { if (e.button === 0 && !tgt(e).closest('[data-hl-ui]')) queueSelection(); });
  document.addEventListener('keyup', e => {
    if (continuous ? e.key === 'Shift' : (e.shiftKey || e.key.startsWith('Arrow'))) queueSelection();
  });
  document.addEventListener('selectionchange', () => {
    if (getSelection().isCollapsed) bar.hidden = true;
    else if (matchMedia('(pointer:coarse)').matches) queueSelection();
  });

  function create(color, withNote, r = selRange || currentRange()) {
    if (!r) return;
    const root = anchorOf(r.commonAncestorContainer);
    const start = posOf(root, r.startContainer, r.startOffset), end = posOf(root, r.endContainer, r.endOffset);
    const txt = fullText(root); const text = txt.slice(start, end);
    if (!text.trim()) return;
    const it = {id: uid(), kind: 'text', model: TEXT_MODEL, color, note: '', anchor: root.id || 'top', start, end, text, pre: txt.slice(Math.max(0, start - 32), start), suf: txt.slice(end, end + 32), t: Date.now()};
    items.push(it); getSelection().removeAllRanges(); bar.hidden = true; selRange = null;
    paint(it); save(); renderPanel();
    if (withNote) openPop(it.id);
    return it;
  }
  function removeHighlight(it) {
    // Formula paint is shared by overlapping highlights; restore any earlier one.
    const hasMath = !!document.querySelector(`.katex[data-hl="${it.id}"]`);
    unpaint(it.id);
    items = items.filter(x => x !== it);
    if (hasMath) paintAll();
    if (popId === it.id) pop.hidden = true;
    save(); renderPanel();
  }
  function undoAuto() {
    if (selT !== null && currentRange()) {
      cancelQueuedSelection();
      getSelection().removeAllRanges();
      return true;
    }
    while (autoHistory.length) {
      const it = autoHistory.pop();
      if (it.note || !items.includes(it)) continue;
      removeHighlight(it);
      return true;
    }
    return false;
  }
  bar.addEventListener('mousedown', e => e.preventDefault());
  bar.addEventListener('click', e => {
    const c = e.target.closest('[data-c]'); if (c) return create(c.dataset.c, false);
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'note') create('y', true);
    if (a.dataset.a === 'copy') { const t = (selRange || currentRange() || '').toString(); copyText(t); bar.hidden = true; }
  });
  document.addEventListener('keydown', e => {
    const target = tgt(e);
    if (e.defaultPrevented || e.isComposing || target.isContentEditable || target.closest('input, textarea, select')) return;
    if (e.key === 'Escape') { if (continuous) setContinuous(false); bar.hidden = true; pop.hidden = true; plus.hidden = true; if (!panel.hidden) closePanel(); return; }
    // Option may change the character (for example Q becomes œ on a US Mac).
    if (e.altKey && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.code === 'KeyQ') {
      e.preventDefault();
      if (!e.repeat) setContinuous(!continuous);
      return;
    }
    if (continuous && !document.body.classList.contains('edit-on') && !e.altKey && !e.shiftKey &&
        e.metaKey !== e.ctrlKey && e.key.toLowerCase() === 'z' && !e.repeat && undoAuto()) {
      e.preventDefault();
      say(T.undone);
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.key === 'h' || e.key === 'H' || e.key === 'n' || e.key === 'N') && currentRange()) { e.preventDefault(); selRange = currentRange().cloneRange(); create('y', e.key.toLowerCase() === 'n'); }
  });

  /* ---------- block notes for formulas and scanned paragraphs ---------- */
  let plusTarget = null;
  MAIN.addEventListener('mouseover', e => {
    if (document.body.classList.contains('edit-on') || matchMedia('(pointer:coarse)').matches) return;
    const t = tgt(e), b = t.closest(BLOCKS); if (!b || b.dataset.hlb) { if (!t.closest('.hl-plus')) plus.hidden = true; return; }
    plusTarget = b; const r = b.getBoundingClientRect();
    plus.hidden = false; plus.style.left = (r.right + scrollX - plus.offsetWidth - 4) + 'px'; plus.style.top = (r.top + scrollY + 4) + 'px';
  });
  function blockKey(el) {
    if (el.matches('figure.equation') && el.id) return {anchor: el.id, idx: -1};
    const root = el.parentElement.closest('[id]') || MAIN;
    return {anchor: root.id || 'top', idx: [...root.querySelectorAll(BLOCKS)].indexOf(el)};
  }
  function addBlock(el, open) {
    if (el.dataset.hlb) return openPop(el.dataset.hlb);
    const k = blockKey(el);
    const label = el.matches('figure.equation') ? T.eq + ' (' + el.id.replace('eq-', '') + ')' : T.block;
    const it = {id: uid(), kind: 'block', color: 'y', note: '', anchor: k.anchor, idx: k.idx, text: label, t: Date.now()};
    items.push(it); paint(it); save(); renderPanel(); plus.hidden = true;
    if (open) openPop(it.id);
  }
  plus.addEventListener('click', () => { if (plusTarget) addBlock(plusTarget, true); });
  // touch devices: long-press is selection, so offer block notes via a double-tap on the block
  MAIN.addEventListener('dblclick', e => { const b = tgt(e).closest(BLOCKS); if (b && matchMedia('(pointer:coarse)').matches) addBlock(b, true); });

  /* ---------- popover for one item ---------- */
  let popId = null;
  function openPop(id, near) {
    const it = byId(id); if (!it) return; popId = id;
    pop.innerHTML = `<button type="button" class="hl-x" data-a="close" aria-label="${T.close}">✕</button><div class="hl-q">${esc(it.text).slice(0, 400)}</div>
      <textarea placeholder="${T.ph}">${esc(it.note || '')}</textarea>
      <div class="hl-row">${dots(it.color)}<span class="hl-saved">${T.saved}</span><span class="hl-grow"></span>
      ${it.kind === 'text' ? `<button type="button" class="hl-btn" data-a="copy">${T.copy}</button>` : ''}
      <button type="button" class="hl-btn danger" data-a="del">${T.del}</button></div>`;
    pop.querySelector('.hl-q').style.borderLeftColor = CC[it.color];
    const target = near || document.querySelector(`[data-hl="${id}"]`) || (it.kind === 'block' && blockEl(it));
    const rect = target ? target.getBoundingClientRect() : {left: innerWidth / 2, width: 0, top: 120, bottom: 120};
    placeAt(pop, rect, true);
    const ta = pop.querySelector('textarea'); setTimeout(() => ta.focus(), 30);
    const saved = pop.querySelector('.hl-saved');
    let t; ta.addEventListener('input', () => {
      it.note = ta.value;
      clearTimeout(t);
      t = setTimeout(() => {
        if (!items.includes(it)) return;
        save(); repaint(it); renderPanel();
        saved.classList.add('on'); setTimeout(() => saved.classList.remove('on'), 900);
      }, 350);
    });
  }
  pop.addEventListener('click', e => {
    const it = byId(popId); if (!it) return;
    const c = e.target.closest('[data-c]');
    if (c) { it.color = c.dataset.c; save(); repaint(it); renderPanel(); pop.querySelectorAll('.hl-dot').forEach(d => d.classList.toggle('on', d === c)); pop.querySelector('.hl-q').style.borderLeftColor = CC[it.color]; return; }
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'close') pop.hidden = true;
    if (a.dataset.a === 'copy') copyText(it.text);
    if (a.dataset.a === 'del') removeHighlight(it);
  });
  // click on a highlight (capture phase so the glossary popup does not also open)
  window.addEventListener('click', e => {
    if (document.body.classList.contains('edit-on')) return;
    const t = tgt(e);
    const badge = t.closest('.hl-badge'); if (badge) { e.preventDefault(); e.stopPropagation(); openPop(badge.dataset.hl, badge); return; }
    const m = t.closest('mark.hl, .katex.hl-k');
    if (m && !t.closest('.gl-term') && getSelection().isCollapsed) { e.preventDefault(); e.stopPropagation(); openPop(m.dataset.hl, m); return; }
    if (!t.closest('[data-hl-ui]')) { pop.hidden = true; }
  }, true);

  /* ---------- notes panel ---------- */
  const open = mk('button', 'hl-open', `${T.btn}<b>0</b>`); open.type = 'button';
  const host = document.querySelector('.langsw');
  if (host) { host.before(open, mode); } else document.body.append(open, mode);
  function updCount() { open.querySelector('b').textContent = items.length; }
  const panel = mk('div', 'hl-ui hl-panel', `<header><h3>${T.title}</h3><button type="button" class="hl-btn" data-a="close">✕</button></header>
    <div class="hl-filters"><button type="button" class="hl-btn" data-f="all">${T.all}</button>${dots()}<label><input type="checkbox" data-f="notes"> ${T.onlyN}</label></div>
    <div class="hl-list"></div>
    <footer><button type="button" class="hl-btn" data-a="md">${T.md}</button><button type="button" class="hl-btn" data-a="cp">${T.cp}</button>
    <button type="button" class="hl-btn" data-a="bak">${T.bak}</button><button type="button" class="hl-btn" data-a="imp">${T.imp}</button>
    <span class="hl-grow"></span><button type="button" class="hl-btn danger" data-a="clr">${T.clr}</button><input type="file" accept=".json,application/json" hidden></footer>`);
  panel.hidden = true; document.body.appendChild(panel);
  const filt = {colors: new Set(COLORS), notes: false};
  function sorted() { return items.map(it => ({it, cx: contextOf(it)})).sort((a, b) => a.cx.order - b.cx.order); }
  function renderPanel() {
    updCount(); if (panel.hidden) return;
    panel.querySelectorAll('.hl-filters .hl-dot').forEach(d => d.classList.toggle('on', filt.colors.has(d.dataset.c)));
    const list = sorted().filter(({it}) => filt.colors.has(it.color) && (!filt.notes || it.note));
    let html = '', last = null;
    for (const {it, cx} of list) {
      if (cx.sec !== last) { html += `<div class="hl-sec">${esc(cx.sec || '—')}</div>`; last = cx.sec; }
      html += `<div class="hl-item hl-c-${it.color}${it.orphan ? ' orphan' : ''}" data-id="${it.id}">
        <div class="hl-q">${it.kind === 'block' ? '▣ ' : '“'}${esc(it.text).slice(0, 300)}${it.kind === 'block' ? '' : '”'}</div>
        ${it.note ? `<div class="hl-n">${esc(it.note)}</div>` : ''}
        <div class="hl-meta">${esc(cx.sub)}${cx.sub ? ' · ' : ''}${new Date(it.t).toLocaleDateString()}${it.orphan ? ' · ' + T.orphan : ''}</div></div>`;
    }
    panel.querySelector('.hl-list').innerHTML = html || `<div class="hl-empty">${T.empty}</div>`;
  }
  function openPanel() { panel.hidden = false; renderPanel(); }
  function closePanel() { panel.hidden = true; }
  open.addEventListener('click', () => panel.hidden ? openPanel() : closePanel());
  function jumpTo(it) {
    const el = it.kind === 'block' ? blockEl(it) : document.querySelector(`[data-hl="${it.id}"]`);
    if (!el) return;
    const fold = el.closest && el.closest('.plain.folded'); if (fold) fold.classList.remove('folded');
    el.scrollIntoView({block: 'center', behavior: 'smooth'});
    const fl = it.kind === 'block' ? [el] : [...document.querySelectorAll(`[data-hl="${it.id}"]`)];
    fl.forEach(x => { x.classList.remove('hl-flash'); void x.offsetWidth; x.classList.add('hl-flash'); });
    if (matchMedia('(max-width:640px)').matches) closePanel();
    setTimeout(() => openPop(it.id), 450);
  }
  let armed = false;
  panel.addEventListener('click', e => {
    const item = e.target.closest('.hl-item'); if (item) { const it = byId(item.dataset.id); if (it) jumpTo(it); return; }
    const d = e.target.closest('.hl-filters .hl-dot');
    if (d) { const c = d.dataset.c; if (filt.colors.size === COLORS.length) filt.colors = new Set([c]); else if (filt.colors.has(c)) filt.colors.delete(c); else filt.colors.add(c); if (!filt.colors.size) filt.colors = new Set(COLORS); renderPanel(); return; }
    const f = e.target.closest('[data-f]');
    if (f && f.dataset.f === 'all') { filt.colors = new Set(COLORS); filt.notes = false; panel.querySelector('[data-f="notes"]').checked = false; renderPanel(); return; }
    if (f && f.dataset.f === 'notes') { filt.notes = f.checked; renderPanel(); return; }
    const a = e.target.closest('[data-a]'); if (!a) return;
    const act = a.dataset.a;
    if (act === 'close') closePanel();
    if (act === 'md') { download(toMarkdown(), 'notes-' + PAGE.replace(/\.html$/, '') + '.md', 'text/markdown'); say(T.exported); }
    if (act === 'cp') copyText(toMarkdown());
    if (act === 'bak') { download(JSON.stringify({v: 1, page: PAGE, items}, null, 1), 'notes-' + PAGE.replace(/\.html$/, '') + '.json', 'application/json'); say(T.exported); }
    if (act === 'imp') panel.querySelector('input[type=file]').click();
    if (act === 'clr') {
      if (!armed) { armed = true; a.textContent = T.sure; setTimeout(() => { armed = false; a.textContent = T.clr; }, 3000); return; }
      unpaintAll(); items = []; save(); renderPanel(); armed = false; a.textContent = T.clr;
    }
  });
  panel.querySelector('input[type=file]').addEventListener('change', ev => {
    const file = ev.target.files[0]; if (!file) return;
    file.text().then(t => {
      try {
        const j = JSON.parse(t); const add = (j.items || []).filter(x => x && x.id && !byId(x.id));
        items.push(...add); save(); add.forEach(paint); renderPanel(); say(T.imported + ' ' + add.length);
      } catch (err) {}
      ev.target.value = '';
    });
  });

  /* ---------- export helpers ---------- */
  function toMarkdown() {
    const url = location.origin + location.pathname;
    let md = `# ${T.hdr} · ${document.title}\n\n${T.src}: ${url}  \n${T.when}: ${new Date().toLocaleString()}\n`;
    let last = null;
    for (const {it, cx} of sorted()) {
      if (cx.sec !== last) { md += `\n## ${cx.sec || '—'}\n`; last = cx.sec; }
      const q = it.kind === 'block' ? `**[${it.text}]**` : it.text.replace(/\s+/g, ' ').trim();
      md += `\n> ${q}\n\n`;
      md += (it.note ? it.note.trim() + '\n\n' : '') + `*${CNAME[it.color]}${cx.sub ? ' · ' + cx.sub : ''}${cx.link ? ` · [${T.jump}](${url}${cx.link})` : ''}*\n`;
    }
    return md;
  }
  function download(text, name, type) {
    const u = URL.createObjectURL(new Blob([text], {type: type + ';charset=utf-8'}));
    const l = document.createElement('a'); l.href = u; l.download = name; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 1500);
  }
  function copyText(t) {
    const done = () => say(T.copied);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, () => fallback());
    else fallback();
    function fallback() { const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) {} ta.remove(); }
  }

  /* ---------- coexist with the page's edit mode ---------- */
  new MutationObserver(() => {
    const on = document.body.classList.contains('edit-on');
    if (on && !MAIN.dataset.hlOff) { MAIN.dataset.hlOff = '1'; bar.hidden = pop.hidden = plus.hidden = true; unpaintAll(); }
    if (!on && MAIN.dataset.hlOff) { delete MAIN.dataset.hlOff; paintAll(); renderPanel(); }
  }).observe(document.body, {attributes: true, attributeFilter: ['class']});

  paintAll(); updCount();
  if (items.some(it => it.orphan)) save();
  window.__hl = {items: () => items, paintAll, toMarkdown};
})();
