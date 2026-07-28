import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
	dependencies,
	devDependencies,
	packageManager,
} from '../../../../../package.json';

/** Una herramienta del stack, con su documentación y su versión real. */
interface StackItem {
	name: string;
	/** Documentación oficial. Se abre en otra pestaña. */
	docs: string;
	/**
	 * Versión instalada, tomada del `package.json`. Ausente en lo que no es un
	 * paquete: las signals vienen dentro de Angular.
	 */
	version?: string;
}

/** Un grupo del bloque de stack tecnológico. */
interface StackGroup {
	/** Sufijo de la clave i18n bajo `home.stack.groups.*`. */
	key: string;
	items: StackItem[];
}

/**
 * Quita el rango de un semver (`^22.0.8` → `22.0.8`) para mostrarlo limpio.
 *
 * Las versiones se leen del `package.json` en lugar de escribirse a mano: esta
 * misma landing anunciaba «42 tests» mucho después de que fueran otros, y una
 * versión desactualizada en la página de un template es peor que no ponerla.
 */
const exact = (range: string) => range.replace(/^[^\d]+/, '');

/**
 * Listado del stack, al final de la landing. Componente propio para poder
 * diferirlo con `@defer`: es lo último que ve quien llega, y no hay razón para
 * que su plantilla forme parte del bundle inicial.
 */
@Component({
	selector: 'app-tech-stack',
	templateUrl: './tech-stack.component.html',
	imports: [TranslatePipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechStackComponent {
	groups = signal<StackGroup[]>([
		{
			key: 'framework',
			items: [
				{
					name: 'Angular',
					docs: 'https://angular.dev',
					version: exact(dependencies['@angular/core']),
				},
				{
					name: 'TypeScript',
					docs: 'https://www.typescriptlang.org/docs/',
					version: exact(devDependencies.typescript),
				},
				{
					name: 'RxJS',
					docs: 'https://rxjs.dev',
					version: exact(dependencies.rxjs),
				},
			],
		},
		{
			key: 'state',
			items: [
				{
					name: 'NgRx SignalStore',
					docs: 'https://ngrx.io/guide/signals',
					version: exact(dependencies['@ngrx/signals']),
				},
				{
					name: 'Angular Signals',
					docs: 'https://angular.dev/guide/signals',
				},
				{
					name: 'ngx-translate',
					docs: 'https://ngx-translate.org',
					version: exact(dependencies['@ngx-translate/core']),
				},
			],
		},
		{
			key: 'styling',
			items: [
				{
					name: 'TailwindCSS',
					docs: 'https://tailwindcss.com/docs',
					version: exact(dependencies.tailwindcss),
				},
				{
					name: 'daisyUI',
					docs: 'https://daisyui.com/docs/install/',
					version: exact(devDependencies.daisyui),
				},
				{
					name: 'Lucide',
					docs: 'https://lucide.dev/guide/packages/lucide-angular',
					version: exact(dependencies['@lucide/angular']),
				},
			],
		},
		{
			key: 'tooling',
			items: [
				{
					name: 'Vitest',
					docs: 'https://vitest.dev',
					version: exact(devDependencies.vitest),
				},
				{
					name: 'Playwright',
					docs: 'https://playwright.dev',
					version: exact(devDependencies['@playwright/test']),
				},
				{
					name: 'Biome',
					docs: 'https://biomejs.dev',
					version: exact(devDependencies['@biomejs/biome']),
				},
				{
					name: 'pnpm',
					docs: 'https://pnpm.io',
					// `packageManager` viene como `pnpm@10.33.0`.
					version: packageManager.split('@').pop(),
				},
			],
		},
	]);
}
