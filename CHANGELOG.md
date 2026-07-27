# Changelog

All notable changes to this template are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). For a
template, "breaking" means a change that a project already started from this repo cannot
absorb by copying files across.

## [Unreleased]

### Added

- `LICENSE` file. The MIT licence was declared in `package.json`, the README and the app
  footer, but the licence text itself was missing — so GitHub showed no licence at all.
- `CONTRIBUTING.md`, `CODEOWNERS`, and pull request and issue templates.
- This changelog.

## [2.0.0]

Angular 22, a landing page that explains what the template actually does, and — more to
the point — the first version where the test suite, the router and the theme all work.

### Added

- **Test suite**: 46 tests over the three SignalStores, the CSRF interceptor, both route
  guards, cookie utilities and the 404 page. The template previously advertised Vitest and
  shipped zero tests.
- **CI**: GitHub Actions running `biome ci`, the suite on Node 22 and 24, and a production
  build, on every push to `main` and every pull request.
- **Example features**: a login page driven by `AuthStore` and guarded by `anonymousGuard`,
  and a dashboard behind `authGuard`. `AuthStore`, the guards and the interceptor existed
  but nothing used them, and the routes they navigated to were not declared.
- **404 page** replacing the wildcard redirect, keeping the attempted URL and marking
  itself `noindex` (removed on destroy, so the directive does not leak into the next
  navigation).
- **Custom light and dark themes** with a contained palette, replacing DaisyUI's defaults.
- **Lucide icons**, replacing emoji.
- `pnpm lint:ci` — `biome ci`, which verifies without rewriting files.
- `SeoService.removeTag`, needed to retract route-scoped meta tags.

### Changed

- **Angular 21 → 22.0.8**, with the official migrations. Two compatibility shims the
  migration inserts were deliberately reverted: `ChangeDetectionStrategy.Eager` on the
  shell, and the suppression of two strict template diagnostics.
- **`@angular-devkit/build-angular` → `@angular/build`.** The former is deprecated
  ("Angular's Webpack support is deprecated").
- **TypeScript 5.9 → 6.0.3.** Angular 22 requires `>=6.0 <6.1`; 7.0 would break the build
  despite being what `pnpm outdated` reports as latest.
- `engines.node` narrowed to `^22.22.3 || ^24.15.0 || >=26.0.0`, matching the Angular 22
  CLI. The previous `>=18.19.0` allowed installs on a Node the project cannot build on.
- Dependencies refreshed: Analog 2.6.4, CDK 22, Biome 2.5.5, Vitest 4.1.10, jsdom 30,
  ngx-translate 18, `@vercel/speed-insights` 2, TailwindCSS and DaisyUI, NgRx 21.1.1.
- `lucide-angular` (deprecated) replaced with `@lucide/angular`.
- The landing page restructured around what the template actually offers: a real
  SignalStore, and a comparison of `localStorage` against `HttpOnly` cookies.

### Fixed

- **The test suite could not run at all.** Three separate causes: `src/setup-vitest.ts` was
  referenced by `vitest.config.ts` but did not exist; `tsconfig.spec.json` forced
  `"module": "CommonJs"`, left over from Karma/Jest, which stopped the Angular plugin from
  transforming specs for Vite's ESM pipeline; and `vitest.config.ts` did not mirror the
  tsconfig `paths`, so any spec importing through `@core/*` failed to resolve.
- **The router was inert.** `app.routes.ts` registered `AppComponent` — the bootstrap root
  — as a route component, and its template had no `<router-outlet>`. The landing rendered
  because it was embedded in the shell, not because of navigation.
- **The theme was never applied.** `styles.scss` defined it with DaisyUI v4 variable names
  (`--b1`, `--bc`, `--p`) while the project uses v5, which renamed them. The whole block
  was dead code.
- **The Angular logo rendered as a solid blob** — the SVG path data was wrong.
- `timeZone` was `'America\\Havana'` with a backslash. It feeds
  `DATE_PIPE_DEFAULT_OPTIONS`, so the first use of `| date` would have failed.
- `@vitest/coverage-v8` was missing, so the documented `pnpm test:coverage` failed with
  `MISSING DEPENDENCY`.
- `AuthStore.login` now honours `returnUrl`. `authGuard` already wrote the query
  parameter, but the store always redirected to `/dashboard`, so it had no effect.
- Accessibility: explicit `type` on two buttons, and `aria-hidden` on decorative SVGs.

## [1.0.0]

Initial template: standalone components, zoneless change detection, NgRx SignalStore,
HttpOnly cookie authentication, TailwindCSS v4 with DaisyUI, and i18n.

[unreleased]: https://github.com/ZahiriNatZuke/angular-template-project/compare/main...HEAD
[2.0.0]: https://github.com/ZahiriNatZuke/angular-template-project/releases/tag/v2.0.0
