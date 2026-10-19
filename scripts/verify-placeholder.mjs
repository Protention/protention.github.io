import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const out = new URL('../dist/', import.meta.url);
assert.deepEqual((await readdir(out)).sort(), ['.nojekyll', '404.html', 'index.html']);
for (const file of ['index.html', '404.html']) {
  const html = await readFile(new URL(file, out), 'utf8');
  assert(html.includes('<body></body>'));
  assert(html.includes('background:#000'));
  assert(!/<script|<link|<nav|<main|<h1/i.test(html));
}
console.log('Verified empty black page and fallback with no scripts or assets.');
