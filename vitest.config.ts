import { fileURLToPath } from 'node:url';
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vitest/config';

const resolvePath = (path: string) =>
	fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
	plugins: [angular()],
	resolve: {
		// Vite no lee los `paths` de tsconfig.json, así que los alias del proyecto
		// deben replicarse aquí o cualquier spec que los use no compila.
		alias: {
			'@app': resolvePath('./src/app'),
			'@core': resolvePath('./src/app/core'),
			'@environments': resolvePath('./src/environments'),
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['src/setup-vitest.ts'],
		include: ['src/**/*.spec.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'src/setup-vitest.ts',
				'**/*.spec.ts',
				'**/*.config.ts',
				'**/environments/**',
			],
			// Los umbrales miden solo los ficheros que los tests importan, no todo
			// `src/`. Sirven para impedir que la cobertura de lo ya cubierto se
			// degrade, no para afirmar que el proyecto entero está cubierto.
			//
			// Las ramas van más bajas a propósito: buena parte de las no cubiertas
			// son caminos de SSR (`isPlatformBrowser` en falso), inalcanzables
			// bajo jsdom.
			thresholds: {
				lines: 90,
				functions: 90,
				statements: 90,
				branches: 70,
			},
		},
	},
	define: {
		'import.meta.vitest': false,
	},
});
