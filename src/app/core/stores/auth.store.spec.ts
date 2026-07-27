import { provideHttpClient } from '@angular/common/http';
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthStore, User } from '@core/stores/auth.store';
import { environment } from '@environments/environment';

const USER: User = {
	id: '1',
	name: 'Ada Lovelace',
	email: 'ada@example.com',
	role: 'admin',
};

describe('AuthStore', () => {
	let httpMock: HttpTestingController;
	let navigate: ReturnType<typeof vi.spyOn>;
	let navigateByUrl: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				provideHttpClient(),
				provideHttpClientTesting(),
				provideRouter([]),
			],
		});

		httpMock = TestBed.inject(HttpTestingController);

		const router = TestBed.inject(Router);
		navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
		navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
	});

	/**
	 * Reproduce lo que hace `provideAppInitializer`: construir el store y lanzar
	 * el arranque de sesión.
	 *
	 * No se hace en `withHooks({ onInit })` porque hacer HTTP durante la
	 * construcción del store choca con `authInterceptor`, que inyecta ese mismo
	 * store, y Angular aborta con NG0200.
	 */
	const initStore = (session: User | null = null) => {
		const store = TestBed.inject(AuthStore);

		store.fetchCsrfToken();
		store.checkAuth();

		httpMock
			.expectOne(`${environment.apiUrl}/auth/csrf`)
			.flush({ csrfToken: 'csrf-123' });

		const meRequest = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
		if (session) {
			meRequest.flush({ user: session });
		} else {
			meRequest.flush('Unauthorized', {
				status: 401,
				statusText: 'Unauthorized',
			});
		}

		return store;
	};

	afterEach(() => {
		httpMock.verify();
	});

	it('arranca anónimo cuando no hay sesión válida', () => {
		const store = initStore();

		expect(store.isAuthenticated()).toBe(false);
		expect(store.isAnonymous()).toBe(true);
		expect(store.user()).toBeNull();
		expect(store.userName()).toBe('Guest');
		expect(store.isLoading()).toBe(false);
	});

	it('restaura la sesión y guarda el token CSRF en el arranque', () => {
		const store = initStore(USER);

		expect(store.isAuthenticated()).toBe(true);
		expect(store.user()).toEqual(USER);
		expect(store.userName()).toBe('Ada Lovelace');
		expect(store.userEmail()).toBe('ada@example.com');
		expect(store.userRole()).toBe('admin');
		expect(store.csrfToken()).toBe('csrf-123');
	});

	it('login exitoso autentica y navega a /dashboard por defecto', () => {
		const store = initStore();

		store.login({
			email: 'ada@example.com',
			password: 'secret123',
			rememberMe: true,
		});

		const request = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
		expect(request.request.method).toBe('POST');
		expect(request.request.body).toEqual({
			email: 'ada@example.com',
			password: 'secret123',
			rememberMe: true,
		});
		request.flush({ user: USER });

		expect(store.isAuthenticated()).toBe(true);
		expect(store.isLoading()).toBe(false);
		expect(store.error()).toBeNull();
		expect(navigateByUrl).toHaveBeenCalledWith('/dashboard');
	});

	it('login respeta el returnUrl cuando viene del guard', () => {
		const store = initStore();

		store.login({
			email: 'ada@example.com',
			password: 'secret123',
			rememberMe: false,
			returnUrl: '/dashboard/reports',
		});

		httpMock
			.expectOne(`${environment.apiUrl}/auth/login`)
			.flush({ user: USER });

		expect(navigateByUrl).toHaveBeenCalledWith('/dashboard/reports');
	});

	it('login fallido deja el store anónimo y expone el error', () => {
		const store = initStore();

		store.login({
			email: 'ada@example.com',
			password: 'wrong-password',
			rememberMe: false,
		});

		httpMock
			.expectOne(`${environment.apiUrl}/auth/login`)
			.flush('Invalid credentials', {
				status: 401,
				statusText: 'Unauthorized',
			});

		expect(store.isAuthenticated()).toBe(false);
		expect(store.isLoading()).toBe(false);
		expect(store.error()).toBeTruthy();
		expect(navigateByUrl).not.toHaveBeenCalled();
	});

	it('clearError limpia el mensaje de error', () => {
		const store = initStore();

		store.login({
			email: 'a@b.c',
			password: 'wrong-password',
			rememberMe: false,
		});
		httpMock
			.expectOne(`${environment.apiUrl}/auth/login`)
			.flush('nope', { status: 401, statusText: 'Unauthorized' });
		expect(store.error()).toBeTruthy();

		store.clearError();

		expect(store.error()).toBeNull();
	});

	it('logout limpia el estado y vuelve al login', () => {
		const store = initStore(USER);

		store.logout();
		httpMock.expectOne(`${environment.apiUrl}/auth/logout`).flush({});

		expect(store.isAuthenticated()).toBe(false);
		expect(store.user()).toBeNull();
		expect(navigate).toHaveBeenCalledWith(['/auth/login']);
	});

	it('logout limpia el estado aunque el backend falle', () => {
		const store = initStore(USER);

		store.logout();
		httpMock
			.expectOne(`${environment.apiUrl}/auth/logout`)
			.flush('Boom', { status: 500, statusText: 'Server Error' });

		expect(store.isAuthenticated()).toBe(false);
		expect(store.user()).toBeNull();
		expect(navigate).toHaveBeenCalledWith(['/auth/login']);
	});

	it('guarda el error si no se puede obtener el token CSRF', () => {
		const store = TestBed.inject(AuthStore);
		store.fetchCsrfToken();
		store.checkAuth();

		httpMock
			.expectOne(`${environment.apiUrl}/auth/csrf`)
			.flush('Boom', { status: 500, statusText: 'Server Error' });
		httpMock.expectOne(`${environment.apiUrl}/auth/me`).flush({ user: USER });

		expect(store.csrfToken()).toBeNull();
		expect(store.error()).toBeTruthy();
	});

	it('una sesión inválida descarta el error previo del CSRF', () => {
		// `checkAuth` restaura `initialState` al fallar, así que borra cualquier
		// mensaje que hubiera dejado `fetchCsrfToken`. Se fija la conducta actual
		// para que un cambio futuro en ese handler sea deliberado.
		const store = TestBed.inject(AuthStore);
		store.fetchCsrfToken();
		store.checkAuth();

		httpMock
			.expectOne(`${environment.apiUrl}/auth/csrf`)
			.flush('Boom', { status: 500, statusText: 'Server Error' });
		httpMock
			.expectOne(`${environment.apiUrl}/auth/me`)
			.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

		expect(store.error()).toBeNull();
	});

	it('refreshUser conserva el usuario anterior si la petición falla', () => {
		const store = initStore(USER);

		store.refreshUser();
		httpMock
			.expectOne(`${environment.apiUrl}/auth/me`)
			.flush('Boom', { status: 500, statusText: 'Server Error' });

		expect(store.user()).toEqual(USER);
		expect(store.error()).toBeTruthy();
	});

	it('refreshUser actualiza el usuario sin tocar el flag de sesión', () => {
		const store = initStore(USER);

		store.refreshUser();
		httpMock
			.expectOne(`${environment.apiUrl}/auth/me`)
			.flush({ user: { ...USER, name: 'Ada L.' } });

		expect(store.userName()).toBe('Ada L.');
		expect(store.isAuthenticated()).toBe(true);
	});
});
