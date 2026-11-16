// The Chinese card content is loaded once, on the first open.
(() => {
  const main = document.querySelector('main');
  const src = document.currentScript.dataset.src;
  let translations;

  function load() {
    if (!translations) {
      translations = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
          const data = window.__readingPlainZh;
          delete window.__readingPlainZh;
          script.remove();
          if (data) resolve(data);
          else reject(new Error('Chinese explanations unavailable'));
        };
        script.onerror = () => {
          script.remove();
          reject(new Error('Could not load Chinese explanations'));
        };
        document.head.append(script);
      }).catch(error => { translations = null; throw error; });
    }
    return translations;
  }

  async function toggle(event) {
    const panel = event.currentTarget;
    if (!panel.open || panel.dataset.loaded) return;
    const content = panel.querySelector('.plain-zh-content');
    const status = document.createElement('span');
    status.setAttribute('role', 'status');
    status.textContent = '正在加载中文解读…';
    content.replaceChildren(status);
    try {
      const data = await load();
      const html = data[panel.dataset.equation];
      if (!html) throw new Error('Missing Chinese explanation');
      content.innerHTML = html;
      panel.dataset.loaded = '1';
    } catch {
      status.textContent = '暂时无法加载。请合上再打开重试，或';
      const link = document.createElement('a');
      link.href = 'reading.html#eq-' + panel.dataset.equation;
      link.textContent = '打开中文版对应公式';
      status.append(link, '。');
    }
  }

  // The Chinese disclosure can open independently of the card's English fold control.
  const keepEnglishFold = event => event.stopPropagation();
  for (const figure of main.querySelectorAll('figure.equation[id^="eq-"]')) {
    const box = figure.nextElementSibling;
    if (!box?.matches('aside.plain')) continue;
    const gist = box.querySelector(':scope > .plain-gist');
    if (!gist) continue;
    const panel = document.createElement('details');
    panel.className = 'plain-zh';
    panel.dataset.equation = figure.id.slice(3);
    panel.dataset.hlUi = '1'; // Keep existing English highlight offsets stable.
    panel.lang = 'zh-Hans';
    panel.innerHTML = '<summary>中文解读</summary><div class="plain-zh-content"></div>';
    panel.addEventListener('toggle', toggle);
    panel.addEventListener('click', keepEnglishFold);
    gist.after(panel);
  }
})();
