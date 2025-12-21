import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';

export const authGuard: CanActivateFn = (_route, state) => {
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
