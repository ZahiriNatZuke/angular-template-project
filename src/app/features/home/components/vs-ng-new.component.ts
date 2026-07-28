import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideMinus } from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Qué añade este template sobre un `ng new` recién salido del CLI.
 *
 * Responde a la única pregunta que importa cuando alguien mira un template:
 * «¿por qué no empiezo de cero?». Cada fila es un sufijo de clave i18n bajo
 * `home.vsNew.rows.*`, con `aspect`, `cli` y `template`.
 */
@Component({
	selector: 'app-vs-ng-new',
	templateUrl: './vs-ng-new.component.html',
	imports: [TranslatePipe, LucideCheck, LucideMinus],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VsNgNewComponent {
	rows = signal([
		'state',
		'auth',
		'i18n',
		'theming',
		'seo',
		'testing',
		'ci',
		'a11y',
	] as const);
}
