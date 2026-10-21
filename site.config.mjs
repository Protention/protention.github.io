export const site = {
  origin: (process.env.SITE_URL || 'https://protention.dev').replace(/\/$/, ''),
  version: '0.6.0',
  repository: 'https://github.com/Protention/ocura-oss',
  sourceRef: '8aeda23e41fe960a5f572267fd28695fa2f79172',
};

export const pages = [
  { route: '/', previousRoute: '/docs', label: 'Overview', file: 'ocura-oss.md', source: 'docs/index.md' },
  { route: '/cli/', previousRoute: '/docs/cli', label: 'CLI reference', file: 'cli.md', source: 'docs/cli.md' },
  { route: '/api/', previousRoute: '/docs/api', label: 'Python API', file: 'api.md', source: 'docs/python-api.md' },
  { route: '/automation/', previousRoute: '/docs/automation', label: 'Scripts and AI agents', file: 'automation.md', source: 'docs/automation.md' },
  { route: '/examples/', previousRoute: '/docs/examples', label: 'Training example', file: 'examples.md', source: 'examples/autoregressive/README.md' },
  { route: '/state/', previousRoute: '/docs/state', label: 'State and verification', file: 'state.md', source: 'docs/state-and-verification.md' },
];
