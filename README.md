# Protention

Source for [protention.dev](https://protention.dev), hosted on GitHub Pages.

The Ocura OSS documentation opens directly at **https://protention.dev/**.
Reference pages use clean paths such as `/cli/` and `/api/`; navigation does not
require `/index.html`. Older `/docs/` paths remain available as aliases.

The six Markdown documents in `content/docs/` come from the package revision
recorded in `site.config.mjs` and `content/docs/source.json`. Text and code examples
match that revision; link destinations are adapted for Protention. The manifest
records both source and exported Markdown checksums. The existing renderer and
layout use black backgrounds, white text, and light-blue accents. Markdown
downloads use absolute URLs so their links work outside the site. Source links
stay pinned to the same package revision as the displayed documentation.

Every page contains the complete documentation as static HTML. The optional
browser script saves text size and normalizes aliases to clean URLs. There is no
application server or client framework.

## Local preview

Use Node.js 22 or later. The build has no dependencies.

```sh
npm ci
npm run build
npm run verify
npm run dev
```

Pushes to `main` build and deploy through `.github/workflows/pages.yml`.
Pull requests build and verify without deploying.

Verification checks copied content and code examples, Markdown exports, internal
links and headings, canonical URLs, route aliases, release source links, and the
documentation palette. `dist/` and local review artifacts are ignored.

## License

MPL-2.0; see [LICENSE](LICENSE).
