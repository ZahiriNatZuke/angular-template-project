import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@core/stores';

export const anonymousGuard: CanActivateFn = (_route, _state) => {
	const authStore = inject(AuthStore);
	const router = inject(Router);

	if (authStore.isAnonymous()) {
		return true;
	}

	router.navigate(['/dashboard']);
	return false;
};
