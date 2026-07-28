import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '@core/stores/auth.store';
import { environment } from '@environments/environment';
import { catchError, throwError } from 'rxjs';

/**
 * Endpoints donde un 401 es una respuesta de negocio y no una sesión caducada:
 * credenciales incorrectas en `login`, o simplemente «aún no hay sesión» en la
 * comprobación de arranque. El store ya trata esas respuestas, y encadenar un
 * `logout()` encima borraba el mensaje de error recién escrito.
 */
const AUTH_ENDPOINTS = [
	`${environment.apiUrl}/auth/login`,
	`${environment.apiUrl}/auth/me`,
	`${environment.apiUrl}/auth/csrf`,
	`${environment.apiUrl}/auth/logout`,
];

/**
 * Se compara la URL completa y no un fragmento: con `includes` un endpoint de
 * negocio como `/api/users/auth/me` habría entrado también en la excepción y su
 * 401 dejaría de cerrar la sesión.
 */
const isAuthEndpoint = (url: string) =>
	AUTH_ENDPOINTS.includes(url.split('?')[0]);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const authStore = inject(AuthStore);

	// Clone request con credentials (necesario para cookies HttpOnly)
	let newReq = req.clone({
		withCredentials: true,
	});

	// Agregar CSRF token a requests que lo necesitan (POST, PUT, DELETE, PATCH)
	if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
		const csrfToken = authStore.csrfToken();
		if (csrfToken) {
			newReq = newReq.clone({
				setHeaders: {
					'X-CSRF-Token': csrfToken,
				},
			});
		}
	}

	return next(newReq).pipe(
		catchError((error: HttpErrorResponse) => {
			// Un 401 fuera de los endpoints de autenticación sí significa que la
			// sesión expiró.
			if (error.status === 401 && !isAuthEndpoint(req.url)) {
				authStore.logout();
			}

			// Si recibimos 403 con CSRF inválido, refetch token
			if (error.status === 403 && error.error?.code === 'CSRF_INVALID') {
				authStore.fetchCsrfToken();
			}

			return throwError(() => error);
		})
	);
};
