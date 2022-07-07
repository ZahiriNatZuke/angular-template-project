import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { INotifyOptions, Notify } from 'notiflix';
import { AuthService } from '@core/services';
import { Router } from '@angular/router';

@Injectable()
export class NotificationsInterceptor implements HttpInterceptor {

  private successStatutes = [200, 201, 204];
  private errorStatutes = [400, 401, 403, 404, 500];

  constructor(private injector: Injector, private authService: AuthService,
              private router: Router) {
  }

  get translateService(): TranslateService {
    return this.injector.get(TranslateService);
  }


  get notifyOptions(): INotifyOptions {
    return {
      position: 'center-top',
      borderRadius: '24px',
      cssAnimationStyle: 'from-top',
      fontAwesomeIconStyle: 'shadow',
      clickToClose: true,
      timeout: 2500,
      showOnlyTheLastOne: true,
      fontSize: '13px',
      opacity: 0.7,
      distance: '30px',
      pauseOnHover: true
    }
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap((response) => {
        if (response instanceof HttpResponse) {
          const body: any = response.body;
          if (body.hasOwnProperty('msg')) {
            const { msg } = body;
            const message = this.translateService.instant(msg);
            if (this.successStatutes.includes(response.status)) Notify.success(message, this.notifyOptions);
          }
        }
      }),
      catchError((error) => {
        const body: any = error.error;
        if (body.hasOwnProperty('msg')) {
          const { msg } = body;
          const message = this.translateService.instant(msg);
          if (this.errorStatutes.includes(error.status)) Notify.failure(message, this.notifyOptions);
        }
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: this.router.url },
          });
        }
        return throwError(error);
      })
    );
  }

}
