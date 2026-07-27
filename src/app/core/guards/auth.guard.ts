import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (_route, state) => {
	const authStore = inject(AuthStore);
	const router = inject(Router);

	// Se espera a que la validación de sesión del arranque haya terminado. Sin
	// esto, entrar directamente en una ruta protegida —o recargar dentro de
	// ella— evaluaba el guard con `isAuthenticated()` todavía en falso y
	// expulsaba al usuario aunque su sesión fuera válida.
	return toObservable(authStore.isSessionChecked).pipe(
		filter(Boolean),
		take(1),
		map(() => {
			if (authStore.isAuthenticated()) {
				return true;
			}

			// Guardar URL intentada para redirect post-login
			router.navigate(['/auth/login'], {
				queryParams: { returnUrl: state.url },
			});

			return false;
		})
	);
};
