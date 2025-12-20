import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
	plugins: [angular()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['src/setup-vitest.ts'],
		include: ['**/*.spec.ts'],
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
