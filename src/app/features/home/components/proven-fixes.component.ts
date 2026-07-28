import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideBug, LucideCheck } from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Los fallos que este template tuvo y ya no tiene.
 *
 * Es la sección más honesta de la landing y la que mejor argumenta su valor: no
 * promete calidad, enseña los errores concretos que alguien ya cometió aquí, con
 * su causa, para que quien clone el repositorio no vuelva a pagarlos. Todos son
 * reales y están en el CHANGELOG.
 *
 * Cada entrada es un sufijo de clave i18n bajo `home.proven.cases.*`, con
 * `symptom` y `cause`.
 */
@Component({
	selector: 'app-proven-fixes',
	templateUrl: './proven-fixes.component.html',
	imports: [TranslatePipe, LucideBug, LucideCheck],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProvenFixesComponent {
	cases = signal(['csrf', 'startup', 'guards', 'router', 'theme'] as const);
}
