/* ---------- fold / unfold the green "plain words" boxes (open by default) ---------- */
(() => {
  const EN = (document.documentElement.lang || '').startsWith('en');
  const T = EN ? {btn: 'Plain words: ', open: 'open', folded: 'folded', peek: 'click to open', tip: 'Click to fold or unfold this box'}
               : {btn: '人话：', open: '展开', folded: '折叠', peek: '点开看解释', tip: '点击折叠或展开这一框'};
  const boxes = [...document.querySelectorAll('aside.plain')];
  if (!boxes.length) return;
  const setBox = (b, folded) => {
    b.classList.toggle('folded', folded);
    const tag = b.querySelector('.plain-tag'); if (tag) tag.setAttribute('aria-expanded', String(!folded));
  };
  boxes.forEach(b => {
    b.dataset.peek = T.peek;
    const tag = b.querySelector('.plain-tag'); if (!tag) return;
    tag.setAttribute('role', 'button'); tag.tabIndex = 0; tag.title = T.tip; tag.setAttribute('aria-expanded', 'true');
    tag.addEventListener('click', e => { e.stopPropagation(); setBox(b, !b.classList.contains('folded')); });
    tag.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tag.click(); } });
    b.addEventListener('click', () => {
      if (!b.classList.contains('folded')) return;
      const s = getSelection();
      if (s && !s.isCollapsed && s.rangeCount && s.getRangeAt(0).intersectsNode(b)) return;
      setBox(b, false);
    });
  });
  // one button in the top bar folds or unfolds every box; the choice is remembered in this browser
  const marks = document.getElementById('toggle-marks');
  const btn = document.createElement('button');
  btn.type = 'button'; btn.id = 'toggle-plain';
  const setAll = open => {
    boxes.forEach(b => setBox(b, !open));
    btn.setAttribute('aria-pressed', String(open)); btn.textContent = T.btn + (open ? T.open : T.folded);
    try { localStorage.setItem('plain-folded', open ? '0' : '1'); } catch (_) {}
  };
  if (marks) marks.after(btn); else document.querySelector('.tools')?.prepend(btn);
  let saved = null; try { saved = localStorage.getItem('plain-folded'); } catch (_) {}
  setAll(saved !== '1');
  btn.addEventListener('click', () => setAll(btn.getAttribute('aria-pressed') !== 'true'));
})();
