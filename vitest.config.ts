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
		},
	},
	define: {
		'import.meta.vitest': false,
	},
});
