# Protention

Source for [protention.dev](https://protention.dev), hosted on GitHub Pages.

The site currently serves a blank black placeholder. Documentation hosting will
be considered separately. The earlier site implementation remains in Git history.

## Local preview

Use Node.js 22 or later. The site has no dependencies.

```sh
npm ci
npm run build
npm run verify
npm run dev
```

Pushes to `main` build and deploy through `.github/workflows/pages.yml`.
Pull requests build and verify without deploying.

## License

MPL-2.0; see [LICENSE](LICENSE).
