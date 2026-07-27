# Contributing

Thanks for taking the time. This is a **template**, which changes the bar for what
belongs here: a change should help most projects that start from this repo, not just
one of them.

## Getting set up

```bash
pnpm install
pnpm start        # http://localhost:4200
```

Node must satisfy `^22.22.3 || ^24.15.0 || >=26.0.0` — that is what the Angular 22 CLI
requires, and it will refuse to run otherwise.

## Before you open a pull request

Run what CI runs:

```bash
pnpm lint:ci      # biome ci — verifies without rewriting
pnpm test         # the Vitest suite
pnpm build        # production build
```

The pre-commit hook runs `pnpm lint` and `pnpm format`, which **do** rewrite files. That
is deliberate: fix locally, verify in CI.

If you touched the UI, look at it in a browser in **both themes** and at **mobile width**.
Several of the bugs this template has carried were invisible in code review and obvious on
screen.

## What a good change looks like

- **One concern per pull request.** A dependency bump and a refactor in the same branch
  are hard to review and harder to revert.
- **Say what you verified.** Not "tests pass" but what you actually ran, and what you did
  not check.
- **Prefer fixing the cause over silencing the symptom.** If a linter rule fires, the
  first question is whether it is right. Disable a rule only when the framework makes the
  correct pattern unrepresentable — and say so in a comment next to the override.
- **Add a test when the failure would be invisible.** Anything about SEO tags, guards,
  interceptors or cleanup falls in that bucket: a regression there surfaces weeks later,
  somewhere else.

## Code style

Biome handles formatting and linting — do not fight it, and do not add a second formatter.
Beyond that, the conventions the codebase follows:

- **No barrel files.** Import directly (`@core/stores/auth.store`), for tree-shaking.
- **SignalStore for state**, never a service holding private signals. Services are for
  behaviour without state.
- **`*.page.ts` for routable components**, `*.component.ts` for reusable pieces.
- **Features are self-contained and lazy-loaded.** Cross-feature imports mean the shared
  thing belongs in `core/`.

`CLAUDE.md` documents these patterns in more depth.

## Translations

Every user-facing string goes through `ngx-translate`, and `en.json` and `es.json` must
stay in sync. A key present in one and missing in the other renders as the raw key.

## Commit messages

Conventional-commit prefixes (`feat:`, `fix:`, `chore:`, `test:`, `ci:`, `docs:`,
`perf:`). The body matters more than the prefix: explain what was wrong and why this is
the right fix.

## Reporting bugs

Include the version from `package.json` and how to reproduce. If the template does
something the README says it does not, that is a bug in one of the two — both are worth
reporting.
