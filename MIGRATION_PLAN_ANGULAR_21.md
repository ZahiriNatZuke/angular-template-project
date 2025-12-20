# Plan de Migración Angular 18 → Angular 21

**Proyecto**: Angular Template Project
**Versión Actual**: Angular 18.2.10
**Versión Destino**: Angular 21.x
**Fecha de Planificación**: 2025-12-20

---

## 📋 Resumen Ejecutivo

Esta migración comprende:
1. **Actualización de Angular 18 → 21** (zoneless ya es default)
2. **Migración de servicios con signals → NgRx SignalStore**
3. **Migración de Jest → Vitest**
4. **Refactorización completa del sistema de autenticación** (de localStorage + JWT en frontend → HttpOnly Cookies + CSRF)
5. **Actualización de TailwindCSS** y ecosistema
6. **Adopción completa del modelo de signals** como standard

---

## 🎯 Objetivos de la Migración

### 1. Framework & Arquitectura
- ✅ Aprovechar zoneless como default (ya configurado experimentalmente)
- ✅ Adoptar signals como standard en toda la aplicación
- ✅ Migrar a NgRx SignalStore para gestión de estado global
- ✅ Eliminar dependencias de zone.js completamente

### 2. Seguridad
- ✅ **Eliminar tokens JWT del navegador** (localStorage/sessionStorage)
- ✅ Implementar **HttpOnly + Secure + SameSite cookies**
- ✅ Implementar **CSRF protection** robusta
- ✅ Implementar **refresh token rotation**
- ✅ Preparar arquitectura para **BFF** (Backend For Frontend)

### 3. Testing
- ✅ Migrar de Jest → Vitest (más rápido, mejor DX)
- ✅ Actualizar todos los test specs existentes
- ✅ Mejorar cobertura de tests

### 4. Styling
- ✅ Actualizar TailwindCSS v3 → v4 (cuando esté estable)
- ✅ Actualizar plugins de Tailwind
- ✅ Revisar compatibilidad con DaisyUI

---

## 📊 Análisis del Estado Actual

### Servicios que Requieren Migración a SignalStore

#### 1. **AuthService** (`src/app/core/services/auth.service.ts`)
**Problema Actual**:
- Almacena JWT/refresh tokens en localStorage/sessionStorage
- Expone tokens al navegador (vulnerable a XSS)
- Usa signals pero sin gestión de estado estructurada
- Lógica compleja de rememberMe con duplicación

**Estado Actual**:
```typescript
- #authUser = signal<any | null>(null)
- #authJWT = signal<string | null>(null)
- #authRefresh = signal<string | null>(null)
- #rememberMe = signal<boolean>(false)
```

**Migración Requerida**:
- → **AuthStore** (SignalStore)
- → Cambiar a cookies HttpOnly (backend debe configurar Set-Cookie)
- → Implementar CSRF token handling
- → Remover toda lógica de localStorage para tokens

#### 2. **LanguageService** (`src/app/core/services/language.service.ts`)
**Estado Actual**:
```typescript
languageSignal = signal<Languages>(Languages.Spanish)
```

**Migración Requerida**:
- → **LanguageStore** (SignalStore)
- → localStorage es aceptable aquí (no es sensible)
- → Integración con @ngrx/signals

#### 3. **ThemeService** (`src/app/core/services/theme.service.ts`)
**Estado Actual**:
```typescript
#theme = signal<Themes>(Themes.Light)
isDarkMode = computed(() => this.#theme() === Themes.Dark)
```

**Migración Requerida**:
- → **ThemeStore** (SignalStore)
- → localStorage es aceptable aquí
- → Mejor integración con computed signals

### Interceptores & Guards Afectados

#### `auth.interceptor.ts`
**Cambios Requeridos**:
- ❌ Eliminar: `Authorization: Bearer ${authService.JWT}`
- ✅ Agregar: `X-CSRF-Token` header
- ✅ Configurar: `withCredentials: true` para cookies
- ✅ NO extraer tokens de response body

#### `auth.guard.ts`
**Cambios Requeridos**:
- Usar AuthStore en lugar de AuthService
- Validar estado de autenticación desde endpoint `/api/auth/me` (no desde localStorage)

---

## 🔄 Plan de Migración Paso a Paso

### FASE 1: Preparación del Entorno (Estimado: 1-2 días)

#### 1.1. Backup y Versionado
```bash
git checkout -b migration/angular-21
git tag v0.0.6-pre-migration
```

#### 1.2. Actualizar Angular CLI globalmente
```bash
npm install -g @angular/cli@21
```

#### 1.3. Ejecutar Angular Update
```bash
# Paso 1: Angular 18 → 19
ng update @angular/core@19 @angular/cli@19 --allow-dirty

# Paso 2: Angular 19 → 20
ng update @angular/core@20 @angular/cli@20 --allow-dirty

# Paso 3: Angular 20 → 21
ng update @angular/core@21 @angular/cli@21 --allow-dirty

# Actualizar otras dependencias Angular
ng update @angular/cdk@21
```

#### 1.4. Actualizar NgRx y agregar SignalStore
```bash
pnpm add @ngrx/store@18 @ngrx/effects@18 @ngrx/router-store@18 @ngrx/signals@18
```

**Nota**: NgRx 18 es compatible con Angular 21 y trae SignalStore estable.

#### 1.5. Instalar Vitest
```bash
pnpm remove jest @types/jest jest-preset-angular
pnpm add -D vitest @vitest/ui vite @analogjs/vite-plugin-angular
```

---

### FASE 2: Migración de Testing (Estimado: 1 día)

#### 2.1. Configurar Vitest

**Crear**: `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/setup-vitest.ts'],
    include: ['**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

**Crear**: `src/setup-vitest.ts`
```typescript
import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
```

#### 2.2. Actualizar package.json scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

#### 2.3. Migrar tests existentes
- Cambiar imports de `jest` → `vitest`
- `describe()`, `it()`, `expect()` son compatibles
- Reemplazar `jest.fn()` → `vi.fn()`
- Reemplazar `jest.spyOn()` → `vi.spyOn()`

**Ejemplo de migración**:
```typescript
// ANTES (Jest)
import { TestBed } from '@angular/core/testing';

// DESPUÉS (Vitest)
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
```

---

### FASE 3: Migración a NgRx SignalStore (Estimado: 3-4 días)

#### 3.1. Crear AuthStore con Arquitectura Segura

**Archivo**: `src/app/core/stores/auth.store.ts`

```typescript
import { computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

// State Interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  csrfToken: string | null;
}

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  csrfToken: null,
};

// AuthStore
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    isAnonymous: computed(() => !store.isAuthenticated()),
    userName: computed(() => store.user()?.name ?? 'Guest'),
  })),

  withMethods((store, http = inject(HttpClient), router = inject(Router)) => ({

    // Método para obtener CSRF token
    fetchCsrfToken: rxMethod<void>(
      pipe(
        switchMap(() =>
          http.get<{ csrfToken: string }>('/api/auth/csrf', {
            withCredentials: true
          }).pipe(
            tapResponse({
              next: ({ csrfToken }) => patchState(store, { csrfToken }),
              error: (error) => patchState(store, { error: error.message }),
            })
          )
        )
      )
    ),

    // Login (backend retorna Set-Cookie con HttpOnly)
    login: rxMethod<{ email: string; password: string; rememberMe: boolean }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ email, password, rememberMe }) =>
          http.post<{ user: User }>(
            '/api/auth/login',
            { email, password, rememberMe },
            {
              withCredentials: true,
              headers: { 'X-CSRF-Token': store.csrfToken() || '' }
            }
          ).pipe(
            tapResponse({
              next: ({ user }) => {
                patchState(store, {
                  user,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                });
                router.navigate(['/dashboard']);
              },
              error: (error) => {
                patchState(store, {
                  isLoading: false,
                  error: error.message,
                });
              },
            })
          )
        )
      )
    ),

    // Logout (backend limpia cookies)
    logout: rxMethod<void>(
      pipe(
        switchMap(() =>
          http.post('/api/auth/logout', {}, {
            withCredentials: true,
            headers: { 'X-CSRF-Token': store.csrfToken() || '' }
          }).pipe(
            tapResponse({
              next: () => {
                patchState(store, initialState);
                router.navigate(['/auth/login']);
              },
              error: () => {
                patchState(store, initialState);
                router.navigate(['/auth/login']);
              },
            })
          )
        )
      )
    ),

    // Verificar sesión actual (llamar en app init)
    checkAuth: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          http.get<{ user: User }>('/api/auth/me', {
            withCredentials: true
          }).pipe(
            tapResponse({
              next: ({ user }) => {
                patchState(store, {
                  user,
                  isAuthenticated: true,
                  isLoading: false,
                });
              },
              error: () => {
                patchState(store, {
                  ...initialState,
                  isLoading: false,
                });
              },
            })
          )
        )
      )
    ),

    // Refresh user data
    refreshUser: rxMethod<void>(
      pipe(
        switchMap(() =>
          http.get<{ user: User }>('/api/auth/me', {
            withCredentials: true
          }).pipe(
            tapResponse({
              next: ({ user }) => patchState(store, { user }),
              error: (error) => patchState(store, { error: error.message }),
            })
          )
        )
      )
    ),
  }))
);

// User Interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}
```

#### 3.2. Crear LanguageStore

**Archivo**: `src/app/core/stores/language.store.ts`

```typescript
import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState, withHooks } from '@ngrx/signals';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Languages } from '@core/types';

interface LanguageState {
  current: Languages;
  available: Languages[];
}

const LANGUAGE_STORAGE_KEY = 'X-Dev-Language';

export const LanguageStore = signalStore(
  { providedIn: 'root' },
  withState<LanguageState>({
    current: Languages.Spanish,
    available: [Languages.English, Languages.Spanish],
  }),

  withComputed((store) => ({
    isEnglish: computed(() => store.current() === Languages.English),
    isSpanish: computed(() => store.current() === Languages.Spanish),
  })),

  withMethods((store, translate = inject(TranslateService), document = inject(DOCUMENT)) => ({
    setLanguage(lang: Languages) {
      const htmlElement = document.querySelector('html');

      // Update localStorage
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

      // Update translate service
      translate.use(lang);

      // Update HTML lang attribute
      if (htmlElement) {
        htmlElement.setAttribute('lang', lang);
      }

      // Update state
      patchState(store, { current: lang });
    },

    toggleLanguage() {
      const newLang = store.current() === Languages.English
        ? Languages.Spanish
        : Languages.English;
      this.setLanguage(newLang);
    },
  })),

  withHooks({
    onInit(store) {
      // Load from localStorage on init
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Languages;
      if (savedLang && store.available().includes(savedLang)) {
        store.setLanguage(savedLang);
      } else {
        store.setLanguage(Languages.Spanish);
      }
    },
  })
);
```

#### 3.3. Crear ThemeStore

**Archivo**: `src/app/core/stores/theme.store.ts`

```typescript
import { computed, inject, PLATFORM_ID } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState, withHooks } from '@ngrx/signals';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { MediaMatcher } from '@angular/cdk/layout';
import { Themes } from '@core/types';

interface ThemeState {
  current: Themes;
  prefersDark: boolean;
}

const THEME_STORAGE_KEY = 'X-Dev-Theme-UI';

export const ThemeStore = signalStore(
  { providedIn: 'root' },
  withState<ThemeState>({
    current: Themes.Light,
    prefersDark: false,
  }),

  withComputed((store) => ({
    isDarkMode: computed(() => store.current() === Themes.Dark),
    isLightMode: computed(() => store.current() === Themes.Light),
  })),

  withMethods((
    store,
    document = inject(DOCUMENT),
    platformId = inject(PLATFORM_ID),
    mediaMatcher = inject(MediaMatcher)
  ) => ({
    setTheme(theme: Themes) {
      if (!isPlatformBrowser(platformId)) return;

      const htmlElement = document.querySelector('html');
      const body = document.body;

      // Update data-theme attribute
      htmlElement?.setAttribute('data-theme', theme);

      // Update body classes
      body.classList.remove(Themes.Light, Themes.Dark);
      body.classList.add(theme);

      // Persist to localStorage
      localStorage.setItem(THEME_STORAGE_KEY, theme);

      // Update state
      patchState(store, { current: theme });
    },

    toggleTheme() {
      const newTheme = store.current() === Themes.Dark
        ? Themes.Light
        : Themes.Dark;
      this.setTheme(newTheme);
    },

    initTheme() {
      if (!isPlatformBrowser(platformId)) return;

      // Check localStorage first
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Themes;
      if (savedTheme) {
        this.setTheme(savedTheme);
        return;
      }

      // Otherwise, check system preference
      const darkModeQuery = mediaMatcher.matchMedia('(prefers-color-scheme: dark)');
      const preferredTheme = darkModeQuery.matches ? Themes.Dark : Themes.Light;

      patchState(store, { prefersDark: darkModeQuery.matches });
      this.setTheme(preferredTheme);
    },
  })),

  withHooks({
    onInit(store) {
      store.initTheme();
    },
  })
);
```

#### 3.4. Actualizar app.config.ts

**Cambios en**: `src/app/app.config.ts`

```typescript
import { AuthStore } from '@core/stores/auth.store';
import { LanguageStore } from '@core/stores/language.store';
import { ThemeStore } from '@core/stores/theme.store';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... otros providers

    // Remover APP_INITIALIZER antiguo
    // Agregar stores
    AuthStore,
    LanguageStore,
    ThemeStore,

    {
      provide: APP_INITIALIZER,
      useFactory: (authStore: typeof AuthStore) => () => {
        // Fetch CSRF token y verificar auth
        authStore.fetchCsrfToken();
        authStore.checkAuth();
      },
      deps: [AuthStore],
      multi: true,
    },
  ],
};
```

---

### FASE 4: Refactorización de Seguridad (Estimado: 2-3 días)

#### 4.1. Nuevo Auth Interceptor con CSRF

**Actualizar**: `src/app/core/interceptors/auth.interceptor.ts`

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '@core/stores/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // Clone request con credentials y CSRF token
  let newReq = req.clone({
    withCredentials: true, // IMPORTANTE: incluir cookies
  });

  // Agregar CSRF token a requests que lo necesitan (POST, PUT, DELETE, PATCH)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const csrfToken = authStore.csrfToken();
    if (csrfToken) {
      newReq = newReq.clone({
        setHeaders: { 'X-CSRF-Token': csrfToken },
      });
    }
  }

  return next(newReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si recibimos 401, la sesión expiró
      if (error.status === 401) {
        authStore.logout();
      }

      // Si recibimos 403 CSRF token inválido, refetch
      if (error.status === 403 && error.error?.code === 'CSRF_INVALID') {
        authStore.fetchCsrfToken();
      }

      return throwError(() => error);
    })
  );
};
```

#### 4.2. Actualizar Guards

**Actualizar**: `src/app/core/guards/auth.guard.ts`

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';

export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  // Guardar URL intentada para redirect post-login
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });

  return false;
};
```

**Actualizar**: `src/app/core/guards/anonymous.guard.ts`

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';

export const anonymousGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAnonymous()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
```

#### 4.3. Actualizar Environment para Seguridad

**Actualizar**: `src/environments/environment.ts`

```typescript
import { Languages } from '@core/types';

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // Cambiar a /api si usas BFF
  defaultTitle: 'Angular Template Project',
  defaultLanguage: Languages.English,

  // REMOVER: Ya no necesitamos keys de localStorage para auth
  // authUserKey: 'X-Dev-Auth-User',
  // authJWTKey: 'X-Dev-Auth-Jwt',
  // authRefreshKey: 'X-Dev-Auth-Refresh',
  // authRememberMeKey: 'X-Dev-Auth-Remember-Me',

  // Mantener solo preferencias de usuario
  languageKey: 'X-Dev-Language',
  themeKey: 'X-Dev-Theme-UI',
  timeZone: 'America/Havana',

  // Configuración de CSRF
  csrfHeaderName: 'X-CSRF-Token',
  csrfCookieName: 'XSRF-TOKEN',
};
```

#### 4.4. Documentación Backend Requirements

**Crear**: `docs/BACKEND_AUTH_REQUIREMENTS.md`

```markdown
# Backend Authentication Requirements

Para que la autenticación funcione correctamente con esta nueva arquitectura, el backend debe:

## 1. Cookies HttpOnly

### Login Endpoint: `POST /api/auth/login`
**Request:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": true
}
\`\`\`

**Response Headers:**
\`\`\`
Set-Cookie: accessToken=<JWT>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900
Set-Cookie: refreshToken=<REFRESH_JWT>; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=604800
\`\`\`

**Response Body:**
\`\`\`json
{
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin"
  }
}
\`\`\`

**Nota**: NO retornar tokens en el body. Solo en cookies HttpOnly.

## 2. CSRF Protection

### Get CSRF Token: `GET /api/auth/csrf`
**Response:**
\`\`\`json
{
  "csrfToken": "<RANDOM_TOKEN>"
}
\`\`\`

**Response Headers:**
\`\`\`
Set-Cookie: XSRF-TOKEN=<RANDOM_TOKEN>; Secure; SameSite=Strict; Path=/
\`\`\`

### Validar CSRF en Requests
Todos los requests POST/PUT/DELETE/PATCH deben validar header:
\`\`\`
X-CSRF-Token: <TOKEN>
\`\`\`

Si el token no coincide → `403 Forbidden { "code": "CSRF_INVALID" }`

## 3. Refresh Token Rotation

### Refresh Endpoint: `POST /api/auth/refresh`
**Request Headers:**
\`\`\`
Cookie: refreshToken=<OLD_REFRESH_TOKEN>
X-CSRF-Token: <TOKEN>
\`\`\`

**Response:**
- Invalidar el refresh token anterior
- Generar nuevo access token
- Generar nuevo refresh token
- Retornar ambos en cookies HttpOnly

**Response Headers:**
\`\`\`
Set-Cookie: accessToken=<NEW_JWT>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900
Set-Cookie: refreshToken=<NEW_REFRESH_JWT>; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=604800
\`\`\`

## 4. Session Validation

### Me Endpoint: `GET /api/auth/me`
**Request Headers:**
\`\`\`
Cookie: accessToken=<JWT>
\`\`\`

**Response:**
\`\`\`json
{
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin"
  }
}
\`\`\`

Si el token expiró → `401 Unauthorized`

## 5. Logout

### Logout Endpoint: `POST /api/auth/logout`
**Request Headers:**
\`\`\`
Cookie: accessToken=<JWT>
Cookie: refreshToken=<REFRESH_JWT>
X-CSRF-Token: <TOKEN>
\`\`\`

**Response:**
- Invalidar ambos tokens en backend
- Limpiar cookies

**Response Headers:**
\`\`\`
Set-Cookie: accessToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=0
\`\`\`

## 6. CORS Configuration

Si frontend y backend están en dominios diferentes, configurar CORS:

\`\`\`javascript
// Express example
app.use(cors({
  origin: 'http://localhost:4200', // Frontend URL
  credentials: true, // IMPORTANTE: permitir cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
}));
\`\`\`

## 7. BFF (Backend For Frontend) - Opcional pero Recomendado

Idealmente, crear un BFF entre el frontend y el backend real:

\`\`\`
[Angular App] ←→ [BFF (Node.js/Express)] ←→ [Backend API]
\`\`\`

El BFF:
- Maneja las cookies HttpOnly
- Refresca tokens automáticamente
- Agrega capa de seguridad adicional
- Permite SSR en el futuro
\`\`\`

---

### FASE 5: Actualización de TailwindCSS (Estimado: 1 día)

#### 5.1. Actualizar Dependencias

```bash
pnpm update tailwindcss@latest
pnpm update @tailwindcss/typography@latest @tailwindcss/forms@latest @tailwindcss/aspect-ratio@latest @tailwindcss/container-queries@latest
pnpm update daisyui@latest
pnpm update autoprefixer@latest postcss@latest
```

#### 5.2. Revisar Breaking Changes

Tailwind v4 (cuando esté disponible) tiene cambios:
- Nueva sintaxis de configuración en CSS
- Algunas utilidades deprecadas
- Mejor performance con Lightning CSS

**Por ahora**: Mantener en v3.x hasta que v4 esté estable y DaisyUI sea compatible.

---

### FASE 6: Limpieza y Optimización (Estimado: 1 día)

#### 6.1. Remover Código Deprecado

**Eliminar archivos**:
- `src/app/core/services/auth.service.ts` → reemplazado por `auth.store.ts`
- `src/app/core/services/language.service.ts` → reemplazado por `language.store.ts`
- `src/app/core/services/theme.service.ts` → reemplazado por `theme.store.ts`
- `src/app/core/utils/app-initializer.ts` → lógica movida a stores

**Eliminar de package.json**:
```bash
pnpm remove zone.js  # Ya no necesario en Angular 21 zoneless
```

#### 6.2. Actualizar Imports en Toda la App

Buscar y reemplazar en todos los archivos:
```typescript
// ANTES
import { AuthService } from '@core/services';

// DESPUÉS
import { AuthStore } from '@core/stores/auth.store';
```

#### 6.3. Actualizar index.ts de Exports

**Crear**: `src/app/core/stores/index.ts`
```typescript
export * from './auth.store';
export * from './language.store';
export * from './theme.store';
```

**Actualizar**: `src/app/core/index.ts`
```typescript
export * from './stores';
export * from './guards';
export * from './interceptors';
export * from './pipes';
export * from './types';
```

---

### FASE 7: Testing de Integración (Estimado: 2 días)

#### 7.1. Crear Tests para Stores

**Ejemplo**: `src/app/core/stores/auth.store.spec.ts`

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AuthStore', () => {
  let store: typeof AuthStore;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthStore],
    });

    store = TestBed.inject(AuthStore);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  it('should initialize with unauthenticated state', () => {
    expect(store.isAuthenticated()).toBe(false);
    expect(store.user()).toBeNull();
  });

  it('should fetch CSRF token', () => {
    store.fetchCsrfToken();

    const req = httpMock.expectOne('/api/auth/csrf');
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);

    req.flush({ csrfToken: 'test-csrf-token' });

    expect(store.csrfToken()).toBe('test-csrf-token');
  });

  it('should login successfully', () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@test.com', role: 'user' };

    store.login({ email: 'test@test.com', password: 'pass123', rememberMe: false });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.withCredentials).toBe(true);

    req.flush({ user: mockUser });

    expect(store.isAuthenticated()).toBe(true);
    expect(store.user()).toEqual(mockUser);
  });
});
```

#### 7.2. Testing de Integración Manual

**Checklist**:
- [ ] Login funciona y establece cookies
- [ ] Refresh automático de tokens funciona
- [ ] CSRF token se incluye en requests POST/PUT/DELETE
- [ ] Logout limpia estado y redirige
- [ ] Guards protegen rutas correctamente
- [ ] Estado persiste al recargar (si rememberMe)
- [ ] 401 redirige a login automáticamente
- [ ] Cambio de idioma funciona
- [ ] Cambio de tema funciona
- [ ] Tests con Vitest pasan

---

## 📝 Checklist de Migración Completa

### Pre-Migración
- [ ] Crear branch `migration/angular-21`
- [ ] Crear tag `v0.0.6-pre-migration`
- [ ] Backup de base de datos (si aplica)
- [ ] Documentar configuración actual

### Fase 1: Angular Update
- [ ] Actualizar Angular CLI global
- [ ] Migrar 18 → 19
- [ ] Migrar 19 → 20
- [ ] Migrar 20 → 21
- [ ] Actualizar Angular CDK
- [ ] Verificar compilación exitosa
- [ ] Remover zone.js

### Fase 2: Testing
- [ ] Instalar Vitest
- [ ] Configurar vitest.config.ts
- [ ] Migrar todos los .spec.ts
- [ ] Ejecutar `pnpm test` exitosamente
- [ ] Verificar coverage

### Fase 3: SignalStore
- [ ] Instalar @ngrx/signals
- [ ] Crear AuthStore
- [ ] Crear LanguageStore
- [ ] Crear ThemeStore
- [ ] Actualizar app.config.ts
- [ ] Migrar todos los componentes que usan servicios

### Fase 4: Seguridad
- [ ] Actualizar auth.interceptor.ts
- [ ] Actualizar guards
- [ ] Actualizar environments
- [ ] Documentar requirements backend
- [ ] Coordinar con equipo backend
- [ ] Implementar manejo de CSRF
- [ ] Testing de flujo completo de auth

### Fase 5: TailwindCSS
- [ ] Actualizar tailwindcss
- [ ] Actualizar plugins
- [ ] Actualizar DaisyUI
- [ ] Verificar estilos no rotos

### Fase 6: Limpieza
- [ ] Eliminar servicios antiguos
- [ ] Actualizar imports
- [ ] Actualizar index.ts exports
- [ ] Limpiar package.json
- [ ] Ejecutar lint y format

### Fase 7: Testing Final
- [ ] Tests unitarios pasan
- [ ] Tests de integración manuales
- [ ] Testing en diferentes browsers
- [ ] Performance testing
- [ ] Verificar bundle size

### Post-Migración
- [ ] Actualizar CLAUDE.md
- [ ] Actualizar README.md
- [ ] Crear CHANGELOG.md con cambios
- [ ] Merge a main
- [ ] Tag v1.0.0
- [ ] Deploy a staging
- [ ] Deploy a production

---

## ⚠️ Riesgos y Mitigaciones

### Riesgo 1: Breaking Changes en Angular
**Mitigación**: Migrar versión por versión (18→19→20→21) y ejecutar ng update con --allow-dirty.

### Riesgo 2: Backend no compatible con nueva auth
**Mitigación**: Mantener feature flag para permitir rollback temporal.

### Riesgo 3: Tests fallan después de migración
**Mitigación**: Migrar tests gradualmente, mantener Jest hasta validar Vitest.

### Riesgo 4: Pérdida de sesiones de usuarios
**Mitigación**: Implementar migración de sesiones gradual con doble autenticación temporal.

---

## 📚 Recursos y Referencias

- [Angular 21 Update Guide](https://update.angular.io/)
- [NgRx SignalStore Docs](https://ngrx.io/guide/signals)
- [Vitest Angular Setup](https://vitest.dev/)
- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [HttpOnly Cookies Best Practices](https://owasp.org/www-community/HttpOnly)

---

## 🎯 Resultado Esperado

Al finalizar esta migración, tendrás:

✅ **Angular 21** con zoneless como default
✅ **Signals como standard** en toda la app
✅ **NgRx SignalStore** para gestión de estado estructurada
✅ **Vitest** como test runner (más rápido que Jest)
✅ **Autenticación ultra-segura** con HttpOnly cookies, CSRF, refresh rotation
✅ **Zero tokens en localStorage** (protección contra XSS)
✅ **Mejor DX** (Developer Experience) con mejor tipado y menos boilerplate
✅ **Mejor rendimiento** sin zone.js y con signals nativos
✅ **Código más limpio** y mantenible

---

**Estimación Total**: 10-12 días de desarrollo
**Complejidad**: Media-Alta
**Prioridad**: Alta (seguridad + modernización)
