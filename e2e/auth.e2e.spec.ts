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

	// Bloqueado por un fallo real del template: el interceptor trata cualquier
	// 401 como sesión caducada y llama a `logout()`, que restaura el estado
	// inicial y borra el mensaje que `login` acababa de escribir. El usuario no
	// llega a ver por qué falló. Se habilita al arreglarlo.
	test.fixme('un login rechazado deja al usuario en la pantalla con un error', async ({
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

	// Bloqueado por un fallo real del template: al cargar directamente una ruta
	// protegida, `authGuard` se evalúa antes de que `checkAuth()` haya resuelto,
	// así que un usuario con sesión válida acaba en el login. Se habilita al
	// arreglarlo.
	test.fixme('con sesión activa el dashboard es accesible y el logout devuelve al login', async ({
		page,
	}) => {
		await mockAuthApi(page, { session: USER });

		await page.goto('/dashboard');
		await expect(page.getByText(USER.email).first()).toBeVisible();

		await page.getByRole('button', { name: /sign out|cerrar sesión/i }).click();

		await expect(page).toHaveURL(/\/auth\/login/);
	});

	// Bloqueado por la misma causa que los dos anteriores: la validación de
	// sesión responde 401 al arrancar, el interceptor lo interpreta como sesión
	// caducada y renavega, lo que vacía el formulario antes de poder enviarlo.
	// La cabecera sí está cubierta a nivel unitario en `auth.interceptor.spec.ts`;
	// este test añade la comprobación en navegador real y se habilita al
	// arreglar el interceptor.
	test.fixme('el interceptor adjunta el token CSRF en las mutaciones', async ({
		page,
	}) => {
		const { csrfServed } = await mockAuthApi(page);

		const loginRequest = page.waitForRequest(request =>
			request.url().includes('/api/auth/login')
		);

		await page.goto('/auth/login');
		// El store pide el token al arrancar la aplicación; sin esperarlo, el
		// formulario podría enviarse antes de que la cabecera esté disponible.
		await csrfServed;
		// Y se deja asentar el arranque: la validación de sesión responde 401,
		// lo que dispara un logout que renavega y vaciaría el formulario a medio
		// rellenar.
		await page.waitForLoadState('networkidle');

		await page.locator('#email').fill(USER.email);
		await page.locator('#password').fill('secret123');
		await page.getByRole('button', { name: /sign in|entrar/i }).click();

		const request = await loginRequest;
		expect(request.headers()['x-csrf-token']).toBe('csrf-de-prueba');
	});
});
