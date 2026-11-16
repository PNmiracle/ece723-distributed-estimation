/* ---------- multi-level contents: fold / unfold; the current section's branch opens itself ---------- */
(() => {
  const nav = document.querySelector('#sections nav'); if (!nav) return;
  const EN = (document.documentElement.lang || '').startsWith('en');
  let auto;
  const set = (n, open) => { n.classList.toggle('closed', !open); n.querySelector(':scope > .toc-tw')?.setAttribute('aria-expanded', String(open)); };
  nav.querySelectorAll('.toc-group, .toc-node').forEach(n => {
    const a = n.querySelector(':scope > a'), kids = n.querySelector(':scope > .toc-sub, :scope > .toc-kids');
    if (!a || !kids || !kids.children.length) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'toc-tw';
    b.setAttribute('aria-label', EN ? 'Show or hide subsections' : '展开或收起子目录');
    n.insertBefore(b, a);
    set(n, n.classList.contains('toc-group'));   // top level open, deeper levels folded
    b.addEventListener('click', () => { auto.delete(n); set(n, n.classList.contains('closed')); });
  });
  auto = new Set();   // branches opened by scrolling (not by the reader) fold again when left
  const openPath = a => {
    const path = new Set();
    for (let p = a.parentElement; p && p !== nav; p = p.parentElement) {
      path.add(p);
      if (p.classList.contains('closed')) { set(p, true); auto.add(p); }
    }
    auto.forEach(n => { if (!path.has(n)) { set(n, false); auto.delete(n); } });
  };
  new MutationObserver(ms => ms.forEach(m => { if (m.target.tagName === 'A' && m.target.classList.contains('active')) openPath(m.target); }))
    .observe(nav, {subtree: true, attributes: true, attributeFilter: ['class']});
  const cur = nav.querySelector('a.active'); if (cur) openPath(cur);
})();
