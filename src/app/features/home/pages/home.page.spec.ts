import {
	DeferBlockBehavior,
	DeferBlockState,
	TestBed,
} from '@angular/core/testing';
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
			// Los bloques `@defer` se controlan desde el test en lugar de dejar que
			// se disparen solos: `on viewport` necesita `IntersectionObserver`, que
			// jsdom no implementa, y el estado quedaría además a merced del entorno.
			deferBlockBehavior: DeferBlockBehavior.Manual,
		});

		harness = await RouterTestingHarness.create();
		page = await harness.navigateByUrl('/', HomePage);
	});

	it('renderiza una sección por bloque de la landing', () => {
		const sections =
			harness.routeNativeElement?.querySelectorAll('section') ?? [];

		// Siete bloques, contando los cuatro `@placeholder`: son `section` con la
		// misma altura reservada que el contenido que sustituyen, así que la página
		// no salta cuando el bloque diferido se resuelve.
		expect(sections.length).toBe(7);
	});

	it('renderiza una tarjeta por característica', () => {
		const cards = harness.routeNativeElement?.querySelectorAll('article') ?? [];

		expect(cards.length).toBe(page.features().length);
	});

	/** Los cuatro bloques `@defer` de la landing, por su selector. */
	const DEFERRED = [
		'app-auth-comparison',
		'app-vs-ng-new',
		'app-proven-fixes',
		'app-tech-stack',
	];

	it('no trae el contenido diferido en el render inicial', () => {
		const root = harness.routeNativeElement;

		// Lo que se difiere no está en el DOM hasta que su disparador se cumple.
		for (const selector of DEFERRED) {
			expect(root?.querySelector(selector)).toBeNull();
		}
		expect(root?.querySelector('table')).toBeNull();
	});

	it('resuelve los bloques diferidos con su contenido real', async () => {
		const blocks = await harness.fixture.getDeferBlocks();
		expect(blocks.length).toBe(DEFERRED.length);

		for (const block of blocks) {
			await block.render(DeferBlockState.Complete);
		}

		const root = harness.routeNativeElement;
		for (const selector of DEFERRED) {
			expect(root?.querySelector(selector)).not.toBeNull();
		}
		expect(root?.querySelector('table')).not.toBeNull();
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
