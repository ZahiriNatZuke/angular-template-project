import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AngularLogoComponent } from '@core/components/angular-logo.component';
import { APP_LINKS } from '@core/utils/app-links';
import {
	LucideCheck,
	LucideCopy,
	LucideDynamicIcon,
	LucideFlaskConical,
	LucideGlobe,
	type LucideIcon,
	LucidePalette,
	LucideRadioTower,
	LucideShieldCheck,
	LucideX,
	LucideZap,
} from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';

/** Una tarjeta de la parrilla de características. */
interface Feature {
	/** Sufijo de la clave i18n bajo `home.features.*`. */
	key: string;
	icon: LucideIcon;
}

/** Un grupo del bloque de stack tecnológico. */
interface StackGroup {
	/** Sufijo de la clave i18n bajo `home.stack.groups.*`. */
	key: string;
	items: string[];
}

@Component({
	selector: 'app-home-page',
	templateUrl: './home.page.html',
	imports: [
		TranslatePipe,
		AngularLogoComponent,
		// Renderiza los iconos de la parrilla a partir de los datos; los iconos
		// fijos usan su propio componente para no pasar por la resolución dinámica.
		LucideDynamicIcon,
		LucideCopy,
		LucideCheck,
		LucideX,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
	repoUrl = signal(APP_LINKS.repo);
	docsUrl = signal(APP_LINKS.docs);

	/** Comando que copia el botón del hero. */
	installCommand = signal(
		'npx degit ZahiriNatZuke/angular-template-project my-app'
	);

	/** Se pone a `true` un instante tras copiar, para dar feedback visual. */
	copied = signal(false);

	features = signal<Feature[]>([
		{ key: 'angular', icon: LucideZap },
		{ key: 'auth', icon: LucideShieldCheck },
		{ key: 'state', icon: LucideRadioTower },
		{ key: 'styling', icon: LucidePalette },
		{ key: 'i18n', icon: LucideGlobe },
		{ key: 'testing', icon: LucideFlaskConical },
	]);

	stackGroups = signal<StackGroup[]>([
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
			items: ['Vitest', 'Biome', 'pnpm', 'Husky'],
		},
	]);

	/** Fragmento que se muestra en la sección de estado. */
	storeSnippet = signal(`export const CounterStore = signalStore(
  { providedIn: 'root' },
  withState({ count: 0 }),

  withComputed(store => ({
    double: computed(() => store.count() * 2),
  })),

  withMethods(store => ({
    increment() {
      patchState(store, { count: store.count() + 1 });
    },
  }))
);`);

	/** Filas de la comparación entre almacenar el token en JS o en cookie. */
	authComparison = signal([
		'storage',
		'xss',
		'csrf',
		'refresh',
		'setup',
	] as const);

	async copyInstallCommand(): Promise<void> {
		try {
			await navigator.clipboard.writeText(this.installCommand());
			this.copied.set(true);
			setTimeout(() => this.copied.set(false), 2000);
		} catch {
			// El portapapeles requiere contexto seguro y permiso del usuario; si
			// falla, el comando sigue visible y se puede seleccionar a mano.
		}
	}
}
