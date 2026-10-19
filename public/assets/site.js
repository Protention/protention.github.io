(() => {
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* Preferences are optional. */ } },
  };
  const root = document.documentElement;
  const savedTheme = storage.get('protention-theme');
  const theme = ['light', 'dark'].includes(savedTheme) ? savedTheme : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  root.dataset.theme = theme;
  const toggle = document.querySelector('.theme-toggle');
  function updateThemeLabel() { toggle?.setAttribute('aria-label', `Switch to ${root.dataset.theme === 'dark' ? 'light' : 'dark'} theme`); }
  if (toggle) {
    toggle.hidden = false;
    updateThemeLabel();
    toggle.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      storage.set('protention-theme', root.dataset.theme);
      updateThemeLabel();
    });
  }
  const controls = document.querySelector('.font-controls');
  if (controls) {
    const sizes = [14, 16, 18, 20, 22];
    const storedSize = Number(storage.get('ocura-oss-docs-font-size'));
    let size = sizes.includes(storedSize) ? storedSize : 16;
    const smaller = controls.querySelector('[data-font="smaller"]');
    const larger = controls.querySelector('[data-font="larger"]');
    function update() {
      root.style.setProperty('--docs-font-size', `${size}px`);
      controls.querySelector('output').value = `${size}px`;
      smaller.disabled = size === sizes[0];
      larger.disabled = size === sizes.at(-1);
    }
    for (const button of [smaller, larger]) button.addEventListener('click', () => {
      size = sizes[sizes.indexOf(size) + (button === smaller ? -1 : 1)];
      storage.set('ocura-oss-docs-font-size', String(size));
      update();
    });
    controls.hidden = false;
    update();
  }
  for (const pre of document.querySelectorAll('pre')) {
    if (!navigator.clipboard) break;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code');
    button.setAttribute('aria-live', 'polite');
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.querySelector('code').textContent);
        button.textContent = 'Copied';
      } catch { button.textContent = 'Select code'; }
      setTimeout(() => { button.textContent = 'Copy'; }, 1800);
    });
    pre.append(button);
  }
})();
