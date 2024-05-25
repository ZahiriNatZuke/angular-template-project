import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services';
import { tap } from 'rxjs';
import { ApiEndpoit } from '@core/types/enums';

const authDataUrl = [
  ApiEndpoit.loginURL,
  ApiEndpoit.refreshURL
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  if ( authService.isAuth ) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${ authService.JWT }` }
    });
  }

  return next(req).pipe(
    tap((response) => {
      if (
        response instanceof HttpResponse &&
        authDataUrl.some((url) => response.url?.includes(url))
      ) {
        const auth = ( response.body as any ).data;
        authService.updateUser = auth.user;
        authService.updateJWT = auth.accessToken;
        authService.updateRefresh = auth.refreshToken;
      }
    })
  );
};
