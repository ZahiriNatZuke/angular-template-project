import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RequestService } from '@core/services/request.service';
import { ApiUrlHelperService } from '@core/services/api-url-helper.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _authUser: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
  private _authJWT: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private requestService: RequestService, private urlHelperService: ApiUrlHelperService,
              private router: Router) {
    this.loadRememberMe();
    this.loadAuthUser();
    this.loadJWT();
  }

  private _rememberMe: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get rememberMe(): boolean {
    return this._rememberMe.getValue();
  }

  get isAuth(): boolean {
    return !!this._authJWT.getValue() && !!this._authUser.getValue();
  }

  get JWT(): string | null {
    return this._authJWT.getValue();
  }

  get currentUser(): Observable<any | null> {
    return this._authUser.asObservable();
  }

  set updateUser(value: any | null) {
    if (this.rememberMe) {
      localStorage.setItem('X-Auth-User', JSON.stringify(value));
    } else {
      sessionStorage.setItem('X-Auth-User', JSON.stringify(value));
    }
    this._authUser.next(value);
  }

  set updateJWT(value: string | null) {
    if (this.rememberMe) {
      localStorage.setItem('X-Auth-Jwt', <string>value);
    } else {
      sessionStorage.setItem('X-Auth-Jwt', <string>value);
    }
    this._authJWT.next(value);
  }

  set updateRememberMe(value: boolean) {
    this._rememberMe.next(value);
    if (this.rememberMe) {
      localStorage.setItem('X-Remember-Me', value ? 'TRUE' : 'FALSE');
    } else {
      localStorage.setItem('X-Remember-Me', value ? 'TRUE' : 'FALSE');
    }
  }

  public loadRememberMe = () => {
    if (localStorage.getItem('X-Remember-Me')) {
      this.updateRememberMe =
        <string>localStorage.getItem('X-Remember-Me') === 'TRUE';
    } else {
      this.updateRememberMe = false;
      localStorage.setItem('X-Remember-Me', 'FALSE');
    }
  };

  public loadAuthUser = () => {
    if (this.rememberMe) {
      if (localStorage.getItem('X-Auth-User')) {
        this._authUser = new BehaviorSubject<any | null>(
          JSON.parse(<string>localStorage.getItem('X-Auth-User'))
        );
      } else {
        this._authUser = new BehaviorSubject<any | null>(null);
      }
    } else {
      if (sessionStorage.getItem('X-Auth-User')) {
        this._authUser = new BehaviorSubject<any | null>(
          JSON.parse(<string>sessionStorage.getItem('X-Auth-User'))
        );
      } else {
        this._authUser = new BehaviorSubject<any | null>(null);
      }
    }
  };

  public loadJWT = () => {
    if (this.rememberMe) {
      if (localStorage.getItem('X-Auth-Jwt')) {
        this._authJWT = new BehaviorSubject<string | null>(
          <string>localStorage.getItem('X-Auth-Jwt')
        );
      } else {
        this._authJWT = new BehaviorSubject<string | null>(null);
      }
    } else {
      if (sessionStorage.getItem('X-Auth-Jwt')) {
        this._authJWT = new BehaviorSubject<string | null>(
          <string>sessionStorage.getItem('X-Auth-Jwt')
        );
      } else {
        this._authJWT = new BehaviorSubject<string | null>(null);
      }
    }
  };

  public logout() {
    this.updateJWT = null;
    this.updateUser = null;
  }

  public checkSession() {
    // const { checkSessionURL } = this.urlHelperService;
    const checkSessionURL = 'http://localhost:3000/api/auth/check-session';
    return this.requestService.get(checkSessionURL).subscribe({
      next: () => this.router.navigate(['/app']),
      error: () => {
        this.logout();
        this.router.navigate(['/auth/login']);
      }
    })
  }
}
