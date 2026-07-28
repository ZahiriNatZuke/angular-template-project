import {
	HttpClient,
	provideHttpClient,
	withInterceptors,
} from '@angular/common/http';
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { NotifyService } from '@core/services/notify.service';
import { AuthStore } from '@core/stores/auth.store';
import { environment } from '@environments/environment';

describe('authInterceptor', () => {
	let http: HttpClient;
	let httpMock: HttpTestingController;
	let authStoreMock: {
		csrfToken: ReturnType<typeof signal<string | null>>;
		logout: ReturnType<typeof vi.fn>;
		fetchCsrfToken: ReturnType<typeof vi.fn>;
	};
	let notifyMock: { warning: ReturnType<typeof vi.fn> };

	const URL = `${environment.apiUrl}/things`;

	beforeEach(() => {
		authStoreMock = {
			csrfToken: signal<string | null>('csrf-123'),
			logout: vi.fn(),
			fetchCsrfToken: vi.fn(),
		};
		// El servicio real habla con Notiflix, que toca el DOM y arranca
		// temporizadores; aquí solo interesa que se le pida el aviso.
		notifyMock = { warning: vi.fn() };

		TestBed.configureTestingModule({
			providers: [
				provideHttpClient(withInterceptors([authInterceptor])),
				provideHttpClientTesting(),
				{ provide: AuthStore, useValue: authStoreMock },
				{ provide: NotifyService, useValue: notifyMock },
			],
		});

		http = TestBed.inject(HttpClient);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('envía credenciales en todas las peticiones', () => {
		http.get(URL).subscribe();

		const request = httpMock.expectOne(URL);
		expect(request.request.withCredentials).toBe(true);
		request.flush({});
	});

	it('no adjunta el token CSRF en peticiones de lectura', () => {
		http.get(URL).subscribe();

		const request = httpMock.expectOne(URL);
		expect(request.request.headers.has('X-CSRF-Token')).toBe(false);
		request.flush({});
	});

	it.each(['POST', 'PUT', 'PATCH', 'DELETE'])(
		'adjunta el token CSRF en %s',
		method => {
			http.request(method, URL, { body: {} }).subscribe();

			const request = httpMock.expectOne(URL);
			expect(request.request.headers.get('X-CSRF-Token')).toBe('csrf-123');
			request.flush({});
		}
	);

	it('omite la cabecera CSRF si todavía no hay token', () => {
		authStoreMock.csrfToken.set(null);

		http.post(URL, {}).subscribe();

		const request = httpMock.expectOne(URL);
		expect(request.request.headers.has('X-CSRF-Token')).toBe(false);
		request.flush({});
	});

	it('cierra sesión ante un 401', () => {
		http.get(URL).subscribe({ error: () => undefined });

		httpMock
			.expectOne(URL)
			.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

		expect(authStoreMock.logout).toHaveBeenCalledTimes(1);
	});

	it('avisa de que la sesión caducó antes de cerrarla', () => {
		// `logout()` navega al login, y sin aviso el usuario aterriza ahí sin saber
		// por qué se le echó a mitad de lo que estaba haciendo.
		http.get(URL).subscribe({ error: () => undefined });

		httpMock
			.expectOne(URL)
			.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

		expect(notifyMock.warning).toHaveBeenCalledWith('notify.session.expired');
	});

	it('no avisa cuando el 401 viene de los endpoints de autenticación', () => {
		// Ahí un 401 es la respuesta normal —credenciales incorrectas, o «aún no
		// hay sesión» al arrancar—, no una sesión que caducó.
		http.get(`${environment.apiUrl}/auth/me`).subscribe({
			error: () => undefined,
		});

		httpMock
			.expectOne(`${environment.apiUrl}/auth/me`)
			.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

		expect(notifyMock.warning).not.toHaveBeenCalled();
		expect(authStoreMock.logout).not.toHaveBeenCalled();
	});

	it('renueva el token ante un 403 con código CSRF_INVALID', () => {
		http.post(URL, {}).subscribe({ error: () => undefined });

		httpMock
			.expectOne(URL)
			.flush(
				{ code: 'CSRF_INVALID' },
				{ status: 403, statusText: 'Forbidden' }
			);

		expect(authStoreMock.fetchCsrfToken).toHaveBeenCalledTimes(1);
		expect(authStoreMock.logout).not.toHaveBeenCalled();
	});

	it('no renueva el token ante un 403 por otra causa', () => {
		http.post(URL, {}).subscribe({ error: () => undefined });

		httpMock
			.expectOne(URL)
			.flush({ code: 'FORBIDDEN' }, { status: 403, statusText: 'Forbidden' });

		expect(authStoreMock.fetchCsrfToken).not.toHaveBeenCalled();
	});

	it('propaga el error al llamador', async () => {
		const failure = new Promise<number>(resolve => {
			http.get(URL).subscribe({ error: error => resolve(error.status) });
		});

		httpMock
			.expectOne(URL)
			.flush('Boom', { status: 500, statusText: 'Server Error' });

		await expect(failure).resolves.toBe(500);
	});
});

describe('authInterceptor y sus dependencias', () => {
	/**
	 * Regresión de un fallo que dejó la aplicación entera sin traducciones.
	 *
	 * `NotifyService` depende de `TranslateService`, y el loader de i18n descarga
	 * sus ficheros a través de este interceptor. Cuando el interceptor lo
	 * inyectaba de entrada, la primera petición encadenaba
	 * interceptor → NotifyService → TranslateService → petición → interceptor,
	 * Angular abortaba con NG0200 y la página se quedaba mostrando las claves
	 * crudas. Se resuelve solo cuando de verdad hay que avisar.
	 */
	it('no construye NotifyService en una petición normal', () => {
		let instances = 0;

		TestBed.configureTestingModule({
			providers: [
				provideHttpClient(withInterceptors([authInterceptor])),
				provideHttpClientTesting(),
				{
					provide: AuthStore,
					useValue: {
						csrfToken: signal<string | null>('csrf-123'),
						logout: vi.fn(),
						fetchCsrfToken: vi.fn(),
					},
				},
				{
					provide: NotifyService,
					useFactory: () => {
						instances += 1;
						return { warning: vi.fn() };
					},
				},
			],
		});

		const http = TestBed.inject(HttpClient);
		const httpMock = TestBed.inject(HttpTestingController);

		http.get(`${environment.apiUrl}/things`).subscribe();
		httpMock.expectOne(`${environment.apiUrl}/things`).flush({});
		httpMock.verify();

		expect(instances).toBe(0);
	});
});
