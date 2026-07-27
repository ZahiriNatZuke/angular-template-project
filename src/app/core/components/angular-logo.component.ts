import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Contador determinista para los `id` de gradiente. `Math.random()` serviría,
 * pero rompería la hidratación en SSR al no coincidir servidor y cliente.
 */
let instanceCount = 0;

/**
 * Logo de Angular como SVG en línea.
 *
 * El escudo usa el gradiente de marca y la «A» se recorta con `fill-rule`, de
 * modo que el hueco deja ver el fondo en lugar de pintarse de un color fijo.
 */
@Component({
	selector: 'app-angular-logo',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 250 250"
			[attr.width]="size()"
			[attr.height]="size()"
			role="img"
			[attr.aria-label]="label()"
		>
			<defs>
				<linearGradient [attr.id]="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="currentColor" stop-opacity="1" />
					<stop offset="100%" stop-color="currentColor" stop-opacity="0.65" />
				</linearGradient>
			</defs>

			<!-- Escudo con la «A» recortada -->
			<path
				[attr.fill]="'url(#' + gradientId + ')'"
				fill-rule="evenodd"
				d="M125 12.5 231.25 50.3l-16.2 140.5L125 237.5 34.95 190.8 18.75 50.3 125 12.5Zm0 33.6L60.4 191.9h24.1l12.98-32.4h55.04l12.98 32.4h24.1L125 46.1Zm0 47.6 18.9 45.5h-37.8L125 93.7Z"
			/>
		</svg>
	`,
})
export class AngularLogoComponent {
	/** Lado del SVG en píxeles. */
	size = input(48);

	/** Texto accesible; el logo es decorativo salvo que se indique lo contrario. */
	label = input('Angular');

	/**
	 * Los `id` de SVG son globales al documento: si el logo se renderiza dos
	 * veces, un id fijo haría que ambos compartieran el mismo gradiente.
	 */
	protected readonly gradientId = `angular-logo-${++instanceCount}`;
}
