import { expect, type Page, test } from '@playwright/test';

/**
 * Baja la página a pantallazos hasta que aparece un selector.
 *
 * Tiene que ser progresivo, y no un salto al pie: las secciones de abajo van en
 * bloques `@defer (on viewport)`, y de un salto al final del documento las
 * intermedias no llegan a pasar por el viewport, así que su disparador nunca se
 * cumple. Además, cada bloque que se resuelve hace **crecer** la página.
 */
const scrollUntilVisible = async (page: Page, selector: string) => {
	await expect
		.poll(
			async () => {
				await page.evaluate(() =>
					window.scrollBy(0, Math.round(window.innerHeight * 0.75))
				);
				return page.locator(selector).count();
			},
			{
				message: `${selector} debería cargarse al bajar`,
				timeout: 15_000,
			}
		)
		.toBeGreaterThan(0);

	await expect(page.locator(selector)).toBeVisible();
};

test.describe('Landing', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('renderiza las secciones principales', async ({ page }) => {
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		// Siete bloques: hero y estado, más los cinco que se difieren, que en este
		// momento son sus `@placeholder`.
		await expect(page.locator('section')).toHaveCount(7);

		// Las tarjetas de la comparativa también son `article` pero están ocultas
		// en escritorio, así que se filtra por visibilidad en lugar de contar
		// todos los elementos del DOM.
		await expect(page.locator('article:visible').first()).toBeVisible();
		await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible();
	});

	test('no deja errores de aplicación en consola', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', error => errors.push(error.message));
		page.on('console', message => {
			// Se ignoran los fallos de carga de recursos: dependen de si el entorno
			// tiene salida a internet (la baliza de analítica es externa) y no
			// indican un error de la aplicación.
			const text = message.text();
			const isNetworkNoise = /Failed to load resource|net::ERR_/.test(text);
			if (message.type() === 'error' && !isNetworkNoise) errors.push(text);
		});

		await page.reload();
		await page.waitForLoadState('domcontentloaded');

		expect(errors).toEqual([]);
	});

	test('el tema sobrevive a una recarga', async ({ page }) => {
		const html = page.locator('html');
		const initial = await html.getAttribute('data-theme');

		await page.getByRole('button', { name: /toggle theme/i }).click();
		const toggled = await html.getAttribute('data-theme');
		expect(toggled).not.toBe(initial);

		// El tema se persiste en cookie, no en memoria: tras recargar debe
		// mantenerse. Es la parte que un test unitario no llega a ejercitar.
		await page.reload();
		await expect(html).toHaveAttribute('data-theme', toggled ?? '');
	});

	test('el idioma sobrevive a una recarga', async ({ page }) => {
		const toggle = page.getByRole('button', { name: /^(ES|EN)$/ });
		const heroTitle = page.getByRole('heading', { level: 1 });

		const before = await heroTitle.textContent();
		await toggle.click();
		await expect(heroTitle).not.toHaveText(before ?? '');

		const after = await heroTitle.textContent();
		await page.reload();

		await expect(heroTitle).toHaveText(after ?? '');
	});

	test('cada herramienta del stack enlaza a su documentación en otra pestaña', async ({
		page,
	}) => {
		// La sección va diferida, así que primero hay que llegar a ella.
		await scrollUntilVisible(page, 'app-tech-stack');

		const links = page.locator('app-tech-stack dd li a');
		const total = await links.count();
		expect(total).toBeGreaterThanOrEqual(12);

		for (let index = 0; index < total; index += 1) {
			const link = links.nth(index);

			await expect(link).toHaveAttribute('href', /^https:\/\//);
			await expect(link).toHaveAttribute('target', '_blank');
			// Sin `noopener` la pestaña nueva puede manipular esta.
			await expect(link).toHaveAttribute('rel', /noopener/);
		}
	});

	test('la versión del pie enlaza a las notas de ese release', async ({
		page,
	}) => {
		const version = page.locator('footer a[href*="/releases/tag/"]');

		// La versión sale del `package.json`, así que el enlace apunta siempre a lo
		// que está corriendo sin que nadie lo actualice a mano.
		await expect(version).toHaveAttribute('href', /\/releases\/tag\/v\d+\.\d+/);
		await expect(version).toHaveText(/v\d+\.\d+\.\d+/);
	});

	test('las secciones diferidas se cargan al llegar a ellas', async ({
		page,
	}) => {
		const comparison = page.locator('app-auth-comparison');
		const stack = page.locator('app-tech-stack');

		// Al cargar no están: viven en bloques `@defer (on viewport)`, así que su
		// chunk no forma parte del bundle inicial. Solo un navegador real ejercita
		// esto — en jsdom no hay `IntersectionObserver`.
		await expect(comparison).toHaveCount(0);
		await expect(stack).toHaveCount(0);

		await page
			.getByRole('heading', { name: /what's included|qué incluye/i })
			.scrollIntoViewIfNeeded();
		await expect(comparison).toBeVisible();

		// Las dos secciones que argumentan el valor de la plantilla van diferidas
		// igual, y quedan por el camino hasta el stack, que es la última.
		await scrollUntilVisible(page, 'app-vs-ng-new');
		await scrollUntilVisible(page, 'app-proven-fixes');
		await scrollUntilVisible(page, 'app-tech-stack');
		await expect(stack).toBeVisible();
	});

	test('copia el comando de instalación al portapapeles', async ({
		page,
		context,
		browserName,
	}) => {
		test.skip(
			browserName !== 'chromium',
			'El permiso de portapapeles solo se concede en Chromium'
		);
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);

		await page.getByRole('button', { name: /copy/i }).click();

		const copied = await page.evaluate(() => navigator.clipboard.readText());
		expect(copied).toContain('ZahiriNatZuke/angular-template-project');
	});
});
