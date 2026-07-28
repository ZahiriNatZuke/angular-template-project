import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AuthComparisonComponent } from '@app/features/home/components/auth-comparison.component';
import { ProvenFixesComponent } from '@app/features/home/components/proven-fixes.component';
import { TechStackComponent } from '@app/features/home/components/tech-stack.component';
import { VsNgNewComponent } from '@app/features/home/components/vs-ng-new.component';
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
	LucideZap,
} from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';

/** Una tarjeta de la parrilla de características. */
interface Feature {
	/** Sufijo de la clave i18n bajo `home.features.*`. */
	key: string;
	icon: LucideIcon;
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
		// Se usan solo dentro de bloques `@defer`, así que el compilador los saca
		// del bundle inicial y les genera un chunk aparte.
		AuthComparisonComponent,
		VsNgNewComponent,
		ProvenFixesComponent,
		TechStackComponent,
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
