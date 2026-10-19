import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pages, site } from '../site.config.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const checkoutIndex = args.indexOf('--checkout');
if (checkoutIndex < 0 || !args[checkoutIndex + 1]) {
  throw new Error('Usage: npm run sync:docs -- --checkout /path/to/ocura-oss');
}
const checkout = path.resolve(args[checkoutIndex + 1]);
const git = (...args) => execFileSync('git', ['-C', checkout, ...args]);
const commit = git('rev-parse', `${site.tag}^{commit}`).toString().trim();
if (commit !== site.sourceRef) throw new Error('Release tag does not match site.config.mjs');
const destination = path.join(root, 'content', 'ocura-oss');
await mkdir(destination, { recursive: true });
const files = [];
for (const page of pages) {
  const bytes = git('show', `${commit}:${page.source}`);
  await writeFile(path.join(destination, page.file), bytes);
  files.push({ source: page.source, file: page.file, sha256: createHash('sha256').update(bytes).digest('hex') });
}
await writeFile(path.join(root, 'LICENSE'), git('show', `${commit}:LICENSE`));
await writeFile(path.join(destination, 'source.json'), JSON.stringify({
  repository: site.projectRepository, tag: site.tag, commit, files,
}, null, 2) + '\n');
console.log(`Copied ${files.length} unmodified documents from ${site.tag} (${commit}).`);
