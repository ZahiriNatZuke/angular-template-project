import { expect, test } from '@playwright/test';

/**
 * Autenticación contra el backend de mentira de `mock-server/`, sin interceptar
 * nada.
 *
 * El resto de los end-to-end de auth sustituyen las respuestas con `page.route`,
 * lo que prueba la aplicación pero deja fuera justo lo que esta plantilla presume
 * de hacer bien: que la cookie de sesión sea HttpOnly de verdad, que sobreviva a
 * una recarga y que las mutaciones lleven un token CSRF que el servidor valida.
 * Nada de eso se puede comprobar contra respuestas fabricadas.
 *
 * El mock rechaza con 403 cualquier mutación sin cabecera `X-CSRF-Token` válida,
 * así que un login que triunfa **es** la prueba de que la cabecera viajó.
 */

const USER = {
	email: 'ada@example.com',
	password: 'secret123',
	name: 'Ada Lovelace',
};

const signIn = async (page: import('@playwright/test').Page) => {
	await page.goto('/auth/login');
	await page.locator('#email').fill(USER.email);
	await page.locator('#password').fill(USER.password);
	await page.getByRole('button', { name: /sign in|entrar/i }).click();
};

test.describe('Autenticación contra el servidor de mentira', () => {
	test('un login real deja la sesión en una cookie que JavaScript no puede leer', async ({
		page,
	}) => {
		await signIn(page);

		await expect(page).toHaveURL(/\/dashboard/);
		await expect(page.getByText(USER.name).first()).toBeVisible();

		// La promesa del template, comprobada en un navegador de verdad: la cookie
		// existe para el navegador y no para la página.
		const visibleForScripts = await page.evaluate(() => document.cookie);
		expect(visibleForScripts).not.toContain('session=');

		const cookies = await page.context().cookies();
		const session = cookies.find(cookie => cookie.name === 'session');
		expect(session?.httpOnly).toBe(true);
	});

	test('la sesión sobrevive a una recarga completa', async ({ page }) => {
		await signIn(page);
		await expect(page).toHaveURL(/\/dashboard/);

		// Recargar rehace la aplicación entera: el estado en memoria se pierde y la
		// sesión tiene que restaurarse desde la cookie, que es lo que hace
		// `checkAuth()` al arrancar. Los guards esperan a que termine antes de
		// decidir; sin esa espera, esto acabaría en el login.
		await page.reload();

		await expect(page).toHaveURL(/\/dashboard/);
		await expect(page.getByText(USER.name).first()).toBeVisible();
	});

	test('el login envía el token CSRF que el servidor exige', async ({
		page,
	}) => {
		const headers: (string | undefined)[] = [];
		page.on('request', request => {
			if (
				request.url().includes('/auth/login') &&
				request.method() === 'POST'
			) {
				headers.push(request.headers()['x-csrf-token']);
			}
		});

		await signIn(page);

		await expect(page).toHaveURL(/\/dashboard/);
		// Doble comprobación: la cabecera salió, y además el servidor la aceptó —sin
		// ella habría respondido 403 y no habríamos llegado al panel—.
		expect(headers.filter(Boolean)).not.toHaveLength(0);
	});

	test('cerrar sesión la invalida también en el servidor', async ({ page }) => {
		await signIn(page);
		await expect(page).toHaveURL(/\/dashboard/);

		await page.getByRole('button', { name: /sign out|cerrar sesión/i }).click();
		await expect(page).toHaveURL(/\/auth\/login/);

		// Volver a entrar por la URL no vale: la cookie ya no sirve, así que el guard
		// tiene que devolver al login.
		await page.goto('/dashboard');
		await expect(page).toHaveURL(/\/auth\/login/);
	});

	test('unas credenciales incorrectas dejan al usuario en la pantalla con su error', async ({
		page,
	}) => {
		await page.goto('/auth/login');
		await page.locator('#email').fill(USER.email);
		await page.locator('#password').fill('la-que-no-es');
		await page.getByRole('button', { name: /sign in|entrar/i }).click();

		// El 401 de un login rechazado es una respuesta de negocio: no debe tratarse
		// como sesión caducada ni borrar el mensaje recién puesto.
		await expect(page.locator('[role="alert"]')).toBeVisible();
		await expect(page).toHaveURL(/\/auth\/login/);
	});
});
