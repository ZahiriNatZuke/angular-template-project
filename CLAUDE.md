# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Angular 18 standalone template project using zoneless change detection, NgRx router store, TailwindCSS with DaisyUI, internationalization (i18n), and theming capabilities.

## Commands

### Development
- `pnpm start` - Start development server on http://localhost:4200
- `pnpm build` - Production build (outputs to `dist/angular-template-project`)
- `pnpm watch` - Development build with watch mode

### Testing
- `pnpm test` - Run Jest tests
- `pnpm test:watch` - Run Jest in watch mode
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
- `interceptors/` - HTTP interceptors (`auth.interceptor.ts`)
- `pipes/` - Shared pipes (`safe-html.pipe.ts`, `safe-url.pipe.ts`)
- `router-store/` - NgRx router integration
  - `router-state-serializer.ts` - Custom router state serialization
  - `router.effects.ts` - Router effects
  - `router.selectors.ts` - Router selectors
  - `router.utils.ts` - Router utilities
- `services/` - Core services
  - `auth.service.ts` - Authentication with JWT and refresh tokens
  - `language.service.ts` - i18n management
  - `theme.service.ts` - Theme switching (light/dark)
  - `seo.service.ts` - SEO meta tags management
  - `notify.service.ts` - Notifications (using Notiflix)
- `types/` - TypeScript types and enums
  - `enums/` - API endpoints, fetch statuses, languages, themes
  - `interfaces/` - Shared interfaces
- `utils/` - Utility functions
  - `app-initializer.ts` - App initialization logic (loads language, theme, auth state)

**`src/app/views/`** - Feature modules/views

### State Management

- **NgRx Router Store**: Integrated for router state management
- **Custom Router State Serializer**: Captures URL, query params, route params, and data
- **Signals**: Using Angular signals for reactive state (auth, language, theme services)

### Styling

- **TailwindCSS** with DaisyUI component library
- **Dark mode**: Class-based with `[data-theme="dark"]` attribute
- **SCSS**: Default style language for components
- Tailwind plugins: typography, forms, aspect-ratio, container-queries

### Internationalization

- **ngx-translate**: Translation management
- Translation files: `src/assets/i18n/*.json`
- Supported languages defined in `Languages` enum
- Default language: English (configurable in environment)

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
- Auth token keys (localStorage)
- Default language and theme
- Timezone settings

### Application Bootstrap

Zoneless change detection enabled via `provideExperimentalZonelessChangeDetection()`.

Router features enabled:
- Component input binding
- View transitions
- In-memory scrolling with anchor scrolling
- Same URL navigation reload

HTTP client configured with:
- Fetch API
- Auth interceptor for JWT tokens

### Code Style

Biome is used for linting and formatting:
- Tab indentation (width: 2)
- Single quotes
- Semicolons required
- ES5 trailing commas
- Arrow function parentheses: as needed

### Testing

- **Jest** with `jest-preset-angular`
- Test setup: `setup-jest.ts`
- Run tests with `pnpm test`

### Git Hooks

Husky pre-commit hook runs:
1. `pnpm lint` - Biome linter
2. `pnpm format` - Biome formatter

## Key Implementation Patterns

### Services with Signals

Core services (AuthService, LanguageService, ThemeService) use signals for reactive state management with localStorage persistence.

### App Initialization

The `appInitializer` function in `src/app/core/utils/app-initializer.ts` ensures language, theme, and auth state are loaded before app bootstrap.

### Router Integration

Custom router state serializer provides a simplified router state shape with URL, params, query params, and route data accessible through NgRx selectors.

### Guards

- `authGuard` - Protects authenticated routes
- `anonymousGuard` - Protects routes that should only be accessible when not authenticated (e.g., login)

### HTTP Interceptor

`authInterceptor` automatically attaches JWT tokens to outgoing HTTP requests.

## Package Manager

This project uses **pnpm**. Always use `pnpm` commands, not `npm` or `yarn`.