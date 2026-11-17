// Add English equivalents after Chinese technical terms in the Chinese reader.
// Each term is glossed once per paragraph (or list item, callout row, heading), unless the
// text already gives the English in parentheses right after it.
(() => {
  const main = document.querySelector('main');
  const pop = document.getElementById('pop');
  const terms = JSON.parse(document.getElementById('term-en-data').textContent);
  const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(Object.keys(terms).sort((a, b) => b.length - a.length).map(escape).join('|'), 'gu');
  const block = /^(?:MAIN|HEADER|SECTION|ASIDE|DIV|ARTICLE|P|H[1-6]|LI|UL|OL|DETAILS|SUMMARY|TABLE|TR|TD|TH|BR|HR|DL|DT|DD|BLOCKQUOTE)$/;
  const skip = '[data-hl-ui]:not(.gist-origin), #references, .sym-say, .katex, .vids, .howto, .guide-tag, .eqlink, .nref, figure, math, svg, button, script, style, textarea, input, code, pre, a[href^="http"]';
  const glossed = /^\s*[（(]\s*[A-Za-z]/;

  function annotate(root) {
    let nodes = [], text = '';
    const insertions = [];
    function flush() {
      if (!text.trim()) { nodes = []; text = ''; return; }
      const seen = new Set();
      let cursor = 0;
      pattern.lastIndex = 0;
      for (const match of text.matchAll(pattern)) {
        const english = terms[match[0]];
        const end = match.index + match[0].length;
        if (!english || english === '-' || seen.has(english) || glossed.test(text.slice(end, end + 12))) continue;
        seen.add(english);
        while (nodes[cursor].end < end) cursor++;
        const { node, start } = nodes[cursor];
        insertions.push({ node, at: end - start, english });
      }
      nodes = []; text = '';
    }
    function visit(node) {
      if (node.nodeType === Node.TEXT_NODE && node.length) {
        nodes.push({ node, start: text.length, end: text.length + node.length });
        text += node.data;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.matches(skip)) { flush(); return; }
        const separate = block.test(node.tagName);
        if (separate) flush();
        node.childNodes.forEach(visit);
        if (separate) flush();
      }
    }
    visit(root);
    flush();
    // Work backwards so offsets in a split text node keep pointing at the same characters.
    for (const { node, at, english } of insertions.reverse()) {
      const mark = document.createElement('span');
      mark.className = 'term-en';
      mark.dataset.hlUi = '1';
      mark.lang = 'en';
      mark.textContent = `(${english})`;
      // Never put the note inside a clickable glossary term: place it right after the term.
      const term = node.parentElement && node.parentElement.closest('.gl-term');
      if (term && root.contains(term)) term.after(mark);
      else node.parentNode.insertBefore(mark, at === node.length ? node.nextSibling : node.splitText(at));
    }
  }

  // On/off switch next to the glossary-marks switch.
  const marks = document.getElementById('toggle-marks');
  const sw = document.createElement('button');
  sw.type = 'button'; sw.id = 'toggle-en'; sw.dataset.hlUi = '1';
  marks.after(document.createTextNode(' '), sw);
  function setOn(on) {
    document.body.classList.toggle('no-term-en', !on);
    sw.setAttribute('aria-pressed', on);
    sw.textContent = '英文术语：' + (on ? '开' : '关');
    try { localStorage.setItem('term-en', on ? '1' : '0'); } catch (_) {}
  }
  let saved = null; try { saved = localStorage.getItem('term-en'); } catch (_) {}
  setOn(saved !== '0');
  sw.addEventListener('click', () => setOn(document.body.classList.contains('no-term-en')));

  let editing = false;
  new MutationObserver(() => {
    const on = document.body.classList.contains('edit-on');
    if (on === editing) return;
    editing = on;
    // Keep generated notes out of saved in-page edits.
    if (editing) main.querySelectorAll('.term-en').forEach(mark => mark.remove());
    else annotate(main);
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  if (pop) new MutationObserver(() => pop.querySelectorAll('.body').forEach(annotate)).observe(pop, { childList: true });

  annotate(main);
})();
