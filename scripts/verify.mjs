import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import { pages, site, docRoute } from '../site.config.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
const read = (file) => readFile(path.join(out, file), 'utf8');
const provenance = JSON.parse(await read('docs/source.json'));
assert.equal(provenance.commit, site.sourceRef);
const docs = new Map();
for (const route of ['/', ...pages.map(docRoute)]) {
  const html = await read(route.slice(1) + 'index.html');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size, `Duplicate IDs: ${route}`);
  assert(html.includes(`<link rel="canonical" href="${site.url}${route}">`), `Canonical URL: ${route}`);
  assert(html.includes('<main') && html.includes('id="main"'), `Landmark: ${route}`);
  docs.set(route, { html, ids: new Set(ids) });
}
let codeBlocks = 0;
for (const page of pages) {
  const route = docRoute(page);
  const { html } = docs.get(route);
  const original = await readFile(path.join(root, 'content/ocura-oss', page.file));
  const exported = await readFile(path.join(out, 'docs', page.file));
  assert(original.equals(exported), `Markdown export parity: ${page.file}`);
  assert.equal(createHash('sha256').update(original).digest('hex'), provenance.files.find((file) => file.file === page.file).sha256);
  assert(html.includes('aria-label="On this page"') && html.includes('class="sidebar-scroll"'), `Persistent navigation: ${route}`);
  assert(html.includes(`${site.projectRepository}/blob/${site.sourceRef}/${page.source}`), `Pinned source: ${route}`);
  assert(!html.includes('ocuna-ai.com') && !html.includes('github.com/BlakeMasters/ocura-oss'), `Old hosting link: ${route}`);
  assert(html.includes('Version 0.5.0.'), `Release label: ${route}`);
  const parser = new MarkdownIt();
  const tokens = parser.parse(original.toString('utf8'), {});
  for (const token of tokens.filter((token) => ['fence', 'code_block'].includes(token.type))) {
    assert(html.includes(parser.utils.escapeHtml(token.content)), `Complete code example: ${page.file}`);
    codeBlocks++;
  }
  const expectedHeadings = tokens.filter((token) => token.type === 'heading_open').length;
  assert.equal((html.match(/<h[1-6]\b/g) || []).length, expectedHeadings, `Complete headings: ${page.file}`);
}
let internalLinks = 0;
for (const [route, { html }] of docs) {
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('//')) continue;
    const target = new URL(href, 'https://example.test' + route);
    const targetDoc = docs.get(target.pathname);
    if (targetDoc && target.hash) assert(targetDoc.ids.has(decodeURIComponent(target.hash.slice(1))), `Missing anchor: ${route} → ${href}`);
    if (!targetDoc) {
      let file = path.join(out, target.pathname.slice(1));
      const info = await stat(file).catch(() => null);
      assert(info, `Missing local file: ${route} → ${href}`);
      if (info.isDirectory()) assert((await stat(path.join(file, 'index.html'))).isFile());
    }
    internalLinks++;
  }
}
const overview = docs.get('/docs/').html;
assert(overview.includes('schema 2') && overview.includes('cannot read or convert'), 'Compatibility notice must remain visible');
for (const route of docs.keys()) assert((await read('sitemap.xml')).includes(`<loc>${site.url}${route}</loc>`));
assert((await read('robots.txt')).includes(`${site.url}/sitemap.xml`));
assert((await read('llms.txt')).includes(site.sourceRef));
assert((await read('404.html')).includes('name="robots" content="noindex"'));
console.log(`Verified 7 static pages, ${pages.length} exact Markdown exports, ${codeBlocks} complete code blocks, ${internalLinks} internal links, anchors, source pins, and discovery files.`);
