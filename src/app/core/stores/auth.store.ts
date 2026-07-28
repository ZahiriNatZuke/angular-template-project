import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { tapResponse } from '@ngrx/operators';
import {
	patchState,
	signalStore,
	withComputed,
	withMethods,
	withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

// User Interface
export interface User {
	id: string;
	name: string;
	email: string;
	role: string;
	[key: string]: unknown;
}

// State Interface
interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	csrfToken: string | null;
	/**
	 * Si la validación de sesión del arranque ya terminó, con o sin éxito.
	 *
	 * Los guards lo necesitan: sin esperar a que sea `true`, se evalúan mientras
	 * `checkAuth()` sigue en vuelo, ven `isAuthenticated()` en falso y expulsan a
	 * un usuario con sesión válida.
	 */
	isSessionChecked: boolean;
}

// Initial State
const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,
	csrfToken: null,
	isSessionChecked: false,
};

/**
 * Los campos que describen «aquí no hay sesión», para volver a ellos sin
 * arrastrar el resto del estado.
 *
 * Deliberadamente **no** incluye `csrfToken`: el token pertenece al navegador y
 * no a la sesión. Resetear con `...initialState` lo ponía a `null`, y como el
 * arranque pide `/auth/csrf` y `/auth/me` a la vez, el 401 normal de un usuario
 * anónimo borraba el token que acababa de llegar. El siguiente POST —el login,
 * justamente— salía sin la cabecera `X-CSRF-Token`.
 */
const anonymousSession = {
	user: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,
} satisfies Partial<AuthState>;

export const AuthStore = signalStore(
	{ providedIn: 'root' },
	withState(initialState),

	withComputed(store => ({
		isAnonymous: computed(() => !store.isAuthenticated()),
		userName: computed(() => store.user()?.name ?? 'Guest'),
		userEmail: computed(() => store.user()?.email ?? ''),
		userRole: computed(() => store.user()?.role ?? ''),
	})),

	withMethods((store, http = inject(HttpClient), router = inject(Router)) => {
		// Fetch CSRF token (llamar en app init). Se declara como constante, y no
		// solo como propiedad del objeto, para poder reutilizarlo desde `logout`.
		const fetchCsrfToken = rxMethod<void>(
			pipe(
				switchMap(() =>
					http
						.get<{ csrfToken: string }>(`${environment.apiUrl}/auth/csrf`)
						.pipe(
							tapResponse({
								next: ({ csrfToken }) => patchState(store, { csrfToken }),
								error: (error: HttpErrorResponse) =>
									patchState(store, {
										error: error.message || 'Failed to fetch CSRF token',
									}),
							})
						)
				)
			)
		);

		/**
		 * Cierra la sesión en el cliente y vuelve al login.
		 *
		 * Pide un token CSRF nuevo: un backend que rote el token al cerrar sesión
		 * invalida el anterior, y sin esto la siguiente mutación —el próximo
		 * login— viajaría con un token muerto o sin ninguno.
		 */
		const closeSession = () => {
			patchState(store, { ...anonymousSession, isSessionChecked: true });
			fetchCsrfToken();
			router.navigate(['/auth/login']);
		};

		return {
			fetchCsrfToken,

			// Login (backend retorna Set-Cookie con HttpOnly)
			login: rxMethod<{
				email: string;
				password: string;
				rememberMe: boolean;
				/** Ruta a la que volver tras autenticarse; por defecto `/dashboard`. */
				returnUrl?: string;
			}>(
				pipe(
					tap(() => patchState(store, { isLoading: true, error: null })),
					switchMap(({ email, password, rememberMe, returnUrl }) =>
						http
							.post<{ user: User }>(`${environment.apiUrl}/auth/login`, {
								email,
								password,
								rememberMe,
							})
							.pipe(
								tapResponse({
									next: ({ user }) => {
										patchState(store, {
											user,
											isAuthenticated: true,
											isLoading: false,
											error: null,
										});
										router.navigateByUrl(returnUrl || '/dashboard');
									},
									error: (error: HttpErrorResponse) => {
										patchState(store, {
											isLoading: false,
											error: error.message || 'Login failed',
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
						http.post(`${environment.apiUrl}/auth/logout`, {}).pipe(
							tapResponse({
								next: () => {
									closeSession();
								},
								error: () => {
									// Even on error, clear local state
									closeSession();
								},
							})
						)
					)
				)
			),

			// Check auth status (llamar en app init)
			checkAuth: rxMethod<void>(
				pipe(
					tap(() => patchState(store, { isLoading: true })),
					switchMap(() =>
						http.get<{ user: User }>(`${environment.apiUrl}/auth/me`).pipe(
							tapResponse({
								next: ({ user }) => {
									patchState(store, {
										user,
										isAuthenticated: true,
										isLoading: false,
										isSessionChecked: true,
									});
								},
								error: () => {
									// Sin `csrfToken`: el 401 de un usuario anónimo es la
									// respuesta normal al arrancar y no debe tirar el token que
									// `/auth/csrf` acaba de traer.
									patchState(store, {
										...anonymousSession,
										isSessionChecked: true,
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
						http.get<{ user: User }>(`${environment.apiUrl}/auth/me`).pipe(
							tapResponse({
								next: ({ user }) => patchState(store, { user }),
								error: (error: HttpErrorResponse) =>
									patchState(store, {
										error: error.message || 'Failed to refresh user data',
									}),
							})
						)
					)
				)
			),

			// Clear error
			clearError: () => patchState(store, { error: null }),
		};
	})
);

/*
 * El arranque de sesión NO va en `withHooks({ onInit })`.
 *
 * Hacer HTTP durante la construcción del store creaba una dependencia circular:
 * la petición pasa por `authInterceptor`, que hace `inject(AuthStore)` sobre el
 * store que todavía se está construyendo. Angular lanzaba
 * «NG0200: Circular dependency detected for SignalStore» y la petición nunca
 * salía, así que ni la validación de sesión ni la obtención del token CSRF
 * llegaban a ejecutarse jamás.
 *
 * Se dispara desde `provideAppInitializer` en `app.config.ts`, cuando el store
 * ya está completamente construido.
 */
