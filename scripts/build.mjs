import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages, site } from '../site.config.mjs';
import { escapeHtml as e, extractHeadings, renderMarkdown } from './lib/markdown.mjs';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const out = path.resolve(root, 'dist');
if (path.dirname(out) !== root || path.basename(out) !== 'dist') throw new Error('Unsafe build destination');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(path.join(root, 'public'), out, { recursive: true });
const provenance = JSON.parse(await readFile(path.join(root, 'content/docs/source.json'), 'utf8'));
assert.equal(provenance.version, site.version);
assert.equal(provenance.packageSourceRef, site.sourceRef);
const assetVersion = createHash('sha256').update(await readFile(path.join(root, 'public/assets/docs.css'))).update(await readFile(path.join(root, 'public/assets/base.css'))).update(await readFile(path.join(root, 'public/assets/docs.js'))).digest('hex').slice(0, 12);

function rewriteLinks(html) {
  return html.replace(/href="([^"]+)"/g, (attribute, href) => {
    if (href.startsWith('#')) return attribute;
    if (href.startsWith('https://github.com/BlakeMasters/ocura-oss')) {
      return `href="${href.replace('https://github.com/BlakeMasters/ocura-oss', site.repository)}"`;
    }
    const target = new URL(href, 'https://ocuna-ai.com');
    if (target.origin !== 'https://ocuna-ai.com' && target.origin !== site.origin) return attribute;
    const previousPath = target.pathname.replace(/\/(?:index\.html)?$/, '').replace(/\.html$/, '');
    const page = pages.find((item) => item.previousRoute === previousPath || item.route.replace(/\/$/, '') === previousPath);
    return page ? `href="${page.route}${target.search}${target.hash}"` : attribute;
  });
}

async function output(file, content) {
  const destination = path.join(out, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, content);
}

function sidebar(page, markdown) {
  const toc = extractHeadings(markdown).map((heading) => `<a${heading.level > 2 ? ' class="is-sub"' : ''} href="#${e(heading.id)}">${e(heading.text)}</a>`).join('\n');
  return `<aside class="docs-sidebar" id="docs-sidebar" aria-label="Documentation navigation">
  <div class="docs-sidebar-header"><p>Ocura OSS <span>v${site.version}</span></p></div>
  <div class="docs-sidebar-body">
    <div class="docs-sidebar-group"><nav aria-label="Documentation sections">
      ${pages.map((item) => `<a${item === page ? ' class="is-current" aria-current="page"' : ''} href="${item.route}">${e(item.label)}</a>`).join('\n')}
    </nav></div>
    <div class="docs-sidebar-group"><p>On this page</p><nav aria-label="On this page">${toc}</nav></div>
    <div class="docs-sidebar-group"><p>Project</p><nav aria-label="Project links">
      <a href="https://pypi.org/project/ocura-oss/">PyPI</a>
      <a href="${site.repository}/tree/${site.sourceRef}">Source code</a>
      <a href="${site.repository}/blob/${site.sourceRef}/CHANGELOG.md">Changelog</a>
      <a href="${site.repository}/blob/${site.sourceRef}/CONTRIBUTING.md">Contributing</a>
    </nav></div>
  </div>
  <div class="docs-sidebar-footer">
    <div class="docs-text-size" role="group" aria-label="Text size" hidden>
      <button type="button" class="docs-text-size-btn" aria-label="Smaller text" data-font="smaller">A−</button>
      <span class="docs-text-size-label" aria-live="polite">16px</span>
      <button type="button" class="docs-text-size-btn" aria-label="Larger text" data-font="larger">A+</button>
    </div>
    <noscript><a class="back-to-top" href="#top">Back to top</a></noscript>
  </div>
</aside>`;
}

for (const page of pages) {
  const bytes = await readFile(path.join(root, 'content/docs', page.file));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), provenance.files.find((file) => file.file === page.file)?.sha256, `Copied content changed: ${page.file}`);
  const markdown = bytes.toString('utf8');
  const html = `<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark"><meta name="theme-color" content="#000000">
  <title>${e(page.label)} · Ocura OSS ${site.version} · Protention</title>
  <meta name="description" content="${e(page.label)} for Ocura OSS ${site.version}, a local execution ledger for recording, branching, and comparing command runs.">
  <link rel="canonical" href="${site.origin}${page.route}">
  <link rel="alternate" type="text/markdown" href="${site.origin}/docs/${page.file}">
  <meta property="og:title" content="${e(page.label)} · Ocura OSS ${site.version}">
  <meta property="og:type" content="website"><meta property="og:url" content="${site.origin}${page.route}">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&amp;family=Space+Grotesk:wght@400..700&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/base.css?v=${assetVersion}"><link rel="stylesheet" href="/assets/docs.css?v=${assetVersion}">
  <script src="/assets/docs.js?v=${assetVersion}" defer></script>
</head><body data-canonical-path="${page.route}">
  <a class="skip-link" href="#content">Skip to content</a>
  <main class="docs-page" id="top" tabindex="-1"><div class="shell docs-layout">
    ${sidebar(page, markdown)}
    <article class="docs-main" id="content">
      <nav class="docs-source-links" aria-label="Alternative documentation formats">
        <a href="/docs/${page.file}">Read Markdown</a>
        <a href="${site.repository}/blob/${site.sourceRef}/${page.source}">Read on GitHub</a>
      </nav>
      <div class="docs-prose">${rewriteLinks(renderMarkdown(markdown))}</div>
    </article>
  </div></main>
</body></html>\n`;
  await output(page.route.slice(1) + 'index.html', html);
  await output(page.previousRoute.slice(1) + '/index.html', html);
  await output(page.previousRoute.slice(1) + '.html', html);
  await output('docs/' + page.file, bytes);
}
await output('docs/source.json', JSON.stringify(provenance, null, 2) + '\n');
await output('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map((page) => `<url><loc>${site.origin}${page.route}</loc></url>`).join('')}</urlset>\n`);
await output('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap.xml\n`);
await output('llms.txt', `# Ocura OSS ${site.version}\n\n> A local execution ledger for recording, branching, and comparing command runs.\n\n${pages.map((page) => `- [${page.label}](${site.origin}${page.route})\n  Markdown: ${site.origin}/docs/${page.file}`).join('\n')}\n\nSource: ${site.repository}/tree/${site.sourceRef}\n`);
await output('404.html', '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Not found · Protention</title><style>html,body{margin:0;background:#000;color:#fff}</style></head><body></body></html>\n');
await output('.nojekyll', '');
console.log('Built the existing six documentation pages, with the overview at / and clean reference URLs.');
