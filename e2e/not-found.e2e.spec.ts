import { expect, test } from '@playwright/test';

test.describe('Página 404', () => {
	test('una ruta inexistente muestra la 404 y conserva la URL', async ({
		page,
	}) => {
		await page.goto('/esta/ruta/no/existe');

		// Lo importante es que no redirige: si lo hiciera, el enlace roto
		// quedaría escondido.
		await expect(page).toHaveURL(/\/esta\/ruta\/no\/existe/);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(page.locator('code')).toContainText('/esta/ruta/no/existe');
	});

	test('se marca como noindex y la etiqueta se retira al salir', async ({
		page,
	}) => {
		await page.goto('/otra/ruta/rota');

		const robots = page.locator('meta[name="robots"]');
		await expect(robots).toHaveAttribute('content', 'noindex, follow');

		await page.getByRole('link', { name: /home|inicio/i }).click();
		await expect(page).toHaveURL(/\/$/);

		// Si la etiqueta sobreviviera, desindexaría el resto de la navegación.
		await expect(robots).toHaveCount(0);
	});

	test('el botón de volver atrás funciona', async ({ page }) => {
		await page.goto('/');
		await page.goto('/ruta/rota');

		await page.getByRole('button', { name: /go back|volver atrás/i }).click();

		await expect(page).toHaveURL(/\/$/);
	});
});
