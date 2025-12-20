# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Angular 21 standalone template project using **zoneless change detection** (default), **NgRx SignalStore** for state management, **TailwindCSS v4** with DaisyUI, internationalization (i18n), and theming capabilities with **ultra-secure authentication** via HttpOnly cookies.

## Commands

### Development
- `pnpm start` - Start development server on http://localhost:4200
- `pnpm build` - Production build (outputs to `dist/angular-template-project`)
- `pnpm watch` - Development build with watch mode

### Testing
- `pnpm test` - Run Vitest tests
- `pnpm test:ui` - Run Vitest with UI
- `pnpm test:coverage` - Generate test coverage report

### Code Quality
- `pnpm lint` - Run Biome linter with auto-fix (includes unsafe fixes)
- `pnpm format` - Run Biome formatter with auto-fix
- `pnpm precommit` - Run both lint and format (used by husky pre-commit hook)

### Angular CLI
- `ng generate component component-name` - Generate new component (SCSS styles by default)
- `ng generate directive|pipe|service|class|guard|interface|enum` - Generate other Angular artifacts

## Architecture

### Core Module Structure

The application uses a feature-based architecture with a central `core` module:

**`src/app/core/`**
- `components/` - Shared core components
- `guards/` - Route guards (`auth.guard.ts`, `anonymous.guard.ts`)
- `interceptors/` - HTTP interceptors (`auth.interceptor.ts` with CSRF support)
- `pipes/` - Shared pipes (`safe-html.pipe.ts`, `safe-url.pipe.ts`)
- `router-store/` - NgRx router integration
  - `router-state-serializer.ts` - Custom router state serialization
  - `router.effects.ts` - Router effects
  - `router.selectors.ts` - Router selectors
  - `router.utils.ts` - Router utilities
- `stores/` - **NgRx SignalStores** (NEW)
  - `auth.store.ts` - Authentication with HttpOnly cookies + CSRF
  - `language.store.ts` - i18n management with signals
  - `theme.store.ts` - Theme switching (light/dark) with signals
- `services/` - Utility services (not for state management)
  - `seo.service.ts` - SEO meta tags management
  - `notify.service.ts` - Notifications (using Notiflix)
- `types/` - TypeScript types and enums
  - `enums/` - API endpoints, fetch statuses, languages, themes
  - `interfaces/` - Shared interfaces

**`src/app/views/`** - Feature modules/views

### State Management (NgRx SignalStore)

**IMPORTANT**: This project uses **NgRx SignalStore** for all global state management. Do NOT create services for state storage.

#### AuthStore (`src/app/core/stores/auth.store.ts`)

Ultra-secure authentication using **HttpOnly + Secure + SameSite cookies**:

```typescript
import { AuthStore } from '@core/stores';

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
import { LanguageStore } from '@core/stores';

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
import { ThemeStore } from '@core/stores';

const themeStore = inject(ThemeStore);

// Read state
themeStore.current(); // signal: Themes
themeStore.isDarkMode(); // computed
themeStore.isLightMode(); // computed

// Actions
themeStore.setTheme(Themes.Dark);
themeStore.toggleTheme();
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
- Managed by `LanguageStore` with localStorage persistence

### Path Aliases

TypeScript path aliases configured in `tsconfig.json`:
- `@app/*` → `src/app/*`
- `@core/*` → `src/app/core/*`
- `@core/environments` → `src/environments/index`

### Configuration

**Environment files:**
- `src/environments/environment.ts` - Development environment
- `src/environments/environment.production.ts` - Production environment

Environment variables include:
- API URL configuration
- Default language and theme
- localStorage keys (only for non-sensitive data like theme/language)
- Timezone settings

**NOTE**: No auth token keys in environment anymore (cookies handle auth).

### Application Bootstrap

**Zoneless change detection** enabled by default in Angular 21.

Router features enabled:
- Component input binding
- View transitions
- In-memory scrolling with anchor scrolling
- Same URL navigation reload

HTTP client configured with:
- Fetch API
- Auth interceptor for CSRF + cookies
- `withCredentials: true` globally

### Code Style

Biome is used for linting and formatting:
- Tab indentation (width: 2)
- Single quotes
- Semicolons required
- ES5 trailing commas
- Arrow function parentheses: as needed

### Testing

- **Vitest** with `@analogjs/vitest-angular`
- Test setup: `src/setup-vitest.ts`
- Run tests with `pnpm test`
- UI mode available with `pnpm test:ui`

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

### Router Integration

Custom router state serializer provides simplified router state with URL, params, query params, and route data accessible through NgRx selectors.

### Guards

- `authGuard` - Protects authenticated routes, checks `AuthStore.isAuthenticated()`
- `anonymousGuard` - Protects routes for non-authenticated users only

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

## Migration Notes

This project was migrated from Angular 18 → 21 with major architectural changes:

### Changes Made:
1. **Angular 18 → 21** (zoneless is now default)
2. **Jest → Vitest** (faster, better DX)
3. **Services → SignalStores** (auth, language, theme)
4. **localStorage auth → HttpOnly cookies** (XSS protection)
5. **TailwindCSS v3 → v4**
6. **NgRx 18 → 21** with SignalStore

### Breaking Changes:
- `AuthService` → `AuthStore`
- `LanguageService` → `LanguageStore`
- `ThemeService` → `ThemeStore`
- Auth tokens NO LONGER in localStorage
- CSRF token required for mutations
- Backend must implement HttpOnly cookie auth

See `MIGRATION_PLAN_ANGULAR_21.md` for full migration details.
