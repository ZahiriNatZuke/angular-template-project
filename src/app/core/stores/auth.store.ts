import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { tapResponse } from '@ngrx/operators';
import {
	patchState,
	signalStore,
	withComputed,
	withHooks,
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
}

// Initial State
const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,
	csrfToken: null,
};

export const AuthStore = signalStore(
	{ providedIn: 'root' },
	withState(initialState),

	withComputed(store => ({
		isAnonymous: computed(() => !store.isAuthenticated()),
		userName: computed(() => store.user()?.name ?? 'Guest'),
		userEmail: computed(() => store.user()?.email ?? ''),
		userRole: computed(() => store.user()?.role ?? ''),
	})),

	withMethods((store, http = inject(HttpClient), router = inject(Router)) => ({
		// Fetch CSRF token (llamar en app init)
		fetchCsrfToken: rxMethod<void>(
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
		),

		// Login (backend retorna Set-Cookie con HttpOnly)
		login: rxMethod<{
			email: string;
			password: string;
			rememberMe: boolean;
		}>(
			pipe(
				tap(() => patchState(store, { isLoading: true, error: null })),
				switchMap(({ email, password, rememberMe }) =>
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
									router.navigate(['/dashboard']);
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
								patchState(store, initialState);
								router.navigate(['/auth/login']);
							},
							error: () => {
								// Even on error, clear local state
								patchState(store, initialState);
								router.navigate(['/auth/login']);
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
	})),

	withHooks({
		onInit(store) {
			// On store init, fetch CSRF and check auth
			store.fetchCsrfToken();
			store.checkAuth();
		},
	})
);
