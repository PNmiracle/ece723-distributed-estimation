// Add translations after the existing glossary, editor and highlighter have initialized.
(() => {
  const main = document.querySelector('main');
  const pop = document.getElementById('pop');
  const terms = JSON.parse(document.getElementById('term-zh-data').textContent);
  const normalize = text => text.replace(/[‐‑‒–—−]/g, '-').replace(/[’‘]/g, "'").replace(/\s/g, ' ');
  const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const alternatives = Object.keys(terms).sort((a, b) => b.length - a.length)
    .map(key => key.split(' ').map(escape).join(' +'));
  const word = String.raw`[\p{L}\p{N}_-]`;
  const pattern = new RegExp(`(?<!${word})(?:${alternatives.join('|')})(?!${word})(?:'s\\b)?`, 'giu');
  const block = /^(?:MAIN|HEADER|SECTION|ASIDE|DIV|ARTICLE|P|H[1-6]|LI|UL|OL|DETAILS|SUMMARY|TABLE|TR|TD|TH|BR|HR|DL|DT|DD|BLOCKQUOTE)$/;
  const skip = '[data-hl-ui], #references, .katex, .howto, .guide-tag, .eqlink, figure, math, svg, button, script, style, textarea, input, code, pre';

  function annotate(root) {
    let nodes = [], text = '';
    const insertions = [];

    // Match complete phrases even when the existing glossary or emphasis splits the text.
    function flush() {
      if (!text.trim()) { nodes = []; text = ''; return; }
      const normalized = normalize(text);
      pattern.lastIndex = 0;
      let cursor = 0, lastEnd = 0, lastTranslation;
      for (const match of normalized.matchAll(pattern)) {
        const end = match.index + match[0].length;
        const phrase = match[0].toLowerCase().replace(/ +/g, ' ');
        const translation = terms[phrase] || terms[phrase.replace(/'s$/, '')];
        if (!translation) continue;
        const tail = text.slice(end, end + 60);
        const pairedAbbreviation = translation === lastTranslation &&
          /^ *\($/.test(normalized.slice(lastEnd, match.index)) && /^ *\)/.test(tail);
        if (!pairedAbbreviation && !/^\s*[(（][^()（）]{0,35}[\u3400-\u9fff]/u.test(tail)) {
          while (nodes[cursor].end < end) cursor++;
          const { node, start } = nodes[cursor];
          insertions.push({ node, at: end - start, translation });
        }
        lastEnd = end;
        lastTranslation = translation;
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
    for (const { node, at, translation } of insertions.reverse()) {
      const mark = document.createElement('span');
      mark.className = 'term-zh';
      mark.dataset.hlUi = '1';
      mark.lang = 'zh-Hans';
      mark.textContent = ` (${translation})`;
      node.parentNode.insertBefore(mark, at === node.length ? node.nextSibling : node.splitText(at));
    }
  }

  let editing = false;
  new MutationObserver(() => {
    const on = document.body.classList.contains('edit-on');
    if (on === editing) return;
    editing = on;
    // Keep generated translations out of saved in-page edits.
    if (editing) main.querySelectorAll('.term-zh').forEach(mark => mark.remove());
    else annotate(main);
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  if (pop) {
    new MutationObserver(() => {
      const parts = pop.querySelectorAll(pop.querySelector('.cat.note') ? 'h3, .body' : '.short, .body');
      parts.forEach(annotate);
      // The English text is positioned before the popup receives its labels.
      // Keep the expanded popup inside the viewport on desktop.
      if (pop.style.top && !pop.hidden) {
        const rect = pop.getBoundingClientRect();
        if (rect.bottom > innerHeight - 8) pop.style.top = Math.max(8, innerHeight - 8 - rect.height) + 'px';
      }
    }).observe(pop, { childList: true });
  }

  annotate(main);
})();
