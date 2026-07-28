import { defineConfig, devices } from '@playwright/test';

const PORT = 4200;
const BASE_URL = `http://localhost:${PORT}`;

/** Debe coincidir con `apiUrl` de `src/environments/environment.ts`. */
const MOCK_URL = 'http://localhost:3000';

export default defineConfig({
	testDir: './e2e',
	// Los specs de Vitest viven en `src/`; separar los directorios evita que
	// cada runner intente ejecutar los del otro.
	testMatch: '**/*.e2e.spec.ts',

	fullyParallel: true,
	// Un `.only` olvidado hace pasar el resto en silencio, así que en CI falla.
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',

	use: {
		baseURL: BASE_URL,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'mobile',
			use: { ...devices['Pixel 7'] },
		},
	],

	// Dos servidores: la aplicación y el backend de mentira de `mock-server/`, que
	// es contra el que corre `auth-live.e2e.spec.ts`. Sin él, lo que distingue a
	// esta plantilla —cookie HttpOnly, sesión que sobrevive a una recarga, CSRF
	// validado por el servidor— no se podría comprobar en un navegador.
	webServer: [
		{
			command: `pnpm start --port ${PORT}`,
			url: BASE_URL,
			reuseExistingServer: !process.env.CI,
			timeout: 180_000,
		},
		{
			command: 'pnpm mock',
			url: `${MOCK_URL}/api/auth/csrf`,
			reuseExistingServer: !process.env.CI,
			timeout: 30_000,
		},
	],
});
