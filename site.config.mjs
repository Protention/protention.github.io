export const site = {
  name: 'Protention',
  url: process.env.SITE_URL || 'https://protention.dev',
  repository: 'https://github.com/Protention/protention.github.io',
  projectRepository: 'https://github.com/Protention/ocura-oss',
  version: '0.5.0',
  sourceRef: '9b1e07276e83868ffb2dce4570e0dce0e84be8c5',
  tag: 'v0.5.0',
};

export const pages = [
  { slug: '', file: 'overview.md', source: 'docs/index.md', label: 'Overview', description: 'Install Ocura OSS and record, branch, and compare your first command runs.' },
  { slug: 'cli', file: 'cli.md', source: 'docs/cli.md', label: 'CLI reference', description: 'Commands, flags, JSON results, and exit codes for Ocura OSS 0.5.0.' },
  { slug: 'api', file: 'api.md', source: 'docs/python-api.md', label: 'Python API', description: 'Typed workflow functions, state access, results, and exceptions in ocura_oss.' },
  { slug: 'automation', file: 'automation.md', source: 'docs/automation.md', label: 'Scripts & AI agents', description: 'Use the Ocura OSS CLI and Python API from scripts and agent execution environments.' },
  { slug: 'examples', file: 'examples.md', source: 'examples/autoregressive/README.md', label: 'Training example', description: 'Record a small autoregressive experiment with PyTorch or JAX and an optional Ray executor.' },
  { slug: 'state', file: 'state.md', source: 'docs/state-and-verification.md', label: 'State & verification', description: 'Record formats, local checks, concurrent use, and upgrading from Ocura OSS 0.4.' },
];

export const docRoute = (page) => page.slug ? `/docs/${page.slug}/` : '/docs/';
