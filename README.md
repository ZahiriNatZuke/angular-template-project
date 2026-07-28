# Angular Template Project

[![CI](https://github.com/ZahiriNatZuke/angular-template-project/actions/workflows/ci.yml/badge.svg)](https://github.com/ZahiriNatZuke/angular-template-project/actions/workflows/ci.yml)

A modern, production-ready Angular 22 template with best practices, security-first authentication, and performance optimizations built-in.

## Overview

This template provides a solid foundation for building scalable Angular applications with enterprise-grade features including zoneless change detection, signal-based state management, ultra-secure authentication, and internationalization support.

Everything described below is wired up and covered by tests — the template runs, builds and passes CI as-is.

## What you get out of the box

| Route | What it demonstrates |
|---|---|
| `/` | Lazy-loaded landing page with the custom light/dark themes |
| `/auth/login` | Reactive-forms login guarded by `anonymousGuard`, driven by `AuthStore` |
| `/dashboard` | Protected route behind `authGuard`, redirecting with a `returnUrl` |
| anything else | A real 404 page that keeps the attempted URL and marks itself `noindex` |

Plus **42 tests** over the three stores, the CSRF interceptor and both guards, and a
**GitHub Actions workflow** running lint, tests (Node 22 and 24) and a production build.

## Key Features

### Modern Angular Stack
- **Angular 22** with standalone components (no modules)
- **TypeScript 6** in strict mode
- **Zoneless change detection** for optimal performance
- **Signal-based reactivity** throughout the application
- **NgRx SignalStore** for state management
- **TailwindCSS v4** with DaisyUI and **Lucide** icons
- **Vitest** for fast unit testing

### Ultra-Secure Authentication
- **HttpOnly + Secure cookies** for token storage (immune to XSS attacks)
- **CSRF protection** with token rotation on mutations
- **Automatic session validation** on application startup
- **No tokens in localStorage** - zero client-side storage of sensitive data
- Backend-agnostic authentication flow (see `docs/BACKEND_AUTH_REQUIREMENTS.md`)

### State Management
- **NgRx SignalStore** for global state (auth, language, theme)
- **No services for state** - follows modern Angular patterns
- Fully reactive with signals and computed values
- Type-safe state updates with `patchState`

### Internationalization (i18n)
- **ngx-translate** integration with reactive language switching
- Multi-language support (English/Spanish included)
- Dynamic locale configuration
- Translation files in `src/assets/i18n/*.json`

### Theming
- Custom light and dark themes defined in `src/styles.scss`, not DaisyUI's defaults
- A deliberately contained palette: one brand colour, with semantic colours reserved for state
- System preference detection with cookie-based persistence
- Applied through the `data-theme` attribute, so every DaisyUI component follows along

### SEO Optimization
- Reactive SEO service with automatic meta tag updates
- Router-based SEO integration with translation support
- Dynamic title and description per route
- Waits for translations to load before applying SEO tags

### Accessibility
- **Skip link** as the first tab stop, so reaching the content by keyboard does not
  mean walking through the whole navbar on every page
- **Focus moved to the main landmark on each navigation** — a single-page app does not
  do this on its own, so a screen reader never announces that the page changed
- Semantic landmarks (`header`, `main`, `footer`) in the shell
- Covered by end-to-end tests: focus behaviour is only observable in a real browser

### Developer Experience
- **Biome** for ultra-fast linting and formatting
- **Husky** pre-commit hooks for code quality
- **pnpm** for efficient package management
- Path aliases (`@app/*`, `@core/*`, `@environments/*`)
- No barrel files for better tree-shaking

## Project Structure

```
src/
├── app/
│   ├── core/                    # Core application features
│   │   ├── guards/              # Route guards (auth, anonymous)
│   │   ├── interceptors/        # HTTP interceptors (auth with CSRF)
│   │   ├── pipes/               # Shared pipes (safe-html, safe-url)
│   │   ├── services/            # Utility services (SEO, notifications, router state)
│   │   ├── stores/              # NgRx SignalStores (auth, language, theme)
│   │   ├── types/               # TypeScript types and enums
│   │   │   ├── enums/           # Languages, Themes
│   │   │   └── interfaces/      # Shared interfaces (SEO)
│   │   └── utils/               # Utility functions (cookies, router-seo)
│   ├── features/                # Feature modules (see structure below)
│   │   ├── auth/                # Included example: login page (anonymousGuard)
│   │   ├── dashboard/           # Included example: protected page (authGuard)
│   │   └── home/                # Included example: lazy-loaded landing page
│   ├── app.component.ts         # Root shell (navbar + router-outlet + footer)
│   ├── app.config.ts            # Application configuration
│   └── app.routes.ts            # Application routes
├── assets/
│   └── i18n/                    # Translation files (en.json, es.json)
├── environments/                # Environment configurations
│   ├── environment.ts           # Development environment
│   └── environment.production.ts # Production environment
├── setup-vitest.ts              # Vitest/TestBed bootstrap (zoneless)
└── styles.scss                  # Global styles
```

### Feature Module Structure

This template follows a **feature-first architecture**, where each feature is organized as a self-contained module with its own structure similar to `core/`:

```
app/features/
├── auth/                        # Included in the template
│   ├── components/              # Feature-specific components
│   │   ├── login-form/
│   │   └── register-form/
│   ├── pages/                   # Feature pages/views
│   │   ├── login.page.ts
│   │   └── register.page.ts
│   ├── services/                # Feature-specific services
│   │   └── auth-api.service.ts
│   ├── stores/                  # Feature-specific stores (if needed)
│   │   └── auth-form.store.ts
│   ├── types/                   # Feature-specific types
│   │   ├── models/              # Data models
│   │   └── enums/               # Feature enums
│   ├── guards/                  # Feature-specific guards
│   ├── utils/                   # Feature-specific utilities
│   └── auth.routes.ts           # Feature routes
│
└── products/                    # Example: Products feature
    ├── components/
    │   ├── product-card/
    │   └── product-list/
    ├── pages/
    │   ├── product-detail.page.ts
    │   └── products-list.page.ts
    ├── services/
    │   └── products-api.service.ts
    ├── stores/
    │   └── products.store.ts
    ├── types/
    │   └── models/
    │       └── product.model.ts
    └── products.routes.ts
```

#### Feature Module Guidelines

**1. Self-Contained Features**
- Each feature should be independent and contain everything it needs
- Avoid cross-feature dependencies (use `core/` for shared functionality)
- Features can be developed, tested, and maintained independently

**2. Lazy Loading**
Features should be lazy-loaded for optimal performance:

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes')
  },
  // The empty path goes last: with `loadChildren` it matches by prefix and
  // would otherwise swallow every URL.
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes')
  }
];
```

**3. Feature Routes**
Each feature defines its own routes:

```typescript
// features/authentication/authentication.routes.ts
import { Routes } from '@angular/router';
import { LoginPage } from './pages/login.page';
import { RegisterPage } from './pages/register.page';

export default [
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage }
] as Routes;
```

**4. Core vs Feature**
- **Core**: App-wide singleton services, global state, shared utilities
- **Features**: Domain-specific logic, UI components, feature state
- **Shared** (if needed): Reusable UI components used across multiple features

**5. Naming Conventions**
- Pages: `*.page.ts` (routable components)
- Components: `*.component.ts` (reusable UI pieces)
- Stores: `*.store.ts` (feature-specific state)
- Services: `*.service.ts` (feature-specific logic)

**Benefits of Feature-First Architecture:**
- ✅ Better code organization and maintainability
- ✅ Clear boundaries between features
- ✅ Team can work on features independently
- ✅ Easier to test, refactor, or remove features
- ✅ Natural lazy-loading boundaries
- ✅ Scales well with application growth

## Getting Started

### Prerequisites

- Node.js `^22.22.3 || ^24.15.0 || >=26.0.0` (required by the Angular 22 CLI)
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm start

# Navigate to http://localhost:4200
```

### Build

```bash
# Production build
pnpm build

# Build output in dist/angular-template-project
```

### Testing

```bash
# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

The suite covers the three SignalStores, the CSRF interceptor and both guards —
100% of lines and functions over the exercised code. `src/setup-vitest.ts` boots the
TestBed in zoneless mode, which is required here: the project has no `zone.js`
dependency at all.

### Code Quality

```bash
# Run linter with auto-fix
pnpm lint

# Run formatter
pnpm format

# Run both (pre-commit hook)
pnpm precommit

# Check without writing (what CI runs)
pnpm lint:ci
```

## Continuous Integration

`.github/workflows/ci.yml` runs on every push to `main` and on every pull request:

- **Lint & format** — `biome ci`, which verifies without rewriting files
- **Test** — the Vitest suite on Node 22 and Node 24
- **Production build** — `pnpm build`, uploading `dist/` as an artifact

Concurrent runs on the same branch cancel the previous one, so a burst of pushes
only pays for the last commit.

It also runs **every Monday on a schedule**. A template can break without a single commit —
an action changes, a runner bumps Node, a package is unpublished — and the weekly run
surfaces that before the next person to clone the repo does.

### Quality gates

- **Coverage thresholds** (`vitest.config.ts`): the test job runs `pnpm test:coverage`, so
  coverage cannot silently regress. The thresholds measure the files the tests import, not
  all of `src/` — they prevent decay of what is covered, they do not claim full coverage.
- **Bundle budgets** (`angular.json`): the initial bundle warns at 420 kB and fails at
  500 kB. The current build sits around 368 kB.
- **Dependabot** (`.github/dependabot.yml`): weekly, grouped by ecosystem so an Angular
  bump arrives as one coherent pull request instead of a dozen that fail CI on their own.
  TypeScript is held below 6.1 — Angular 22 declares `typescript: ">=6.0 <6.1"`, and npm's
  `latest` is already past that.

## Commands Reference

### Development
- `pnpm start` - Start dev server on http://localhost:4200
- `pnpm build` - Production build
- `pnpm watch` - Development build with watch mode

### Testing
- `pnpm test` - Run Vitest tests
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Generate coverage report

### Code Quality
- `pnpm lint` - Biome linter with auto-fix
- `pnpm lint:ci` - Biome check without writing (used by CI)
- `pnpm format` - Biome formatter
- `pnpm precommit` - Lint + format (husky hook)

### Angular CLI
- `ng generate component name` - Generate component
- `ng generate service name` - Generate service
- `ng generate guard name` - Generate guard

## Configuration

### Environment Variables

Located in `src/environments/`:

```typescript
{
  production: boolean,
  apiUrl: string,                    // Backend API URL
  defaultTitle: string,              // Default page title
  defaultLanguage: Languages,        // Default language (EN/ES)
  languageKey: string,               // Cookie key for language
  themeKey: string,                  // Cookie key for theme
  timeZone: string                   // Default timezone
}
```

### Path Aliases

Configured in `tsconfig.json`:

```typescript
"@app/*": ["src/app/*"]              // Application root
"@core/*": ["src/app/core/*"]        // Core features
"@environments/*": ["src/environments/*"]  // Environment configs
```

## Authentication Flow

This template uses **HttpOnly cookies** for maximum security:

1. User logs in → Backend sets HttpOnly cookie with JWT
2. Frontend automatically sends cookies with every request
3. CSRF token fetched and attached to mutations (POST/PUT/DELETE/PATCH)
4. Session validated on app startup
5. Automatic logout on 401 (expired session)

**Backend Requirements**: See `docs/BACKEND_AUTH_REQUIREMENTS.md` for complete backend implementation guide.

## State Management Pattern

### Using SignalStores

```typescript
// Inject store in component
export class MyComponent {
  authStore = inject(AuthStore);
  themeStore = inject(ThemeStore);
  languageStore = inject(LanguageStore);

  // Access signals in template
  isAuth = this.authStore.isAuthenticated;
  isDark = this.themeStore.isDarkMode;
  currentLang = this.languageStore.current;
}

// Call actions
this.authStore.login({ email, password, rememberMe });
this.themeStore.toggleTheme();
this.languageStore.setLanguage(Languages.English);
```

### Available Stores

**AuthStore** (`@core/stores/auth.store.ts`):
- `isAuthenticated()`, `user()`, `csrfToken()`
- `login()`, `logout()`, `refreshUser()`, `checkAuth()`

**LanguageStore** (`@core/stores/language.store.ts`):
- `current()`, `isEnglish()`, `isSpanish()`
- `setLanguage()`, `toggleLanguage()`

**ThemeStore** (`@core/stores/theme.store.ts`):
- `current()`, `isDarkMode()`, `isLightMode()`
- `setTheme()`, `toggleTheme()`

## Routing & SEO

Routes are defined in `app.routes.ts` with SEO metadata:

```typescript
{
  path: 'home',
  component: HomeComponent,
  data: {
    title: 'routes.home.title',           // Translation key
    description: 'routes.home.description' // Translation key
  }
}
```

SEO tags are automatically updated on route changes and wait for translations to load.

### The 404 route

The wildcard route renders `features/not-found` instead of redirecting to `/`, so a broken
link is visible rather than silently swallowed. The page keeps the attempted URL in the
address bar and displays it.

Because this is a SPA, the server still answers **HTTP 200** for that URL — the 404 only
exists client-side. The page therefore sets `<meta name="robots" content="noindex, follow">`
so crawlers don't index it as real content, and removes the tag on destroy so the directive
doesn't leak into the next navigation. If you need a true 404 status, your host has to
return it before Angular boots.

## Styling

### TailwindCSS v4 and DaisyUI

Use Tailwind utility classes throughout the application:

```html
<button class="btn btn-primary">Click me</button>
<div class="card border border-base-300 bg-base-100">...</div>
```

### Custom themes

The light and dark themes are defined in `src/styles.scss` with `@plugin "daisyui/theme"`,
replacing DaisyUI's built-in ones. To rebrand the template, change the colour tokens there
and every component follows:

```css
@plugin "daisyui/theme" {
  name: 'light';
  --color-primary: oklch(50% 0.23 300);
  --color-base-100: oklch(100% 0 0);
  /* … */
}
```

> **Note:** DaisyUI v5 renamed its theme variables. If you find older snippets using
> `--p`, `--b1` or `--bc`, they are v4 syntax and will be silently ignored.

### Icons

Icons come from `@lucide/angular`. Each icon is a standalone component with an attribute
selector, so you only bundle the ones you import:

```typescript
import { LucideShieldCheck } from '@lucide/angular';

@Component({ imports: [LucideShieldCheck], /* … */ })
```

```html
<svg lucideShieldCheck class="size-5"></svg>
```

For icons chosen at runtime, import `LucideDynamicIcon` and bind `[lucideIcon]`.

### Dark Mode

Theme is managed by `ThemeStore` and applies via `data-theme` attribute:

```typescript
// Toggle theme
this.themeStore.toggleTheme();

// Set specific theme
this.themeStore.setTheme(Themes.Dark);
```

## Best Practices Implemented

### Security
- ✅ HttpOnly cookies for authentication
- ✅ CSRF protection on all mutations
- ✅ No sensitive data in localStorage
- ✅ XSS-safe pipes (safe-html, safe-url)
- ✅ Automatic session validation

### Performance
- ✅ Zoneless change detection
- ✅ Signal-based reactivity
- ✅ No barrel files (better tree-shaking)
- ✅ Lazy loading ready
- ✅ Fetch API instead of XMLHttpRequest

### Code Quality
- ✅ Strict TypeScript configuration
- ✅ Biome for fast linting/formatting
- ✅ Pre-commit hooks with Husky
- ✅ Path aliases for clean imports
- ✅ Consistent code style

### Architecture
- ✅ Feature-based folder structure
- ✅ Standalone components (no NgModules)
- ✅ SignalStore for state management
- ✅ Reactive patterns throughout
- ✅ Separation of concerns

### Developer Experience
- ✅ Fast testing with Vitest
- ✅ Type-safe routing with input binding
- ✅ Auto-reload on file changes
- ✅ Comprehensive error handling
- ✅ Clear documentation
- ✅ CI on every pull request

## Notes and known limitations

- **NgRx has no Angular 22 release yet.** `@ngrx/signals` still declares a peer on
  `@angular/core: ^21.0.0`, so installing prints a peer warning. The stores work — the
  test suite exercises all three — but the warning stays until NgRx ships v22.
- **`@angular-devkit/build-angular` is still pulled in transitively.** The project uses
  `@angular/build`, but Analog declares the webpack builder as an optional peer and pnpm
  auto-installs it. Harmless, just extra install weight.
- **Icon packages are optional.** `lucide` and `@lucide/angular` power the landing page's
  icons; drop them if you bring your own icon set.

## Additional Resources

- **CLAUDE.md** - Detailed project documentation and patterns
- **docs/BACKEND_AUTH_REQUIREMENTS.md** - Backend auth implementation guide
- [Angular Documentation](https://angular.dev)
- [NgRx SignalStore](https://ngrx.io/guide/signals)
- [TailwindCSS v4](https://tailwindcss.com)
- [Vitest](https://vitest.dev)
- [Angular 2025 Project Structure Guide](https://www.ismaelramos.dev/blog/angular-2025-project-structure-with-the-features-approach/)
- [Angular Feature-First Architecture](https://www.angulararchitects.io/blog/modern-architectures-with-angular-part-1-strategic-design-with-sheriff-and-standalone-components/)

## Author

**Yohan González Almaguer**
- Email: yohan.gonzalez.almaguer@gmail.com
- GitHub: [@ZahiriNatZuke](https://github.com/ZahiriNatZuke)
- LinkedIn: [Yohan González Almaguer](https://www.linkedin.com/in/yohan-gonz%C3%A1lez-almaguer)

This template was created with modern Angular best practices, focusing on security, performance, and developer experience.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, what CI checks, and the conventions the
codebase follows. Notable changes are tracked in [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE) — feel free to use this template for any project.

## Support

For issues or questions about this template, please refer to:
- Angular CLI: `ng help` or [Angular CLI Docs](https://angular.io/cli)
- Project-specific patterns: See `CLAUDE.md`
