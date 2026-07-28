import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import {
	initRouteFocusManagement,
	MAIN_CONTENT_ID,
} from '@core/utils/route-focus.init';

const BlankPage = class {};

describe('initRouteFocusManagement', () => {
	let main: HTMLElement;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([
					{ path: '', component: BlankPage },
					{ path: 'otra', component: BlankPage },
				]),
			],
		});

		// El landmark vive en el shell, así que para el test basta con que exista
		// en el documento.
		main = document.createElement('main');
		main.id = MAIN_CONTENT_ID;
		main.tabIndex = -1;
		document.body.appendChild(main);
	});

	afterEach(() => {
		main.remove();
	});

	const init = () => TestBed.runInInjectionContext(initRouteFocusManagement);

	it('no roba el foco en la carga inicial de la página', async () => {
		const router = TestBed.inject(Router);
		init();

		await router.navigateByUrl('/');
		TestBed.tick();

		// Enfocar aquí pisaría el salto a un `#fragmento` de la propia URL.
		expect(document.activeElement).not.toBe(main);
	});

	it('deja el foco en el contenido principal al navegar', async () => {
		const router = TestBed.inject(Router);
		init();

		await router.navigateByUrl('/');
		TestBed.tick();
		await router.navigateByUrl('/otra');
		TestBed.tick();

		expect(document.activeElement).toBe(main);
	});

	it('no falla si el landmark no está en el documento', async () => {
		main.remove();

		const router = TestBed.inject(Router);
		init();

		await router.navigateByUrl('/');
		TestBed.tick();

		await expect(router.navigateByUrl('/otra')).resolves.toBe(true);
	});
});
