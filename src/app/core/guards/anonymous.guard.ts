import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { filter, map, take } from 'rxjs/operators';

export const anonymousGuard: CanActivateFn = (_route, _state) => {
	const authStore = inject(AuthStore);

	// Misma espera que en `authGuard`: sin ella, un usuario con sesión válida
	// alcanzaría el login durante el instante en que la sesión aún se comprueba.
	return toObservable(authStore.isSessionChecked).pipe(
		filter(Boolean),
		take(1),
		map(() => authStore.isAnonymous())
	);
};
