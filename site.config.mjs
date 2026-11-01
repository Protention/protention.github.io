export const site = {
  origin: (process.env.SITE_URL || 'https://protention.dev').replace(/\/$/, ''),
  version: '0.7.0',
  repository: 'https://github.com/Protention/ocura-oss',
  sourceRef: 'db15ec5548bc9e5c6aac778033e9fe0ba4ebd346',
};

export const pages = [
  { route: '/', previousRoute: '/docs', label: 'Overview', file: 'ocura-oss.md', source: 'docs/index.md' },
  { route: '/cli/', previousRoute: '/docs/cli', label: 'CLI reference', file: 'cli.md', source: 'docs/cli.md' },
  { route: '/api/', previousRoute: '/docs/api', label: 'Python API', file: 'api.md', source: 'docs/python-api.md' },
  { route: '/automation/', previousRoute: '/docs/automation', label: 'Scripts and AI agents', file: 'automation.md', source: 'docs/automation.md' },
  { route: '/examples/', previousRoute: '/docs/examples', label: 'Examples', file: 'examples.md', source: 'docs/use-cases.md', archive: { label: '0.6.0 example archive', url: 'https://github.com/Protention/ocura-oss/tree/v0.6.0/examples/autoregressive' } },
  { route: '/naming/', previousRoute: '/docs/naming', label: 'Names and compatibility', file: 'naming.md', source: 'docs/naming-migration.md' },
  { route: '/compression/', previousRoute: '/docs/compression', label: 'Log compression', file: 'compression.md', source: 'docs/autocompression.md' },
  { route: '/state/', previousRoute: '/docs/state', label: 'State and verification', file: 'state.md', source: 'docs/state-and-verification.md' },
  { route: '/releases/', previousRoute: '/docs/releases', label: 'Release history', file: 'releases.md', source: 'docs/index.md' },
];
