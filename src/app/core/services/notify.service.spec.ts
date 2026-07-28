import { TestBed } from '@angular/core/testing';
import { NotifyService } from '@core/services/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { Loading, Notify } from 'notiflix';

// Notiflix manipula el DOM y arranca temporizadores; aquí solo interesa que el
// servicio le pase el texto ya traducido y las opciones por defecto. El mock
// cubre también el `import()` dinámico con el que se carga.
vi.mock('notiflix', () => ({
	Notify: {
		success: vi.fn(),
		info: vi.fn(),
		warning: vi.fn(),
		failure: vi.fn(),
	},
	Loading: {
		dots: vi.fn(),
		remove: vi.fn(),
	},
}));

describe('NotifyService', () => {
	let service: NotifyService;

	beforeEach(() => {
		vi.clearAllMocks();

		TestBed.configureTestingModule({
			providers: [
				{
					provide: TranslateService,
					useValue: { instant: (key: string) => `traducido:${key}` },
				},
			],
		});

		service = TestBed.inject(NotifyService);
	});

	it('success traduce la clave antes de mostrarla', async () => {
		await service.success('auth.login.ok');

		expect(Notify.success).toHaveBeenCalledWith(
			'traducido:auth.login.ok',
			expect.objectContaining({ clickToClose: true, timeout: 2000 })
		);
	});

	it('info traduce la clave antes de mostrarla', async () => {
		await service.info('algo.informativo');

		expect(Notify.info).toHaveBeenCalledWith(
			'traducido:algo.informativo',
			expect.any(Object)
		);
	});

	it('warning traduce la clave antes de mostrarla', async () => {
		await service.warning('algo.raro');

		expect(Notify.warning).toHaveBeenCalledWith(
			'traducido:algo.raro',
			expect.any(Object)
		);
	});

	it('failure traduce la clave antes de mostrarla', async () => {
		await service.failure('algo.fallo');

		expect(Notify.failure).toHaveBeenCalledWith(
			'traducido:algo.fallo',
			expect.any(Object)
		);
	});

	it('loading y removeLoading delegan en Notiflix', async () => {
		await service.loading();
		expect(Loading.dots).toHaveBeenCalledTimes(1);

		await service.removeLoading(300);
		expect(Loading.remove).toHaveBeenCalledWith(300);
	});

	it('no muestra nada de forma sincrónica', () => {
		// Notiflix se carga con `import()`, así que el aviso llega en el siguiente
		// tick. Se fija aquí para que quede claro que es deliberado: quien necesite
		// certeza de que el toast está en pantalla tiene que esperar la promesa.
		service.success('algo');

		expect(Notify.success).not.toHaveBeenCalled();
	});

	it('carga el módulo una sola vez aunque se avise varias veces', async () => {
		await service.success('uno');
		await service.warning('dos');
		await service.failure('tres');

		// Tres avisos, una sola descarga: la promesa del módulo queda guardada, así
		// que del segundo en adelante no hay espera.
		expect(Notify.success).toHaveBeenCalledTimes(1);
		expect(Notify.warning).toHaveBeenCalledTimes(1);
		expect(Notify.failure).toHaveBeenCalledTimes(1);
	});
});
