(() => {
  const form = document.getElementById('jump');
  const field = document.getElementById('equation-number');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const target = document.getElementById('eq-' + field.valueAsNumber);
    if (!target) return;
    if (location.hash !== '#' + target.id) history.pushState(null, '', '#' + target.id);
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start' });
  });
  const formulas = [...document.querySelectorAll('.math-source')];
  const markWide = () => {
    const wide = formulas.map(el => el.scrollWidth > el.clientWidth + 1);
    formulas.forEach((el, i) => {
      el.parentElement.classList.toggle('is-wide', wide[i]);
      if (wide[i]) {
        el.tabIndex = 0;
        el.setAttribute('aria-label', '公式可横向滚动');
      } else {
        el.removeAttribute('tabindex');
        el.removeAttribute('aria-label');
      }
    });
  };
  document.fonts.ready.then(markWide);
  addEventListener('resize', markWide);
})();
