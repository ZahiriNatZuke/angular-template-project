import { expect, type Page, test } from '@playwright/test';

const USER = {
	id: '1',
	name: 'Ada Lovelace',
	email: 'ada@example.com',
	role: 'admin',
};

/**
 * Intercepta la API de autenticación.
 *
 * El template es agnóstico del backend y no incluye uno, así que los flujos de
 * sesión se ejercitan contra respuestas simuladas. Sirve además de ejemplo de
 * cómo probar estos caminos sin levantar un servidor.
 */
async function mockAuthApi(
	page: Page,
	{ session = null as typeof USER | null, loginFails = false } = {}
) {
	// Se señaliza desde el propio handler en lugar de con `waitForResponse`:
	// las respuestas servidas por `route.fulfill` no siempre casan con el glob,
	// y aquí el momento exacto sí importa para la cabecera CSRF.
	let markCsrfServed: () => void = () => undefined;
	const csrfServed = new Promise<void>(resolve => {
		markCsrfServed = resolve;
	});

	await page.route('**/api/auth/csrf', async route => {
		await route.fulfill({ json: { csrfToken: 'csrf-de-prueba' } });
		markCsrfServed();
	});

	await page.route('**/api/auth/me', route =>
		session
			? route.fulfill({ json: { user: session } })
			: route.fulfill({ status: 401, json: { message: 'Unauthorized' } })
	);

	await page.route('**/api/auth/login', route =>
		loginFails
			? route.fulfill({ status: 401, json: { message: 'Invalid credentials' } })
			: route.fulfill({ json: { user: USER } })
	);

	await page.route('**/api/auth/logout', route => route.fulfill({ json: {} }));

	return { csrfServed };
}

test.describe('Autenticación', () => {
	test('una ruta protegida redirige al login conservando el destino', async ({
		page,
	}) => {
		await mockAuthApi(page);

		await page.goto('/dashboard');

		await expect(page).toHaveURL(/\/auth\/login\?returnUrl=%2Fdashboard/);
	});

	test('el formulario vacío muestra los errores de validación', async ({
		page,
	}) => {
		await mockAuthApi(page);
		await page.goto('/auth/login');

		await page.getByRole('button', { name: /sign in|entrar/i }).click();

		await expect(page.locator('p.text-error')).toHaveCount(2);
	});

	test('un correo mal formado se rechaza antes de llamar a la API', async ({
		page,
	}) => {
		await mockAuthApi(page);
		let loginCalled = false;
		page.on('request', request => {
			// `/api/`, no `/auth/login` a secas: la propia navegación a la página
			// de login contiene esa cadena en su URL.
			if (request.url().includes('/api/auth/login')) loginCalled = true;
		});

		await page.goto('/auth/login');
		await page.locator('#email').fill('no-es-un-correo');
		await page.locator('#password').fill('secret123');
		await page.getByRole('button', { name: /sign in|entrar/i }).click();

		await expect(page.locator('p.text-error')).toHaveCount(1);
		expect(loginCalled).toBe(false);
	});

	test('un login válido lleva al dashboard y muestra al usuario', async ({
		page,
	}) => {
		await mockAuthApi(page);
		await page.goto('/auth/login');

		await page.locator('#email').fill(USER.email);
		await page.locator('#password').fill('secret123');
		await page.getByRole('button', { name: /sign in|entrar/i }).click();

		await expect(page).toHaveURL(/\/dashboard/);
		await expect(page.getByText(USER.name).first()).toBeVisible();
	});

	test('el login respeta el returnUrl que puso el guard', async ({ page }) => {
		await mockAuthApi(page);
		await page.goto('/auth/login?returnUrl=%2Fdashboard');

		await page.locator('#email').fill(USER.email);
		await page.locator('#password').fill('secret123');
		await page.getByRole('button', { name: /sign in|entrar/i }).click();

		await expect(page).toHaveURL(/\/dashboard/);
	});

	test('un login rechazado deja al usuario en la pantalla con un error', async ({
		page,
	}) => {
		await mockAuthApi(page, { loginFails: true });
		await page.goto('/auth/login');

		await page.locator('#email').fill(USER.email);
		await page.locator('#password').fill('contraseña-incorrecta');
		await page.getByRole('button', { name: /sign in|entrar/i }).click();

		await expect(page.locator('[role="alert"]')).toBeVisible();
		await expect(page).toHaveURL(/\/auth\/login/);
	});

	test('con sesión activa el dashboard es accesible y el logout devuelve al login', async ({
		page,
	}) => {
		await mockAuthApi(page, { session: USER });

		await page.goto('/dashboard');
		await expect(page.getByText(USER.email).first()).toBeVisible();

		await page.getByRole('button', { name: /sign out|cerrar sesión/i }).click();

		await expect(page).toHaveURL(/\/auth\/login/);
	});

	// Este test estuvo en `fixme` mientras el fallo que destapó seguía sin
	// aislar, y fue el que lo encontró: el store perdía el token porque
	// `checkAuth` reseteaba con `...initialState` y el 401 normal de un anónimo
	// borraba lo que `/auth/csrf` acababa de traer. El caso vive aquí y no solo
	// en `auth.interceptor.spec.ts` precisamente por eso: en el unitario la
	// cabecera se comprueba con el token ya puesto a mano, así que el bug estaba
	// en la costura entre las dos peticiones del arranque, no en el interceptor.
	test('el interceptor adjunta el token CSRF en las mutaciones', async ({
		page,
	}) => {
		const { csrfServed } = await mockAuthApi(page);

		// Se filtra por método: la cabecera `X-CSRF-Token` es no estándar y la
		// petición va a otro origen, así que el navegador manda antes un
		// preflight `OPTIONS` que, por definición, no la lleva.
		const loginRequest = page.waitForRequest(
			request =>
				request.url().includes('/api/auth/login') && request.method() === 'POST'
		);

		await page.goto('/auth/login');
		// El store pide el token al arrancar la aplicación; sin esperarlo, el
		// formulario podría enviarse antes de que la cabecera esté disponible.
		await csrfServed;
		// `csrfServed` se resuelve cuando la respuesta sale hacia el navegador,
		// no cuando el store la ha procesado. Una persona tarda segundos en
		// escribir sus credenciales; el test, milisegundos.
		await expect
			.poll(() => page.evaluate(() => document.readyState))
			.toBe('complete');
		await page.waitForTimeout(150);
		await page.locator('#email').fill(USER.email);
		await page.locator('#password').fill('secret123');
		await page.getByRole('button', { name: /sign in|entrar/i }).click();

		const request = await loginRequest;
		expect(request.headers()['x-csrf-token']).toBe('csrf-de-prueba');
	});
});
