(() => {
  const canonicalPath = document.body.dataset.canonicalPath;
  if (canonicalPath && location.pathname !== canonicalPath) {
    history.replaceState(history.state, '', canonicalPath + location.search + location.hash);
  }
  const controls = document.querySelector('.docs-text-size');
  if (!controls) return;
  const sizes = [14, 16, 18, 20, 22];
  const key = 'ocura-oss-docs-font-size';
  let size = 16;
  try {
    const stored = Number(localStorage.getItem(key));
    if (sizes.includes(stored)) size = stored;
  } catch { /* Reading preferences is optional. */ }
  const smaller = controls.querySelector('[data-font="smaller"]');
  const larger = controls.querySelector('[data-font="larger"]');
  const label = controls.querySelector('.docs-text-size-label');
  function update() {
    document.querySelector('.docs-main').style.setProperty('--docs-font-size', `${size}px`);
    label.textContent = `${size}px`;
    smaller.disabled = size === sizes[0];
    larger.disabled = size === sizes.at(-1);
  }
  smaller.addEventListener('click', () => change(-1));
  larger.addEventListener('click', () => change(1));
  function change(delta) {
    size = sizes[sizes.indexOf(size) + delta];
    try { localStorage.setItem(key, String(size)); } catch { /* Preferences are optional. */ }
    update();
  }
  update();
  controls.hidden = false;
})();
