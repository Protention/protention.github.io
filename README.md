# Protention

The source for [protention.dev](https://protention.dev), deployed with GitHub Pages.
It introduces Ocura OSS and hosts a complete copy of the published 0.5.0 documentation.

The site is static HTML and CSS with a small optional script for color theme,
documentation text size, and copying code. The documentation is readable without
JavaScript. There is no server, account system, analytics, or runtime framework.

## Develop

Use Node.js 22 or later.

```sh
npm ci
npm run build
npm run verify
npm run dev
```

Open the local URL printed by the preview server. `dist/` is generated and ignored.
`SITE_URL` can override the canonical origin for a separate deployment.

## Documentation source

The six files in `content/ocura-oss/` are unmodified copies from
[`Protention/ocura-oss` at v0.5.0](https://github.com/Protention/ocura-oss/tree/9b1e07276e83868ffb2dce4570e0dce0e84be8c5).
`source.json` records the source paths, exact commit, and SHA-256 digests.
The build rewrites documentation links for this site and pins other repository
links to that release. Downloadable Markdown retains the original source bytes.

To document a later **published** release, update the version, tag, and commit in
`site.config.mjs`, then sync from a checkout containing that tag:

```sh
npm run sync:docs -- --checkout /path/to/ocura-oss
npm run build
npm run verify
```

Review compatibility notices and links before publishing. Verification checks
source parity, complete code examples and headings, internal links and anchors,
static navigation, canonical URLs, Markdown exports, and discovery files.

## Deployment and domain

Pushes to `main` build, verify, and deploy through `.github/workflows/pages.yml`.
Pull requests build and verify without deploying. Enable **GitHub Actions** as the
Pages source in the repository settings. The deployment uses the `github-pages`
environment and official GitHub Actions pinned to commit hashes.

The Pages custom domain is `protention.dev`, configured in the repository's Pages
settings. Actions deployments do not use a `CNAME` file to configure the domain.
The domain's DNS records for this site are:

| Type | Name | Target | Cloudflare proxy |
| --- | --- | --- | --- |
| A | @ | 185.199.108.153 | DNS only |
| A | @ | 185.199.109.153 | DNS only |
| A | @ | 185.199.110.153 | DNS only |
| A | @ | 185.199.111.153 | DNS only |
| CNAME | www | protention.github.io | DNS only |

Configure the domain in GitHub before pointing DNS at Pages. Enable HTTPS in
Pages settings after GitHub provisions the certificate. See GitHub's
[custom domain guidance](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## License

MPL-2.0; see [LICENSE](LICENSE). Ocura OSS documentation retains its upstream license.
