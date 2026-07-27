import { defineConfig, devices } from '@playwright/test';

const PORT = 4200;
const BASE_URL = `http://localhost:${PORT}`;

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

	webServer: {
		command: `pnpm start --port ${PORT}`,
		url: BASE_URL,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
