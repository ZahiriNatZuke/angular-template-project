import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@core/services';

export const anonymousGuard: CanActivateFn = (route, state) => {
  if ( inject(AuthService).isAnonymous ) {
    return true;
  } else {
    inject(Router).navigate([ '/home' ]);
    return false;
  }
};
