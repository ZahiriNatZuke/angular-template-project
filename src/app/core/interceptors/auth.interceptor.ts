import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services';
import { ApiEndpoit } from '@core/types';
import { tap } from 'rxjs';

const authDataUrl = [ApiEndpoit.loginURL, ApiEndpoit.refreshURL];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const authService = inject(AuthService);
	let newReq = req;
	if (authService.isAuth) {
		newReq = req.clone({
			setHeaders: { Authorization: `Bearer ${authService.JWT}` },
		});
	}

	return next(newReq).pipe(
		tap(response => {
			if (
				response instanceof HttpResponse &&
				authDataUrl.some(url => response.url?.includes(url))
			) {
				const auth = (response.body as any).data;
				authService.updateUser = auth.user;
				authService.updateJWT = auth.accessToken;
				authService.updateRefresh = auth.refreshToken;
			}
		})
	);
};
