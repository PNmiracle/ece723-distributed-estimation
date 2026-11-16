/* ---------- copying text that contains formulas gives $TeX$ for each formula ---------- */
document.addEventListener('copy', e => {
  const sel = getSelection(); if (!sel || sel.isCollapsed) return;
  const box = document.createElement('div');
  for (let i = 0; i < sel.rangeCount; i++) box.appendChild(sel.getRangeAt(i).cloneContents());
  const maths = box.querySelectorAll('.imath[data-tex]');
  if (!maths.length) return;
  maths.forEach(m => m.replaceWith('$' + m.dataset.tex + '$'));
  box.querySelectorAll('.katex, .gl-pop, button').forEach(x => x.remove());
  e.clipboardData.setData('text/plain', box.textContent.replace(/[ \t]+\n/g, '\n'));
  e.preventDefault();
});
