import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideX } from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Comparativa entre guardar el token en `localStorage` y en una cookie HttpOnly.
 *
 * Vive en su propio componente para que `@defer` pueda sacarlo del bundle
 * inicial: un bloque diferido solo produce un chunk aparte con las dependencias
 * que **nadie más** usa, y aquí eso incluye el icono `LucideX`, que no aparece en
 * ninguna otra parte de la landing.
 */
@Component({
	selector: 'app-auth-comparison',
	templateUrl: './auth-comparison.component.html',
	imports: [TranslatePipe, LucideX, LucideCheck],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComparisonComponent {
	/** Filas de la comparación; cada valor es un sufijo de `home.auth.rows.*`. */
	rows = signal(['storage', 'xss', 'csrf', 'refresh', 'setup'] as const);
}
