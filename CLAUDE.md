# CLAUDE.md

Guidance for any coding agent working in this repository — Claude Code, Codex, Copilot
or whatever comes next. This is the one versioned instruction file: if you keep a local
`AGENTS.md` for another tool, mirror it from here instead of writing it by hand. An
unversioned copy of this file went stale and still described the project as Angular 21.

## Project Overview

Angular 22 standalone template project using **zoneless change detection** (default), **NgRx SignalStore** for state management, **TailwindCSS v4** with DaisyUI, internationalization (i18n), theming capabilities, and **ultra-secure authentication** via HttpOnly cookies.

This is a **production-ready template** designed for building scalable Angular applications with modern best practices, security-first authentication, and optimal performance.

## Commands

### Development
- `pnpm start` - Start development server on http://localhost:4200
- `pnpm build` - Production build (outputs to `dist/angular-template-project`)
- `pnpm watch` - Development build with watch mode

### Testing
- `pnpm test` - Run Vitest unit tests
- `pnpm test:ui` - Run Vitest with UI
- `pnpm test:coverage` - Run with coverage thresholds enforced (this is what CI runs)
- `pnpm e2e` - Run the Playwright end-to-end suite
- `pnpm e2e:ui` - Playwright in interactive mode
- `pnpm e2e:report` - Open the report of the last run

### Code Quality
- `pnpm lint` - Run Biome linter with auto-fix (includes unsafe fixes)
- `pnpm lint:ci` - Run Biome check without writing files (used by CI)
- `pnpm format` - Run Biome formatter with auto-fix
- `pnpm precommit` - Run both lint and format (used by husky pre-commit hook)

### Angular CLI
- `ng generate component component-name` - Generate new component (SCSS styles by default)
- `ng generate directive|pipe|service|class|guard|interface|enum` - Generate other Angular artifacts

## Architecture

### Project Structure

The application follows a **feature-first architecture** with a central `core` module for shared functionality:

```
src/app/
├── core/                    # Global shared functionality
│   ├── guards/              # Route guards
│   ├── interceptors/        # HTTP interceptors
│   ├── pipes/               # Shared pipes
│   ├── services/            # Utility services (NOT for state)
│   ├── stores/              # NgRx SignalStores (global state)
│   ├── types/               # TypeScript types and enums
│   └── utils/               # Utility functions
└── features/                # Feature modules (domain-specific)
    └── [feature-name]/      # Each feature is self-contained
```

### Core Module Structure

**`src/app/core/`**
- `guards/` - Route guards (`auth.guard.ts`, `anonymous.guard.ts`)
- `interceptors/` - HTTP interceptors (`auth.interceptor.ts` with CSRF support)
- `pipes/` - Shared pipes (`safe-html.pipe.ts`, `safe-url.pipe.ts`)
- `services/` - Utility services (NOT for state management)
  - `seo.service.ts` - SEO meta tags management with i18n support
  - `router-state.service.ts` - Router state management with signals
  - `notify.service.ts` - Notifications (using Notiflix)
- `stores/` - **NgRx SignalStores** for global state
  - `auth.store.ts` - Authentication with HttpOnly cookies + CSRF
  - `language.store.ts` - i18n management with signals
  - `theme.store.ts` - Theme switching (light/dark) with signals
- `types/` - TypeScript types and enums
  - `enums/` - Languages, Themes
  - `interfaces/` - Shared interfaces (Seo)
- `utils/` - Utility functions
  - `cookie.utils.ts` - Cookie management utilities
  - `router-seo.init.ts` - Router SEO initialization with translation support

### Feature Module Structure

Each feature should be organized as a **self-contained module** with structure similar to `core/`:

```
features/[feature-name]/
├── components/          # Feature-specific components
├── pages/               # Feature pages/views (*.page.ts)
├── services/            # Feature-specific services
├── stores/              # Feature-specific stores (if needed)
├── types/               # Feature-specific types
│   ├── models/          # Data models
│   └── enums/           # Feature enums
├── guards/              # Feature-specific guards
├── utils/               # Feature-specific utilities
└── [feature-name].routes.ts  # Feature routes
```

**Feature Guidelines**:
1. **Self-contained**: Each feature should be independent
2. **No barrel files**: Use direct imports for better tree-shaking
3. **Lazy-loaded**: Features should be lazy-loaded via routes
4. **Minimal dependencies**: Avoid cross-feature dependencies (use `core/` instead)
5. **Naming conventions**: Use `*.page.ts` for routable components

**Example lazy-loaded feature**:
```typescript
// app.routes.ts
{
  path: 'products',
  loadChildren: () => import('./features/products/products.routes')
}
```

### State Management (NgRx SignalStore)

**IMPORTANT**: This project uses **NgRx SignalStore** for all global state management. Do NOT create services for state storage.

#### AuthStore (`src/app/core/stores/auth.store.ts`)

Ultra-secure authentication using **HttpOnly + Secure + SameSite cookies**:

```typescript
import { AuthStore } from '@core/stores/auth.store';

// Inject store
const authStore = inject(AuthStore);

// Read state
authStore.isAuthenticated(); // signal
authStore.user(); // signal
authStore.isAnonymous(); // computed
authStore.userName(); // computed

// Actions
authStore.login({ email, password, rememberMe });
authStore.logout();
authStore.refreshUser();
authStore.fetchCsrfToken();
authStore.checkAuth();
```

**Key features**:
- Zero tokens in localStorage (immune to XSS)
- HttpOnly cookies for JWT storage
- CSRF protection with token rotation
- Automatic session validation on init
- Refresh token rotation ready

#### LanguageStore (`src/app/core/stores/language.store.ts`)

```typescript
import { LanguageStore } from '@core/stores/language.store';

const languageStore = inject(LanguageStore);

// Read state
languageStore.current(); // signal: Languages
languageStore.isEnglish(); // computed
languageStore.isSpanish(); // computed

// Actions
languageStore.setLanguage(Languages.English);
languageStore.toggleLanguage();
```

#### ThemeStore (`src/app/core/stores/theme.store.ts`)

```typescript
import { ThemeStore } from '@core/stores/theme.store';

const themeStore = inject(ThemeStore);

// Read state
themeStore.current(); // signal: Themes
themeStore.isDarkMode(); // computed
themeStore.isLightMode(); // computed

// Actions
themeStore.setTheme(Themes.Dark);
themeStore.toggleTheme();
```

### Router & SEO Integration

The template includes **reactive SEO management** that waits for translations to load:

**`src/app/core/utils/router-seo.init.ts`**:
- Automatically updates page title and meta description on route changes
- Waits for translations to load before applying SEO tags
- Uses `TranslateService.onLangChange` for reactivity
- Initialized in `app.config.ts` via `provideAppInitializer`

**Route configuration with SEO**:
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

### Styling

- **TailwindCSS v4** with DaisyUI v5 component library
- **Dark mode**: Class-based with `[data-theme="dark"]` attribute
- **SCSS**: Default style language for components
- Tailwind plugins: typography, forms, aspect-ratio, container-queries

### Authentication Architecture

**CRITICAL**: This app uses **HttpOnly cookies** for authentication, NOT localStorage.

#### Frontend (Automatic)
- Cookies sent automatically with `withCredentials: true`
- No manual token handling needed
- CSRF token included in POST/PUT/DELETE/PATCH requests

#### Backend Requirements
See `docs/BACKEND_AUTH_REQUIREMENTS.md` for complete implementation guide.

**Quick overview**:
- `POST /api/auth/login` - Returns Set-Cookie headers (HttpOnly)
- `GET /api/auth/csrf` - Returns CSRF token
- `GET /api/auth/me` - Validates session
- `POST /api/auth/logout` - Clears cookies
- All endpoints must validate CSRF on mutations

**Auth Interceptor** (`src/app/core/interceptors/auth.interceptor.ts`):
- Adds `withCredentials: true` to all requests
- Adds `X-CSRF-Token` header to POST/PUT/DELETE/PATCH
- Handles 401 (logout) and 403 (CSRF invalid)

### Internationalization

- **ngx-translate**: Translation management
- Translation files: `src/assets/i18n/*.json`
- Supported languages defined in `Languages` enum
- Managed by `LanguageStore` with cookie persistence
- SEO integration waits for translations before updating meta tags

### Path Aliases

**IMPORTANT**: This project does NOT use barrel files (index.ts) for better tree-shaking.

TypeScript path aliases configured in `tsconfig.json`:
- `@app/*` → `src/app/*`
- `@core/*` → `src/app/core/*`
- `@environments/*` → `src/environments/*`

**Always use direct imports**:
```typescript
// ✅ DO THIS
import { AuthStore } from '@core/stores/auth.store';
import { Languages } from '@core/types/enums/languages';
import { environment } from '@environments/environment';

// ❌ DON'T DO THIS (no barrel files)
import { AuthStore } from '@core/stores';
import { Languages } from '@core/types';
import { environment } from '@core/environments';
```

### Configuration

**Environment files:**
- `src/environments/environment.ts` - Development environment
- `src/environments/environment.production.ts` - Production environment

Environment variables include:
- API URL configuration
- Default language and theme
- Cookie keys (only for non-sensitive data like theme/language)
- Timezone settings

**NOTE**: No auth token keys in environment (cookies handle auth).

### Application Bootstrap

**Zoneless change detection** enabled by default in Angular 22.

Router features enabled:
- Component input binding
- View transitions
- In-memory scrolling with anchor scrolling
- Same URL navigation reload

HTTP client configured with:
- Fetch API
- Auth interceptor for CSRF + cookies
- `withCredentials: true` globally

**App initialization** (`app.config.ts`):
```typescript
provideAppInitializer(() => {
  inject(LanguageStore);  // Init language from cookie
  inject(ThemeStore);     // Init theme from cookie
  initRouterSeoUpdates(); // Init SEO with translation support
})
```

### Code Style

Biome is used for linting and formatting:
- Tab indentation (width: 2)
- Single quotes
- Semicolons required
- ES5 trailing commas
- Arrow function parentheses: as needed

### Testing

Two suites, deliberately separated by directory so neither runner picks up the
other's specs:

- **Unit — Vitest** with `@analogjs/vitest-angular`. Specs live next to the code as
  `*.spec.ts` under `src/`. Setup in `src/setup-vitest.ts`. Coverage thresholds are
  enforced in CI, so coverage cannot silently regress.
- **End-to-end — Playwright**, in `e2e/` as `*.e2e.spec.ts`, on a desktop and a mobile
  viewport. `@playwright/test` is pinned rather than floating, because the browser
  binaries have to match the package version.

The auth flows are exercised against responses intercepted with `page.route`, so the
session paths are testable without standing up a backend. That is a stopgap, not a
substitute: `apiUrl` points at a backend that does not exist in this repo.

Write end-to-end tests for what only a real browser shows. Two of the worst defects
this template ever had — the store never validating the session at startup, and the
CSRF token being wiped between two startup requests — were invisible to unit tests
and to reading the code.

### Line Endings

`.gitattributes` normalises everything to LF. Do not remove it: Biome formats to LF,
so on Windows with `core.autocrlf=true` every file in the project reads as
mis-formatted, `pnpm lint:ci` fails locally while CI passes, and the pre-commit hook
rewrites the whole repository on each commit.

### Git Hooks

Husky pre-commit hook runs:
1. `pnpm lint` - Biome linter
2. `pnpm format` - Biome formatter

## Key Implementation Patterns

### Using SignalStores

**DO** inject stores directly in components:
```typescript
export class MyComponent {
  authStore = inject(AuthStore);
  themeStore = inject(ThemeStore);
  languageStore = inject(LanguageStore);

  // Use signals in template
  isAuth = this.authStore.isAuthenticated;
  isDark = this.themeStore.isDarkMode;
}
```

**DON'T** create services for global state:
```typescript
// ❌ DON'T DO THIS
@Injectable()
export class MyStateService {
  private state = signal({...});
}

// ✅ DO THIS INSTEAD
// Create a SignalStore in src/app/core/stores/
```

### Feature Development Pattern

When creating a new feature:

1. **Create feature folder**:
   ```
   features/my-feature/
   ├── pages/
   ├── components/
   ├── services/
   └── my-feature.routes.ts
   ```

2. **Define routes**:
   ```typescript
   // features/my-feature/my-feature.routes.ts
   import { Routes } from '@angular/router';

   export default [
     { path: '', component: MyFeaturePage }
   ] as Routes;
   ```

3. **Lazy load in main routes**:
   ```typescript
   // app.routes.ts
   {
     path: 'my-feature',
     loadChildren: () => import('./features/my-feature/my-feature.routes')
   }
   ```

### Router Integration

Router state is managed by `RouterStateService` using signals (no NgRx needed):

```typescript
import { RouterStateService } from '@core/services/router-state.service';

const routerState = inject(RouterStateService);

// Access route data
routerState.url();        // current URL
routerState.params();     // route params
routerState.queryParams(); // query params
routerState.data();       // route data
```

### Guards

- `authGuard` - Protects authenticated routes, checks `AuthStore.isAuthenticated()`
- `anonymousGuard` - Protects routes for non-authenticated users only

Both guards use direct imports:
```typescript
import { authGuard } from '@core/guards/auth.guard';
import { anonymousGuard } from '@core/guards/anonymous.guard';
```

### HTTP Interceptor

`authInterceptor` automatically:
- Includes `withCredentials: true` for cookies
- Attaches CSRF tokens to mutating requests
- Handles 401 (expired session) and 403 (invalid CSRF)

## Security Best Practices

### Authentication
- ✅ Tokens in HttpOnly cookies only
- ✅ CSRF protection on all mutations
- ✅ Automatic logout on 401
- ✅ Refresh token rotation ready
- ❌ Never store auth tokens in localStorage
- ❌ Never send tokens in response bodies

### CORS
Frontend expects backend to have:
```javascript
credentials: true // Allow cookies
origin: 'http://localhost:4200' // Frontend URL
```

### Environment Variables
- Only store non-sensitive config (theme, language keys)
- Never store API keys or secrets in frontend

## Package Manager

This project uses **pnpm**. Always use `pnpm` commands, not `npm` or `yarn`.

## Best Practices Summary

### Architecture
- ✅ Feature-first structure
- ✅ No barrel files (direct imports)
- ✅ Lazy-loaded features
- ✅ SignalStore for state
- ✅ Services only for utilities (not state)

### Security
- ✅ HttpOnly cookies for auth
- ✅ CSRF protection
- ✅ XSS-safe pipes
- ✅ No sensitive data in localStorage

### Performance
- ✅ Zoneless change detection
- ✅ Signal-based reactivity
- ✅ Better tree-shaking (no barrels)
- ✅ Lazy loading
- ✅ Fetch API

### Code Quality
- ✅ Strict TypeScript
- ✅ Biome linting/formatting
- ✅ Pre-commit hooks
- ✅ Direct imports
- ✅ Consistent naming

### Developer Experience
- ✅ Fast testing (Vitest)
- ✅ Type-safe routing
- ✅ Path aliases
- ✅ Clear documentation
- ✅ Modern patterns

## Migration Notes

This project represents the modern Angular 22 architecture:

### Key Architectural Decisions:
1. **Zoneless change detection** - Default in Angular 22
2. **SignalStore over services** - Modern state management
3. **HttpOnly cookies** - XSS protection for auth
4. **No barrel files** - Better tree-shaking
5. **Feature-first** - Scalable architecture
6. **Vitest over Jest** - Faster testing

### Breaking Changes from Traditional Angular:
- No NgModules (standalone components only)
- No `index.ts` barrel files
- No localStorage for auth tokens
- CSRF token required for mutations
- Router state via signals (not NgRx router store)

For complete backend auth implementation, see `docs/BACKEND_AUTH_REQUIREMENTS.md`.
