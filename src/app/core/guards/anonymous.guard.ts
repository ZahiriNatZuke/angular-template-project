import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services';

export const anonymousGuard: CanActivateFn = (route, state) => {
	if (inject(AuthService).isAnonymous) {
		return true;
	}
	inject(Router).navigate(['/home']);
	return false;
};
