# Changelog

All notable changes to this template are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). For a
template, "breaking" means a change that a project already started from this repo cannot
absorb by copying files across.

## [Unreleased]

## [2.1.0]

Everything the 2.0.0 release advertised, now actually working — plus the repository
housekeeping that 2.0.0 skipped. The headline is that the end-to-end suite paid for itself
twice: it found two defects that unit tests and code reading could not see.

### Added

- `LICENSE` file. The MIT licence was declared in `package.json`, the README and the app
  footer, but the licence text itself was missing — so GitHub showed no licence at all.
- `CONTRIBUTING.md`, `CODEOWNERS`, and pull request and issue templates.
- This changelog.
- **Dependabot**, with updates grouped by ecosystem so an Angular bump arrives as one
  coherent pull request rather than a dozen that fail CI individually. TypeScript is
  pinned below 6.1, which is what Angular 22 declares as its peer.
- **Scheduled CI** every Monday. A template can break with no commit at all — an action
  changes, a runner updates Node, a package is unpublished — and the weekly run catches it
  before the next person to clone it does.
- **Coverage thresholds** enforced in CI, so coverage cannot silently regress.
- Tests for the two `safe-*` pipes, `SeoService`, `RouterStateService`, `NotifyService`,
  and the login, dashboard and home pages. The suite goes from 46 to 91 tests.
- **End-to-end tests** with Playwright, on desktop and mobile viewports, plus a CI job.
  The auth flows run against intercepted API responses, so the session paths are
  exercisable without standing up a backend.
- **Focus management across navigations, and a skip link.** A single-page app does not
  move focus when the route changes: it stays on the link that was clicked, so a screen
  reader never announces the new page and keyboard users keep tabbing from the navbar.
  `initRouteFocusManagement` now moves focus to the main landmark after each navigation,
  skipping the initial load so it does not override an in-page `#fragment`. The shell
  gained `header`/`main`/`footer` landmarks.
- **Deferred views on the landing page.** The two largest sections moved into their own
  components so `@defer (on viewport; prefetch on idle)` can give them separate chunks,
  with a height-reserving `@placeholder`. Note the trade-off, measured rather than
  assumed: 5 kB move out of the initial bundle but the deferred-view runtime adds ~12 kB
  to it. At this size that is a net loss in bytes; the pattern is kept because it is what
  to copy when the deferred content is genuinely heavy.
- **`NotifyService` is finally used.** It was written, tested, and called by nobody.
  It now covers the two places where the user was left without information: an expired
  session — a 401 signs you out and navigates to the login page, previously with no
  explanation at all — and signing out on purpose. A `failure()` method was added, which
  was the case the service was missing.
- **CodeQL workflow.** The `main` ruleset already required code scanning with CodeQL to
  merge a pull request, but no workflow produced any analysis, so the requirement could
  never be met and every pull request stayed blocked with CI green.
- **`.gitattributes`**, normalising line endings to LF. Without it, on Windows with
  `core.autocrlf=true` every file in the project reads as mis-formatted to Biome:
  `pnpm lint:ci` failed locally while CI passed, and the pre-commit hook rewrote the
  entire repository on each commit.
- **README: an explicit statement that this template is client-side rendered**, why, and
  what SSR would cost — the template invests in per-route SEO, which invited the opposite
  assumption. Plus a table for removing each piece you don't need.

### Changed

- **Notiflix is loaded on demand.** Wiring up `NotifyService` put it in the initial
  bundle — around 100 kB raw, 14 kB transferred, for something most visits never see. It
  now arrives through `import()` in its own chunk, so the initial bundle goes from 481.43
  to **391.01 kB raw** (111.41 → **97.50 kB transferred**). The cost is a wait the first
  time a notification is shown; the service's methods return their promise for anyone who
  needs to await it.

### Fixed

Session handling first, since that is where the serious ones were:

- **Startup session validation never ran.** `AuthStore` fired `fetchCsrfToken()` and
  `checkAuth()` from `withHooks({ onInit })`. Those requests pass through
  `authInterceptor`, which injects `AuthStore` — the very store still under construction.
  Angular threw `NG0200: Circular dependency detected for SignalStore` and the requests
  never left the browser. The feature the README advertised as "automatic session
  validation on application startup" had therefore never worked. Both calls moved to
  `provideAppInitializer`, where the store is fully built.
- **A rejected login showed no error.** The interceptor treated *every* 401 as an expired
  session and called `logout()`, which reset state and wiped the message `login` had just
  set. It now skips the auth endpoints, where a 401 is a business answer rather than an
  expired session.
- **Loading a protected route directly bounced an authenticated user to the login page.**
  `authGuard` was evaluated before `checkAuth()` resolved. Both guards now wait on a new
  `isSessionChecked` flag before deciding.
- **Every login went out without its `X-CSRF-Token` header.** Startup asks for
  `/auth/csrf` and `/auth/me` at the same time, and `checkAuth()` reset its error branch
  with `...initialState` — which includes `csrfToken: null`. So the ordinary 401 of an
  anonymous visitor threw away the token that had just arrived, and the next mutation, the
  login itself, travelled bare. A backend validating CSRF would have rejected the first
  mutation of every session. The reset now goes to an `anonymousSession` shape that leaves
  the token alone: the token belongs to the browser, not to the session. This was the
  defect tracked as a known issue in the previous entry; the end-to-end test that found it
  is no longer skipped.
- **After logging out, the next login had a stale token.** `logout()` cleared
  `csrfToken` and nothing asked for a new one, since `fetchCsrfToken()` only ran from
  `provideAppInitializer` — so without a page reload the following mutation had no valid
  token. Closing a session now requests a fresh one, which is also what a backend that
  rotates the token on logout expects.
- **The 401 exemption matched by substring.** `url.includes('/auth/me')` would also have
  exempted a business endpoint such as `/api/users/auth/me`, silently keeping expired
  sessions alive. It now compares the full URL.

And the rest:

- **The interceptor left the whole app untranslated.** Injecting `NotifyService` eagerly
  there chained `interceptor → NotifyService → TranslateService → request → interceptor`,
  because the i18n loader fetches its files through that same interceptor. Angular
  aborted with `NG0200` and every page rendered raw translation keys. The service is now
  resolved from the `Injector` only when there is something to announce. Same cycle
  `AuthStore` had when it did HTTP in `withHooks({ onInit })` — an interceptor is a
  delicate place to inject into.
- **`RouterStateService.params()` and `.queryParams()` returned garbage.** They read
  `route.params` and `route.queryParams`, which are Observables, so spreading them copied
  the Subject's internals (`_value`, `closed`, `observers`) instead of the values. They now
  read from `route.snapshot`, consistent with how the service already handled `data`.
- **Documentation that had stopped being true.** The README advertised "42 tests" and
  never mentioned Playwright, `pnpm e2e`, the end-to-end CI job or coverage thresholds.
  The landing page itself showed "42 tests" to visitors.
- **No pull request could be merged at all.** The `main` ruleset required a deployment to
  the `Production` environment, but Vercel deploys pull requests to `Preview` and
  Production is only reached *after* merging — a circular requirement that left every
  pull request blocked with CI green. The rule was removed; CodeQL, the other unmeetable
  requirement, now has the workflow it was always missing.

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

[unreleased]: https://github.com/ZahiriNatZuke/angular-template-project/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/ZahiriNatZuke/angular-template-project/releases/tag/v2.1.0
[2.0.0]: https://github.com/ZahiriNatZuke/angular-template-project/releases/tag/v2.0.0
