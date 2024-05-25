import { inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiEndpoit } from '@core/types/enums';
import { environment } from '@core/environments';

@Injectable({ providedIn: 'root' })
export class AuthService {

  #http = inject(HttpClient);
  #router = inject(Router);
  #authUser = signal<any | null>(null);
  #authJWT = signal<string | null>(null);
  #authRefresh = signal<string | null>(null);
  #rememberMe = signal<boolean>(false);

  init() {
    this.loadRememberMe();
    this.loadAuthUser();
    this.loadJWT();
    this.loadRefresh();
  }

  get rememberMe(): boolean {
    return this.#rememberMe();
  }

  get isAuth(): boolean {
    return !!this.#authJWT() && !!this.#authUser();
  }

  get isAnonymous(): boolean {
    return !this.isAuth;
  }

  get JWT(): string | null {
    return this.#authJWT();
  }

  get Refresh(): string | null {
    return this.#authRefresh();
  }

  get authUser(): any | null {
    return this.#authUser();
  }

  set updateUser(value: any | null) {
    if ( this.rememberMe ) {
      localStorage.setItem(environment.authUserKey, JSON.stringify(value));
    } else {
      sessionStorage.setItem(environment.authUserKey, JSON.stringify(value));
    }
    this.#authUser.set(value);
  }

  set updateJWT(value: string | null) {
    if ( this.rememberMe ) {
      localStorage.setItem(environment.authJWTKey, <string>value);
    } else {
      sessionStorage.setItem(environment.authJWTKey, <string>value);
    }
    this.#authJWT.set(value);
  }

  set updateRefresh(value: string | null) {
    if ( this.rememberMe ) {
      localStorage.setItem(environment.authRefreshKey, <string>value);
    } else {
      sessionStorage.setItem(environment.authRefreshKey, <string>value);
    }
    this.#authRefresh.set(value);
  }

  set updateRememberMe(value: boolean) {
    this.#rememberMe.set(value);
    localStorage.setItem(environment.authRememberMeKey, value ? 'TRUE' : 'FALSE');
  }

  loadRememberMe() {
    if ( localStorage.getItem(environment.authRememberMeKey) ) {
      this.updateRememberMe =
        <string>localStorage.getItem(environment.authRememberMeKey) === 'TRUE';
    } else {
      this.updateRememberMe = false;
      localStorage.setItem(environment.authRememberMeKey, 'FALSE');
    }
  };

  loadAuthUser() {
    if ( this.rememberMe ) {
      if ( localStorage.getItem(environment.authUserKey) ) {
        this.#authUser.set(JSON.parse(<string>localStorage.getItem(environment.authUserKey)));
      } else {
        this.#authUser.set(null);
      }
    } else {
      if ( sessionStorage.getItem(environment.authUserKey) ) {
        this.#authUser.set(JSON.parse(<string>sessionStorage.getItem(environment.authUserKey)));
      } else {
        this.#authUser.set(null);
      }
    }
  };

  loadJWT() {
    if ( this.rememberMe ) {
      if ( localStorage.getItem(environment.authJWTKey) ) {
        this.#authJWT.set(<string>localStorage.getItem(environment.authJWTKey));
      } else {
        this.#authJWT.set(null);
      }
    } else {
      if ( sessionStorage.getItem(environment.authJWTKey) ) {
        this.#authJWT.set(<string>sessionStorage.getItem(environment.authJWTKey));
      } else {
        this.#authJWT.set(null);
      }
    }
  };

  loadRefresh() {
    if ( this.rememberMe ) {
      if ( localStorage.getItem(environment.authRefreshKey) ) {
        this.#authRefresh.set(<string>localStorage.getItem(environment.authRefreshKey));
      } else {
        this.#authRefresh.set(null);
      }
    } else {
      if ( sessionStorage.getItem(environment.authRefreshKey) ) {
        this.#authRefresh.set(<string>sessionStorage.getItem(environment.authRefreshKey));
      } else {
        this.#authRefresh.set(null);
      }
    }
  };

  logout(makeRequest: boolean = true) {
    const removeCredentials = () => {
      this.updateJWT = null;
      this.updateUser = null;
      this.updateRefresh = null;
      this.#router.navigate([ '/auth', 'login' ]);
    };

    if ( this.isAuth && makeRequest ) {
      this.#http.get(`${ environment.apiUrl }${ ApiEndpoit.logoutURL }`).subscribe(removeCredentials);
    } else {
      removeCredentials();
    }
  }

  verifyToken(subject: Subject<boolean>, token: string) {
    return this.#http.post(`${ environment.apiUrl }${ ApiEndpoit.verifyTokenURL }`, { token });
  }

  reloadUserData() {
    this.#http.get(`${ environment.apiUrl }${ ApiEndpoit.meURL }`).subscribe({
      next: ({ data }: any) => this.updateUser = data,
    });
  }

}
