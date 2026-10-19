import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pages, site, docRoute } from '../site.config.mjs';
import { escapeHtml as e, renderDocument } from './markdown.mjs';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const out = path.resolve(root, 'dist');
if (path.dirname(out) !== root || path.basename(out) !== 'dist') throw new Error('Unsafe build destination');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(path.join(root, 'public'), out, { recursive: true });
const provenance = JSON.parse(await readFile(path.join(root, 'content/ocura-oss/source.json'), 'utf8'));
if (provenance.commit !== site.sourceRef || provenance.tag !== site.tag || provenance.repository !== site.projectRepository) throw new Error('Documentation release pin mismatch');

const brand = `<a class="brand" href="/" aria-label="Protention home"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 25V7h8a6 6 0 0 1 0 12H8m8-6h8"/></svg><span>Protention</span></a>`;
function header(isDocs = false) {
  return `<header class="site-header"><div class="header-inner">${brand}<nav aria-label="Main navigation"><a href="/#projects">Projects</a><a href="/docs/"${isDocs ? ' aria-current="page"' : ''}>Docs</a><a href="https://github.com/Protention">GitHub <span aria-hidden="true">↗</span></a><button class="theme-toggle" type="button" aria-label="Switch color theme" hidden>◐</button></nav></div></header>`;
}
const footer = `<footer class="site-footer"><span>Protention</span><span>Built in the open. <a href="${site.repository}">Site source ↗</a></span></footer>`;
function document({ title, description, route, body, className = '', noindex = false }) {
  const canonical = site.url.replace(/\/$/, '') + route;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title><meta name="description" content="${e(description)}"><link rel="canonical" href="${e(canonical)}">
${noindex ? '<meta name="robots" content="noindex">' : ''}<meta name="color-scheme" content="light dark"><meta name="theme-color" content="#f6f7f2">
<meta property="og:type" content="website"><meta property="og:site_name" content="Protention"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${e(canonical)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/assets/site.css"><script src="/assets/site.js" defer></script></head>
<body class="${className}"><a class="skip-link" href="#main">Skip to content</a>${body}</body></html>\n`;
}
async function output(file, content) {
  const destination = path.join(out, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, content);
}

const home = `${header()}
<main id="main" class="home-shell">
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-copy"><p class="eyebrow"><span class="status-dot"></span> OPEN SOURCE / PROTENTION</p>
      <h1 id="hero-title">Keep the run.<br><em>Carry the context.</em></h1>
      <p class="hero-description">Ocura OSS is a local execution ledger. Record command runs, branch from earlier work, and compare what changed.</p>
      <div class="hero-actions"><a class="button primary" href="/docs/">Read the docs <span aria-hidden="true">↗</span></a><a class="text-link" href="${site.projectRepository}">Explore the source <span aria-hidden="true">↗</span></a></div>
      <p class="hero-detail">Python 3.11+ <span>·</span> Standard library runtime <span>·</span> MPL-2.0</p>
    </div>
    <div class="ledger-figure" aria-label="Run lineage: a recorded baseline branches into a variation, and both can be compared">
      <div class="figure-heading"><span>OCURA OSS</span><span>v${site.version}</span></div>
      <div class="lineage"><div class="lineage-row"><span class="node solid"></span><div><span class="node-label">01 / RECORD</span><strong>A baseline to return to</strong><p>Command, output, parameters, timing.</p></div></div><div class="lineage-row branch-row"><span class="node"></span><div><span class="node-label">02 / BRANCH</span><strong>A reason for the next run</strong><p>Connect a variation to its source.</p></div></div><div class="lineage-row compare-row"><span class="node compare-node"></span><div><span class="node-label">03 / COMPARE</span><strong>See what changed</strong><p>Lineage, outcomes, and parameter differences.</p></div></div></div>
      <div class="figure-footer"><span class="status-dot"></span> Records stay in your project.</div>
    </div>
  </section>
  <section id="projects" class="project-section" aria-labelledby="project-title">
    <div class="section-heading"><p class="eyebrow">01 / THE PROJECT</p><span class="release-label">Current release · ${site.version}</span></div>
    <div class="project-grid"><div class="project-copy"><h2 id="project-title">Ocura OSS</h2><p>Use it from your terminal, a Python script, or an AI agent with a shell. The same local records connect each attempt to the work that came before.</p><a class="text-link" href="${site.projectRepository}/releases/tag/${site.tag}">Release notes <span aria-hidden="true">↗</span></a></div>
      <div class="terminal"><div class="terminal-heading"><span>TRY IT IN A NEW DIRECTORY</span><span aria-hidden="true">↵</span></div><pre><code>python -m pip install ocura-oss==${site.version}\nocura-oss demo --root ./ocura-demo</code></pre><p>The demo records, branches, verifies, and compares. Its destination must not already exist.</p></div></div>
  </section>
  <section class="reading-section" aria-labelledby="reading-title"><div><p class="eyebrow">02 / GO A LITTLE DEEPER</p><h2 id="reading-title">Start with the workflow.<br>Keep the reference close.</h2></div><div class="reading-links"><a href="/docs/"><span><strong>Get started</strong><small>Install, try the demo, and compare two runs.</small></span><span aria-hidden="true">↗</span></a><a href="/docs/api/"><span><strong>Python API</strong><small>Typed functions and direct access to local state.</small></span><span aria-hidden="true">↗</span></a><a href="/docs/state/"><span><strong>State & verification</strong><small>Record formats, compatibility, and what checks prove.</small></span><span aria-hidden="true">↗</span></a></div></section>
</main>${footer}`;
await output('index.html', document({ title: 'Protention — Open-source software', description: 'Ocura OSS, a local execution ledger for recording, branching, and comparing command runs. Open-source software from Protention.', route: '/', body: home }));

for (const page of pages) {
  const bytes = await readFile(path.join(root, 'content/ocura-oss', page.file));
  const source = provenance.files.find((file) => file.file === page.file && file.source === page.source);
  if (!source || source.sha256 !== createHash('sha256').update(bytes).digest('hex')) throw new Error(`Source parity failed: ${page.file}`);
  const { html, headings } = renderDocument(bytes.toString('utf8'), page.source);
  const sidebar = `<aside class="docs-sidebar" aria-label="Documentation navigation"><div class="sidebar-heading"><a href="/docs/">Ocura OSS</a><span>v${site.version}</span></div><div class="sidebar-scroll"><nav class="page-nav" aria-label="Documentation sections">${pages.map((item) => `<a href="${docRoute(item)}"${item === page ? ' aria-current="page"' : ''}>${e(item.label)}</a>`).join('')}</nav><div class="toc"><p class="eyebrow">ON THIS PAGE</p><nav aria-label="On this page">${headings.map((heading) => `<a${heading.level === 3 ? ' class="subheading"' : ''} href="#${e(heading.id)}">${e(heading.text)}</a>`).join('')}</nav></div><div class="sidebar-project"><p class="eyebrow">PROJECT</p><a href="https://pypi.org/project/ocura-oss/${site.version}/">PyPI package ↗</a><a href="${site.projectRepository}/tree/${site.sourceRef}">Release source ↗</a><a href="${site.projectRepository}/blob/${site.sourceRef}/CHANGELOG.md">Changelog ↗</a></div></div><div class="font-controls" role="group" aria-label="Documentation text size" hidden><button type="button" data-font="smaller" aria-label="Smaller text">A−</button><output aria-live="polite" id="font-size">16px</output><button type="button" data-font="larger" aria-label="Larger text">A+</button></div></aside>`;
  const body = `${header(true)}<div class="docs-layout">${sidebar}<main class="docs-main" id="main"><div class="doc-meta"><span>OCURA OSS / ${site.version}</span><nav aria-label="Documentation formats"><a href="/docs/${page.file}">Markdown ↗</a><a href="${site.projectRepository}/blob/${site.sourceRef}/${page.source}">Source ↗</a></nav></div><article class="prose">${html}</article><nav class="doc-bottom-nav" aria-label="More documentation">${pages.filter((item) => item !== page).map((item) => `<a href="${docRoute(item)}">${e(item.label)} ↗</a>`).join('')}</nav></main></div>${footer}`;
  await output(path.posix.join(docRoute(page), 'index.html').slice(1), document({ title: `${page.label} · Ocura OSS ${site.version} · Protention`, description: page.description, route: docRoute(page), body, className: 'docs-page' }));
  await output(`docs/${page.file}`, bytes);
}
await output('docs/source.json', JSON.stringify(provenance, null, 2) + '\n');
await cp(path.join(root, 'LICENSE'), path.join(out, 'LICENSE'));
await output('404.html', document({ title: 'Page not found · Protention', description: 'Find the Ocura OSS documentation and project source.', route: '/404.html', noindex: true, body: `${header()}<main class="not-found home-shell" id="main"><p class="eyebrow">404 / PAGE NOT FOUND</p><h1>That path ends here.</h1><p>The project and its documentation are a good place to start.</p><a class="button primary" href="/docs/">Open the docs ↗</a></main>${footer}` }));
const urls = ['/', ...pages.map(docRoute)];
await output('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((route) => `<url><loc>${site.url}${route}</loc></url>`).join('')}</urlset>\n`);
await output('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
await output('llms.txt', `# Protention\n\n> Open-source software. Ocura OSS ${site.version} is a local execution ledger for command runs.\n\nDocumentation is pinned to ${site.projectRepository}/tree/${site.sourceRef}.\n\n${pages.map((page) => `- [${page.label}](${site.url}${docRoute(page)}): ${page.description}\n  Markdown: ${site.url}/docs/${page.file}`).join('\n')}\n`);
await output('.nojekyll', '');
console.log(`Built homepage, ${pages.length} complete release-pinned docs pages, Markdown exports, and discovery files at ${out}.`);
