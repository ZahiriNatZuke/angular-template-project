import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { HomePage } from './home.page';

describe('HomePage', () => {
	let harness: RouterTestingHarness;
	let page: HomePage;

	beforeEach(async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([{ path: '', component: HomePage }]),
				provideTranslateService(),
			],
		});

		harness = await RouterTestingHarness.create();
		page = await harness.navigateByUrl('/', HomePage);
	});

	it('renderiza una sección por bloque de la landing', () => {
		const sections =
			harness.routeNativeElement?.querySelectorAll('section') ?? [];

		expect(sections.length).toBe(5);
	});

	it('renderiza una tarjeta por característica', () => {
		const cards = harness.routeNativeElement?.querySelectorAll('article') ?? [];

		// Seis características más una tarjeta por fila de la comparativa, que
		// solo se muestra en móvil pero está en el DOM.
		expect(cards.length).toBe(
			page.features().length + page.authComparison().length
		);
	});

	it('cada característica tiene su icono', () => {
		const icons =
			harness.routeNativeElement?.querySelectorAll('article svg') ?? [];

		expect(icons.length).toBeGreaterThanOrEqual(page.features().length);
	});

	it('el comando de instalación apunta al repositorio real', () => {
		expect(page.installCommand()).toContain(
			'ZahiriNatZuke/angular-template-project'
		);
	});

	it('copia el comando al portapapeles y confirma', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal('navigator', { clipboard: { writeText } });

		await page.copyInstallCommand();

		expect(writeText).toHaveBeenCalledWith(page.installCommand());
		expect(page.copied()).toBe(true);

		vi.unstubAllGlobals();
	});

	it('no rompe si el portapapeles falla', async () => {
		// Requiere contexto seguro y permiso; si se deniega, el comando sigue
		// visible y seleccionable a mano, así que el fallo debe ser silencioso.
		vi.stubGlobal('navigator', {
			clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
		});

		await expect(page.copyInstallCommand()).resolves.toBeUndefined();
		expect(page.copied()).toBe(false);

		vi.unstubAllGlobals();
	});
});
