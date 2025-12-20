import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthStore } from '@core/stores';

export const anonymousGuard: CanActivateFn = (_route, _state) => {
	const authStore = inject(AuthStore);

	return authStore.isAnonymous();
};
