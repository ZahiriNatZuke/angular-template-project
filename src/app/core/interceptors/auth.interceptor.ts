import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { NotifyService } from '@core/services/notify.service';
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

	/*
	 * `NotifyService` se resuelve solo cuando hace falta, y no al crear cada
	 * petición.
	 *
	 * Depende de `TranslateService`, y el loader de i18n descarga sus ficheros a
	 * través de este mismo interceptor. Construirlo aquí encadena
	 * interceptor → NotifyService → TranslateService → petición → interceptor:
	 * Angular aborta con NG0200 y la aplicación se queda sin traducciones,
	 * mostrando las claves crudas. Es el mismo ciclo que tenía `AuthStore` al
	 * hacer HTTP en `withHooks({ onInit })`; un interceptor es un sitio delicado
	 * para inyectar cosas.
	 */
	const injector = inject(Injector);

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
				// Se avisa antes de cerrar sesión: `logout()` navega al login, y sin
				// esto el usuario acaba ahí sin ninguna explicación de por qué se le
				// echó a mitad de lo que estaba haciendo.
				injector.get(NotifyService).warning('notify.session.expired');
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
