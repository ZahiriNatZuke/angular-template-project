/**
 * Enlaces externos del proyecto, compartidos entre el shell y las features.
 * Se centralizan aquí para no duplicarlos en cada componente.
 */
export const APP_LINKS = {
	repo: 'https://github.com/ZahiriNatZuke/angular-template-project',
	docs: 'https://github.com/ZahiriNatZuke/angular-template-project#readme',
	author: 'https://github.com/ZahiriNatZuke',
	changelog:
		'https://github.com/ZahiriNatZuke/angular-template-project/blob/main/CHANGELOG.md',
} as const;

/**
 * Página del release correspondiente a una versión.
 *
 * La versión que muestra el pie sale del `package.json`, así que el enlace apunta
 * siempre a las notas de lo que está corriendo, sin nada que actualizar a mano.
 */
export const releaseUrl = (version: string) =>
	`${APP_LINKS.repo}/releases/tag/v${version}`;
