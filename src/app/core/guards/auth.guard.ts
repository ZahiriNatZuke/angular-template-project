import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services';

export const authGuard: CanActivateFn = (route, state) => {
	if (inject(AuthService).isAuth) {
		return true;
	}
	inject(Router).navigate(['/auth', 'login']);
	return false;
};
