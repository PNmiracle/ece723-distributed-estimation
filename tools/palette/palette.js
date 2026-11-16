/* ---------- ⌘K / Ctrl+K: quick jump to an equation, section or subheading ---------- */
(() => {
  const EN = (document.documentElement.lang || '').startsWith('en');
  const T = EN ? {ph: 'Equation number (1–492) or words from a heading…', eq: 'Eq.', help: '<kbd>↑</kbd><kbd>↓</kbd> choose · <kbd>Enter</kbd> jump · <kbd>Esc</kbd> close', none: 'No match', hint: 'Quick jump: ⌘K / Ctrl+K'}
               : {ph: '输入公式编号（1–492）或标题里的词…', eq: '式', help: '<kbd>↑</kbd><kbd>↓</kbd> 选择 · <kbd>Enter</kbd> 跳转 · <kbd>Esc</kbd> 关闭', none: '没有匹配', hint: '快速跳转：⌘K / Ctrl+K'};
  const eqs = new Map();
  document.querySelectorAll('figure.equation[id^="eq-"]').forEach(f => eqs.set(+f.id.slice(3), f));
  const heads = [...document.querySelectorAll('#sections nav a[href^="#"]')].map(a => ({id: a.getAttribute('href').slice(1), t: a.textContent.trim()}));
  const secOf = el => { const u = el.closest('section.unit'); const h = u && u.querySelector('.sec-h'); return h ? h.textContent.trim() : ''; };
  const back = document.createElement('div'); back.className = 'qj-back'; back.hidden = true;
  back.innerHTML = `<div class="qj" role="dialog" aria-modal="true"><input type="text" autocomplete="off" spellcheck="false" placeholder="${T.ph}"><ul role="listbox"></ul><div class="qj-help">${T.help}</div></div>`;
  document.body.appendChild(back);
  const inp = back.querySelector('input'), ul = back.querySelector('ul');
  let items = [], sel = 0, last = null;
  const eqItem = n => ({kind: 'eq', id: 'eq-' + n, html: `<span class="qj-k">${T.eq} (${n})</span><span><span class="qj-sec">${secOf(eqs.get(n))}</span><span class="qj-eq">${(eqs.get(n).querySelector('.math-source, img') || {}).outerHTML || ''}</span></span>`});
  function build() {
    const q = inp.value.trim(); items = [];
    if (/^\d+$/.test(q)) {
      const n = +q; if (eqs.has(n)) items.push(eqItem(n));
      for (const k of eqs.keys()) if (k !== n && String(k).startsWith(q) && items.length < 8) items.push(eqItem(k));
    } else if (q) {
      const w = q.toLowerCase().split(/\s+/);
      for (const h of heads) if (w.every(x => h.t.toLowerCase().includes(x))) items.push({kind: 'h', id: h.id, html: `<span class="qj-k">§</span><span class="qj-t">${h.t.replace(/</g, '&lt;')}</span>`});
      items = items.slice(0, 30);
    } else {
      items = heads.filter(h => !/-(s|p)\d+$/.test(h.id)).map(h => ({kind: 'h', id: h.id, html: `<span class="qj-k">§</span><span class="qj-t">${h.t.replace(/</g, '&lt;')}</span>`}));
    }
    sel = 0; render();
  }
  function render() {
    ul.innerHTML = items.length ? items.map((it, i) => `<li role="option" data-i="${i}" class="${i === sel ? 'on' : ''}">${it.html}</li>`).join('') : `<li><span></span><span class="qj-t">${T.none}</span></li>`;
    const on = ul.querySelector('li.on'); if (on) on.scrollIntoView({block: 'nearest'});
  }
  function go(it) {
    if (!it) return; close(false);
    const el = document.getElementById(it.id); if (!el) return;
    const fold = el.closest('.plain.folded'); if (fold) fold.classList.remove('folded');
    try { history.pushState(null, '', '#' + it.id); } catch (_) {}
    document.querySelectorAll('.qj-target').forEach(x => x.classList.remove('qj-target'));
    el.scrollIntoView({block: it.kind === 'eq' ? 'center' : 'start', behavior: 'instant'});
    if (it.kind === 'eq') { el.style.outline = '2px solid #adcaef'; el.style.background = '#eaf2ff'; setTimeout(() => { el.style.outline = ''; el.style.background = ''; }, 1600); }
  }
  function open() { last = document.activeElement; back.hidden = false; inp.value = ''; build(); inp.focus(); }
  function close(restore = true) { back.hidden = true; if (restore && last && last.focus) last.focus(); }
  inp.addEventListener('input', build);
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); go(items[sel]); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  });
  ul.addEventListener('mousemove', e => { const li = e.target.closest('li[data-i]'); if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; render(); } });
  ul.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (li) go(items[+li.dataset.i]); });
  back.addEventListener('mousedown', e => { if (e.target === back) close(); });
  addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') { e.preventDefault(); back.hidden ? open() : close(); }
  }, true);
  const ei = document.getElementById('eq-input'); if (ei) ei.title = T.hint;
  const form = document.getElementById('equation-jump');
  if (form && !form.querySelector('.qj-kbd')) {
    const k = document.createElement('button'); k.type = 'button'; k.className = 'qj-kbd'; k.title = T.hint;
    k.textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K'; k.addEventListener('click', open); form.appendChild(k);
  }
})();
