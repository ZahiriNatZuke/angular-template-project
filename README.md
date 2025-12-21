# Angular Template Project

A modern, production-ready Angular 21 template with best practices, security-first authentication, and performance optimizations built-in.

## Overview

This template provides a solid foundation for building scalable Angular applications with enterprise-grade features including zoneless change detection, signal-based state management, ultra-secure authentication, and internationalization support.

## Key Features

### Modern Angular Stack
- **Angular 21** with standalone components (no modules)
- **Zoneless change detection** for optimal performance
- **Signal-based reactivity** throughout the application
- **NgRx SignalStore** for state management
- **TailwindCSS v4** with DaisyUI components
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
- Light/Dark mode with system preference detection
- Cookie-based theme persistence
- TailwindCSS v4 integration
- DaisyUI component library

### SEO Optimization
- Reactive SEO service with automatic meta tag updates
- Router-based SEO integration with translation support
- Dynamic title and description per route
- Waits for translations to load before applying SEO tags

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
│   ├── app.component.ts         # Root component
│   ├── app.config.ts            # Application configuration
│   └── app.routes.ts            # Application routes
├── assets/
│   └── i18n/                    # Translation files (en.json, es.json)
├── environments/                # Environment configurations
│   ├── environment.ts           # Development environment
│   └── environment.production.ts # Production environment
└── styles.scss                  # Global styles
```

### Feature Module Structure

This template follows a **feature-first architecture**, where each feature is organized as a self-contained module with its own structure similar to `core/`:

```
app/features/
├── authentication/              # Example: Authentication feature
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
│   └── authentication.routes.ts # Feature routes
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
    loadChildren: () => import('./features/authentication/authentication.routes')
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes')
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

- Node.js 18+
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

### Code Quality

```bash
# Run linter with auto-fix
pnpm lint

# Run formatter
pnpm format

# Run both (pre-commit hook)
pnpm precommit
```

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

## Styling

### TailwindCSS v4

Use Tailwind utility classes throughout the application:

```html
<button class="btn btn-primary">Click me</button>
<div class="card bg-base-100 shadow-xl">...</div>
```

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

## License

MIT License - feel free to use this template for any project.

## Support

For issues or questions about this template, please refer to:
- Angular CLI: `ng help` or [Angular CLI Docs](https://angular.io/cli)
- Project-specific patterns: See `CLAUDE.md`
