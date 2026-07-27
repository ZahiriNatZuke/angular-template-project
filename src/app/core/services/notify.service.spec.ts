import { TestBed } from '@angular/core/testing';
import { NotifyService } from '@core/services/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { Loading, Notify } from 'notiflix';

// Notiflix manipula el DOM y arranca temporizadores; aquí solo interesa que el
// servicio le pase el texto ya traducido y las opciones por defecto.
vi.mock('notiflix', () => ({
	Notify: {
		success: vi.fn(),
		info: vi.fn(),
		warning: vi.fn(),
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

	it('success traduce la clave antes de mostrarla', () => {
		service.success('auth.login.ok');

		expect(Notify.success).toHaveBeenCalledWith(
			'traducido:auth.login.ok',
			expect.objectContaining({ clickToClose: true, timeout: 2000 })
		);
	});

	it('info traduce la clave antes de mostrarla', () => {
		service.info('algo.informativo');

		expect(Notify.info).toHaveBeenCalledWith(
			'traducido:algo.informativo',
			expect.any(Object)
		);
	});

	it('warning traduce la clave antes de mostrarla', () => {
		service.warning('algo.raro');

		expect(Notify.warning).toHaveBeenCalledWith(
			'traducido:algo.raro',
			expect.any(Object)
		);
	});

	it('loading y removeLoading delegan en Notiflix', () => {
		service.loading();
		expect(Loading.dots).toHaveBeenCalledTimes(1);

		service.removeLoading(300);
		expect(Loading.remove).toHaveBeenCalledWith(300);
	});
});
