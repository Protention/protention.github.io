import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages, site } from '../site.config.mjs';
import { extractHeadings, renderMarkdown } from './lib/markdown.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
const read = (file) => readFile(path.join(out, file), 'utf8');
const withoutDestinations = (html) => html.replace(/href="[^"]*"/g, 'href=""');
const provenance = JSON.parse(await read('docs/source.json'));
const documents = new Map();
for (const page of pages) {
  const source = await readFile(path.join(root, 'content/docs', page.file));
  const markdown = source.toString('utf8');
  const html = await read(page.route.slice(1) + 'index.html');
  assert.equal(createHash('sha256').update(source).digest('hex'), provenance.files.find((file) => file.file === page.file).sha256, `Source parity: ${page.file}`);
  assert(source.equals(await readFile(path.join(out, 'docs', page.file))), `Markdown bytes: ${page.file}`);
  const prose = html.match(/<div class="docs-prose">([\s\S]*?)<\/div>\s*<\/article>/)?.[1];
  assert.equal(withoutDestinations(prose || ''), withoutDestinations(renderMarkdown(markdown)), `Existing content and markup: ${page.file}`);
  assert(html.includes(`href="${site.origin}${page.route}"`), `Canonical URL: ${page.route}`);
  assert(html.includes(`data-canonical-path="${page.route}"`), `Browser URL: ${page.route}`);
  assert(html.includes(`href="${site.repository}/blob/${site.sourceRef}/${page.source}"`), `Release source: ${page.file}`);
  assert(html.includes('class="docs-sidebar" id="docs-sidebar"') && html.includes('aria-label="On this page"'), `Static sidebar: ${page.file}`);
  assert(!html.includes('ocuna-ai.com') && !html.includes('github.com/BlakeMasters/ocura-oss'), `Hosting links: ${page.file}`);
  assert(!/href="[^"#?]*index\.html/.test(html), `Index filename in navigation: ${page.file}`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size, `Duplicate IDs: ${page.file}`);
  for (const heading of extractHeadings(markdown)) assert(ids.includes(heading.id), `Heading: ${page.file} → ${heading.id}`);
  assert.equal(await read(page.previousRoute.slice(1) + '/index.html'), html, `Legacy route: ${page.file}`);
  assert.equal(await read(page.previousRoute.slice(1) + '.html'), html, `Legacy HTML route: ${page.file}`);
  documents.set(page.route, { html, ids: new Set(ids) });
}
let links = 0;
for (const [route, { html }] of documents) {
  for (const [, href] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('//')) continue;
    const target = new URL(href.replaceAll('&amp;', '&'), site.origin + route);
    const doc = documents.get(target.pathname);
    if (doc && target.hash) assert(doc.ids.has(decodeURIComponent(target.hash.slice(1))), `Missing anchor: ${route} → ${href}`);
    if (!doc) {
      const destination = path.join(out, target.pathname.slice(1));
      const info = await stat(destination).catch(() => null);
      assert(info, `Missing local destination: ${route} → ${href}`);
      if (info.isDirectory()) assert((await stat(path.join(destination, 'index.html'))).isFile());
    }
    links++;
  }
}
const css = await read('assets/docs.css');
assert(css.includes('#000000') && css.includes('#a8d5ff') && css.includes('#ffffff'));
assert(!css.includes('#ee4c2c') && !css.includes('#1c1e21'));
assert(css.includes('overflow-y: auto') && css.includes('position: sticky'));
const sitemap = await read('sitemap.xml');
for (const page of pages) assert(sitemap.includes(`<loc>${site.origin}${page.route}</loc>`));
assert((await read('robots.txt')).includes(`${site.origin}/sitemap.xml`));
assert((await read('llms.txt')).includes(site.sourceRef));
assert(documents.get('/').html.includes('It cannot read or convert'), 'Existing compatibility notice');
console.log(`Verified all six copied docs: complete existing content, exact Markdown exports, ${links} internal links, anchors, clean URLs, legacy routes, source pins, and palette.`);
