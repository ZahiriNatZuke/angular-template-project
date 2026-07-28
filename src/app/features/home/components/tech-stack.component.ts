import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/** Un grupo del bloque de stack tecnológico. */
interface StackGroup {
	/** Sufijo de la clave i18n bajo `home.stack.groups.*`. */
	key: string;
	items: string[];
}

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
			items: ['Angular 22', 'TypeScript 6', 'RxJS'],
		},
		{
			key: 'state',
			items: ['NgRx SignalStore', 'Signals', 'ngx-translate'],
		},
		{
			key: 'styling',
			items: ['TailwindCSS v4', 'DaisyUI', 'Lucide'],
		},
		{
			key: 'tooling',
			items: ['Vitest', 'Playwright', 'Biome', 'pnpm'],
		},
	]);
}
