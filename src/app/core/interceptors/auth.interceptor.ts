import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiUrlHelperService, AuthService } from '@core/services';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private apiUrlHelperService: ApiUrlHelperService) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.authService.isAuth) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${ this.authService.JWT }` },
      });
    }

    return next.handle(request).pipe(
      tap((response) => {
        // const {loginURL} = this.apiUrlHelperService;
        const loginURL = 'http://localhost:3000/api/auth/login';
        if (response instanceof HttpResponse && response.url?.includes(loginURL)) {
          this.authService.updateUser = (response.body as any).data.user;
          this.authService.updateJWT = (response.body as any).data.access_token;
        }
      })
    );
  }
}
