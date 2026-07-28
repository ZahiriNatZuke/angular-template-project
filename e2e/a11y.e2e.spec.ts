import { expect, test } from '@playwright/test';

/** Id del landmark principal del shell, en `app.component.html`. */
const MAIN = 'main-content';

const focusedId = (page: import('@playwright/test').Page) =>
	page.evaluate(() => document.activeElement?.id ?? '');

test.describe('Accesibilidad', () => {
	test('el primer tabulador revela el enlace de salto y lleva al contenido', async ({
		page,
	}) => {
		await page.goto('/');

		// Invisible hasta que recibe el foco: por eso se comprueba tabulando y no
		// buscándolo en la página.
		await page.keyboard.press('Tab');

		const skipLink = page.getByRole('link', {
			name: /skip to content|saltar al contenido/i,
		});
		await expect(skipLink).toBeFocused();
		await expect(skipLink).toBeVisible();

		await page.keyboard.press('Enter');

		expect(await focusedId(page)).toBe(MAIN);
	});

	test('al navegar, el foco pasa al contenido principal', async ({ page }) => {
		await page.goto('/');

		// En una SPA el navegador no mueve el foco al navegar: se queda en el
		// enlace pulsado, así que un lector de pantalla no anuncia la página nueva.
		await page.getByRole('link', { name: /sign in|iniciar sesión/i }).click();
		await expect(page).toHaveURL(/\/auth\/login/);

		await expect
			.poll(() => focusedId(page), { message: 'el foco debería ir al <main>' })
			.toBe(MAIN);
	});

	test('la carga inicial no roba el foco', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('domcontentloaded');

		// Mover el foco aquí pisaría el salto a un `#fragmento` de la propia URL.
		expect(await focusedId(page)).not.toBe(MAIN);
	});

	test('el shell expone los landmarks de navegación y contenido', async ({
		page,
	}) => {
		await page.goto('/');

		await expect(page.locator('header')).toBeVisible();
		await expect(page.locator(`main#${MAIN}`)).toBeVisible();
		await expect(page.locator('footer')).toBeVisible();
	});
});
