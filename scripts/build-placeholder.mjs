import { mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const out = path.resolve(root, 'dist');
if (path.dirname(out) !== root || path.basename(out) !== 'dist') throw new Error('Unsafe build destination');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="robots" content="noindex">
  <title>Protention</title>
  <style>html,body{margin:0;min-height:100%;background:#000}body{min-height:100vh}</style>
</head>
<body></body>
</html>
`;
await writeFile(path.join(out, 'index.html'), html);
await writeFile(path.join(out, '404.html'), html);
await writeFile(path.join(out, '.nojekyll'), '');
console.log('Built blank black placeholder.');
