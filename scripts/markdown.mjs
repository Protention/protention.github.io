import MarkdownIt from 'markdown-it';
import GithubSlugger from 'github-slugger';
import path from 'node:path';
import { pages, site, docRoute } from '../site.config.mjs';

export const escapeHtml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export function rewriteLink(href, sourcePath) {
  const oldDocs = /^https:\/\/(?:www\.)?ocuna-ai\.com\/docs\/?/;
  if (oldDocs.test(href)) return href.replace(oldDocs, '/docs/');
  if (/^https?:\/\//.test(href)) {
    return href.replace('https://github.com/BlakeMasters/ocura-oss', site.projectRepository)
      .replace(`${site.projectRepository}/blob/main/`, `${site.projectRepository}/blob/${site.sourceRef}/`)
      .replace(`${site.projectRepository}/tree/main/`, `${site.projectRepository}/tree/${site.sourceRef}/`);
  }
  if (href.startsWith('#') || href.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(href)) return href;
  const [filePath, fragment = ''] = href.split('#');
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath), decodeURIComponent(filePath)));
  const target = pages.find((page) => page.source === resolved);
  const suffix = fragment ? `#${fragment}` : '';
  return target ? docRoute(target) + suffix : `${site.projectRepository}/blob/${site.sourceRef}/${resolved}${suffix}`;
}

export function renderDocument(markdown, sourcePath) {
  const parser = new MarkdownIt({ html: false, linkify: false, typographer: false });
  const slugger = new GithubSlugger();
  const headings = [];
  const originalLink = parser.renderer.rules.link_open || ((tokens, index, options, env, self) => self.renderToken(tokens, index, options));
  parser.renderer.rules.link_open = (tokens, index, options, env, self) => {
    const token = tokens[index];
    token.attrSet('href', rewriteLink(token.attrGet('href'), sourcePath));
    return originalLink(tokens, index, options, env, self);
  };
  const tokens = parser.parse(markdown, {});
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== 'heading_open') continue;
    const inline = tokens[i + 1];
    const text = inline.children.filter((token) => ['text', 'code_inline'].includes(token.type)).map((token) => token.content).join('');
    const id = slugger.slug(text);
    tokens[i].attrSet('id', id);
    tokens[i].attrSet('tabindex', '-1');
    const level = Number(tokens[i].tag.slice(1));
    if (level === 2 || level === 3) headings.push({ id, text, level });
  }
  return { html: parser.renderer.render(tokens, parser.options, {}), headings };
}
