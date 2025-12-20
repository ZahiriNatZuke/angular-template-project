import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '@core/stores';
import { catchError, throwError } from 'rxjs';

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
			// Si recibimos 401, la sesión expiró
			if (error.status === 401) {
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
