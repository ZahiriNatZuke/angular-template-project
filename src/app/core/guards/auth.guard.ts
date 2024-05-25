import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@core/services';

export const authGuard: CanActivateFn = (route, state) => {
  if ( inject(AuthService).isAuth ) {
    return true;
  } else {
    inject(Router).navigate([ '/auth', 'login' ]);
    return false;
  }
};
